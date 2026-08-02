import { NextRequest, NextResponse } from 'next/server';
import { createPravaSession } from '../../../../adapters/prava/createSession';
import { recordDoubleEntryLedger } from '../../../../infrastructure/database/supabaseClient';
import { toCents } from '../../../../domain/budget/centsMath';
import { normalizeUnicodeInput } from '../../../../infrastructure/security/hmacValidator';
import { extractSessionFromHeaders } from '../../../../infrastructure/auth/authMiddleware';
import { hasPermission } from '../../../../domain/auth/rbac';

export async function POST(req: NextRequest) {
  try {
    const session = await extractSessionFromHeaders(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!hasPermission(session.role, 'approve_request')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { totalAmount, merchantName, merchantUrl, items } = body;

    if (!totalAmount || !merchantName || !merchantUrl) {
      return NextResponse.json(
        { error: 'Missing required parameters: totalAmount, merchantName, merchantUrl' },
        { status: 400 }
      );
    }

    // 1. Sanitize & Normalize Inputs
    const cleanMerchantName = normalizeUnicodeInput(merchantName);
    const merchant = new URL(merchantUrl);
    if (merchant.protocol !== 'https:') {
      return NextResponse.json({ error: 'merchantUrl must use HTTPS' }, { status: 400 });
    }

    // 2. Safe Arbitrary-Precision Cent Conversion
    const amountCents = toCents(totalAmount);
    if (amountCents <= 0n) {
      return NextResponse.json(
        { error: 'Invalid totalAmount. Must be greater than zero.' },
        { status: 400 }
      );
    }

    // 3. Invoke Prava Create Session Adapter
    const pravaSession = await createPravaSession({
      user_id: session.userId,
      user_email: session.email,
      total_amount: totalAmount.toString(),
      currency: 'USD',
      purchase_context: [
        {
          merchant_details: {
            name: cleanMerchantName,
            url: merchant.toString(),
            country_code_iso2: 'US',
          },
          product_details: items || [
            {
              description: `${cleanMerchantName} Service Fee`,
              unit_price: totalAmount.toString(),
              quantity: 1,
            },
          ],
        },
      ],
      integration_type: 'full_checkout',
      callback_url: `${req.nextUrl.origin}/api/webhook/prava`,
    });

    // 4. Record INITIATED transaction in Supabase Double-Entry Ledger
    await recordDoubleEntryLedger({
      transactionId: pravaSession.order_id,
      accountId: `acc_${session.userId}`,
      amountCents: amountCents,
      merchantName: cleanMerchantName,
      status: 'INITIATED',
    });

    return NextResponse.json({
      status: 'success',
      sessionId: pravaSession.session_id,
      checkoutUrl: pravaSession.iframe_url,
      totalAmount: totalAmount,
      currency: 'USD',
      createdAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

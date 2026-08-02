import { NextRequest, NextResponse } from 'next/server';
import { createPravaSession } from '../../../../adapters/prava/createSession';
import { recordDoubleEntryLedger } from '../../../../infrastructure/database/supabaseClient';
import { toCents } from '../../../../domain/budget/centsMath';
import { normalizeUnicodeInput } from '../../../../infrastructure/security/hmacValidator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userEmail, totalAmount, merchantName, merchantUrl, items } = body;

    if (!userId || !userEmail || !totalAmount || !merchantName) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId, userEmail, totalAmount, merchantName' },
        { status: 400 }
      );
    }

    // 1. Sanitize & Normalize Inputs
    const cleanMerchantName = normalizeUnicodeInput(merchantName);
    const cleanUserEmail = userEmail.trim().toLowerCase();

    // 2. Safe Arbitrary-Precision Cent Conversion
    const amountCents = toCents(totalAmount);
    if (amountCents <= 0n) {
      return NextResponse.json(
        { error: 'Invalid totalAmount. Must be greater than zero.' },
        { status: 400 }
      );
    }

    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 3. Invoke Prava Create Session Adapter
    const pravaSession = await createPravaSession({
      user_id: userId,
      user_email: cleanUserEmail,
      total_amount: totalAmount.toString(),
      currency: 'USD',
      purchase_context: [
        {
          merchant_details: {
            name: cleanMerchantName,
            url: merchantUrl || 'https://vapor.app',
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
      transactionId: sessionId,
      accountId: `acc_${userId}`,
      amountCents: amountCents,
      merchantName: cleanMerchantName,
      status: 'INITIATED',
    });

    return NextResponse.json({
      status: 'success',
      sessionId: pravaSession.id || sessionId,
      checkoutUrl: pravaSession.checkout_url,
      clientSecret: pravaSession.client_secret,
      totalAmount: totalAmount,
      currency: 'USD',
      createdAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

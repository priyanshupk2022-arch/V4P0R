import { NextRequest, NextResponse } from 'next/server';
import { createPravaSession } from '../../../../adapters/prava/createSession';
import { recordDoubleEntryLedger } from '../../../../infrastructure/database/supabaseClient';
import { toCents } from '../../../../domain/budget/centsMath';

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

    const amountNum = parseFloat(totalAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { error: 'Invalid totalAmount. Must be a positive number.' },
        { status: 400 }
      );
    }

    const amountCents = toCents(amountNum);
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Invoke Prava Create Session Adapter
    const pravaSession = await createPravaSession({
      user_id: userId,
      user_email: userEmail,
      total_amount: totalAmount.toString(),
      currency: 'USD',
      purchase_context: [
        {
          merchant_details: {
            name: merchantName,
            url: merchantUrl || 'https://vapor.app',
            country_code_iso2: 'US',
          },
          product_details: items || [
            {
              description: `${merchantName} Service Fee`,
              unit_price: totalAmount.toString(),
              quantity: 1,
            },
          ],
        },
      ],
      integration_type: 'full_checkout',
      callback_url: `${req.nextUrl.origin}/api/webhook/prava`,
    });

    // 2. Record INITIATED transaction in Supabase Double-Entry Ledger
    await recordDoubleEntryLedger({
      transactionId: sessionId,
      accountId: `acc_${userId}`,
      amountCents: amountCents,
      merchantName: merchantName,
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

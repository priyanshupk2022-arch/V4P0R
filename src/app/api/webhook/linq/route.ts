import { NextRequest, NextResponse } from 'next/server';
import { verifyHmacSignature } from '../../../../infrastructure/security/hmacValidator';
import { lockVirtualCard } from '../../../../adapters/prava/lockCard';
import { recordDoubleEntryLedger } from '../../../../infrastructure/database/supabaseClient';
import { transitionState } from '../../../../domain/transaction/stateMachine';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-linq-signature') || req.headers.get('x-signature') || '';
    const linqSecret = process.env.LINQ_API_KEY || 'sk_linq_test_secret_key';

    // Verify HMAC signature if provided
    if (signature && !verifyHmacSignature(rawBody, signature, linqSecret)) {
      return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { action, transaction_id, card_id, user_id, amount_cents } = payload;

    if (!action || !card_id) {
      return NextResponse.json({ error: 'Missing required parameters: action, card_id' }, { status: 400 });
    }

    const isApproved = action === 'APPROVE' || action === 'CONFIRM';
    const txId = transaction_id || `tx_linq_${Date.now()}`;
    const nextState = isApproved ? transitionState('INITIATED', 'AUTHORIZE') : transitionState('INITIATED', 'DECLINE');

    if (!isApproved) {
      // 1. Instantly freeze the card via Prava lockCard API
      await lockVirtualCard(card_id);
    }

    // 2. Record updated state in Supabase Double-Entry Ledger
    await recordDoubleEntryLedger({
      transactionId: txId,
      accountId: `acc_${user_id || 'cfo_manager'}`,
      cardId: card_id,
      amountCents: amount_cents ? BigInt(amount_cents) : 0n,
      merchantName: 'Linq iMessage Decision',
      status: nextState,
    });

    // 3. Send non-blocking audit event to Go Streamer (:8081)
    fetch('http://localhost:8081/stream/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'LINQ_IMESSAGE_DECISION',
        action: action,
        card_id: card_id,
        next_state: nextState,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => null);

    return NextResponse.json({
      status: 'success',
      actionExecuted: action,
      cardId: card_id,
      nextTransactionState: nextState,
      cardStatus: isApproved ? 'ACTIVE' : 'LOCKED',
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

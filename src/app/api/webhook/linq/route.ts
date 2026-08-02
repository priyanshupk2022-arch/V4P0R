import { NextRequest, NextResponse } from 'next/server';
import { verifyHmacSignature, verifyTimestampTolerance } from '../../../../infrastructure/security/hmacValidator';
import { lockVirtualCard } from '../../../../adapters/prava/lockCard';
import { recordDoubleEntryLedger } from '../../../../infrastructure/database/supabaseClient';
import { transitionState } from '../../../../domain/transaction/stateMachine';
import { toCents } from '../../../../domain/budget/centsMath';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-linq-signature') || req.headers.get('x-signature') || '';
    const timestampHeader = req.headers.get('x-linq-timestamp') || req.headers.get('x-timestamp');
    const linqSecret = process.env.LINQ_API_KEY || 'sk_linq_test_secret_key';

    // 1. Verify Timestamp Freshness (Prevent Replay Attacks)
    if (timestampHeader && !verifyTimestampTolerance(timestampHeader)) {
      return NextResponse.json(
        { error: 'Expired or invalid timestamp header. Replay attack rejected.' },
        { status: 400 }
      );
    }

    // 2. Verify HMAC Signature if provided
    if (signature && !verifyHmacSignature(rawBody, signature, linqSecret)) {
      return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { action, transaction_id, card_id, user_id, amount_cents, amount } = payload;

    if (!action || !card_id) {
      return NextResponse.json({ error: 'Missing required parameters: action, card_id' }, { status: 400 });
    }

    const isApproved = action === 'APPROVE' || action === 'CONFIRM';
    const txId = transaction_id || `tx_linq_${Date.now()}`;
    const nextState = isApproved ? transitionState('INITIATED', 'AUTHORIZE') : transitionState('INITIATED', 'DECLINE');

    if (!isApproved) {
      // 3. Instantly freeze the card via Prava lockCard API
      await lockVirtualCard(card_id);
    }

    // Compute integer cents amount safely
    let parsedAmountCents = 0n;
    if (amount_cents !== undefined && amount_cents !== null) {
      parsedAmountCents = toCents(amount_cents);
    } else if (amount !== undefined && amount !== null) {
      parsedAmountCents = toCents(amount);
    }

    // 4. Record updated state in Supabase Double-Entry Ledger
    await recordDoubleEntryLedger({
      transactionId: txId,
      accountId: `acc_${user_id || 'cfo_manager'}`,
      cardId: card_id,
      amountCents: parsedAmountCents,
      merchantName: 'Linq iMessage Decision',
      status: nextState,
    });

    // 5. Send non-blocking audit event to Go Streamer (:8081)
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

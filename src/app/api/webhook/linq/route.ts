import { NextRequest, NextResponse } from 'next/server';
import { verifyHmacSignature, verifyStandardWebhookSignature, verifyTimestampTolerance } from '../../../../infrastructure/security/hmacValidator';
import { lockVirtualCard } from '../../../../adapters/prava/lockCard';
import { recordDoubleEntryLedger } from '../../../../infrastructure/database/supabaseClient';
import { transitionState } from '../../../../domain/transaction/stateMachine';
import { toCents } from '../../../../domain/budget/centsMath';

// In-memory replay prevention store for webhook-id
const processedWebhookIds = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    const webhookId = req.headers.get('webhook-id');
    const signature = req.headers.get('webhook-signature');
    const timestampHeader = req.headers.get('webhook-timestamp');
    const linqSecret = process.env.LINQ_WEBHOOK_SECRET;
    if (!webhookId || !signature || !timestampHeader || !linqSecret) {
      return NextResponse.json({ error: 'Missing required signed webhook fields' }, { status: 401 });
    }

    // 1. Verify Timestamp Freshness
    if (!verifyTimestampTolerance(timestampHeader)) {
      return NextResponse.json(
        { error: 'Expired or invalid timestamp header. Replay attack rejected.' },
        { status: 400 }
      );
    }

    // 2. Verify HMAC Signature (Standard Webhooks format & raw HMAC)
    if (!verifyStandardWebhookSignature(rawBody, webhookId, timestampHeader, signature, linqSecret)) {
      return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
    }


    // 3. Replay attack check occurs only after authenticity verification.
    if (processedWebhookIds.has(webhookId)) {
      return NextResponse.json(
        { status: 'ignored', message: 'Duplicate webhook-id rejected.' },
        { status: 200 }
      );
    }
    processedWebhookIds.add(webhookId);
    if (processedWebhookIds.size > 10000) {
      const first = processedWebhookIds.values().next().value;
      if (first) processedWebhookIds.delete(first);
    }

    const payload = JSON.parse(rawBody);

    // Support Linq reaction events and standard webhook payloads
    let rawAction = payload.action || payload.reaction || payload.event_type || '';
    if (typeof rawAction === 'string') {
      rawAction = rawAction.toUpperCase();
    }

    const cardId = payload.card_id || payload.cardId || payload.data?.card_id;
    const userId = payload.user_id || payload.userId;
    const transactionId = payload.transaction_id || payload.transactionId;
    if (!cardId || !userId || !transactionId) {
      return NextResponse.json({ error: 'Webhook is missing correlated approval identifiers' }, { status: 400 });
    }

    // Map Tapback reaction / action semantics:
    // like / thumbsup / approve / confirm -> APPROVE
    // dislike / thumbsdown / reject / decline -> REJECT
    let isApproved = false;
    if (['APPROVE', 'CONFIRM', 'LIKE', 'THUMBSUP', 'REACTION.ADDED:LIKE'].includes(rawAction)) {
      isApproved = true;
    } else if (['REJECT', 'DECLINE', 'DISLIKE', 'THUMBSDOWN', 'REACTION.ADDED:DISLIKE'].includes(rawAction)) {
      isApproved = false;
    } else {
      return NextResponse.json({ error: 'Unsupported Linq reaction' }, { status: 400 });
    }

    const nextState = isApproved ? transitionState('INITIATED', 'AUTHORIZE') : transitionState('INITIATED', 'DECLINE');

    if (!isApproved) {
      // Instantly freeze card via Prava lockCard API
      await lockVirtualCard(cardId).catch(() => null);
    }

    // Compute integer cents amount safely
    let parsedAmountCents = 0n;
    if (payload.amount_cents !== undefined) {
      parsedAmountCents = toCents(payload.amount_cents);
    } else if (payload.amount !== undefined) {
      parsedAmountCents = toCents(payload.amount);
    } else return NextResponse.json({ error: 'Webhook is missing amount' }, { status: 400 });

    // Record updated state in Supabase Double-Entry Ledger
    await recordDoubleEntryLedger({
      transactionId,
      accountId: `acc_${userId}`,
      cardId,
      amountCents: parsedAmountCents,
      merchantName: 'Linq iMessage Decision',
      status: nextState,
    });

    return NextResponse.json({
      status: 'success',
      actionExecuted: isApproved ? 'APPROVE' : 'REJECT',
      rawAction,
      cardId,
      nextTransactionState: nextState,
      cardStatus: isApproved ? 'ACTIVE' : 'LOCKED',
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

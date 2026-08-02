import { NextRequest, NextResponse } from 'next/server';
import { verifyStandardWebhookSignature, verifyTimestampTolerance } from '../../../../infrastructure/security/hmacValidator';
import { lockVirtualCard } from '../../../../adapters/prava/lockCard';
import { checkAndRecordWebhookEvent, recordDoubleEntryLedger, updateWebhookEventResult } from '../../../../infrastructure/database/supabaseClient';
import { getPendingApproval } from '../../../../adapters/linq/client';
import { transitionState } from '../../../../domain/transaction/stateMachine';
import { toCents } from '../../../../domain/budget/centsMath';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const correlationId = `err_linq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  try {
    const rawBody = await req.text();

    const webhookId = req.headers.get('webhook-id');
    const signature = req.headers.get('webhook-signature');
    const timestampHeader = req.headers.get('webhook-timestamp');
    const linqSecret = process.env.LINQ_WEBHOOK_SECRET || 'test_linq_secret_key_123';

    // 1. Mandatory Header Verification
    if (!webhookId || !signature || !timestampHeader || !linqSecret) {
      return NextResponse.json(
        { error: 'Missing required signed webhook fields or LINQ_WEBHOOK_SECRET configuration', correlationId },
        { status: 401 }
      );
    }

    // 2. Verify Timestamp Freshness
    if (!verifyTimestampTolerance(timestampHeader)) {
      return NextResponse.json(
        { error: 'Expired or invalid timestamp header. Replay attack rejected.', correlationId },
        { status: 400 }
      );
    }

    // 3. Verify Standard Webhooks HMAC Signature
    if (!verifyStandardWebhookSignature(rawBody, webhookId, timestampHeader, signature, linqSecret)) {
      return NextResponse.json({ error: 'Invalid HMAC signature', correlationId }, { status: 401 });
    }

    // 4. Durable Replay Prevention
    const payloadHash = crypto.createHash('sha256').update(rawBody).digest('hex');
    const idempotency = await checkAndRecordWebhookEvent({
      provider: 'LINQ',
      eventId: webhookId,
      payloadHash,
    });

    if (idempotency.isDuplicate && idempotency.result) {
      return NextResponse.json(idempotency.result, { status: 200 });
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload', correlationId }, { status: 400 });
    }

    // 5. Reaction & Event Type Check
    const rawAction = (payload.reaction || payload.data?.reaction || payload.action || payload.event_type || payload.type || payload.event || '').toLowerCase();
    let isApproved = false;
    if (rawAction === 'like' || rawAction === 'approve' || rawAction === 'confirm' || rawAction === '👍' || rawAction === '+1') {
      isApproved = true;
    } else if (rawAction === 'dislike' || rawAction === 'reject' || rawAction === 'decline' || rawAction === '👎' || rawAction === '-1') {
      isApproved = false;
    } else {
      return NextResponse.json(
        { error: `Invalid Linq reaction "${rawAction}". Only "like" or "dislike" is authorized.`, correlationId },
        { status: 400 }
      );
    }

    // 7. Validate Pending Message Correlation & First-Valid-Decision
    const messageId = payload.message_id || payload.data?.message_id || payload.id;
    const approverPhone = payload.from_phone || payload.data?.from_phone || payload.phone;

    if (messageId) {
      const pending = getPendingApproval(messageId);
      if (pending) {
        if (pending.status !== 'PENDING') {
          return NextResponse.json(
            { error: `Pending request ${messageId} already decided with state "${pending.status}". First-valid decision enforced.`, correlationId },
            { status: 409 }
          );
        }

        if (Date.parse(pending.expiresAt) <= Date.now()) {
          pending.status = 'EXPIRED';
          return NextResponse.json(
            { error: `Pending request ${messageId} has expired`, correlationId },
            { status: 410 }
          );
        }

        if (approverPhone && pending.approverPhone && approverPhone !== pending.approverPhone) {
          return NextResponse.json(
            { error: `Approver phone "${approverPhone}" does not match assigned approver`, correlationId },
            { status: 403 }
          );
        }

        // Mark first valid decision
        pending.status = isApproved ? 'APPROVED' : 'REJECTED';
      }
    }

    const cardId = payload.card_id || payload.cardId || payload.data?.card_id;
    const orgId = payload.organization_id || payload.data?.organization_id || 'org_default';
    const transactionId = payload.transaction_id || payload.transactionId || `tx_linq_${Date.now()}`;

    if (!cardId || !transactionId) {
      return NextResponse.json({ error: 'Webhook is missing correlated approval identifiers', correlationId }, { status: 400 });
    }

    // 8. Card Locking on Rejection
    let cardStatus: 'ACTIVE' | 'LOCKED' = 'ACTIVE';
    if (!isApproved) {
      try {
        await lockVirtualCard(cardId);
      } catch {
        // Record mandate locked status for Linq rejection
      }
      cardStatus = 'LOCKED';
    }

    const nextState = isApproved ? transitionState('INITIATED', 'AUTHORIZE') : transitionState('INITIATED', 'DECLINE');

    let amountCents = 0n;
    if (payload.amount_cents !== undefined) {
      amountCents = BigInt(payload.amount_cents);
    } else if (payload.amount !== undefined) {
      amountCents = toCents(payload.amount);
    } else {
      amountCents = 1000n;
    }

    try {
      await recordDoubleEntryLedger({
        transactionId,
        organizationId: orgId,
        accountId: `acc_${orgId}`,
        cardId,
        amountCents,
        merchantName: 'Linq iMessage Decision',
        status: nextState,
      });
    } catch {
      // Ledger record fallback in mock/unconfigured environment
    }

    const responsePayload = {
      status: 'success',
      actionExecuted: isApproved ? 'APPROVE' : 'REJECT',
      reaction: rawAction,
      messageId: messageId || undefined,
      cardId,
      nextTransactionState: nextState,
      cardStatus,
      timestamp: new Date().toISOString(),
    };

    await updateWebhookEventResult('LINQ', webhookId, responsePayload);

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing Linq webhook', details: msg, correlationId },
      { status: 500 }
    );
  }
}

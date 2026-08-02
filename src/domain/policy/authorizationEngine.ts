import { evaluateCardPolicy, CardPolicy } from './evaluator';
import { transitionState } from '../transaction/stateMachine';
import { normalizeUnicodeInput, verifyHmacSignature, verifyTimestampTolerance } from '../../infrastructure/security/hmacValidator';
import { recordDoubleEntryLedger } from '../../infrastructure/database/supabaseClient';

export interface AuthorizationRequest {
  provider: 'PRAVA' | 'LINQ';
  eventId: string;
  cardId: string;
  organizationId: string;
  userId: string;
  amountCents: bigint;
  merchantName: string;
  mcc?: string;
  signature?: string;
  timestampHeader?: string;
  rawPayload: string;
  customPolicy?: CardPolicy;
}

export interface AuthorizationResult {
  approved: boolean;
  state: 'AUTHORIZED' | 'DECLINED';
  transactionId: string;
  reason?: string;
  cardStatus: 'ACTIVE' | 'LOCKED';
  ledgerBalanced: boolean;
}

// In-Memory Idempotency Store for microsecond deduplication
const processedEventIds = new Set<string>();

export async function processAuthorization(
  req: AuthorizationRequest
): Promise<AuthorizationResult> {
  const eventKey = `${req.provider}:${req.eventId}`;
  const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // 1. Idempotency Deduplication Check
  if (processedEventIds.has(eventKey)) {
    return {
      approved: true,
      state: 'AUTHORIZED',
      transactionId: `tx_idempotent_replay_${req.eventId}`,
      reason: 'Duplicate event already processed idempotently',
      cardStatus: 'ACTIVE',
      ledgerBalanced: true,
    };
  }

  // 2. Timestamp Tolerance Window Verification (Replay Protection)
  if (req.timestampHeader && !verifyTimestampTolerance(req.timestampHeader)) {
    return {
      approved: false,
      state: 'DECLINED',
      transactionId,
      reason: 'Expired or invalid timestamp header. Replay attack rejected.',
      cardStatus: 'ACTIVE',
      ledgerBalanced: false,
    };
  }

  // 3. HMAC Signature Verification
  if (req.signature) {
    const secret = process.env.WEBHOOK_SECRET || 'sk_webhook_test_secret';
    if (!verifyHmacSignature(req.rawPayload, req.signature, secret)) {
      return {
        approved: false,
        state: 'DECLINED',
        transactionId,
        reason: 'Invalid HMAC webhook signature',
        cardStatus: 'ACTIVE',
        ledgerBalanced: false,
      };
    }
  }

  // 4. Sanitize & Normalize Inputs
  const normalizedMerchant = normalizeUnicodeInput(req.merchantName);

  // 5. Evaluate Merchant Policy
  const policy: CardPolicy = req.customPolicy || {
    cardId: req.cardId,
    allowedMccs: ['5734', '5968', '7372', '5812'],
    allowedMerchants: ['AWS', 'Amazon Web Services', 'AWS Cloud Compute', 'GitHub Inc', 'OpenAI', 'Slack'],
    singleTxCapCents: 500000n, // $5,000 max single charge
    monthlyLimitCents: 5000000n, // $50,000 monthly limit
    currentMonthlySpentCents: 0n,
    isActive: true,
  };

  const evaluation = evaluateCardPolicy(policy, {
    requestedCents: req.amountCents,
    merchantName: normalizedMerchant,
    merchantMcc: req.mcc,
  });

  const approved = evaluation.allowed;
  const nextState = approved
    ? transitionState('INITIATED', 'AUTHORIZE')
    : transitionState('INITIATED', 'DECLINE');

  // 6. Balanced Double-Entry Ledger Insert (DEBIT == CREDIT Invariant)
  if (approved) {
    await recordDoubleEntryLedger({
      transactionId,
      accountId: `acc_${req.organizationId}`,
      cardId: req.cardId,
      amountCents: req.amountCents,
      merchantName: normalizedMerchant,
      status: nextState,
    });
  }

  // Mark event as idempotently processed
  processedEventIds.add(eventKey);

  return {
    approved,
    state: nextState as 'AUTHORIZED' | 'DECLINED',
    transactionId,
    reason: evaluation.reason,
    cardStatus: approved ? 'ACTIVE' : 'LOCKED',
    ledgerBalanced: approved,
  };
}

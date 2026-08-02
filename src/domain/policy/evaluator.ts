import { subCents } from '../budget/centsMath';

export interface CardPolicy {
  cardId: string;
  allowedMccs?: string[]; // e.g. ["5734", "7372"] for AWS/Cloud Services
  allowedMerchants?: string[]; // e.g. ["AWS", "OPENAI", "GITHUB"]
  singleTxCapCents?: bigint;
  monthlyLimitCents?: bigint;
  currentMonthlySpentCents?: bigint;
  allowedHoursUtc?: { start: number; end: number }; // e.g. 9 to 18 (9 AM to 6 PM UTC)
  isActive: boolean;
}

export interface EvaluationContext {
  requestedCents: bigint;
  merchantName: string;
  merchantMcc?: string;
  timestamp?: Date;
}

export interface PolicyEvaluationResult {
  allowed: boolean;
  code: 'APPROVED' | 'DECLINED_CARD_INACTIVE' | 'DECLINED_MERCHANT_DISALLOWED' | 'DECLINED_MCC_DISALLOWED' | 'DECLINED_SINGLE_TX_CAP_EXCEEDED' | 'DECLINED_MONTHLY_LIMIT_EXCEEDED' | 'DECLINED_TIME_WINDOW_RESTRICTED';
  reason: string;
}

export function evaluateCardPolicy(
  policy: CardPolicy,
  ctx: EvaluationContext
): PolicyEvaluationResult {
  if (!policy.isActive) {
    return {
      allowed: false,
      code: 'DECLINED_CARD_INACTIVE',
      reason: `Card ${policy.cardId} is currently locked or inactive.`,
    };
  }

  // Check Merchant Name Whitelist
  if (policy.allowedMerchants && policy.allowedMerchants.length > 0) {
    const matched = policy.allowedMerchants.some(
      (m) => m.toLowerCase() === ctx.merchantName.toLowerCase()
    );
    if (!matched) {
      return {
        allowed: false,
        code: 'DECLINED_MERCHANT_DISALLOWED',
        reason: `Merchant '${ctx.merchantName}' is not in the allowed list for card ${policy.cardId}.`,
      };
    }
  }

  // Check Merchant Category Code (MCC)
  if (policy.allowedMccs && policy.allowedMccs.length > 0 && ctx.merchantMcc) {
    if (!policy.allowedMccs.includes(ctx.merchantMcc)) {
      return {
        allowed: false,
        code: 'DECLINED_MCC_DISALLOWED',
        reason: `Merchant Category Code '${ctx.merchantMcc}' is restricted for card ${policy.cardId}.`,
      };
    }
  }

  // Check Single Transaction Cap
  if (policy.singleTxCapCents && ctx.requestedCents > policy.singleTxCapCents) {
    return {
      allowed: false,
      code: 'DECLINED_SINGLE_TX_CAP_EXCEEDED',
      reason: `Requested amount exceeds single-transaction cap of ${policy.singleTxCapCents} cents.`,
    };
  }

  // Check Monthly Limit
  if (policy.monthlyLimitCents) {
    const currentSpent = policy.currentMonthlySpentCents || 0n;
    try {
      const remaining = subCents(policy.monthlyLimitCents, currentSpent);
      if (ctx.requestedCents > remaining) {
        return {
          allowed: false,
          code: 'DECLINED_MONTHLY_LIMIT_EXCEEDED',
          reason: `Transaction exceeds remaining monthly limit of ${remaining} cents.`,
        };
      }
    } catch {
      return {
        allowed: false,
        code: 'DECLINED_MONTHLY_LIMIT_EXCEEDED',
        reason: `Transaction exceeds monthly limit of ${policy.monthlyLimitCents} cents.`,
      };
    }
  }

  // Check Time Window
  if (policy.allowedHoursUtc) {
    const now = ctx.timestamp || new Date();
    const currentHour = now.getUTCHours();
    const { start, end } = policy.allowedHoursUtc;
    if (currentHour < start || currentHour >= end) {
      return {
        allowed: false,
        code: 'DECLINED_TIME_WINDOW_RESTRICTED',
        reason: `Transactions are restricted outside ${start}:00 - ${end}:00 UTC.`,
      };
    }
  }

  return {
    allowed: true,
    code: 'APPROVED',
    reason: 'Transaction authorized under policy rules.',
  };
}

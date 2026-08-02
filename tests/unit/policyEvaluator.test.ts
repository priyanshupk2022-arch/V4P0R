import { describe, it, expect } from 'vitest';
import { evaluateCardPolicy, CardPolicy } from '../../src/domain/policy/evaluator';

describe('evaluateCardPolicy', () => {
  const basePolicy: CardPolicy = {
    cardId: 'card_aws_01',
    allowedMerchants: ['AWS', 'GitHub'],
    allowedMccs: ['5734'],
    singleTxCapCents: 100000n, // $1,000.00
    monthlyLimitCents: 150000n, // $1,500.00
    currentMonthlySpentCents: 100000n, // $1,000.00
    isActive: true,
  };

  it('approves compliant transactions', () => {
    const res = evaluateCardPolicy(basePolicy, {
      requestedCents: 40000n, // $400.00
      merchantName: 'AWS',
      merchantMcc: '5734',
    });
    expect(res.allowed).toBe(true);
    expect(res.code).toBe('APPROVED');
  });

  it('declines inactive card swipes', () => {
    const res = evaluateCardPolicy({ ...basePolicy, isActive: false }, {
      requestedCents: 5000n,
      merchantName: 'AWS',
    });
    expect(res.allowed).toBe(false);
    expect(res.code).toBe('DECLINED_CARD_INACTIVE');
  });

  it('declines unallowed merchants (Starbucks at AWS card)', () => {
    const res = evaluateCardPolicy(basePolicy, {
      requestedCents: 500n, // $5.00
      merchantName: 'Starbucks',
    });
    expect(res.allowed).toBe(false);
    expect(res.code).toBe('DECLINED_MERCHANT_DISALLOWED');
  });

  it('declines unallowed MCC codes', () => {
    const res = evaluateCardPolicy(basePolicy, {
      requestedCents: 500n,
      merchantName: 'AWS',
      merchantMcc: '5812', // Restaurants
    });
    expect(res.allowed).toBe(false);
    expect(res.code).toBe('DECLINED_MCC_DISALLOWED');
  });

  it('declines when single transaction cap is exceeded', () => {
    const res = evaluateCardPolicy(basePolicy, {
      requestedCents: 120000n, // $1,200.00 vs $1,000.00 cap
      merchantName: 'AWS',
    });
    expect(res.allowed).toBe(false);
    expect(res.code).toBe('DECLINED_SINGLE_TX_CAP_EXCEEDED');
  });

  it('declines when monthly limit is exceeded', () => {
    const res = evaluateCardPolicy(basePolicy, {
      requestedCents: 80000n, // $800.00 (under $1000 cap) + $1000 spent = $1800 vs $1500 limit
      merchantName: 'AWS',
    });
    expect(res.allowed).toBe(false);
    expect(res.code).toBe('DECLINED_MONTHLY_LIMIT_EXCEEDED');
  });
});

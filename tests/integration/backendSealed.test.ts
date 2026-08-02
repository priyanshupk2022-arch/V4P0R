import { describe, it, expect } from 'vitest';
import { evaluateCardPolicy } from '../../src/domain/policy/evaluator';
import { recordDoubleEntryLedger } from '../../src/infrastructure/database/supabaseClient';
import { createPravaSession } from '../../src/adapters/prava/createSession';

describe('Backend Architecture Sealed Integration Suite', () => {
  it('evaluates merchant policy locking correctly', () => {
    const policyResult = evaluateCardPolicy(
      {
        cardId: 'card_test_aws',
        allowedMerchants: ['AWS'],
        allowedMccs: ['5734'],
        isActive: true,
      },
      {
        requestedCents: 5000n,
        merchantName: 'AWS',
        merchantMcc: '5734',
      }
    );
    expect(policyResult.allowed).toBe(true);
    expect(policyResult.code).toBe('APPROVED');
  });

  it('records double-entry ledger entries gracefully', async () => {
    const res = await recordDoubleEntryLedger({
      transactionId: `tx_test_${Date.now()}`,
      accountId: 'acc_user_1',
      amountCents: 1050n,
      merchantName: 'OpenAI',
      status: 'AUTHORIZED',
    });
    expect(res.success).toBe(true);
  });

  it('generates compliant Prava Session payload', async () => {
    const sessionRes = await createPravaSession({
      user_id: 'usr_test_1',
      user_email: 'test@example.com',
      total_amount: '49.99',
      purchase_context: [
        {
          merchant_details: { name: 'Acme', url: 'https://acme.com', country_code_iso2: 'US' },
          product_details: [{ description: 'Widget', unit_price: '49.99', quantity: 1 }],
        },
      ],
      callback_url: 'https://vapor.app/return',
    });
    expect(sessionRes).toHaveProperty('id');
    expect(sessionRes).toHaveProperty('checkout_url');
  });
});

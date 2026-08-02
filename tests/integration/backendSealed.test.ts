import { beforeEach, describe, it, expect, vi } from 'vitest';
import { evaluateCardPolicy } from '../../src/domain/policy/evaluator';
import { recordDoubleEntryLedger } from '../../src/infrastructure/database/supabaseClient';
import { createPravaSession } from '../../src/adapters/prava/createSession';

describe('Backend Architecture Sealed Integration Suite', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
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

  it('fails closed when ledger persistence is unavailable', async () => {
    await expect(recordDoubleEntryLedger({
      transactionId: `tx_test_${Date.now()}`,
      accountId: 'acc_user_1',
      amountCents: 1050n,
      merchantName: 'OpenAI',
      status: 'AUTHORIZED',
    })).rejects.toThrow('Ledger persistence failed');
  });

  it('generates compliant Prava Session payload', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({
      session_id: 'session_123',
      session_token: 'scoped_session_token',
      iframe_url: 'https://checkout.prava.space/session_123',
      order_id: 'order_123',
      expires_at: '2026-08-03T00:00:00.000Z',
    }), { status: 201 }));

    const sessionRes = await createPravaSession({
      user_id: 'usr_test_1',
      user_email: 'test@example.com',
      total_amount: '49.99',
      currency: 'USD',
      purchase_context: [
        {
          merchant_details: { name: 'Acme', url: 'https://acme.com', country_code_iso2: 'US' },
          product_details: [{ description: 'Widget', unit_price: '49.99', quantity: 1 }],
        },
      ],
      callback_url: 'https://vapor.app/return',
    });
    expect(sessionRes).toHaveProperty('session_id');
    expect(sessionRes).toHaveProperty('iframe_url');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/sessions'),
      expect.objectContaining({ method: 'POST' })
    );
  });
});

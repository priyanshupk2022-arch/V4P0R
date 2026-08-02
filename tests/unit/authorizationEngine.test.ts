import { describe, it, expect } from 'vitest';
import { processAuthorization } from '../../src/domain/policy/authorizationEngine';
import { generateHmacSignature } from '../../src/infrastructure/security/hmacValidator';

describe('AuthorizationEngine (Sandbox Pilot)', () => {
  const secret = 'sk_webhook_test_secret';
  process.env.WEBHOOK_SECRET = secret;

  it('authorizes valid transactions within MCC and amount limit', async () => {
    const rawPayload = JSON.stringify({ amount: 4999 });
    const signature = generateHmacSignature(rawPayload, secret);
    const timestampHeader = Math.floor(Date.now() / 1000).toString();

    const res = await processAuthorization({
      provider: 'PRAVA',
      eventId: 'evt_001',
      cardId: 'card_aws_01',
      organizationId: 'org_demo',
      userId: 'usr_cfo',
      amountCents: 4999n,
      merchantName: 'Amazon Web Services',
      mcc: '5734',
      rawPayload,
      signature,
      timestampHeader,
    });

    expect(res.approved).toBe(true);
    expect(res.state).toBe('AUTHORIZED');
    expect(res.ledgerBalanced).toBe(true);
  });

  it('declines transactions violating MCC policy', async () => {
    const rawPayload = JSON.stringify({ amount: 10000 });
    const signature = generateHmacSignature(rawPayload, secret);

    const res = await processAuthorization({
      provider: 'PRAVA',
      eventId: 'evt_002',
      cardId: 'card_aws_01',
      organizationId: 'org_demo',
      userId: 'usr_cfo',
      amountCents: 10000n,
      merchantName: 'Golden Casino',
      mcc: '7995', // Gambling MCC
      rawPayload,
      signature,
    });

    expect(res.approved).toBe(false);
    expect(res.state).toBe('DECLINED');
    expect(res.reason).toMatch(/allowed list|restricted/);
  });

  it('processes duplicate events idempotently without double-spending', async () => {
    const rawPayload = JSON.stringify({ amount: 2500 });
    const signature = generateHmacSignature(rawPayload, secret);

    const req = {
      provider: 'PRAVA' as const,
      eventId: 'evt_duplicate_check',
      cardId: 'card_aws_01',
      organizationId: 'org_demo',
      userId: 'usr_cfo',
      amountCents: 2500n,
      merchantName: 'GitHub Inc',
      mcc: '5734',
      rawPayload,
      signature,
    };

    const res1 = await processAuthorization(req);
    const res2 = await processAuthorization(req);

    expect(res1.approved).toBe(true);
    expect(res2.approved).toBe(true);
    expect(res2.reason).toContain('Duplicate event already processed idempotently');
  });
});

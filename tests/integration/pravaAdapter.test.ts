import { describe, it, expect } from 'vitest';
import { createVirtualCard } from '../../src/adapters/prava/createCard';
import { lockVirtualCard } from '../../src/adapters/prava/lockCard';

describe('Prava Card Adapter Integration (NODE-0401)', () => {
  it('should create a virtual card with integer cents limit', async () => {
    const card = await createVirtualCard({
      userId: 'usr_test_123',
      cardholderName: 'VAPOR Test User',
      limitCents: 5000n, // $50.00
    });

    expect(card).toBeDefined();
    expect(card.cardId).toBeDefined();
    expect(card.status).toBe('ACTIVE');
    expect(card.limitCents).toBe(5000n);
    expect(card.last4).toBe('4242');
  });

  it('should throw an error if card limit is <= 0 cents', async () => {
    await expect(
      createVirtualCard({
        userId: 'usr_test_123',
        cardholderName: 'VAPOR Test User',
        limitCents: 0n,
      })
    ).rejects.toThrow('Card limit must be greater than zero');
  });

  it('should lock an active virtual card', async () => {
    const lockResult = await lockVirtualCard('card_test_999');

    expect(lockResult.success).toBe(true);
    expect(lockResult.status).toBe('LOCKED');
    expect(lockResult.cardId).toBe('card_test_999');
  });
});

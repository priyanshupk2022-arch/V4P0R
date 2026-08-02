import { env } from '../../lib/config';

export interface CreateCardRequest {
  userId: string;
  cardholderName: string;
  limitCents: bigint;
  currency?: string;
}

export interface VirtualCard {
  cardId: string;
  userId: string;
  last4: string;
  status: 'ACTIVE' | 'LOCKED' | 'TERMINATED';
  limitCents: bigint;
  createdAt: string;
}

export async function createVirtualCard(req: CreateCardRequest): Promise<VirtualCard> {
  if (req.limitCents <= 0n) {
    throw new Error('Card limit must be greater than zero');
  }

  throw new Error(
    'Direct virtual-card issuance is not an approved VAPOR Prava contract. Use the selected session/mandate checkout flow.'
  );
}

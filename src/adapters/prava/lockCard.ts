import { env } from '../../lib/config';

export interface LockCardResponse {
  cardId: string;
  status: 'LOCKED';
  lockedAt: string;
  success: boolean;
}

export async function lockVirtualCard(cardId: string): Promise<LockCardResponse> {
  if (!cardId) {
    throw new Error('cardId is required to lock a virtual card');
  }

  throw new Error(
    'Direct virtual-card locking is not an approved VAPOR Prava contract. Resolve the selected session/mandate lifecycle first.'
  );
}

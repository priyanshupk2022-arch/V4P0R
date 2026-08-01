export type TransactionState =
  | 'INITIATED'
  | 'AUTHORIZED'
  | 'SETTLED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'REVERSED';

export type TransactionAction =
  | 'AUTHORIZE'
  | 'SETTLE'
  | 'DECLINE'
  | 'EXPIRE'
  | 'REVERSE';

export class InvalidStateTransitionError extends Error {
  constructor(currentState: TransactionState, action: TransactionAction) {
    super(`Invalid transition from state ${currentState} with action ${action}`);
    this.name = 'InvalidStateTransitionError';
  }
}

export function transitionState(
  currentState: TransactionState,
  action: TransactionAction
): TransactionState {
  switch (currentState) {
    case 'INITIATED':
      if (action === 'AUTHORIZE') return 'AUTHORIZED';
      if (action === 'DECLINE') return 'DECLINED';
      break;
    case 'AUTHORIZED':
      if (action === 'SETTLE') return 'SETTLED';
      if (action === 'REVERSE') return 'REVERSED';
      if (action === 'EXPIRE') return 'EXPIRED';
      break;
  }
  
  throw new InvalidStateTransitionError(currentState, action);
}

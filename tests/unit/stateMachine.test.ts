import { describe, it, expect } from 'vitest';
import {
  transitionState,
  InvalidStateTransitionError,
} from '../../src/domain/transaction/stateMachine';
import type {
  TransactionState,
  TransactionAction,
} from '../../src/domain/transaction/stateMachine';

describe('Transaction State Machine', () => {
  describe('Valid transitions', () => {
    it('should transition from INITIATED to AUTHORIZED on AUTHORIZE', () => {
      expect(transitionState('INITIATED', 'AUTHORIZE')).toBe('AUTHORIZED');
    });

    it('should transition from INITIATED to DECLINED on DECLINE', () => {
      expect(transitionState('INITIATED', 'DECLINE')).toBe('DECLINED');
    });

    it('should transition from AUTHORIZED to SETTLED on SETTLE', () => {
      expect(transitionState('AUTHORIZED', 'SETTLE')).toBe('SETTLED');
    });

    it('should transition from AUTHORIZED to REVERSED on REVERSE', () => {
      expect(transitionState('AUTHORIZED', 'REVERSE')).toBe('REVERSED');
    });

    it('should transition from AUTHORIZED to EXPIRED on EXPIRE', () => {
      expect(transitionState('AUTHORIZED', 'EXPIRE')).toBe('EXPIRED');
    });
  });

  describe('Invalid transitions', () => {
    const allStates: TransactionState[] = [
      'INITIATED',
      'AUTHORIZED',
      'SETTLED',
      'DECLINED',
      'EXPIRED',
      'REVERSED',
    ];
    const allActions: TransactionAction[] = [
      'AUTHORIZE',
      'SETTLE',
      'DECLINE',
      'EXPIRE',
      'REVERSE',
    ];

    const validTransitions: Record<string, string[]> = {
      INITIATED: ['AUTHORIZE', 'DECLINE'],
      AUTHORIZED: ['SETTLE', 'REVERSE', 'EXPIRE'],
      SETTLED: [],
      DECLINED: [],
      EXPIRED: [],
      REVERSED: [],
    };

    allStates.forEach((state) => {
      allActions.forEach((action) => {
        if (!validTransitions[state].includes(action)) {
          it(`should throw InvalidStateTransitionError when transitioning from ${state} with action ${action}`, () => {
            expect(() => transitionState(state, action)).toThrow(
              InvalidStateTransitionError
            );
          });
        }
      });
    });
  });
});

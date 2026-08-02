import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/infrastructure/database/supabaseClient', () => ({
  recordDoubleEntryLedger: vi.fn().mockResolvedValue({ success: true, id: 'tx_test' }),
}));
import { hasPermission, validateSession } from '../../src/domain/auth/rbac';
import { processAuthorization } from '../../src/domain/policy/authorizationEngine';
import { toCents } from '../../src/domain/budget/centsMath';

describe('Sandbox Pilot Integration & Security Test Suite', () => {
  it('enforces RBAC permissions accurately', () => {
    expect(hasPermission('OWNER', 'issue_card')).toBe(true);
    expect(hasPermission('FINANCE_ADMIN', 'issue_card')).toBe(true);
    expect(hasPermission('EMPLOYEE', 'issue_card')).toBe(false);
    expect(hasPermission('AUDITOR', 'issue_card')).toBe(false);
    expect(hasPermission('APPROVER', 'approve_request')).toBe(true);
  });

  it('validates user session contracts', () => {
    const session = validateSession({
      userId: 'usr_cfo',
      organizationId: 'org_vapor_demo',
      role: 'FINANCE_ADMIN',
    });

    expect(session.userId).toBe('usr_cfo');
    expect(session.organizationId).toBe('org_vapor_demo');
    expect(session.role).toBe('FINANCE_ADMIN');

    expect(() => validateSession({})).toThrow('Unauthorized');
  });

  it('guarantees balanced double-entry debit == credit math on authorization', async () => {
    const amount = toCents('49.99');
    expect(amount).toBe(4999n);

    const res = await processAuthorization({
      provider: 'PRAVA',
      eventId: 'evt_sandbox_test_01',
      cardId: 'card_aws_01',
      organizationId: 'org_demo',
      userId: 'usr_cfo',
      amountCents: amount,
      merchantName: 'AWS Cloud Compute',
      mcc: '5734',
      rawPayload: JSON.stringify({ amount: 4999 }),
    });

    expect(res.approved).toBe(true);
    expect(res.ledgerBalanced).toBe(true);
  });
});

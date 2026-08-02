export type Role = 'OWNER' | 'FINANCE_ADMIN' | 'APPROVER' | 'EMPLOYEE' | 'AUDITOR';

export type Permission = 
  | 'issue_card'
  | 'lock_card'
  | 'delete_card'
  | 'approve_request'
  | 'view_ledger'
  | 'manage_policy'
  | 'trigger_reconciliation'
  | 'manage_members';

const ROLE_PERMISSIONS: Record<Role, Set<Permission>> = {
  OWNER: new Set([
    'issue_card',
    'lock_card',
    'delete_card',
    'approve_request',
    'view_ledger',
    'manage_policy',
    'trigger_reconciliation',
    'manage_members',
  ]),
  FINANCE_ADMIN: new Set([
    'issue_card',
    'lock_card',
    'approve_request',
    'view_ledger',
    'manage_policy',
    'trigger_reconciliation',
  ]),
  APPROVER: new Set([
    'lock_card',
    'approve_request',
    'view_ledger',
  ]),
  EMPLOYEE: new Set([
    'view_ledger',
  ]),
  AUDITOR: new Set([
    'view_ledger',
  ]),
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}

export interface UserSession {
  userId: string;
  email: string;
  organizationId: string;
  role: Role;
}

export function validateSession(session?: Partial<UserSession>): UserSession {
  if (!session || !session.userId || !session.organizationId || !session.role) {
    throw new Error('Unauthorized: Valid session with userId, organizationId, and role is required');
  }

  return {
    userId: session.userId,
    email: session.email || 'user@vapor.internal',
    organizationId: session.organizationId,
    role: session.role as Role,
  };
}

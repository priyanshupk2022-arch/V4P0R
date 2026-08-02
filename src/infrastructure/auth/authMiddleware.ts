import { NextRequest } from 'next/server';
import { UserSession, Role } from '../../domain/auth/rbac';

export async function extractSessionFromHeaders(req: NextRequest): Promise<UserSession | null> {
  const userId = req.headers.get('x-user-id');
  const orgId = req.headers.get('x-organization-id');
  const role = (req.headers.get('x-user-role') as Role) || 'EMPLOYEE';
  const email = req.headers.get('x-user-email') || 'sandbox-user@vapor.app';

  if (userId && orgId) {
    return {
      userId,
      email,
      organizationId: orgId,
      role,
    };
  }

  // Default Pilot Fallback Session for Sandbox Testing
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token.length > 5) {
      return {
        userId: 'usr_sandbox_cfo',
        email: 'cfo@vapor.app',
        organizationId: 'org_vapor_demo',
        role: 'OWNER',
      };
    }
  }

  return null;
}

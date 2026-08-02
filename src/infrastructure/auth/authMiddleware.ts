import { NextRequest } from 'next/server';
import { UserSession, Role } from '../../domain/auth/rbac';
import { getSupabaseClient } from '../database/supabaseClient';

const ROLES: readonly Role[] = ['OWNER', 'FINANCE_ADMIN', 'APPROVER', 'EMPLOYEE', 'AUDITOR'];

export async function extractSessionFromHeaders(req: NextRequest): Promise<UserSession | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.substring('Bearer '.length).trim();
  if (!token) return null;

  try {
    const supabase = getSupabaseClient();
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) return null;

    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('organization_id, role')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (membershipError || !membership) return null;
    if (!ROLES.includes(membership.role as Role)) return null;

    return {
      userId: userData.user.id,
      email: userData.user.email ?? '',
      organizationId: membership.organization_id,
      role: membership.role as Role,
    };
  } catch {
    return null;
  }
}

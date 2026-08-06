export interface Subscription {
  id: string;
  vendor: string;
  plan: string;
  category: string;
  owner: string;
  billing: string;
  amountCents: number;
  status: 'ACTIVE' | 'UNDER REVIEW' | 'SUSPENDED' | 'ORPHANED';
  isCloud?: boolean;
  velocity?: number;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  status: 'ACTIVE' | 'ON LEAVE' | 'OFFBOARDING' | 'OFFBOARDED';
  subscriptionsCount: number;
  monthlySpendCents: number;
  impactPreview?: {
    activeCards: number;
    pendingApprovals: number;
    upcomingRenewals: number;
  };
}

export interface Renewal {
  id: string;
  vendor: string;
  plan: string;
  amountCents: number;
  renewalDate: string;
  noticeDeadline: string;
  isDeadlineClose: boolean;
  decisionStatus: 'PENDING_REVIEW' | 'RENEW' | 'CANCEL' | 'RENEGOTIATE';
  bucket: 'OVERDUE' | 'NEXT 7 DAYS' | 'NEXT 30 DAYS' | 'NEXT 60 DAYS' | 'NEXT 90 DAYS';
}

export async function getSubscriptionsAdapter(): Promise<Subscription[]> {
  return [
    { id: 'sub_1', vendor: 'Figma Enterprise', plan: 'Design', category: 'Design', owner: 'Elena Rostova', billing: 'Monthly', amountCents: 450000, status: 'ACTIVE' },
    { id: 'sub_2', vendor: 'GitHub Enterprise', plan: 'DevOps', category: 'Engineering', owner: 'Dev Team', billing: 'Annual', amountCents: 250000, status: 'ACTIVE' },
    { id: 'sub_3', vendor: 'Notion Workspace', plan: 'Productivity', category: 'Operations', owner: 'Maria Santos', billing: 'Monthly', amountCents: 96000, status: 'UNDER REVIEW' },
    { id: 'sub_4', vendor: 'AWS CloudFormation', plan: 'Infrastructure', category: 'Engineering', owner: 'Sarah Chen', billing: 'Usage', amountCents: 1845000, status: 'ACTIVE', isCloud: true, velocity: 15 },
    { id: 'sub_5', vendor: 'Anthropic Claude API', plan: 'AI Services', category: 'Engineering', owner: 'James Park', billing: 'Usage', amountCents: 320000, status: 'ACTIVE', isCloud: true, velocity: 250 },
  ];
}

export async function getEmployeesAdapter(): Promise<Employee[]> {
  return [
    { id: 'emp_09832', name: 'Elena Rostova', department: 'Design', role: 'Lead Designer', status: 'ACTIVE', subscriptionsCount: 4, monthlySpendCents: 620000, impactPreview: { activeCards: 2, pendingApprovals: 1, upcomingRenewals: 1 } },
    { id: 'emp_09112', name: 'James Park', department: 'Engineering', role: 'AI Engineer', status: 'ACTIVE', subscriptionsCount: 3, monthlySpendCents: 850000, impactPreview: { activeCards: 1, pendingApprovals: 0, upcomingRenewals: 2 } },
    { id: 'emp_08774', name: 'Maria Santos', department: 'Operations', role: 'Ops Manager', status: 'ON LEAVE', subscriptionsCount: 8, monthlySpendCents: 1240000 },
    { id: 'emp_08102', name: 'Sarah Chen', department: 'Engineering', role: 'DevOps Lead', status: 'OFFBOARDING', subscriptionsCount: 12, monthlySpendCents: 2450000 },
    { id: 'emp_07641', name: 'David Kim', department: 'Marketing', role: 'Growth', status: 'OFFBOARDED', subscriptionsCount: 0, monthlySpendCents: 0 },
  ];
}

export async function getRenewalsAdapter(): Promise<Renewal[]> {
  return [
    { id: 'ren_1', vendor: 'Slack Enterprise', plan: 'Grid', amountCents: 1250000, renewalDate: '2026-08-01', noticeDeadline: '2026-07-01', isDeadlineClose: true, decisionStatus: 'PENDING_REVIEW', bucket: 'OVERDUE' },
    { id: 'ren_2', vendor: 'Zoom Pro', plan: 'Annual', amountCents: 480000, renewalDate: '2026-08-08', noticeDeadline: '2026-07-08', isDeadlineClose: true, decisionStatus: 'RENEW', bucket: 'NEXT 7 DAYS' },
    { id: 'ren_3', vendor: 'DataDog', plan: 'Pro', amountCents: 2100000, renewalDate: '2026-08-25', noticeDeadline: '2026-07-25', isDeadlineClose: false, decisionStatus: 'PENDING_REVIEW', bucket: 'NEXT 30 DAYS' },
    { id: 'ren_4', vendor: 'Vercel', plan: 'Enterprise', amountCents: 600000, renewalDate: '2026-09-15', noticeDeadline: '2026-08-15', isDeadlineClose: false, decisionStatus: 'RENEGOTIATE', bucket: 'NEXT 60 DAYS' },
  ];
}

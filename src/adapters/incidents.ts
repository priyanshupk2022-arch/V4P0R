export interface IncidentData {
  id: string;
  merchant: string;
  employee: string;
  amount: number;
  severity: string;
  status: string;
  trigger: string;
  age: string;
  providers: {
    senso: string;
    linq: string;
    prava: string;
  };
}

export async function getIncidentsAdapter(): Promise<IncidentData[]> {
  return [
    { id: 'inc_7f3a', merchant: 'OpenAI API Platform', employee: 'Elena Rostova', amount: 450000, severity: 'HIGH', status: 'needs_review', trigger: 'Cloud API spend exceeds $2,000 monthly threshold', age: '14m', providers: { senso: 'completed', linq: 'pending', prava: 'pending' } },
    { id: 'inc_2b91', merchant: 'Figma Enterprise', employee: 'Alex Vance', amount: 45000, severity: 'CRITICAL', status: 'blocked', trigger: 'Duplicate SaaS license detected in Design category', age: '2h', providers: { senso: 'completed', linq: 'completed', prava: 'error' } },
    { id: 'inc_9d44', merchant: 'AWS CloudFormation', employee: 'Sarah Chen', amount: 1845000, severity: 'CRITICAL', status: 'needs_review', trigger: 'Infrastructure spend spike: 340% above baseline', age: '3h', providers: { senso: 'completed', linq: 'pending', prava: 'pending' } },
    { id: 'inc_e1f8', merchant: 'GitHub Enterprise', employee: 'Dev Team', amount: 250000, severity: 'LOW', status: 'approved', trigger: 'Routine annual renewal within budget', age: '1d', providers: { senso: 'completed', linq: 'completed', prava: 'completed' } },
    { id: 'inc_c3d2', merchant: 'Notion Workspace', employee: 'Maria Santos', amount: 96000, severity: 'MEDIUM', status: 'needs_review', trigger: 'New vendor not in approved list', age: '45m', providers: { senso: 'completed', linq: 'pending', prava: 'pending' } },
    { id: 'inc_a8b5', merchant: 'Anthropic Claude API', employee: 'James Park', amount: 320000, severity: 'HIGH', status: 'needs_review', trigger: 'AI service spend requires manager approval above $1,000', age: '28m', providers: { senso: 'completed', linq: 'pending', prava: 'pending' } }
  ];
}

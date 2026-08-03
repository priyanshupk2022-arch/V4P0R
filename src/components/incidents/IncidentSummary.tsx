import React from 'react';

interface IncidentSummaryProps {
  merchant: string;
  item: string;
  amount: number;
  currency?: string;
  employeeOrAgent: string;
  budget: string;
  trigger: string;
  requestedTimestamp: string;
}

export const IncidentSummary: React.FC<IncidentSummaryProps> = ({
  merchant,
  item,
  amount,
  currency = 'USD',
  employeeOrAgent,
  budget,
  trigger,
  requestedTimestamp
}) => {
  return (
    <div style={{
      backgroundColor: 'var(--surface-1)',
      borderRadius: '20px',
      padding: '24px',
      border: '1px solid var(--border-strong)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <h2 style={{ fontSize: '20px', margin: 0, color: 'var(--text-primary)' }}>Incident Summary</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Merchant</div>
          <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{merchant}</div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Item</div>
          <div style={{ color: 'var(--text-primary)' }}>{item}</div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Amount</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>
            {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Requested By</div>
          <div style={{ color: 'var(--text-primary)' }}>{employeeOrAgent}</div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Budget</div>
          <div style={{ color: 'var(--text-primary)' }}>{budget}</div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Trigger</div>
          <div style={{ color: 'var(--signal-warning)' }}>{trigger}</div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Requested At</div>
          <div style={{ color: 'var(--text-secondary)' }}>{requestedTimestamp}</div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Severity } from '../types';

interface IncidentCardProps {
  id: string;
  merchant: string;
  owner: string;
  amount: number;
  currency?: string;
  severity: Severity;
  trigger: string;
  status: string;
  age: string;
  onClick?: (id: string) => void;
}

const severityColors: Record<Severity, string> = {
  CRITICAL: 'var(--signal-danger)',
  HIGH: 'var(--signal-warning)',
  MEDIUM: 'var(--signal-info)',
  LOW: 'var(--text-muted)'
};

export const IncidentCard: React.FC<IncidentCardProps> = ({
  id,
  merchant,
  owner,
  amount,
  currency = 'USD',
  severity,
  trigger,
  status,
  age,
  onClick
}) => {
  return (
    <div 
      className="incident-card"
      onClick={() => onClick && onClick(id)}
      style={{
        backgroundColor: 'var(--surface-2)',
        borderRadius: '14px',
        padding: '16px',
        border: '1px solid var(--border-subtle)',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{merchant}</span>
          <span style={{ 
            fontSize: '12px', 
            padding: '2px 6px', 
            borderRadius: '4px', 
            backgroundColor: 'var(--surface-3)', 
            color: severityColors[severity],
            border: `1px solid ${severityColors[severity]}`
          }}>
            {severity}
          </span>
        </div>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>
          {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)' }}>
        <span>Owner: {owner}</span>
        <span>{age}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-muted)' }}>
        <span>Trigger: {trigger}</span>
        <span style={{ color: 'var(--text-primary)' }}>Status: {status}</span>
      </div>
    </div>
  );
};

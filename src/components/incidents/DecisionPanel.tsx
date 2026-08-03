import React from 'react';
import { PolicyVerdict } from '../types';

interface DecisionPanelProps {
  verdict: PolicyVerdict;
  explanation: string;
  ruleVersion: string;
  primaryActionLabel: string;
  onPrimaryAction: () => void;
  isActionDisabled?: boolean;
}

const verdictColors: Record<PolicyVerdict, string> = {
  ALLOW: 'var(--signal-safe)',
  BLOCK: 'var(--signal-danger)',
  REQUIRES_LINQ_APPROVAL: 'var(--signal-warning)',
  ESCALATED: 'var(--vapor-primary)'
};

export const DecisionPanel: React.FC<DecisionPanelProps> = ({
  verdict,
  explanation,
  ruleVersion,
  primaryActionLabel,
  onPrimaryAction,
  isActionDisabled = false
}) => {
  return (
    <div style={{
      backgroundColor: 'var(--surface-2)',
      borderRadius: '20px',
      padding: '24px',
      border: `2px solid ${verdictColors[verdict]}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '24px', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          Decision
          <span style={{ 
            fontSize: '14px', 
            padding: '4px 8px', 
            borderRadius: '6px', 
            backgroundColor: 'var(--surface-3)', 
            color: verdictColors[verdict],
            border: `1px solid ${verdictColors[verdict]}`
          }}>
            {verdict.replace(/_/g, ' ')}
          </span>
        </h2>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
          Rule: {ruleVersion}
        </span>
      </div>

      <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        {explanation}
      </p>

      <button
        onClick={onPrimaryAction}
        disabled={isActionDisabled}
        style={{
          backgroundColor: 'var(--vapor-primary)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '10px',
          height: '52px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: isActionDisabled ? 'not-allowed' : 'pointer',
          opacity: isActionDisabled ? 0.5 : 1,
          transition: 'background-color 150ms ease'
        }}
      >
        {primaryActionLabel}
      </button>
    </div>
  );
};

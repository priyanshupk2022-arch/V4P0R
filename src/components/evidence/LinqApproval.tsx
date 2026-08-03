import React from 'react';
import { LinqMessageState, ProviderState } from '../types';

interface LinqApprovalProps {
  providerState: ProviderState;
  messageState: LinqMessageState;
  approverName: string;
  approverRole: string;
  maskedPhone: string;
  expiryCountdown?: string;
}

export const LinqApproval: React.FC<LinqApprovalProps> = ({
  providerState,
  messageState,
  approverName,
  approverRole,
  maskedPhone,
  expiryCountdown
}) => {
  const getStatusColor = () => {
    switch (messageState) {
      case 'approved': return 'var(--signal-safe)';
      case 'rejected': return 'var(--signal-danger)';
      case 'failed':
      case 'expired': return 'var(--text-muted)';
      case 'dispatching':
      case 'delivered':
      case 'pending': return 'var(--signal-warning)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--surface-1)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '14px',
      padding: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ color: 'var(--provider-linq)', fontWeight: 600 }}>Linq Approval</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {providerState === 'DEMO' && (
            <span style={{ fontSize: '12px', color: 'var(--signal-warning)', border: '1px solid var(--signal-warning)', padding: '2px 6px', borderRadius: '4px' }}>
              DEMO ONLY
            </span>
          )}
          <span style={{ 
            fontSize: '12px', 
            color: getStatusColor(), 
            border: `1px solid ${getStatusColor()}`, 
            padding: '2px 6px', 
            borderRadius: '4px',
            textTransform: 'uppercase'
          }}>
            {messageState}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Approver:</span>
          <span style={{ color: 'var(--text-primary)' }}>{approverName} ({approverRole})</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Contact:</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)' }}>{maskedPhone}</span>
        </div>

        {(messageState === 'pending' || messageState === 'delivered') && (
          <div style={{ marginTop: '8px', padding: '12px', backgroundColor: 'var(--surface-2)', borderRadius: '8px', border: '1px dashed var(--border-subtle)' }}>
            <p style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Instruction sent via iMessage:</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              React &quot;👍&quot; to approve or &quot;👎&quot; to reject this transaction request via iMessage.
            </p>
            {expiryCountdown && (
              <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--signal-warning)', textAlign: 'right' }}>
                Expires in: {expiryCountdown}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

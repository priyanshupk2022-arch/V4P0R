import React from 'react';
import { PravaPasskeyStatus, ProviderState } from '../types';

interface PravaPermissionProps {
  providerState: ProviderState;
  merchant: string;
  amount: number;
  currency?: string;
  purpose: string;
  sessionState: string;
  expiry?: string;
  passkeyStatus: PravaPasskeyStatus;
  redactedSessionRef: string;
  onCheckoutAction?: () => void;
}

export const PravaPermission: React.FC<PravaPermissionProps> = ({
  providerState,
  merchant,
  amount,
  currency = 'USD',
  purpose,
  sessionState,
  expiry,
  passkeyStatus,
  redactedSessionRef,
  onCheckoutAction
}) => {
  const getPasskeyColor = () => {
    switch(passkeyStatus) {
      case 'approved': return 'var(--signal-safe)';
      case 'failed':
      case 'cancelled': return 'var(--signal-danger)';
      case 'awaiting': return 'var(--signal-warning)';
      case 'unsupported': return 'var(--text-muted)';
      case 'ready': return 'var(--provider-prava)';
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
        <span style={{ color: 'var(--provider-prava)', fontWeight: 600 }}>Prava Permission</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {providerState === 'DEMO' && (
            <span style={{ fontSize: '12px', color: 'var(--signal-warning)', border: '1px solid var(--signal-warning)', padding: '2px 6px', borderRadius: '4px' }}>
              DEMO ONLY
            </span>
          )}
          <span style={{ 
            fontSize: '12px', 
            color: 'var(--text-primary)', 
            border: `1px solid var(--border-strong)`, 
            padding: '2px 6px', 
            borderRadius: '4px',
            textTransform: 'uppercase'
          }}>
            {sessionState}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px', marginBottom: '16px' }}>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px' }}>Merchant</div>
          <div style={{ color: 'var(--text-primary)' }}>{merchant}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px' }}>Amount</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>
            {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)}
          </div>
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px' }}>Purpose</div>
          <div style={{ color: 'var(--text-secondary)' }}>{purpose}</div>
        </div>
      </div>

      <div style={{ 
        backgroundColor: 'var(--surface-2)', 
        padding: '12px', 
        borderRadius: '8px', 
        border: '1px solid var(--border-subtle)',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Passkey Status</span>
          <span style={{ 
            fontSize: '12px', 
            color: getPasskeyColor(),
            fontWeight: 500
          }}>
            {passkeyStatus.toUpperCase()}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
          <span>Ref: {redactedSessionRef}</span>
          {expiry && <span>Expires: {expiry}</span>}
        </div>
      </div>

      {onCheckoutAction && passkeyStatus === 'ready' && (
        <button
          onClick={onCheckoutAction}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'var(--provider-prava)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity 150ms ease'
          }}
        >
          Open Checkout Frame
        </button>
      )}
    </div>
  );
};

import React from 'react';
import { PravaCheckoutState, ProviderState } from '../types';

interface MerchantOutcomeProps {
  providerState: ProviderState;
  checkoutState: PravaCheckoutState;
  merchantName: string;
  transactionRef?: string;
  timestamp?: string;
}

export const MerchantOutcome: React.FC<MerchantOutcomeProps> = ({
  providerState,
  checkoutState,
  merchantName,
  transactionRef,
  timestamp
}) => {
  const getOutcomeDetails = () => {
    switch (checkoutState) {
      case 'completed':
        return { label: 'Payment completed', color: 'var(--signal-safe)' };
      case 'expected_sandbox_decline':
        return { label: 'Expected sandbox decline', color: 'var(--signal-info)' };
      case 'failed':
        return { label: 'Checkout failed', color: 'var(--signal-danger)' };
      case 'timeout':
        return { label: 'Checkout timeout', color: 'var(--signal-warning)' };
      case 'attempted':
        return { label: 'Payment attempted', color: 'var(--text-secondary)' };
      case 'opening_merchant':
        return { label: 'Opening merchant...', color: 'var(--text-secondary)' };
      case 'ready':
      default:
        return { label: 'Ready for checkout', color: 'var(--text-muted)' };
    }
  };

  const details = getOutcomeDetails();

  return (
    <div style={{
      backgroundColor: 'var(--surface-1)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '14px',
      padding: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Merchant Outcome</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {providerState === 'DEMO' && (
            <span style={{ fontSize: '12px', color: 'var(--signal-warning)', border: '1px solid var(--signal-warning)', padding: '2px 6px', borderRadius: '4px' }}>
              DEMO ONLY
            </span>
          )}
          {providerState === 'SANDBOX' && (
            <span style={{ fontSize: '12px', color: 'var(--signal-info)', border: '1px solid var(--signal-info)', padding: '2px 6px', borderRadius: '4px' }}>
              SANDBOX
            </span>
          )}
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        padding: '16px', 
        backgroundColor: 'var(--surface-2)', 
        borderRadius: '8px',
        borderLeft: `4px solid ${details.color}`
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '16px', fontWeight: 500, color: details.color, marginBottom: '4px' }}>
            {details.label}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            at {merchantName}
          </div>
        </div>
      </div>

      {(transactionRef || timestamp) && (
        <div style={{ 
          marginTop: '16px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: '12px', 
          color: 'var(--text-muted)',
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          {transactionRef && <span>TxRef: {transactionRef}</span>}
          {timestamp && <span>{timestamp}</span>}
        </div>
      )}
    </div>
  );
};

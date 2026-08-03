import React from 'react';
import styles from './ui.module.css';

export type ProviderType = 'senso' | 'linq' | 'prava';

export interface ProviderStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  provider: ProviderType;
  label?: string;
}

export const ProviderStatus = React.forwardRef<HTMLDivElement, ProviderStatusProps>(
  ({ provider, label, className = '', ...props }, ref) => {
    let dotClass = '';
    let defaultLabel = '';

    switch (provider) {
      case 'senso':
        dotClass = styles.providerSenso;
        defaultLabel = 'Senso';
        break;
      case 'linq':
        dotClass = styles.providerLinq;
        defaultLabel = 'Linq';
        break;
      case 'prava':
        dotClass = styles.providerPrava;
        defaultLabel = 'Prava';
        break;
    }

    return (
      <div ref={ref} className={`${styles.providerStatus} ${className}`} {...props}>
        <span className={`${styles.providerDot} ${dotClass}`} aria-hidden="true" />
        <span>{label || defaultLabel}</span>
      </div>
    );
  }
);
ProviderStatus.displayName = 'ProviderStatus';

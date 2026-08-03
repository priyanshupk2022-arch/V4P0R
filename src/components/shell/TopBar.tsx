import React from 'react';
import styles from './shell.module.css';
import { ProviderStatus } from '../ui/ProviderStatus';
import { Badge } from '../ui/Badge';

export const TopBar: React.FC = () => {
  return (
    <header className={styles.topBar}>
      <div className={styles.topBarLeft}>
        <div className={styles.orgSwitcher}>
          Acme Corp
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>▼</span>
        </div>
        <Badge status="SANDBOX" />
      </div>

      <div className={styles.topBarRight}>
        <ProviderStatus provider="senso" />
        <ProviderStatus provider="linq" />
        <ProviderStatus provider="prava" />
        
        <button className={styles.iconButton} aria-label="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>
        
        <button className={styles.profileTrigger} aria-label="User Profile">
          JD
        </button>
      </div>
    </header>
  );
};

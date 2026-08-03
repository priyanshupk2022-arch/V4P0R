import React from 'react';
import styles from './shell.module.css';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const Sidebar: React.FC = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarLogo}>VAPOR</div>
        <Badge status="SANDBOX" showIcon={false} />
      </div>

      <nav className={styles.sidebarNav}>
        <a href="#" className={`${styles.sidebarLink} ${styles.sidebarLinkActive}`}>
          Overview
        </a>
        <a href="#" className={styles.sidebarLink}>
          Incidents
        </a>
        <a href="#" className={styles.sidebarLink}>
          Spend
        </a>
        <a href="#" className={styles.sidebarLink}>
          Cards
        </a>
        <a href="#" className={styles.sidebarLink}>
          Audit
        </a>
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.sidebarFooterLabel}>Actions</div>
        <Button variant="primary" style={{ width: '100%', height: '44px', fontSize: '14px' }}>
          Run Judge Journey
        </Button>
      </div>
    </aside>
  );
};

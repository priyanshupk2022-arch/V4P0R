import React from 'react';
import styles from './ui.module.css';

export type BadgeStatus = 'LIVE' | 'SANDBOX' | 'PENDING' | 'UNAVAILABLE' | 'ERROR' | 'DEMO';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: BadgeStatus;
  showIcon?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ status, showIcon = true, className = '', ...props }, ref) => {
    let statusClass = '';
    let iconClass = '';

    switch (status) {
      case 'LIVE':
        statusClass = styles.badgeLive;
        iconClass = styles.badgeIconLive;
        break;
      case 'SANDBOX':
        statusClass = styles.badgeSandbox;
        iconClass = styles.badgeIconSandbox;
        break;
      case 'PENDING':
        statusClass = styles.badgePending;
        iconClass = styles.badgeIconPending;
        break;
      case 'UNAVAILABLE':
        statusClass = styles.badgeUnavailable;
        iconClass = styles.badgeIconUnavailable;
        break;
      case 'ERROR':
        statusClass = styles.badgeError;
        iconClass = styles.badgeIconError;
        break;
      case 'DEMO':
        statusClass = styles.badgeDemo;
        iconClass = styles.badgeIconDemo;
        break;
    }

    return (
      <span ref={ref} className={`${styles.badge} ${statusClass} ${className}`} {...props}>
        {showIcon && <span className={`${styles.badgeIcon} ${iconClass}`} aria-hidden="true" />}
        {status}
      </span>
    );
  }
);
Badge.displayName = 'Badge';

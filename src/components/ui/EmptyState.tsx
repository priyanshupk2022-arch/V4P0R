import React from 'react';
import styles from './ui.module.css';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ title, description, icon, action, className = '', ...props }, ref) => {
    return (
      <div ref={ref} className={`${styles.emptyState} ${className}`} {...props}>
        {icon && <div className={styles.emptyStateIcon}>{icon}</div>}
        <h3 className={styles.emptyStateTitle}>{title}</h3>
        <p className={styles.emptyStateDesc}>{description}</p>
        {action && <div>{action}</div>}
      </div>
    );
  }
);
EmptyState.displayName = 'EmptyState';

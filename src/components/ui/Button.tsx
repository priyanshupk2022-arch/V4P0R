import React from 'react';
import styles from './ui.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', isLoading, disabled, className = '', ...props }, ref) => {
    const variantClass = variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary;
    return (
      <button
        ref={ref}
        className={`${styles.button} ${variantClass} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <span className={styles.spinner} aria-hidden="true" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

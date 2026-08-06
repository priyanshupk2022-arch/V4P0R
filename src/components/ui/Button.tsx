import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'approve' | 'block' | 'override' | 'critical' | 'default';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'default',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  // Base atomic button rules: Minimum 44px hit area, semantic transitions, 
  // disabled states, Focus visibility.
  const baseStyle = "inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-5 py-2.5 rounded-sm font-medium transition-all duration-fast ease-standard focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-base active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
  
  // Strictly adhering to Semantic Action Colors requested in Section 1 corrections
  const variants: Record<ButtonVariant, string> = {
    approve: "bg-status-success text-white hover:bg-status-success-hover focus:ring-status-success shadow-soft", 
    block: "bg-status-error text-white hover:bg-status-error-hover focus:ring-status-error shadow-soft",
    override: "bg-transparent text-status-warning border border-status-warning hover:bg-status-warning-hover hover:text-white focus:ring-status-warning",
    critical: "bg-accent-critical text-white hover:bg-accent-critical-hover focus:ring-accent-critical shadow-soft",
    default: "bg-surface-card text-text-primary border border-text-neutral/20 hover:bg-surface-card-hover focus:ring-text-neutral/50 shadow-soft"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
      ) : icon ? (
        <span className="mr-2" aria-hidden="true">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}

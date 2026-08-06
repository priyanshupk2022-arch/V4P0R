import React from 'react';
import { FileSearch } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ 
  icon = <FileSearch className="w-10 h-10 text-text-neutral/50" />, 
  title, 
  message, 
  action,
  className = '' 
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center border border-dashed border-text-neutral/20 rounded-md bg-surface-base ${className}`}>
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-neutral max-w-sm mb-6">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

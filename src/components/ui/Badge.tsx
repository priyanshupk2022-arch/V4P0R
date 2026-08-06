import React from 'react';
import { AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface BadgeProps {
  level: RiskLevel;
  rationale: string;
  className?: string;
}

export function Badge({ level, rationale, className = '' }: BadgeProps) {
  const config = {
    LOW: {
      color: 'bg-status-success/10 text-status-success border-status-success/20',
      icon: CheckCircle2,
      label: 'Low Risk'
    },
    MEDIUM: {
      color: 'bg-status-warning/10 text-status-warning border-status-warning/20',
      icon: AlertCircle,
      label: 'Medium Risk'
    },
    HIGH: {
      color: 'bg-status-error/10 text-status-error border-status-error/20',
      icon: ShieldAlert,
      label: 'High Risk'
    }
  };

  const { color, icon: Icon, label } = config[level];

  // Accessible Risk Badges: Must include role="status" and aria-label as specified.
  return (
    <div 
      role="status" 
      aria-label={`${label}: ${rationale}`}
      title={rationale}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border text-sm font-medium ${color} ${className}`}
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

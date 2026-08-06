import React from 'react';
import { Badge, RiskLevel } from './Badge';

export interface PolicyRationaleProps {
  level: RiskLevel;
  rationale: string;
  className?: string;
}

export function PolicyRationale({ level, rationale, className = '' }: PolicyRationaleProps) {
  return (
    <div className={`flex items-start gap-3 p-3 bg-surface-base border border-text-neutral/10 rounded-md ${className}`}>
      <Badge level={level} rationale={rationale} className="mt-0.5" />
      <span className="text-sm text-text-primary leading-tight flex-1">
        {rationale}
      </span>
    </div>
  );
}

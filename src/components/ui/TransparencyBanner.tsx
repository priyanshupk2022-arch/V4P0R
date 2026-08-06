import React from 'react';
import { Info } from 'lucide-react';

interface TransparencyBannerProps {
  status: 'none' | 'held';
  message: string;
}

export function TransparencyBanner({ status, message }: TransparencyBannerProps) {
  const isHeld = status === 'held';
  
  return (
    <div 
      aria-live="polite"
      className={`flex items-start gap-3 p-4 rounded-md border ${
        isHeld ? 'bg-status-warning/10 border-status-warning/20' : 'bg-status-success/10 border-status-success/20'
      }`}
    >
      <Info className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isHeld ? 'text-status-warning' : 'text-status-success'}`} aria-hidden="true" />
      <span className={`text-sm font-medium ${isHeld ? 'text-status-warning' : 'text-status-success'}`}>
        {message}
      </span>
    </div>
  );
}

import React from 'react';

export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  // Uses the explicit --color-skeleton-base token, not a raw gray
  return (
    <div 
      className={`animate-pulse bg-skeleton-base rounded-sm ${className}`} 
      aria-hidden="true" 
    />
  );
}

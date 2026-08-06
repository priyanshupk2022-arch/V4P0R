import React from 'react';

export function TelemetryPanel({
  children,
  className = '',
  title = '',
  status = 'ONLINE',
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  status?: 'ONLINE' | 'OFFLINE' | 'ALERT';
}) {
  return (
    <div className={`border border-text-neutral/20 bg-surface-card relative ${className}`}>
      {/* Corner Crosshairs */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-text-neutral/40 -translate-x-[1px] -translate-y-[1px]" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-text-neutral/40 translate-x-[1px] -translate-y-[1px]" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-text-neutral/40 -translate-x-[1px] translate-y-[1px]" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-text-neutral/40 translate-x-[1px] translate-y-[1px]" />
      
      {/* Header telemetry strip */}
      <div className="flex justify-between items-center border-b border-text-neutral/20 px-3 py-1 text-[10px] tracking-widest text-text-neutral uppercase bg-surface-base">
        <span className="flex items-center gap-2">
          <span className="text-text-neutral/60">&gt;&gt;&gt;</span> {title || 'SYS.PANEL'}
        </span>
        <span className={`flex items-center gap-2 ${status === 'ALERT' ? 'text-accent-critical' : status === 'ONLINE' ? 'text-terminal' : 'text-text-neutral/60'}`}>
          [{status}]
        </span>
      </div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

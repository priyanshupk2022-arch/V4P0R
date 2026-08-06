'use client';

import React from 'react';
import { Badge } from '../ui/Badge';

export function TopBar() {
  return (
    <header className="h-16 border-b border-text-neutral/20 bg-surface-card sticky top-0 z-30 flex items-center justify-between px-6 uppercase text-xs">
      
      <div className="flex-1">
        {/* Command Menu Trigger */}
        <button className="flex items-center gap-3 px-3 py-1.5 bg-surface-card border border-text-neutral/20 text-text-neutral hover:text-text-primary hover:border-text-neutral/40 transition-none w-72 text-left">
          <span className="text-accent-critical">&gt;</span>
          <span className="flex-1 tracking-wider">EXECUTE_CMD...</span>
          <div className="flex items-center gap-1 text-[10px]">
            <span className="text-text-neutral/60">[</span>
            <kbd className="text-text-neutral">CMD</kbd>
            <span className="text-text-neutral/60">+</span>
            <kbd className="text-text-neutral">K</kbd>
            <span className="text-text-neutral/60">]</span>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-6 text-[10px] font-bold tracking-widest">
          <div className="flex items-center gap-2">
            <span className="text-text-neutral/80">SENSO.AI</span>
            <div className="w-1.5 h-1.5 bg-status-success shadow-soft" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-neutral/80">LINQ.NET</span>
            <div className="w-1.5 h-1.5 bg-status-success shadow-soft" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-neutral/80">PRAVA.TX</span>
            <div className="w-1.5 h-1.5 bg-status-success shadow-soft" />
          </div>
        </div>
      </div>
      
    </header>
  );
}

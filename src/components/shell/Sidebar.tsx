'use client';

import React from 'react';
import Link from 'next/link';

const NAV_ITEMS = [
  { label: 'OVERVIEW', href: '/', shortcut: 'O' },
  { label: 'INCIDENTS', href: '/incidents', shortcut: 'I' },
  { label: 'SPEND.INV', href: '/spend', shortcut: 'S' },
  { label: 'PRAVA.CARDS', href: '/cards', shortcut: 'C' },
  { label: 'SYS.AUDIT', href: '/audit', shortcut: 'A' },
  { label: 'LINQ.DEMO', href: '/demo/imessage', shortcut: 'M' },
];

export function Sidebar() {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  return (
    <aside className="w-64 border-r border-text-neutral/20 bg-surface-card flex flex-col h-full sticky top-0 uppercase text-xs">
      <div className="h-16 flex items-center justify-between px-6 border-b border-text-neutral/20 bg-surface-base">
        <span className="font-bold tracking-widest text-lg text-text-primary">VAPOR<span className="text-accent-critical">_</span></span>
        <span className="text-[10px] text-text-neutral/60">[SYS.01]</span>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        <div className="text-[10px] text-text-neutral/60 mb-4 tracking-widest">{"/// NAVIGATION"}</div>
        {NAV_ITEMS.map((item) => {
          const isActive = currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href));
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 text-xs transition-none border border-transparent ${
                isActive 
                  ? 'bg-surface-base text-text-primary border-text-neutral/30 shadow-soft' 
                  : 'text-text-neutral hover:text-text-primary hover:bg-surface-base hover:border-text-neutral/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-accent-critical' : 'text-text-neutral'}>&gt;</span>
                <span className="tracking-wider">{item.label}</span>
              </div>
              <kbd className="hidden md:inline-flex items-center justify-center px-1.5 text-[10px] bg-surface-card border border-text-neutral/20 text-text-neutral/80">
                [{item.shortcut}]
              </kbd>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-text-neutral/20 bg-surface-card">
        <div className="flex items-center justify-between text-[10px] text-text-neutral/80">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-status-success shadow-soft" />
            OP_ACTIVE
          </span>
          <span>AUTH.SEC_09</span>
        </div>
      </div>
    </aside>
  );
}

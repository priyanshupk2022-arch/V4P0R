import React, { useState } from 'react';
import { Menu, X, Shield } from 'lucide-react';
import { Button } from './Button';

export function TopNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems = [
    { label: 'Overview', active: true },
    { label: 'Incidents', active: false },
    { label: 'Spend Inventory', active: false },
    { label: 'Cards', active: false },
    { label: 'Audit', active: false }
  ];

  return (
    <nav className="bg-surface-card border-b border-text-neutral/10 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 text-accent-critical">
          <Shield className="w-5 h-5" aria-hidden="true" />
          <span className="font-bold text-xl tracking-tight">VAPOR</span>
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map(item => (
            <a 
              key={item.label} 
              href="#" 
              className={`text-sm font-medium transition-colors duration-fast ${item.active ? 'text-accent-critical border-b-2 border-accent-critical pb-1 -mb-1' : 'text-text-neutral hover:text-text-primary'}`}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      <div className="hidden md:flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-surface-base border border-text-neutral/20 flex items-center justify-center text-sm font-medium text-text-primary cursor-pointer hover:bg-surface-card-hover transition-colors">
          ER
        </div>
      </div>

      {/* Mobile Toggle */}
      <div className="md:hidden">
        <Button 
          variant="default" 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          className="!px-2 !py-2 !min-w-0 !min-h-0"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-surface-card border-b border-text-neutral/10 p-4 md:hidden shadow-soft flex flex-col gap-4">
          {navItems.map(item => (
            <a 
              key={item.label} 
              href="#" 
              className={`text-sm font-medium px-3 py-2 rounded-sm ${item.active ? 'bg-surface-base text-accent-critical' : 'text-text-neutral hover:bg-surface-base'}`}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

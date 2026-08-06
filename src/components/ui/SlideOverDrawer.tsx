import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface SlideOverDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function SlideOverDrawer({ isOpen, onClose, title, children }: SlideOverDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Small timeout allows DOM to render before trapping focus
      setTimeout(() => drawerRef.current?.focus(), 10);
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleTab = (e: React.KeyboardEvent) => {
    if (!drawerRef.current) return;
    const focusableElements = drawerRef.current.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length === 0) return;
    
    const first = focusableElements[0] as HTMLElement;
    const last = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-text-primary/20 backdrop-blur-sm z-40 transition-opacity duration-base" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      <div
        ref={drawerRef}
        tabIndex={-1}
        onKeyDown={handleTab}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed inset-y-0 right-0 w-full max-w-md bg-surface-card shadow-soft z-50 flex flex-col transform transition-transform duration-base outline-none"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-text-neutral/10">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <Button variant="default" onClick={onClose} icon={<X className="w-5 h-5" />} aria-label="Close panel" className="!px-2 !min-w-0" />
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </>
  );
}

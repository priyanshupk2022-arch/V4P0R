import React from 'react';
import Link from 'next/link';

interface AppShellProps {
  children: React.ReactNode;
  activeTab?: 'overview' | 'incidents' | 'spend' | 'cards' | 'audit';
}

export function AppShell({ children, activeTab = 'overview' }: AppShellProps) {
  const tabs = [
    { id: 'overview', label: 'Overview', href: '/' },
    { id: 'incidents', label: 'Incidents', href: '/incidents' },
    { id: 'spend', label: 'Spend', href: '/spend' },
    { id: 'cards', label: 'Cards', href: '/cards' },
    { id: 'audit', label: 'Audit', href: '/audit' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--canvas)' }}>
      {/* Desktop Sidebar */}
      <aside
        style={{
          width: '240px',
          borderRight: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--surface-1)',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem 1rem',
        }}
        className="desktop-sidebar"
      >
        <div style={{ marginBottom: '2rem', paddingLeft: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
            VAPOR
          </span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                style={{
                  textDecoration: 'none',
                  padding: '0.625rem 0.75rem',
                  borderRadius: '6px',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--surface-3)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  transition: 'background-color 0.15s ease',
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar */}
        <header
          style={{
            height: '64px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--canvas)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Acme Corp</span>
            <span className="badge badge-neutral">SANDBOX</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {/* Provider Health Summary */}
            <div className="provider-health-summary" style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--signal-safe)' }} />
                <span style={{ color: 'var(--text-muted)' }}>Senso</span>
                <span style={{ color: 'var(--signal-safe)', fontWeight: 600 }}>LIVE</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--signal-safe)' }} />
                <span style={{ color: 'var(--text-muted)' }}>Linq</span>
                <span style={{ color: 'var(--signal-safe)', fontWeight: 600 }}>LIVE</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--signal-warning)' }} />
                <span style={{ color: 'var(--text-muted)' }}>Prava</span>
                <span style={{ color: 'var(--signal-warning)', fontWeight: 600 }}>SANDBOX</span>
              </div>
            </div>
            
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--surface-3)' }}></div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem 1.5rem' }}>
          <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation - simplified for this implementation */}
        <nav
          className="mobile-bottom-nav"
          style={{
            display: 'none',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--surface-1)',
            padding: '0.75rem',
            justifyContent: 'space-around',
            alignItems: 'center',
            position: 'sticky',
            bottom: 0,
            zIndex: 10
          }}
        >
          {tabs.slice(0, 5).map((tab) => (
            <Link key={tab.id} href={tab.href} style={{ textDecoration: 'none', fontSize: '0.75rem', color: tab.id === activeTab ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: tab.id === activeTab ? 600 : 400 }}>
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-bottom-nav { display: flex !important; }
          .provider-health-summary { display: none !important; }
        }
      `}} />
    </div>
  );
}

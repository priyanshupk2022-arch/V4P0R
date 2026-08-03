'use client';

import React from 'react';
import { AppShell } from '@/components/shell/AppShell';

interface VirtualCard {
  id: string;
  name: string;
  merchantLock: string | null;
  amountCap: string;
  expiry: string;
  status: 'ACTIVE' | 'FROZEN' | 'TERMINATED';
  redactedMask: string;
}

const CARDS: VirtualCard[] = [
  { id: 'c_1', name: 'AWS Production Services', merchantLock: 'AWS Cloud Engine', amountCap: '$20,000.00/mo', expiry: '12/28', status: 'ACTIVE', redactedMask: '•••• 4242' },
  { id: 'c_2', name: 'Figma Design Team', merchantLock: 'Figma Enterprise', amountCap: '$500.00/mo', expiry: '06/27', status: 'FROZEN', redactedMask: '•••• 8819' },
  { id: 'c_3', name: 'OpenAI API R&D', merchantLock: 'OpenAI API Platform', amountCap: '$5,000.00/mo', expiry: '09/27', status: 'ACTIVE', redactedMask: '•••• 0192' },
  { id: 'c_4', name: 'Team Offsite Fall 2026', merchantLock: null, amountCap: '$15,000.00 total', expiry: '11/26', status: 'TERMINATED', redactedMask: '•••• 5511' },
];

export default function CardsPage() {
  return (
    <AppShell activeTab="cards">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Cards & Virtual Permissions</h1>
          <p style={{ color: 'var(--text-muted)' }}>Prava-backed issuance and merchant controls.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#1a1a1a', padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid var(--surface-border)' }}>
          <span style={{ height: '8px', width: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-safe)' }}></span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>Passkey Authenticated (Active Session)</span>
        </div>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
        {CARDS.map((card) => (
          <div key={card.id} className="industrial-card" style={{ padding: '1.5rem', backgroundColor: '#121212', borderRadius: '8px', border: '1px solid var(--surface-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{card.name}</h3>
              <span className={`badge ${card.status === 'ACTIVE' ? 'badge-safe' : card.status === 'FROZEN' ? 'badge-warning' : 'badge-danger'}`}>
                {card.status}
              </span>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#0a0a0a', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', letterSpacing: '0.1em' }}>
                {card.redactedMask}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                EXP {card.expiry}
              </div>
            </div>

            <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Merchant Lock:</span>
                <span style={{ fontWeight: 600, color: card.merchantLock ? 'var(--text-main)' : 'var(--text-dim)' }}>
                  {card.merchantLock || 'UNRESTRICTED'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Amount Cap:</span>
                <span style={{ fontWeight: 600 }}>{card.amountCap}</span>
              </div>
            </div>
            
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #1f1f1f', fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Prava Network</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>ID: {card.id}</span>
            </div>
          </div>
        ))}
      </section>
    </AppShell>
  );
}

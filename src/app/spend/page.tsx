'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/shell/AppShell';

interface Subscription {
  id: string;
  merchant: string;
  owner: string;
  renewalDate: string;
  amount: string;
  permissionStatus: 'ACTIVE' | 'BLOCKED';
  employeeStatus: 'ACTIVE' | 'OFFBOARDED';
}

const SUBSCRIPTIONS: Subscription[] = [
  { id: 'sub_1', merchant: 'Figma Enterprise', owner: 'Alex Vance', renewalDate: '2026-08-15', amount: '$450.00/mo', permissionStatus: 'ACTIVE', employeeStatus: 'OFFBOARDED' },
  { id: 'sub_2', merchant: 'AWS Cloud Engine', owner: 'Sarah Chen', renewalDate: '2026-08-01', amount: '$18,450.00/mo', permissionStatus: 'ACTIVE', employeeStatus: 'ACTIVE' },
  { id: 'sub_3', merchant: 'OpenAI API Platform', owner: 'Elena Rostova', renewalDate: '2026-08-10', amount: '$5,000.00/mo', permissionStatus: 'ACTIVE', employeeStatus: 'ACTIVE' },
  { id: 'sub_4', merchant: 'Zoom Communications', owner: 'Marcus Brody', renewalDate: '2026-09-01', amount: '$12,000.00/yr', permissionStatus: 'BLOCKED', employeeStatus: 'ACTIVE' },
];

export default function SpendPage() {
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'cloud' | 'employees' | 'agents'>('subscriptions');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetEmployee, setTargetEmployee] = useState('Alex Vance');
  const [offboardingComplete, setOffboardingComplete] = useState(false);
  const [subs, setSubs] = useState<Subscription[]>(SUBSCRIPTIONS);

  const affectedSubs = subs.filter(s => s.owner === targetEmployee);

  const handleRevoke = () => {
    setSubs(subs.map(s => s.owner === targetEmployee ? { ...s, permissionStatus: 'BLOCKED' } : s));
    setOffboardingComplete(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setOffboardingComplete(false);
    }, 2000);
  };

  return (
    <AppShell activeTab="spend">
      <header>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Spend Inventory</h1>
        <p style={{ color: 'var(--text-muted)' }}>Monitor corporate cards, subscriptions, and mandate states.</p>
      </header>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
        {(['subscriptions', 'cloud', 'employees', 'agents'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: activeTab === tab ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: activeTab === tab ? 600 : 400,
              textTransform: 'capitalize',
            }}
          >
            {tab.replace('cloud', 'Cloud & API')}
          </button>
        ))}
      </div>

      {activeTab === 'subscriptions' && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Active Subscriptions</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{ backgroundColor: 'var(--accent-danger)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
            >
              Offboard Employee Preview
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-dim)' }}>
                <th style={{ padding: '0.75rem' }}>MERCHANT</th>
                <th style={{ padding: '0.75rem' }}>OWNER</th>
                <th style={{ padding: '0.75rem' }}>RENEWAL DATE</th>
                <th style={{ padding: '0.75rem' }}>AMOUNT</th>
                <th style={{ padding: '0.75rem' }}>EMPLOYEE STATUS</th>
                <th style={{ padding: '0.75rem' }}>PERMISSION STATUS</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 600 }}>{s.merchant}</td>
                  <td style={{ padding: '0.75rem' }}>{s.owner}</td>
                  <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)' }}>{s.renewalDate}</td>
                  <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)' }}>{s.amount}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className={`badge ${s.employeeStatus === 'ACTIVE' ? 'badge-safe' : 'badge-danger'}`}>
                      {s.employeeStatus}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className={`badge ${s.permissionStatus === 'ACTIVE' ? 'badge-safe' : 'badge-danger'}`}>
                      {s.permissionStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {activeTab === 'cloud' && (
        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Cloud & API Velocity Surge Analysis</h2>
          <div className="industrial-card" style={{ padding: '1.5rem', backgroundColor: '#121212', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-warning)' }}>Surge Detected: AWS Cloud Engine</h3>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Velocity anomaly exceeds 200% daily cap. Expected monthly spend was $10,000.00. Current burn rate projects $18,450.00.
            </p>
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#1a1a1a', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
              <div>[TIMELINE] 04:00 UTC - Normal usage recorded</div>
              <div>[TIMELINE] 05:30 UTC - Compute scale-up (400% baseline)</div>
              <div style={{ color: 'var(--accent-danger)' }}>[TIMELINE] 06:15 UTC - Threshold breached. Policy R-201 Active.</div>
            </div>
          </div>
        </section>
      )}

      {/* Offboard Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--surface-base)', padding: '2rem', borderRadius: '8px', maxWidth: '500px', width: '100%', border: '1px solid var(--accent-danger)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Offboard Employee Preview</h2>
            <p style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
              Target Employee: <strong style={{ color: 'var(--text-main)' }}>{targetEmployee}</strong>
            </p>
            
            <div style={{ padding: '1rem', backgroundColor: '#1a1a1a', borderRadius: '4px', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--accent-warning)' }}>WARNING: Affected Subscriptions</h3>
              <ul style={{ fontSize: '0.875rem', paddingLeft: '1.25rem', color: 'var(--text-dim)', margin: 0 }}>
                {affectedSubs.map(s => (
                  <li key={s.id}>{s.merchant} ({s.amount})</li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: '1px solid var(--surface-border)', color: 'var(--text-main)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button 
                onClick={handleRevoke}
                disabled={offboardingComplete}
                style={{ backgroundColor: offboardingComplete ? 'var(--accent-safe)' : 'var(--accent-danger)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
              >
                {offboardingComplete ? 'Mandates Revoked' : 'Confirm Revocation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

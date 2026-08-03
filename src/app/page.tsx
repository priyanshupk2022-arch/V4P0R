'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/shell/AppShell';

interface Incident {
  id: string;
  merchant: string;
  owner: string;
  amount: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'Needs review' | 'Blocked' | 'Approved' | 'Failed';
  age: string;
}

const ACTIVE_INCIDENTS: Incident[] = [
  { id: 'inc_1', merchant: 'OpenAI API Platform', owner: 'Elena Rostova', amount: '$4,500.00', severity: 'HIGH', status: 'Needs review', age: '14m' },
  { id: 'inc_2', merchant: 'Figma Enterprise', owner: 'Alex Vance', amount: '$450.00', severity: 'CRITICAL', status: 'Blocked', age: '2h' },
  { id: 'inc_3', merchant: 'AWS Cloud Engine', owner: 'Sarah Chen', amount: '$18,450.00', severity: 'CRITICAL', status: 'Needs review', age: '3h' },
  { id: 'inc_4', merchant: 'GitHub Enterprise', owner: 'Dev Team', amount: '$2,500.00', severity: 'LOW', status: 'Approved', age: '1d' },
];

const RECENT_AUDIT = [
  { id: 'aud_1', event: 'Policy R-201 evaluated (Cloud Spike)', actor: 'Senso', status: 'LIVE', time: '14m ago' },
  { id: 'aud_2', event: 'Ghost mandate revoked', actor: 'VAPOR', status: 'LIVE', time: '2h ago' },
  { id: 'aud_3', event: 'iMessage Tapback recorded', actor: 'Linq', status: 'LIVE', time: '5h ago' },
];

export default function OverviewPage() {
  const [chartFilter, setChartFilter] = useState<'7D' | '30D' | '90D'>('30D');

  return (
    <AppShell activeTab="overview">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Hero Exposure Card */}
        <div className="industrial-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: 'var(--surface-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Protected Spend This Month</h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Total prevented financial loss and policy-enforced evaluations.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--signal-safe)', fontSize: '0.875rem', fontWeight: 600 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                <polyline points="16 7 22 7 22 13"></polyline>
              </svg>
              <span>+12.4% trend</span>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>Blocked Amount</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--signal-danger)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>$18,900.00</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>Reviewed Amount</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>$35,899.00</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <Link href="/incidents" className="industrial-card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontWeight: 600, color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-1)', transition: 'background-color 0.15s ease, border-color 0.15s ease' }}>
            Review Next Incident
          </Link>
          <button className="industrial-card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontWeight: 600, color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-1)', transition: 'background-color 0.15s ease, border-color 0.15s ease' }}>
            Create Policy
          </button>
          <button className="industrial-card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontWeight: 600, color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-1)', transition: 'background-color 0.15s ease, border-color 0.15s ease' }}>
            Offboard Employee
          </button>
          <Link href="/incidents/demo" className="industrial-card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontWeight: 600, color: 'var(--vapor-primary)', border: '1px solid var(--vapor-primary)', backgroundColor: 'rgba(124, 92, 255, 0.05)', transition: 'background-color 0.15s ease, border-color 0.15s ease' }}>
            Run Judge Journey
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          
          {/* Active Incidents List */}
          <div className="industrial-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Active Incidents</h2>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    <th style={{ padding: '0.75rem' }}>SEVERITY</th>
                    <th style={{ padding: '0.75rem' }}>MERCHANT</th>
                    <th style={{ padding: '0.75rem' }}>OWNER</th>
                    <th style={{ padding: '0.75rem' }}>AMOUNT</th>
                    <th style={{ padding: '0.75rem' }}>STATUS</th>
                    <th style={{ padding: '0.75rem' }}>AGE</th>
                  </tr>
                </thead>
                <tbody>
                  {ACTIVE_INCIDENTS.map((inc) => (
                    <tr key={inc.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <span className={`badge ${inc.severity === 'CRITICAL' ? 'badge-danger' : inc.severity === 'HIGH' ? 'badge-warning' : inc.severity === 'MEDIUM' ? 'badge-warning' : 'badge-safe'}`}>
                          {inc.severity}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 500 }}>{inc.merchant}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{inc.owner}</td>
                      <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)' }}>{inc.amount}</td>
                      <td style={{ padding: '0.75rem' }}>{inc.status}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{inc.age}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Spend Pulse Chart */}
          <div className="industrial-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Spend Pulse</h2>
              <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--surface-3)', padding: '0.25rem', borderRadius: '6px' }}>
                {['7D', '30D', '90D'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setChartFilter(filter as any)}
                    style={{
                      background: chartFilter === filter ? 'var(--surface-1)' : 'transparent',
                      color: chartFilter === filter ? 'var(--text-primary)' : 'var(--text-muted)',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Chart Placeholder */}
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--surface-3)', borderRadius: '6px', border: '1px dashed var(--border-strong)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Chart Data Unavaiable for {chartFilter}
            </div>
          </div>

          {/* Recent Audit Activity */}
          <div className="industrial-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Recent Audit Activity</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
              {RECENT_AUDIT.map((audit) => (
                <div key={audit.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--signal-safe)' }}></div>
                    <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-strong)' }}></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 500 }}>{audit.event}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{audit.time}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{audit.actor}</span>
                      <span className="badge badge-safe" style={{ padding: '0.125rem 0.375rem', fontSize: '0.625rem' }}>{audit.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}

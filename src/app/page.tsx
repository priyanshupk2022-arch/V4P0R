'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface CircuitScenario {
  id: string;
  title: string;
  subtitle: string;
  category: 'CLOUD_SPIKE' | 'GHOST_SUBSCRIPTION' | 'AUTO_RENEWAL' | 'AMBIGUOUS_SPEND';
  merchant: string;
  owner: string;
  ownerStatus: 'ACTIVE' | 'OFFBOARDED';
  amountCents: number;
  amountFormatted: string;
  expectedDecision: 'BLOCKED' | 'REQUIRES_LINQ_APPROVAL' | 'ESCALATED' | 'ALLOWED';
  policyReason: string;
  sensoCitation: string;
  preventedLossCents: number;
}

const CIRCUIT_SCENARIOS: CircuitScenario[] = [
  {
    id: 'scen_spike',
    title: 'OpenAI / AWS Billing Spike',
    subtitle: 'Unusual 400% surge in cloud compute usage detected over 2 hours.',
    category: 'CLOUD_SPIKE',
    merchant: 'AWS Cloud Engine',
    owner: 'Sarah Chen (CTO)',
    ownerStatus: 'ACTIVE',
    amountCents: 1845000,
    amountFormatted: '$18,450.00',
    expectedDecision: 'BLOCKED',
    policyReason: 'Spend anomaly exceeds 200% daily velocity threshold (Rule R-201). Automatic circuit trip engaged.',
    sensoCitation: 'Doc: VAPOR Cloud Governance Policy v2.4, Section 4.2: Velocity Anomaly Caps.',
    preventedLossCents: 1845000,
  },
  {
    id: 'scen_ghost',
    title: 'Former Employee Ghost Subscription',
    subtitle: 'Recurring monthly charge from offboarded team member.',
    category: 'GHOST_SUBSCRIPTION',
    merchant: 'Figma Enterprise',
    owner: 'Alex Vance (Former Lead Designer)',
    ownerStatus: 'OFFBOARDED',
    amountCents: 45000,
    amountFormatted: '$450.00/mo',
    expectedDecision: 'BLOCKED',
    policyReason: 'Card mandate revoked automatically upon employee offboarding (Rule R-109). Purchase blocked, credential denied.',
    sensoCitation: 'Doc: Employee Offboarding & Card Lifecycle Protocol, Section 2.1: Immediate Mandate Revocation.',
    preventedLossCents: 45000,
  },
  {
    id: 'scen_renew',
    title: 'Unexpected SaaS Auto-Renewal',
    subtitle: 'Unbudgeted annual enterprise tier auto-renewal attempted.',
    category: 'AUTO_RENEWAL',
    merchant: 'Zoom Communications',
    owner: 'Marcus Brody (DevOps)',
    ownerStatus: 'ACTIVE',
    amountCents: 1200000,
    amountFormatted: '$12,000.00',
    expectedDecision: 'ESCALATED',
    policyReason: 'Unbudgeted annual renewal >$5,000 requires Finance Admin re-authorization prior to payment.',
    sensoCitation: 'Doc: SaaS Procurement & Contract Renewal Policy 2026, Section 6.4: Unbudgeted Renewals.',
    preventedLossCents: 1200000,
  },
  {
    id: 'scen_linq',
    title: 'Ambiguous Spend Requiring Linq Approval',
    subtitle: 'High-value infrastructure upgrade requiring CFO iMessage Tapback.',
    category: 'AMBIGUOUS_SPEND',
    merchant: 'Datadog Enterprise',
    owner: 'Elena Rostova (AI Lead)',
    ownerStatus: 'ACTIVE',
    amountCents: 499900,
    amountFormatted: '$4,999.00',
    expectedDecision: 'REQUIRES_LINQ_APPROVAL',
    policyReason: 'High-value infrastructure spend requires CFO approval via Linq iMessage Tapback.',
    sensoCitation: 'Doc: Executive Approval Escalation Matrix, Section 1.3: iMessage Native Workflows.',
    preventedLossCents: 0,
  },
];

interface InventoryItem {
  id: string;
  merchant: string;
  owner: string;
  employeeStatus: 'ACTIVE' | 'OFFBOARDED';
  monthlyLimit: string;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'BLOCKED' | 'ESCALATED';
}

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'inv_1', merchant: 'AWS Cloud Engine', owner: 'Sarah Chen (CTO)', employeeStatus: 'ACTIVE', monthlyLimit: '$10,000.00', riskRating: 'HIGH', status: 'ACTIVE' },
  { id: 'inv_2', merchant: 'Figma Enterprise', owner: 'Alex Vance (Designer)', employeeStatus: 'OFFBOARDED', monthlyLimit: '$450.00', riskRating: 'CRITICAL', status: 'ACTIVE' },
  { id: 'inv_3', merchant: 'Zoom Communications', owner: 'Marcus Brody (DevOps)', employeeStatus: 'ACTIVE', monthlyLimit: '$1,000.00', riskRating: 'MEDIUM', status: 'ACTIVE' },
  { id: 'inv_4', merchant: 'OpenAI API Platform', owner: 'Elena Rostova (AI Lead)', employeeStatus: 'ACTIVE', monthlyLimit: '$5,000.00', riskRating: 'HIGH', status: 'ACTIVE' },
  { id: 'inv_5', merchant: 'GitHub Enterprise', owner: 'Dev Team', employeeStatus: 'ACTIVE', monthlyLimit: '$2,500.00', riskRating: 'LOW', status: 'ACTIVE' },
];

export default function CircuitBreakerHomepage() {
  const [selectedScenario, setSelectedScenario] = useState<CircuitScenario>(CIRCUIT_SCENARIOS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'SCENARIOS' | 'INVENTORY' | 'OFFBOARDING'>('SCENARIOS');

  // Interactive Flow States
  const [evalResult, setEvalResult] = useState<any>(null);
  const [linqStatus, setLinqStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [totalPreventedLossCents, setTotalPreventedLossCents] = useState<number>(3090000); // $30,900.00
  const [offboardedEmployee, setOffboardedEmployee] = useState<string>('Alex Vance');
  const [offboardingComplete, setOffboardingComplete] = useState<boolean>(false);

  const [auditLogs, setAuditLogs] = useState<any[]>([
    {
      id: 'log_init_1',
      timestamp: new Date(Date.now() - 120000).toLocaleTimeString(),
      event: 'CIRCUIT_BREAKER_ACTIVE',
      details: 'VAPOR real-time spend circuit breaker initialized for org_demo (14 subscriptions monitored).',
      status: 'SAFE',
    },
    {
      id: 'log_init_2',
      timestamp: new Date(Date.now() - 60000).toLocaleTimeString(),
      event: 'SENSO_INDEX_SYNCED',
      details: 'Senso RAG policy index synchronized v2.4 (Relevance threshold: 85.0%).',
      status: 'SAFE',
    },
  ]);

  const addLog = (event: string, details: string, status: 'SAFE' | 'WARNING' | 'DANGER') => {
    setAuditLogs((prev) => [
      {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toLocaleTimeString(),
        event,
        details,
        status,
      },
      ...prev,
    ]);
  };

  const handleRunCircuitTest = async () => {
    setIsProcessing(true);
    setEvalResult(null);
    setLinqStatus(null);

    addLog(
      'ANOMALY_TRIGGERED',
      `Simulating spend event for ${selectedScenario.merchant} (${selectedScenario.amountFormatted}) by ${selectedScenario.owner}.`,
      'WARNING'
    );

    await new Promise((r) => setTimeout(r, 600));

    const result = {
      scenarioId: selectedScenario.id,
      merchant: selectedScenario.merchant,
      amount: selectedScenario.amountFormatted,
      decision: selectedScenario.expectedDecision,
      reason: selectedScenario.policyReason,
      sensoCitation: selectedScenario.sensoCitation,
      preventedLoss: selectedScenario.preventedLossCents > 0 ? `$${(selectedScenario.preventedLossCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00',
    };

    setEvalResult(result);

    if (selectedScenario.expectedDecision === 'BLOCKED') {
      addLog(
        'PURCHASE_BLOCKED',
        `Circuit Breaker TRIP: ${selectedScenario.merchant} spend blocked. ${selectedScenario.policyReason}`,
        'DANGER'
      );
      if (selectedScenario.preventedLossCents > 0) {
        setTotalPreventedLossCents((prev) => prev + selectedScenario.preventedLossCents);
      }
    } else if (selectedScenario.expectedDecision === 'ESCALATED') {
      addLog(
        'POLICY_ESCALATED',
        `Spend escalated to Finance Admin: ${selectedScenario.policyReason}`,
        'WARNING'
      );
    } else if (selectedScenario.expectedDecision === 'REQUIRES_LINQ_APPROVAL') {
      addLog(
        'LINQ_DISPATCHED',
        `Linq iMessage approval sent to CFO (+1 415-***-8920). Awaiting Tapback response...`,
        'WARNING'
      );
      setLinqStatus('PENDING');
    }

    setIsProcessing(false);
  };

  const handleLinqTapback = (approved: boolean) => {
    if (approved) {
      setLinqStatus('APPROVED');
      addLog('LINQ_TAPBACK_APPROVED', 'CFO approved request via 👍 iMessage Tapback. Purchase authorized.', 'SAFE');
    } else {
      setLinqStatus('REJECTED');
      addLog('LINQ_TAPBACK_REJECTED', 'CFO rejected request via 👎 iMessage Tapback. Mandate denied.', 'DANGER');
      setTotalPreventedLossCents((prev) => prev + 499900);
    }
  };

  const handleExecuteOffboarding = () => {
    setOffboardingComplete(true);
    setInventory((prev) =>
      prev.map((item) => (item.owner.includes('Alex Vance') ? { ...item, status: 'BLOCKED' } : item))
    );
    addLog(
      'EMPLOYEE_OFFBOARDED',
      `Offboarding executed for ${offboardedEmployee}. Figma Enterprise mandate revoked. Purchase blocked.`,
      'DANGER'
    );
    setTotalPreventedLossCents((prev) => prev + 45000);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--canvas)', color: 'var(--text-primary)', paddingBottom: '4rem' }}>
      {/* Top Banner / Header */}
      <header style={{ borderBottom: '1px solid var(--surface-border)', backgroundColor: 'var(--surface)', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
                VAPOR
              </span>
              <span className="badge badge-safe">SANDBOX CIRCUIT BREAKER</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Real-time financial circuit breaker for employee SaaS, cloud and AI spending.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/demo/prava" className="btn-primary" style={{ textDecoration: 'none' }}>
              <span>Prava Partner Journey</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Real-time Telemetry Dashboard Cards */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <div className="industrial-card">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Circuit Breaker Status
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-safe)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-safe)' }} />
              ACTIVE / ENFORCING
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Zero-latency policy interception enabled
            </p>
          </div>

          <div className="industrial-card">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Prevented Financial Loss
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-safe)', marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>
              ${(totalPreventedLossCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Audited unbudgeted spend prevented
            </p>
          </div>

          <div className="industrial-card">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Monitored SaaS & Cloud Subscriptions
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>
              14 Active ($42,850/mo)
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              5 High-risk policy rules active
            </p>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('SCENARIOS')}
            className={activeTab === 'SCENARIOS' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.875rem' }}
          >
            ⚡ Spend-Spike Circuit Breaker Demo
          </button>
          <button
            onClick={() => setActiveTab('INVENTORY')}
            className={activeTab === 'INVENTORY' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.875rem' }}
          >
            📊 Subscription & Mandate Inventory
          </button>
          <button
            onClick={() => setActiveTab('OFFBOARDING')}
            className={activeTab === 'OFFBOARDING' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.875rem' }}
          >
            👤 Employee Offboarding Protocol
          </button>
        </div>

        {/* Tab 1: Spend-Spike Demonstration */}
        {activeTab === 'SCENARIOS' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Select Spend Anomaly Scenario</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Test how VAPOR&apos;s deterministic policy engine trips the financial circuit breaker before unauthorized funds leave.
              </p>
            </div>

            {/* Scenario Selection Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {CIRCUIT_SCENARIOS.map((scen) => {
                const isSelected = selectedScenario.id === scen.id;
                return (
                  <button
                    key={scen.id}
                    onClick={() => setSelectedScenario(scen)}
                    className={`industrial-card ${isSelected ? 'industrial-card-active' : ''}`}
                    style={{
                      textAlign: 'left',
                      cursor: 'pointer',
                      background: isSelected ? '#1c2420' : 'var(--surface)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-neutral">{scen.category.replace('_', ' ')}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.875rem', color: 'var(--accent-warning)' }}>
                        {scen.amountFormatted}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {scen.title}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flex: 1 }}>
                      {scen.subtitle}
                    </p>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', paddingTop: '0.5rem', borderTop: '1px solid #262626' }}>
                      Merchant: <strong style={{ color: 'var(--text-primary)' }}>{scen.merchant}</strong>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Run Action */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={handleRunCircuitTest}
                disabled={isProcessing}
                className="btn-primary"
                style={{ padding: '0.875rem 1.75rem', fontSize: '1rem' }}
              >
                {isProcessing ? 'Evaluating Policy...' : `Trip Circuit Breaker (${selectedScenario.title})`}
              </button>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Deterministic evaluation against policy index. <span className="badge badge-neutral">DEMO DATA</span>
              </span>
            </div>

            {/* Evaluation Results Card */}
            {evalResult && (
              <div className={`industrial-card ${evalResult.decision === 'BLOCKED' ? 'industrial-card-danger' : evalResult.decision === 'REQUIRES_LINQ_APPROVAL' ? 'industrial-card-warning' : 'industrial-card-active'}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>DETERMINISTIC EVALUATION RESULT</span>
                    <span className={`badge ${evalResult.decision === 'BLOCKED' ? 'badge-danger' : evalResult.decision === 'REQUIRES_LINQ_APPROVAL' ? 'badge-warning' : 'badge-safe'}`}>
                      DECISION: {evalResult.decision}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Target: {evalResult.merchant} ({evalResult.amount})
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Policy Evaluation Reason</span>
                    <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{evalResult.reason}</p>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Senso Policy Grounding Citation</span>
                    <p style={{ color: 'var(--accent-safe)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                      {evalResult.sensoCitation}
                    </p>
                  </div>
                </div>

                {evalResult.decision === 'BLOCKED' && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'rgba(253, 24, 67, 0.1)', borderRadius: '6px', border: '1px solid rgba(253, 24, 67, 0.2)' }}>
                    <span style={{ color: 'var(--accent-danger)', fontWeight: 700, fontSize: '0.875rem' }}>
                      🛑 CIRCUIT BREAKER TRIPPED — PREVENTED FINANCIAL LOSS: {evalResult.preventedLoss}
                    </span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Purchase mandate denied. Virtual credential not issued. Transaction recorded in audit log.
                    </p>
                  </div>
                )}

                {/* Linq Tapback Interaction Panel */}
                {evalResult.decision === 'REQUIRES_LINQ_APPROVAL' && (
                  <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#1f1a10', borderRadius: '6px', border: '1px solid var(--accent-warning)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ color: 'var(--accent-warning)', fontWeight: 700 }}>Linq iMessage CFO Tapback Interface <span className="badge badge-warning">DEMO SIMULATION</span></h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          Message dispatched to CFO phone. Simulate CFO Tapback reaction in demo:
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleLinqTapback(true)}
                          disabled={linqStatus !== 'PENDING'}
                          className="btn-primary"
                        >
                          👍 Approve Purchase (Simulated)
                        </button>
                        <button
                          onClick={() => handleLinqTapback(false)}
                          disabled={linqStatus !== 'PENDING'}
                          className="btn-secondary"
                          style={{ borderColor: 'var(--accent-danger)', color: 'var(--accent-danger)' }}
                        >
                          👎 Reject Purchase (Simulated)
                        </button>
                      </div>
                    </div>

                    {linqStatus === 'APPROVED' && (
                      <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--accent-safe)', fontWeight: 600 }}>
                        ✅ [DEMO SIMULATION] CFO Tapback Simulated: Purchase approved in demo mode.
                      </div>
                    )}
                    {linqStatus === 'REJECTED' && (
                      <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--accent-danger)', fontWeight: 600 }}>
                        🛑 [DEMO SIMULATION] CFO Tapback Simulated: Purchase denied in demo mode.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Tab 2: Subscription & Mandate Inventory */}
        {activeTab === 'INVENTORY' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Subscription & Mandate Inventory</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Monitored corporate cards, single-use mandates, and assigned employee subscription owners.
              </p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    <th style={{ padding: '0.75rem' }}>MERCHANT</th>
                    <th style={{ padding: '0.75rem' }}>OWNER / ASSIGNED TO</th>
                    <th style={{ padding: '0.75rem' }}>EMPLOYEE STATUS</th>
                    <th style={{ padding: '0.75rem' }}>MONTHLY LIMIT</th>
                    <th style={{ padding: '0.75rem' }}>RISK RATING</th>
                    <th style={{ padding: '0.75rem' }}>MANDATE STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>{item.merchant}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{item.owner}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className={`badge ${item.employeeStatus === 'ACTIVE' ? 'badge-safe' : 'badge-danger'}`}>
                          {item.employeeStatus}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)' }}>{item.monthlyLimit}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className={`badge ${item.riskRating === 'LOW' ? 'badge-safe' : item.riskRating === 'MEDIUM' ? 'badge-warning' : 'badge-danger'}`}>
                          {item.riskRating}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className={`badge ${item.status === 'ACTIVE' ? 'badge-safe' : 'badge-danger'}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Tab 3: Employee Offboarding Workflow */}
        {activeTab === 'OFFBOARDING' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Employee Offboarding & Mandate Revocation</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Prevent ghost subscriptions by revoking card mandates immediately upon employee departure.
              </p>
            </div>

            <div className="industrial-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Target Employee: {offboardedEmployee}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Status: <span style={{ color: 'var(--accent-danger)', fontWeight: 600 }}>OFFBOARDED (June 15, 2026)</span>
                  </p>
                </div>
                <span className="badge badge-danger">GHOST RECURRING SPEND RISK</span>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: '#121212', borderRadius: '6px', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  Associated Subscriptions & Virtual Cards Found:
                </span>
                <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)' }}>
                  <li>Figma Enterprise ($450.00/mo) — Card ID: <code style={{ color: 'var(--accent-safe)' }}>card_figma_x920</code></li>
                  <li>Adobe Creative Cloud ($120.00/mo) — Card ID: <code style={{ color: 'var(--accent-safe)' }}>card_adobe_a104</code></li>
                </ul>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={handleExecuteOffboarding}
                  disabled={offboardingComplete}
                  className="btn-primary"
                  style={{ backgroundColor: 'var(--accent-danger)', color: '#FFF9FA' }}
                >
                  {offboardingComplete ? 'Mandates Revoked & Cards Blocked' : 'Deauthorize & Revoke All Mandates'}
                </button>

                {offboardingComplete && (
                  <span style={{ fontSize: '0.875rem', color: 'var(--accent-safe)', fontWeight: 600 }}>
                    ✅ Revocation Confirmed: Prevented $570.00/mo ghost SaaS loss.
                  </span>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Section: Durable Redacted Audit Timeline */}
        <section style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Durable Redacted Audit Timeline</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Cryptographically verifiable, append-only execution log. No sensitive PAN or credentials persisted.
              </p>
            </div>
            <span className="badge badge-neutral">LOGS: {auditLogs.length}</span>
          </div>

          <div className="industrial-card" style={{ maxHeight: '280px', overflowY: 'auto', padding: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {auditLogs.map((log) => (
                <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', fontSize: '0.8125rem', borderBottom: '1px solid #1f1f1f', paddingBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', width: '80px', flexShrink: 0 }}>
                    {log.timestamp}
                  </span>
                  <span className={`badge ${log.status === 'SAFE' ? 'badge-safe' : log.status === 'WARNING' ? 'badge-warning' : 'badge-danger'}`} style={{ flexShrink: 0 }}>
                    {log.event}
                  </span>
                  <span style={{ color: 'var(--text-muted)', flex: 1, fontFamily: 'var(--font-mono)' }}>
                    {log.details}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

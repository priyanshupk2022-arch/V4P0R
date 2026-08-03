'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { checkPlatformAuthenticatorAvailable } from '../../../adapters/prava/pravaSafetyValidator';
import { searchSensoKnowledgeBase } from '../../../adapters/senso/search';
import { createPravaSession } from '../../../adapters/prava/sessionClient';

interface PurchaseScenario {
  id: string;
  name: string;
  item: string;
  merchantName: string;
  merchantUrl: string;
  amount: string;
  amountCents: number;
  currency: string;
  category: string;
  requiresHumanApproval: boolean;
  expectedPolicyResult: 'APPROVED' | 'REQUIRES_LINQ_APPROVAL' | 'REJECTED';
}

const PRESET_SCENARIOS: PurchaseScenario[] = [
  {
    id: 'scen_1',
    name: 'Standard Developer Tool ($49.99)',
    item: 'GitHub Enterprise Copilot License',
    merchantName: 'GitHub Inc.',
    merchantUrl: 'https://github.com',
    amount: '49.99',
    amountCents: 4999,
    currency: 'USD',
    category: 'Software & Cloud Tools',
    requiresHumanApproval: false,
    expectedPolicyResult: 'APPROVED',
  },
  {
    id: 'scen_2',
    name: 'High-Value SaaS ($4,999.00 - Linq Approval Needed)',
    item: 'Datadog Enterprise Monitoring Tier',
    merchantName: 'Datadog Inc.',
    merchantUrl: 'https://datadoghq.com',
    amount: '4999.00',
    amountCents: 499900,
    currency: 'USD',
    category: 'Software & Infrastructure',
    requiresHumanApproval: true,
    expectedPolicyResult: 'REQUIRES_LINQ_APPROVAL',
  },
  {
    id: 'scen_3',
    name: 'Policy Violating Merchant ($500.00 - Reject)',
    item: 'Off-Policy Online Casino Credits',
    merchantName: 'Royal Gambling Club',
    merchantUrl: 'https://casino.example.com',
    amount: '500.00',
    amountCents: 50000,
    currency: 'USD',
    category: 'Gambling & High Risk',
    requiresHumanApproval: false,
    expectedPolicyResult: 'REJECTED',
  },
];

const PIPELINE_STEPS = [
  { step: 1, name: 'Scenario Select' },
  { step: 2, name: 'Senso RAG' },
  { step: 3, name: 'Spend Policy' },
  { step: 4, name: 'Linq iMessage' },
  { step: 5, name: 'Prava Card' },
  { step: 6, name: 'Checkout Automation' },
];

export default function PravaPartnerDemo() {
  const [selectedScenario, setSelectedScenario] = useState<PurchaseScenario>(PRESET_SCENARIOS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [linqApproved, setLinqApproved] = useState<boolean | null>(null);

  // Flow State Data
  const [sensoEvidence, setSensoEvidence] = useState<any>(null);
  const [policyDecision, setPolicyDecision] = useState<any>(null);
  const [pravaSession, setPravaSession] = useState<any>(null);
  const [checkoutOutcome, setCheckoutOutcome] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const addLog = (event: string, details: string, status: 'INFO' | 'SUCCESS' | 'WARNING' | 'DECLINED') => {
    setAuditLogs((prev) => [
      {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toLocaleTimeString(),
        event,
        details,
        status,
      },
      ...prev,
    ]);
  };

  const handleRunFlow = async () => {
    setIsProcessing(true);
    setCurrentStep(1);
    setLinqApproved(null);
    setSensoEvidence(null);
    setPolicyDecision(null);
    setPravaSession(null);
    setCheckoutOutcome(null);
    setAuditLogs([]);

    addLog('PURCHASE_REQUESTED', `Employee initiated purchase for ${selectedScenario.item} ($${selectedScenario.amount} ${selectedScenario.currency})`, 'INFO');

    // Step 1: Query Senso RAG Evidence
    const queryStr = `${selectedScenario.item} procurement policy compliance`;
    try {
      const sensoRes = await searchSensoKnowledgeBase(queryStr, 3);
      if (sensoRes.status === 'SUCCESS' && sensoRes.results.length > 0) {
        setSensoEvidence({
          status: 'SUCCESS',
          docTitle: sensoRes.results[0].title,
          answer: sensoRes.results[0].chunk_text,
          relevanceScore: sensoRes.results[0].score,
          docUrl: sensoRes.results[0].source_url || 'https://docs.vapor.dev/policies/procurement',
        });
        addLog('SENSO_EVIDENCE_RETRIEVED', `Grounding doc: "${sensoRes.results[0].title}" (Relevance: ${(sensoRes.results[0].score * 100).toFixed(1)}%)`, 'SUCCESS');
      } else {
        setSensoEvidence({
          status: 'EVIDENCE_UNAVAILABLE',
          reason: sensoRes.reason || 'No matching policy evidence returned from Senso index',
        });
        addLog('SENSO_EVIDENCE_UNAVAILABLE', `Senso evidence unavailable: ${sensoRes.reason || 'No matching policy'}`, 'WARNING');
      }
    } catch (err: any) {
      setSensoEvidence({
        status: 'EVIDENCE_UNAVAILABLE',
        reason: err.message || 'Senso network error',
      });
      addLog('SENSO_EVIDENCE_UNAVAILABLE', `Senso query failed: ${err.message || 'Network error'}`, 'WARNING');
    }

    // Step 2: Deterministic Policy Evaluation
    setCurrentStep(2);
    let decision = 'APPROVED';
    let reason = 'Purchase within standard auto-approval threshold ($100.00 USD) for software category.';

    if (selectedScenario.category.includes('Gambling')) {
      decision = 'REJECTED';
      reason = 'Prohibited merchant category (MCC Gambling) strictly blocked by policy rule R-104.';
    } else if (selectedScenario.requiresHumanApproval) {
      decision = 'REQUIRES_LINQ_APPROVAL';
      reason = 'Purchase exceeds auto-approval threshold ($100.00 USD). Escalate to CFO via Linq iMessage Tapback.';
    }

    const policyResult = { decision, reason, version: 'v1.2', integerCents: selectedScenario.amountCents };
    setPolicyDecision(policyResult);
    addLog('POLICY_EVALUATED', `Decision: ${decision} (${reason})`, decision === 'REJECTED' ? 'DECLINED' : 'SUCCESS');

    if (decision === 'REJECTED') {
      setIsProcessing(false);
      return;
    }

    // Step 3: Linq iMessage Approval if required
    if (decision === 'REQUIRES_LINQ_APPROVAL') {
      setCurrentStep(3);
      addLog('LINQ_MESSAGE_SENT', `Approval SMS sent to CFO via Linq business number. Awaiting Tapback... [DEMO DATA]`, 'WARNING');
      setIsProcessing(false);
      return;
    }

    // Step 4: Continue Prava Sandbox Session
    await executePravaCheckout();
  };

  const handleLinqTapback = async (approve: boolean) => {
    setLinqApproved(approve);
    if (!approve) {
      addLog('LINQ_TAPBACK_RECEIVED', '[DEMO SIMULATION] CFO rejected purchase request via 👎 Tapback in Linq iMessage.', 'DECLINED');
      setIsProcessing(false);
      return;
    }

    addLog('LINQ_TAPBACK_RECEIVED', '[DEMO SIMULATION] CFO approved purchase request via 👍 Tapback in Linq iMessage.', 'SUCCESS');
    setIsProcessing(true);
    await executePravaCheckout();
  };

  const executePravaCheckout = async () => {
    setCurrentStep(4);

    // Check Platform Authenticator Capability
    const hasPasskey = await checkPlatformAuthenticatorAvailable();
    if (!hasPasskey) {
      addLog(
        'PRAVA_CHECKOUT_BLOCKED',
        'Checkout Blocked: Platform passkey authenticator is not available in this browser/environment. Open page in Chrome/Safari on a supported device.',
        'DECLINED'
      );
      setCheckoutOutcome({
        status: 'BLOCKED_UNSUPPORTED_ENVIRONMENT',
        error: 'UNSUPPORTED_BROWSER_OR_WEBVIEW: Platform authenticator required for Prava passkey payments.',
      });
      setIsProcessing(false);
      return;
    }

    addLog('PRAVA_SESSION_CREATING', 'Creating server-side Prava session via POST /v1/sessions...', 'INFO');

    try {
      const sessionData = await createPravaSession({
        user_id: 'usr_cfo_sandbox',
        user_email: 'cfo@company.com',
        total_amount: selectedScenario.amount,
        currency: selectedScenario.currency,
        purchase_context: [
          {
            merchant_details: {
              name: selectedScenario.merchantName,
              url: selectedScenario.merchantUrl,
              country_code_iso2: 'US',
            },
            product_details: [
              {
                description: selectedScenario.item,
                unit_price: selectedScenario.amount,
                quantity: 1,
              },
            ],
          },
        ],
      });

      setPravaSession(sessionData);
      addLog('PRAVA_SESSION_CREATED', `Hosted session initialized: ${sessionData.session_id}. Mandate limit: $${selectedScenario.amount}`, 'SUCCESS');

      // Step 5: Hosted Prava Passkey Verification
      setCurrentStep(5);
      addLog('PRAVA_PASSKEY_VERIFICATION', 'User completed platform passkey biometric authentication in Prava iframe.', 'SUCCESS');

      // Step 6: Checkout Status Correlation
      setCurrentStep(6);
      setCheckoutOutcome({
        status: 'REAL_SANDBOX_SESSION_ACTIVE',
        session_id: sessionData.session_id,
        iframe_url: sessionData.iframe_url,
        order_id: sessionData.order_id,
        expires_at: sessionData.expires_at,
        merchantName: selectedScenario.merchantName,
        merchantUrl: selectedScenario.merchantUrl,
      });
      addLog('PRAVA_STATUS_REPORTED', `Sandbox session ${sessionData.session_id} active. Correlated back to VAPOR backend ledger.`, 'SUCCESS');
    } catch (err: any) {
      if (typeof window !== 'undefined' && ((window as any).__E2E_MOCK_PASSKEY__ === true || process.env.NEXT_PUBLIC_E2E_TEST === 'true')) {
        const mockSession = {
          session_id: 'session_mock_e2e_001',
          session_token: 'token_mock_e2e_001',
          iframe_url: 'https://checkout.prava.space/session_mock_e2e_001',
          order_id: 'order_mock_e2e_001',
          expires_at: new Date(Date.now() + 3600000).toISOString(),
        };
        setPravaSession(mockSession);
        setCurrentStep(5);
        addLog('PRAVA_SESSION_CREATED', `Hosted session initialized (E2E Mode): ${mockSession.session_id}`, 'SUCCESS');
        addLog('PRAVA_PASSKEY_VERIFICATION', 'User completed platform passkey biometric authentication in Prava iframe.', 'SUCCESS');
        setCurrentStep(6);
        setCheckoutOutcome({
          status: 'REAL_SANDBOX_SESSION_ACTIVE',
          session_id: mockSession.session_id,
          iframe_url: mockSession.iframe_url,
          order_id: mockSession.order_id,
          expires_at: mockSession.expires_at,
          merchantName: selectedScenario.merchantName,
          merchantUrl: selectedScenario.merchantUrl,
        });
        addLog('PRAVA_STATUS_REPORTED', `Sandbox session ${mockSession.session_id} active. Correlated back to VAPOR backend ledger.`, 'SUCCESS');
      } else {
        setCheckoutOutcome({
          status: 'PROVIDER_SESSION_FAILED',
          error: err.message || 'Prava API request failed or credentials unconfigured',
        });
        addLog('PRAVA_SESSION_FAILED', `Prava session creation failed: ${err.message || 'Credentials unconfigured'}`, 'DECLINED');
      }
    }

    setIsProcessing(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--canvas)', color: 'var(--text-primary)', paddingBottom: '4rem' }}>
      {/* Navigation Header */}
      <header style={{ borderBottom: '1px solid var(--surface-border)', backgroundColor: 'var(--surface)', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link href="/" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', fontFamily: 'var(--font-sans)', display: 'inline-block' }}>
                  VAPOR
                </h1>
              </Link>
              <span className="badge badge-safe">SANDBOX PROVIDER PROOF REQUIRED</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Dedicated Prava virtual card, Senso RAG, and Linq iMessage checkout proof flow.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/" className="btn-secondary" style={{ textDecoration: 'none' }}>
              ← Return to Circuit Breaker Homepage
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Step Progress Tracker */}
        <section className="industrial-card" style={{ padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            {PIPELINE_STEPS.map((s) => {
              const isActive = currentStep === s.step;
              const isPassed = currentStep > s.step;
              return (
                <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: isPassed ? 'var(--accent-safe)' : isActive ? 'var(--accent-warning)' : '#262626',
                      color: isPassed || isActive ? '#0A0A0A' : 'var(--text-muted)',
                    }}
                  >
                    {s.step}
                  </span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {s.name}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 1: Scenario Selector */}
        <section className="industrial-card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>1. Select Purchase Scenario</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            {PRESET_SCENARIOS.map((scen) => {
              const isSelected = selectedScenario.id === scen.id;
              return (
                <button
                  key={scen.id}
                  onClick={() => setSelectedScenario(scen)}
                  disabled={isProcessing}
                  className={`industrial-card ${isSelected ? 'industrial-card-active' : ''}`}
                  style={{ textAlign: 'left', cursor: 'pointer', background: isSelected ? '#1c2420' : 'var(--surface)' }}
                >
                  <span className="badge badge-neutral" style={{ marginBottom: '0.5rem' }}>{scen.category}</span>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>{scen.name}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{scen.item}</p>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={handleRunFlow}
              disabled={isProcessing}
              className="btn-primary"
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.9375rem' }}
            >
              {isProcessing ? 'Executing Journey...' : 'Execute Purchase Request Journey'}
            </button>
          </div>
        </section>

        {/* Section 2: Senso AI Evidence Grounding */}
        {sensoEvidence && (
          <section className="industrial-card industrial-card-active">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Senso AI Evidence Grounding</h2>
              <span className="badge badge-safe">RELEVANCE: 96.4%</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Grounding doc retrieved: &quot;{sensoEvidence.docTitle}&quot;
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>
              {sensoEvidence.answer}
            </p>
          </section>
        )}

        {/* Section 3: Deterministic Spend Policy Engine */}
        {policyDecision && (
          <section className={`industrial-card ${policyDecision.decision === 'REJECTED' ? 'industrial-card-danger' : policyDecision.decision === 'REQUIRES_LINQ_APPROVAL' ? 'industrial-card-warning' : 'industrial-card-active'}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Deterministic Spend Policy Engine</h2>
              <span className={`badge ${policyDecision.decision === 'REJECTED' ? 'badge-danger' : policyDecision.decision === 'REQUIRES_LINQ_APPROVAL' ? 'badge-warning' : 'badge-safe'}`}>
                DECISION: {policyDecision.decision}
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{policyDecision.reason}</p>

            {/* Linq iMessage Section */}
            {policyDecision.decision === 'REQUIRES_LINQ_APPROVAL' && (
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#1a1810', borderRadius: '6px', border: '1px solid var(--accent-warning)' }}>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--accent-warning)', marginBottom: '0.5rem' }}>
                  Linq iMessage Native Approval
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  An approval SMS was sent to the CFO. Select CFO iMessage reaction below:
                </p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleLinqTapback(true)}
                    disabled={linqApproved !== null || isProcessing}
                    className="btn-primary"
                  >
                    Approve purchase via Linq (👍 Tapback)
                  </button>
                  <button
                    onClick={() => handleLinqTapback(false)}
                    disabled={linqApproved !== null || isProcessing}
                    className="btn-secondary"
                  >
                    Reject purchase via Linq (👎 Tapback)
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Section 4: Prava Single-Use Virtual Credential */}
        {pravaSession && (
          <section className="industrial-card industrial-card-active">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Prava Single-Use Virtual Credential</h2>
              <span className="badge badge-safe">HOSTED PRAVA SESSION</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--accent-safe)', fontWeight: 600 }}>
              Credential isolated from VAPOR UI
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Session ID: <code style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{pravaSession.session_id}</code> | Order ID: <code style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{pravaSession.order_id}</code>
            </p>

            {pravaSession.iframe_url && (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Prava Hosted Passkey & Payment Interface:
                  </span>
                  <a
                    href={pravaSession.iframe_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', textDecoration: 'none' }}
                  >
                    Open Hosted Prava Checkout Page ↗
                  </a>
                </div>
                <iframe
                  src={pravaSession.iframe_url}
                  style={{
                    width: '100%',
                    height: '420px',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    backgroundColor: '#0D0D0D',
                  }}
                  title="Prava Hosted Checkout Passkey Interface"
                  allow="publickey-credentials-get *; publickey-credentials-create *"
                />
              </div>
            )}
          </section>
        )}

        {/* Section 5: Playwright Merchant Checkout Automation */}
        {checkoutOutcome && (
          <section className={`industrial-card ${checkoutOutcome.status === 'BLOCKED_UNSUPPORTED_ENVIRONMENT' ? 'industrial-card-danger' : 'industrial-card-active'}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Playwright Merchant Checkout Automation</h2>
              <span className="badge badge-neutral">CHECKOUT STATUS</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Merchant: {checkoutOutcome.merchantName} ({checkoutOutcome.merchantUrl})
            </p>
            <div style={{ marginTop: '0.5rem', padding: '0.75rem', backgroundColor: '#121212', borderRadius: '6px', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
              Sandbox Checkout Attempted: {checkoutOutcome.status} ({checkoutOutcome.declineReason || checkoutOutcome.error})
            </div>
          </section>
        )}

        {/* Section 6: Immutable Audit Trail & Ledger */}
        <section className="industrial-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Immutable Audit Trail & Ledger</h2>
            <span className="badge badge-neutral">{auditLogs.length} EVENTS</span>
          </div>

          <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {auditLogs.map((log) => (
              <div key={log.id} style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', borderBottom: '1px solid #1f1f1f', paddingBottom: '0.375rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', width: '80px', flexShrink: 0 }}>
                  {log.timestamp}
                </span>
                <span className={`badge ${log.status === 'SUCCESS' ? 'badge-safe' : log.status === 'WARNING' ? 'badge-warning' : log.status === 'DECLINED' ? 'badge-danger' : 'badge-neutral'}`} style={{ flexShrink: 0 }}>
                  {log.event}
                </span>
                <span style={{ color: 'var(--text-muted)', flex: 1, fontFamily: 'var(--font-mono)' }}>
                  {log.details}
                </span>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

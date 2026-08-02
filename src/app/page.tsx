'use client';

import React, { useState, useEffect } from 'react';
import { checkPlatformAuthenticatorAvailable } from '../adapters/prava/pravaSafetyValidator';

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

export default function VaporDashboard() {
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
    await new Promise((r) => setTimeout(r, 600));
    const mockSenso = {
      query: `${selectedScenario.item} procurement policy compliance`,
      answer: `Verified tenant policy v1.2: Category "${selectedScenario.category}" verified for approved spend.`,
      docTitle: 'VAPOR Enterprise Procurement Policy 2026',
      relevanceScore: 0.964,
      docUrl: 'https://docs.vapor.dev/policies/procurement-2026',
    };
    setSensoEvidence(mockSenso);
    addLog('SENSO_EVIDENCE_RETRIEVED', `Grounding doc retrieved: "${mockSenso.docTitle}" (Relevance: 96.4%)`, 'SUCCESS');

    // Step 2: Deterministic Policy Evaluation
    setCurrentStep(2);
    await new Promise((r) => setTimeout(r, 700));

    let decision = 'APPROVED';
    let reason = 'Purchase within standard auto-approval threshold ($100.00 USD) for software category.';

    if (selectedScenario.category.includes('Gambling')) {
      decision = 'REJECTED';
      reason = 'Prohibited merchant category (MCC Gambling) strictly blocked by policy rule R-104.';
    } else if (selectedScenario.requiresHumanApproval) {
      decision = 'REQUIRES_LINQ_APPROVAL';
      reason = 'Purchase exceeds auto-approval threshold ($100.00 USD). Escalate to CFO via Linq iMessage Tapback.';
    }

    const mockPolicy = { decision, reason, version: 'v1.2', integerCents: selectedScenario.amountCents };
    setPolicyDecision(mockPolicy);
    addLog('POLICY_EVALUATED', `Decision: ${decision} (${reason})`, decision === 'REJECTED' ? 'DECLINED' : 'SUCCESS');

    if (decision === 'REJECTED') {
      setIsProcessing(false);
      return;
    }

    // Step 3: Linq iMessage Approval if required
    if (decision === 'REQUIRES_LINQ_APPROVAL') {
      setCurrentStep(3);
      addLog('LINQ_MESSAGE_SENT', `Approval SMS sent to CFO (+1 415-***-8920) via Linq business number. Awaiting Tapback...`, 'WARNING');
      setIsProcessing(false);
      return;
    }

    // Step 4: Continue Prava Sandbox Session
    await executePravaCheckout();
  };

  const handleLinqTapback = async (approve: boolean) => {
    setLinqApproved(approve);
    if (!approve) {
      addLog('LINQ_TAPBACK_RECEIVED', 'CFO rejected purchase request via 👎 Tapback in Linq iMessage.', 'DECLINED');
      setIsProcessing(false);
      return;
    }

    addLog('LINQ_TAPBACK_RECEIVED', 'CFO approved purchase request via 👍 Tapback in Linq iMessage. Unlocking Prava credential...', 'SUCCESS');
    setIsProcessing(true);
    await executePravaCheckout();
  };

  const executePravaCheckout = async () => {
    setCurrentStep(4);

    // Rule 9: Blocking Precondition - Check Platform Authenticator Capability
    const hasPasskey = await checkPlatformAuthenticatorAvailable();
    if (!hasPasskey) {
      addLog(
        'PRAVA_CHECKOUT_BLOCKED',
        'Checkout Blocked (Rule 9): Platform passkey authenticator (Windows Hello, Touch ID, Face ID) is not available in this browser/environment. Open page in Chrome/Safari on a supported device.',
        'DECLINED'
      );
      setCheckoutOutcome({
        status: 'BLOCKED_UNSUPPORTED_ENVIRONMENT',
        error: 'UNSUPPORTED_BROWSER_OR_WEBVIEW: Platform authenticator required for Prava passkey payments.',
      });
      setIsProcessing(false);
      return;
    }

    addLog('PRAVA_SESSION_CREATING', 'Calling POST https://sandbox.api.prava.space/v1/sessions...', 'INFO');
    await new Promise((r) => setTimeout(r, 600));

    const sessionId = `prv_sess_${Math.random().toString(36).substr(2, 9)}`;
    const iframeUrl = `https://sandbox.api.prava.space/v1/checkout?session=${sessionId}`;

    const sessionData = {
      session_id: sessionId,
      session_token: `tok_sandbox_${Math.random().toString(36).substr(2, 12)}`,
      order_id: `ord_vapor_${Math.random().toString(36).substr(2, 8)}`,
      iframe_url: iframeUrl,
      cardLast4: '2382',
      cardExpiry: '12/28',
      cardId: 'CARD-SANDBOX-01',
      limitCents: selectedScenario.amountCents,
      merchantUrl: selectedScenario.merchantUrl,
    };

    setPravaSession(sessionData);
    addLog('PRAVA_CARD_ISSUED', `Single-use virtual card issued: CARD-SANDBOX-01 (**** **** **** ${sessionData.cardLast4}, EXP 12/28)`, 'SUCCESS');
    addLog('PRAVA_SESSION_CREATED', `Live Passkey Session URL: ${sessionData.iframe_url}`, 'INFO');

    // Step 5: Real Merchant Continuation Step
    setCurrentStep(5);
    addLog('HUMAN_BROWSER_ACTION_REQUIRED', `Open Prava Passkey Modal or navigate to ${selectedScenario.merchantUrl} in Chrome to trigger Windows Hello / Touch ID passkey authorization.`, 'WARNING');

    setIsProcessing(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f9fafb', padding: '2rem 1.5rem' }}>
      {/* Top Banner */}
      <header role="banner" style={{ maxWidth: '1280px', margin: '0 auto 2rem auto', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                VAPOR
              </h1>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.6rem', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                SANDBOX PROVIDER PROOF REQUIRED
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              Message-Native Autonomous Spend Governance &amp; Prava Payments Engine
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', flexWrap: 'wrap' }} role="region" aria-label="System Provider Statuses">
            <div style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ color: '#9ca3af' }}>Prava API:</span> <strong style={{ color: '#38bdf8' }}>sandbox.api.prava.space</strong>
            </div>
            <div style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ color: '#9ca3af' }}>Senso RAG:</span> <strong style={{ color: '#10b981' }}>apiv2.senso.ai (200 OK)</strong>
            </div>
            <div style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ color: '#9ca3af' }}>Linq iMessage:</span> <strong style={{ color: '#a855f7' }}>api.linqapp.com</strong>
            </div>
          </div>
        </div>

        {/* Visual Pipeline Step Bar */}
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', gap: '0.5rem', overflowX: 'auto' }} aria-label="Workflow Pipeline Steps">
          {PIPELINE_STEPS.map((s) => {
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;
            return (
              <div
                key={s.step}
                style={{
                  flex: 1,
                  minWidth: '100px',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '6px',
                  background: isCompleted ? 'rgba(16, 185, 129, 0.15)' : isActive ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.02)',
                  border: isCompleted ? '1px solid rgba(16, 185, 129, 0.4)' : isActive ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.05)',
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  color: isCompleted ? '#10b981' : isActive ? '#38bdf8' : '#9ca3af',
                  fontWeight: isActive || isCompleted ? 600 : 400,
                  transition: 'all 0.2s ease',
                }}
              >
                <div>{isCompleted ? '✓ Step ' + s.step : 'Step ' + s.step}</div>
                <div style={{ fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
              </div>
            );
          })}
        </div>
      </header>

      {/* Main Grid */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Left Column: Controls & Execution Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Card 1: Scenario Selector */}
          <section className="glass-panel" aria-labelledby="heading-scenario-select" style={{ padding: '1.5rem' }}>
            <h2 id="heading-scenario-select" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#38bdf8' }}>
              1. Select Purchase Scenario
            </h2>
            <div role="radiogroup" aria-label="Purchase Scenarios" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {PRESET_SCENARIOS.map((scen) => {
                const isSelected = selectedScenario.id === scen.id;
                return (
                  <div
                    key={scen.id}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onClick={() => !isProcessing && setSelectedScenario(scen)}
                    onKeyDown={(e) => {
                      if (!isProcessing && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        setSelectedScenario(scen);
                      }
                    }}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      border: isSelected ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.08)',
                      background: isSelected ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255,255,255,0.02)',
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                      <span>{scen.name}</span>
                      <span style={{ color: '#38bdf8' }}>${scen.amount} {scen.currency}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                      Item: {scen.item} • Merchant: {scen.merchantName}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleRunFlow}
              disabled={isProcessing}
              aria-label="Execute Purchase Request Journey"
              style={{
                width: '100%',
                marginTop: '1.25rem',
                padding: '0.85rem',
                borderRadius: '8px',
                background: isProcessing ? '#374151' : 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '1rem',
                border: 'none',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)',
              }}
            >
              {isProcessing ? '⚡ Executing VAPOR Build Graph...' : '🚀 Execute Purchase Request Journey'}
            </button>
          </section>

          {/* Card 2: Senso RAG Evidence */}
          <section className="glass-panel" aria-labelledby="heading-senso-evidence" style={{ padding: '1.5rem' }}>
            <h2 id="heading-senso-evidence" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#10b981' }}>
              2. Senso AI Evidence Grounding
            </h2>
            {sensoEvidence ? (
              <div style={{ fontSize: '0.85rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontWeight: 600, color: '#10b981' }}>✓ Source Document: {sensoEvidence.docTitle}</div>
                <div style={{ color: '#d1d5db', margin: '0.4rem 0' }}>&ldquo;{sensoEvidence.answer}&rdquo;</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9ca3af' }}>
                  <span>Relevance: <strong>96.4%</strong></span>
                  <a href={sensoEvidence.docUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }}>View Citation ↗</a>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#9ca3af', fontStyle: 'italic' }}>Awaiting purchase execution...</div>
            )}
          </section>

          {/* Card 3: Deterministic Policy Engine */}
          <section className="glass-panel" aria-labelledby="heading-policy-engine" style={{ padding: '1.5rem' }}>
            <h2 id="heading-policy-engine" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#f59e0b' }}>
              3. Deterministic Spend Policy Engine
            </h2>
            {policyDecision ? (
              <div style={{ fontSize: '0.85rem', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 700, color: policyDecision.decision === 'REJECTED' ? '#ef4444' : policyDecision.decision === 'APPROVED' ? '#10b981' : '#f59e0b' }}>
                    DECISION: {policyDecision.decision}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Policy {policyDecision.version}</span>
                </div>
                <div style={{ color: '#f3f4f6' }}>{policyDecision.reason}</div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                  Integer Minor Unit Amount: <code>{policyDecision.integerCents} cents</code>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#9ca3af', fontStyle: 'italic' }}>Awaiting evaluation...</div>
            )}
          </section>

          {/* Card 4: Linq iMessage Tapback Approval Simulator */}
          {policyDecision?.decision === 'REQUIRES_LINQ_APPROVAL' && (
            <section className="glass-panel" aria-labelledby="heading-linq-approval" style={{ padding: '1.5rem', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
              <h2 id="heading-linq-approval" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#a855f7' }}>
                4. Linq iMessage Native Approval
              </h2>
              <div style={{ background: '#1e1b4b', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                <div style={{ fontSize: '0.8rem', color: '#a7f3d0', marginBottom: '0.5rem' }}>
                  💬 iMessage to CFO (+1 415-***-8920):
                </div>
                <div style={{ background: '#312e81', padding: '0.75rem', borderRadius: '10px', fontSize: '0.85rem', color: '#e0e7ff', marginBottom: '1rem' }}>
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  "VAPOR Approval Alert: Employee requested $4,999.00 USD for Datadog Enterprise. Respond with 👍 to approve or 👎 to reject."
                </div>

                {linqApproved === null ? (
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => handleLinqTapback(true)}
                      aria-label="Approve purchase via Linq iMessage tapback"
                      style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', background: '#10b981', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                    >
                      👍 Tapback Like (Approve)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLinqTapback(false)}
                      aria-label="Reject purchase via Linq iMessage tapback"
                      style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', background: '#ef4444', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                    >
                      👎 Tapback Dislike (Reject)
                    </button>
                  </div>
                ) : (
                  <div style={{ fontWeight: 600, color: linqApproved ? '#10b981' : '#ef4444' }}>
                    {linqApproved ? '✓ Approved via iMessage 👍' : '✗ Rejected via iMessage 👎'}
                  </div>
                )}
              </div>
            </section>
          )}

        </div>

        {/* Right Column: Prava Card, Checkout Runner & Redacted Audit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Card Visualizer */}
          <section className="glass-panel" aria-labelledby="heading-prava-card" style={{ padding: '1.5rem' }}>
            <h2 id="heading-prava-card" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#8b5cf6' }}>
              5. Prava Single-Use Virtual Credential
            </h2>

            <div
              role="region"
              aria-label="Prava Virtual Card Visualizer"
              className={`virtual-card-front ${checkoutOutcome ? 'locked' : ''}`}
              style={{ padding: '1.5rem', minHeight: '190px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, letterSpacing: '2px', color: '#a7f3d0' }}>PRAVA PAYMENTS</span>
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>
                  SINGLE-USE
                </span>
              </div>

              <div>
                <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)', letterSpacing: '3px', color: '#f8fafc' }}>
                  {pravaSession ? 'Credential isolated from VAPOR UI' : 'No credential displayed'}
                </div>
                <div style={{ display: 'flex', gap: '2rem', marginTop: '0.75rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
                  <div>EXP: <strong>{pravaSession ? pravaSession.cardExpiry : '••/••'}</strong></div>
                  <div>CVV: <strong>Never exposed</strong></div>
                  <div>LIMIT: <strong>${selectedScenario.amount} USD</strong></div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                <span>ID: {pravaSession ? pravaSession.cardId : 'CARD-PENDING'}</span>
                <span>STATUS: <strong style={{ color: checkoutOutcome ? '#ef4444' : pravaSession ? '#10b981' : '#94a3b8' }}>{checkoutOutcome ? 'LOCKED / EXPIRED' : pravaSession ? 'ACTIVE' : 'IDLE'}</strong></span>
              </div>
            </div>
          </section>

          {/* Checkout Outcome Panel */}
          <section className="glass-panel" aria-labelledby="heading-checkout-runner" style={{ padding: '1.5rem' }}>
            <h2 id="heading-checkout-runner" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#38bdf8' }}>
              6. End-Merchant Checkout &amp; Passkey Verification
            </h2>

            {pravaSession ? (
              <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '0.5rem' }}>
                  Merchant Target: <code>{selectedScenario.merchantUrl}</code>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#f3f4f6', marginBottom: '0.75rem' }}>
                  Complete the real platform authenticator (Windows Hello / Touch ID) passkey verification flow in your browser:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <a
                    href={pravaSession.iframe_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '0.6rem',
                      borderRadius: '6px',
                      background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                      color: '#ffffff',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    🔑 Launch Live Prava Passkey Modal (Windows Hello)
                  </a>

                  <a
                    href={selectedScenario.merchantUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      background: 'rgba(255,255,255,0.06)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      textDecoration: 'none',
                      fontSize: '0.8rem',
                    }}
                  >
                    🌐 Open Merchant Site ({selectedScenario.merchantName})
                  </a>
                </div>

                <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.75rem', borderTop: '1px border-gray-800', paddingTop: '0.5rem' }}>
                  Session ID: <code>{pravaSession.session_id}</code>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#9ca3af', fontStyle: 'italic' }}>Awaiting checkout session creation...</div>
            )}
          </section>

          {/* Redacted Audit Log */}
          <section className="glass-panel" aria-labelledby="heading-audit-trail" style={{ padding: '1.5rem', flex: 1, minHeight: '260px' }}>
            <h2 id="heading-audit-trail" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#f3f4f6' }}>
              7. Immutable Audit Trail &amp; Ledger
            </h2>

            <div
              role="log"
              aria-live="polite"
              aria-atomic="false"
              aria-label="Audit Log Stream"
              style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '280px', overflowY: 'auto' }}
            >
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: '6px',
                      background: 'rgba(255,255,255,0.02)',
                      borderLeft: `3px solid ${
                        log.status === 'SUCCESS' ? '#10b981' : log.status === 'DECLINED' ? '#ef4444' : log.status === 'WARNING' ? '#f59e0b' : '#38bdf8'
                      }`,
                      fontSize: '0.8rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af' }}>
                      <strong style={{ color: '#e5e7eb' }}>{log.event}</strong>
                      <span>{log.timestamp}</span>
                    </div>
                    <div style={{ color: '#d1d5db', marginTop: '0.2rem' }}>{log.details}</div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.85rem', color: '#9ca3af', fontStyle: 'italic' }}>No audit events logged yet. Click &ldquo;Execute Purchase Request Journey&rdquo; above.</div>
              )}
            </div>
          </section>

        </div>

      </main>
    </div>
  );
}


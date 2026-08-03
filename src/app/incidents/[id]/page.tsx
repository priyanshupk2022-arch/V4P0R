'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/shell/AppShell';

export default function IncidentDecisionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [primaryState, setPrimaryState] = useState<'review' | 'policy_check' | 'approval_sent' | 'prava' | 'completed'>('review');

  const handleAction = () => {
    if (primaryState === 'review') setPrimaryState('policy_check');
    else if (primaryState === 'policy_check') setPrimaryState('approval_sent');
    else if (primaryState === 'approval_sent') setPrimaryState('prava');
    else if (primaryState === 'prava') setPrimaryState('completed');
  };

  return (
    <AppShell activeTab="incidents">
      <div className="max-w-6xl mx-auto space-y-6 pb-20">
        
        {/* Header */}
        <div className="flex items-center gap-4 text-sm text-[#AAB4C5]">
          <Link href="/incidents" className="hover:text-[#F7F8FC]">Incidents</Link>
          <span>/</span>
          <span className="text-[#F7F8FC] font-mono">{id || 'INC-9082'}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Summary & Canvas */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Zone 1: Incident Summary */}
            <section className="bg-[#0F131C] border border-[#263044] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[#F7F8FC] mb-4">Incident Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-xs text-[#748095] mb-1">Merchant</div>
                  <div className="text-sm font-medium text-[#F7F8FC]">OpenAI API</div>
                </div>
                <div>
                  <div className="text-xs text-[#748095] mb-1">Item / Service</div>
                  <div className="text-sm font-medium text-[#F7F8FC]">GPT-4 Usage (June)</div>
                </div>
                <div>
                  <div className="text-xs text-[#748095] mb-1">Amount</div>
                  <div className="text-sm font-mono text-[#FFC857]">$4,200.00</div>
                </div>
                <div>
                  <div className="text-xs text-[#748095] mb-1">Employee</div>
                  <div className="text-sm font-medium text-[#F7F8FC]">Alice Chen (Eng)</div>
                </div>
                <div>
                  <div className="text-xs text-[#748095] mb-1">Budget</div>
                  <div className="text-sm font-medium text-[#F7F8FC]">Core Infra - $10k/mo</div>
                </div>
                <div>
                  <div className="text-xs text-[#748095] mb-1">Trigger</div>
                  <div className="text-sm font-medium text-[#FF6174]">Budget Exceeded</div>
                </div>
              </div>
            </section>

            {/* Zone 2: Decision Canvas */}
            <section className="bg-[#151B27] border border-[#3A4761] rounded-xl p-6 flex flex-col items-center text-center">
              <div className="mb-2">
                <span className={`inline-block px-3 py-1 rounded text-xs font-bold tracking-wider ${
                  primaryState === 'completed' ? 'bg-[#35E6B0]/10 text-[#35E6B0] border border-[#35E6B0]/30' :
                  'bg-[#7C5CFF]/10 text-[#7C5CFF] border border-[#7C5CFF]/30'
                }`}>
                  {primaryState === 'completed' ? 'APPROVED' : 'REQUIRES_LINQ_APPROVAL'}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-[#F7F8FC] mt-4 mb-2">
                {primaryState === 'completed' ? 'Purchase Approved' : 'Approval Required'}
              </h3>
              <p className="text-sm text-[#AAB4C5] max-w-md mx-auto mb-6">
                This transaction exceeds the monthly core infrastructure budget. Linq approval from engineering lead is required before provisioning a Prava virtual card.
              </p>

              <div className="text-xs text-[#748095] font-mono mb-6">
                Rule: policy_budget_enforcement_v2.1
              </div>

              <button
                onClick={handleAction}
                className="bg-[#7C5CFF] hover:bg-[#9279FF] text-white font-medium px-8 py-3 rounded-lg transition-colors shadow-sm"
              >
                {primaryState === 'review' && 'Run Policy Check'}
                {primaryState === 'policy_check' && 'Request Approval in iMessage'}
                {primaryState === 'approval_sent' && 'Continue with Prava'}
                {primaryState === 'prava' && 'Open Merchant Checkout'}
                {primaryState === 'completed' && 'View Final Audit Record'}
              </button>
            </section>
          </div>

          {/* Right Column: Zone 3 - Evidence Rail */}
          <div className="lg:col-span-4">
            <section className="bg-[#0F131C] border border-[#263044] rounded-xl p-6 h-full">
              <h2 className="text-lg font-semibold text-[#F7F8FC] mb-6">Evidence Rail</h2>
              
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-[#263044]">
                
                {/* 1. Intent */}
                <div className="relative flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#151B27] border-2 border-[#35E6B0] flex items-center justify-center shrink-0 mt-0.5 z-10" />
                  <div>
                    <div className="text-sm font-medium text-[#F7F8FC]">Intent</div>
                    <div className="text-xs text-[#AAB4C5] mt-1">Employee request verified</div>
                  </div>
                </div>

                {/* 2. Senso */}
                <div className="relative flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#151B27] border-2 border-[#35E6B0] flex items-center justify-center shrink-0 mt-0.5 z-10" />
                  <div>
                    <div className="text-sm font-medium text-[#F7F8FC]">Senso</div>
                    <div className="text-xs text-[#AAB4C5] mt-1">Policy documentation retrieved</div>
                    <div className="mt-2 text-xs font-mono text-[#748095] bg-[#1B2331] p-2 rounded">
                      relevance: 0.98 | doc: proc_infra
                    </div>
                  </div>
                </div>

                {/* 3. Policy */}
                <div className="relative flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#151B27] border-2 border-[#35E6B0] flex items-center justify-center shrink-0 mt-0.5 z-10" />
                  <div>
                    <div className="text-sm font-medium text-[#F7F8FC]">Policy</div>
                    <div className="text-xs text-[#AAB4C5] mt-1">Deterministic budget evaluation</div>
                  </div>
                </div>

                {/* 4. Linq */}
                <div className="relative flex items-start gap-4">
                  <div className={`w-6 h-6 rounded-full bg-[#151B27] border-2 flex items-center justify-center shrink-0 mt-0.5 z-10 ${
                    primaryState === 'review' || primaryState === 'policy_check' ? 'border-[#748095]' :
                    primaryState === 'approval_sent' ? 'border-[#FFC857]' : 'border-[#35E6B0]'
                  }`} />
                  <div>
                    <div className={`text-sm font-medium ${primaryState === 'review' ? 'text-[#748095]' : 'text-[#F7F8FC]'}`}>Linq</div>
                    {primaryState === 'approval_sent' && (
                      <div className="text-xs text-[#FFC857] mt-1">Waiting for assigned approver...</div>
                    )}
                    {(primaryState === 'prava' || primaryState === 'completed') && (
                      <div className="text-xs text-[#AAB4C5] mt-1">Approved by Lead (via iMessage)</div>
                    )}
                  </div>
                </div>

                {/* 5. Prava */}
                <div className="relative flex items-start gap-4">
                  <div className={`w-6 h-6 rounded-full bg-[#151B27] border-2 flex items-center justify-center shrink-0 mt-0.5 z-10 ${
                    primaryState === 'completed' ? 'border-[#35E6B0]' :
                    primaryState === 'prava' ? 'border-[#FFC857]' : 'border-[#748095]'
                  }`} />
                  <div>
                    <div className={`text-sm font-medium ${primaryState === 'completed' || primaryState === 'prava' ? 'text-[#F7F8FC]' : 'text-[#748095]'}`}>Prava</div>
                    {primaryState === 'completed' && (
                      <div className="text-xs text-[#AAB4C5] mt-1">Exact purchase authority created</div>
                    )}
                  </div>
                </div>

                {/* 6. Merchant */}
                <div className="relative flex items-start gap-4">
                  <div className={`w-6 h-6 rounded-full bg-[#151B27] border-2 flex items-center justify-center shrink-0 mt-0.5 z-10 ${
                    primaryState === 'completed' ? 'border-[#35E6B0]' : 'border-[#748095]'
                  }`} />
                  <div>
                    <div className={`text-sm font-medium ${primaryState === 'completed' ? 'text-[#F7F8FC]' : 'text-[#748095]'}`}>Merchant</div>
                    {primaryState === 'completed' && (
                      <div className="text-xs text-[#AAB4C5] mt-1">Expected sandbox decline recorded</div>
                    )}
                  </div>
                </div>

                {/* 7. Audit */}
                <div className="relative flex items-start gap-4">
                  <div className={`w-6 h-6 rounded-full bg-[#151B27] border-2 flex items-center justify-center shrink-0 mt-0.5 z-10 ${
                    primaryState === 'completed' ? 'border-[#35E6B0]' : 'border-[#748095]'
                  }`} />
                  <div>
                    <div className={`text-sm font-medium ${primaryState === 'completed' ? 'text-[#F7F8FC]' : 'text-[#748095]'}`}>Audit</div>
                    {primaryState === 'completed' && (
                      <div className="text-xs text-[#AAB4C5] mt-1">Immutable record published</div>
                    )}
                  </div>
                </div>
                
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

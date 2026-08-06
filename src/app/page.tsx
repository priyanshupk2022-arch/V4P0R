"use client";

import React, { useState, useEffect } from 'react';
import { TopNav } from '@/components/ui/TopNav';
import { TransactionRow, Transaction } from '@/components/ui/TransactionRow';
import { SlideOverDrawer } from '@/components/ui/SlideOverDrawer';
import { PolicyRationale } from '@/components/ui/PolicyRationale';
import { TransparencyBanner } from '@/components/ui/TransparencyBanner';
import { ExceptionRecoveryFlow } from '@/components/ui/ExceptionRecoveryFlow';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { getIncidentsAdapter } from '@/adapters/incidents';

export default function CommandCenter() {
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getIncidentsAdapter();
        const mapped: Transaction[] = data.map(inc => ({
          id: inc.id,
          statusLevel: (inc.severity === 'CRITICAL' || inc.severity === 'HIGH') ? 'HIGH' : inc.severity === 'MEDIUM' ? 'MEDIUM' : 'LOW',
          statusLabel: inc.status.toUpperCase().replace('_', ' '),
          rationale: inc.trigger,
          merchant: inc.merchant,
          requester: inc.employee,
          amount: inc.amount / 100, // Convert cents to dollars
          age: inc.age
        }));
        setTransactions(mapped);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const selectedTx = transactions.find(t => t.id === selectedTxId);

  return (
    <div className="min-h-screen bg-surface-base flex flex-col font-sans">
      <TopNav />
      
      <main className="flex-1 p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary mb-1">Command Center</h1>
            <p className="text-text-neutral text-sm">Real-time spend governance and policy enforcement.</p>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Cmd+K Search..." 
              className="bg-surface-card border border-text-neutral/20 rounded-sm px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-text-neutral/50 w-full md:w-64"
            />
          </div>
        </header>

        {/* Macro KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'TOTAL SPEND (Q3)', value: '$184,200.00' },
            { label: 'ACTIVE VIRTUAL CARDS', value: '42 Active' },
            { label: 'PENDING APPROVALS', value: '3 Needs Action' },
            { label: 'POLICY ALERTS', value: '1 Exception' }
          ].map(kpi => (
            <div key={kpi.label} className="bg-surface-card p-5 rounded-md border border-text-neutral/10 shadow-soft">
              <h3 className="text-xs font-semibold text-text-neutral mb-2 tracking-wider">{kpi.label}</h3>
              <div className="text-2xl font-medium text-text-primary tabular-nums">{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* Transaction Table */}
        <div className="bg-surface-card rounded-md border border-text-neutral/10 shadow-soft overflow-hidden">
          <div className="px-6 py-4 border-b border-text-neutral/10 flex items-center justify-between">
            <h2 className="font-semibold text-text-primary">Transaction Feed</h2>
            <select className="bg-transparent text-sm text-text-neutral font-medium focus:outline-none">
              <option>Filter: All Teams</option>
            </select>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-text-neutral/10 bg-surface-base/50">
                  <th className="py-3 px-4 text-xs font-semibold text-text-neutral uppercase tracking-wider w-32">Status</th>
                  <th className="py-3 px-4 text-xs font-semibold text-text-neutral uppercase tracking-wider">Merchant</th>
                  <th className="py-3 px-4 text-xs font-semibold text-text-neutral uppercase tracking-wider">Requester</th>
                  <th className="py-3 px-4 text-xs font-semibold text-text-neutral uppercase tracking-wider text-right">Amount ($)</th>
                  <th className="py-3 px-4 text-xs font-semibold text-text-neutral uppercase tracking-wider">Policy Check</th>
                  <th className="py-3 px-4 text-xs font-semibold text-text-neutral uppercase tracking-wider text-right">Age</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-text-neutral/10 last:border-b-0">
                      <td className="py-3 px-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-32" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-24" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-20 ml-auto" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-24" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-12 ml-auto" /></td>
                    </tr>
                  ))
                ) : transactions.length > 0 ? (
                  transactions.map(tx => (
                    <TransactionRow 
                      key={tx.id} 
                      transaction={tx} 
                      onClick={(id) => setSelectedTxId(id)} 
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-0 border-b-0">
                      <EmptyState 
                        title="No transactions found" 
                        message="Try adjusting your filters or search query." 
                        className="border-none rounded-none shadow-none bg-transparent"
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <SlideOverDrawer 
        isOpen={!!selectedTx} 
        onClose={() => setSelectedTxId(null)}
        title="Transaction Details"
      >
        {selectedTx && (
          <div className="flex flex-col gap-6 h-full pb-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-text-neutral mb-1">Merchant</div>
                <div className="text-xl font-medium text-text-primary">{selectedTx.merchant}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-text-neutral mb-1">Amount</div>
                <div className="text-xl font-medium text-text-primary tabular-nums">
                  ${selectedTx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            
            <PolicyRationale 
              level={selectedTx.statusLevel} 
              rationale={selectedTx.rationale} 
            />

            {selectedTx.statusLevel === 'HIGH' ? (
              <TransparencyBanner status="none" message="No funds were deducted from your account." />
            ) : selectedTx.statusLevel === 'MEDIUM' ? (
              <TransparencyBanner status="held" message={`Funds ($${selectedTx.amount.toLocaleString()}) are currently held as pending.`} />
            ) : null}

            {selectedTx.statusLevel === 'HIGH' && (
              <ExceptionRecoveryFlow onOverrideRequest={() => alert('Override Requested')} />
            )}

            {selectedTx.statusLevel === 'LOW' ? (
              <div className="mt-auto border-t border-text-neutral/10 pt-6">
                <div className="bg-status-success/10 text-status-success p-3 rounded-md text-center font-medium text-sm">
                  ✓ Auto-approved per policy
                </div>
              </div>
            ) : selectedTx.statusLevel !== 'HIGH' ? (
              <div className="mt-auto border-t border-text-neutral/10 pt-6 flex gap-3">
                <Button variant="approve" className="flex-1">Approve</Button>
                <Button variant="block" className="flex-1">Block</Button>
              </div>
            ) : null}
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { 
  getSubscriptionsAdapter, 
  getEmployeesAdapter, 
  getRenewalsAdapter,
  Subscription,
  Employee,
  Renewal
} from '@/adapters';
import { TelemetryPanel } from '@/components/ui/TelemetryPanel';

export default function SpendPage() {
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    async function load() {
      const subs = await getSubscriptionsAdapter();
      const emps = await getEmployeesAdapter();
      const rens = await getRenewalsAdapter();
      setSubscriptions(subs);
      setEmployees(emps);
      setRenewals(rens);
    }
    load();
  }, []);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
  };

  const getCloudVelocitySpike = () => {
    return subscriptions.find(s => s.isCloud && s.velocity && s.velocity > 100);
  };

  const spike = getCloudVelocitySpike();

  const handleEmployeeClick = (emp: Employee) => {
    if (emp.status === 'OFFBOARDING' || emp.status === 'ACTIVE') {
      setSelectedEmployee(emp);
    }
  };

  return (
    <div className="min-h-screen bg-surface-card text-zinc-300 p-8 text-sm">
      <TelemetryPanel title="SPEND & INVENTORY TACTICAL OVERVIEW">
        <header className="mb-8 border-b border-text-neutral/20 pb-4">
          <h1 className="text-2xl font-bold text-white mb-2">SPEND & INVENTORY</h1>
          <p className="text-zinc-500">MANAGE SUBSCRIPTIONS, CLOUD INFRASTRUCTURE, AND OFFBOARDING IMPACT.</p>
        </header>

        {spike && (
          <div className="border border-red-900 bg-red-950/20 p-4 mb-8 flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <div className="text-red-500 font-bold text-xl">⚠️</div>
              <div>
                <p className="text-red-500 font-bold">CLOUD VELOCITY ALERT: {spike.vendor}</p>
                <p className="text-red-400">
                  SENSO POLICY TRIGGERED: +{spike.velocity}% VELOCITY SPIKE IN API SPEND BY {spike.owner}.
                </p>
              </div>
            </div>
            <button className="border border-red-500 text-red-500 px-4 py-2 hover:bg-red-500 hover:text-black transition-colors">
              REVIEW & ENFORCE
            </button>
          </div>
        )}

        <div className="flex border-b border-text-neutral/20 mb-6">
          {['subscriptions', 'cloud', 'employees', 'renewals'].map(tab => (
            <button 
              key={tab}
              className={`px-6 py-3 border-r border-text-neutral/20 ${activeTab === tab ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:bg-surface-base'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="border border-text-neutral/20 bg-surface-card">
          {activeTab === 'subscriptions' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-text-neutral/20 bg-surface-base">
                  <th className="p-4 font-normal text-zinc-400">VENDOR</th>
                  <th className="p-4 font-normal text-zinc-400">CATEGORY</th>
                  <th className="p-4 font-normal text-zinc-400">OWNER</th>
                  <th className="p-4 font-normal text-zinc-400 text-right">AMOUNT</th>
                  <th className="p-4 font-normal text-zinc-400">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.filter(s => !s.isCloud).map(s => (
                  <tr key={s.id} className="border-b border-text-neutral/10 hover:bg-surface-base transition-colors">
                    <td className="p-4">
                      <div className="text-white font-bold">{s.vendor}</div>
                      <div className="text-[10px] text-zinc-500">{s.plan}</div>
                    </td>
                    <td className="p-4">{s.category}</td>
                    <td className="p-4">{s.owner}</td>
                    <td className="p-4 text-right">{formatCurrency(s.amountCents)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] border ${s.status === 'ACTIVE' ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-yellow-900/30 text-yellow-400 border-yellow-800'}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'cloud' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-text-neutral/20 bg-surface-base">
                  <th className="p-4 font-normal text-zinc-400">VENDOR</th>
                  <th className="p-4 font-normal text-zinc-400">OWNER</th>
                  <th className="p-4 font-normal text-zinc-400">VELOCITY</th>
                  <th className="p-4 font-normal text-zinc-400 text-right">AMOUNT</th>
                  <th className="p-4 font-normal text-zinc-400">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.filter(s => s.isCloud).map(s => (
                  <tr key={s.id} className="border-b border-text-neutral/10 hover:bg-surface-base transition-colors">
                    <td className="p-4">
                      <div className="text-white font-bold">{s.vendor}</div>
                      <div className="text-[10px] text-zinc-500">{s.plan}</div>
                    </td>
                    <td className="p-4">{s.owner}</td>
                    <td className="p-4">
                      <span className={s.velocity && s.velocity > 100 ? 'text-red-500' : 'text-zinc-300'}>
                        +{s.velocity}%
                      </span>
                    </td>
                    <td className="p-4 text-right">{formatCurrency(s.amountCents)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] border ${s.status === 'ACTIVE' ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-yellow-900/30 text-yellow-400 border-yellow-800'}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'employees' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-text-neutral/20 bg-surface-base">
                  <th className="p-4 font-normal text-zinc-400">EMPLOYEE</th>
                  <th className="p-4 font-normal text-zinc-400">ROLE / DEPT</th>
                  <th className="p-4 font-normal text-zinc-400">SUBSCRIPTIONS</th>
                  <th className="p-4 font-normal text-zinc-400 text-right">MONTHLY SPEND</th>
                  <th className="p-4 font-normal text-zinc-400">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr 
                    key={emp.id} 
                    className={`border-b border-text-neutral/10 ${emp.status !== 'OFFBOARDED' ? 'cursor-pointer hover:bg-surface-base' : ''}`} 
                    onClick={() => handleEmployeeClick(emp)}
                  >
                    <td className="p-4 font-bold text-white">{emp.name}</td>
                    <td className="p-4">
                      {emp.role}
                      <div className="text-[10px] text-zinc-500">{emp.department}</div>
                    </td>
                    <td className="p-4">{emp.subscriptionsCount}</td>
                    <td className="p-4 text-right">{formatCurrency(emp.monthlySpendCents)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] border ${
                        emp.status === 'ACTIVE' ? 'bg-green-900/30 text-green-400 border-green-800' : 
                        emp.status === 'OFFBOARDING' ? 'bg-red-900/30 text-red-400 border-red-800' : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'renewals' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-text-neutral/20 bg-surface-base">
                  <th className="p-4 font-normal text-zinc-400">VENDOR</th>
                  <th className="p-4 font-normal text-zinc-400">RENEWAL DATE</th>
                  <th className="p-4 font-normal text-zinc-400 text-right">AMOUNT</th>
                  <th className="p-4 font-normal text-zinc-400">BUCKET</th>
                  <th className="p-4 font-normal text-zinc-400">DECISION</th>
                </tr>
              </thead>
              <tbody>
                {renewals.map(ren => (
                  <tr key={ren.id} className="border-b border-text-neutral/10 hover:bg-surface-base">
                    <td className="p-4">
                      <div className="text-white font-bold">{ren.vendor}</div>
                      <div className="text-[10px] text-zinc-500">{ren.plan}</div>
                    </td>
                    <td className="p-4">
                      {ren.renewalDate}
                      {ren.isDeadlineClose && <div className="text-[10px] text-red-500">NOTICE DEADLINE: {ren.noticeDeadline}</div>}
                    </td>
                    <td className="p-4 text-right">{formatCurrency(ren.amountCents)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] border ${
                        ren.bucket === 'OVERDUE' ? 'bg-red-900/30 text-red-400 border-red-800' :
                        ren.bucket === 'NEXT 7 DAYS' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800' : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                      }`}>
                        {ren.bucket}
                      </span>
                    </td>
                    <td className="p-4">{ren.decisionStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </TelemetryPanel>

      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEmployee(null)}>
          <TelemetryPanel title={`OFFBOARDING SIMULATOR - ${selectedEmployee.name}`} className="w-full max-w-2xl bg-surface-card border border-text-neutral/20 shadow-2xl p-0">
            <div onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center border-b border-text-neutral/20 p-4 bg-surface-base">
                <h2 className="text-lg font-bold text-white">IMPACT: {selectedEmployee.name}</h2>
                <button className="text-zinc-500 hover:text-white text-xl" onClick={() => setSelectedEmployee(null)}>&times;</button>
              </div>
              <div className="p-6">
                <p className="text-zinc-400 text-xs mb-6 border-l-2 border-zinc-500 pl-4">
                  SIMULATING OFFBOARDING FOR {selectedEmployee.name} ({selectedEmployee.role}). 
                  THE FOLLOWING RESOURCES WILL BE IMPACTED IMMEDIATELY:
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="border border-text-neutral/20 bg-surface-card p-4 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-white mb-2">{selectedEmployee.impactPreview?.activeCards || 0}</div>
                    <div className="text-[10px] text-zinc-500 text-center">VIRTUAL CARDS TO FREEZE</div>
                  </div>
                  <div className="border border-text-neutral/20 bg-surface-card p-4 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-white mb-2">{selectedEmployee.subscriptionsCount}</div>
                    <div className="text-[10px] text-zinc-500 text-center">SOFTWARE LICENSES TO REVOKE</div>
                  </div>
                  <div className="border border-text-neutral/20 bg-surface-card p-4 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-white mb-2">{selectedEmployee.impactPreview?.upcomingRenewals || 0}</div>
                    <div className="text-[10px] text-zinc-500 text-center">UPCOMING RENEWALS HALTED</div>
                  </div>
                  <div className="border border-text-neutral/20 bg-surface-card p-4 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-white mb-2">{selectedEmployee.impactPreview?.pendingApprovals || 0}</div>
                    <div className="text-[10px] text-zinc-500 text-center">PENDING APPROVALS REASSIGNED</div>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button className="px-6 py-2 border border-text-neutral/20 text-zinc-400 hover:bg-surface-base hover:text-white transition-colors" onClick={() => setSelectedEmployee(null)}>
                    ABORT
                  </button>
                  <button className="px-6 py-2 bg-red-600 text-white font-bold hover:bg-red-500 transition-colors">
                    EXECUTE OFFBOARDING
                  </button>
                </div>
              </div>
            </div>
          </TelemetryPanel>
        </div>
      )}
    </div>
  );
}

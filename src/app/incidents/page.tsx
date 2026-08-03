'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/shell/AppShell';

// Mock data based on requirements
const mockIncidents = [
  {
    id: 'INC-9082',
    severity: 'high',
    merchant: 'AWS',
    employee: 'Alice Chen',
    amount: '$14,200.00',
    trigger: 'API Spike',
    state: 'Blocked',
    deadline: '2h remaining',
  },
  {
    id: 'INC-9083',
    severity: 'medium',
    merchant: 'Figma',
    employee: 'Bob Smith',
    amount: '$1,200.00',
    trigger: 'Unrecognized Vendor',
    state: 'Needs Review',
    deadline: '24h remaining',
  },
  {
    id: 'INC-9084',
    severity: 'low',
    merchant: 'GitHub',
    employee: 'Charlie Day',
    amount: '$40.00',
    trigger: 'Policy Match',
    state: 'Approved',
    deadline: 'Completed',
  }
];

export default function IncidentsPage() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = mockIncidents.filter((inc) => {
    if (filter !== 'All' && inc.state !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        inc.merchant.toLowerCase().includes(q) ||
        inc.employee.toLowerCase().includes(q) ||
        inc.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AppShell activeTab="incidents">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-24px font-bold text-[#F7F8FC]">Incident Queue</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by merchant, employee, or ID..."
              className="bg-[#151B27] border border-[#263044] rounded-lg px-4 py-2 text-sm text-[#F7F8FC] placeholder-[#748095] focus:outline-none focus:border-[#7C5CFF]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {['All', 'Needs Review', 'Blocked', 'Approved', 'Failed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border ${
                filter === f
                  ? 'bg-[#1B2331] text-[#F7F8FC] border-[#3A4761]'
                  : 'bg-transparent text-[#AAB4C5] border-[#263044] hover:border-[#3A4761]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="bg-[#0F131C] border border-[#263044] rounded-xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-[#AAB4C5]">No incidents found.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-[#151B27] text-[#748095] border-b border-[#263044]">
                <tr>
                  <th className="px-6 py-4 font-medium">Severity</th>
                  <th className="px-6 py-4 font-medium">Merchant</th>
                  <th className="px-6 py-4 font-medium">Employee</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Trigger</th>
                  <th className="px-6 py-4 font-medium">State</th>
                  <th className="px-6 py-4 font-medium">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#263044]">
                {filtered.map((inc) => (
                  <tr key={inc.id} className="hover:bg-[#151B27] transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        inc.severity === 'high' ? 'bg-[#FF6174]' :
                        inc.severity === 'medium' ? 'bg-[#FFC857]' : 'bg-[#35E6B0]'
                      }`} />
                    </td>
                    <td className="px-6 py-4 text-[#F7F8FC] font-medium">
                      <Link href={`/incidents/${inc.id}`} className="hover:text-[#7C5CFF]">
                        {inc.merchant}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-[#AAB4C5]">{inc.employee}</td>
                    <td className="px-6 py-4 text-[#F7F8FC] font-mono">{inc.amount}</td>
                    <td className="px-6 py-4 text-[#AAB4C5]">{inc.trigger}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${
                        inc.state === 'Blocked' ? 'text-[#FF6174] border-[#FF6174]/30 bg-[#FF6174]/10' :
                        inc.state === 'Approved' ? 'text-[#35E6B0] border-[#35E6B0]/30 bg-[#35E6B0]/10' :
                        'text-[#FFC857] border-[#FFC857]/30 bg-[#FFC857]/10'
                      }`}>
                        {inc.state}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#748095] text-xs">{inc.deadline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppShell>
  );
}

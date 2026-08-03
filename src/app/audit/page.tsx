'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type Provider = 'All' | 'Senso' | 'Linq' | 'Prava' | 'Policy Engine';
type Status = 'All' | 'SUCCESS' | 'BLOCKED' | 'WARNING' | 'ERROR';

interface AuditEvent {
  id: string;
  timestamp: string;
  correlationId: string;
  actor: string;
  event: string;
  result: Status;
  reference: string;
  merchant?: string;
  employee?: string;
}

const mockEvents: AuditEvent[] = [
  {
    id: 'evt_1',
    timestamp: '2026-08-03T02:15:22Z',
    correlationId: 'cor_88f92a',
    actor: 'Senso',
    event: 'Policy Retrieval',
    result: 'SUCCESS',
    reference: 'doc_req_***992',
    merchant: 'AWS',
    employee: 'alice@acme.com',
  },
  {
    id: 'evt_2',
    timestamp: '2026-08-03T02:15:23Z',
    correlationId: 'cor_88f92a',
    actor: 'Policy Engine',
    event: 'Decision Evaluation',
    result: 'WARNING',
    reference: 'rule_v4_***',
    merchant: 'AWS',
    employee: 'alice@acme.com',
  },
  {
    id: 'evt_3',
    timestamp: '2026-08-03T02:18:05Z',
    correlationId: 'cor_88f92a',
    actor: 'Linq',
    event: 'Manager Approval',
    result: 'SUCCESS',
    reference: 'msg_auth_***711',
    merchant: 'AWS',
    employee: 'alice@acme.com',
  },
  {
    id: 'evt_4',
    timestamp: '2026-08-03T02:18:06Z',
    correlationId: 'cor_88f92a',
    actor: 'Prava',
    event: 'Issue Virtual Card',
    result: 'SUCCESS',
    reference: 'crd_iss_***882',
    merchant: 'AWS',
    employee: 'alice@acme.com',
  },
  {
    id: 'evt_5',
    timestamp: '2026-08-03T04:22:10Z',
    correlationId: 'cor_99b11c',
    actor: 'Policy Engine',
    event: 'Decision Evaluation',
    result: 'BLOCKED',
    reference: 'rule_v2_***',
    merchant: 'RogueMerchant',
    employee: 'bob@acme.com',
  },
];

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState<Provider>('All');
  const [statusFilter, setStatusFilter] = useState<Status>('All');

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mockEvents, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "audit_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleExportCSV = () => {
    const header = ['timestamp', 'correlationId', 'actor', 'event', 'result', 'reference'];
    const rows = mockEvents.map(e => [
      e.timestamp, e.correlationId, e.actor, e.event, e.result, e.reference
    ].join(','));
    const csvStr = "data:text/csv;charset=utf-8," + encodeURIComponent([header.join(','), ...rows].join('\n'));
    
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", csvStr);
    downloadAnchorNode.setAttribute("download", "audit_export.csv");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const filteredEvents = mockEvents.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = 
      e.correlationId.toLowerCase().includes(q) ||
      e.merchant?.toLowerCase().includes(q) ||
      e.employee?.toLowerCase().includes(q) ||
      e.actor.toLowerCase().includes(q);

    const matchProvider = providerFilter === 'All' || e.actor === providerFilter;
    const matchStatus = statusFilter === 'All' || e.result === statusFilter;

    return matchSearch && matchProvider && matchStatus;
  });

  const getStatusColor = (status: Status) => {
    switch(status) {
      case 'SUCCESS': return 'text-[#35E6B0] border-[#35E6B0]/20 bg-[#35E6B0]/10';
      case 'BLOCKED': return 'text-[#FF6174] border-[#FF6174]/20 bg-[#FF6174]/10';
      case 'ERROR': return 'text-[#FF6174] border-[#FF6174]/20 bg-[#FF6174]/10';
      case 'WARNING': return 'text-[#FFC857] border-[#FFC857]/20 bg-[#FFC857]/10';
      default: return 'text-[#AAB4C5] border-[#263044] bg-[#151B27]';
    }
  };

  return (
    <AppShell activeTab="audit">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#F7F8FC] font-sans">Audit Trail</h1>
            <p className="text-sm text-[#AAB4C5] mt-1">Immutable session activity and decision records</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={handleExportCSV}>Export CSV</Button>
            <Button variant="secondary" onClick={handleExportJSON}>Export JSON</Button>
          </div>
        </div>

        <Card className="p-4 bg-[#0F131C] border-[#263044] rounded-xl flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <input 
              type="text" 
              placeholder="Search correlation ID, merchant, employee..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#151B27] border border-[#263044] rounded-lg px-4 py-2 text-sm text-[#F7F8FC] placeholder:text-[#748095] focus:outline-none focus:border-[#7C5CFF]"
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <select 
              value={providerFilter} 
              onChange={e => setProviderFilter(e.target.value as Provider)}
              className="bg-[#151B27] border border-[#263044] rounded-lg px-4 py-2 text-sm text-[#F7F8FC] focus:outline-none focus:border-[#7C5CFF]"
            >
              <option value="All">All Providers</option>
              <option value="Senso">Senso</option>
              <option value="Linq">Linq</option>
              <option value="Prava">Prava</option>
              <option value="Policy Engine">Policy Engine</option>
            </select>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value as Status)}
              className="bg-[#151B27] border border-[#263044] rounded-lg px-4 py-2 text-sm text-[#F7F8FC] focus:outline-none focus:border-[#7C5CFF]"
            >
              <option value="All">All Statuses</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="BLOCKED">BLOCKED</option>
              <option value="WARNING">WARNING</option>
              <option value="ERROR">ERROR</option>
            </select>
          </div>
        </Card>

        <div className="bg-[#0F131C] border border-[#263044] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#151B27] border-b border-[#263044] text-[#AAB4C5]">
                <tr>
                  <th className="px-6 py-4 font-medium">Timestamp</th>
                  <th className="px-6 py-4 font-medium">Correlation ID</th>
                  <th className="px-6 py-4 font-medium">Actor / Provider</th>
                  <th className="px-6 py-4 font-medium">Event</th>
                  <th className="px-6 py-4 font-medium">Result</th>
                  <th className="px-6 py-4 font-medium">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#263044]">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#748095]">
                      No audit records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map(evt => (
                    <tr key={evt.id} className="hover:bg-[#151B27]/50 transition-colors">
                      <td className="px-6 py-4 text-[#AAB4C5] font-mono text-xs">{evt.timestamp}</td>
                      <td className="px-6 py-4 text-[#F7F8FC] font-mono text-xs">{evt.correlationId}</td>
                      <td className="px-6 py-4 text-[#F7F8FC]">{evt.actor}</td>
                      <td className="px-6 py-4 text-[#F7F8FC]">{evt.event}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(evt.result)}`}>
                          {evt.result}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#AAB4C5] font-mono text-xs">
                        {evt.reference}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

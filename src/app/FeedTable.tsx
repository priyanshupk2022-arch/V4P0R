'use client';

import React, { useState } from 'react';
import { SlideOverDrawer } from '@/components/ui/SlideOverDrawer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { IncidentData } from '@/adapters/incidents';

export function FeedTable({ incidents }: { incidents: IncidentData[] }) {
  const [selectedIncident, setSelectedIncident] = useState<IncidentData | null>(null);

  const handleRowClick = (incident: IncidentData) => {
    setSelectedIncident(incident);
  };

  const closeDrawer = () => {
    setSelectedIncident(null);
  };

  const mapStatusToBadge = (status: string) => {
    switch (status) {
      case 'needs_review': return 'NEEDS REVIEW';
      case 'blocked': return 'BLOCKED';
      case 'approved': return 'PASSED';
      default: return 'ACTIVE';
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <>
      <div className="w-full overflow-x-auto text-[10px] uppercase ">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="bg-surface-base text-text-neutral border-b border-text-neutral/20">
            <tr>
              <th className="px-3 py-2 font-normal border-r border-text-neutral/10">STS</th>
              <th className="px-3 py-2 font-normal border-r border-text-neutral/10">MERCHANT</th>
              <th className="px-3 py-2 font-normal border-r border-text-neutral/10">EMPLOYEE</th>
              <th className="px-3 py-2 font-normal border-r border-text-neutral/10">REASON</th>
              <th className="px-3 py-2 font-normal text-right border-r border-text-neutral/10">AMT</th>
              <th className="px-3 py-2 font-normal text-right">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((inc) => (
              <tr 
                key={inc.id} 
                onClick={() => handleRowClick(inc)}
                className="border-b border-text-neutral/10 hover:bg-surface-base cursor-pointer text-text-neutral group transition-none"
              >
                <td className="px-3 py-2 border-r border-text-neutral/10">
                  <Badge status={mapStatusToBadge(inc.status) as any} />
                </td>
                <td className="px-3 py-2 border-r border-text-neutral/10 text-text-primary font-bold tracking-wider group-hover:text-accent-critical-critical">{inc.merchant}</td>
                <td className="px-3 py-2 border-r border-text-neutral/10 text-text-neutral">{inc.employee}</td>
                <td className="px-3 py-2 border-r border-text-neutral/10 text-text-neutral/80 max-w-[200px] truncate" title={inc.trigger}>{inc.trigger}</td>
                <td className="px-3 py-2 border-r border-text-neutral/10 text-right text-text-primary font-bold tracking-widest">{formatCurrency(inc.amount)}</td>
                <td className="px-3 py-2 text-right">
                  {inc.status === 'needs_review' && (
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" onClick={(e) => { e.stopPropagation(); }} className="!px-2 !py-0.5 !text-[10px] !rounded-none">REQ.INFO</Button>
                      <Button variant="primary" onClick={(e) => { e.stopPropagation(); }} className="!px-2 !py-0.5 !text-[10px] !rounded-none bg-status-success text-black border-status-success hover:bg-white">APPROVE</Button>
                    </div>
                  )}
                  {inc.status === 'blocked' && (
                    <Button variant="hazard" onClick={(e) => { e.stopPropagation(); }} className="!px-2 !py-0.5 !text-[10px] !rounded-none">OVERRIDE</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SlideOverDrawer 
        isOpen={!!selectedIncident} 
        onClose={closeDrawer} 
        title={selectedIncident ? `SYS.LOG_ID: ${selectedIncident.id}` : ''}
      >
        {selectedIncident && (
          <div className="space-y-6 text-xs text-text-neutral uppercase tracking-widest">
            <div className="border border-text-neutral/20 p-4 bg-surface-card">
              <h3 className="text-text-primary font-bold mb-3 border-b border-text-neutral/20 pb-2">{"/// TARGET.DATA"}</h3>
              <p className="flex justify-between py-1 border-b border-text-neutral/10"><span>MERCHANT</span> <span className="text-text-primary">{selectedIncident.merchant}</span></p>
              <p className="flex justify-between py-1 border-b border-text-neutral/10"><span>AMOUNT</span> <span className="text-terminal font-bold">{formatCurrency(selectedIncident.amount)}</span></p>
              <p className="flex justify-between py-1 border-b border-text-neutral/10"><span>EMPLOYEE</span> <span className="text-text-neutral">{selectedIncident.employee}</span></p>
              <p className="flex justify-between py-1 border-b border-text-neutral/10"><span>AGE</span> <span className="text-text-neutral">{selectedIncident.age}</span></p>
            </div>
            
            <div className="border border-text-neutral/20 p-4 bg-accent-critical-critical/10">
              <h3 className="text-accent-critical font-bold mb-3 flex items-center gap-2 border-b border-text-neutral/20 pb-2">
                [!] SENSO.EVAL_RESULT
              </h3>
              <p className="text-status-error leading-relaxed font-bold">
                &gt; {selectedIncident.trigger}
              </p>
            </div>

            <div className="border border-text-neutral/20 p-4 bg-surface-card">
              <h3 className="text-text-primary font-bold mb-3 border-b border-text-neutral/20 pb-2">{"/// PROVIDER.STATUS"}</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1 border-b border-text-neutral/10">
                  <span>SENSO (AI CHECK)</span>
                  <Badge status={selectedIncident.providers.senso === 'completed' ? 'PASSED' : 'NEEDS REVIEW'} />
                </div>
                <div className="flex justify-between items-center py-1 border-b border-text-neutral/10">
                  <span>LINQ (COMMS)</span>
                  <Badge status={selectedIncident.providers.linq === 'completed' ? 'PASSED' : 'NEEDS REVIEW'} />
                </div>
                <div className="flex justify-between items-center py-1 border-b border-text-neutral/10">
                  <span>PRAVA (CARD LIMIT)</span>
                  <Badge status={selectedIncident.providers.prava === 'completed' ? 'PASSED' : selectedIncident.providers.prava === 'error' ? 'BLOCKED' : 'NEEDS REVIEW'} />
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button variant="primary" className="flex-1 !rounded-none !text-xs tracking-widest bg-surface-base border-text-neutral/40 text-white hover:bg-accent-critical hover:border-accent-critical" onClick={closeDrawer}>
                [ ACKNOWLEDGE_LOG ]
              </Button>
            </div>
          </div>
        )}
      </SlideOverDrawer>
    </>
  );
}

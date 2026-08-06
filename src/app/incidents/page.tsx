import Link from 'next/link';
import { TelemetryPanel } from '@/components/ui/TelemetryPanel';
import { Badge } from '@/components/ui/Badge';

const incidents = [
  { id: 'inc_01', severity: 'CRITICAL', merchant: 'AWS', amount: '$5,400', status: 'Needs Review', providerStatus: { senso: 'error', linq: 'pending', prava: 'pending' } },
  { id: 'inc_02', severity: 'HIGH', merchant: 'Stripe', amount: '$1,200', status: 'Blocked', providerStatus: { senso: 'ok', linq: 'error', prava: 'pending' } },
  { id: 'inc_03', severity: 'MEDIUM', merchant: 'Github', amount: '$40', status: 'Approved', providerStatus: { senso: 'ok', linq: 'ok', prava: 'ok' } },
  { id: 'inc_04', severity: 'LOW', merchant: 'Slack', amount: '$150', status: 'Failed', providerStatus: { senso: 'ok', linq: 'ok', prava: 'error' } },
];

export default function IncidentsQueue() {
  return (
    <div className="min-h-[100dvh] p-8 max-w-[1400px] mx-auto text-sm">
      <header className="mb-12 flex justify-between items-end border-b border-text-neutral/20 pb-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter text-text-primary flex items-center gap-4">
            INCIDENT.QUEUE
            <span className="bg-accent-critical text-white text-[10px] px-2 py-0.5 tracking-widest font-bold">L4_MONITOR</span>
          </h1>
          <p className="text-text-neutral mt-2 text-xs">VAPOR DAG EXCEPTIONS & BLOCKS</p>
        </div>
        <div className="flex gap-2">
          {['ALL', 'NEEDS_REVIEW', 'BLOCKED', 'APPROVED', 'FAILED'].map(filter => (
            <button key={filter} className="border border-text-neutral/20 bg-surface-card text-text-neutral px-3 py-1 hover:bg-surface-base hover:text-white transition-none text-[10px]">
              [{filter}]
            </button>
          ))}
        </div>
      </header>

      <TelemetryPanel title="EXCEPTION_LOG" className="p-0">
        <div className="w-full overflow-x-auto text-[10px]">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-surface-base text-text-neutral border-b border-text-neutral/20">
              <tr>
                <th className="px-3 py-2 font-normal border-r border-text-neutral/10">SYS.ID</th>
                <th className="px-3 py-2 font-normal border-r border-text-neutral/10">SEV</th>
                <th className="px-3 py-2 font-normal border-r border-text-neutral/10">MERCHANT</th>
                <th className="px-3 py-2 font-normal border-r border-text-neutral/10 text-right">AMT</th>
                <th className="px-3 py-2 font-normal border-r border-text-neutral/10">STATUS</th>
                <th className="px-3 py-2 font-normal border-r border-text-neutral/10">S/L/P</th>
                <th className="px-3 py-2 font-normal text-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map(inc => (
                <tr key={inc.id} className="border-b border-text-neutral/10 hover:bg-surface-base text-text-neutral group transition-none">
                  <td className="px-3 py-2 border-r border-text-neutral/10 font-bold">{inc.id}</td>
                  <td className="px-3 py-2 border-r border-text-neutral/10">
                    <span className={`px-2 py-0.5 border ${
                      inc.severity === 'CRITICAL' ? 'bg-status-error border-status-error text-white' : 
                      inc.severity === 'HIGH' ? 'bg-status-warning border-status-warning text-black' : 
                      'bg-surface-base border-text-neutral/40 text-white'
                    }`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="px-3 py-2 border-r border-text-neutral/10 text-text-primary font-bold">{inc.merchant}</td>
                  <td className="px-3 py-2 border-r border-text-neutral/10 text-right font-bold text-text-primary">{inc.amount}</td>
                  <td className="px-3 py-2 border-r border-text-neutral/10">{inc.status}</td>
                  <td className="px-3 py-2 border-r border-text-neutral/10">
                    <div className="flex gap-1">
                      <div className={`w-2 h-2 ${inc.providerStatus.senso === 'error' ? 'bg-accent-critical' : inc.providerStatus.senso === 'ok' ? 'bg-status-success' : 'bg-surface-base'}`} title="Senso"></div>
                      <div className={`w-2 h-2 ${inc.providerStatus.linq === 'error' ? 'bg-accent-critical' : inc.providerStatus.linq === 'ok' ? 'bg-status-success' : 'bg-surface-base'}`} title="Linq"></div>
                      <div className={`w-2 h-2 ${inc.providerStatus.prava === 'error' ? 'bg-accent-critical' : inc.providerStatus.prava === 'ok' ? 'bg-status-success' : 'bg-surface-base'}`} title="Prava"></div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Link href={`/incidents/${inc.id}`} className="text-text-neutral hover:text-accent-critical-critical border-b border-transparent hover:border-accent-critical pb-0.5 inline-block transition-none">
                      VIEW_WORKSPACE &gt;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TelemetryPanel>
    </div>
  );
}

import { TelemetryPanel } from '@/components/ui/TelemetryPanel';

export default function AuditLog() {
  const auditEvents = [
    {
      id: 'evt_001',
      timestamp: '2026-08-06T08:12:30Z',
      action: 'INTENT_CAPTURED',
      actor: 'SYS_API',
      target: 'inc_01',
      hash: 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
      payload: '{"merchant":"AWS","amount":5400,"employee":"Sarah Jenkins"}'
    },
    {
      id: 'evt_002',
      timestamp: '2026-08-06T08:12:32Z',
      action: 'SENSO_EVALUATION',
      actor: 'SENSO_POLICY_ENGINE',
      target: 'inc_01',
      hash: 'b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c',
      payload: '{"rule":"IT_INFRA_5K_APPROVAL","verdict":"REQUIRES_LINQ_APPROVAL"}'
    },
    {
      id: 'evt_003',
      timestamp: '2026-08-06T08:15:10Z',
      action: 'LINQ_APPROVAL_REQUESTED',
      actor: 'SYS_WORKFLOW',
      target: 'inc_01',
      hash: 'c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d',
      payload: '{"channel":"iMessage","recipient":"manager_01"}'
    }
  ];

  return (
    <div className="min-h-[100dvh] p-8 max-w-[1400px] mx-auto text-sm">
      <header className="mb-12 flex justify-between items-end border-b border-text-neutral/20 pb-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter text-text-primary flex items-center gap-4">
            IMMUTABLE.AUDIT
            <span className="bg-status-success text-black text-[10px] px-2 py-0.5 tracking-widest font-bold">SEC_09_VERIFIED</span>
          </h1>
          <p className="text-text-neutral mt-2 text-xs">CRYPTOGRAPHICALLY VERIFIED EVENT TIMELINE</p>
        </div>
      </header>

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-text-neutral/20 before:to-transparent">
        {auditEvents.map((event, i) => (
          <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            
            {/* Timeline Marker */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full border border-status-success bg-surface-card text-status-success shadow-soft md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 -translate-x-1/2 z-10">
              <div className="w-2 h-2 bg-status-success"></div>
            </div>

            <TelemetryPanel title={`EVT_ID: ${event.id}`} className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] ml-12 md:ml-0 p-0 hover:border-status-success transition-none">
              <div className="p-4 bg-surface-card">
                <div className="flex justify-between items-end border-b border-text-neutral/10 pb-3 mb-3">
                  <div>
                    <div className="text-[10px] text-text-neutral/60 mb-1">TIMESTAMP</div>
                    <div className="text-text-primary font-bold">{new Date(event.timestamp).toLocaleString()}</div>
                  </div>
                  <div className="bg-surface-base border border-text-neutral/20 text-accent-critical font-bold px-2 py-1 text-[10px]">
                    {event.action}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4 border-b border-text-neutral/10 pb-3">
                  <div>
                    <div className="text-[10px] text-text-neutral/60 mb-1">ACTOR</div>
                    <div className="text-text-primary">{event.actor}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-text-neutral/60 mb-1">TARGET_OBJ</div>
                    <div className="text-text-primary">{event.target}</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-[10px] text-text-neutral/60 mb-2">EVENT_PAYLOAD</div>
                  <pre className="bg-surface-card border border-text-neutral/10 p-3 text-[10px] text-status-success overflow-x-auto whitespace-pre-wrap ">
                    {event.payload}
                  </pre>
                </div>

                <div className="bg-surface-base border border-text-neutral/20 p-3 flex items-center gap-3">
                  <div className="text-status-success font-bold">✓</div>
                  <div className="overflow-hidden">
                    <div className="text-[10px] text-text-neutral/60 mb-1">VERIFIED_HASH</div>
                    <code className="text-text-neutral text-[10px] block truncate">{event.hash}</code>
                  </div>
                </div>
              </div>
            </TelemetryPanel>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useState } from 'react';

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorOrProvider: string;
  event: string;
  result: string;
  redactedReference?: string;
  isDurable: boolean;
}

interface AuditTimelineProps {
  events: AuditEvent[];
  onExportJSON?: () => void;
  onExportCSV?: () => void;
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ events, onExportJSON, onExportCSV }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredEvents = events.filter(e => 
    e.id.includes(searchTerm) || 
    (e.redactedReference && e.redactedReference.includes(searchTerm)) ||
    e.actorOrProvider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      backgroundColor: 'var(--surface-1)',
      border: '1px solid var(--border-strong)',
      borderRadius: '20px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ fontSize: '20px', margin: 0, color: 'var(--text-primary)' }}>Audit Timeline</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          {onExportJSON && (
            <button onClick={onExportJSON} style={exportButtonStyle}>Export JSON</button>
          )}
          {onExportCSV && (
            <button onClick={onExportCSV} style={exportButtonStyle}>Export CSV</button>
          )}
        </div>
      </div>

      <div>
        <input 
          type="text" 
          placeholder="Search correlation ID or provider..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: 'var(--surface-2)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontFamily: 'Inter, system-ui, sans-serif'
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
        {filteredEvents.map((event, index) => (
          <div key={event.id} style={{
            display: 'flex',
            gap: '16px',
            position: 'relative'
          }}>
            {/* Timeline line */}
            {index !== filteredEvents.length - 1 && (
              <div style={{
                position: 'absolute',
                left: '7px',
                top: '24px',
                bottom: '-16px',
                width: '2px',
                backgroundColor: 'var(--border-subtle)',
                zIndex: 0
              }} />
            )}
            
            {/* Timeline dot */}
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: event.isDurable ? 'var(--signal-safe)' : 'var(--signal-warning)',
              border: '4px solid var(--surface-1)',
              zIndex: 1,
              marginTop: '4px'
            }} />

            <div style={{
              flex: 1,
              backgroundColor: 'var(--surface-2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{event.event}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{event.timestamp}</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>Actor:</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{event.actorOrProvider}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>Result:</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{event.result}</span>
                </div>
                {event.redactedReference && (
                  <div style={{ gridColumn: 'span 2', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Ref: {event.redactedReference}
                  </div>
                )}
                <div style={{ gridColumn: 'span 2', marginTop: '4px' }}>
                  <span style={{ 
                    fontSize: '10px', 
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    backgroundColor: 'var(--surface-3)',
                    color: event.isDurable ? 'var(--signal-safe)' : 'var(--signal-warning)',
                    border: `1px solid ${event.isDurable ? 'var(--signal-safe)' : 'var(--signal-warning)'}`,
                    textTransform: 'uppercase'
                  }}>
                    {event.isDurable ? 'Immutable Record' : 'Session Activity'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredEvents.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
            No audit events found.
          </div>
        )}
      </div>
    </div>
  );
};

const exportButtonStyle: React.CSSProperties = {
  backgroundColor: 'var(--surface-3)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '6px',
  padding: '6px 12px',
  fontSize: '12px',
  cursor: 'pointer',
  transition: 'background-color 150ms ease'
};

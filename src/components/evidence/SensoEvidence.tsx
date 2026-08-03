import React from 'react';
import { ProviderState } from '../types';

interface SensoEvidenceProps {
  state: ProviderState | 'NO_MATCH';
  queryText?: string;
  timestamp?: string;
  documentTitle?: string;
  contentId?: string;
  excerpt?: string;
  relevanceScore?: number;
}

export const SensoEvidence: React.FC<SensoEvidenceProps> = ({
  state,
  queryText,
  timestamp,
  documentTitle,
  contentId,
  excerpt,
  relevanceScore
}) => {
  if (state === 'UNAVAILABLE' || state === 'ERROR') {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <span style={{ color: 'var(--provider-senso)' }}>Senso Retrieval</span>
          <span style={badgeStyle('var(--signal-danger)')}>Provider unavailable</span>
        </div>
      </div>
    );
  }

  if (state === 'NO_MATCH') {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <span style={{ color: 'var(--provider-senso)' }}>Senso Retrieval</span>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No matching evidence found for query &quot;{queryText}&quot;.</p>
          </div>
        </div>
        {queryText && <div style={textRowStyle}>Query: {queryText}</div>}
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span style={{ color: 'var(--provider-senso)', fontWeight: 600 }}>Senso Retrieval</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {state === 'DEMO' && <span style={badgeStyle('var(--signal-warning)')}>DEMO ONLY</span>}
          {timestamp && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{timestamp}</span>}
        </div>
      </div>
      
      {queryText && (
        <div style={textRowStyle}>
          <span style={labelStyle}>Query:</span> {queryText}
        </div>
      )}

      {documentTitle && (
        <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'var(--surface-3)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{documentTitle}</span>
            {relevanceScore !== undefined && (
              <span style={{ color: 'var(--provider-senso)', fontSize: '12px' }}>
                Relevance: {(relevanceScore * 100).toFixed(1)}%
              </span>
            )}
          </div>
          {contentId && (
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              ID: {contentId}
            </div>
          )}
          {excerpt && (
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              &quot;{excerpt}&quot;
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  backgroundColor: 'var(--surface-1)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '14px',
  padding: '16px',
  position: 'relative'
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px'
};

const textRowStyle: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--text-secondary)',
  marginBottom: '8px'
};

const labelStyle: React.CSSProperties = {
  color: 'var(--text-muted)',
  marginRight: '8px'
};

const badgeStyle = (color: string): React.CSSProperties => ({
  fontSize: '12px',
  padding: '2px 6px',
  borderRadius: '4px',
  border: `1px solid ${color}`,
  color: color
});

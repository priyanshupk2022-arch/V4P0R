import React from 'react';

interface EvidenceRailProps {
  children: React.ReactNode;
}

export const EvidenceRail: React.FC<EvidenceRailProps> = ({ children }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      borderLeft: '2px solid var(--border-subtle)',
      paddingLeft: '24px',
      marginLeft: '12px'
    }}>
      {children}
    </div>
  );
};

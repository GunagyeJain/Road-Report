import React from 'react';
import type { Issue } from '../../types';

interface StatsCardsProps {
  issues: Issue[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ issues }) => {
  const stats = {
    total: issues.length,
    pending: issues.filter(i => i.status === 'pending').length,
    inProgress: issues.filter(i => i.status === 'in-progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
      gap: '1rem',
      marginBottom: '2rem'
    }}>
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>TOTAL ISSUES</h3>
        <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>{stats.total}</p>
      </div>
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>PENDING</h3>
        <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.pending}</p>
      </div>
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>IN PROGRESS</h3>
        <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{stats.inProgress}</p>
      </div>
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>RESOLVED</h3>
        <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.resolved}</p>
      </div>
    </div>
  );
};

export default StatsCards;

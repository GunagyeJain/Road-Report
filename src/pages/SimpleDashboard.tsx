import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { IssueService } from '../services/issueService';
import type { Issue } from '../types';
import { Link } from 'react-router-dom';
import { Plus, LogOut, User } from 'lucide-react';

const SimpleDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadIssues();
  }, [currentUser]);

  const loadIssues = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const userIssues = await IssueService.getIssuesByUser(currentUser.id);
      setIssues(userIssues);
      setError('');
    } catch (error: any) {
      setError(error.message || 'Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in-progress': return '#3b82f6';
      case 'resolved': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem' }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '1.5rem', 
        marginBottom: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <User size={24} />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>My Dashboard</h1>
            <p style={{ margin: 0, color: '#6b7280' }}>{currentUser?.email}</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/report" className="btn btn-primary">
            <Plus size={20} style={{ marginRight: '0.5rem' }} />
            Report New Issue
          </Link>
          
          <button onClick={handleLogout} className="btn btn-secondary">
            <LogOut size={20} style={{ marginRight: '0.5rem' }} />
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>TOTAL ISSUES</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{issues.length}</p>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>PENDING</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {issues.filter(i => i.status === 'pending').length}
          </p>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>IN PROGRESS</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {issues.filter(i => i.status === 'in-progress').length}
          </p>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>RESOLVED</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
            {issues.filter(i => i.status === 'resolved').length}
          </p>
        </div>
      </div>

      {/* Issues List */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginTop: 0 }}>Your Reported Issues</h2>
        
        {loading && <p>Loading your issues...</p>}
        
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        
        {!loading && !error && issues.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>No issues reported yet</h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Start making a difference in your community!</p>
            <Link to="/report" className="btn btn-primary">Report Your First Issue</Link>
          </div>
        )}
        
        {!loading && issues.length > 0 && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {issues.map(issue => (
              <div key={issue.id} style={{ 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                padding: '1rem',
                display: 'grid',
                gridTemplateColumns: issue.photoURL ? '100px 1fr auto' : '1fr auto',
                gap: '1rem',
                alignItems: 'center'
              }}>
                {/* Photo */}
                {issue.photoURL && (
                  <img 
                    src={issue.photoURL} 
                    alt="Issue" 
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      objectFit: 'cover', 
                      borderRadius: '8px' 
                    }} 
                  />
                )}
                
                {/* Details */}
                <div>
                  <div style={{ 
                    display: 'inline-block',
                    background: getStatusColor(issue.status) + '20',
                    color: getStatusColor(issue.status),
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    marginBottom: '0.5rem'
                  }}>
                    {issue.status.replace('-', ' ')}
                  </div>
                  
                  <h4 style={{ margin: '0 0 0.5rem', textTransform: 'capitalize' }}>
                    {issue.category.replace('-', ' ')} Issue
                  </h4>
                  
                  <p style={{ margin: '0 0 0.5rem', color: '#374151' }}>
                    {issue.description}
                  </p>
                  
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                    📍 {issue.location.latitude.toFixed(4)}, {issue.location.longitude.toFixed(4)}
                  </p>
                </div>
                
                {/* Date */}
                <div style={{ textAlign: 'right', color: '#6b7280', fontSize: '0.875rem' }}>
                  {new Date(issue.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleDashboard;

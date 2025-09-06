import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { IssueService } from '../../services/issueService';
import type { Issue, IssueStatus, IssueCategory } from '../../types';
import IssueCard from './IssueCard';
import { Link } from 'react-router-dom';
import { Plus, Filter, LogOut, User } from 'lucide-react';
import styles from './UserDashboard.module.css';

const UserDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | 'all'>('all');

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

  // Filter issues based on selected filters
  const filteredIssues = issues.filter(issue => {
    const statusMatch = statusFilter === 'all' || issue.status === statusFilter;
    const categoryMatch = categoryFilter === 'all' || issue.category === categoryFilter;
    return statusMatch && categoryMatch;
  });

  // Group issues by status for stats
  const issueStats = {
    total: issues.length,
    pending: issues.filter(i => i.status === 'pending').length,
    inProgress: issues.filter(i => i.status === 'in-progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <span className="spinner" style={{ width: '40px', height: '40px' }}></span>
        <p>Loading your issues...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.userInfo}>
            <User size={24} />
            <div>
              <h1>My Dashboard</h1>
              <p>{currentUser?.email}</p>
            </div>
          </div>
          
          <div className={styles.headerActions}>
            <Link to="/report" className="btn btn-primary">
              <Plus size={20} />
              Report New Issue
            </Link>
            
            <button onClick={handleLogout} className="btn btn-secondary">
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Issues</h3>
          <p className={styles.statNumber}>{issueStats.total}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Pending</h3>
          <p className={styles.statNumber + ' ' + styles.pending}>{issueStats.pending}</p>
        </div>
        <div className={styles.statCard}>
          <h3>In Progress</h3>
          <p className={styles.statNumber + ' ' + styles.inProgress}>{issueStats.inProgress}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Resolved</h3>
          <p className={styles.statNumber + ' ' + styles.resolved}>{issueStats.resolved}</p>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersSection}>
        <div className={styles.filtersHeader}>
          <h2>Your Reported Issues</h2>
          <div className={styles.filters}>
            <Filter size={20} />
            
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as IssueStatus | 'all')}
              className="form-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value as IssueCategory | 'all')}
              className="form-select"
            >
              <option value="all">All Categories</option>
              <option value="pothole">Pothole</option>
              <option value="garbage">Garbage</option>
              <option value="sewage">Sewage</option>
              <option value="streetlight">Streetlight</option>
              <option value="others">Others</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={loadIssues} className="btn btn-secondary">
            Retry
          </button>
        </div>
      )}

      {/* Issues List */}
      <div className={styles.issuesSection}>
        {filteredIssues.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No issues found</h3>
            <p>
              {issues.length === 0 
                ? "You haven't reported any issues yet."
                : "No issues match your current filters."
              }
            </p>
            {issues.length === 0 && (
              <Link to="/report" className="btn btn-primary">
                Report Your First Issue
              </Link>
            )}
          </div>
        ) : (
          <div className={styles.issuesGrid}>
            {filteredIssues.map(issue => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;

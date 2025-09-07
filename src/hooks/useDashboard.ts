import { useState, useEffect } from 'react';
import type { Issue, IssueStatus } from '../types';
import { IssueService } from '../services/issueService';

export const useDashboard = (userId?: string, isAdminView: boolean = false) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'map' | 'list'>('map');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const loadIssues = async () => {
    try {
      setLoading(true);
      // Always load all issues for public transparency
      const fetchedIssues = await IssueService.getAllIssues();
      
      setIssues(fetchedIssues);
      setError('');
    } catch (error: any) {
      setError(error.message || 'Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const filterIssues = () => {
    let filtered = issues;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(issue => issue.status === statusFilter);
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(issue => issue.category === categoryFilter);
    }
    
    setFilteredIssues(filtered);
  };

  const updateIssueStatus = async (issueId: string, newStatus: IssueStatus) => {
    try {
      await IssueService.updateIssueStatus(issueId, newStatus);
      
      // Manual state update
      setIssues(prevIssues => 
        prevIssues.map(issue => 
          issue.id === issueId 
            ? { ...issue, status: newStatus, updatedAt: new Date() }
            : issue
        )
      );
      
    } catch (error: any) {
      throw error;
    }
  };

  useEffect(() => {
    loadIssues();
  }, [userId, isAdminView]);

  useEffect(() => {
    filterIssues();
  }, [issues, statusFilter, categoryFilter]);

  return {
    issues,
    filteredIssues,
    loading,
    error,
    view,
    setView,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    loadIssues,
    updateIssueStatus,
    // Add these missing return values
    isConnected: true, // Mock value for now
    lastUpdate: null as Date | null // Mock value for now
  };
};

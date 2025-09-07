import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Issue } from '../types';

interface RealtimeHookProps {
  userId?: string;
  isAdminView: boolean;
  onIssueChange?: (change: 'INSERT' | 'UPDATE' | 'DELETE', issue: Issue) => void;
}

export const useRealtime = ({ userId, isAdminView, onIssueChange }: RealtimeHookProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!supabase) return;

    console.log('🔄 Setting up real-time subscription...');

    // Create real-time subscription
    const channel = supabase
      .channel('issues-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'issues',
          // Filter for user-specific issues if not admin
          ...(isAdminView ? {} : { filter: `reporter_id=eq.${userId}` })
        },
        (payload) => {
          console.log('📡 Real-time update received:', payload);
          
          const { eventType, new: newRecord, old: oldRecord } = payload;
          setLastUpdate(new Date());
          
          // Convert database record to Issue type
          const mapDbToIssue = (record: any): Issue => ({
            id: record.id,
            photoURL: record.photo_base64 || record.photo_url || '',
            location: {
              latitude: record.latitude,
              longitude: record.longitude,
              address: record.address,
            },
            category: record.category,
            description: record.description,
            status: record.status,
            timestamp: new Date(record.created_at),
            reporterId: record.reporter_id || 'anonymous',
            reporterEmail: record.reporter_email,
            updatedAt: new Date(record.updated_at),
            adminNotes: record.admin_notes,
          });

          // Handle different event types
          if (eventType === 'INSERT' && newRecord) {
            onIssueChange?.('INSERT', mapDbToIssue(newRecord));
          } else if (eventType === 'UPDATE' && newRecord) {
            onIssueChange?.('UPDATE', mapDbToIssue(newRecord));
          } else if (eventType === 'DELETE' && oldRecord) {
            onIssueChange?.('DELETE', mapDbToIssue(oldRecord));
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Cleanup subscription
    return () => {
      console.log('🔄 Cleaning up real-time subscription');
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [userId, isAdminView, onIssueChange]);

  return { isConnected, lastUpdate };
};

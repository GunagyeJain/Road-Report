import { supabase } from './supabase';
import type { Issue, IssueFormData, IssueStatus } from '../types';

export class IssueService {
  // Convert image to Base64
  static async convertImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  }

  // Create a new issue (authenticated users only)
  static async createIssue(
    formData: IssueFormData, 
    userId: string, 
    userEmail: string | null
  ): Promise<string> {
    try {
      let photoBase64 = '';
      
      if (formData.photo) {
        console.log('Converting image to Base64...');
        photoBase64 = await this.convertImageToBase64(formData.photo);
        console.log('Image converted successfully');
      }

      const issueData = {
        photo_base64: photoBase64,
        latitude: formData.location.latitude,
        longitude: formData.location.longitude,
        category: formData.category,
        description: formData.description,
        status: 'pending' as IssueStatus,
        reporter_id: userId, // Always a valid user ID now
        reporter_email: userEmail,
      };

      console.log('Creating issue for authenticated user...');

      const { data, error } = await supabase
        .from('issues')
        .insert([issueData])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to create issue: ${error.message}`);
      }

      console.log('✅ Issue created successfully:', data.id);
      return data.id;

    } catch (error) {
      console.error('❌ Error in createIssue:', error);
      throw error;
    }
  }

  // Get issues by user
  static async getIssuesByUser(userId: string): Promise<Issue[]> {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('reporter_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(`Failed to fetch issues: ${error.message}`);

      return data.map(this.mapDbIssueToIssue);
    } catch (error) {
      console.error('Error fetching user issues:', error);
      throw error;
    }
  }

  // Get all issues (for admin)
  static async getAllIssues(): Promise<Issue[]> {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw new Error(`Failed to fetch all issues: ${error.message}`);

      return data.map(this.mapDbIssueToIssue);
    } catch (error) {
      console.error('Error fetching all issues:', error);
      throw error;
    }
  }

  // Update issue status
  static async updateIssueStatus(
    issueId: string, 
    status: IssueStatus, 
    adminNotes?: string
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };
      
      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }
      
      const { error } = await supabase
        .from('issues')
        .update(updateData)
        .eq('id', issueId);

      if (error) throw new Error(`Failed to update issue: ${error.message}`);
    } catch (error) {
      console.error('Error updating issue status:', error);
      throw error;
    }
  }

  // Helper to map DB issue to app Issue type
  private static mapDbIssueToIssue(dbIssue: any): Issue {
    return {
      id: dbIssue.id,
      photoURL: dbIssue.photo_base64 || '',
      location: {
        latitude: dbIssue.latitude,
        longitude: dbIssue.longitude,
        address: dbIssue.address,
      },
      category: dbIssue.category,
      description: dbIssue.description,
      status: dbIssue.status,
      timestamp: new Date(dbIssue.created_at),
      reporterId: dbIssue.reporter_id,
      reporterEmail: dbIssue.reporter_email,
      updatedAt: new Date(dbIssue.updated_at),
      adminNotes: dbIssue.admin_notes,
    };
  }
}

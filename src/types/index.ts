// User types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous: boolean;
  isAdmin?: boolean;
}

// Issue types
export interface Issue {
  id: string;
  photoURL: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  category: IssueCategory;
  description: string;
  status: IssueStatus;
  timestamp: Date;
  reporterId: string;
  reporterEmail?: string;
  updatedAt?: Date;
  adminNotes?: string;
}

export type IssueCategory = 
  | 'pothole' 
  | 'garbage' 
  | 'sewage' 
  | 'streetlight' 
  | 'others';

export type IssueStatus = 
  | 'pending' 
  | 'in-progress' 
  | 'resolved';

// Form types
export interface IssueFormData {
  photo: File | null;
  category: IssueCategory;
  description: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

// Map types
export interface MapPosition {
  lat: number;
  lng: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

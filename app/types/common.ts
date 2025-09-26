// Common types used across the application

// User types
export interface User {
  id: string;
  username: string;
  role: string;
  email: string;
  created_at: Date;
}

// Group types
export interface Group {
  id: string;
  name: string;
  active: boolean;
  created_by: string;
  created_at: Date;
}


export interface GroupWithCreator extends Group {
  creator_username: string | null;
  creator_email: string | null;
}

// Member types
export interface Member {
  id: string;
  user_id: string;
  group_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  joined_at: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState {
  isValid: boolean;
  errors: ValidationError[];
  isSubmitting: boolean;
}

// Component props types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Status types
export type Status = "pending" | "loading" | "success" | "error";

export interface StatusState {
  status: Status;
  message?: string;
}

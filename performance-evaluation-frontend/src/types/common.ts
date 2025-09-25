// Common types used throughout the application
export interface ApiResponse<T = unknown> {
  data?: T;
  success?: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface BaseEntity {
  id: number;
  createdDate: string;
  updatedDate?: string;
}

// Search and pagination
export interface BaseSearchRequest {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  searchTerm?: string;
  [key: string]: unknown;
}

// Common response wrapper
export interface ServiceResponse<T> {
  data: T;
  message: string;
  success: boolean;
  errors?: string[];
}

// Cookie options interface
export interface CookieConfig {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  expires?: Date;
}

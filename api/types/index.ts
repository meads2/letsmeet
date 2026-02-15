/**
 * Shared Type Definitions
 *
 * Common types used across the API
 */

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    timestamp: number;
    requestId?: string;
  };
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Common status types
 */
export type Status = 'active' | 'inactive' | 'pending' | 'deleted';

/**
 * Timestamp fields
 */
export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

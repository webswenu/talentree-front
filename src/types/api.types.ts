/**
 * Generic API Response Structure
 * All backend responses follow this format
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

/**
 * Error response structure from the backend
 */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp?: string;
}

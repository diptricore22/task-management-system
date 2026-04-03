// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: object;
}

export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: object
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API client configuration - using validated environment
import { webEnv } from '@/lib/env';

const API_BASE_URL = webEnv.api.baseUrl;

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    // Include credentials for authentication cookies
    credentials: 'include',
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      // Try to parse error response
      let errorData: ApiErrorResponse;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          code: 'HTTP_ERROR',
        };
      }

      throw new ApiError(
        errorData.code || 'HTTP_ERROR',
        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        errorData.details
      );
    }

    const data: ApiResult<T> = await response.json();

    if (!data.success) {
      throw new ApiError(
        (data as ApiErrorResponse).code || 'API_ERROR',
        (data as ApiErrorResponse).error || 'An unknown error occurred'
      );
    }

    return (data as ApiResponse<T>).data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors
    throw new ApiError(
      'NETWORK_ERROR',
      error instanceof Error ? error.message : 'Network error occurred'
    );
  }
}

// HTTP method helpers
export const api = {
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return fetchApi<T>(endpoint, { ...options, method: 'GET' });
  },

  async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return fetchApi<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return fetchApi<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async patch<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return fetchApi<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return fetchApi<T>(endpoint, { ...options, method: 'DELETE' });
  },
};

export default api;
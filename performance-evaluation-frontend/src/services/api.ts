import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { CONFIG } from '@/constants/config';
import { ApiResponse, ApiError } from '@/types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable HTTP-only cookies
});

// Track if we're currently refreshing
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor - cookies are automatically sent
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Cookies are automatically included due to withCredentials: true
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api.request(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        await api.post('/api/auth/refresh');
        processQueue(null);
        return api.request(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Redirect to login if refresh fails
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status || 500,
      details: error.response?.data || {},
    };

    return Promise.reject(apiError);
  }
);

// Generic API methods that return the actual response data
export const apiClient = {
  get: <T>(url: string, params?: Record<string, unknown>): Promise<T> =>
    api.get(url, { params }).then((response) => response.data),
  
  post: <T>(url: string, data?: unknown): Promise<T> =>
    api.post(url, data).then((response) => response.data),
  
  put: <T>(url: string, data?: unknown): Promise<T> =>
    api.put(url, data).then((response) => response.data),
  
  patch: <T>(url: string, data?: unknown): Promise<T> =>
    api.patch(url, data).then((response) => response.data),
  
  delete: <T>(url: string): Promise<T> =>
    api.delete(url).then((response) => response.data),

  // Upload files with FormData
  upload: <T>(url: string, formData: FormData): Promise<T> =>
    api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then((response) => response.data),

  // Download files
  downloadFile: (url: string, params?: Record<string, unknown>): Promise<Blob> =>
    api.get(url, { 
      params,
      responseType: 'blob' 
    }).then((response) => response.data),
};

export default api;

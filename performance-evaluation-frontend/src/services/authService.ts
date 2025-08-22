import { apiClient } from './api';
import { LoginRequest, LoginResponse, RefreshTokenResponse, UserInfo } from '@/types';

export const authService = {
  /**
   * Login with credentials - cookies are set automatically by the server
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return await apiClient.post<LoginResponse>('/api/auth/login', credentials);
  },

  /**
   * Refresh token - uses HTTP-only cookies automatically
   */
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    return await apiClient.post<RefreshTokenResponse>('/api/auth/refresh');
  },

  /**
   * Logout - clears HTTP-only cookies on server side
   */
  logout: async (): Promise<{ message: string }> => {
    return await apiClient.post<{ message: string }>('/api/auth/logout');
  },

  /**
   * Get current user information
   */
  getCurrentUser: async (): Promise<UserInfo> => {
    return await apiClient.get<UserInfo>('/api/auth/me');
  },

  /**
   * Check if user is authenticated by trying to get current user
   */
  checkAuth: async (): Promise<UserInfo | null> => {
    try {
      return await authService.getCurrentUser();
    } catch {
      return null;
    }
  },

  /**
   * Change password
   */
  changePassword: async (data: { 
    currentPassword: string; 
    newPassword: string; 
    confirmPassword: string; 
  }): Promise<{ message: string }> => {
    return await apiClient.post<{ message: string }>('/api/auth/change-password', data);
  },

  /**
   * Reset password request
   */
  resetPassword: async (email: string): Promise<{ message: string }> => {
    return await apiClient.post<{ message: string }>('/api/auth/reset-password', { email });
  },
};

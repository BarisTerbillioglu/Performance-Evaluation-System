import { apiClient } from './api';
import { 
  UserDto, 
  UserSearchDto,
  UserSearchRequest,
  UserWithDetailsDto,
  CreateUserRequest, 
  UpdateUserRequest, 
  PagedResult 
} from '@/types';

export const userService = {
  /**
   * Get all users with pagination and filters
   */
  getUsers: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    department?: string;
    role?: string;
  }): Promise<PagedResult<UserDto>> => {
    return await apiClient.get<PagedResult<UserDto>>('/api/user', params);
  },

  /**
   * Search users with advanced filters
   */
  searchUsers: async (searchRequest: UserSearchRequest): Promise<PagedResult<UserSearchDto[]>> => {
    return await apiClient.post<PagedResult<UserSearchDto[]>>('/api/user/search', searchRequest);
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: number): Promise<UserWithDetailsDto> => {
    return await apiClient.get<UserWithDetailsDto>(`/api/user/${id}`);
  },

  /**
   * Create new user
   */
  createUser: async (userData: CreateUserRequest): Promise<UserDto> => {
    return await apiClient.post<UserDto>('/api/user', userData);
  },

  /**
   * Update user
   */
  updateUser: async (id: number, userData: UpdateUserRequest): Promise<UserDto> => {
    return await apiClient.put<UserDto>(`/api/user/${id}`, userData);
  },

  /**
   * Delete user
   */
  deleteUser: async (id: number): Promise<{ message: string }> => {
    return await apiClient.delete<{ message: string }>(`/api/user/${id}`);
  },

  /**
   * Activate user
   */
  activateUser: async (id: number): Promise<{ message: string }> => {
    return await apiClient.put<{ message: string }>(`/api/user/${id}/activate`);
  },

  /**
   * Deactivate user
   */
  deactivateUser: async (id: number): Promise<{ message: string }> => {
    return await apiClient.put<{ message: string }>(`/api/user/${id}/deactivate`);
  },

  /**
   * Bulk activate users
   */
  bulkActivateUsers: async (userIds: number[]): Promise<{ message: string }> => {
    return await apiClient.put<{ message: string }>('/api/user/bulk/activate', { userIds });
  },

  /**
   * Bulk deactivate users
   */
  bulkDeactivateUsers: async (userIds: number[]): Promise<{ message: string }> => {
    return await apiClient.put<{ message: string }>('/api/user/bulk/deactivate', { userIds });
  },

  /**
   * Bulk delete users
   */
  bulkDeleteUsers: async (userIds: number[]): Promise<{ message: string }> => {
    return await apiClient.delete<{ message: string }>('/api/user/bulk', { data: { userIds } });
  },

  /**
   * Bulk assign roles
   */
  bulkAssignRoles: async (userIds: number[], roleIds: number[]): Promise<{ message: string }> => {
    return await apiClient.put<{ message: string }>('/api/user/bulk/roles', { userIds, roleIds });
  },

  /**
   * Bulk assign departments
   */
  bulkAssignDepartments: async (userIds: number[], departmentId: number): Promise<{ message: string }> => {
    return await apiClient.put<{ message: string }>('/api/user/bulk/departments', { userIds, departmentId });
  },

  /**
   * Import users from CSV
   */
  importUsers: async (file: File): Promise<{ message: string; importedCount: number; errors: string[] }> => {
    const formData = new FormData();
    formData.append('file', file);
    return await apiClient.post<{ message: string; importedCount: number; errors: string[] }>('/api/user/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Export users to CSV
   */
  exportUsers: async (filters?: UserSearchRequest): Promise<Blob> => {
    return await apiClient.get<Blob>('/api/user/export', filters, {
      responseType: 'blob',
    });
  },

  /**
   * Get all evaluators
   */
  getEvaluators: async (): Promise<UserDto[]> => {
    return await apiClient.get<UserDto[]>('/api/user/evaluators');
  },

  /**
   * Get all employees
   */
  getEmployees: async (): Promise<UserDto[]> => {
    return await apiClient.get<UserDto[]>('/api/user/employees');
  },

  /**
   * Get employees in specific department
   */
  getEmployeesByDepartment: async (departmentId: number): Promise<UserDto[]> => {
    return await apiClient.get<UserDto[]>(`/api/user/departments/${departmentId}/employees`);
  },

  /**
   * Check email uniqueness
   */
  checkEmailUniqueness: async (email: string, excludeUserId?: number): Promise<{ isUnique: boolean }> => {
    return await apiClient.get<{ isUnique: boolean }>('/api/user/check-email', { email, excludeUserId });
  },

  /**
   * Get user statistics
   */
  getUserStatistics: async (): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    usersByDepartment: { departmentName: string; count: number }[];
    usersByRole: { roleName: string; count: number }[];
  }> => {
    return await apiClient.get('/api/user/statistics');
  },
};

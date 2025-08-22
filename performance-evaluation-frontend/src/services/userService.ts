import { apiClient } from './api';
import {
  UserDto,
  UserListDto,
  UserWithDetailsDto,
  UserSummaryDto,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  UserSearchDto,
  UserSearchRequest,
  EmployeeListDto,
  EvaluatorListDto,
  BaseSearchRequest,
  PaginatedResponse,
} from '@/types';

export const userService = {
  /**
   * Get all users with role-based filtering
   */
  getUsers: async (): Promise<UserListDto[]> => {
    return await apiClient.get<UserListDto[]>('/api/user');
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
  createUser: async (user: CreateUserRequest): Promise<UserDto> => {
    return await apiClient.post<UserDto>('/api/user', user);
  },

  /**
   * Update user
   */
  updateUser: async (id: number, user: UpdateUserRequest): Promise<UserDto> => {
    return await apiClient.put<UserDto>(`/api/user/${id}`, user);
  },

  /**
   * Delete user
   */
  deleteUser: async (id: number): Promise<{ message: string }> => {
    return await apiClient.delete<{ message: string }>(`/api/user/${id}`);
  },

  /**
   * Change user password
   */
  changePassword: async (id: number, request: ChangePasswordRequest): Promise<{ message: string }> => {
    return await apiClient.put<{ message: string }>(`/api/user/${id}/change-password`, request);
  },

  /**
   * Search users
   */
  searchUsers: async (request: UserSearchRequest): Promise<PaginatedResponse<UserSearchDto>> => {
    return await apiClient.post<PaginatedResponse<UserSearchDto>>('/api/user/search', request);
  },

  /**
   * Get users summary
   */
  getUsersSummary: async (): Promise<UserSummaryDto[]> => {
    return await apiClient.get<UserSummaryDto[]>('/api/user/summary');
  },

  /**
   * Get employees list
   */
  getEmployees: async (request?: BaseSearchRequest): Promise<EmployeeListDto[]> => {
    return await apiClient.get<EmployeeListDto[]>('/api/user/employees', request);
  },

  /**
   * Get evaluators list
   */
  getEvaluators: async (request?: BaseSearchRequest): Promise<EvaluatorListDto[]> => {
    return await apiClient.get<EvaluatorListDto[]>('/api/user/evaluators', request);
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
   * Upload user profile picture
   */
  uploadProfilePicture: async (id: number, file: File): Promise<{ message: string; profilePictureUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return await apiClient.upload<{ message: string; profilePictureUrl: string }>(`/api/user/${id}/profile-picture`, formData);
  },
};

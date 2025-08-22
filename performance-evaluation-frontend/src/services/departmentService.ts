import { apiClient } from './api';
import {
  DepartmentDto,
  DepartmentWithUsersDto,
  DepartmentStatsDto,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
} from '@/types';

export const departmentService = {
  /**
   * Get all departments
   */
  getDepartments: async (): Promise<DepartmentDto[]> => {
    return await apiClient.get<DepartmentDto[]>('/api/department');
  },

  /**
   * Get department by ID
   */
  getDepartmentById: async (id: number): Promise<DepartmentDto> => {
    return await apiClient.get<DepartmentDto>(`/api/department/${id}`);
  },

  /**
   * Get department with users
   */
  getDepartmentWithUsers: async (id: number): Promise<DepartmentWithUsersDto> => {
    return await apiClient.get<DepartmentWithUsersDto>(`/api/department/${id}/with-users`);
  },

  /**
   * Get all departments with users
   */
  getDepartmentsWithUsers: async (): Promise<DepartmentWithUsersDto[]> => {
    return await apiClient.get<DepartmentWithUsersDto[]>('/api/department/with-users');
  },

  /**
   * Create new department
   */
  createDepartment: async (department: CreateDepartmentRequest): Promise<DepartmentDto> => {
    return await apiClient.post<DepartmentDto>('/api/department', department);
  },

  /**
   * Update department
   */
  updateDepartment: async (id: number, department: UpdateDepartmentRequest): Promise<DepartmentDto> => {
    return await apiClient.put<DepartmentDto>(`/api/department/${id}`, department);
  },

  /**
   * Delete department
   */
  deleteDepartment: async (id: number): Promise<{ message: string }> => {
    return await apiClient.delete<{ message: string }>(`/api/department/${id}`);
  },

  /**
   * Get department statistics
   */
  getDepartmentStats: async (id: number): Promise<DepartmentStatsDto> => {
    return await apiClient.get<DepartmentStatsDto>(`/api/department/${id}/stats`);
  },

  /**
   * Get all departments statistics
   */
  getAllDepartmentStats: async (): Promise<DepartmentStatsDto[]> => {
    return await apiClient.get<DepartmentStatsDto[]>('/api/department/stats');
  },

  /**
   * Get active departments
   */
  getActiveDepartments: async (): Promise<DepartmentDto[]> => {
    return await apiClient.get<DepartmentDto[]>('/api/department/active');
  },

  /**
   * Activate department
   */
  activateDepartment: async (id: number): Promise<{ message: string }> => {
    return await apiClient.put<{ message: string }>(`/api/department/${id}/activate`);
  },

  /**
   * Deactivate department
   */
  deactivateDepartment: async (id: number): Promise<{ message: string }> => {
    return await apiClient.put<{ message: string }>(`/api/department/${id}/deactivate`);
  },
};

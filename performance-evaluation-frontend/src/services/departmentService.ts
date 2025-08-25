import { apiClient } from './api';
import { 
  DepartmentDto, 
  CreateDepartmentRequest, 
  UpdateDepartmentRequest 
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
   * Create new department
   */
  createDepartment: async (departmentData: CreateDepartmentRequest): Promise<DepartmentDto> => {
    return await apiClient.post<DepartmentDto>('/api/department', departmentData);
  },

  /**
   * Update department
   */
  updateDepartment: async (id: number, departmentData: UpdateDepartmentRequest): Promise<DepartmentDto> => {
    return await apiClient.put<DepartmentDto>(`/api/department/${id}`, departmentData);
  },

  /**
   * Delete department
   */
  deleteDepartment: async (id: number): Promise<{ message: string }> => {
    return await apiClient.delete<{ message: string }>(`/api/department/${id}`);
  },

  /**
   * Get department with users (alias for getDepartmentById)
   */
  getDepartmentWithUsers: async (id: number): Promise<DepartmentDto> => {
    return await apiClient.get<DepartmentDto>(`/api/department/${id}`);
  },
};

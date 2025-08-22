import { apiClient } from './api';
import {
  RoleDto,
  SystemRoleDto,
  JobRoleDto,
  RoleAssignmentDto,
  CreateRoleRequest,
  UpdateRoleRequest,
  CreateJobRoleRequest,
  UpdateJobRoleRequest,
  UpdateSystemRoleRequest,
  AssignRoleRequest,
} from '@/types';

export const roleService = {
  /**
   * Get all roles
   */
  getRoles: async (): Promise<RoleDto[]> => {
    return await apiClient.get<RoleDto[]>('/api/role');
  },

  /**
   * Get role by ID
   */
  getRoleById: async (id: number): Promise<RoleDto> => {
    return await apiClient.get<RoleDto>(`/api/role/${id}`);
  },

  /**
   * Get system roles
   */
  getSystemRoles: async (): Promise<SystemRoleDto[]> => {
    return await apiClient.get<SystemRoleDto[]>('/api/role/system');
  },

  /**
   * Get job roles
   */
  getJobRoles: async (): Promise<JobRoleDto[]> => {
    return await apiClient.get<JobRoleDto[]>('/api/role/job');
  },

  /**
   * Get job roles by department
   */
  getJobRolesByDepartment: async (departmentId: number): Promise<JobRoleDto[]> => {
    return await apiClient.get<JobRoleDto[]>(`/api/role/job/department/${departmentId}`);
  },

  /**
   * Create new role
   */
  createRole: async (role: CreateRoleRequest): Promise<RoleDto> => {
    return await apiClient.post<RoleDto>('/api/role', role);
  },

  /**
   * Create new job role
   */
  createJobRole: async (role: CreateJobRoleRequest): Promise<JobRoleDto> => {
    return await apiClient.post<JobRoleDto>('/api/role/job', role);
  },

  /**
   * Update role
   */
  updateRole: async (id: number, role: UpdateRoleRequest): Promise<RoleDto> => {
    return await apiClient.put<RoleDto>(`/api/role/${id}`, role);
  },

  /**
   * Update job role
   */
  updateJobRole: async (id: number, role: UpdateJobRoleRequest): Promise<JobRoleDto> => {
    return await apiClient.put<JobRoleDto>(`/api/role/job/${id}`, role);
  },

  /**
   * Update system role
   */
  updateSystemRole: async (id: number, role: UpdateSystemRoleRequest): Promise<SystemRoleDto> => {
    return await apiClient.put<SystemRoleDto>(`/api/role/system/${id}`, role);
  },

  /**
   * Delete role
   */
  deleteRole: async (id: number): Promise<{ message: string }> => {
    return await apiClient.delete<{ message: string }>(`/api/role/${id}`);
  },

  /**
   * Assign role to user
   */
  assignRole: async (request: AssignRoleRequest): Promise<{ message: string }> => {
    return await apiClient.post<{ message: string }>('/api/role/assign', request);
  },

  /**
   * Remove role from user
   */
  removeRole: async (userId: number, roleId: number): Promise<{ message: string }> => {
    return await apiClient.delete<{ message: string }>(`/api/role/remove/${userId}/${roleId}`);
  },

  /**
   * Get user role assignments
   */
  getUserRoles: async (userId: number): Promise<RoleAssignmentDto[]> => {
    return await apiClient.get<RoleAssignmentDto[]>(`/api/role/user/${userId}`);
  },

  /**
   * Get users by role
   */
  getUsersByRole: async (roleId: number): Promise<RoleAssignmentDto[]> => {
    return await apiClient.get<RoleAssignmentDto[]>(`/api/role/${roleId}/users`);
  },

  /**
   * Get active roles
   */
  getActiveRoles: async (): Promise<RoleDto[]> => {
    return await apiClient.get<RoleDto[]>('/api/role/active');
  },

  /**
   * Activate role
   */
  activateRole: async (id: number): Promise<{ message: string }> => {
    return await apiClient.put<{ message: string }>(`/api/role/${id}/activate`);
  },

  /**
   * Deactivate role
   */
  deactivateRole: async (id: number): Promise<{ message: string }> => {
    return await apiClient.put<{ message: string }>(`/api/role/${id}/deactivate`);
  },
};

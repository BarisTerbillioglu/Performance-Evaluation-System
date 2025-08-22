import { BaseEntity } from './common';

// Role DTOs matching backend
export interface RoleDto {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  isSystemRole: boolean;
  isJobRole: boolean;
}

export interface SystemRoleDto {
  id: number;
  name: string;
  description?: string;
  permissions: string[];
  isActive: boolean;
}

export interface JobRoleDto extends BaseEntity {
  id: number;
  name: string;
  description?: string;
  departmentId?: number;
  departmentName?: string;
  requirements: string[];
  responsibilities: string[];
  isActive: boolean;
}

export interface RoleAssignmentDto {
  userId: number;
  roleId: number;
  roleName: string;
  roleType: 'System' | 'Job';
  assignedDate: string;
  assignedBy: number;
  isActive: boolean;
}

// Request DTOs
export interface CreateRoleRequest {
  name: string;
  description?: string;
  isSystemRole: boolean;
  isJobRole: boolean;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateJobRoleRequest {
  name: string;
  description?: string;
  departmentId?: number;
  requirements: string[];
  responsibilities: string[];
}

export interface UpdateJobRoleRequest {
  name?: string;
  description?: string;
  departmentId?: number;
  requirements?: string[];
  responsibilities?: string[];
  isActive?: boolean;
}

export interface UpdateSystemRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface AssignRoleRequest {
  userId: number;
  roleId: number;
}

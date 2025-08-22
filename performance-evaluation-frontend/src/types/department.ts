import { BaseEntity } from './common';
import { UserSummaryDto } from './user';

// Department DTOs matching backend
export interface DepartmentDto extends BaseEntity {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface DepartmentWithUsersDto extends BaseEntity {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  users: UserSummaryDto[];
  userCount: number;
}

export interface DepartmentStatsDto {
  departmentId: number;
  departmentName: string;
  totalEmployees: number;
  activeEmployees: number;
  totalEvaluations: number;
  completedEvaluations: number;
  averageScore: number;
}

// Request DTOs
export interface CreateDepartmentRequest {
  name: string;
  description?: string;
}

export interface UpdateDepartmentRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

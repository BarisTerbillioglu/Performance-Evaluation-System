import { BaseEntity } from './common';

// Criteria DTOs matching backend
export interface CriteriaDto extends BaseEntity {
  id: number;
  categoryId: number;
  name: string;
  baseDescription?: string;
  categoryName: string;
  categoryWeight: number;
  isActive: boolean;
  roleDescriptions: CriteriaRoleDescriptionDto[];
}

export interface CriteriaRoleDescriptionDto {
  id: number;
  criteriaId: number;
  roleId: number;
  roleName: string;
  description: string;
  isActive: boolean;
}

export interface CriteriaWithRoleDescriptionDto {
  criteriaId: number;
  categoryName: string;
  criteriaName: string;
  baseDescription?: string;
  roleSpecificDescription?: string;
  categoryWeight: number;
  isActive: boolean;
}

export interface CriteriaWithScoreDto {
  criteriaId: number;
  name: string;
  categoryName: string;
  categoryWeight: number;
  baseDescription?: string;
  score?: number;
  comments: string[];
}

export interface CriteriaSummaryDto {
  criteriaId: number;
  name: string;
  categoryName: string;
  averageScore: number;
  totalEvaluations: number;
}

// Request DTOs
export interface CreateCriteriaRequest {
  categoryId: number;
  name: string;
  baseDescription?: string;
}

export interface UpdateCriteriaRequest {
  name?: string;
  baseDescription?: string;
  isActive?: boolean;
}

export interface AddRoleDescriptionRequest {
  roleId: number;
  description: string;
}

export interface UpdateRoleDescriptionRequest {
  description: string;
  isActive?: boolean;
}

// Search DTOs
export interface CriteriaSearchDto {
  id: number;
  name: string;
  categoryName: string;
  baseDescription?: string;
  isActive: boolean;
  createdDate: string;
}

export interface CriteriaSearchRequest {
  searchTerm?: string;
  categoryId?: number;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

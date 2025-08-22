import { BaseEntity } from './common';
import { CriteriaDto } from './criteria';

// Criteria Category DTOs matching backend
export interface CriteriaCategoryDto extends BaseEntity {
  id: number;
  name: string;
  description?: string;
  weight: number;
  isActive: boolean;
}

export interface CriteriaCategoryWithCriteriaDto extends BaseEntity {
  id: number;
  name: string;
  description?: string;
  weight: number;
  isActive: boolean;
  criteria: CriteriaDto[];
}

export interface CategoryWeightDto {
  categoryId: number;
  categoryName: string;
  currentWeight: number;
  proposedWeight: number;
}

export interface WeightValidationDto {
  isValid: boolean;
  totalWeight: number;
  categories: CategoryWeightDto[];
  errors: string[];
}

// Request DTOs
export interface CreateCriteriaCategoryRequest {
  name: string;
  description?: string;
  weight: number;
}

export interface UpdateCriteriaCategoryRequest {
  name?: string;
  description?: string;
  weight?: number;
  isActive?: boolean;
}

export interface RebalanceWeightRequest {
  categoryWeights: CategoryWeightDto[];
}

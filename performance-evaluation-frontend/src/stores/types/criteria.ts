import {
  CriteriaDto,
  CreateCriteriaRequest,
  UpdateCriteriaRequest,
  CriteriaCategoryDto,
  CriteriaCategoryWithCriteriaDto,
  CreateCriteriaCategoryRequest,
  UpdateCriteriaCategoryRequest,
  CriteriaRoleDescriptionDto,
  AddRoleDescriptionRequest,
  UpdateRoleDescriptionRequest,
  CategoryWeightDto,
  WeightValidationDto,
} from '@/types';

export interface CriteriaState {
  // Criteria data
  criteria: CriteriaDto[];
  currentCriteria: CriteriaDto | null;
  activeCriteria: CriteriaDto[];
  
  // Categories data
  categories: CriteriaCategoryDto[];
  currentCategory: CriteriaCategoryWithCriteriaDto | null;
  activeCategories: CriteriaCategoryDto[];
  
  // Role descriptions
  roleDescriptions: Record<number, CriteriaRoleDescriptionDto[]>; // keyed by criteriaId
  
  // Weight management
  categoryWeights: CategoryWeightDto[];
  weightValidation: WeightValidationDto | null;
  
  // UI state
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
  
  // Filters
  filters: {
    categoryId?: number;
    isActive?: boolean;
    roleId?: number;
  };
  
  // Cache timestamps
  lastFetch: Record<string, number>;
}

export interface CriteriaActions {
  // Criteria management
  fetchCriteria: (filters?: any) => Promise<void>;
  fetchCriteriaById: (id: number) => Promise<void>;
  fetchCriteriaByCategory: (categoryId: number) => Promise<void>;
  createCriteria: (data: CreateCriteriaRequest) => Promise<CriteriaDto>;
  updateCriteria: (id: number, data: UpdateCriteriaRequest) => Promise<void>;
  deleteCriteria: (id: number) => Promise<void>;
  activateCriteria: (id: number) => Promise<void>;
  deactivateCriteria: (id: number) => Promise<void>;
  
  // Category management
  fetchCategories: () => Promise<void>;
  fetchCategoryById: (id: number) => Promise<void>;
  createCategory: (data: CreateCriteriaCategoryRequest) => Promise<CriteriaCategoryDto>;
  updateCategory: (id: number, data: UpdateCriteriaCategoryRequest) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  activateCategory: (id: number) => Promise<void>;
  deactivateCategory: (id: number) => Promise<void>;
  
  // Role descriptions
  fetchRoleDescriptions: (criteriaId: number) => Promise<void>;
  addRoleDescription: (criteriaId: number, data: AddRoleDescriptionRequest) => Promise<void>;
  updateRoleDescription: (criteriaId: number, roleId: number, data: UpdateRoleDescriptionRequest) => Promise<void>;
  deleteRoleDescription: (criteriaId: number, roleId: number) => Promise<void>;
  
  // Weight management
  fetchCategoryWeights: () => Promise<void>;
  validateWeights: (weights: CategoryWeightDto[]) => Promise<void>;
  rebalanceWeights: (weights: CategoryWeightDto[]) => Promise<void>;
  
  // Optimistic updates
  addCriteriaOptimistic: (criteria: CriteriaDto) => void;
  updateCriteriaOptimistic: (id: number, data: Partial<CriteriaDto>) => void;
  removeCriteriaOptimistic: (id: number) => void;
  addCategoryOptimistic: (category: CriteriaCategoryDto) => void;
  updateCategoryOptimistic: (id: number, data: Partial<CriteriaCategoryDto>) => void;
  removeCategoryOptimistic: (id: number) => void;
  
  // Filters
  setFilters: (filters: Partial<CriteriaState['filters']>) => void;
  
  // UI state management
  setError: (error: string | null) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  
  // Cache management
  invalidateCache: (key?: string) => void;
  clearCurrentCriteria: () => void;
  clearCurrentCategory: () => void;
  reset: () => void;
}

export interface CriteriaStore extends CriteriaState, CriteriaActions {}

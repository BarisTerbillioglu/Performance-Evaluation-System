import {
  CriteriaDto,
  CreateCriteriaRequest,
  UpdateCriteriaRequest,
  CriteriaCategoryDto,
  CreateCriteriaCategoryRequest,
  UpdateCriteriaCategoryRequest,
  CriteriaRoleDescriptionDto,
  AddRoleDescriptionRequest,
  UpdateRoleDescriptionRequest,
  CategoryWeightDto,
  ApiError
} from '@/types';

export interface CriteriaState {
  criteria: CriteriaDto[];
  categories: CriteriaCategoryDto[];
  currentCriteria: CriteriaDto | null;
  currentCategory: CriteriaCategoryDto | null;
  roleDescriptions: CriteriaRoleDescriptionDto[];
  categoryWeights: CategoryWeightDto[];
  loading: {
    criteria: boolean;
    categories: boolean;
    weights: boolean;
    roleDescriptions: boolean;
  };
  error: string | null;
  filters: {
    categoryId?: number;
    isActive?: boolean;
    roleId?: number;
  };
  lastFetch: Record<string, number>;
}

export interface CriteriaActions {
  // Criteria management
  fetchCriteria: (filters?: any) => Promise<void>;
  fetchCriteriaById: (id: number) => Promise<void>;
  createCriteria: (data: CreateCriteriaRequest) => Promise<CriteriaDto>;
  updateCriteria: (id: number, data: UpdateCriteriaRequest) => Promise<void>;
  deleteCriteria: (id: number) => Promise<void>;

  // Category management
  fetchCategories: () => Promise<void>;
  fetchCategoryById: (id: number) => Promise<void>;
  createCategory: (data: CreateCriteriaCategoryRequest) => Promise<CriteriaCategoryDto>;
  updateCategory: (id: number, data: UpdateCriteriaCategoryRequest) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;

  // Role descriptions
  addRoleDescription: (criteriaId: number, data: AddRoleDescriptionRequest) => Promise<void>;
  updateRoleDescription: (criteriaId: number, roleId: number, data: UpdateRoleDescriptionRequest) => Promise<void>;
  deleteRoleDescription: (criteriaId: number, roleId: number) => Promise<void>;

  // Weight management
  fetchCategoryWeights: () => Promise<void>;
  rebalanceWeights: (weights: CategoryWeightDto[]) => Promise<void>;

  // Utility actions
  setError: (error: string | null) => void;
  clearError: () => void;
  setLoading: (key: keyof CriteriaState['loading'], loading: boolean) => void;
  reset: () => void;
}

export interface CriteriaStore extends CriteriaState, CriteriaActions {}

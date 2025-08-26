import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { StateCreator } from 'zustand';
import {
  criteriaService,
  criteriaCategoryService
} from '@/services';
import { loggerWithActions } from '../middleware/logger';
import {
  CriteriaDto,
  CriteriaCategoryDto,
  CreateCriteriaRequest,
  UpdateCriteriaRequest,
  CreateCriteriaCategoryRequest,
  UpdateCriteriaCategoryRequest,
  CriteriaRoleDescriptionDto,
  AddRoleDescriptionRequest,
  UpdateRoleDescriptionRequest,
  CategoryWeightDto,
  ApiError
} from '@/types';

interface CriteriaState {
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

interface CriteriaActions {
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

type CriteriaStoreType = CriteriaState & CriteriaActions;

const createCriteriaSlice: StateCreator<
  CriteriaStoreType,
  [['zustand/immer', never]],
  [],
  CriteriaStoreType
> = (set, get) => ({
  // State
  criteria: [],
  categories: [],
  currentCriteria: null,
  currentCategory: null,
  roleDescriptions: [],
  categoryWeights: [],
  loading: {
    criteria: false,
    categories: false,
    weights: false,
    roleDescriptions: false,
  },
  error: null,
  filters: {},
  lastFetch: {},

  // Actions
  fetchCriteria: async (filters = {}) => {
    set((state) => {
      state.loading.criteria = true;
      state.error = null;
    });

    try {
      const criteria: CriteriaDto[] = await criteriaService.getCriteria(filters);
      set((state) => {
        state.criteria = criteria;
        state.loading.criteria = false;
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
        state.loading.criteria = false;
      });
    }
  },

  fetchCriteriaById: async (id: number) => {
    set((state) => {
      state.loading.criteria = true;
    });

    try {
      const criteria: CriteriaDto = await criteriaService.getCriteriaById(id);
      set((state) => {
        state.currentCriteria = criteria;
        state.loading.criteria = false;
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
        state.loading.criteria = false;
      });
    }
  },

  createCriteria: async (data: CreateCriteriaRequest) => {
    const newCriteria: CriteriaDto = await criteriaService.createCriteria(data);

    set((state) => {
      state.criteria.push(newCriteria);
    });

    return newCriteria;
  },

  updateCriteria: async (id: number, data: UpdateCriteriaRequest) => {
    const updatedCriteria: CriteriaDto = await criteriaService.updateCriteria(id, data);

    set((state) => {
      const index = state.criteria.findIndex(c => c.id === id);
      if (index !== -1) {
        state.criteria[index] = updatedCriteria;
      }
      if (state.currentCriteria?.id === id) {
        state.currentCriteria = updatedCriteria;
      }
    });
  },

  deleteCriteria: async (id: number) => {
    await criteriaService.deleteCriteria(id);

    set((state) => {
      state.criteria = state.criteria.filter(c => c.id !== id);
      if (state.currentCriteria?.id === id) {
        state.currentCriteria = null;
      }
    });
  },

  fetchCategories: async () => {
    set((state) => {
      state.loading.categories = true;
    });

    try {
      const categories: CriteriaCategoryDto[] = await criteriaCategoryService.getCategories();
      set((state) => {
        state.categories = categories;
        state.loading.categories = false;
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
        state.loading.categories = false;
      });
    }
  },

  fetchCategoryById: async (id: number) => {
    set((state) => {
      state.loading.categories = true;
    });

    try {
      const category: CriteriaCategoryDto = await criteriaCategoryService.getCategoryById(id);
      set((state) => {
        state.currentCategory = category;
        state.loading.categories = false;
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
        state.loading.categories = false;
      });
    }
  },

  createCategory: async (data: CreateCriteriaCategoryRequest) => {
    const newCategory: CriteriaCategoryDto = await criteriaCategoryService.createCategory(data);

    set((state) => {
      state.categories.push(newCategory);
    });

    return newCategory;
  },

  updateCategory: async (id: number, data: UpdateCriteriaCategoryRequest) => {
    const updatedCategory: CriteriaCategoryDto = await criteriaCategoryService.updateCategory(id, data);

    set((state) => {
      const index = state.categories.findIndex(c => c.id === id);
      if (index !== -1) {
        state.categories[index] = updatedCategory;
      }
      if (state.currentCategory?.id === id) {
        state.currentCategory = updatedCategory;
      }
    });
  },

  deleteCategory: async (id: number) => {
    await criteriaCategoryService.deleteCategory(id);

    set((state) => {
      state.categories = state.categories.filter(c => c.id !== id);
      if (state.currentCategory?.id === id) {
        state.currentCategory = null;
      }
    });
  },

  addRoleDescription: async (criteriaId: number, data: AddRoleDescriptionRequest) => {
    await criteriaService.addRoleDescription(criteriaId, data);
    // Refetch criteria to get updated role descriptions
    await get().fetchCriteriaById(criteriaId);
  },

  updateRoleDescription: async (criteriaId: number, roleId: number, data: UpdateRoleDescriptionRequest) => {
    await criteriaService.updateRoleDescription(criteriaId, roleId, data);
    // Refetch criteria to get updated role descriptions
    await get().fetchCriteriaById(criteriaId);
  },

  deleteRoleDescription: async (criteriaId: number, roleId: number) => {
    await criteriaService.deleteRoleDescription(criteriaId, roleId);
    // Refetch criteria to get updated role descriptions
    await get().fetchCriteriaById(criteriaId);
  },

  fetchCategoryWeights: async () => {
    set((state) => {
      state.loading.weights = true;
    });

    try {
      const weights: CategoryWeightDto[] = await criteriaCategoryService.getCategoryWeights();
      set((state) => {
        state.categoryWeights = weights;
        state.loading.weights = false;
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
        state.loading.weights = false;
      });
    }
  },

  rebalanceWeights: async (weights: CategoryWeightDto[]) => {
    const rebalanced = await criteriaCategoryService.rebalanceWeights(weights);
    set((state) => {
      state.categoryWeights = rebalanced;
    });
  },

  setError: (error: string | null) => {
    set((state) => {
      state.error = error;
    });
  },

  clearError: () => {
    set((state) => {
      state.error = null;
    });
  },

  setLoading: (key: keyof CriteriaState['loading'], loading: boolean) => {
    set((state) => {
      state.loading[key] = loading;
    });
  },

  reset: () => {
    set((state) => {
      state.criteria = [];
      state.categories = [];
      state.currentCriteria = null;
      state.currentCategory = null;
      state.roleDescriptions = [];
      state.categoryWeights = [];
      state.loading = {
        criteria: false,
        categories: false,
        weights: false,
        roleDescriptions: false,
      };
      state.error = null;
      state.filters = {};
      state.lastFetch = {};
    });
  }
});

export const useCriteriaStore = create<CriteriaStoreType>()(
  loggerWithActions(
    immer(createCriteriaSlice),
    {
      name: 'CriteriaStore',
    }
  )
);

// Export selectors
export const criteriaSelectors = {
  criteria: (state: CriteriaStoreType) => state.criteria,
  currentCriteria: (state: CriteriaStoreType) => state.currentCriteria,
  activeCriteria: (state: CriteriaStoreType) => state.criteria.filter(c => c.isActive),
  categories: (state: CriteriaStoreType) => state.categories,
  currentCategory: (state: CriteriaStoreType) => state.currentCategory,
  activeCategories: (state: CriteriaStoreType) => state.categories.filter(c => c.isActive),
  categoryWeights: (state: CriteriaStoreType) => state.categoryWeights,
  loading: (state: CriteriaStoreType) => state.loading,
  error: (state: CriteriaStoreType) => state.error,
  roleDescriptions: (state: CriteriaStoreType) => state.roleDescriptions,
};

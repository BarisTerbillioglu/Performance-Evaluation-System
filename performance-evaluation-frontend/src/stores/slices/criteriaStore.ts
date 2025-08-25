import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { CriteriaStore } from '../types/criteria';
import { criteriaService, criteriaCategoryService } from '@/services';
import { loggerWithActions } from '../middleware/logger';
import { useUIStore } from './uiStore';

const initialState = {
  criteria: [],
  currentCriteria: null,
  activeCriteria: [],
  categories: [],
  currentCategory: null,
  activeCategories: [],
  roleDescriptions: {},
  categoryWeights: [],
  weightValidation: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
  filters: {},
  lastFetch: {},
};

export const useCriteriaStore = create<CriteriaStore>()(
  loggerWithActions(
    immer((set, get) => ({
        // Initial state
        ...initialState,

        // Criteria management
        fetchCriteria: async (filters: any = {}) => {
          try {
            set((state: CriteriaStore) => {
              state.isLoading = true;
              state.error = null;
            });

            useUIStore.getState().setLoading('fetchCriteria', true);

            const response = await criteriaService.getCriteria();

            set((state: CriteriaStore) => {
              state.criteria = response.data;
              state.isLoading = false;
              state.lastFetch.criteria = Date.now();
            });

            useUIStore.getState().setLoading('fetchCriteria', false);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch criteria';
            set((state: CriteriaStore) => {
              state.error = errorMessage;
              state.isLoading = false;
            });
            useUIStore.getState().setLoading('fetchCriteria', false);
            useUIStore.getState().showError('Failed to load criteria', errorMessage);
            throw error;
          }
        },

        fetchCriteriaById: async (id: number) => {
          try {
            set((state: CriteriaStore) => {
              state.isLoading = true;
              state.error = null;
            });

            const criteria = await criteriaService.getCriteriaById(id);

            set((state: CriteriaStore) => {
              state.currentCriteria = criteria;
              state.isLoading = false;
              state.lastFetch[`criteria-${id}`] = Date.now();
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch criteria';
            set((state: CriteriaStore) => {
              state.error = errorMessage;
              state.isLoading = false;
            });
            useUIStore.getState().showError('Failed to load criteria', errorMessage);
            throw error;
          }
        },

        fetchCriteriaByCategory: async (categoryId: number) => {
          try {
            const criteria = await criteriaService.getCriteriaByCategory(categoryId);

            set((state: CriteriaStore) => {
              // Update criteria for this category
              state.criteria = [
                ...state.criteria.filter((c: CriteriaDto) => c.categoryId !== categoryId),
                ...criteria
              ];
              state.lastFetch[`criteria-category-${categoryId}`] = Date.now();
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch criteria by category';
            set((state) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to load criteria', errorMessage);
            throw error;
          }
        },

        createCriteria: async (data: CreateCriteriaRequest) => {
          try {
            set((state: CriteriaStore) => {
              state.isCreating = true;
              state.error = null;
            });

            useUIStore.getState().setLoading('createCriteria', true);

            const newCriteria = await criteriaService.createCriteria(data);

            set((state: CriteriaStore) => {
              state.isCreating = false;
              // Invalidate criteria cache
              delete state.lastFetch.criteria;
            });

            useUIStore.getState().setLoading('createCriteria', false);
            useUIStore.getState().showSuccess('Criteria created successfully');

            // Refresh criteria list
            get().fetchCriteria();

            return newCriteria;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create criteria';
            set((state: CriteriaStore) => {
              state.error = errorMessage;
              state.isCreating = false;
            });
            useUIStore.getState().setLoading('createCriteria', false);
            useUIStore.getState().showError('Failed to create criteria', errorMessage);
            throw error;
          }
        },

        updateCriteria: async (id: number, data: UpdateCriteriaRequest) => {
          try {
            set((state: CriteriaStore) => {
              state.isUpdating = true;
              state.error = null;
            });

            useUIStore.getState().setLoading('updateCriteria', true);

            await criteriaService.updateCriteria(id, data);

            set((state: CriteriaStore) => {
              state.isUpdating = false;
              // Invalidate cache
              delete state.lastFetch.criteria;
              delete state.lastFetch[`criteria-${id}`];
            });

            useUIStore.getState().setLoading('updateCriteria', false);
            useUIStore.getState().showSuccess('Criteria updated successfully');

            // Refresh data
            get().fetchCriteria();
            if (get().currentCriteria?.id === id) {
              get().fetchCriteriaById(id);
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update criteria';
            set((state: CriteriaStore) => {
              state.error = errorMessage;
              state.isUpdating = false;
            });
            useUIStore.getState().setLoading('updateCriteria', false);
            useUIStore.getState().showError('Failed to update criteria', errorMessage);
            throw error;
          }
        },

        deleteCriteria: async (id: number) => {
          try {
            // Optimistic update
            const previousCriteria = get().criteria;
            set((state: CriteriaStore) => {
              state.criteria = state.criteria.filter((c: CriteriaDto) => c.id !== id);
            });

            await criteriaService.deleteCriteria(id);

            set((state: CriteriaStore) => {
              // Clear related data
              if (state.currentCriteria?.id === id) {
                state.currentCriteria = null;
              }
              delete state.lastFetch[`criteria-${id}`];
              delete state.lastFetch.criteria;
            });

            useUIStore.getState().showSuccess('Criteria deleted successfully');
          } catch (error) {
            // Revert optimistic update
            set((state: CriteriaStore) => {
              state.criteria = previousCriteria;
            });

            const errorMessage = error instanceof Error ? error.message : 'Failed to delete criteria';
            set((state: CriteriaStore) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to delete criteria', errorMessage);
            throw error;
          }
        },

        activateCriteria: async (id: number) => {
          try {
            // Optimistic update
            set((state: CriteriaStore) => {
              const criteria = state.criteria.find((c: CriteriaDto) => c.id === id);
              if (criteria) {
                criteria.isActive = true;
              }
            });

            await criteriaService.activateCriteria(id);

            useUIStore.getState().showSuccess('Criteria activated successfully');
          } catch (error) {
            // Revert optimistic update
            set((state: CriteriaStore) => {
              const criteria = state.criteria.find((c: CriteriaDto) => c.id === id);
              if (criteria) {
                criteria.isActive = false;
              }
            });

            const errorMessage = error instanceof Error ? error.message : 'Failed to activate criteria';
            set((state: CriteriaStore) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to activate criteria', errorMessage);
            throw error;
          }
        },

        deactivateCriteria: async (id: number) => {
          try {
            // Optimistic update
            set((state: CriteriaStore) => {
              const criteria = state.criteria.find((c: CriteriaDto) => c.id === id);
              if (criteria) {
                criteria.isActive = false;
              }
            });

            await criteriaService.deactivateCriteria(id);

            useUIStore.getState().showSuccess('Criteria deactivated successfully');
          } catch (error) {
            // Revert optimistic update
            set((state: CriteriaStore) => {
              const criteria = state.criteria.find((c: CriteriaDto) => c.id === id);
              if (criteria) {
                criteria.isActive = true;
              }
            });

            const errorMessage = error instanceof Error ? error.message : 'Failed to deactivate criteria';
            set((state: CriteriaStore) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to deactivate criteria', errorMessage);
            throw error;
          }
        },

        // Category management
        fetchCategories: async () => {
          try {
            set((state: CriteriaStore) => {
              state.isLoading = true;
              state.error = null;
            });

            const response = await criteriaCategoryService.getCategories();

            set((state: CriteriaStore) => {
              state.categories = response.data;
              state.isLoading = false;
              state.lastFetch.categories = Date.now();
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch categories';
            set((state: CriteriaStore) => {
              state.error = errorMessage;
              state.isLoading = false;
            });
            useUIStore.getState().showError('Failed to load categories', errorMessage);
            throw error;
          }
        },

        fetchCategoryById: async (id: number) => {
          try {
            const category = await criteriaCategoryService.getCategoryWithCriteria(id);

            set((state: CriteriaStore) => {
              state.currentCategory = category;
              state.lastFetch[`category-${id}`] = Date.now();
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch category';
            set((state: CriteriaStore) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to load category', errorMessage);
            throw error;
          }
        },

        createCategory: async (data: CreateCriteriaCategoryRequest) => {
          try {
            set((state: CriteriaStore) => {
              state.isCreating = true;
              state.error = null;
            });

            const newCategory = await criteriaCategoryService.createCategory(data);

            set((state: CriteriaStore) => {
              state.isCreating = false;
              // Invalidate categories cache
              delete state.lastFetch.categories;
            });

            useUIStore.getState().showSuccess('Category created successfully');

            // Refresh categories list
            get().fetchCategories();

            return newCategory;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create category';
            set((state: CriteriaStore) => {
              state.error = errorMessage;
              state.isCreating = false;
            });
            useUIStore.getState().showError('Failed to create category', errorMessage);
            throw error;
          }
        },

        updateCategory: async (id: number, data: UpdateCriteriaCategoryRequest) => {
          try {
            set((state: CriteriaStore) => {
              state.isUpdating = true;
              state.error = null;
            });

            await criteriaCategoryService.updateCategory(id, data);

            set((state: CriteriaStore) => {
              state.isUpdating = false;
              // Invalidate cache
              delete state.lastFetch.categories;
              delete state.lastFetch[`category-${id}`];
            });

            useUIStore.getState().showSuccess('Category updated successfully');

            // Refresh data
            get().fetchCategories();
            if (get().currentCategory?.id === id) {
              get().fetchCategoryById(id);
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update category';
            set((state: CriteriaStore) => {
              state.error = errorMessage;
              state.isUpdating = false;
            });
            useUIStore.getState().showError('Failed to update category', errorMessage);
            throw error;
          }
        },

        deleteCategory: async (id: number) => {
          try {
            // Optimistic update
            const previousCategories = get().categories;
            set((state: CriteriaStore) => {
              state.categories = state.categories.filter((c: CriteriaCategoryDto) => c.id !== id);
            });

            await criteriaCategoryService.deleteCategory(id);

            set((state: CriteriaStore) => {
              // Clear related data
              if (state.currentCategory?.id === id) {
                state.currentCategory = null;
              }
              delete state.lastFetch[`category-${id}`];
              delete state.lastFetch.categories;
            });

            useUIStore.getState().showSuccess('Category deleted successfully');
          } catch (error) {
            // Revert optimistic update
            set((state: CriteriaStore) => {
              state.categories = previousCategories;
            });

            const errorMessage = error instanceof Error ? error.message : 'Failed to delete category';
            set((state: CriteriaStore) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to delete category', errorMessage);
            throw error;
          }
        },

        activateCategory: async (id: number) => {
          try {
            // Optimistic update
            set((state: CriteriaStore) => {
              const category = state.categories.find((c: CriteriaCategoryDto) => c.id === id);
              if (category) {
                category.isActive = true;
              }
            });

            await criteriaCategoryService.activateCategory(id);

            useUIStore.getState().showSuccess('Category activated successfully');
          } catch (error) {
            // Revert optimistic update
            set((state: CriteriaStore) => {
              const category = state.categories.find((c: CriteriaCategoryDto) => c.id === id);
              if (category) {
                category.isActive = false;
              }
            });

            const errorMessage = error instanceof Error ? error.message : 'Failed to activate category';
            set((state: CriteriaStore) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to activate category', errorMessage);
            throw error;
          }
        },

        deactivateCategory: async (id: number) => {
          try {
            // Optimistic update
            set((state: CriteriaStore) => {
              const category = state.categories.find((c: CriteriaCategoryDto) => c.id === id);
              if (category) {
                category.isActive = false;
              }
            });

            await criteriaCategoryService.deactivateCategory(id);

            useUIStore.getState().showSuccess('Category deactivated successfully');
          } catch (error) {
            // Revert optimistic update
            set((state: CriteriaStore) => {
              const category = state.categories.find((c: CriteriaCategoryDto) => c.id === id);
              if (category) {
                category.isActive = true;
              }
            });

            const errorMessage = error instanceof Error ? error.message : 'Failed to deactivate category';
            set((state: CriteriaStore) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to deactivate category', errorMessage);
            throw error;
          }
        },

        // Role descriptions
        fetchRoleDescriptions: async (criteriaId: number) => {
          try {
            // Note: This would need to be implemented in the service
            // For now, we'll use the role descriptions from the criteria
            const criteria = await criteriaService.getCriteriaById(criteriaId);

            set((state: CriteriaStore) => {
              state.roleDescriptions[criteriaId] = criteria.roleDescriptions;
              state.lastFetch[`role-descriptions-${criteriaId}`] = Date.now();
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch role descriptions';
            set((state: CriteriaStore) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to load role descriptions', errorMessage);
            throw error;
          }
        },

        addRoleDescription: async (criteriaId: number, data: AddRoleDescriptionRequest) => {
          try {
            await criteriaService.addRoleDescription(criteriaId, data);

            // Refresh role descriptions
            get().fetchRoleDescriptions(criteriaId);

            useUIStore.getState().showSuccess('Role description added successfully');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to add role description';
            set((state: CriteriaStore) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to add role description', errorMessage);
            throw error;
          }
        },

        updateRoleDescription: async (criteriaId: number, roleId: number, data: UpdateRoleDescriptionRequest) => {
          try {
            await criteriaService.updateRoleDescription(criteriaId, roleId, data);

            // Refresh role descriptions
            get().fetchRoleDescriptions(criteriaId);

            useUIStore.getState().showSuccess('Role description updated successfully');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update role description';
            set((state: CriteriaStore) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to update role description', errorMessage);
            throw error;
          }
        },

        deleteRoleDescription: async (criteriaId: number, roleId: number) => {
          try {
            await criteriaService.deleteRoleDescription(criteriaId, roleId);

            // Remove from state
            set((state: CriteriaStore) => {
              const descriptions = state.roleDescriptions[criteriaId] || [];
              state.roleDescriptions[criteriaId] = descriptions.filter((d: CriteriaRoleDescriptionDto) => d.roleId !== roleId);
            });

            useUIStore.getState().showSuccess('Role description deleted successfully');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete role description';
            set((state: CriteriaStore) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to delete role description', errorMessage);
            throw error;
          }
        },

        // Weight management
        fetchCategoryWeights: async () => {
          try {
            const response = await criteriaCategoryService.getCategoryWeights();

            set((state: CriteriaStore) => {
              state.categoryWeights = response.data;
              state.lastFetch.categoryWeights = Date.now();
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch category weights';
            set((state: CriteriaStore) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to load category weights', errorMessage);
            throw error;
          }
        },

        validateWeights: async (weights: CategoryWeightDto[]) => {
          try {
            const validation = await criteriaCategoryService.validateWeights(weights);

            set((state: CriteriaStore) => {
              state.weightValidation = validation;
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to validate weights';
            set((state: CriteriaStore) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to validate weights', errorMessage);
            throw error;
          }
        },

        rebalanceWeights: async (weights: CategoryWeightDto[]) => {
          try {
            const result = await criteriaCategoryService.rebalanceWeights({ categoryWeights: weights });

            set((state: CriteriaStore) => {
              state.categoryWeights = result.weights;
            });

            useUIStore.getState().showSuccess('Weights rebalanced successfully');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to rebalance weights';
            set((state: CriteriaStore) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to rebalance weights', errorMessage);
            throw error;
          }
        },

        // Optimistic updates
        addCriteriaOptimistic: (criteria: CriteriaDto) => {
          set((state: CriteriaStore) => {
            state.criteria.unshift(criteria);
          });
        },

        updateCriteriaOptimistic: (id: number, data: Partial<CriteriaDto>) => {
          set((state: CriteriaStore) => {
            const criteriaIndex = state.criteria.findIndex((c: CriteriaDto) => c.id === id);
            if (criteriaIndex !== -1) {
              state.criteria[criteriaIndex] = { ...state.criteria[criteriaIndex], ...data };
            }
          });
        },

        removeCriteriaOptimistic: (id: number) => {
          set((state: CriteriaStore) => {
            state.criteria = state.criteria.filter((c: CriteriaDto) => c.id !== id);
          });
        },

        addCategoryOptimistic: (category: CriteriaCategoryDto) => {
          set((state: CriteriaStore) => {
            state.categories.unshift(category);
          });
        },

        updateCategoryOptimistic: (id: number, data: Partial<CriteriaCategoryDto>) => {
          set((state: CriteriaStore) => {
            const categoryIndex = state.categories.findIndex((c: CriteriaCategoryDto) => c.id === id);
            if (categoryIndex !== -1) {
              state.categories[categoryIndex] = { ...state.categories[categoryIndex], ...data };
            }
          });
        },

        removeCategoryOptimistic: (id: number) => {
          set((state: CriteriaStore) => {
            state.categories = state.categories.filter((c: CriteriaCategoryDto) => c.id !== id);
          });
        },

        // Filters
        setFilters: (filters: Partial<CriteriaState['filters']>) => {
          set((state: CriteriaStore) => {
            state.filters = { ...state.filters, ...filters };
          });
        },

        // UI state management
        setError: (error: string | null) => {
          set((state: CriteriaStore) => {
            state.error = error;
          });
        },

        clearError: () => {
          set((state: CriteriaStore) => {
            state.error = null;
          });
        },

        setLoading: (loading: boolean) => {
          set((state: CriteriaStore) => {
            state.isLoading = loading;
          });
        },

        // Cache management
        invalidateCache: (key?: string) => {
          set((state: CriteriaStore) => {
            if (key) {
              delete state.lastFetch[key];
            } else {
              state.lastFetch = {};
            }
          });
        },

        clearCurrentCriteria: () => {
          set((state: CriteriaStore) => {
            state.currentCriteria = null;
          });
        },

        clearCurrentCategory: () => {
          set((state: CriteriaStore) => {
            state.currentCategory = null;
          });
        },

        reset: () => {
          set((state: CriteriaStore) => {
            Object.assign(state, initialState);
          });
        },
      })),
      {
        name: 'CriteriaStore',
      }
    )
  );

// Export selectors
export const criteriaSelectors = {
  criteria: (state: CriteriaStore) => state.criteria,
  currentCriteria: (state: CriteriaStore) => state.currentCriteria,
  activeCriteria: (state: CriteriaStore) => state.criteria.filter(c => c.isActive),
  categories: (state: CriteriaStore) => state.categories,
  currentCategory: (state: CriteriaStore) => state.currentCategory,
  activeCategories: (state: CriteriaStore) => state.categories.filter(c => c.isActive),
  categoryWeights: (state: CriteriaStore) => state.categoryWeights,
  weightValidation: (state: CriteriaStore) => state.weightValidation,
  isLoading: (state: CriteriaStore) => state.isLoading,
  error: (state: CriteriaStore) => state.error,
  roleDescriptions: (criteriaId: number) => (state: CriteriaStore) => state.roleDescriptions[criteriaId] || [],
};

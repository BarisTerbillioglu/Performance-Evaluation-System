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
        fetchCriteria: async (filters = {}) => {
          try {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            useUIStore.getState().setLoading('fetchCriteria', true);

            const criteria = await criteriaService.getCriteria();

            set((state) => {
              state.criteria = criteria;
              state.isLoading = false;
              state.lastFetch.criteria = Date.now();
            });

            useUIStore.getState().setLoading('fetchCriteria', false);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch criteria';
            set((state) => {
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
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            const criteria = await criteriaService.getCriteriaById(id);

            set((state) => {
              state.currentCriteria = criteria;
              state.isLoading = false;
              state.lastFetch[`criteria-${id}`] = Date.now();
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch criteria';
            set((state) => {
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

            set((state) => {
              // Update criteria for this category
              state.criteria = [
                ...state.criteria.filter(c => c.categoryId !== categoryId),
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

        createCriteria: async (data) => {
          try {
            set((state) => {
              state.isCreating = true;
              state.error = null;
            });

            useUIStore.getState().setLoading('createCriteria', true);

            const newCriteria = await criteriaService.createCriteria(data);

            set((state) => {
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
            set((state) => {
              state.error = errorMessage;
              state.isCreating = false;
            });
            useUIStore.getState().setLoading('createCriteria', false);
            useUIStore.getState().showError('Failed to create criteria', errorMessage);
            throw error;
          }
        },

        updateCriteria: async (id: number, data) => {
          try {
            set((state) => {
              state.isUpdating = true;
              state.error = null;
            });

            useUIStore.getState().setLoading('updateCriteria', true);

            await criteriaService.updateCriteria(id, data);

            set((state) => {
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
            set((state) => {
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
            set((state) => {
              state.criteria = state.criteria.filter(c => c.id !== id);
            });

            await criteriaService.deleteCriteria(id);

            set((state) => {
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
            set((state) => {
              state.criteria = previousCriteria;
            });

            const errorMessage = error instanceof Error ? error.message : 'Failed to delete criteria';
            set((state) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to delete criteria', errorMessage);
            throw error;
          }
        },

        activateCriteria: async (id: number) => {
          try {
            // Optimistic update
            set((state) => {
              const criteria = state.criteria.find(c => c.id === id);
              if (criteria) {
                criteria.isActive = true;
              }
            });

            await criteriaService.activateCriteria(id);

            useUIStore.getState().showSuccess('Criteria activated successfully');
          } catch (error) {
            // Revert optimistic update
            set((state) => {
              const criteria = state.criteria.find(c => c.id === id);
              if (criteria) {
                criteria.isActive = false;
              }
            });

            const errorMessage = error instanceof Error ? error.message : 'Failed to activate criteria';
            set((state) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to activate criteria', errorMessage);
            throw error;
          }
        },

        deactivateCriteria: async (id: number) => {
          try {
            // Optimistic update
            set((state) => {
              const criteria = state.criteria.find(c => c.id === id);
              if (criteria) {
                criteria.isActive = false;
              }
            });

            await criteriaService.deactivateCriteria(id);

            useUIStore.getState().showSuccess('Criteria deactivated successfully');
          } catch (error) {
            // Revert optimistic update
            set((state) => {
              const criteria = state.criteria.find(c => c.id === id);
              if (criteria) {
                criteria.isActive = true;
              }
            });

            const errorMessage = error instanceof Error ? error.message : 'Failed to deactivate criteria';
            set((state) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to deactivate criteria', errorMessage);
            throw error;
          }
        },

        // Category management
        fetchCategories: async () => {
          try {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            const categories = await criteriaCategoryService.getCategories();

            set((state) => {
              state.categories = categories;
              state.isLoading = false;
              state.lastFetch.categories = Date.now();
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch categories';
            set((state) => {
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

            set((state) => {
              state.currentCategory = category;
              state.lastFetch[`category-${id}`] = Date.now();
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch category';
            set((state) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to load category', errorMessage);
            throw error;
          }
        },

        createCategory: async (data) => {
          try {
            set((state) => {
              state.isCreating = true;
              state.error = null;
            });

            const newCategory = await criteriaCategoryService.createCategory(data);

            set((state) => {
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
            set((state) => {
              state.error = errorMessage;
              state.isCreating = false;
            });
            useUIStore.getState().showError('Failed to create category', errorMessage);
            throw error;
          }
        },

        updateCategory: async (id: number, data) => {
          try {
            set((state) => {
              state.isUpdating = true;
              state.error = null;
            });

            await criteriaCategoryService.updateCategory(id, data);

            set((state) => {
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
            set((state) => {
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
            set((state) => {
              state.categories = state.categories.filter(c => c.id !== id);
            });

            await criteriaCategoryService.deleteCategory(id);

            set((state) => {
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
            set((state) => {
              state.categories = previousCategories;
            });

            const errorMessage = error instanceof Error ? error.message : 'Failed to delete category';
            set((state) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to delete category', errorMessage);
            throw error;
          }
        },

        activateCategory: async (id: number) => {
          try {
            // Optimistic update
            set((state) => {
              const category = state.categories.find(c => c.id === id);
              if (category) {
                category.isActive = true;
              }
            });

            await criteriaCategoryService.activateCategory(id);

            useUIStore.getState().showSuccess('Category activated successfully');
          } catch (error) {
            // Revert optimistic update
            set((state) => {
              const category = state.categories.find(c => c.id === id);
              if (category) {
                category.isActive = false;
              }
            });

            const errorMessage = error instanceof Error ? error.message : 'Failed to activate category';
            set((state) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to activate category', errorMessage);
            throw error;
          }
        },

        deactivateCategory: async (id: number) => {
          try {
            // Optimistic update
            set((state) => {
              const category = state.categories.find(c => c.id === id);
              if (category) {
                category.isActive = false;
              }
            });

            await criteriaCategoryService.deactivateCategory(id);

            useUIStore.getState().showSuccess('Category deactivated successfully');
          } catch (error) {
            // Revert optimistic update
            set((state) => {
              const category = state.categories.find(c => c.id === id);
              if (category) {
                category.isActive = true;
              }
            });

            const errorMessage = error instanceof Error ? error.message : 'Failed to deactivate category';
            set((state) => {
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

            set((state) => {
              state.roleDescriptions[criteriaId] = criteria.roleDescriptions;
              state.lastFetch[`role-descriptions-${criteriaId}`] = Date.now();
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch role descriptions';
            set((state) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to load role descriptions', errorMessage);
            throw error;
          }
        },

        addRoleDescription: async (criteriaId: number, data) => {
          try {
            await criteriaService.addRoleDescription(criteriaId, data);

            // Refresh role descriptions
            get().fetchRoleDescriptions(criteriaId);

            useUIStore.getState().showSuccess('Role description added successfully');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to add role description';
            set((state) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to add role description', errorMessage);
            throw error;
          }
        },

        updateRoleDescription: async (criteriaId: number, roleId: number, data) => {
          try {
            await criteriaService.updateRoleDescription(criteriaId, roleId, data);

            // Refresh role descriptions
            get().fetchRoleDescriptions(criteriaId);

            useUIStore.getState().showSuccess('Role description updated successfully');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update role description';
            set((state) => {
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
            set((state) => {
              const descriptions = state.roleDescriptions[criteriaId] || [];
              state.roleDescriptions[criteriaId] = descriptions.filter(d => d.roleId !== roleId);
            });

            useUIStore.getState().showSuccess('Role description deleted successfully');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete role description';
            set((state) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to delete role description', errorMessage);
            throw error;
          }
        },

        // Weight management
        fetchCategoryWeights: async () => {
          try {
            const weights = await criteriaCategoryService.getCategoryWeights();

            set((state) => {
              state.categoryWeights = weights;
              state.lastFetch.categoryWeights = Date.now();
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch category weights';
            set((state) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to load category weights', errorMessage);
            throw error;
          }
        },

        validateWeights: async (weights) => {
          try {
            const validation = await criteriaCategoryService.validateWeights(weights);

            set((state) => {
              state.weightValidation = validation;
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to validate weights';
            set((state) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to validate weights', errorMessage);
            throw error;
          }
        },

        rebalanceWeights: async (weights) => {
          try {
            const result = await criteriaCategoryService.rebalanceWeights({ categoryWeights: weights });

            set((state) => {
              state.categoryWeights = result.weights;
            });

            useUIStore.getState().showSuccess('Weights rebalanced successfully');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to rebalance weights';
            set((state) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to rebalance weights', errorMessage);
            throw error;
          }
        },

        // Optimistic updates
        addCriteriaOptimistic: (criteria) => {
          set((state) => {
            state.criteria.unshift(criteria);
          });
        },

        updateCriteriaOptimistic: (id, data) => {
          set((state) => {
            const criteriaIndex = state.criteria.findIndex(c => c.id === id);
            if (criteriaIndex !== -1) {
              state.criteria[criteriaIndex] = { ...state.criteria[criteriaIndex], ...data };
            }
          });
        },

        removeCriteriaOptimistic: (id) => {
          set((state) => {
            state.criteria = state.criteria.filter(c => c.id !== id);
          });
        },

        addCategoryOptimistic: (category) => {
          set((state) => {
            state.categories.unshift(category);
          });
        },

        updateCategoryOptimistic: (id, data) => {
          set((state) => {
            const categoryIndex = state.categories.findIndex(c => c.id === id);
            if (categoryIndex !== -1) {
              state.categories[categoryIndex] = { ...state.categories[categoryIndex], ...data };
            }
          });
        },

        removeCategoryOptimistic: (id) => {
          set((state) => {
            state.categories = state.categories.filter(c => c.id !== id);
          });
        },

        // Filters
        setFilters: (filters) => {
          set((state) => {
            state.filters = { ...state.filters, ...filters };
          });
        },

        // UI state management
        setError: (error) => {
          set((state) => {
            state.error = error;
          });
        },

        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },

        setLoading: (loading) => {
          set((state) => {
            state.isLoading = loading;
          });
        },

        // Cache management
        invalidateCache: (key) => {
          set((state) => {
            if (key) {
              delete state.lastFetch[key];
            } else {
              state.lastFetch = {};
            }
          });
        },

        clearCurrentCriteria: () => {
          set((state) => {
            state.currentCriteria = null;
          });
        },

        clearCurrentCategory: () => {
          set((state) => {
            state.currentCategory = null;
          });
        },

        reset: () => {
          set((state) => {
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

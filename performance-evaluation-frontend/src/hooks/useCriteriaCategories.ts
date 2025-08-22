import { useState, useEffect, useCallback } from 'react';
import { 
  CriteriaCategoryDto, 
  WeightValidationDto,
  CategoryWeightDto 
} from '@/types';
import { criteriaCategoryService } from '@/services/criteriaCategoryService';
import { useAuth } from './useAuth';

export const useCriteriaCategories = () => {
  const [categories, setCategories] = useState<CriteriaCategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weightValidation, setWeightValidation] = useState<WeightValidationDto | null>(null);
  const { user } = useAuth();

  const fetchCategories = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await criteriaCategoryService.getCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const validateWeights = useCallback(async () => {
    if (!user || categories.length === 0) return;

    try {
      const weights: CategoryWeightDto[] = categories.map(category => ({
        categoryId: category.id,
        categoryName: category.name,
        currentWeight: category.weight,
        proposedWeight: category.weight
      }));

      const validation = await criteriaCategoryService.validateWeights(weights);
      setWeightValidation(validation);
    } catch (err) {
      console.error('Error validating weights:', err);
    }
  }, [user, categories]);

  const rebalanceWeights = useCallback(async (newWeights: CategoryWeightDto[]) => {
    if (!user) return false;

    try {
      await criteriaCategoryService.rebalanceWeights({ categoryWeights: newWeights });
      await fetchCategories();
      await validateWeights();
      return true;
    } catch (err) {
      console.error('Error rebalancing weights:', err);
      return false;
    }
  }, [user, fetchCategories, validateWeights]);

  const createCategory = useCallback(async (categoryData: {
    name: string;
    description?: string;
    weight: number;
  }) => {
    if (!user) return false;

    try {
      await criteriaCategoryService.createCategory(categoryData);
      await fetchCategories();
      return true;
    } catch (err) {
      console.error('Error creating category:', err);
      throw err;
    }
  }, [user, fetchCategories]);

  const updateCategory = useCallback(async (
    id: number, 
    categoryData: {
      name?: string;
      description?: string;
      weight?: number;
      isActive?: boolean;
    }
  ) => {
    if (!user) return false;

    try {
      await criteriaCategoryService.updateCategory(id, categoryData);
      await fetchCategories();
      return true;
    } catch (err) {
      console.error('Error updating category:', err);
      throw err;
    }
  }, [user, fetchCategories]);

  const deleteCategory = useCallback(async (id: number) => {
    if (!user) return false;

    try {
      await criteriaCategoryService.deleteCategory(id);
      await fetchCategories();
      return true;
    } catch (err) {
      console.error('Error deleting category:', err);
      throw err;
    }
  }, [user, fetchCategories]);

  const toggleCategoryStatus = useCallback(async (id: number, isActive: boolean) => {
    if (!user) return false;

    try {
      if (isActive) {
        await criteriaCategoryService.activateCategory(id);
      } else {
        await criteriaCategoryService.deactivateCategory(id);
      }
      await fetchCategories();
      return true;
    } catch (err) {
      console.error('Error toggling category status:', err);
      throw err;
    }
  }, [user, fetchCategories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    weightValidation,
    refetch: fetchCategories,
    validateWeights,
    rebalanceWeights,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus
  };
};

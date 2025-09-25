import { apiClient } from './api';
import {
  CriteriaCategoryDto,
  CriteriaCategoryWithCriteriaDto,
  CategoryWeightDto,
  WeightValidationDto,
  CreateCriteriaCategoryRequest,
  UpdateCriteriaCategoryRequest,
  RebalanceWeightRequest,
} from '@/types';

export const criteriaCategoryService = {
  /**
   * Get all criteria categories
   */
  getCategories: async (): Promise<CriteriaCategoryDto[]> => {
    return await apiClient.get<CriteriaCategoryDto[]>('/api/criteriacategory');
  },

  /**
   * Get category by ID
   */
  getCategoryById: async (id: number): Promise<CriteriaCategoryDto> => {
    return await apiClient.get<CriteriaCategoryDto>(`/api/criteriacategory/${id}`);
  },

  /**
   * Get category with criteria
   */
  getCategoryWithCriteria: async (id: number): Promise<CriteriaCategoryWithCriteriaDto> => {
    return await apiClient.get<CriteriaCategoryWithCriteriaDto>(`/api/criteriacategory/${id}/with-criteria`);
  },

  /**
   * Get all categories with criteria
   */
  getCategoriesWithCriteria: async (): Promise<CriteriaCategoryWithCriteriaDto[]> => {
    return await apiClient.get<CriteriaCategoryWithCriteriaDto[]>('/api/criteriacategory/with-criteria');
  },

  /**
   * Create new category
   */
  createCategory: async (category: CreateCriteriaCategoryRequest): Promise<CriteriaCategoryDto> => {
    return await apiClient.post<CriteriaCategoryDto>('/api/criteriacategory', category);
  },

  /**
   * Update category
   */
  updateCategory: async (id: number, category: UpdateCriteriaCategoryRequest): Promise<CriteriaCategoryDto> => {
    return await apiClient.put<CriteriaCategoryDto>(`/api/criteriacategory/${id}`, category);
  },

  /**
   * Delete category
   */
  deleteCategory: async (id: number): Promise<{ message: string }> => {
    return await apiClient.delete<{ message: string }>(`/api/criteriacategory/${id}`);
  },

  /**
   * Get category weights
   */
  getCategoryWeights: async (): Promise<CategoryWeightDto[]> => {
    return await apiClient.get<CategoryWeightDto[]>('/api/criteriacategory/weights');
  },

  /**
   * Validate weights
   */
  validateWeights: async (weights: CategoryWeightDto[]): Promise<WeightValidationDto> => {
    return await apiClient.post<WeightValidationDto>('/api/criteriacategory/validate-weights', weights);
  },

  /**
   * Rebalance weights
   */
  rebalanceWeights: async (request: RebalanceWeightRequest): Promise<{ message: string; weights: CategoryWeightDto[] }> => {
    return await apiClient.put<{ message: string; weights: CategoryWeightDto[] }>('/api/criteriacategory/rebalance-weights', request);
  },

  /**
   * Get active categories
   */
  getActiveCategories: async (): Promise<CriteriaCategoryDto[]> => {
    return await apiClient.get<CriteriaCategoryDto[]>('/api/criteriacategory/active');
  },

  /**
   * Activate category
   */
  activateCategory: async (id: number): Promise<{ message: string }> => {
    return await apiClient.put<{ message: string }>(`/api/criteriacategory/${id}/activate`);
  },

  /**
   * Deactivate category
   */
  deactivateCategory: async (id: number): Promise<{ message: string }> => {
    return await apiClient.put<{ message: string }>(`/api/criteriacategory/${id}/deactivate`);
  },
};

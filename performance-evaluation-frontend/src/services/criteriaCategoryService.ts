import { apiClient } from './api';
import { 
  CriteriaCategoryDto, 
  CreateCriteriaCategoryRequest, 
  UpdateCriteriaCategoryRequest,
  WeightValidationDto,
  RebalanceWeightRequest
} from '@/types';

export const criteriaCategoryService = {
  /**
   * Get all categories
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
   * Create new category
   */
  createCategory: async (categoryData: CreateCriteriaCategoryRequest): Promise<CriteriaCategoryDto> => {
    return await apiClient.post<CriteriaCategoryDto>('/api/criteriacategory', categoryData);
  },

  /**
   * Update category
   */
  updateCategory: async (id: number, categoryData: UpdateCriteriaCategoryRequest): Promise<CriteriaCategoryDto> => {
    return await apiClient.put<CriteriaCategoryDto>(`/api/criteriacategory/${id}`, categoryData);
  },

  /**
   * Delete category
   */
  deleteCategory: async (id: number): Promise<{ message: string }> => {
    return await apiClient.delete<{ message: string }>(`/api/criteriacategory/${id}`);
  },

  /**
   * Activate category
   */
  activateCategory: async (id: number): Promise<{ message: string }> => {
    return await apiClient.patch<{ message: string }>(`/api/criteriacategory/${id}/activate`);
  },

  /**
   * Deactivate category
   */
  deactivateCategory: async (id: number): Promise<{ message: string }> => {
    return await apiClient.patch<{ message: string }>(`/api/criteriacategory/${id}/deactivate`);
  },

  /**
   * Get active categories
   */
  getActiveCategories: async (): Promise<CriteriaCategoryDto[]> => {
    return await apiClient.get<CriteriaCategoryDto[]>('/api/criteriacategory/active');
  },

  /**
   * Validate weights
   */
  validateWeights: async (weights?: any): Promise<WeightValidationDto> => {
    return await apiClient.get<WeightValidationDto>('/api/criteriacategory/validate-weights');
  },

  /**
   * Rebalance weights
   */
  rebalanceWeights: async (weights: { categoryWeights: RebalanceWeightRequest[] }): Promise<{ message: string }> => {
    return await apiClient.post<{ message: string }>('/api/criteriacategory/rebalance-weights', weights.categoryWeights);
  },
};

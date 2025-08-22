import { apiClient } from './api';
import {
  CriteriaDto,
  CriteriaWithRoleDescriptionDto,
  CriteriaWithScoreDto,
  CriteriaSummaryDto,
  CreateCriteriaRequest,
  UpdateCriteriaRequest,
  AddRoleDescriptionRequest,
  UpdateRoleDescriptionRequest,
  CriteriaSearchDto,
  CriteriaSearchRequest,
  PaginatedResponse,
} from '@/types';

export const criteriaService = {
  /**
   * Get all criteria
   */
  getCriteria: async (): Promise<CriteriaDto[]> => {
    return await apiClient.get<CriteriaDto[]>('/api/criteria');
  },

  /**
   * Get criteria by ID
   */
  getCriteriaById: async (id: number): Promise<CriteriaDto> => {
    return await apiClient.get<CriteriaDto>(`/api/criteria/${id}`);
  },

  /**
   * Get criteria by category
   */
  getCriteriaByCategory: async (categoryId: number): Promise<CriteriaDto[]> => {
    return await apiClient.get<CriteriaDto[]>(`/api/criteria/category/${categoryId}`);
  },

  /**
   * Get criteria with role descriptions
   */
  getCriteriaWithRoleDescriptions: async (roleId?: number): Promise<CriteriaWithRoleDescriptionDto[]> => {
    const params = roleId ? { roleId } : undefined;
    return await apiClient.get<CriteriaWithRoleDescriptionDto[]>('/api/criteria/with-descriptions', params);
  },

  /**
   * Get criteria with scores for evaluation
   */
  getCriteriaWithScores: async (evaluationId: number): Promise<CriteriaWithScoreDto[]> => {
    return await apiClient.get<CriteriaWithScoreDto[]>(`/api/criteria/evaluation/${evaluationId}/scores`);
  },

  /**
   * Create new criteria
   */
  createCriteria: async (criteria: CreateCriteriaRequest): Promise<CriteriaDto> => {
    return await apiClient.post<CriteriaDto>('/api/criteria', criteria);
  },

  /**
   * Update criteria
   */
  updateCriteria: async (id: number, criteria: UpdateCriteriaRequest): Promise<CriteriaDto> => {
    return await apiClient.put<CriteriaDto>(`/api/criteria/${id}`, criteria);
  },

  /**
   * Delete criteria
   */
  deleteCriteria: async (id: number): Promise<{ message: string }> => {
    return await apiClient.delete<{ message: string }>(`/api/criteria/${id}`);
  },

  /**
   * Add role description to criteria
   */
  addRoleDescription: async (criteriaId: number, request: AddRoleDescriptionRequest): Promise<{ message: string }> => {
    return await apiClient.post<{ message: string }>(`/api/criteria/${criteriaId}/role-description`, request);
  },

  /**
   * Update role description
   */
  updateRoleDescription: async (criteriaId: number, roleId: number, request: UpdateRoleDescriptionRequest): Promise<{ message: string }> => {
    return await apiClient.put<{ message: string }>(`/api/criteria/${criteriaId}/role-description/${roleId}`, request);
  },

  /**
   * Delete role description
   */
  deleteRoleDescription: async (criteriaId: number, roleId: number): Promise<{ message: string }> => {
    return await apiClient.delete<{ message: string }>(`/api/criteria/${criteriaId}/role-description/${roleId}`);
  },

  /**
   * Search criteria
   */
  searchCriteria: async (request: CriteriaSearchRequest): Promise<PaginatedResponse<CriteriaSearchDto>> => {
    return await apiClient.post<PaginatedResponse<CriteriaSearchDto>>('/api/criteria/search', request);
  },

  /**
   * Get criteria summary
   */
  getCriteriaSummary: async (): Promise<CriteriaSummaryDto[]> => {
    return await apiClient.get<CriteriaSummaryDto[]>('/api/criteria/summary');
  },

  /**
   * Get active criteria
   */
  getActiveCriteria: async (): Promise<CriteriaDto[]> => {
    return await apiClient.get<CriteriaDto[]>('/api/criteria/active');
  },

  /**
   * Activate criteria
   */
  activateCriteria: async (id: number): Promise<{ message: string }> => {
    return await apiClient.put<{ message: string }>(`/api/criteria/${id}/activate`);
  },

  /**
   * Deactivate criteria
   */
  deactivateCriteria: async (id: number): Promise<{ message: string }> => {
    return await apiClient.put<{ message: string }>(`/api/criteria/${id}/deactivate`);
  },
};

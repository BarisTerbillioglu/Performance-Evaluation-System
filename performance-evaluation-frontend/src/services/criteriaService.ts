import { apiClient } from './api';
import { 
  CriteriaDto, 
  CreateCriteriaRequest, 
  UpdateCriteriaRequest,
  AddRoleDescriptionRequest,
  CriteriaRoleDescriptionDto,
  UpdateRoleDescriptionRequest
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
   * Create new criteria
   */
  createCriteria: async (criteriaData: CreateCriteriaRequest): Promise<CriteriaDto> => {
    return await apiClient.post<CriteriaDto>('/api/criteria', criteriaData);
  },

  /**
   * Update criteria
   */
  updateCriteria: async (id: number, criteriaData: UpdateCriteriaRequest): Promise<CriteriaDto> => {
    return await apiClient.put<CriteriaDto>(`/api/criteria/${id}`, criteriaData);
  },

  /**
   * Delete criteria
   */
  deleteCriteria: async (id: number): Promise<{ message: string }> => {
    return await apiClient.delete<{ message: string }>(`/api/criteria/${id}`);
  },

  /**
   * Activate criteria
   */
  activateCriteria: async (id: number): Promise<{ message: string }> => {
    return await apiClient.patch<{ message: string }>(`/api/criteria/${id}/activate`);
  },

  /**
   * Deactivate criteria
   */
  deactivateCriteria: async (id: number): Promise<{ message: string }> => {
    return await apiClient.patch<{ message: string }>(`/api/criteria/${id}/deactivate`);
  },

  /**
   * Get active criteria for evaluation
   */
  getActiveCriteria: async (): Promise<CriteriaDto[]> => {
    return await apiClient.get<CriteriaDto[]>('/api/criteria/active');
  },

  /**
   * Add role description
   */
  addRoleDescription: async (criteriaId: number, roleDescriptionData: AddRoleDescriptionRequest): Promise<CriteriaRoleDescriptionDto> => {
    return await apiClient.post<CriteriaRoleDescriptionDto>('/api/criteria/role-description', roleDescriptionData);
  },

  /**
   * Update role description
   */
  updateRoleDescription: async (criteriaId: number, roleId: number, roleDescriptionData: UpdateRoleDescriptionRequest): Promise<CriteriaRoleDescriptionDto> => {
    return await apiClient.put<CriteriaRoleDescriptionDto>(`/api/criteria/role-description/${roleId}`, roleDescriptionData);
  },

  /**
   * Delete role description
   */
  deleteRoleDescription: async (criteriaId: number, roleId: number): Promise<{ message: string }> => {
    return await apiClient.delete<{ message: string }>(`/api/criteria/role-description/${roleId}`);
  },
};

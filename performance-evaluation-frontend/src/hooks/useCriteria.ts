import { useState, useEffect, useCallback } from 'react';
import { 
  CriteriaDto,
  CreateCriteriaRequest,
  UpdateCriteriaRequest,
  AddRoleDescriptionRequest,
  UpdateRoleDescriptionRequest,
  RoleDto
} from '@/types';
import { criteriaService } from '@/services/criteriaService';
import { useAuth } from './useAuth';

export const useCriteria = (categoryId?: number | null) => {
  const [criteria, setCriteria] = useState<CriteriaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchCriteria = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let data: CriteriaDto[];
      if (categoryId) {
        data = await criteriaService.getCriteriaByCategory(categoryId);
      } else {
        data = await criteriaService.getCriteria();
      }
      
      setCriteria(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch criteria');
      console.error('Error fetching criteria:', err);
    } finally {
      setLoading(false);
    }
  }, [user, categoryId]);

  const createCriteria = useCallback(async (criteriaData: CreateCriteriaRequest) => {
    if (!user) return false;

    try {
      await criteriaService.createCriteria(criteriaData);
      await fetchCriteria();
      return true;
    } catch (err) {
      console.error('Error creating criteria:', err);
      throw err;
    }
  }, [user, fetchCriteria]);

  const updateCriteria = useCallback(async (
    id: number, 
    criteriaData: UpdateCriteriaRequest
  ) => {
    if (!user) return false;

    try {
      await criteriaService.updateCriteria(id, criteriaData);
      await fetchCriteria();
      return true;
    } catch (err) {
      console.error('Error updating criteria:', err);
      throw err;
    }
  }, [user, fetchCriteria]);

  const deleteCriteria = useCallback(async (id: number) => {
    if (!user) return false;

    try {
      await criteriaService.deleteCriteria(id);
      await fetchCriteria();
      return true;
    } catch (err) {
      console.error('Error deleting criteria:', err);
      throw err;
    }
  }, [user, fetchCriteria]);

  const addRoleDescription = useCallback(async (
    criteriaId: number,
    roleData: AddRoleDescriptionRequest
  ) => {
    if (!user) return false;

    try {
      await criteriaService.addRoleDescription(criteriaId, roleData);
      await fetchCriteria();
      return true;
    } catch (err) {
      console.error('Error adding role description:', err);
      throw err;
    }
  }, [user, fetchCriteria]);

  const updateRoleDescription = useCallback(async (
    criteriaId: number,
    roleId: number,
    roleData: UpdateRoleDescriptionRequest
  ) => {
    if (!user) return false;

    try {
      await criteriaService.updateRoleDescription(criteriaId, roleId, roleData);
      await fetchCriteria();
      return true;
    } catch (err) {
      console.error('Error updating role description:', err);
      throw err;
    }
  }, [user, fetchCriteria]);

  const deleteRoleDescription = useCallback(async (
    criteriaId: number,
    roleId: number
  ) => {
    if (!user) return false;

    try {
      await criteriaService.deleteRoleDescription(criteriaId, roleId);
      await fetchCriteria();
      return true;
    } catch (err) {
      console.error('Error deleting role description:', err);
      throw err;
    }
  }, [user, fetchCriteria]);

  const toggleCriteriaStatus = useCallback(async (id: number, isActive: boolean) => {
    if (!user) return false;

    try {
      if (isActive) {
        await criteriaService.activateCriteria(id);
      } else {
        await criteriaService.deactivateCriteria(id);
      }
      await fetchCriteria();
      return true;
    } catch (err) {
      console.error('Error toggling criteria status:', err);
      throw err;
    }
  }, [user, fetchCriteria]);

  useEffect(() => {
    fetchCriteria();
  }, [fetchCriteria]);

  return {
    criteria,
    loading,
    error,
    refetch: fetchCriteria,
    createCriteria,
    updateCriteria,
    deleteCriteria,
    addRoleDescription,
    updateRoleDescription,
    deleteRoleDescription,
    toggleCriteriaStatus
  };
};

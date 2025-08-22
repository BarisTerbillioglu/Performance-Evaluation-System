import { useState, useEffect, useCallback } from 'react';
import { RoleDto, CreateRoleRequest, UpdateRoleRequest } from '@/types';
import { roleService } from '@/services/roleService';
import { useAuth } from './useAuth';

export const useRoles = () => {
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchRoles = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await roleService.getRoles();
      setRoles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch roles');
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createRole = useCallback(async (roleData: CreateRoleRequest) => {
    if (!user) return false;

    try {
      await roleService.createRole(roleData);
      await fetchRoles();
      return true;
    } catch (err) {
      console.error('Error creating role:', err);
      throw err;
    }
  }, [user, fetchRoles]);

  const updateRole = useCallback(async (
    id: number, 
    roleData: UpdateRoleRequest
  ) => {
    if (!user) return false;

    try {
      await roleService.updateRole(id, roleData);
      await fetchRoles();
      return true;
    } catch (err) {
      console.error('Error updating role:', err);
      throw err;
    }
  }, [user, fetchRoles]);

  const deleteRole = useCallback(async (id: number) => {
    if (!user) return false;

    try {
      await roleService.deleteRole(id);
      await fetchRoles();
      return true;
    } catch (err) {
      console.error('Error deleting role:', err);
      throw err;
    }
  }, [user, fetchRoles]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    loading,
    error,
    refetch: fetchRoles,
    createRole,
    updateRole,
    deleteRole
  };
};

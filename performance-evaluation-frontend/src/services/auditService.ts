import { apiClient } from './api';
import { PaginatedResponse, BaseSearchRequest } from '@/types';

export interface AuditLogDto {
  id: number;
  userId: number;
  userName: string;
  action: string;
  entityType: string;
  entityId: number;
  entityName: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  details?: string;
}

export interface AuditLogSearchRequest extends BaseSearchRequest {
  userId?: number;
  entityType?: string;
  entityId?: number;
  action?: string;
  startDate?: string;
  endDate?: string;
}

export const auditService = {
  /**
   * Get audit logs with pagination and filtering
   */
  getAuditLogs: async (request: AuditLogSearchRequest): Promise<PaginatedResponse<AuditLogDto>> => {
    return await apiClient.post<PaginatedResponse<AuditLogDto>>('/api/audit/search', request);
  },

  /**
   * Get audit logs for a specific user
   */
  getUserAuditLogs: async (userId: number, request?: BaseSearchRequest): Promise<PaginatedResponse<AuditLogDto>> => {
    return await apiClient.post<PaginatedResponse<AuditLogDto>>(`/api/audit/user/${userId}`, request || {});
  },

  /**
   * Get audit logs for a specific entity
   */
  getEntityAuditLogs: async (entityType: string, entityId: number, request?: BaseSearchRequest): Promise<PaginatedResponse<AuditLogDto>> => {
    return await apiClient.post<PaginatedResponse<AuditLogDto>>(`/api/audit/entity/${entityType}/${entityId}`, request || {});
  },

  /**
   * Get audit log by ID
   */
  getAuditLogById: async (id: number): Promise<AuditLogDto> => {
    return await apiClient.get<AuditLogDto>(`/api/audit/${id}`);
  },

  /**
   * Get audit log statistics
   */
  getAuditStats: async (startDate?: string, endDate?: string): Promise<{
    totalLogs: number;
    userActions: number;
    systemActions: number;
    actionsByType: Record<string, number>;
    topUsers: Array<{ userId: number; userName: string; actionCount: number }>;
  }> => {
    return await apiClient.get('/api/audit/stats', { startDate, endDate });
  },

  /**
   * Export audit logs
   */
  exportAuditLogs: async (request: AuditLogSearchRequest): Promise<Blob> => {
    return await apiClient.downloadFile('/api/audit/export', request);
  }
};

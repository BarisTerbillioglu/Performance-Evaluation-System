import { apiClient } from './api';
import {
  AdminDashboardDto,
  EmployeeDashboardDto,
  EvaluatorDashboardDto,
} from '@/types';

export const dashboardService = {
  /**
   * Get dashboard overview for current user
   */
  getDashboardOverview: async (): Promise<AdminDashboardDto | EmployeeDashboardDto | EvaluatorDashboardDto> => {
    return await apiClient.get('/api/dashboard/overview');
  },

  /**
   * Get admin dashboard data
   */
  getAdminDashboard: async (): Promise<AdminDashboardDto> => {
    return await apiClient.get<AdminDashboardDto>('/api/dashboard/admin');
  },

  /**
   * Get employee dashboard data
   */
  getEmployeeDashboard: async (): Promise<EmployeeDashboardDto> => {
    return await apiClient.get<EmployeeDashboardDto>('/api/dashboard/employee');
  },

  /**
   * Get evaluator dashboard data
   */
  getEvaluatorDashboard: async (): Promise<EvaluatorDashboardDto> => {
    return await apiClient.get<EvaluatorDashboardDto>('/api/dashboard/evaluator');
  },

  /**
   * Get dashboard statistics
   */
  getDashboardStats: async (): Promise<{
    totalEvaluations: number;
    completedEvaluations: number;
    pendingEvaluations: number;
    overdueEvaluations: number;
  }> => {
    return await apiClient.get('/api/dashboard/stats');
  },

  /**
   * Get recent activity
   */
  getRecentActivity: async (limit = 10): Promise<{
    id: number;
    userId: number;
    userName: string;
    action: string;
    entityType: string;
    entityId: number;
    timestamp: string;
    details?: string;
  }[]> => {
    return await apiClient.get('/api/dashboard/recent-activity', { limit });
  },

  /**
   * Get system alerts
   */
  getSystemAlerts: async (): Promise<{
    id: number;
    type: 'Warning' | 'Error' | 'Info';
    title: string;
    message: string;
    timestamp: string;
    isResolved: boolean;
  }[]> => {
    return await apiClient.get('/api/dashboard/alerts');
  },
};

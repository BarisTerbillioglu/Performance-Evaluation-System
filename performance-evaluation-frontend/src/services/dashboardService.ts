import { apiClient } from './api';
import { 
  DashboardOverviewDto,
  AdminStatisticsDto,
  TeamPerformanceDto,
  PersonalPerformanceDto
} from '@/types';

export const dashboardService = {
  /**
   * Get dashboard overview
   */
  getDashboardOverview: async (): Promise<DashboardOverviewDto> => {
    return await apiClient.get<DashboardOverviewDto>('/api/dashboard/overview');
  },

  /**
   * Get admin statistics
   */
  getAdminStatistics: async (): Promise<AdminStatisticsDto> => {
    return await apiClient.get<AdminStatisticsDto>('/api/dashboard/admin-stats');
  },

  /**
   * Get admin dashboard (alias for getAdminStatistics)
   */
  getAdminDashboard: async (): Promise<AdminStatisticsDto> => {
    return await apiClient.get<AdminStatisticsDto>('/api/dashboard/admin-stats');
  },

  /**
   * Get team performance (for evaluators)
   */
  getTeamPerformance: async (): Promise<TeamPerformanceDto> => {
    return await apiClient.get<TeamPerformanceDto>('/api/dashboard/team-performance');
  },

  /**
   * Get personal performance (for employees)
   */
  getPersonalPerformance: async (): Promise<PersonalPerformanceDto> => {
    return await apiClient.get<PersonalPerformanceDto>('/api/dashboard/personal-performance');
  },
};

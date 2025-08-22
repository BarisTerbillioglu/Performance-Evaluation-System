import { apiClient } from './api';
import { AnalyticsRequest, AdvancedAnalytics } from '@/types/analytics';

export const analyticsService = {
  // Get comprehensive analytics data
  getAdvancedAnalytics: async (request: AnalyticsRequest): Promise<AdvancedAnalytics> => {
    return apiClient.post<AdvancedAnalytics>('/api/analytics/advanced', request);
  },

  // Get performance trends
  getPerformanceTrends: async (request: AnalyticsRequest) => {
    return apiClient.post('/api/analytics/trends', request);
  },

  // Get department comparisons
  getDepartmentComparisons: async (request: AnalyticsRequest) => {
    return apiClient.post('/api/analytics/departments', request);
  },

  // Get top performers
  getTopPerformers: async (request: AnalyticsRequest) => {
    return apiClient.post('/api/analytics/top-performers', request);
  },

  // Get score distribution
  getScoreDistribution: async (request: AnalyticsRequest) => {
    return apiClient.post('/api/analytics/score-distribution', request);
  },

  // Get evaluation progress
  getEvaluationProgress: async (request: AnalyticsRequest) => {
    return apiClient.post('/api/analytics/evaluation-progress', request);
  },

  // Get real-time metrics
  getRealTimeMetrics: async () => {
    return apiClient.get('/api/analytics/real-time');
  },

  // Export analytics data
  exportAnalytics: async (request: AnalyticsRequest & { format: string }) => {
    return apiClient.post('/api/analytics/export', request);
  }
};

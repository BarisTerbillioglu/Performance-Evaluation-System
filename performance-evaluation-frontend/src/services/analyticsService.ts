import { apiClient } from './api';
import { 
  AnalyticsRequest, 
  AnalyticsResponse, 
  RealTimeMetrics 
} from '@/types/analytics';

class AnalyticsService {
  async getAnalytics(filters: AnalyticsRequest): Promise<AnalyticsResponse> {
    const response = await apiClient.post('/analytics', filters);
    return response.data;
  }

  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    const response = await apiClient.get('/analytics/realtime');
    return response.data;
  }

  async exportAnalytics(filters: AnalyticsRequest, format: 'pdf' | 'excel' | 'csv'): Promise<Blob> {
    const response = await apiClient.post('/analytics/export', {
      ...filters,
      format
    }, {
      responseType: 'blob'
    });
    return response.data;
  }
}

export const analyticsService = new AnalyticsService();

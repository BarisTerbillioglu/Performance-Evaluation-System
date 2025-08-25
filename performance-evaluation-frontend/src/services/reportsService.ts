import { apiClient } from './api';

export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  templateId: string;
  elements: ReportElement[];
  filters: ReportFilter[];
  schedule?: ReportSchedule;
  permissions: ReportPermission[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  isActive: boolean;
}

export interface ReportElement {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'text';
  title: string;
  config: any;
  position: number;
}

export interface ReportFilter {
  id: string;
  field: string;
  operator: string;
  value: any;
  label: string;
}

export interface ReportSchedule {
  id: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  time: string;
  timezone: string;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  isActive: boolean;
}

export interface ReportPermission {
  userId?: string;
  roleId?: string;
  departmentId?: string;
  permissions: ('view' | 'edit' | 'delete' | 'share' | 'schedule')[];
}

export interface ReportExecution {
  id: string;
  reportId: string;
  reportName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  recordCount?: number;
  fileSize?: number;
  fileUrl?: string;
  errorMessage?: string;
  executedBy: string;
  filters: ReportFilter[];
  format: 'pdf' | 'excel' | 'csv';
}

export const reportsService = {
  // Report Templates
  getTemplates: async () => {
    return apiClient.get('/api/reports/templates');
  },

  getTemplate: async (templateId: string) => {
    return apiClient.get(`/api/reports/templates/${templateId}`);
  },

  createTemplate: async (template: any) => {
    return apiClient.post('/api/reports/templates', template);
  },

  updateTemplate: async (templateId: string, template: any) => {
    return apiClient.put(`/api/reports/templates/${templateId}`, template);
  },

  deleteTemplate: async (templateId: string) => {
    return apiClient.delete(`/api/reports/templates/${templateId}`);
  },

  // Reports
  getReports: async (filters?: any) => {
    return apiClient.get('/api/reports', { params: filters });
  },

  getReport: async (reportId: string) => {
    return apiClient.get(`/api/reports/${reportId}`);
  },

  createReport: async (report: Partial<ReportDefinition>) => {
    return apiClient.post('/api/reports', report);
  },

  updateReport: async (reportId: string, report: Partial<ReportDefinition>) => {
    return apiClient.put(`/api/reports/${reportId}`, report);
  },

  deleteReport: async (reportId: string) => {
    return apiClient.delete(`/api/reports/${reportId}`);
  },

  duplicateReport: async (reportId: string) => {
    return apiClient.post(`/api/reports/${reportId}/duplicate`);
  },

  // Report Execution
  executeReport: async (reportId: string, options: any) => {
    return apiClient.post(`/api/reports/${reportId}/execute`, options);
  },

  getExecutions: async (reportId?: string) => {
    return apiClient.get('/api/reports/executions', { params: { reportId } });
  },

  getExecution: async (executionId: string) => {
    return apiClient.get(`/api/reports/executions/${executionId}`);
  },

  cancelExecution: async (executionId: string) => {
    return apiClient.post(`/api/reports/executions/${executionId}/cancel`);
  },

  downloadExecution: async (executionId: string) => {
    return apiClient.get(`/api/reports/executions/${executionId}/download`, {
      responseType: 'blob'
    });
  },

  // Report Scheduling
  getSchedules: async () => {
    return apiClient.get('/api/reports/schedules');
  },

  createSchedule: async (reportId: string, schedule: Partial<ReportSchedule>) => {
    return apiClient.post(`/api/reports/${reportId}/schedule`, schedule);
  },

  updateSchedule: async (scheduleId: string, schedule: Partial<ReportSchedule>) => {
    return apiClient.put(`/api/reports/schedules/${scheduleId}`, schedule);
  },

  deleteSchedule: async (scheduleId: string) => {
    return apiClient.delete(`/api/reports/schedules/${scheduleId}`);
  },

  toggleSchedule: async (scheduleId: string, isActive: boolean) => {
    return apiClient.patch(`/api/reports/schedules/${scheduleId}`, { isActive });
  },

  // Report Sharing
  getSharedReports: async () => {
    return apiClient.get('/api/reports/shared');
  },

  shareReport: async (reportId: string, permissions: ReportPermission[]) => {
    return apiClient.post(`/api/reports/${reportId}/share`, { permissions });
  },

  updateSharePermissions: async (reportId: string, permissions: ReportPermission[]) => {
    return apiClient.put(`/api/reports/${reportId}/share`, { permissions });
  },

  removeShare: async (reportId: string, userId: string) => {
    return apiClient.delete(`/api/reports/${reportId}/share/${userId}`);
  },

  // Report Versions
  getVersions: async (reportId: string) => {
    return apiClient.get(`/api/reports/${reportId}/versions`);
  },

  getVersion: async (reportId: string, version: number) => {
    return apiClient.get(`/api/reports/${reportId}/versions/${version}`);
  },

  restoreVersion: async (reportId: string, version: number) => {
    return apiClient.post(`/api/reports/${reportId}/versions/${version}/restore`);
  },

  // Export Functions
  exportReport: async (reportId: string, format: 'pdf' | 'excel' | 'csv', options?: any) => {
    return apiClient.post(`/api/reports/${reportId}/export`, {
      format,
      ...options
    }, {
      responseType: 'blob'
    });
  },

  exportCustomReport: async (reportDefinition: any, format: 'pdf' | 'excel' | 'csv') => {
    return apiClient.post('/api/reports/export-custom', {
      report: reportDefinition,
      format
    }, {
      responseType: 'blob'
    });
  },

  // Bulk Operations
  bulkExecute: async (reportIds: string[], options: any) => {
    return apiClient.post('/api/reports/bulk-execute', {
      reportIds,
      ...options
    });
  },

  bulkExport: async (reportIds: string[], format: 'pdf' | 'excel' | 'csv') => {
    return apiClient.post('/api/reports/bulk-export', {
      reportIds,
      format
    }, {
      responseType: 'blob'
    });
  },

  bulkDelete: async (reportIds: string[]) => {
    return apiClient.post('/api/reports/bulk-delete', { reportIds });
  },

  // Report Analytics
  getReportUsage: async (reportId?: string) => {
    return apiClient.get('/api/reports/usage', { params: { reportId } });
  },

  getPopularReports: async () => {
    return apiClient.get('/api/reports/popular');
  },

  getReportPerformance: async (reportId: string) => {
    return apiClient.get(`/api/reports/${reportId}/performance`);
  },

  // Email Templates
  getEmailTemplates: async () => {
    return apiClient.get('/api/reports/email-templates');
  },

  createEmailTemplate: async (template: any) => {
    return apiClient.post('/api/reports/email-templates', template);
  },

  updateEmailTemplate: async (templateId: string, template: any) => {
    return apiClient.put(`/api/reports/email-templates/${templateId}`, template);
  },

  deleteEmailTemplate: async (templateId: string) => {
    return apiClient.delete(`/api/reports/email-templates/${templateId}`);
  },

  // Report Categories
  getCategories: async () => {
    return apiClient.get('/api/reports/categories');
  },

  createCategory: async (category: any) => {
    return apiClient.post('/api/reports/categories', category);
  },

  updateCategory: async (categoryId: string, category: any) => {
    return apiClient.put(`/api/reports/categories/${categoryId}`, category);
  },

  deleteCategory: async (categoryId: string) => {
    return apiClient.delete(`/api/reports/categories/${categoryId}`);
  },

  // Report Comments
  getComments: async (reportId: string) => {
    return apiClient.get(`/api/reports/${reportId}/comments`);
  },

  addComment: async (reportId: string, comment: any) => {
    return apiClient.post(`/api/reports/${reportId}/comments`, comment);
  },

  updateComment: async (reportId: string, commentId: string, comment: any) => {
    return apiClient.put(`/api/reports/${reportId}/comments/${commentId}`, comment);
  },

  deleteComment: async (reportId: string, commentId: string) => {
    return apiClient.delete(`/api/reports/${reportId}/comments/${commentId}`);
  },

  // Report Favorites
  getFavorites: async () => {
    return apiClient.get('/api/reports/favorites');
  },

  addToFavorites: async (reportId: string) => {
    return apiClient.post(`/api/reports/${reportId}/favorite`);
  },

  removeFromFavorites: async (reportId: string) => {
    return apiClient.delete(`/api/reports/${reportId}/favorite`);
  },

  // Report Search
  searchReports: async (query: string, filters?: any) => {
    return apiClient.get('/api/reports/search', {
      params: { q: query, ...filters }
    });
  },

  // Report Validation
  validateReport: async (reportDefinition: any) => {
    return apiClient.post('/api/reports/validate', reportDefinition);
  },

  // Report Preview
  previewReport: async (reportDefinition: any) => {
    return apiClient.post('/api/reports/preview', reportDefinition);
  },

  // Report Statistics
  getReportStats: async () => {
    return apiClient.get('/api/reports/stats');
  },

  getExecutionStats: async (timeframe?: string) => {
    return apiClient.get('/api/reports/execution-stats', {
      params: { timeframe }
    });
  }
};

import { apiClient } from './api';
import {
  ReportTemplate,
  ReportDefinition,
  ReportExecution,
  ReportShare,
  ReportVersion,
  ReportBuilderState,
  ReportExportOptions,
  ReportEmailTemplate,
  ReportCategory,
  ReportStats,
  ReportFilter
} from '@/types/reports';

export const reportService = {
  // Report Templates
  getTemplates: async (): Promise<ReportTemplate[]> => {
    return apiClient.get<ReportTemplate[]>('/api/reports/templates');
  },

  getTemplate: async (id: string): Promise<ReportTemplate> => {
    return apiClient.get<ReportTemplate>(`/api/reports/templates/${id}`);
  },

  createTemplate: async (template: Partial<ReportTemplate>): Promise<ReportTemplate> => {
    return apiClient.post<ReportTemplate>('/api/reports/templates', template);
  },

  updateTemplate: async (id: string, template: Partial<ReportTemplate>): Promise<ReportTemplate> => {
    return apiClient.put<ReportTemplate>(`/api/reports/templates/${id}`, template);
  },

  deleteTemplate: async (id: string): Promise<void> => {
    return apiClient.delete(`/api/reports/templates/${id}`);
  },

  // Report Definitions
  getReports: async (): Promise<ReportDefinition[]> => {
    return apiClient.get<ReportDefinition[]>('/api/reports');
  },

  getReport: async (id: string): Promise<ReportDefinition> => {
    return apiClient.get<ReportDefinition>(`/api/reports/${id}`);
  },

  createReport: async (report: ReportBuilderState): Promise<ReportDefinition> => {
    return apiClient.post<ReportDefinition>('/api/reports', report);
  },

  updateReport: async (id: string, report: Partial<ReportBuilderState>): Promise<ReportDefinition> => {
    return apiClient.put<ReportDefinition>(`/api/reports/${id}`, report);
  },

  deleteReport: async (id: string): Promise<void> => {
    return apiClient.delete(`/api/reports/${id}`);
  },

  duplicateReport: async (id: string, name: string): Promise<ReportDefinition> => {
    return apiClient.post<ReportDefinition>(`/api/reports/${id}/duplicate`, { name });
  },

  // Report Execution
  executeReport: async (id: string, filters: ReportFilter[], options: ReportExportOptions): Promise<ReportExecution> => {
    return apiClient.post<ReportExecution>(`/api/reports/${id}/execute`, { filters, options });
  },

  getExecutions: async (reportId?: string): Promise<ReportExecution[]> => {
    const params = reportId ? { reportId } : {};
    return apiClient.get<ReportExecution[]>('/api/reports/executions', params);
  },

  getExecution: async (id: string): Promise<ReportExecution> => {
    return apiClient.get<ReportExecution>(`/api/reports/executions/${id}`);
  },

  cancelExecution: async (id: string): Promise<void> => {
    return apiClient.post(`/api/reports/executions/${id}/cancel`);
  },

  downloadExecution: async (id: string): Promise<Blob> => {
    return apiClient.get(`/api/reports/executions/${id}/download`, {
      responseType: 'blob'
    });
  },

  // Report Scheduling
  scheduleReport: async (id: string, schedule: any): Promise<ReportDefinition> => {
    return apiClient.post<ReportDefinition>(`/api/reports/${id}/schedule`, schedule);
  },

  updateSchedule: async (id: string, schedule: any): Promise<ReportDefinition> => {
    return apiClient.put<ReportDefinition>(`/api/reports/${id}/schedule`, schedule);
  },

  deleteSchedule: async (id: string): Promise<void> => {
    return apiClient.delete(`/api/reports/${id}/schedule`);
  },

  // Report Sharing
  shareReport: async (id: string, share: Partial<ReportShare>): Promise<ReportShare> => {
    return apiClient.post<ReportShare>(`/api/reports/${id}/share`, share);
  },

  getShares: async (reportId?: string): Promise<ReportShare[]> => {
    const params = reportId ? { reportId } : {};
    return apiClient.get<ReportShare[]>('/api/reports/shares', params);
  },

  updateShare: async (id: string, share: Partial<ReportShare>): Promise<ReportShare> => {
    return apiClient.put<ReportShare>(`/api/reports/shares/${id}`, share);
  },

  deleteShare: async (id: string): Promise<void> => {
    return apiClient.delete(`/api/reports/shares/${id}`);
  },

  // Report Versions
  getVersions: async (reportId: string): Promise<ReportVersion[]> => {
    return apiClient.get<ReportVersion[]>(`/api/reports/${reportId}/versions`);
  },

  getVersion: async (reportId: string, version: number): Promise<ReportVersion> => {
    return apiClient.get<ReportVersion>(`/api/reports/${reportId}/versions/${version}`);
  },

  createVersion: async (reportId: string, version: Partial<ReportVersion>): Promise<ReportVersion> => {
    return apiClient.post<ReportVersion>(`/api/reports/${reportId}/versions`, version);
  },

  restoreVersion: async (reportId: string, version: number): Promise<ReportDefinition> => {
    return apiClient.post<ReportDefinition>(`/api/reports/${reportId}/versions/${version}/restore`);
  },

  // Email Templates
  getEmailTemplates: async (): Promise<ReportEmailTemplate[]> => {
    return apiClient.get<ReportEmailTemplate[]>('/api/reports/email-templates');
  },

  getEmailTemplate: async (id: string): Promise<ReportEmailTemplate> => {
    return apiClient.get<ReportEmailTemplate>(`/api/reports/email-templates/${id}`);
  },

  createEmailTemplate: async (template: Partial<ReportEmailTemplate>): Promise<ReportEmailTemplate> => {
    return apiClient.post<ReportEmailTemplate>('/api/reports/email-templates', template);
  },

  updateEmailTemplate: async (id: string, template: Partial<ReportEmailTemplate>): Promise<ReportEmailTemplate> => {
    return apiClient.put<ReportEmailTemplate>(`/api/reports/email-templates/${id}`, template);
  },

  deleteEmailTemplate: async (id: string): Promise<void> => {
    return apiClient.delete(`/api/reports/email-templates/${id}`);
  },

  // Categories and Stats
  getCategories: async (): Promise<ReportCategory[]> => {
    return apiClient.get<ReportCategory[]>('/api/reports/categories');
  },

  getStats: async (): Promise<ReportStats> => {
    return apiClient.get<ReportStats>('/api/reports/stats');
  },

  // Data Sources
  getDataSources: async (): Promise<any[]> => {
    return apiClient.get<any[]>('/api/reports/data-sources');
  },

  getDataSourceFields: async (sourceId: string): Promise<any[]> => {
    return apiClient.get<any[]>(`/api/reports/data-sources/${sourceId}/fields`);
  },

  // Preview and Validation
  previewReport: async (definition: ReportBuilderState): Promise<any> => {
    return apiClient.post('/api/reports/preview', definition);
  },

  validateReport: async (definition: ReportBuilderState): Promise<any> => {
    return apiClient.post('/api/reports/validate', definition);
  }
};

export interface ReportFilter {
  id: string;
  name: string;
  type: 'date' | 'department' | 'user' | 'team' | 'status' | 'score_range';
  value: any;
  operator?: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
  label: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'evaluation' | 'department' | 'user' | 'analytics' | 'custom';
  icon: string;
  filters: ReportFilter[];
  columns: ReportColumn[];
  chartTypes?: string[];
  isSystem: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportColumn {
  id: string;
  name: string;
  field: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'percentage' | 'currency';
  sortable: boolean;
  filterable: boolean;
  width?: number;
  format?: string;
  aggregate?: 'sum' | 'average' | 'count' | 'min' | 'max';
}

export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  templateId: string;
  filters: ReportFilter[];
  columns: ReportColumn[];
  chartConfig?: ChartConfig;
  schedule?: ReportSchedule;
  permissions: ReportPermission[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  isActive: boolean;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'table';
  title: string;
  xAxis: string;
  yAxis: string;
  series: string[];
  options?: Record<string, any>;
}

export interface ReportSchedule {
  id: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time: string; // HH:mm format
  timezone: string;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  isActive: boolean;
  lastRun?: string;
  nextRun?: string;
}

export interface ReportPermission {
  id: string;
  userId?: string;
  roleId?: string;
  departmentId?: string;
  permission: 'view' | 'edit' | 'delete' | 'share' | 'schedule';
  grantedBy: string;
  grantedAt: string;
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

export interface ReportShare {
  id: string;
  reportId: string;
  sharedWith: string;
  sharedBy: string;
  sharedAt: string;
  expiresAt?: string;
  permission: 'view' | 'download';
  isActive: boolean;
}

export interface ReportVersion {
  id: string;
  reportId: string;
  version: number;
  name: string;
  description: string;
  definition: ReportDefinition;
  createdBy: string;
  createdAt: string;
  changes: string[];
}

export interface ReportBuilderState {
  name: string;
  description: string;
  templateId?: string;
  filters: ReportFilter[];
  columns: ReportColumn[];
  chartConfig?: ChartConfig;
  schedule?: ReportSchedule;
  permissions: ReportPermission[];
}

export interface ReportExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
  includeFilters: boolean;
  includeSummary: boolean;
  pageSize?: 'a4' | 'letter' | 'legal';
  orientation?: 'portrait' | 'landscape';
  filename?: string;
}

export interface ReportEmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  isHtml: boolean;
  variables: string[];
  createdBy: string;
  createdAt: string;
}

export interface ReportCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  templateCount: number;
}

export interface ReportStats {
  totalReports: number;
  activeReports: number;
  scheduledReports: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  totalShares: number;
  activeShares: number;
}

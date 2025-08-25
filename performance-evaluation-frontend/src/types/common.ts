// Common types used across the application

export interface BaseEntity {
  id: number;
  createdDate: Date;
  updatedDate?: Date;
}

export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiError {
  message: string;
  errors?: { [key: string]: string[] };
  statusCode?: number;
  timestamp?: string;
  path?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface LoadingState {
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface FilterOption {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'in' | 'notIn';
  value: any;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
  filters?: FilterOption[];
  sort?: SortOption[];
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  includeHeaders?: boolean;
  dateFormat?: string;
  timezone?: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  notifications: NotificationSettings;
}

export interface AuditLog {
  id: number;
  userId: number;
  userName: string;
  action: string;
  entityType: string;
  entityId: number;
  oldValues?: any;
  newValues?: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  activeConnections: number;
  lastCheck: Date;
  services: ServiceHealth[];
}

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'down';
  responseTime: number;
  lastCheck: Date;
  error?: string;
}

export interface FileInfo {
  id: number;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedBy: number;
  uploadedAt: Date;
  isPublic: boolean;
  downloadCount: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface SearchResult<T> {
  data: T[];
  totalCount: number;
  searchTime: number;
  suggestions?: string[];
}

export interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: Date;
  ttl: number;
  isExpired: boolean;
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export interface ModalState {
  isOpen: boolean;
  type: string;
  data?: any;
}

export interface ToastState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

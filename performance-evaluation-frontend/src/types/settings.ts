// System Settings & Configuration Types

// ============================================================================
// CORE SETTINGS INTERFACES
// ============================================================================

export interface SystemSettings {
  // General Application Settings
  application: ApplicationSettings;
  // Email & Notification Settings
  email: EmailSettings;
  // Security & Access Settings
  security: SecuritySettings;
  // Data & Backup Settings
  data: DataSettings;
  // Organization Structure Settings
  organization: OrganizationSettings;
  // Evaluation System Settings
  evaluation: EvaluationSettings;
  // Reporting & Analytics Settings
  reporting: ReportingSettings;
  // API Integration Settings
  api: APISettings;
  // Branding & Customization Settings
  branding: BrandingSettings;
}

// ============================================================================
// APPLICATION SETTINGS
// ============================================================================

export interface ApplicationSettings {
  // System Information
  systemName: string;
  systemVersion: string;
  environment: 'development' | 'staging' | 'production';
  
  // Default Evaluation Settings
  defaultEvaluationPeriod: 'quarterly' | 'yearly' | 'custom';
  customEvaluationPeriod?: number; // in months
  defaultScoreScale: 5 | 10 | 100;
  evaluationDeadlineDays: number;
  gracePeriodDays: number;
  
  // Localization
  defaultLanguage: string;
  supportedLanguages: string[];
  defaultTimezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  
  // System Behavior
  autoSaveInterval: number; // in seconds
  sessionTimeout: number; // in minutes
  maxFileUploadSize: number; // in MB
  enableAuditLogging: boolean;
  enablePerformanceMonitoring: boolean;
}

// ============================================================================
// EMAIL & NOTIFICATION SETTINGS
// ============================================================================

export interface EmailSettings {
  // SMTP Configuration
  smtp: SMTPConfig;
  
  // Notification Preferences
  notificationFrequency: 'immediate' | 'daily' | 'weekly';
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
  enableSMSNotifications: boolean;
  
  // Reminder Settings
  evaluationReminderDays: number[];
  reminderEmailTemplate: string;
  followUpReminderDays: number;
  
  // Email Templates
  templates: EmailTemplates;
  
  // Email Signature
  emailSignature: string;
  includeLogoInEmails: boolean;
}

export interface SMTPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  enableSSL: boolean;
  enableTLS: boolean;
  fromEmail: string;
  fromName: string;
}

export interface EmailTemplates {
  evaluationAssigned: string;
  evaluationReminder: string;
  evaluationCompleted: string;
  evaluationOverdue: string;
  passwordReset: string;
  welcomeEmail: string;
}

// ============================================================================
// SECURITY & ACCESS SETTINGS
// ============================================================================

export interface SecuritySettings {
  // Password Policy
  passwordPolicy: PasswordPolicy;
  
  // Session Management
  sessionTimeout: number; // in minutes
  maxConcurrentSessions: number;
  enableSessionTracking: boolean;
  
  // Multi-Factor Authentication
  enableMFA: boolean;
  mfaMethods: MFAMethod[];
  mfaRequiredForAdmins: boolean;
  
  // Access Control
  ipWhitelist: string[];
  enableIPRestrictions: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number; // in minutes
  
  // API Security
  apiRateLimit: number; // requests per minute
  enableAPILogging: boolean;
  apiKeyExpirationDays: number;
  
  // Audit & Compliance
  auditLogRetentionDays: number;
  enableDataEncryption: boolean;
  enableBackupEncryption: boolean;
  complianceSettings: ComplianceSettings;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  passwordExpirationDays: number;
  preventReuseCount: number;
}

export type MFAMethod = 'email' | 'sms' | 'authenticator' | 'hardware';

export interface ComplianceSettings {
  gdprCompliance: boolean;
  dataRetentionPolicy: string;
  userConsentRequired: boolean;
  dataProcessingAgreement: string;
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
}

// ============================================================================
// DATA & BACKUP SETTINGS
// ============================================================================

export interface DataSettings {
  // Backup Configuration
  backup: BackupSettings;
  
  // Data Retention
  retention: RetentionSettings;
  
  // Data Export/Import
  export: ExportSettings;
  
  // Data Privacy
  privacy: PrivacySettings;
  
  // Data Archival
  archival: ArchivalSettings;
}

export interface BackupSettings {
  enableAutomaticBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  backupTime: string; // HH:mm format
  backupRetentionDays: number;
  enableCloudBackup: boolean;
  cloudBackupProvider?: string;
  backupEncryption: boolean;
  backupVerification: boolean;
}

export interface RetentionSettings {
  userDataRetentionDays: number;
  evaluationDataRetentionDays: number;
  auditLogRetentionDays: number;
  tempFileRetentionHours: number;
  deletedDataRetentionDays: number;
}

export interface ExportSettings {
  allowedExportFormats: string[];
  maxExportSize: number; // in MB
  enableBulkExport: boolean;
  exportCompression: boolean;
  exportEncryption: boolean;
}

export interface PrivacySettings {
  anonymizeData: boolean;
  dataMasking: boolean;
  accessLogging: boolean;
  dataClassification: boolean;
}

export interface ArchivalSettings {
  enableDataArchival: boolean;
  archivalThresholdDays: number;
  archivalLocation: string;
  archivalCompression: boolean;
  archivalEncryption: boolean;
}

// ============================================================================
// ORGANIZATION STRUCTURE SETTINGS
// ============================================================================

export interface OrganizationSettings {
  // Department Configuration
  departments: DepartmentSettings[];
  
  // Role Management
  roles: RoleSettings[];
  
  // Team Structure
  teams: TeamSettings;
  
  // Hierarchy Management
  hierarchy: HierarchySettings;
}

export interface DepartmentSettings {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  defaultCriteria: number[];
  departmentLeadId?: number;
  parentDepartmentId?: number;
  maxTeamSize: number;
  evaluationPeriod: string;
  customSettings: Record<string, any>;
}

export interface RoleSettings {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
  isActive: boolean;
  isSystemRole: boolean;
  hierarchyLevel: number;
  defaultAssignments: string[];
  customPermissions: Record<string, boolean>;
}

export interface TeamSettings {
  maxTeamSize: number;
  minTeamSize: number;
  allowCrossDepartmentTeams: boolean;
  teamLeadRequired: boolean;
  autoAssignEvaluators: boolean;
  teamPerformanceTargets: boolean;
  collaborationSettings: CollaborationSettings;
}

export interface CollaborationSettings {
  enableTeamChat: boolean;
  enableFileSharing: boolean;
  enableTaskAssignment: boolean;
  enableProgressTracking: boolean;
}

export interface HierarchySettings {
  enableDepartmentHierarchy: boolean;
  enableRoleHierarchy: boolean;
  maxHierarchyDepth: number;
  inheritanceRules: InheritanceRule[];
}

export interface InheritanceRule {
  type: 'department' | 'role';
  inheritPermissions: boolean;
  inheritSettings: boolean;
  overrideAllowed: boolean;
}

// ============================================================================
// EVALUATION SYSTEM SETTINGS
// ============================================================================

export interface EvaluationSettings {
  // Workflow Configuration
  workflow: WorkflowSettings;
  
  // Criteria System
  criteria: CriteriaSettings;
  
  // Scoring & Rating
  scoring: ScoringSettings;
  
  // Process Management
  process: ProcessSettings;
}

export interface WorkflowSettings {
  approvalRequired: boolean;
  multiStepEvaluation: boolean;
  reviewRequired: boolean;
  allowScoreModification: boolean;
  enforceDeadlines: boolean;
  lateEvaluationPolicy: 'allow' | 'warn' | 'block';
  autoSubmit: boolean;
  autoSubmitThreshold: number; // percentage
}

export interface CriteriaSettings {
  defaultTemplates: CriteriaTemplate[];
  weightValidation: boolean;
  requireRoleDescriptions: boolean;
  enableCriteriaAnalytics: boolean;
  enableVersioning: boolean;
  customFields: CustomField[];
}

export interface CriteriaTemplate {
  id: number;
  name: string;
  description: string;
  categories: CriteriaCategoryTemplate[];
  isActive: boolean;
  applicableRoles: number[];
}

export interface CriteriaCategoryTemplate {
  id: number;
  name: string;
  weight: number;
  criteria: CriteriaItemTemplate[];
}

export interface CriteriaItemTemplate {
  id: number;
  name: string;
  description: string;
  maxScore: number;
  isRequired: boolean;
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'date';
  required: boolean;
  options?: string[];
  defaultValue?: any;
}

export interface ScoringSettings {
  scoreScale: 5 | 10 | 100;
  enableWeightedScoring: boolean;
  enableBonusScoring: boolean;
  enablePenaltyScoring: boolean;
  gradeLetters: GradeLetter[];
  scoreDisplayFormat: 'number' | 'percentage' | 'letter';
  roundingMethod: 'round' | 'floor' | 'ceil';
}

export interface GradeLetter {
  letter: string;
  minScore: number;
  maxScore: number;
  description: string;
}

export interface ProcessSettings {
  evaluationCycles: EvaluationCycle[];
  reminderSettings: ReminderSettings;
  progressTracking: boolean;
  autoNotifications: boolean;
  evaluationTemplates: EvaluationTemplate[];
}

export interface EvaluationCycle {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  departments: number[];
  criteriaTemplate: number;
}

export interface ReminderSettings {
  enableReminders: boolean;
  reminderDays: number[];
  reminderTime: string;
  escalationDays: number[];
  finalReminderDays: number;
}

export interface EvaluationTemplate {
  id: number;
  name: string;
  description: string;
  criteriaTemplate: number;
  workflow: string;
  isActive: boolean;
}

// ============================================================================
// REPORTING & ANALYTICS SETTINGS
// ============================================================================

export interface ReportingSettings {
  // Report Configuration
  reports: ReportSettings;
  
  // Analytics Configuration
  analytics: AnalyticsSettings;
  
  // Dashboard Settings
  dashboard: DashboardSettings;
}

export interface ReportSettings {
  defaultTemplates: ReportTemplate[];
  schedulingPermissions: boolean;
  sharingPolicies: SharingPolicy[];
  exportFormats: string[];
  retentionPolicies: RetentionPolicy[];
  customReportBuilder: boolean;
}

export interface ReportTemplate {
  id: number;
  name: string;
  description: string;
  type: ReportType;
  parameters: ReportParameter[];
  isActive: boolean;
  applicableRoles: number[];
}

export type ReportType = 'evaluation' | 'performance' | 'analytics' | 'compliance' | 'custom';

export interface ReportParameter {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'select';
  required: boolean;
  defaultValue?: any;
  options?: string[];
}

export interface SharingPolicy {
  type: 'public' | 'role-based' | 'department-based' | 'user-specific';
  roles?: number[];
  departments?: number[];
  users?: number[];
  expirationDays?: number;
}

export interface RetentionPolicy {
  type: 'immediate' | 'days' | 'months' | 'years';
  value: number;
  archiveBeforeDelete: boolean;
}

export interface AnalyticsSettings {
  performanceMetrics: PerformanceMetric[];
  benchmarkData: BenchmarkData[];
  trendAnalysis: boolean;
  comparativeAnalysis: boolean;
  dataVisualization: VisualizationSettings;
  realTimeAnalytics: boolean;
}

export interface PerformanceMetric {
  id: string;
  name: string;
  description: string;
  calculation: string;
  unit: string;
  target?: number;
  isActive: boolean;
}

export interface BenchmarkData {
  id: string;
  name: string;
  source: string;
  updateFrequency: string;
  isActive: boolean;
}

export interface VisualizationSettings {
  defaultChartType: 'bar' | 'line' | 'pie' | 'radar' | 'scatter';
  colorScheme: string[];
  enableAnimations: boolean;
  responsiveCharts: boolean;
  exportCharts: boolean;
}

export interface DashboardSettings {
  roleConfigurations: RoleDashboardConfig[];
  widgetAvailability: WidgetAvailability[];
  refreshIntervals: RefreshInterval[];
  alertThresholds: AlertThreshold[];
  sharingPermissions: boolean;
}

export interface RoleDashboardConfig {
  roleId: number;
  defaultLayout: string;
  availableWidgets: string[];
  customSettings: Record<string, any>;
}

export interface WidgetAvailability {
  widgetId: string;
  name: string;
  roles: number[];
  departments: number[];
  isActive: boolean;
}

export interface RefreshInterval {
  type: 'manual' | 'auto';
  interval: number; // in seconds
  applicableWidgets: string[];
}

export interface AlertThreshold {
  metricId: string;
  warningThreshold: number;
  criticalThreshold: number;
  notificationChannels: string[];
}

// ============================================================================
// API INTEGRATION SETTINGS
// ============================================================================

export interface APISettings {
  // API Management
  management: APIManagement;
  
  // Integration Settings
  integrations: IntegrationSettings;
  
  // Developer Settings
  developer: DeveloperSettings;
}

export interface APIManagement {
  enableAPI: boolean;
  rateLimiting: RateLimitSettings;
  authentication: APIAuthSettings;
  logging: APILoggingSettings;
  monitoring: APIMonitoringSettings;
}

export interface RateLimitSettings {
  requestsPerMinute: number;
  requestsPerHour: number;
  burstLimit: number;
  enableRateLimiting: boolean;
}

export interface APIAuthSettings {
  enableAPIKeys: boolean;
  keyExpirationDays: number;
  requireHTTPS: boolean;
  enableOAuth: boolean;
  oauthProviders: OAuthProvider[];
}

export interface OAuthProvider {
  name: string;
  clientId: string;
  clientSecret: string;
  isActive: boolean;
}

export interface APILoggingSettings {
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  logRetentionDays: number;
  sensitiveDataMasking: boolean;
}

export interface APIMonitoringSettings {
  enableMonitoring: boolean;
  healthCheckEndpoint: string;
  performanceMetrics: boolean;
  errorTracking: boolean;
}

export interface IntegrationSettings {
  ldap: LDAPSettings;
  sso: SSOSettings;
  hrSystem: HRSystemSettings;
  calendar: CalendarSettings;
  email: EmailIntegrationSettings;
  storage: StorageSettings;
}

export interface LDAPSettings {
  enableLDAP: boolean;
  serverUrl: string;
  port: number;
  baseDN: string;
  bindDN: string;
  bindPassword: string;
  enableSSL: boolean;
  userSearchFilter: string;
  groupSearchFilter: string;
}

export interface SSOSettings {
  enableSSO: boolean;
  provider: 'saml' | 'oidc' | 'oauth2';
  metadataUrl: string;
  entityId: string;
  assertionConsumerServiceUrl: string;
  certificatePath: string;
  enableAutoProvisioning: boolean;
}

export interface HRSystemSettings {
  enableIntegration: boolean;
  systemType: 'workday' | 'bamboo' | 'adp' | 'custom';
  apiEndpoint: string;
  apiKey: string;
  syncFrequency: string;
  syncFields: string[];
}

export interface CalendarSettings {
  enableIntegration: boolean;
  provider: 'google' | 'outlook' | 'exchange';
  apiKey: string;
  calendarId: string;
  syncEvaluationDeadlines: boolean;
  syncReminders: boolean;
}

export interface EmailIntegrationSettings {
  enableIntegration: boolean;
  provider: 'gmail' | 'outlook' | 'exchange' | 'smtp';
  apiKey: string;
  syncSentEmails: boolean;
  enableEmailTracking: boolean;
}

export interface StorageSettings {
  enableIntegration: boolean;
  provider: 'aws' | 'azure' | 'gcp' | 'local';
  bucketName: string;
  accessKey: string;
  secretKey: string;
  region: string;
  enableBackup: boolean;
}

export interface DeveloperSettings {
  enableDeveloperMode: boolean;
  debugLogging: boolean;
  apiDocumentation: boolean;
  sandboxEnvironment: boolean;
  testDataGeneration: boolean;
  performanceProfiling: boolean;
}

// ============================================================================
// BRANDING & CUSTOMIZATION SETTINGS
// ============================================================================

export interface BrandingSettings {
  // Visual Customization
  visual: VisualSettings;
  
  // Content Customization
  content: ContentSettings;
  
  // Theme Settings
  theme: ThemeSettings;
}

export interface VisualSettings {
  logo: LogoSettings;
  colorScheme: ColorScheme;
  typography: TypographySettings;
  emailBranding: EmailBranding;
  reportBranding: ReportBranding;
  loadingScreen: LoadingScreenSettings;
}

export interface LogoSettings {
  primaryLogo: string;
  secondaryLogo: string;
  favicon: string;
  logoPosition: 'left' | 'center' | 'right';
  logoSize: 'small' | 'medium' | 'large';
  enableLogoInReports: boolean;
}

export interface ColorScheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  linkColor: string;
  successColor: string;
  warningColor: string;
  errorColor: string;
}

export interface TypographySettings {
  primaryFont: string;
  secondaryFont: string;
  fontSize: 'small' | 'medium' | 'large';
  lineHeight: number;
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
}

export interface EmailBranding {
  headerLogo: string;
  footerLogo: string;
  backgroundColor: string;
  textColor: string;
  linkColor: string;
  customCSS: string;
}

export interface ReportBranding {
  headerLogo: string;
  footerLogo: string;
  watermark: string;
  customHeader: string;
  customFooter: string;
  pageNumbers: boolean;
}

export interface LoadingScreenSettings {
  enableCustomLoading: boolean;
  loadingText: string;
  loadingAnimation: string;
  backgroundColor: string;
  textColor: string;
}

export interface ContentSettings {
  welcomeMessage: string;
  helpText: Record<string, string>;
  legalNotices: LegalNotices;
  termsOfService: string;
  privacyPolicy: string;
  customLabels: Record<string, string>;
  multiLanguage: MultiLanguageSettings;
}

export interface LegalNotices {
  copyright: string;
  disclaimer: string;
  termsUrl: string;
  privacyUrl: string;
  contactInfo: string;
}

export interface MultiLanguageSettings {
  defaultLanguage: string;
  supportedLanguages: string[];
  translations: Record<string, Record<string, string>>;
  autoDetectLanguage: boolean;
}

export interface ThemeSettings {
  enableDarkMode: boolean;
  defaultTheme: 'light' | 'dark' | 'auto';
  customThemes: CustomTheme[];
  themeSwitcher: boolean;
}

export interface CustomTheme {
  id: string;
  name: string;
  colors: ColorScheme;
  isActive: boolean;
}

// ============================================================================
// USER PREFERENCES
// ============================================================================

export interface UserPreferences {
  // Personal Settings
  personal: PersonalSettings;
  
  // Dashboard Preferences
  dashboard: DashboardPreferences;
  
  // Evaluation Preferences
  evaluation: EvaluationPreferences;
  
  // Notification Preferences
  notifications: NotificationPreferences;
}

export interface PersonalSettings {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profilePhoto?: string;
  departmentId?: number;
  roleIds: number[];
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

export interface DashboardPreferences {
  layout: 'grid' | 'list' | 'compact';
  defaultView: 'overview' | 'evaluations' | 'reports' | 'analytics';
  widgetOrder: string[];
  enabledWidgets: string[];
  chartType: 'bar' | 'line' | 'pie' | 'radar';
  refreshInterval: number;
  showNotifications: boolean;
}

export interface EvaluationPreferences {
  defaultPeriod: string;
  autoSaveFrequency: number;
  commentTemplates: string[];
  scoreDisplayFormat: 'number' | 'percentage' | 'letter';
  enableReminders: boolean;
  reminderDays: number[];
  progressTracking: boolean;
}

export interface NotificationPreferences {
  email: NotificationChannelSettings;
  push: NotificationChannelSettings;
  sms: NotificationChannelSettings;
  inApp: NotificationChannelSettings;
  evaluationReminders: boolean;
  systemUpdates: boolean;
  reportNotifications: boolean;
  teamUpdates: boolean;
}

export interface NotificationChannelSettings {
  enabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  quietHours: QuietHours;
  types: NotificationType[];
}

export interface QuietHours {
  enabled: boolean;
  startTime: string;
  endTime: string;
  timezone: string;
}

export type NotificationType = 
  | 'evaluation_assigned'
  | 'evaluation_reminder'
  | 'evaluation_completed'
  | 'system_update'
  | 'report_ready'
  | 'team_update'
  | 'security_alert';

// ============================================================================
// SYSTEM HEALTH & MONITORING
// ============================================================================

export interface SystemHealth {
  // Performance Metrics
  performance: PerformanceMetrics;
  
  // System Status
  status: SystemStatus;
  
  // User Activity
  activity: UserActivity;
  
  // Error Tracking
  errors: ErrorMetrics;
}

export interface PerformanceMetrics {
  responseTime: number;
  databasePerformance: DatabaseMetrics;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  networkLatency: number;
}

export interface DatabaseMetrics {
  queryTime: number;
  connectionCount: number;
  slowQueries: number;
  deadlocks: number;
}

export interface SystemStatus {
  overall: 'healthy' | 'warning' | 'critical';
  services: ServiceStatus[];
  lastCheck: Date;
  uptime: number;
}

export interface ServiceStatus {
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  responseTime: number;
  lastCheck: Date;
  message?: string;
}

export interface UserActivity {
  activeUsers: number;
  totalUsers: number;
  loginFrequency: number;
  featureUsage: FeatureUsage[];
  sessionDuration: number;
  pageViews: number;
}

export interface FeatureUsage {
  feature: string;
  usageCount: number;
  uniqueUsers: number;
  averageTime: number;
}

export interface ErrorMetrics {
  errorRate: number;
  errorCount: number;
  criticalErrors: number;
  recentErrors: ErrorLog[];
}

export interface ErrorLog {
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  stackTrace?: string;
  userId?: number;
  requestId?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface SettingsResponse {
  success: boolean;
  data: SystemSettings;
  message?: string;
}

export interface UserPreferencesResponse {
  success: boolean;
  data: UserPreferences;
  message?: string;
}

export interface SystemHealthResponse {
  success: boolean;
  data: SystemHealth;
  message?: string;
}

export interface SettingsUpdateRequest {
  settings: Partial<SystemSettings>;
  category: keyof SystemSettings;
}

export interface UserPreferencesUpdateRequest {
  preferences: Partial<UserPreferences>;
  category: keyof UserPreferences;
}

// ============================================================================
// PERMISSION TYPES
// ============================================================================

export type Permission = 
  // System Settings
  | 'settings.view'
  | 'settings.edit'
  | 'settings.admin'
  
  // User Management
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'users.manage_roles'
  
  // Department Management
  | 'departments.view'
  | 'departments.create'
  | 'departments.edit'
  | 'departments.delete'
  
  // Team Management
  | 'teams.view'
  | 'teams.create'
  | 'teams.edit'
  | 'teams.delete'
  
  // Evaluation Management
  | 'evaluations.view'
  | 'evaluations.create'
  | 'evaluations.edit'
  | 'evaluations.delete'
  | 'evaluations.submit'
  | 'evaluations.approve'
  
  // Criteria Management
  | 'criteria.view'
  | 'criteria.create'
  | 'criteria.edit'
  | 'criteria.delete'
  
  // Reports
  | 'reports.view'
  | 'reports.create'
  | 'reports.export'
  | 'reports.schedule'
  
  // Analytics
  | 'analytics.view'
  | 'analytics.export'
  | 'analytics.admin'
  
  // System Administration
  | 'system.health'
  | 'system.backup'
  | 'system.restore'
  | 'system.logs'
  | 'system.api'
  
  // API Management
  | 'api.view'
  | 'api.create'
  | 'api.edit'
  | 'api.delete'
  | 'api.monitor';

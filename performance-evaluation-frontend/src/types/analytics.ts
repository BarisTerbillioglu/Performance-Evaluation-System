export interface AnalyticsRequest {
  startDate?: string;
  endDate?: string;
  departmentIds?: number[];
  teamIds?: number[];
  metricTypes?: string[];
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'department' | 'team';
  includeComparisons?: boolean;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
  category?: string;
  color?: string;
  metadata?: Record<string, unknown>;
}

export interface PerformanceMetrics {
  totalEvaluations: number;
  completedEvaluations: number;
  completionRate: number;
  averageScore: number;
  totalUsers: number;
  activeUsers: number;
  totalDepartments: number;
  totalTeams: number;
}

export interface TrendData {
  label: string;
  date: string;
  value: number;
  category: string;
}

export interface DepartmentComparison {
  departmentId: number;
  departmentName: string;
  averageScore: number;
  totalEvaluations: number;
  completedEvaluations: number;
  completionRate: number;
  employeeCount: number;
}

export interface TopPerformer {
  userId: number;
  employeeName: string;
  departmentName: string;
  averageScore: number;
  totalEvaluations: number;
  rank: number;
  avatar?: string;
}

export interface ScoreDistribution {
  range: string;
  count: number;
  percentage: number;
  color: string;
}

export interface EvaluationProgress {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface RealTimeMetrics {
  evaluationsCompletedToday: number;
  evaluationsInProgress: number;
  averageCompletionTime: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
}

export interface AdvancedAnalytics {
  metrics: PerformanceMetrics;
  trendData: TrendData[];
  departmentComparisons: DepartmentComparison[];
  topPerformers: TopPerformer[];
  scoreDistribution: ScoreDistribution[];
  evaluationProgress: EvaluationProgress[];
  realTimeMetrics: RealTimeMetrics;
  generatedAt: string;
  period: string;
}

export interface ChartExportOptions {
  format: 'png' | 'jpg' | 'pdf' | 'svg';
  width?: number;
  height?: number;
  backgroundColor?: string;
}

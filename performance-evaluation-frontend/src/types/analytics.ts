export interface AnalyticsRequest {
  startDate?: Date;
  endDate?: Date;
  departmentIds?: number[];
  metricTypes?: string[];
  groupBy?: string;
  includeComparisons?: boolean;
}

export interface AnalyticsResponse {
  totalUsers: number;
  totalEvaluations: number;
  completedEvaluations: number;
  averageScore: number;
  performanceTrend: any[];
  departmentPerformance: any[];
  topPerformers: any[];
  recentActivity: any[];
  totalTeams?: number;
  radarData?: any[];
  heatmapData?: any[];
}

export interface RealTimeMetrics {
  activeUsers: number;
  activeEvaluations: number;
  completedToday: number;
  averageCompletionTime: number;
}

export interface TopPerformer {
  id: number;
  name: string;
  email: string;
  department: string;
  score: number;
  rank: number;
  avatar?: string;
  improvement?: number;
}

export interface DepartmentPerformance {
  id: number;
  name: string;
  averageScore: number;
  totalEmployees: number;
  completionRate: number;
}

export interface PerformanceTrend {
  date: string;
  score: number;
  evaluations: number;
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

// Dashboard DTOs for different user types
export interface BaseDashboardDto {
  totalEvaluations: number;
  completedEvaluations: number;
  pendingEvaluations: number;
  overdueEvaluations: number;
}

export interface AdminDashboardDto extends BaseDashboardDto {
  totalUsers: number;
  activeUsers: number;
  totalDepartments: number;
  systemAlerts: SystemAlert[];
  recentActivity: ActivityItem[];
  performanceMetrics: PerformanceMetric[];
}

export interface EmployeeDashboardDto extends BaseDashboardDto {
  myEvaluations: number;
  completedByMe: number;
  pendingFromMe: number;
  averageScore: number;
  recentFeedback: FeedbackItem[];
  upcomingDeadlines: DeadlineItem[];
}

export interface EvaluatorDashboardDto extends BaseDashboardDto {
  assignedToMe: number;
  completedByMe: number;
  pendingFromMe: number;
  averageScoreGiven: number;
  myEvaluees: EvalueeInfo[];
  evaluationQueue: EvaluationQueueItem[];
}

// Supporting interfaces
export interface SystemAlert {
  id: number;
  type: 'Warning' | 'Error' | 'Info';
  title: string;
  message: string;
  timestamp: string;
  isResolved: boolean;
}

export interface ActivityItem {
  id: number;
  userId: number;
  userName: string;
  action: string;
  entityType: string;
  entityId: number;
  timestamp: string;
  details?: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  previousValue: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
}

export interface FeedbackItem {
  evaluationId: number;
  evaluatorName: string;
  criteriaName: string;
  score: number;
  comment: string;
  date: string;
}

export interface DeadlineItem {
  evaluationId: number;
  evaluatorName: string;
  dueDate: string;
  daysRemaining: number;
  status: string;
}

export interface EvalueeInfo {
  userId: number;
  name: string;
  departmentName: string;
  totalEvaluations: number;
  completedEvaluations: number;
  averageScore: number;
}

export interface EvaluationQueueItem {
  evaluationId: number;
  employeeName: string;
  departmentName: string;
  dueDate: string;
  status: string;
  priority: 'High' | 'Medium' | 'Low';
}

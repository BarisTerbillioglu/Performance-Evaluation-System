import { BaseEntity } from './common';
import { UserSummaryDto } from './user';

// Team DTOs matching backend
export interface TeamDto extends BaseEntity {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  parentTeamId?: number;
  departmentId?: number;
  departmentName?: string;
}

export interface TeamWithMembersDto extends BaseEntity {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  parentTeamId?: number;
  departmentId?: number;
  departmentName?: string;
  members: TeamAssignmentDto[];
  memberCount: number;
  evaluatorCount: number;
  employeeCount: number;
}

export interface TeamAssignmentDto {
  id: number;
  teamId: number;
  userId: number;
  user: UserSummaryDto;
  role: string;
  assignedDate: string;
  isActive: boolean;
  isEvaluator: boolean;
}

// Enhanced Team Member for Dashboard
export interface TeamMemberDto {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  avatar?: string;
  isEvaluator: boolean;
  currentEvaluationStatus: 'pending' | 'in_progress' | 'completed' | 'overdue';
  latestScore?: number;
  performanceTrend: 'improving' | 'declining' | 'stable';
  lastEvaluationDate?: string;
  evaluationCount: number;
  averageScore?: number;
  performanceHistory: Array<{
    period: string;
    score: number;
    date: string;
  }>;
}

// Team Dashboard Statistics
export interface TeamDashboardStatsDto {
  totalMembers: number;
  activeEvaluations: number;
  completedEvaluations: number;
  completionRate: number;
  teamAverageScore: number;
  departmentAverageScore: number;
  pendingEvaluations: number;
  overdueEvaluations: number;
  topPerformers: TeamMemberDto[];
  recentActivity: Array<{
    id: number;
    type: 'evaluation_started' | 'evaluation_completed' | 'member_added' | 'member_removed';
    description: string;
    timestamp: string;
    userId?: number;
    userName?: string;
  }>;
}

// Team Performance Analytics
export interface TeamPerformanceAnalyticsDto {
  teamId: number;
  teamName: string;
  period: string;
  metrics: {
    averageScore: number;
    completionRate: number;
    onTimeCompletions: number;
    totalEvaluations: number;
    memberSatisfaction: number;
    teamCollaboration: number;
  };
  trends: {
    scoreTrend: number;
    completionTrend: number;
    satisfactionTrend: number;
  };
  categoryPerformance: Array<{
    categoryName: string;
    averageScore: number;
    maxScore: number;
    improvement: number;
  }>;
  memberPerformance: Array<{
    userId: number;
    userName: string;
    score: number;
    rank: number;
    improvement: number;
  }>;
}

// Team Analytics
export interface TeamAnalyticsDto {
  teamId: number;
  teamName: string;
  totalMembers: number;
  activeMembers: number;
  evaluators: number;
  employees: number;
  averagePerformanceScore: number;
  completedEvaluations: number;
  pendingEvaluations: number;
  teamEfficiency: number;
  lastEvaluationDate?: string;
}

// Team Hierarchy
export interface TeamHierarchyDto {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  memberCount: number;
  children: TeamHierarchyDto[];
  level: number;
}

// Team Performance Metrics
export interface TeamPerformanceMetricsDto {
  teamId: number;
  teamName: string;
  period: string;
  metrics: {
    averageScore: number;
    completionRate: number;
    onTimeCompletions: number;
    totalEvaluations: number;
    memberSatisfaction: number;
    teamCollaboration: number;
  };
  trends: {
    scoreTrend: number;
    completionTrend: number;
    satisfactionTrend: number;
  };
}

// Request DTOs
export interface CreateTeamRequest {
  name: string;
  description: string;
  parentTeamId?: number;
  departmentId?: number;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
  parentTeamId?: number;
  departmentId?: number;
}

export interface AssignEmployeeRequest {
  userId: number;
  role: string;
}

export interface AssignEvaluatorRequest {
  userId: number;
  role: string;
}

export interface UpdateUserTeamRequest {
  teamId: number;
  role?: string;
  isActive?: boolean;
}

// Bulk Operations
export interface BulkTeamOperationRequest {
  teamIds: number[];
  operation: 'activate' | 'deactivate' | 'delete' | 'assignEvaluator' | 'removeEvaluator';
  data?: {
    evaluatorId?: number;
    role?: string;
  };
}

export interface BulkMemberTransferRequest {
  sourceTeamId: number;
  targetTeamId: number;
  userIds: number[];
  newRole?: string;
}

export interface BulkTeamAssignmentRequest {
  teamId: number;
  userIds: number[];
  role: string;
  isEvaluator: boolean;
}

// Team Search and Filters
export interface TeamSearchRequest {
  searchTerm?: string;
  departmentId?: number;
  isActive?: boolean;
  hasEvaluators?: boolean;
  minMemberCount?: number;
  maxMemberCount?: number;
  parentTeamId?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Team Statistics
export interface TeamStatisticsDto {
  totalTeams: number;
  activeTeams: number;
  totalMembers: number;
  totalEvaluators: number;
  averageTeamSize: number;
  teamsWithEvaluators: number;
  teamsWithoutEvaluators: number;
  departmentDistribution: Array<{
    departmentId: number;
    departmentName: string;
    teamCount: number;
    memberCount: number;
  }>;
}

// Team Templates
export interface TeamTemplateDto {
  id: number;
  name: string;
  description: string;
  departmentId?: number;
  structure: {
    roles: Array<{
      name: string;
      count: number;
      isEvaluator: boolean;
    }>;
    defaultEvaluatorRole?: string;
  };
  createdBy: number;
  createdAt: string;
  isActive: boolean;
}

// Team Communication
export interface TeamAnnouncementDto {
  id: number;
  teamId: number;
  title: string;
  message: string;
  createdBy: number;
  createdByUser: string;
  createdAt: string;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high';
}

// Team Goals
export interface TeamGoalDto {
  id: number;
  teamId: number;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  createdBy: number;
  createdAt: string;
}

// Available Users for Team Assignment
export interface AvailableUserDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  role: string;
  currentTeamId?: number;
  currentTeamName?: string;
  isEvaluator: boolean;
  isAvailable: boolean;
}

// Team Member Performance Trend
export interface MemberPerformanceTrendDto {
  userId: number;
  userName: string;
  scores: Array<{
    period: string;
    score: number;
    date: string;
  }>;
  trend: 'improving' | 'declining' | 'stable';
  averageScore: number;
  improvement: number;
}

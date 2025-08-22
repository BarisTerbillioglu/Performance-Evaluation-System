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

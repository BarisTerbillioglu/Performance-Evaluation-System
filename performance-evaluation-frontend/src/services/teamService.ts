import { apiClient } from './api';
import {
  TeamDto,
  TeamWithMembersDto,
  TeamAssignmentDto,
  CreateTeamRequest,
  UpdateTeamRequest,
  AssignEmployeeRequest,
  AssignEvaluatorRequest,
  UpdateUserTeamRequest,
  TeamAnalyticsDto,
  TeamHierarchyDto,
  TeamPerformanceMetricsDto,
  BulkTeamOperationRequest,
  BulkMemberTransferRequest,
  BulkTeamAssignmentRequest,
  TeamSearchRequest,
  TeamStatisticsDto,
  UserSummaryDto,
} from '@/types';

export const teamService = {
  /**
   * Get all teams
   */
  getTeams: async (): Promise<TeamDto[]> => {
    return await apiClient.get<TeamDto[]>('/api/team');
  },

  /**
   * Search teams with filters
   */
  searchTeams: async (request: TeamSearchRequest): Promise<TeamWithMembersDto[]> => {
    return await apiClient.get<TeamWithMembersDto[]>('/api/team/search', request);
  },

  /**
   * Get team by ID
   */
  getTeamById: async (id: number): Promise<TeamDto> => {
    return await apiClient.get<TeamDto>(`/api/team/${id}`);
  },

  /**
   * Get team with members
   */
  getTeamWithMembers: async (id: number): Promise<TeamWithMembersDto> => {
    return await apiClient.get<TeamWithMembersDto>(`/api/team/${id}/with-members`);
  },

  /**
   * Get all teams with members
   */
  getTeamsWithMembers: async (): Promise<TeamWithMembersDto[]> => {
    return await apiClient.get<TeamWithMembersDto[]>('/api/team/with-members');
  },

  /**
   * Get team analytics
   */
  getTeamAnalytics: async (teamId: number): Promise<TeamAnalyticsDto> => {
    return await apiClient.get<TeamAnalyticsDto>(`/api/team/${teamId}/analytics`);
  },

  /**
   * Get all teams analytics
   */
  getAllTeamsAnalytics: async (): Promise<TeamAnalyticsDto[]> => {
    return await apiClient.get<TeamAnalyticsDto[]>('/api/team/analytics');
  },

  /**
   * Get team performance metrics
   */
  getTeamPerformanceMetrics: async (teamId: number, period: string): Promise<TeamPerformanceMetricsDto> => {
    return await apiClient.get<TeamPerformanceMetricsDto>(`/api/team/${teamId}/performance`, { period });
  },

  /**
   * Get team hierarchy
   */
  getTeamHierarchy: async (): Promise<TeamHierarchyDto[]> => {
    return await apiClient.get<TeamHierarchyDto[]>('/api/team/hierarchy');
  },

  /**
   * Get team statistics
   */
  getTeamStatistics: async (): Promise<TeamStatisticsDto> => {
    return await apiClient.get<TeamStatisticsDto>('/api/team/statistics');
  },

  /**
   * Create new team
   */
  createTeam: async (team: CreateTeamRequest): Promise<TeamDto> => {
    return await apiClient.post<TeamDto>('/api/team', team);
  },

  /**
   * Update team
   */
  updateTeam: async (id: number, team: UpdateTeamRequest): Promise<TeamDto> => {
    return await apiClient.put<TeamDto>(`/api/team/${id}`, team);
  },

  /**
   * Delete team
   */
  deleteTeam: async (id: number): Promise<{ message: string }> => {
    return await apiClient.delete<{ message: string }>(`/api/team/${id}`);
  },

  /**
   * Assign employee to team
   */
  assignEmployee: async (teamId: number, request: AssignEmployeeRequest): Promise<{ message: string }> => {
    return await apiClient.post<{ message: string }>(`/api/team/${teamId}/assign-employee`, request);
  },

  /**
   * Assign evaluator to team
   */
  assignEvaluator: async (teamId: number, request: AssignEvaluatorRequest): Promise<{ message: string }> => {
    return await apiClient.post<{ message: string }>(`/api/team/${teamId}/assign-evaluator`, request);
  },

  /**
   * Remove user from team
   */
  removeUserFromTeam: async (teamId: number, userId: number): Promise<{ message: string }> => {
    return await apiClient.delete<{ message: string }>(`/api/team/${teamId}/remove-user/${userId}`);
  },

  /**
   * Update user team assignment
   */
  updateUserTeam: async (teamId: number, userId: number, request: UpdateUserTeamRequest): Promise<{ message: string }> => {
    return await apiClient.put<{ message: string }>(`/api/team/${teamId}/user/${userId}`, request);
  },

  /**
   * Get team members
   */
  getTeamMembers: async (teamId: number): Promise<TeamAssignmentDto[]> => {
    return await apiClient.get<TeamAssignmentDto[]>(`/api/team/${teamId}/members`);
  },

  /**
   * Get user teams
   */
  getUserTeams: async (userId: number): Promise<TeamAssignmentDto[]> => {
    return await apiClient.get<TeamAssignmentDto[]>(`/api/team/user/${userId}`);
  },

  /**
   * Get active teams
   */
  getActiveTeams: async (): Promise<TeamDto[]> => {
    return await apiClient.get<TeamDto[]>('/api/team/active');
  },

  /**
   * Activate team
   */
  activateTeam: async (id: number): Promise<{ message: string }> => {
    return await apiClient.put<{ message: string }>(`/api/team/${id}/activate`);
  },

  /**
   * Deactivate team
   */
  deactivateTeam: async (id: number): Promise<{ message: string }> => {
    return await apiClient.put<{ message: string }>(`/api/team/${id}/deactivate`);
  },

  /**
   * Bulk team operations
   */
  bulkTeamOperations: async (request: BulkTeamOperationRequest): Promise<{ message: string; results: any[] }> => {
    return await apiClient.post<{ message: string; results: any[] }>('/api/team/bulk-operations', request);
  },

  /**
   * Bulk member transfer between teams
   */
  bulkMemberTransfer: async (request: BulkMemberTransferRequest): Promise<{ message: string; results: any[] }> => {
    return await apiClient.post<{ message: string; results: any[] }>('/api/team/bulk-transfer', request);
  },

  /**
   * Bulk team assignment
   */
  bulkTeamAssignment: async (request: BulkTeamAssignmentRequest): Promise<{ message: string; results: any[] }> => {
    return await apiClient.post<{ message: string; results: any[] }>('/api/team/bulk-assignment', request);
  },

  /**
   * Transfer member between teams
   */
  transferMember: async (userId: number, sourceTeamId: number, targetTeamId: number, newRole?: string): Promise<{ message: string }> => {
    return await apiClient.post<{ message: string }>('/api/team/transfer-member', {
      userId,
      sourceTeamId,
      targetTeamId,
      newRole,
    });
  },

  /**
   * Get available evaluators for team
   */
  getAvailableEvaluators: async (teamId: number): Promise<UserSummaryDto[]> => {
    return await apiClient.get<UserSummaryDto[]>(`/api/team/${teamId}/available-evaluators`);
  },

  /**
   * Get available employees for team
   */
  getAvailableEmployees: async (teamId: number): Promise<UserSummaryDto[]> => {
    return await apiClient.get<UserSummaryDto[]>(`/api/team/${teamId}/available-employees`);
  },

  /**
   * Get team performance comparison
   */
  getTeamPerformanceComparison: async (teamIds: number[], period: string): Promise<TeamPerformanceMetricsDto[]> => {
    return await apiClient.get<TeamPerformanceMetricsDto[]>('/api/team/performance-comparison', {
      teamIds: teamIds.join(','),
      period,
    });
  },
};

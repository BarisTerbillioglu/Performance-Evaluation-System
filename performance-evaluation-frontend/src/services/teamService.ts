import { apiClient } from './api';
import { 
  TeamDto, 
  TeamWithMembersDto,
  TeamDashboardStatsDto,
  TeamPerformanceAnalyticsDto,
  TeamAnalyticsDto,
  TeamStatisticsDto,
  TeamMemberDto,
  AvailableUserDto,
  CreateTeamRequest, 
  UpdateTeamRequest,
  AssignEmployeeRequest,
  AssignEvaluatorRequest,
  BulkTeamOperationRequest,
  BulkMemberTransferRequest,
  BulkTeamAssignmentRequest,
  TeamSearchRequest,
  TeamTemplateDto,
  TeamAnnouncementDto,
  TeamGoalDto,
  MemberPerformanceTrendDto
} from '@/types';

export const teamService = {
  /**
   * Get all teams
   */
  getTeams: async (): Promise<TeamDto[]> => {
    return await apiClient.get<TeamDto[]>('/api/team');
  },

  /**
   * Get team by ID
   */
  getTeamById: async (id: number): Promise<TeamDto> => {
    return await apiClient.get<TeamDto>(`/api/team/${id}`);
  },

  /**
   * Create new team
   */
  createTeam: async (teamData: CreateTeamRequest): Promise<TeamDto> => {
    return await apiClient.post<TeamDto>('/api/team', teamData);
  },

  /**
   * Update team
   */
  updateTeam: async (id: number, teamData: UpdateTeamRequest): Promise<TeamDto> => {
    return await apiClient.put<TeamDto>(`/api/team/${id}`, teamData);
  },

  /**
   * Delete team
   */
  deleteTeam: async (id: number): Promise<{ message: string }> => {
    return await apiClient.delete<{ message: string }>(`/api/team/${id}`);
  },

  /**
   * Get teams with members (for admin view)
   */
  getTeamsWithMembers: async (): Promise<TeamWithMembersDto[]> => {
    return await apiClient.get<TeamWithMembersDto[]>('/api/team/with-members');
  },

  /**
   * Get team members
   */
  getTeamMembers: async (teamId: number): Promise<TeamMemberDto[]> => {
    return await apiClient.get<TeamMemberDto[]>(`/api/team/${teamId}/members`);
  },

  /**
   * Add member to team
   */
  addTeamMember: async (teamId: number, request: AssignEmployeeRequest): Promise<{ message: string }> => {
    return await apiClient.post<{ message: string }>(`/api/team/${teamId}/members`, request);
  },

  /**
   * Assign employee to team (alias for addTeamMember)
   */
  assignEmployee: async (teamId: number, request: AssignEmployeeRequest): Promise<{ message: string }> => {
    return await apiClient.post<{ message: string }>(`/api/team/${teamId}/members`, request);
  },

  /**
   * Remove member from team
   */
  removeTeamMember: async (teamId: number, userId: number): Promise<{ message: string }> => {
    return await apiClient.delete<{ message: string }>(`/api/team/${teamId}/members/${userId}`);
  },

  /**
   * Remove user from team (alias for removeTeamMember)
   */
  removeUserFromTeam: async (teamId: number, userId: number): Promise<{ message: string }> => {
    return await apiClient.delete<{ message: string }>(`/api/team/${teamId}/members/${userId}`);
  },

  /**
   * Assign evaluator to team
   */
  assignEvaluator: async (teamId: number, request: AssignEvaluatorRequest): Promise<{ message: string }> => {
    return await apiClient.post<{ message: string }>(`/api/team/${teamId}/evaluator`, request);
  },

  /**
   * Get team dashboard statistics (for evaluator)
   */
  getTeamDashboardStats: async (): Promise<TeamDashboardStatsDto> => {
    return await apiClient.get<TeamDashboardStatsDto>('/api/dashboard/team-performance');
  },

  /**
   * Get team performance analytics
   */
  getTeamPerformanceAnalytics: async (teamId: number, period?: string): Promise<TeamPerformanceAnalyticsDto> => {
    const params = period ? `?period=${period}` : '';
    return await apiClient.get<TeamPerformanceAnalyticsDto>(`/api/team/${teamId}/analytics${params}`);
  },

  /**
   * Get team statistics (for admin)
   */
  getTeamStatistics: async (): Promise<TeamStatisticsDto> => {
    return await apiClient.get<TeamStatisticsDto>('/api/team/statistics');
  },

  /**
   * Get available users for team assignment
   */
  getAvailableUsers: async (): Promise<AvailableUserDto[]> => {
    return await apiClient.get<AvailableUserDto[]>('/api/user/available-for-team');
  },

  /**
   * Get evaluators for team assignment
   */
  getEvaluators: async (): Promise<AvailableUserDto[]> => {
    return await apiClient.get<AvailableUserDto[]>('/api/user/evaluators');
  },

  /**
   * Assign user to team
   */
  assignUserToTeam: async (userId: number, teamId: number, role?: string): Promise<{ message: string }> => {
    return await apiClient.put<{ message: string }>(`/api/user/${userId}/team`, { teamId, role });
  },

  /**
   * Bulk team operations
   */
  bulkTeamOperation: async (request: BulkTeamOperationRequest): Promise<{ message: string }> => {
    return await apiClient.post<{ message: string }>('/api/team/bulk-operations', request);
  },

  /**
   * Bulk member transfer
   */
  bulkMemberTransfer: async (request: BulkMemberTransferRequest): Promise<{ message: string }> => {
    return await apiClient.post<{ message: string }>('/api/team/bulk-transfer', request);
  },

  /**
   * Bulk team assignment
   */
  bulkTeamAssignment: async (request: BulkTeamAssignmentRequest): Promise<{ message: string }> => {
    return await apiClient.post<{ message: string }>('/api/team/bulk-assignment', request);
  },

  /**
   * Search teams with filters
   */
  searchTeams: async (request: TeamSearchRequest): Promise<{ data: TeamWithMembersDto[], totalCount: number }> => {
    return await apiClient.post<{ data: TeamWithMembersDto[], totalCount: number }>('/api/team/search', request);
  },

  /**
   * Get team templates
   */
  getTeamTemplates: async (): Promise<TeamTemplateDto[]> => {
    return await apiClient.get<TeamTemplateDto[]>('/api/team/templates');
  },

  /**
   * Create team from template
   */
  createTeamFromTemplate: async (templateId: number, teamData: CreateTeamRequest): Promise<TeamDto> => {
    return await apiClient.post<TeamDto>(`/api/team/templates/${templateId}/create`, teamData);
  },

  /**
   * Get team announcements
   */
  getTeamAnnouncements: async (teamId: number): Promise<TeamAnnouncementDto[]> => {
    return await apiClient.get<TeamAnnouncementDto[]>(`/api/team/${teamId}/announcements`);
  },

  /**
   * Create team announcement
   */
  createTeamAnnouncement: async (teamId: number, announcement: Omit<TeamAnnouncementDto, 'id' | 'teamId' | 'createdBy' | 'createdAt'>): Promise<TeamAnnouncementDto> => {
    return await apiClient.post<TeamAnnouncementDto>(`/api/team/${teamId}/announcements`, announcement);
  },

  /**
   * Get team goals
   */
  getTeamGoals: async (teamId: number): Promise<TeamGoalDto[]> => {
    return await apiClient.get<TeamGoalDto[]>(`/api/team/${teamId}/goals`);
  },

  /**
   * Create team goal
   */
  createTeamGoal: async (teamId: number, goal: Omit<TeamGoalDto, 'id' | 'teamId' | 'createdBy' | 'createdAt'>): Promise<TeamGoalDto> => {
    return await apiClient.post<TeamGoalDto>(`/api/team/${teamId}/goals`, goal);
  },

  /**
   * Get member performance trend
   */
  getMemberPerformanceTrend: async (teamId: number, userId: number): Promise<MemberPerformanceTrendDto> => {
    return await apiClient.get<MemberPerformanceTrendDto>(`/api/team/${teamId}/members/${userId}/performance-trend`);
  },

  /**
   * Export team data
   */
  exportTeamData: async (teamId: number, format: 'csv' | 'excel' = 'excel'): Promise<Blob> => {
    const response = await apiClient.get(`/api/team/${teamId}/export?format=${format}`, {
      responseType: 'blob'
    });
    return response;
  },

  /**
   * Get team evaluations
   */
  getTeamEvaluations: async (teamId: number, status?: string): Promise<any[]> => {
    const params = status ? `?teamId=${teamId}&status=${status}` : `?teamId=${teamId}`;
    return await apiClient.get<any[]>(`/api/evaluation${params}`);
  },

  /**
   * Create evaluations for entire team
   */
  createTeamEvaluations: async (teamId: number, period: string): Promise<{ message: string }> => {
    return await apiClient.post<{ message: string }>(`/api/team/${teamId}/evaluations`, { period });
  },

  /**
   * Get team hierarchy
   */
  getTeamHierarchy: async (): Promise<any[]> => {
    return await apiClient.get<any[]>('/api/team/hierarchy');
  },

  /**
   * Validate team assignment
   */
  validateTeamAssignment: async (teamId: number, userId: number): Promise<{ isValid: boolean, message?: string }> => {
    return await apiClient.get<{ isValid: boolean, message?: string }>(`/api/team/${teamId}/validate-assignment/${userId}`);
  }
};

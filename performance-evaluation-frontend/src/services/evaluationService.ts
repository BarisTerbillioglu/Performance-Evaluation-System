import { apiClient } from './api';
import { 
  EvaluationDto, 
  EvaluationListDto, 
  EvaluationDetailDto, 
  EvaluationFormDto,
  CreateEvaluationRequest, 
  UpdateEvaluationRequest,
  UpdateScoreRequest,
  EvaluationScoreDto,
  AddCommentRequest,
  CommentDto,
  UpdateCommentRequest,
  PagedResult,
  EvaluationStatus,
  EvaluationDashboardDto
} from '@/types';

export const evaluationService = {
  /**
   * Get evaluations with filters and pagination
   */
  getEvaluations: async (params?: {
    status?: string;
    evaluatorId?: number;
    employeeId?: number;
    departmentId?: number;
    period?: string;
    searchTerm?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PagedResult<EvaluationListDto>> => {
    return await apiClient.get<PagedResult<EvaluationListDto>>('/api/evaluation', params);
  },

  /**
   * Get evaluation by ID
   */
  getEvaluationById: async (id: number): Promise<EvaluationDetailDto> => {
    return await apiClient.get<EvaluationDetailDto>(`/api/evaluation/${id}`);
  },

  /**
   * Create new evaluation
   */
  createEvaluation: async (evaluationData: CreateEvaluationRequest): Promise<EvaluationDto> => {
    return await apiClient.post<EvaluationDto>('/api/evaluation', evaluationData);
  },

  /**
   * Update evaluation
   */
  updateEvaluation: async (id: number, evaluationData: UpdateEvaluationRequest): Promise<EvaluationDto> => {
    return await apiClient.put<EvaluationDto>(`/api/evaluation/${id}`, evaluationData);
  },

  /**
   * Delete evaluation
   */
  deleteEvaluation: async (id: number): Promise<{ message: string }> => {
    return await apiClient.delete<{ message: string }>(`/api/evaluation/${id}`);
  },

  /**
   * Get evaluation form with criteria and scores
   */
  getEvaluationForm: async (id: number): Promise<EvaluationFormDto> => {
    return await apiClient.get<EvaluationFormDto>(`/api/evaluation/${id}/form`);
  },

  /**
   * Update score for a specific criteria
   */
  updateScore: async (evaluationId: number, scoreData: UpdateScoreRequest): Promise<EvaluationScoreDto> => {
    return await apiClient.put<EvaluationScoreDto>('/api/evaluation/score', scoreData);
  },

  /**
   * Update score for a specific criteria (alternative endpoint)
   */
  updateCriteriaScore: async (evaluationId: number, criteriaId: number, score: number): Promise<EvaluationScoreDto> => {
    return await apiClient.put<EvaluationScoreDto>(`/api/evaluation/${evaluationId}/criteria/${criteriaId}/score`, { score });
  },

  /**
   * Add comment to a criteria
   */
  addComment: async (commentData: AddCommentRequest): Promise<CommentDto> => {
    return await apiClient.post<CommentDto>('/api/evaluation/comment', commentData);
  },

  /**
   * Add comment to a specific criteria (alternative endpoint)
   */
  addCriteriaComment: async (evaluationId: number, criteriaId: number, comment: string): Promise<CommentDto> => {
    return await apiClient.post<CommentDto>(`/api/evaluation/${evaluationId}/criteria/${criteriaId}/comments`, { comment });
  },

  /**
   * Get comments for a specific criteria
   */
  getCriteriaComments: async (evaluationId: number, criteriaId: number): Promise<CommentDto[]> => {
    return await apiClient.get<CommentDto[]>(`/api/evaluation/${evaluationId}/criteria/${criteriaId}/comments`);
  },

  /**
   * Update comment
   */
  updateComment: async (id: number, commentData: UpdateCommentRequest): Promise<CommentDto> => {
    return await apiClient.put<CommentDto>(`/api/evaluation/comment/${id}`, commentData);
  },

  /**
   * Delete comment
   */
  deleteComment: async (id: number): Promise<{ message: string }> => {
    return await apiClient.delete<{ message: string }>(`/api/evaluation/comment/${id}`);
  },

  /**
   * Submit evaluation (finalize)
   */
  submitEvaluation: async (id: number): Promise<{ message: string }> => {
    return await apiClient.post<{ message: string }>(`/api/evaluation/${id}/submit`);
  },

  /**
   * Get evaluation summary
   */
  getEvaluationSummary: async (id: number): Promise<EvaluationFormDto> => {
    return await apiClient.get<EvaluationFormDto>(`/api/evaluation/${id}/summary`);
  },

  /**
   * Get evaluations by status
   */
  getEvaluationsByStatus: async (status: EvaluationStatus): Promise<EvaluationListDto[]> => {
    return await apiClient.get<EvaluationListDto[]>(`/api/evaluation/status/${status}`);
  },

  /**
   * Get evaluation dashboard statistics
   */
  getEvaluationDashboard: async (): Promise<EvaluationDashboardDto> => {
    return await apiClient.get<EvaluationDashboardDto>('/api/evaluation/dashboard');
  },

  /**
   * Get evaluation statistics
   */
  getEvaluationStatistics: async (params?: {
    departmentId?: number;
    period?: string;
    evaluatorId?: number;
  }): Promise<{
    totalEvaluations: number;
    completedEvaluations: number;
    pendingEvaluations: number;
    overdueEvaluations: number;
    averageScore: number;
    scoreDistribution: { score: number; count: number }[];
    completionRate: number;
    departmentStats: { departmentName: string; count: number; averageScore: number }[];
  }> => {
    return await apiClient.get('/api/evaluation/statistics', params);
  },

  /**
   * Bulk create evaluations
   */
  bulkCreateEvaluations: async (evaluations: CreateEvaluationRequest[]): Promise<{ message: string; createdCount: number; errors: string[] }> => {
    return await apiClient.post<{ message: string; createdCount: number; errors: string[] }>('/api/evaluation/bulk', { evaluations });
  },

  /**
   * Bulk update evaluation status
   */
  bulkUpdateStatus: async (evaluationIds: number[], status: EvaluationStatus): Promise<{ message: string }> => {
    return await apiClient.put<{ message: string }>('/api/evaluation/bulk/status', { evaluationIds, status });
  },

  /**
   * Get evaluation templates
   */
  getEvaluationTemplates: async (): Promise<{
    id: number;
    name: string;
    description: string;
    criteriaIds: number[];
    departmentId?: number;
    roleId?: number;
  }[]> => {
    return await apiClient.get('/api/evaluation/templates');
  },

  /**
   * Create evaluation from template
   */
  createFromTemplate: async (templateId: number, evaluationData: CreateEvaluationRequest): Promise<EvaluationDto> => {
    return await apiClient.post<EvaluationDto>(`/api/evaluation/template/${templateId}`, evaluationData);
  },

  /**
   * Save evaluation as template
   */
  saveAsTemplate: async (evaluationId: number, templateName: string, templateDescription?: string): Promise<{ id: number; message: string }> => {
    return await apiClient.post<{ id: number; message: string }>(`/api/evaluation/${evaluationId}/template`, { 
      name: templateName, 
      description: templateDescription 
    });
  },

  /**
   * Export evaluations to CSV
   */
  exportEvaluations: async (filters?: {
    status?: string;
    departmentId?: number;
    period?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> => {
    return await apiClient.downloadFile('/api/evaluation/export', filters);
  },

  /**
   * Get evaluation history for employee
   */
  getEmployeeEvaluationHistory: async (employeeId: number): Promise<EvaluationListDto[]> => {
    return await apiClient.get<EvaluationListDto[]>(`/api/evaluation/employee/${employeeId}/history`);
  },

  /**
   * Get evaluator's assigned evaluations
   */
  getEvaluatorAssignments: async (evaluatorId: number): Promise<EvaluationListDto[]> => {
    return await apiClient.get<EvaluationListDto[]>(`/api/evaluation/evaluator/${evaluatorId}/assignments`);
  },

  /**
   * Check if evaluation exists for employee and period
   */
  checkEvaluationExists: async (employeeId: number, period: string): Promise<{ exists: boolean; evaluationId?: number }> => {
    return await apiClient.get<{ exists: boolean; evaluationId?: number }>('/api/evaluation/check-exists', { employeeId, period });
  },

  /**
   * Auto-save evaluation progress
   */
  autoSaveEvaluation: async (evaluationId: number, scores: { criteriaId: number; score: number }[]): Promise<{ message: string }> => {
    return await apiClient.put<{ message: string }>(`/api/evaluation/${evaluationId}/auto-save`, { scores });
  },

  /**
   * Get evaluation progress
   */
  getEvaluationProgress: async (evaluationId: number): Promise<{
    totalCriteria: number;
    completedCriteria: number;
    progressPercentage: number;
    lastSaved: string;
  }> => {
    return await apiClient.get(`/api/evaluation/${evaluationId}/progress`);
  },

  /**
   * Get my evaluations (for current user)
   */
  getMyEvaluations: async (): Promise<EvaluationListDto[]> => {
    return await apiClient.get<EvaluationListDto[]>('/api/evaluation/my');
  },

  /**
   * Get assigned evaluations (for evaluators)
   */
  getAssignedEvaluations: async (): Promise<EvaluationListDto[]> => {
    return await apiClient.get<EvaluationListDto[]>('/api/evaluation/assigned');
  },

  /**
   * Search evaluations
   */
  searchEvaluations: async (searchRequest: any): Promise<PagedResult<EvaluationListDto[]>> => {
    return await apiClient.post<PagedResult<EvaluationListDto[]>>('/api/evaluation/search', searchRequest);
  },

  /**
   * Get evaluation scores
   */
  getEvaluationScores: async (evaluationId: number): Promise<EvaluationScoreDto[]> => {
    return await apiClient.get<EvaluationScoreDto[]>(`/api/evaluation/${evaluationId}/scores`);
  },

  /**
   * Get score comments
   */
  getScoreComments: async (scoreId: number): Promise<CommentDto[]> => {
    return await apiClient.get<CommentDto[]>(`/api/evaluation/score/${scoreId}/comments`);
  },
};

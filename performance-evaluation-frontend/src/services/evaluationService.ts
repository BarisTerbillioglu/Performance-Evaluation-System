import { apiClient } from './api';
import {
  EvaluationDto,
  EvaluationListDto,
  EvaluationFormDto,
  EvaluationSummaryDto,
  CreateEvaluationRequest,
  UpdateEvaluationRequest,
  UpdateEvaluationBasicInfoRequest,
  EvaluationScoreDto,
  UpdateScoreRequest,
  CommentDto,
  AddCommentRequest,
  UpdateCommentRequest,
  BaseSearchRequest,
  PaginatedResponse,
} from '@/types';

export const evaluationService = {
  /**
   * Get all evaluations with role-based filtering
   */
  getEvaluations: async (): Promise<EvaluationListDto[]> => {
    return await apiClient.get<EvaluationListDto[]>('/api/evaluation');
  },

  /**
   * Get evaluation by ID
   */
  getEvaluationById: async (id: number): Promise<EvaluationDto> => {
    return await apiClient.get<EvaluationDto>(`/api/evaluation/${id}`);
  },

  /**
   * Get evaluation form data
   */
  getEvaluationForm: async (id: number): Promise<EvaluationFormDto> => {
    return await apiClient.get<EvaluationFormDto>(`/api/evaluation/${id}/form`);
  },

  /**
   * Create new evaluation
   */
  createEvaluation: async (evaluation: CreateEvaluationRequest): Promise<EvaluationDto> => {
    return await apiClient.post<EvaluationDto>('/api/evaluation', evaluation);
  },

  /**
   * Update evaluation
   */
  updateEvaluation: async (id: number, evaluation: UpdateEvaluationRequest): Promise<EvaluationDto> => {
    return await apiClient.put<EvaluationDto>(`/api/evaluation/${id}`, evaluation);
  },

  /**
   * Update evaluation basic info
   */
  updateEvaluationBasicInfo: async (id: number, request: UpdateEvaluationBasicInfoRequest): Promise<EvaluationDto> => {
    return await apiClient.put<EvaluationDto>(`/api/evaluation/${id}/basic-info`, request);
  },

  /**
   * Delete evaluation
   */
  deleteEvaluation: async (id: number): Promise<{ message: string }> => {
    return await apiClient.delete<{ message: string }>(`/api/evaluation/${id}`);
  },

  /**
   * Submit evaluation
   */
  submitEvaluation: async (id: number): Promise<{ message: string }> => {
    return await apiClient.put<{ message: string }>(`/api/evaluation/${id}/submit`);
  },

  /**
   * Complete evaluation
   */
  completeEvaluation: async (id: number): Promise<{ message: string }> => {
    return await apiClient.put<{ message: string }>(`/api/evaluation/${id}/complete`);
  },

  /**
   * Get evaluation scores
   */
  getEvaluationScores: async (evaluationId: number): Promise<EvaluationScoreDto[]> => {
    return await apiClient.get<EvaluationScoreDto[]>(`/api/evaluation/${evaluationId}/scores`);
  },

  /**
   * Update evaluation score
   */
  updateScore: async (evaluationId: number, request: UpdateScoreRequest): Promise<EvaluationScoreDto> => {
    return await apiClient.put<EvaluationScoreDto>(`/api/evaluation/${evaluationId}/score`, request);
  },

  /**
   * Get comments for evaluation score
   */
  getScoreComments: async (scoreId: number): Promise<CommentDto[]> => {
    return await apiClient.get<CommentDto[]>(`/api/evaluation/score/${scoreId}/comments`);
  },

  /**
   * Add comment to evaluation score
   */
  addComment: async (request: AddCommentRequest): Promise<CommentDto> => {
    return await apiClient.post<CommentDto>('/api/evaluation/comment', request);
  },

  /**
   * Update comment
   */
  updateComment: async (commentId: number, request: UpdateCommentRequest): Promise<CommentDto> => {
    return await apiClient.put<CommentDto>(`/api/evaluation/comment/${commentId}`, request);
  },

  /**
   * Delete comment
   */
  deleteComment: async (commentId: number): Promise<{ message: string }> => {
    return await apiClient.delete<{ message: string }>(`/api/evaluation/comment/${commentId}`);
  },

  /**
   * Get evaluations summary
   */
  getEvaluationsSummary: async (): Promise<EvaluationSummaryDto[]> => {
    return await apiClient.get<EvaluationSummaryDto[]>('/api/evaluation/summary');
  },

  /**
   * Search evaluations
   */
  searchEvaluations: async (request: BaseSearchRequest): Promise<PaginatedResponse<EvaluationListDto>> => {
    return await apiClient.post<PaginatedResponse<EvaluationListDto>>('/api/evaluation/search', request);
  },

  /**
   * Get my evaluations (as employee)
   */
  getMyEvaluations: async (): Promise<EvaluationListDto[]> => {
    return await apiClient.get<EvaluationListDto[]>('/api/evaluation/my-evaluations');
  },

  /**
   * Get evaluations assigned to me (as evaluator)
   */
  getAssignedEvaluations: async (): Promise<EvaluationListDto[]> => {
    return await apiClient.get<EvaluationListDto[]>('/api/evaluation/assigned');
  },
};

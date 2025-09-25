import {
  EvaluationDto,
  EvaluationListDto,
  EvaluationFormDto,
  EvaluationSummaryDto,
  CreateEvaluationRequest,
  UpdateEvaluationRequest,
  EvaluationScoreDto,
  UpdateScoreRequest,
  CommentDto,
  AddCommentRequest,
  UpdateCommentRequest,
} from '@/types';

export interface EvaluationState {
  // Evaluations data
  evaluations: EvaluationListDto[];
  currentEvaluation: EvaluationDto | null;
  evaluationForm: EvaluationFormDto | null;
  evaluationSummaries: EvaluationSummaryDto[];
  
  // Scores and comments
  scores: Record<number, EvaluationScoreDto[]>; // keyed by evaluationId
  comments: Record<number, CommentDto[]>; // keyed by scoreId
  
  // UI state
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isSubmitting: boolean;
  error: string | null;
  
  // Filters and pagination
  filters: {
    status?: string;
    period?: string;
    employeeId?: number;
    evaluatorId?: number;
    departmentId?: number;
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  
  // Cache timestamps
  lastFetch: Record<string, number>;
}

export interface EvaluationActions {
  // Evaluation CRUD
  fetchEvaluations: (filters?: any) => Promise<void>;
  fetchEvaluationById: (id: number) => Promise<void>;
  fetchEvaluationForm: (id: number) => Promise<void>;
  createEvaluation: (data: CreateEvaluationRequest) => Promise<EvaluationDto>;
  updateEvaluation: (id: number, data: UpdateEvaluationRequest) => Promise<void>;
  deleteEvaluation: (id: number) => Promise<void>;
  submitEvaluation: (id: number) => Promise<void>;
  completeEvaluation: (id: number) => Promise<void>;
  
  // Score management
  fetchScores: (evaluationId: number) => Promise<void>;
  updateScore: (evaluationId: number, data: UpdateScoreRequest) => Promise<void>;
  updateScoreOptimistic: (evaluationId: number, criteriaId: number, score: number) => void;
  
  // Comment management
  fetchComments: (scoreId: number) => Promise<void>;
  addComment: (data: AddCommentRequest) => Promise<void>;
  updateComment: (commentId: number, data: UpdateCommentRequest) => Promise<void>;
  deleteComment: (commentId: number) => Promise<void>;
  addCommentOptimistic: (scoreId: number, description: string) => void;
  
  // UI state management
  setFilters: (filters: Partial<EvaluationState['filters']>) => void;
  setPagination: (pagination: Partial<EvaluationState['pagination']>) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  
  // Cache management
  invalidateCache: (key?: string) => void;
  clearCurrentEvaluation: () => void;
  reset: () => void;
}

export interface EvaluationStore extends EvaluationState, EvaluationActions {}

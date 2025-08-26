import {
  EvaluationDto,
  EvaluationListDto,
  EvaluationDetailDto,
  EvaluationFormDto,
  CreateEvaluationRequest,
  UpdateEvaluationRequest,
  EvaluationScoreDto,
  UpdateScoreRequest,
  CommentDto,
  AddCommentRequest,
  UpdateCommentRequest,
  PagedResult,
  ApiError
} from '@/types';

export interface EvaluationState {
  evaluations: EvaluationListDto[];
  currentEvaluation: EvaluationDetailDto | null;
  evaluationForm: EvaluationFormDto | null;
  evaluationSummaries: EvaluationListDto[];
  scores: EvaluationScoreDto[];
  comments: CommentDto[];
  loading: {
    evaluations: boolean;
    evaluation: boolean;
    form: boolean;
    create: boolean;
    update: boolean;
    submit: boolean;
    scores: boolean;
    comments: boolean;
  };
  error: string | null;
  filters: {
    status?: string;
    evaluatorId?: number;
    employeeId?: number;
    departmentId?: number;
    period?: string;
  };
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
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

  // Scores and comments
  updateScore: (data: UpdateScoreRequest) => Promise<void>;
  addComment: (data: AddCommentRequest) => Promise<CommentDto>;
  updateComment: (id: number, data: UpdateCommentRequest) => Promise<void>;
  deleteComment: (id: number) => Promise<void>;

  // Utility actions
  setError: (error: string | null) => void;
  clearError: () => void;
  setLoading: (key: keyof EvaluationState['loading'], loading: boolean) => void;
  setFilters: (filters: Partial<EvaluationState['filters']>) => void;
  setPagination: (pagination: Partial<EvaluationState['pagination']>) => void;
  reset: () => void;
}

export interface EvaluationStore extends EvaluationState, EvaluationActions {}

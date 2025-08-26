import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { StateCreator } from 'zustand';
import {
  evaluationService
} from '@/services';
import { loggerWithActions } from '../middleware/logger';
import {
  EvaluationDto,
  EvaluationListDto,
  EvaluationDetailDto,
  EvaluationFormDto,
  EvaluationScoreDto,
  CommentDto,
  CreateEvaluationRequest,
  UpdateEvaluationRequest,
  UpdateScoreRequest,
  AddCommentRequest,
  UpdateCommentRequest,
  PagedResult,
  ApiError
} from '@/types';

interface EvaluationState {
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

interface EvaluationActions {
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

type EvaluationStoreType = EvaluationState & EvaluationActions;

const createEvaluationSlice: StateCreator<
  EvaluationStoreType,
  [['zustand/immer', never]],
  [],
  EvaluationStoreType
> = (set, get) => ({
  // State
  evaluations: [],
  currentEvaluation: null,
  evaluationForm: null,
  evaluationSummaries: [],
  scores: [],
  comments: [],
  loading: {
    evaluations: false,
    evaluation: false,
    form: false,
    create: false,
    update: false,
    submit: false,
    scores: false,
    comments: false,
  },
  error: null,
  filters: {},
  pagination: {
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  lastFetch: {},

  // Actions
  fetchEvaluations: async (filters = {}) => {
    set((state) => {
      state.loading.evaluations = true;
      state.error = null;
    });

    try {
      const response: PagedResult<EvaluationListDto> = await evaluationService.getEvaluations(filters);
      set((state) => {
        state.evaluations = response.data;
        state.pagination = {
          page: response.page,
          pageSize: response.pageSize,
          totalCount: response.totalCount,
          totalPages: response.totalPages,
          hasNextPage: response.hasNextPage,
          hasPreviousPage: response.hasPreviousPage,
        };
        state.loading.evaluations = false;
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
        state.loading.evaluations = false;
      });
    }
  },

  fetchEvaluationById: async (id: number) => {
    set((state) => {
      state.loading.evaluation = true;
      state.error = null;
    });

    try {
      const evaluation: EvaluationDetailDto = await evaluationService.getEvaluationById(id);
      set((state) => {
        state.currentEvaluation = evaluation;
        state.loading.evaluation = false;
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
        state.loading.evaluation = false;
      });
    }
  },

  fetchEvaluationForm: async (id: number) => {
    set((state) => {
      state.loading.form = true;
      state.error = null;
    });

    try {
      const form: EvaluationFormDto = await evaluationService.getEvaluationForm(id);
      set((state) => {
        state.evaluationForm = form;
        state.loading.form = false;
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
        state.loading.form = false;
      });
    }
  },

  createEvaluation: async (data: CreateEvaluationRequest) => {
    set((state) => {
      state.loading.create = true;
      state.error = null;
    });

    try {
      const newEvaluation: EvaluationDto = await evaluationService.createEvaluation(data);
      set((state) => {
        state.evaluations.push(newEvaluation as EvaluationListDto);
        state.loading.create = false;
      });
      return newEvaluation;
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
        state.loading.create = false;
      });
      throw error;
    }
  },

  updateEvaluation: async (id: number, data: UpdateEvaluationRequest) => {
    set((state) => {
      state.loading.update = true;
      state.error = null;
    });

    try {
      const updatedEvaluation: EvaluationDto = await evaluationService.updateEvaluation(id, data);
      set((state) => {
        const index = state.evaluations.findIndex(e => e.id === id);
        if (index !== -1) {
          state.evaluations[index] = updatedEvaluation as EvaluationListDto;
        }
        if (state.currentEvaluation?.id === id) {
          state.currentEvaluation = { ...state.currentEvaluation, ...updatedEvaluation };
        }
        state.loading.update = false;
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
        state.loading.update = false;
      });
      throw error;
    }
  },

  deleteEvaluation: async (id: number) => {
    set((state) => {
      state.loading.evaluation = true;
      state.error = null;
    });

    try {
      await evaluationService.deleteEvaluation(id);
      set((state) => {
        state.evaluations = state.evaluations.filter(e => e.id !== id);
        if (state.currentEvaluation?.id === id) {
          state.currentEvaluation = null;
        }
        state.loading.evaluation = false;
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
        state.loading.evaluation = false;
      });
      throw error;
    }
  },

  submitEvaluation: async (id: number) => {
    set((state) => {
      state.loading.submit = true;
      state.error = null;
    });

    try {
      await evaluationService.submitEvaluation(id);
      set((state) => {
        const evaluation = state.evaluations.find(e => e.id === id);
        if (evaluation) {
          evaluation.status = 'Submitted';
        }
        if (state.currentEvaluation?.id === id) {
          state.currentEvaluation.status = 'Submitted';
        }
        state.loading.submit = false;
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
        state.loading.submit = false;
      });
      throw error;
    }
  },

  updateScore: async (data: UpdateScoreRequest) => {
    set((state) => {
      state.loading.scores = true;
      state.error = null;
    });

    try {
      const updatedScore: EvaluationScoreDto = await evaluationService.updateScore(data);
      set((state) => {
        const index = state.scores.findIndex(s => s.evaluationId === data.evaluationId && s.criteriaId === data.criteriaId);
        if (index !== -1) {
          state.scores[index] = updatedScore;
        } else {
          state.scores.push(updatedScore);
        }
        state.loading.scores = false;
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
        state.loading.scores = false;
      });
      throw error;
    }
  },

  addComment: async (data: AddCommentRequest) => {
    set((state) => {
      state.loading.comments = true;
      state.error = null;
    });

    try {
      const newComment: CommentDto = await evaluationService.addComment(data);
      set((state) => {
        state.comments.push(newComment);
        state.loading.comments = false;
      });
      return newComment;
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
        state.loading.comments = false;
      });
      throw error;
    }
  },

  updateComment: async (id: number, data: UpdateCommentRequest) => {
    set((state) => {
      state.loading.comments = true;
      state.error = null;
    });

    try {
      const updatedComment: CommentDto = await evaluationService.updateComment(id, data);
      set((state) => {
        const index = state.comments.findIndex(c => c.id === id);
        if (index !== -1) {
          state.comments[index] = updatedComment;
        }
        state.loading.comments = false;
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
        state.loading.comments = false;
      });
      throw error;
    }
  },

  deleteComment: async (id: number) => {
    set((state) => {
      state.loading.comments = true;
      state.error = null;
    });

    try {
      await evaluationService.deleteComment(id);
      set((state) => {
        state.comments = state.comments.filter(c => c.id !== id);
        state.loading.comments = false;
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
        state.loading.comments = false;
      });
      throw error;
    }
  },

  setError: (error: string | null) => {
    set((state) => {
      state.error = error;
    });
  },

  clearError: () => {
    set((state) => {
      state.error = null;
    });
  },

  setLoading: (key: keyof EvaluationState['loading'], loading: boolean) => {
    set((state) => {
      state.loading[key] = loading;
    });
  },

  setFilters: (filters: Partial<EvaluationState['filters']>) => {
    set((state) => {
      state.filters = { ...state.filters, ...filters };
    });
  },

  setPagination: (pagination: Partial<EvaluationState['pagination']>) => {
    set((state) => {
      state.pagination = { ...state.pagination, ...pagination };
    });
  },

  reset: () => {
    set((state) => {
      state.evaluations = [];
      state.currentEvaluation = null;
      state.evaluationForm = null;
      state.evaluationSummaries = [];
      state.scores = [];
      state.comments = [];
      state.loading = {
        evaluations: false,
        evaluation: false,
        form: false,
        create: false,
        update: false,
        submit: false,
        scores: false,
        comments: false,
      };
      state.error = null;
      state.filters = {};
      state.pagination = {
        page: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };
      state.lastFetch = {};
    });
  }
});

export const useEvaluationStore = create<EvaluationStoreType>()(
  loggerWithActions(
    immer(createEvaluationSlice),
    {
      name: 'EvaluationStore',
    }
  )
);

// Export selectors
export const evaluationSelectors = {
  evaluations: (state: EvaluationStoreType) => state.evaluations,
  currentEvaluation: (state: EvaluationStoreType) => state.currentEvaluation,
  evaluationForm: (state: EvaluationStoreType) => state.evaluationForm,
  loading: (state: EvaluationStoreType) => state.loading,
  error: (state: EvaluationStoreType) => state.error,
  scores: (state: EvaluationStoreType) => state.scores,
  comments: (state: EvaluationStoreType) => state.comments,
  filters: (state: EvaluationStoreType) => state.filters,
  pagination: (state: EvaluationStoreType) => state.pagination,
};

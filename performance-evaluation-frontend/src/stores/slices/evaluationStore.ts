import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { EvaluationStore } from '../types/evaluation';
import { evaluationService } from '@/services';
import { loggerWithActions } from '../middleware/logger';
import { useUIStore } from './uiStore';

const initialState = {
  evaluations: [],
  currentEvaluation: null,
  evaluationForm: null,
  evaluationSummaries: [],
  scores: {},
  comments: {},
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isSubmitting: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },
  lastFetch: {},
};

export const useEvaluationStore = create<EvaluationStore>()(
  loggerWithActions(
    immer((set, get) => ({
        // Initial state
        ...initialState,

        // Evaluation CRUD
        fetchEvaluations: async (filters: any = {}) => {
          try {
            set((state: EvaluationStore) => {
              state.isLoading = true;
              state.error = null;
            });

            useUIStore.getState().setLoading('fetchEvaluations', true);

            const response = await evaluationService.getEvaluations();

            set((state: EvaluationStore) => {
              state.evaluations = response.data;
              state.isLoading = false;
              state.lastFetch.evaluations = Date.now();
            });

            useUIStore.getState().setLoading('fetchEvaluations', false);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch evaluations';
            set((state: EvaluationStore) => {
              state.error = errorMessage;
              state.isLoading = false;
            });
            useUIStore.getState().setLoading('fetchEvaluations', false);
            useUIStore.getState().showError('Failed to load evaluations', errorMessage);
            throw error;
          }
        },

        fetchEvaluationById: async (id: number) => {
          try {
            set((state: EvaluationStore) => {
              state.isLoading = true;
              state.error = null;
            });

            const evaluation = await evaluationService.getEvaluationById(id);

            set((state: EvaluationStore) => {
              state.currentEvaluation = evaluation;
              state.isLoading = false;
              state.lastFetch[`evaluation-${id}`] = Date.now();
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch evaluation';
            set((state: EvaluationStore) => {
              state.error = errorMessage;
              state.isLoading = false;
            });
            useUIStore.getState().showError('Failed to load evaluation', errorMessage);
            throw error;
          }
        },

        fetchEvaluationForm: async (id: number) => {
          try {
            set((state: EvaluationStore) => {
              state.isLoading = true;
              state.error = null;
            });

            const form = await evaluationService.getEvaluationForm(id);

            set((state: EvaluationStore) => {
              state.evaluationForm = form;
              state.isLoading = false;
              state.lastFetch[`form-${id}`] = Date.now();
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch evaluation form';
            set((state: EvaluationStore) => {
              state.error = errorMessage;
              state.isLoading = false;
            });
            useUIStore.getState().showError('Failed to load evaluation form', errorMessage);
            throw error;
          }
        },

        createEvaluation: async (data: CreateEvaluationRequest) => {
          try {
            set((state: EvaluationStore) => {
              state.isCreating = true;
              state.error = null;
            });

            useUIStore.getState().setLoading('createEvaluation', true);

            const newEvaluation = await evaluationService.createEvaluation(data);

            set((state: EvaluationStore) => {
              state.isCreating = false;
              // Invalidate evaluations cache
              delete state.lastFetch.evaluations;
            });

            useUIStore.getState().setLoading('createEvaluation', false);
            useUIStore.getState().showSuccess('Evaluation created successfully');

            // Refresh evaluations list
            get().fetchEvaluations();

            return newEvaluation;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create evaluation';
            set((state: EvaluationStore) => {
              state.error = errorMessage;
              state.isCreating = false;
            });
            useUIStore.getState().setLoading('createEvaluation', false);
            useUIStore.getState().showError('Failed to create evaluation', errorMessage);
            throw error;
          }
        },

        updateEvaluation: async (id: number, data: UpdateEvaluationRequest) => {
          try {
            set((state: EvaluationStore) => {
              state.isUpdating = true;
              state.error = null;
            });

            useUIStore.getState().setLoading('updateEvaluation', true);

            await evaluationService.updateEvaluation(id, data);

            set((state: EvaluationStore) => {
              state.isUpdating = false;
              // Invalidate cache
              delete state.lastFetch.evaluations;
              delete state.lastFetch[`evaluation-${id}`];
            });

            useUIStore.getState().setLoading('updateEvaluation', false);
            useUIStore.getState().showSuccess('Evaluation updated successfully');

            // Refresh data
            get().fetchEvaluations();
            if (get().currentEvaluation?.id === id) {
              get().fetchEvaluationById(id);
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update evaluation';
            set((state: EvaluationStore) => {
              state.error = errorMessage;
              state.isUpdating = false;
            });
            useUIStore.getState().setLoading('updateEvaluation', false);
            useUIStore.getState().showError('Failed to update evaluation', errorMessage);
            throw error;
          }
        },

        deleteEvaluation: async (id: number) => {
          try {
            // Optimistic update
            const previousEvaluations = get().evaluations;
            set((state: EvaluationStore) => {
              state.evaluations = state.evaluations.filter((e: EvaluationListDto) => e.id !== id);
            });

            await evaluationService.deleteEvaluation(id);

            set((state: EvaluationStore) => {
              // Clear related data
              if (state.currentEvaluation?.id === id) {
                state.currentEvaluation = null;
              }
              delete state.lastFetch[`evaluation-${id}`];
              delete state.lastFetch.evaluations;
            });

            useUIStore.getState().showSuccess('Evaluation deleted successfully');
          } catch (error) {
            // Revert optimistic update
            set((state: EvaluationStore) => {
              state.evaluations = previousEvaluations;
            });

            const errorMessage = error instanceof Error ? error.message : 'Failed to delete evaluation';
            set((state: EvaluationStore) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to delete evaluation', errorMessage);
            throw error;
          }
        },

        submitEvaluation: async (id: number) => {
          try {
            set((state: EvaluationStore) => {
              state.isSubmitting = true;
              state.error = null;
            });

            useUIStore.getState().setLoading('submitEvaluation', true);

            await evaluationService.submitEvaluation(id);

            set((state: EvaluationStore) => {
              state.isSubmitting = false;
              // Update evaluation status optimistically
              const evaluation = state.evaluations.find((e: EvaluationListDto) => e.id === id);
              if (evaluation) {
                evaluation.status = 'Submitted';
              }
              if (state.currentEvaluation?.id === id) {
                state.currentEvaluation.status = 'Submitted';
              }
            });

            useUIStore.getState().setLoading('submitEvaluation', false);
            useUIStore.getState().showSuccess('Evaluation submitted successfully');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to submit evaluation';
            set((state: EvaluationStore) => {
              state.error = errorMessage;
              state.isSubmitting = false;
            });
            useUIStore.getState().setLoading('submitEvaluation', false);
            useUIStore.getState().showError('Failed to submit evaluation', errorMessage);
            throw error;
          }
        },

        completeEvaluation: async (id: number) => {
          try {
            set((state: EvaluationStore) => {
              state.isUpdating = true;
              state.error = null;
            });

            await evaluationService.completeEvaluation(id);

            set((state: EvaluationStore) => {
              state.isUpdating = false;
              // Update evaluation status optimistically
              const evaluation = state.evaluations.find((e: EvaluationListDto) => e.id === id);
              if (evaluation) {
                evaluation.status = 'Completed';
                evaluation.completedDate = new Date().toISOString();
              }
              if (state.currentEvaluation?.id === id) {
                state.currentEvaluation.status = 'Completed';
                state.currentEvaluation.completedDate = new Date().toISOString();
              }
            });

            useUIStore.getState().showSuccess('Evaluation completed successfully');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to complete evaluation';
            set((state: EvaluationStore) => {
              state.error = errorMessage;
              state.isUpdating = false;
            });
            useUIStore.getState().showError('Failed to complete evaluation', errorMessage);
            throw error;
          }
        },

        // Score management
        fetchScores: async (evaluationId: number) => {
          try {
            const scores = await evaluationService.getEvaluationScores(evaluationId);

            set((state: EvaluationStore) => {
              state.scores[evaluationId] = scores;
              state.lastFetch[`scores-${evaluationId}`] = Date.now();
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch scores';
            set((state: EvaluationStore) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to load scores', errorMessage);
            throw error;
          }
        },

        updateScore: async (evaluationId: number, data: UpdateScoreRequest) => {
          try {
            await evaluationService.updateScore(evaluationId, data);

            // Refresh scores
            get().fetchScores(evaluationId);

            useUIStore.getState().showSuccess('Score updated successfully');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update score';
            set((state: EvaluationStore) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to update score', errorMessage);
            throw error;
          }
        },

        updateScoreOptimistic: (evaluationId: number, criteriaId: number, score: number) => {
          set((state: EvaluationStore) => {
            const scores = state.scores[evaluationId] || [];
            const existingScore = scores.find((s: EvaluationScoreDto) => s.criteriaId === criteriaId);

            if (existingScore) {
              existingScore.score = score;
            } else {
              scores.push({
                id: Date.now(), // temporary ID
                evaluationId,
                criteriaId,
                score,
                createdDate: new Date().toISOString(),
              });
            }

            state.scores[evaluationId] = scores;
          });
        },

        // Comment management
        fetchComments: async (scoreId: number) => {
          try {
            const comments = await evaluationService.getScoreComments(scoreId);

            set((state: EvaluationStore) => {
              state.comments[scoreId] = comments;
              state.lastFetch[`comments-${scoreId}`] = Date.now();
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch comments';
            set((state: EvaluationStore) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to load comments', errorMessage);
            throw error;
          }
        },

        addComment: async (data: AddCommentRequest) => {
          try {
            await evaluationService.addComment(data);

            // Refresh comments
            get().fetchComments(data.criteriaId);

            useUIStore.getState().showSuccess('Comment added successfully');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to add comment';
            set((state: EvaluationStore) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to add comment', errorMessage);
            throw error;
          }
        },

        updateComment: async (commentId: number, data: UpdateCommentRequest) => {
          try {
            await evaluationService.updateComment(commentId, data);

            useUIStore.getState().showSuccess('Comment updated successfully');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update comment';
            set((state: EvaluationStore) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to update comment', errorMessage);
            throw error;
          }
        },

        deleteComment: async (commentId: number) => {
          try {
            await evaluationService.deleteComment(commentId);

            // Remove comment from state
            set((state: EvaluationStore) => {
              Object.keys(state.comments).forEach((scoreId: string) => {
                state.comments[parseInt(scoreId)] = state.comments[parseInt(scoreId)]
                  .filter((c: CommentDto) => c.id !== commentId);
              });
            });

            useUIStore.getState().showSuccess('Comment deleted successfully');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete comment';
            set((state: EvaluationStore) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to delete comment', errorMessage);
            throw error;
          }
        },

        addCommentOptimistic: (scoreId: number, description: string) => {
          set((state: EvaluationStore) => {
            const comments = state.comments[scoreId] || [];
            comments.push({
              id: Date.now(), // temporary ID
              evaluationId: 0, // Will be set by server
              criteriaId: scoreId,
              comment: description,
              createdBy: 0, // Will be set by server
              createdByName: '', // Will be set by server
              createdDate: new Date().toISOString(),
              lastModifiedDate: undefined,
              updatedDate: undefined,
            });
            state.comments[scoreId] = comments;
          });
        },

        // UI state management
        setFilters: (filters: any) => {
          set((state: EvaluationStore) => {
            state.filters = { ...state.filters, ...filters };
          });
        },

        setPagination: (pagination: any) => {
          set((state: EvaluationStore) => {
            state.pagination = { ...state.pagination, ...pagination };
          });
        },

        setError: (error: string | null) => {
          set((state: EvaluationStore) => {
            state.error = error;
          });
        },

        clearError: () => {
          set((state: EvaluationStore) => {
            state.error = null;
          });
        },

        setLoading: (loading: boolean) => {
          set((state: EvaluationStore) => {
            state.isLoading = loading;
          });
        },

        // Cache management
        invalidateCache: (key?: string) => {
          set((state: EvaluationStore) => {
            if (key) {
              delete state.lastFetch[key];
            } else {
              state.lastFetch = {};
            }
          });
        },

        clearCurrentEvaluation: () => {
          set((state: EvaluationStore) => {
            state.currentEvaluation = null;
            state.evaluationForm = null;
          });
        },

        reset: () => {
          set((state: EvaluationStore) => {
            Object.assign(state, initialState);
          });
        },
      })),
      {
        name: 'EvaluationStore',
      }
    )
  );

// Export selectors
export const evaluationSelectors = {
  evaluations: (state: EvaluationStore) => state.evaluations,
  currentEvaluation: (state: EvaluationStore) => state.currentEvaluation,
  evaluationForm: (state: EvaluationStore) => state.evaluationForm,
  isLoading: (state: EvaluationStore) => state.isLoading,
  error: (state: EvaluationStore) => state.error,
  scores: (evaluationId: number) => (state: EvaluationStore) => state.scores[evaluationId] || [],
  comments: (scoreId: number) => (state: EvaluationStore) => state.comments[scoreId] || [],
};

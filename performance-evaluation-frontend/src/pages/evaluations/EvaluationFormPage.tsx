import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  SaveIcon,
  PaperAirplaneIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input, TextArea } from '@/components/ui/form';
import { Badge } from '@/components/ui/feedback';
import { Card } from '@/components/ui/layout';
import { useUIStore } from '@/stores';
import { useAuth } from '@/store';
import { evaluationService } from '@/services/evaluationService';
import { criteriaService } from '@/services/criteriaService';
import { 
  EvaluationFormDto, 
  EvaluationStatus,
  CriteriaWithScoreDto,
  UpdateScoreRequest,
  AddCommentRequest,
  UpdateCommentRequest
} from '@/types';
import { ScoreInput } from './components/ScoreInput';
import { CommentsSection } from './components/CommentsSection';
import { ProgressIndicator } from './components/ProgressIndicator';
import { AutoSaveIndicator } from './components/AutoSaveIndicator';

// Validation schema
const evaluationFormSchema = z.object({
  generalComments: z.string().optional(),
  scores: z.record(z.number().min(1).max(5)),
  comments: z.record(z.string().optional())
});

type EvaluationFormData = z.infer<typeof evaluationFormSchema>;

export const EvaluationFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useUIStore();
  const { state } = useAuth();
  
  // State
  const [evaluation, setEvaluation] = useState<EvaluationFormDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const isNewEvaluation = id === 'new';
  const canEdit = evaluation?.status !== EvaluationStatus.Completed && 
                  evaluation?.status !== EvaluationStatus.Cancelled;

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
    getValues
  } = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationFormSchema),
    mode: 'onChange'
  });

  // Watch for changes to trigger auto-save
  const watchedValues = watch();

  // Load evaluation data
  useEffect(() => {
    if (!isNewEvaluation && id) {
      loadEvaluation(parseInt(id));
    } else {
      setLoading(false);
    }
  }, [id, isNewEvaluation]);

  const loadEvaluation = async (evaluationId: number) => {
    try {
      setLoading(true);
      const data = await evaluationService.getEvaluationForm(evaluationId);
      setEvaluation(data);
      
      // Initialize form with current data
      const scores: Record<string, number> = {};
      const comments: Record<string, string> = {};
      
      data.criteriaWithScores.forEach(criteria => {
        if (criteria.score !== undefined) {
          scores[criteria.criteriaId.toString()] = criteria.score;
        }
        if (criteria.comments.length > 0) {
          comments[criteria.criteriaId.toString()] = criteria.comments.join('\n');
        }
      });
      
      reset({
        generalComments: data.generalComments || '',
        scores,
        comments
      });
      
    } catch (error) {
      console.error('Failed to load evaluation:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load evaluation'
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-save functionality
  const autoSave = useCallback(
    async (data: EvaluationFormData) => {
      if (!evaluation || !canEdit || !isDirty) return;

      try {
        setAutoSaveStatus('saving');
        
        // Save scores
        const scorePromises = Object.entries(data.scores).map(([criteriaId, score]) => {
          const request: UpdateScoreRequest = {
            criteriaId: parseInt(criteriaId),
            score
          };
          return evaluationService.updateScore(evaluation.evaluationId, request);
        });
        
        await Promise.all(scorePromises);
        
        // Update general comments if changed
        if (data.generalComments !== evaluation.generalComments) {
          await evaluationService.updateEvaluation(evaluation.evaluationId, {
            generalComments: data.generalComments
          });
        }
        
        setAutoSaveStatus('saved');
        setLastSaved(new Date());
        
        // Clear saved status after 3 seconds
        setTimeout(() => {
          setAutoSaveStatus('idle');
        }, 3000);
        
      } catch (error) {
        console.error('Auto-save failed:', error);
        setAutoSaveStatus('error');
        setTimeout(() => {
          setAutoSaveStatus('idle');
        }, 3000);
      }
    },
    [evaluation, canEdit, isDirty]
  );

  // Auto-save on form changes (debounced)
  useEffect(() => {
    if (!evaluation || !canEdit || !isDirty) return;

    const timeoutId = setTimeout(() => {
      const currentData = getValues();
      autoSave(currentData);
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeoutId);
  }, [watchedValues, autoSave, evaluation, canEdit, isDirty, getValues]);

  // Handle score change
  const handleScoreChange = (criteriaId: number, score: number) => {
    setValue(`scores.${criteriaId}`, score, { shouldDirty: true });
  };

  // Handle comment change
  const handleCommentChange = (criteriaId: number, comment: string) => {
    setValue(`comments.${criteriaId}`, comment, { shouldDirty: true });
  };

  // Calculate completion progress
  const getProgress = () => {
    if (!evaluation) return 0;
    
    const totalCriteria = evaluation.criteriaWithScores.length;
    const completedCriteria = evaluation.criteriaWithScores.filter(
      criteria => criteria.score !== undefined && criteria.score > 0
    ).length;
    
    return totalCriteria > 0 ? (completedCriteria / totalCriteria) * 100 : 0;
  };

  // Save as draft
  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      const data = getValues();
      await autoSave(data);
      
      showNotification({
        type: 'success',
        title: 'Saved',
        message: 'Evaluation saved as draft'
      });
      
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to save evaluation'
      });
    } finally {
      setSaving(false);
    }
  };

  // Submit evaluation
  const handleSubmit_evaluation = async (data: EvaluationFormData) => {
    if (!evaluation) return;

    try {
      setSubmitting(true);
      
      // Validate all criteria have scores
      const missingScores = evaluation.criteriaWithScores.filter(
        criteria => !data.scores[criteria.criteriaId.toString()] || data.scores[criteria.criteriaId.toString()] === 0
      );
      
      if (missingScores.length > 0) {
        showNotification({
          type: 'error',
          title: 'Incomplete Evaluation',
          message: `Please provide scores for all criteria. Missing: ${missingScores.map(c => c.name).join(', ')}`
        });
        return;
      }
      
      // Save all changes first
      await autoSave(data);
      
      // Submit evaluation
      await evaluationService.submitEvaluation(evaluation.evaluationId);
      
      showNotification({
        type: 'success',
        title: 'Submitted',
        message: 'Evaluation submitted successfully'
      });
      
      navigate('/evaluations');
      
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to submit evaluation'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (isDirty) {
      // Show confirmation dialog for unsaved changes
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/evaluations');
      }
    } else {
      navigate('/evaluations');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!evaluation && !isNewEvaluation) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Evaluation not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The evaluation you're looking for doesn't exist or you don't have access to it.
        </p>
        <div className="mt-6">
          <Button onClick={() => navigate('/evaluations')}>
            Back to Evaluations
          </Button>
        </div>
      </div>
    );
  }

  const progress = getProgress();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isNewEvaluation ? 'New Evaluation' : `Evaluation - ${evaluation?.employeeName}`}
            </h1>
            {evaluation && (
              <p className="text-sm text-gray-500">
                Period: {evaluation.period} • Evaluator: {evaluation.evaluatorName}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <AutoSaveIndicator status={autoSaveStatus} lastSaved={lastSaved} />
          {evaluation && (
            <Badge variant={evaluation.status === EvaluationStatus.Completed ? 'success' : 'warning'}>
              {evaluation.status}
            </Badge>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      {evaluation && (
        <ProgressIndicator progress={progress} totalCriteria={evaluation.criteriaWithScores.length} />
      )}

      <form onSubmit={handleSubmit(handleSubmit_evaluation)} className="space-y-6">
        {/* Evaluation Info */}
        {evaluation && (
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Evaluation Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Employee</label>
                <p className="mt-1 text-sm text-gray-900">{evaluation.employeeName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Period</label>
                <p className="mt-1 text-sm text-gray-900">{evaluation.period}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Score</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {evaluation.totalScore > 0 ? evaluation.totalScore.toFixed(1) : 'Not scored'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Criteria Scoring */}
        {evaluation && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Performance Criteria</h3>
            {evaluation.criteriaWithScores.map((criteria) => (
              <Card key={criteria.criteriaId} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-gray-900">{criteria.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{criteria.categoryName}</p>
                      {criteria.baseDescription && (
                        <p className="text-sm text-gray-500 mt-2">{criteria.baseDescription}</p>
                      )}
                    </div>
                    <Badge variant="secondary" size="sm">
                      Weight: {criteria.categoryWeight}%
                    </Badge>
                  </div>
                  
                  {/* Score Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Score (1-5 scale)
                    </label>
                    <ScoreInput
                      value={watchedValues.scores?.[criteria.criteriaId.toString()] || 0}
                      onChange={(score) => handleScoreChange(criteria.criteriaId, score)}
                      disabled={!canEdit}
                    />
                  </div>
                  
                  {/* Comments */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comments
                    </label>
                    <Controller
                      name={`comments.${criteria.criteriaId}`}
                      control={control}
                      render={({ field }) => (
                        <TextArea
                          {...field}
                          placeholder="Add comments about this criteria..."
                          rows={3}
                          disabled={!canEdit}
                          onChange={(e) => {
                            field.onChange(e);
                            handleCommentChange(criteria.criteriaId, e.target.value);
                          }}
                        />
                      )}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* General Comments */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">General Comments</h3>
          <Controller
            name="generalComments"
            control={control}
            render={({ field }) => (
              <TextArea
                {...field}
                placeholder="Add general comments about the overall performance..."
                rows={4}
                disabled={!canEdit}
              />
            )}
          />
        </Card>

        {/* Actions */}
        {canEdit && (
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={saving || !isDirty}
              leftIcon={<SaveIcon className="w-4 h-4" />}
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button
              type="submit"
              disabled={submitting || progress < 100}
              leftIcon={<PaperAirplaneIcon className="w-4 h-4" />}
            >
              {submitting ? 'Submitting...' : 'Submit Evaluation'}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

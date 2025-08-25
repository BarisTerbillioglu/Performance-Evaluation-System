import React, { useState, useEffect, useCallback } from 'react';
import { 
  StarIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Card } from '@/components/design-system/Card';
import { Input } from '@/components/ui/form';
import { useUIStore } from '@/stores';
import { evaluationService } from '@/services/evaluationService';
import { 
  EvaluationFormDto,
  CriteriaWithScoreDto,
  AddCommentRequest,
  CommentDto
} from '@/types';
import { formatFullName } from '@/utils';

interface EvaluationScoringFormProps {
  evaluationId: number;
  onSave?: () => void;
  onComplete?: () => void;
}

interface CategoryGroup {
  categoryName: string;
  categoryWeight: number;
  criteria: CriteriaWithScoreDto[];
  totalScore: number;
  maxScore: number;
  progress: number;
}

export const EvaluationScoringForm: React.FC<EvaluationScoringFormProps> = ({
  evaluationId,
  onSave,
  onComplete
}) => {
  const { showNotification } = useUIStore();
  
  // State
  const [evaluation, setEvaluation] = useState<EvaluationFormDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [newComments, setNewComments] = useState<Record<number, string>>({});

  // Load evaluation data
  useEffect(() => {
    loadEvaluation();
  }, [evaluationId]);

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges && evaluation) {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      const timer = setTimeout(() => {
        autoSave();
      }, 30000); // 30 seconds
      
      setAutoSaveTimer(timer);
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [hasUnsavedChanges, evaluation]);

  const loadEvaluation = async () => {
    try {
      setLoading(true);
      const data = await evaluationService.getEvaluationForm(evaluationId);
      setEvaluation(data);
      
      // Expand all categories by default
      const categories = new Set(data.criteriaWithScores.map(c => c.categoryName));
      setExpandedCategories(categories);
    } catch (error) {
      console.error('Failed to load evaluation:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load evaluation data'
      });
    } finally {
      setLoading(false);
    }
  };

  const autoSave = async () => {
    if (!evaluation) return;

    try {
      setSaving(true);
      const scores = evaluation.criteriaWithScores
        .filter(c => c.score !== null)
        .map(c => ({ criteriaId: c.criteriaId, score: c.score! }));

      await evaluationService.autoSaveEvaluation(evaluationId, scores);
      setHasUnsavedChanges(false);
      
      showNotification({
        type: 'success',
        title: 'Auto-saved',
        message: 'Your progress has been saved automatically'
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
      showNotification({
        type: 'error',
        title: 'Auto-save failed',
        message: 'Your changes may not have been saved'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleScoreChange = async (criteriaId: number, score: number) => {
    if (!evaluation) return;

    try {
      // Optimistic update
      setEvaluation(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          criteriaWithScores: prev.criteriaWithScores.map(c => 
            c.criteriaId === criteriaId ? { ...c, score } : c
          )
        };
      });

      setHasUnsavedChanges(true);

      // API call
      await evaluationService.updateCriteriaScore(evaluationId, criteriaId, score);
      
      // Update total score
      updateTotalScore();
    } catch (error) {
      console.error('Failed to update score:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update score'
      });
      
      // Revert optimistic update
      loadEvaluation();
    }
  };

  const handleCommentSubmit = async (criteriaId: number) => {
    const comment = newComments[criteriaId];
    if (!comment?.trim()) return;

    try {
      const commentData: AddCommentRequest = {
        evaluationId,
        criteriaId,
        comment: comment.trim()
      };

      const newComment = await evaluationService.addComment(commentData);
      
      // Update local state
      setEvaluation(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          criteriaWithScores: prev.criteriaWithScores.map(c => 
            c.criteriaId === criteriaId 
              ? { ...c, comments: [...(c.comments || []), newComment] }
              : c
          )
        };
      });

      // Clear new comment
      setNewComments(prev => ({ ...prev, [criteriaId]: '' }));
      
      showNotification({
        type: 'success',
        title: 'Comment added',
        message: 'Your comment has been saved'
      });
    } catch (error) {
      console.error('Failed to add comment:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add comment'
      });
    }
  };

  const updateTotalScore = () => {
    if (!evaluation) return;

    const totalScore = evaluation.criteriaWithScores
      .filter(c => c.score !== null)
      .reduce((sum, c) => sum + (c.score || 0), 0);

    const maxScore = evaluation.criteriaWithScores.length * 5;
    const averageScore = totalScore / evaluation.criteriaWithScores.length;

    setEvaluation(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        totalScore: averageScore
      };
    });
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  const toggleComments = (criteriaId: number) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(criteriaId)) {
        newSet.delete(criteriaId);
      } else {
        newSet.add(criteriaId);
      }
      return newSet;
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'success';
    if (score >= 3.5) return 'info';
    if (score >= 2.5) return 'warning';
    return 'error';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 4.5) return 'Excellent';
    if (score >= 3.5) return 'Good';
    if (score >= 2.5) return 'Average';
    if (score >= 1.5) return 'Below Average';
    return 'Poor';
  };

  const groupCriteriaByCategory = (): CategoryGroup[] => {
    if (!evaluation) return [];

    const groups: Record<string, CategoryGroup> = {};

    evaluation.criteriaWithScores.forEach(criteria => {
      if (!groups[criteria.categoryName]) {
        groups[criteria.categoryName] = {
          categoryName: criteria.categoryName,
          categoryWeight: criteria.categoryWeight || 0,
          criteria: [],
          totalScore: 0,
          maxScore: 0,
          progress: 0
        };
      }

      groups[criteria.categoryName].criteria.push(criteria);
      if (criteria.score !== null) {
        groups[criteria.categoryName].totalScore += criteria.score;
      }
      groups[criteria.categoryName].maxScore += 5;
    });

    // Calculate progress for each category
    Object.values(groups).forEach(group => {
      group.progress = group.maxScore > 0 ? (group.totalScore / group.maxScore) * 100 : 0;
    });

    return Object.values(groups);
  };

  const getOverallProgress = () => {
    if (!evaluation) return { completed: 0, total: 0, percentage: 0 };

    const total = evaluation.criteriaWithScores.length;
    const completed = evaluation.criteriaWithScores.filter(c => c.score !== null).length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return { completed, total, percentage };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
        <span className="ml-3 text-gray-600">Loading evaluation...</span>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Evaluation not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The evaluation you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  const categoryGroups = groupCriteriaByCategory();
  const progress = getOverallProgress();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {evaluation.employeeName}
              </h2>
              <p className="text-gray-600">{evaluation.evaluatorName}</p>
              <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                  <span>Department</span>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <span>{evaluation.period}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <Badge variant="warning" size="lg">
              {evaluation.status}
            </Badge>
            {hasUnsavedChanges && (
              <div className="mt-2 flex items-center text-sm text-warning-600">
                <ClockIcon className="h-4 w-4 mr-1" />
                <span>Unsaved changes</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-500">
              {progress.completed} of {progress.total} criteria completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {progress.percentage.toFixed(1)}% complete
          </div>
        </div>

        {/* Total Score */}
        {evaluation.totalScore > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total Score</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-900">
                  {evaluation.totalScore.toFixed(1)}
                </span>
                <Badge variant={getScoreColor(evaluation.totalScore)} size="sm">
                  {getScoreLabel(evaluation.totalScore)}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Criteria Categories */}
      <div className="space-y-4">
        {categoryGroups.map((group) => (
          <Card key={group.categoryName} className="overflow-hidden">
            {/* Category Header */}
            <div 
              className="px-6 py-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
              onClick={() => toggleCategory(group.categoryName)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {expandedCategories.has(group.categoryName) ? (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {group.categoryName}
                  </h3>
                  <Badge variant="secondary" size="sm">
                    {group.categoryWeight}% weight
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {group.totalScore.toFixed(1)} / {group.maxScore}
                    </div>
                    <div className="text-xs text-gray-500">
                      {group.progress.toFixed(1)}% complete
                    </div>
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${group.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Criteria List */}
            {expandedCategories.has(group.categoryName) && (
              <div className="p-6 space-y-6">
                {group.criteria.map((criteria) => (
                  <div key={criteria.criteriaId} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-gray-900 mb-2">
                          {criteria.criteriaName}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {criteria.description}
                        </p>
                        
                        {/* Score Selection */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Score (1-5)
                          </label>
                          <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4, 5].map((score) => (
                              <button
                                key={score}
                                type="button"
                                onClick={() => handleScoreChange(criteria.criteriaId, score)}
                                className={`w-12 h-12 rounded-lg border-2 font-semibold transition-all duration-200 ${
                                  criteria.score === score
                                    ? 'border-primary-500 bg-primary-100 text-primary-700'
                                    : 'border-gray-300 text-gray-600 hover:border-primary-300 hover:bg-primary-50'
                                }`}
                              >
                                {score}
                              </button>
                            ))}
                          </div>
                          {criteria.score && (
                            <div className="mt-2 flex items-center space-x-2">
                              <Badge variant={getScoreColor(criteria.score)} size="sm">
                                {getScoreLabel(criteria.score)}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                Score: {criteria.score}/5
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Comments Section */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => toggleComments(criteria.criteriaId)}
                              className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                            >
                              <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                              Comments ({criteria.comments?.length || 0})
                              {expandedComments.has(criteria.criteriaId) ? (
                                <ChevronDownIcon className="h-4 w-4 ml-1" />
                              ) : (
                                <ChevronRightIcon className="h-4 w-4 ml-1" />
                              )}
                            </button>
                          </div>

                          {expandedComments.has(criteria.criteriaId) && (
                            <div className="space-y-3">
                              {/* Existing Comments */}
                              {criteria.comments?.map((comment) => (
                                <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="text-sm text-gray-900">{comment.comment}</p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {comment.authorName} • {new Date(comment.createdDate).toLocaleDateString('tr-TR')}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {/* New Comment Input */}
                              <div className="space-y-2">
                                <textarea
                                  value={newComments[criteria.criteriaId] || ''}
                                  onChange={(e) => setNewComments(prev => ({ 
                                    ...prev, 
                                    [criteria.criteriaId]: e.target.value 
                                  }))}
                                  placeholder="Add a comment..."
                                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                                  rows={3}
                                />
                                <div className="flex justify-end">
                                  <Button
                                    size="sm"
                                    onClick={() => handleCommentSubmit(criteria.criteriaId)}
                                    disabled={!newComments[criteria.criteriaId]?.trim()}
                                  >
                                    Add Comment
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          {hasUnsavedChanges && (
            <div className="flex items-center text-sm text-warning-600">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>You have unsaved changes</span>
            </div>
          )}
          {saving && (
            <div className="flex items-center text-sm text-primary-600">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent mr-2"></div>
              <span>Saving...</span>
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={autoSave}
            disabled={!hasUnsavedChanges || saving}
          >
            Save Progress
          </Button>
          <Button
            onClick={onComplete}
            disabled={progress.completed < progress.total}
          >
            Complete Evaluation
          </Button>
        </div>
      </div>
    </div>
  );
};

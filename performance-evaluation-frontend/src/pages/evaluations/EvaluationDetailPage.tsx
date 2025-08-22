import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PencilIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  TrophyIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/feedback';
import { Card } from '@/components/ui/layout';
import { useAuth } from '@/store';
import { usePermissions } from '@/hooks/usePermissions';
import { evaluationService } from '@/services/evaluationService';
import { 
  EvaluationFormDto, 
  EvaluationStatus,
  CriteriaWithScoreDto
} from '@/types';
import { ScoreInput } from './components/ScoreInput';
import { CommentsSection } from './components/CommentsSection';
import { PerformanceChart } from './components/PerformanceChart';
import { ScoreBreakdown } from './components/ScoreBreakdown';

export const EvaluationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useAuth();
  const { hasPermission } = usePermissions();
  
  const [evaluation, setEvaluation] = useState<EvaluationFormDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'charts'>('overview');

  useEffect(() => {
    if (id) {
      loadEvaluation(parseInt(id));
    }
  }, [id]);

  const loadEvaluation = async (evaluationId: number) => {
    try {
      setLoading(true);
      const data = await evaluationService.getEvaluationForm(evaluationId);
      setEvaluation(data);
    } catch (error) {
      console.error('Failed to load evaluation:', error);
    } finally {
      setLoading(false);
    }
  };

  const canEdit = () => {
    return evaluation && 
           evaluation.status !== EvaluationStatus.Completed && 
           evaluation.status !== EvaluationStatus.Cancelled &&
           hasPermission('evaluations', 'update');
  };

  const handleEdit = () => {
    if (evaluation) {
      navigate(`/evaluations/${evaluation.evaluationId}/edit`);
    }
  };

  const handleBack = () => {
    navigate('/evaluations');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case EvaluationStatus.Completed:
        return 'success';
      case EvaluationStatus.InProgress:
        return 'warning';
      case EvaluationStatus.Submitted:
        return 'info';
      case EvaluationStatus.Overdue:
        return 'error';
      default:
        return 'secondary';
    }
  };

  const calculateCategoryAverages = () => {
    if (!evaluation) return [];

    const categoryMap = new Map<string, { total: number; count: number; weight: number }>();
    
    evaluation.criteriaWithScores.forEach(criteria => {
      if (criteria.score && criteria.score > 0) {
        const existing = categoryMap.get(criteria.categoryName) || { total: 0, count: 0, weight: criteria.categoryWeight };
        categoryMap.set(criteria.categoryName, {
          total: existing.total + criteria.score,
          count: existing.count + 1,
          weight: criteria.categoryWeight
        });
      }
    });

    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      average: data.total / data.count,
      weight: data.weight,
      count: data.count
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-medium text-gray-900">Evaluation not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The evaluation you're looking for doesn't exist or you don't have access to it.
        </p>
        <div className="mt-6">
          <Button onClick={handleBack}>
            Back to Evaluations
          </Button>
        </div>
      </div>
    );
  }

  const categoryAverages = calculateCategoryAverages();

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
              Evaluation Details
            </h1>
            <p className="text-sm text-gray-500">
              {evaluation.employeeName} • {evaluation.period}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant={getStatusColor(evaluation.status)}>
            {evaluation.status}
          </Badge>
          {canEdit() && (
            <Button
              onClick={handleEdit}
              leftIcon={<PencilIcon className="w-4 h-4" />}
            >
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <UserIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Employee</p>
              <p className="text-lg font-semibold text-gray-900">{evaluation.employeeName}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Period</p>
              <p className="text-lg font-semibold text-gray-900">{evaluation.period}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <TrophyIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Overall Score</p>
              <p className="text-lg font-semibold text-gray-900">
                {evaluation.totalScore > 0 ? evaluation.totalScore.toFixed(1) : 'N/A'}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className="text-lg font-semibold text-gray-900">{evaluation.status}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Detailed Scores
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'charts'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Performance Analysis
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Score Breakdown by Category */}
          <ScoreBreakdown 
            categoryAverages={categoryAverages}
            totalScore={evaluation.totalScore}
          />

          {/* General Comments */}
          {evaluation.generalComments && (
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">General Comments</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{evaluation.generalComments}</p>
            </Card>
          )}

          {/* Recent Comments Summary */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Feedback</h3>
            <div className="space-y-3">
              {evaluation.criteriaWithScores
                .filter(criteria => criteria.comments.length > 0)
                .slice(0, 3)
                .map(criteria => (
                  <div key={criteria.criteriaId} className="border-l-4 border-blue-400 pl-4">
                    <p className="font-medium text-gray-900">{criteria.name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {criteria.comments[criteria.comments.length - 1]}
                    </p>
                  </div>
                ))}
              {evaluation.criteriaWithScores.every(c => c.comments.length === 0) && (
                <p className="text-gray-500 text-center py-4">No comments available</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'details' && (
        <div className="space-y-4">
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
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" size="sm">
                      Weight: {criteria.categoryWeight}%
                    </Badge>
                    {criteria.score && (
                      <Badge variant="primary" size="sm">
                        Score: {criteria.score}/5
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Score Display */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score
                  </label>
                  <ScoreInput
                    value={criteria.score || 0}
                    onChange={() => {}} // Read-only
                    disabled={true}
                  />
                </div>
                
                {/* Comments */}
                {criteria.comments.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comments
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {criteria.comments.map((comment, index) => (
                        <p key={index} className="text-sm text-gray-700 mb-2 last:mb-0">
                          {comment}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'charts' && (
        <div className="space-y-6">
          {/* Performance Chart */}
          <PerformanceChart 
            evaluation={evaluation}
            categoryAverages={categoryAverages}
          />
          
          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Score Distribution
              </h3>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map(score => {
                  const count = evaluation.criteriaWithScores.filter(
                    c => c.score === score
                  ).length;
                  const percentage = evaluation.criteriaWithScores.length > 0 
                    ? (count / evaluation.criteriaWithScores.length) * 100 
                    : 0;
                  
                  return (
                    <div key={score} className="flex items-center space-x-3">
                      <span className="w-8 text-sm font-medium">{score}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-12 text-sm text-gray-600">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Category Performance
              </h3>
              <div className="space-y-3">
                {categoryAverages.map(category => (
                  <div key={category.category} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {category.category}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {category.average.toFixed(1)}/5
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(category.average / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

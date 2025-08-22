import React from 'react';
import { Card } from '@/components/ui/layout';
import { Badge } from '@/components/ui/feedback';

interface CategoryAverage {
  category: string;
  average: number;
  weight: number;
  count: number;
}

interface ScoreBreakdownProps {
  categoryAverages: CategoryAverage[];
  totalScore: number;
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ 
  categoryAverages, 
  totalScore 
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-blue-600';
    if (score >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 4.5) return 'Excellent';
    if (score >= 3.5) return 'Good';
    if (score >= 2.5) return 'Average';
    if (score >= 1.5) return 'Below Average';
    return 'Poor';
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Score Breakdown by Category</h3>
      
      {/* Overall Score */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-medium text-gray-900">Overall Score</h4>
            <p className="text-sm text-gray-600">Weighted average across all categories</p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getScoreColor(totalScore)}`}>
              {totalScore > 0 ? totalScore.toFixed(1) : 'N/A'}
            </div>
            {totalScore > 0 && (
              <div className="text-sm text-gray-600">
                {getScoreLabel(totalScore)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-4">
        {categoryAverages.length > 0 ? (
          categoryAverages.map((category) => (
            <div key={category.category} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{category.category}</h5>
                  <p className="text-sm text-gray-600">
                    {category.count} criteria • {category.weight}% weight
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-lg font-semibold ${getScoreColor(category.average)}`}>
                    {category.average.toFixed(1)}
                  </span>
                  <span className="text-gray-500">/5</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Performance</span>
                  <span className="font-medium">
                    {getScoreLabel(category.average)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      category.average >= 4.5 
                        ? 'bg-green-500' 
                        : category.average >= 3.5 
                        ? 'bg-blue-500' 
                        : category.average >= 2.5 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${(category.average / 5) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Score Badge */}
              <div className="mt-3 flex justify-end">
                <Badge 
                  variant={
                    category.average >= 4.5 ? 'success' :
                    category.average >= 3.5 ? 'info' :
                    category.average >= 2.5 ? 'warning' : 'error'
                  }
                  size="sm"
                >
                  {category.average.toFixed(1)}/5.0
                </Badge>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No scores available</p>
          </div>
        )}
      </div>

      {/* Performance Summary */}
      {categoryAverages.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h5 className="font-medium text-gray-900 mb-3">Performance Summary</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {categoryAverages.filter(c => c.average >= 4.5).length}
              </div>
              <div className="text-gray-600">Excellent</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {categoryAverages.filter(c => c.average >= 3.5 && c.average < 4.5).length}
              </div>
              <div className="text-gray-600">Good</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-yellow-600">
                {categoryAverages.filter(c => c.average >= 2.5 && c.average < 3.5).length}
              </div>
              <div className="text-gray-600">Average</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600">
                {categoryAverages.filter(c => c.average < 2.5).length}
              </div>
              <div className="text-gray-600">Below Average</div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

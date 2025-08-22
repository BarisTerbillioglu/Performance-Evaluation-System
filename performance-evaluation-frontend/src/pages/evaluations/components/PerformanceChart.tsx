import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { Card } from '@/components/ui/layout';
import { EvaluationFormDto } from '@/types';

interface CategoryAverage {
  category: string;
  average: number;
  weight: number;
  count: number;
}

interface PerformanceChartProps {
  evaluation: EvaluationFormDto;
  categoryAverages: CategoryAverage[];
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ 
  evaluation, 
  categoryAverages 
}) => {
  // Prepare data for radar chart
  const radarData = categoryAverages.map(category => ({
    category: category.category.substring(0, 12) + (category.category.length > 12 ? '...' : ''),
    score: category.average,
    fullMark: 5
  }));

  // Prepare data for bar chart
  const barData = categoryAverages.map(category => ({
    name: category.category.substring(0, 10) + (category.category.length > 10 ? '...' : ''),
    score: category.average,
    weight: category.weight,
    target: 4.0 // Example target score
  }));

  // Prepare individual criteria data
  const criteriaData = evaluation.criteriaWithScores
    .filter(c => c.score && c.score > 0)
    .map(criteria => ({
      name: criteria.name.substring(0, 15) + (criteria.name.length > 15 ? '...' : ''),
      score: criteria.score,
      category: criteria.categoryName
    }));

  // Mock historical data for trend analysis
  const trendData = [
    { period: 'Q1 2023', score: 3.2 },
    { period: 'Q2 2023', score: 3.5 },
    { period: 'Q3 2023', score: 3.8 },
    { period: 'Q4 2023', score: 4.1 },
    { period: 'Current', score: evaluation.totalScore }
  ].filter(d => d.score > 0);

  return (
    <div className="space-y-6">
      {/* Category Performance Radar */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Category Performance Overview
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis domain={[0, 5]} />
              <Radar 
                name="Score" 
                dataKey="score" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Category Comparison Bar Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Category Performance vs Target
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Bar dataKey="score" fill="#3B82F6" name="Actual Score" />
              <Bar dataKey="target" fill="#E5E7EB" name="Target Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Individual Criteria Scores */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Individual Criteria Performance
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={criteriaData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 5]} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="score" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Performance Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Performance Trend
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#8B5CF6" 
                  fill="#8B5CF6" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Performance Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Strengths */}
          <div>
            <h4 className="font-medium text-green-800 mb-2">Strengths</h4>
            <div className="space-y-2">
              {categoryAverages
                .filter(c => c.average >= 4.0)
                .slice(0, 3)
                .map(category => (
                  <div key={category.category} className="text-sm">
                    <span className="font-medium">{category.category}</span>
                    <span className="text-gray-600 ml-2">({category.average.toFixed(1)})</span>
                  </div>
                ))}
              {categoryAverages.filter(c => c.average >= 4.0).length === 0 && (
                <p className="text-sm text-gray-500">No categories above 4.0</p>
              )}
            </div>
          </div>

          {/* Areas for Improvement */}
          <div>
            <h4 className="font-medium text-yellow-800 mb-2">Areas for Improvement</h4>
            <div className="space-y-2">
              {categoryAverages
                .filter(c => c.average < 3.5)
                .slice(0, 3)
                .map(category => (
                  <div key={category.category} className="text-sm">
                    <span className="font-medium">{category.category}</span>
                    <span className="text-gray-600 ml-2">({category.average.toFixed(1)})</span>
                  </div>
                ))}
              {categoryAverages.filter(c => c.average < 3.5).length === 0 && (
                <p className="text-sm text-gray-500">All categories performing well</p>
              )}
            </div>
          </div>

          {/* Key Metrics */}
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Key Metrics</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Highest Score:</span>
                <span className="ml-2">
                  {Math.max(...categoryAverages.map(c => c.average)).toFixed(1)}
                </span>
              </div>
              <div>
                <span className="font-medium">Lowest Score:</span>
                <span className="ml-2">
                  {Math.min(...categoryAverages.map(c => c.average)).toFixed(1)}
                </span>
              </div>
              <div>
                <span className="font-medium">Score Range:</span>
                <span className="ml-2">
                  {(Math.max(...categoryAverages.map(c => c.average)) - 
                    Math.min(...categoryAverages.map(c => c.average))).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

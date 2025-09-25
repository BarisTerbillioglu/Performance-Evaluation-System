import React from 'react';
import { TopPerformer } from '@/types/analytics';
import { TrophyIcon, MedalIcon, StarIcon } from '@heroicons/react/24/solid';

interface TopPerformersLeaderboardProps {
  data: TopPerformer[];
  title: string;
  maxItems?: number;
}

export const TopPerformersLeaderboard: React.FC<TopPerformersLeaderboardProps> = ({
  data,
  title,
  maxItems = 10
}) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <TrophyIcon className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <MedalIcon className="w-6 h-6 text-gray-400" />;
      case 3:
        return <MedalIcon className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 text-gray-400 font-bold">{rank}</span>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const displayedData = data.slice(0, maxItems);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          <StarIcon className="w-5 h-5 text-yellow-500" />
          <span className="text-sm text-gray-600">Top {maxItems}</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {displayedData.map((performer, index) => (
          <div
            key={performer.userId}
            className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-8 h-8">
                {getRankIcon(performer.rank)}
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  {performer.avatar ? (
                    <img
                      src={performer.avatar}
                      alt={performer.employeeName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-600">
                      {performer.employeeName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                
                <div>
                  <div className="font-medium text-gray-900">
                    {performer.employeeName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {performer.departmentName}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`text-lg font-bold ${getScoreColor(performer.averageScore)}`}>
                {performer.averageScore.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">
                {performer.totalEvaluations} evaluations
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <StarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No performance data available</p>
        </div>
      )}
    </div>
  );
};

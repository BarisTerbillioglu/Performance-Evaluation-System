import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  TrophyIcon,
  StarIcon,
  UserIcon
} from '@heroicons/react/24/solid';

interface TopPerformer {
  id: number;
  name: string;
  email: string;
  department: string;
  score: number;
  rank: number;
  avatar?: string;
  improvement?: number;
}

interface TopPerformersLeaderboardProps {
  data: TopPerformer[];
  title?: string;
  maxItems?: number;
}

export const TopPerformersLeaderboard: React.FC<TopPerformersLeaderboardProps> = ({
  data,
  title = 'Top Performers',
  maxItems = 10
}) => {
  const topPerformers = data.slice(0, maxItems);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <TrophyIcon className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <TrophyIcon className="h-5 w-5 text-gray-400" />;
      case 3:
        return <TrophyIcon className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-medium text-gray-500">#{rank}</span>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 80) return 'secondary';
    if (score >= 70) return 'outline';
    return 'destructive';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <StarIcon className="h-5 w-5 text-yellow-500" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topPerformers.map((performer) => (
            <div key={performer.id} className="flex items-center space-x-4">
              {/* Rank */}
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                {getRankIcon(performer.rank)}
              </div>

              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={performer.avatar} alt={performer.name} />
                  <AvatarFallback>
                    <UserIcon className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {performer.name}
                  </p>
                  {performer.improvement && performer.improvement > 0 && (
                    <Badge variant="outline" className="text-xs">
                      +{performer.improvement}%
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {performer.department}
                </p>
              </div>

              {/* Score */}
              <div className="flex-shrink-0 text-right">
                <Badge variant={getScoreBadgeVariant(performer.score)}>
                  <span className={`font-semibold ${getScoreColor(performer.score)}`}>
                    {performer.score.toFixed(1)}
                  </span>
                </Badge>
              </div>
            </div>
          ))}

          {topPerformers.length === 0 && (
            <div className="text-center py-8">
              <StarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No performance data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

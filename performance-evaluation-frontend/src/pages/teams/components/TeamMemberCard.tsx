import React from 'react';
import { 
  Edit, 
  Eye, 
  MessageCircle, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { TeamMemberDto } from '@/types';
import { Card, CardContent } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { Button } from '@/components/design-system/Button';
import { Avatar } from '@/components/ui/feedback/Avatar';
import { PerformanceTrendChart } from './PerformanceTrendChart';
import { cn } from '@/utils/cn';

export interface TeamMemberCardProps {
  member: TeamMemberDto;
  onEvaluate: () => void;
  onViewHistory: () => void;
  onMessage: () => void;
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  onEvaluate,
  onViewHistory,
  onMessage,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <BarChart3 className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'pending': return 'warning';
      case 'overdue': return 'danger';
      default: return 'secondary';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score?: number) => {
    if (!score) return 'bg-gray-100';
    if (score >= 85) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border border-gray-200">
      <CardContent className="p-6">
        {/* Header with Avatar and Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar
                src={member.avatar}
                alt={`${member.firstName} ${member.lastName}`}
                size="lg"
              />
              {member.isEvaluator && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">E</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {member.firstName} {member.lastName}
              </h3>
              <p className="text-xs text-gray-500 truncate">{member.role}</p>
              <p className="text-xs text-gray-400 truncate">{member.department}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {getStatusIcon(member.currentEvaluationStatus)}
            <Badge variant={getStatusColor(member.currentEvaluationStatus)} size="sm">
              {member.currentEvaluationStatus.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {/* Performance Score */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Latest Score</span>
            {getTrendIcon(member.performanceTrend)}
          </div>
          <div className="flex items-center space-x-3">
            <div className={cn(
              "flex-1 h-2 rounded-full",
              getScoreBackground(member.latestScore)
            )}>
              <div 
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  member.latestScore ? "bg-primary-500" : "bg-gray-300"
                )}
                style={{ 
                  width: member.latestScore ? `${member.latestScore}%` : '0%' 
                }}
              />
            </div>
            <span className={cn(
              "text-sm font-bold min-w-[3rem] text-right",
              getScoreColor(member.latestScore)
            )}>
              {member.latestScore ? `${member.latestScore.toFixed(1)}` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Performance History Mini Chart */}
        {member.performanceHistory && member.performanceHistory.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">Performance Trend</span>
              <span className="text-xs text-gray-400">
                {member.evaluationCount} evaluations
              </span>
            </div>
            <div className="h-12">
              <PerformanceTrendChart data={member.performanceHistory} />
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Evaluations</p>
            <p className="text-sm font-semibold text-gray-900">{member.evaluationCount}</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Avg Score</p>
            <p className="text-sm font-semibold text-gray-900">
              {member.averageScore ? member.averageScore.toFixed(1) : 'N/A'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onEvaluate}
            className="flex-1"
          >
            <Edit className="h-3 w-3 mr-1" />
            Evaluate
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onViewHistory}
          >
            <Eye className="h-3 w-3" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onMessage}
          >
            <MessageCircle className="h-3 w-3" />
          </Button>
        </div>

        {/* Last Evaluation Date */}
        {member.lastEvaluationDate && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Last evaluated: {new Date(member.lastEvaluationDate).toLocaleDateString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

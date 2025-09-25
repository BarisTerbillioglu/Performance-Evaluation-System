import React from 'react';
import { RealTimeMetrics } from '@/types/analytics';
import {
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface RealTimeMetricsCardsProps {
  metrics: RealTimeMetrics;
}

export const RealTimeMetricsCards: React.FC<RealTimeMetricsCardsProps> = ({ metrics }) => {

  const metricsData = [
    {
      title: 'Completed Today',
      value: metrics.completedToday,
      icon: <CheckCircleIcon className="w-6 h-6 text-green-600" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'In Progress',
      value: metrics.activeEvaluations,
      icon: <ClockIcon className="w-6 h-6 text-blue-600" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Avg. Completion Time',
      value: `${metrics.averageCompletionTime.toFixed(1)} days`,
      icon: <ChartBarIcon className="w-6 h-6 text-purple-600" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Active Users',
      value: metrics.activeUsers,
      icon: <ChartBarIcon className="w-6 h-6 text-purple-600" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricsData.map((metric, index) => (
        <div
          key={index}
          className={`p-6 rounded-lg border ${metric.borderColor} ${metric.bgColor} transition-all hover:shadow-md`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{metric.title}</p>
              <p className={`text-2xl font-bold ${metric.color} mt-1`}>
                {metric.value}
              </p>
            </div>
            <div className="p-2 rounded-full bg-white">
              {metric.icon}
            </div>
          </div>
          
          {index === 0 && (
            <div className="mt-3 text-xs text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

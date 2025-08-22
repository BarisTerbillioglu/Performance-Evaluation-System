import React from 'react';
import { RealTimeMetrics } from '@/types/analytics';
import {
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface RealTimeMetricsCardsProps {
  data: RealTimeMetrics;
}

export const RealTimeMetricsCards: React.FC<RealTimeMetricsCardsProps> = ({ data }) => {
  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'excellent':
        return 'text-green-600 bg-green-100';
      case 'good':
        return 'text-blue-600 bg-blue-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSystemHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent':
        return <CheckCircleIcon className="w-6 h-6 text-green-600" />;
      case 'good':
        return <CheckCircleIcon className="w-6 h-6 text-blue-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />;
      case 'critical':
        return <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />;
      default:
        return <ChartBarIcon className="w-6 h-6 text-gray-600" />;
    }
  };

  const metrics = [
    {
      title: 'Completed Today',
      value: data.evaluationsCompletedToday,
      icon: <CheckCircleIcon className="w-6 h-6 text-green-600" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'In Progress',
      value: data.evaluationsInProgress,
      icon: <ClockIcon className="w-6 h-6 text-blue-600" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Avg. Completion Time',
      value: `${data.averageCompletionTime.toFixed(1)} days`,
      icon: <ChartBarIcon className="w-6 h-6 text-purple-600" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'System Health',
      value: data.systemHealth.charAt(0).toUpperCase() + data.systemHealth.slice(1),
      icon: getSystemHealthIcon(data.systemHealth),
      color: getSystemHealthColor(data.systemHealth).split(' ')[0],
      bgColor: getSystemHealthColor(data.systemHealth).split(' ')[1],
      borderColor: getSystemHealthColor(data.systemHealth).split(' ')[1].replace('bg-', 'border-')
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
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

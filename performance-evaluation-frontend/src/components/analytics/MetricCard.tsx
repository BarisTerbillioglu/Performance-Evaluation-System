import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/solid';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
  color = 'primary',
  subtitle,
  trend
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return {
          bg: 'bg-primary-50',
          border: 'border-primary-200',
          icon: 'text-primary-500',
          text: 'text-primary-700'
        };
      case 'success':
        return {
          bg: 'bg-success-50',
          border: 'border-success-200',
          icon: 'text-success-500',
          text: 'text-success-700'
        };
      case 'warning':
        return {
          bg: 'bg-warning-50',
          border: 'border-warning-200',
          icon: 'text-warning-500',
          text: 'text-warning-700'
        };
      case 'error':
        return {
          bg: 'bg-error-50',
          border: 'border-error-200',
          icon: 'text-error-500',
          text: 'text-error-700'
        };
      case 'info':
        return {
          bg: 'bg-info-50',
          border: 'border-info-200',
          icon: 'text-info-500',
          text: 'text-info-700'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-500',
          text: 'text-gray-700'
        };
    }
  };

  const getChangeIcon = () => {
    if (!change) return null;
    
    if (changeType === 'increase') {
      return <ArrowUpIcon className="w-4 h-4 text-success-500" />;
    } else if (changeType === 'decrease') {
      return <ArrowDownIcon className="w-4 h-4 text-error-500" />;
    } else {
      return <MinusIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getChangeColor = () => {
    if (changeType === 'increase') return 'text-success-600';
    if (changeType === 'decrease') return 'text-error-600';
    return 'text-gray-600';
  };

  const colorClasses = getColorClasses();

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${colorClasses.border} p-6 hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            {icon && (
              <div className={`p-2 rounded-lg ${colorClasses.bg} mr-3`}>
                <div className={colorClasses.icon}>
                  {icon}
                </div>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-baseline">
            <p className="text-3xl font-bold text-gray-900">
              {typeof value === 'number' && value >= 1000 
                ? (value / 1000).toFixed(1) + 'K'
                : value}
            </p>
            
            {change !== undefined && (
              <div className={`flex items-center ml-3 ${getChangeColor()}`}>
                {getChangeIcon()}
                <span className="text-sm font-medium ml-1">
                  {Math.abs(change).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
        
        {trend && (
          <div className="flex flex-col items-end">
            <div className={`w-2 h-2 rounded-full mb-1 ${
              trend === 'up' ? 'bg-success-500' : 
              trend === 'down' ? 'bg-error-500' : 'bg-gray-400'
            }`} />
            <span className="text-xs text-gray-500 capitalize">{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
};

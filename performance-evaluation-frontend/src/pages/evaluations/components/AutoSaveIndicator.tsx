import React from 'react';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date | null;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({ 
  status, 
  lastSaved 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: ArrowPathIcon,
          text: 'Saving...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          animate: true
        };
      case 'saved':
        return {
          icon: CheckCircleIcon,
          text: 'Saved',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          animate: false
        };
      case 'error':
        return {
          icon: ExclamationTriangleIcon,
          text: 'Save failed',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          animate: false
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();

  if (!config && !lastSaved) {
    return null;
  }

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor(diff / 1000);

    if (minutes > 0) {
      return `${minutes}m ago`;
    } else if (seconds > 30) {
      return `${seconds}s ago`;
    } else {
      return 'just now';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {config && (
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${config.bgColor}`}>
          <config.icon 
            className={`w-4 h-4 ${config.color} ${config.animate ? 'animate-spin' : ''}`} 
          />
          <span className={`text-sm font-medium ${config.color}`}>
            {config.text}
          </span>
        </div>
      )}
      
      {lastSaved && status === 'idle' && (
        <div className="flex items-center space-x-1 text-gray-500">
          <ClockIcon className="w-4 h-4" />
          <span className="text-sm">
            Saved {formatLastSaved(lastSaved)}
          </span>
        </div>
      )}
    </div>
  );
};

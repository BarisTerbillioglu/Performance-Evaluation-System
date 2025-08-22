import React from 'react';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface ProgressIndicatorProps {
  progress: number;
  totalCriteria: number;
  completedCriteria?: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  progress, 
  totalCriteria,
  completedCriteria 
}) => {
  const completed = completedCriteria || Math.floor((progress / 100) * totalCriteria);
  const remaining = totalCriteria - completed;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Evaluation Progress</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1 text-green-600">
            <CheckCircleIcon className="w-4 h-4" />
            <span>{completed} completed</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-500">
            <ClockIcon className="w-4 h-4" />
            <span>{remaining} remaining</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-900">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${
              progress === 100 
                ? 'bg-green-500' 
                : progress >= 75 
                ? 'bg-blue-500' 
                : progress >= 50 
                ? 'bg-yellow-500' 
                : 'bg-red-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Status Message */}
      <div className="mt-4">
        {progress === 100 ? (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircleIcon className="w-5 h-5" />
            <span className="text-sm font-medium">
              All criteria completed! Ready to submit.
            </span>
          </div>
        ) : progress >= 75 ? (
          <div className="flex items-center space-x-2 text-blue-600">
            <ClockIcon className="w-5 h-5" />
            <span className="text-sm">
              Almost there! {remaining} more criteria to complete.
            </span>
          </div>
        ) : progress >= 50 ? (
          <div className="flex items-center space-x-2 text-yellow-600">
            <ClockIcon className="w-5 h-5" />
            <span className="text-sm">
              Halfway done. Keep going!
            </span>
          </div>
        ) : progress > 0 ? (
          <div className="flex items-center space-x-2 text-gray-600">
            <ClockIcon className="w-5 h-5" />
            <span className="text-sm">
              Good start! {remaining} more criteria to go.
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-gray-500">
            <ClockIcon className="w-5 h-5" />
            <span className="text-sm">
              Ready to begin evaluation.
            </span>
          </div>
        )}
      </div>

      {/* Criteria Breakdown */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Criteria:</span>
            <span className="ml-2 font-medium text-gray-900">{totalCriteria}</span>
          </div>
          <div>
            <span className="text-gray-600">Completion Rate:</span>
            <span className="ml-2 font-medium text-gray-900">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

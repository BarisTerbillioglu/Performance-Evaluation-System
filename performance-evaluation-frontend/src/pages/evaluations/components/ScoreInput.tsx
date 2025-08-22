import React from 'react';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface ScoreInputProps {
  value: number;
  onChange: (score: number) => void;
  disabled?: boolean;
  showLabels?: boolean;
}

const scoreLabels = {
  1: 'Poor',
  2: 'Below Average',
  3: 'Average',
  4: 'Good',
  5: 'Excellent'
};

export const ScoreInput: React.FC<ScoreInputProps> = ({ 
  value, 
  onChange, 
  disabled = false,
  showLabels = true 
}) => {
  return (
    <div className="space-y-3">
      {/* Star Rating */}
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((score) => {
          const Icon = score <= value ? StarSolidIcon : StarIcon;
          return (
            <button
              key={score}
              type="button"
              onClick={() => !disabled && onChange(score)}
              disabled={disabled}
              className={`p-1 rounded-md transition-colors ${
                disabled 
                  ? 'cursor-not-allowed opacity-50' 
                  : 'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500'
              }`}
              title={`Score: ${score} - ${scoreLabels[score as keyof typeof scoreLabels]}`}
            >
              <Icon 
                className={`w-8 h-8 ${
                  score <= value 
                    ? 'text-yellow-400' 
                    : 'text-gray-300'
                }`} 
              />
            </button>
          );
        })}
        <span className="ml-3 text-sm font-medium text-gray-700">
          {value > 0 ? `${value}/5` : 'Not scored'}
        </span>
      </div>

      {/* Score Labels */}
      {showLabels && (
        <div className="grid grid-cols-5 gap-2 text-xs text-gray-600">
          {Object.entries(scoreLabels).map(([score, label]) => (
            <div
              key={score}
              className={`text-center py-1 px-2 rounded ${
                parseInt(score) === value 
                  ? 'bg-primary-100 text-primary-800 font-medium' 
                  : 'hover:bg-gray-50'
              }`}
            >
              {label}
            </div>
          ))}
        </div>
      )}

      {/* Current Selection */}
      {value > 0 && (
        <div className="flex items-center space-x-2 text-sm">
          <span className="font-medium text-gray-900">Selected:</span>
          <span className="text-primary-600">
            {scoreLabels[value as keyof typeof scoreLabels]}
          </span>
        </div>
      )}
    </div>
  );
};

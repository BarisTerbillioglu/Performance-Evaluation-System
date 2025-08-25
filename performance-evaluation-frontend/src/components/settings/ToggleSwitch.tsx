import React from 'react';
import { cn } from '../../utils/cn';

export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  className,
  id,
}) => {
  const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;

  const sizeClasses = {
    sm: {
      switch: 'w-9 h-5',
      thumb: 'w-4 h-4',
      thumbTranslate: 'translate-x-4',
    },
    md: {
      switch: 'w-11 h-6',
      thumb: 'w-5 h-5',
      thumbTranslate: 'translate-x-5',
    },
    lg: {
      switch: 'w-14 h-7',
      thumb: 'w-6 h-6',
      thumbTranslate: 'translate-x-7',
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={cn('flex items-start space-x-3', className)}>
      <button
        type="button"
        id={toggleId}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          currentSize.switch,
          disabled
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-pointer',
          checked
            ? 'bg-primary-500'
            : 'bg-gray-200 hover:bg-gray-300'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            currentSize.thumb,
            checked ? currentSize.thumbTranslate : 'translate-x-0'
          )}
        />
      </button>
      
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label
              htmlFor={toggleId}
              className={cn(
                'text-sm font-medium cursor-pointer',
                disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-900'
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p className={cn(
              'text-sm mt-1',
              disabled ? 'text-gray-400' : 'text-gray-500'
            )}>
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ToggleSwitch;

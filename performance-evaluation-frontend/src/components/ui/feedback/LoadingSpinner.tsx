import React from 'react';
import { cn } from '@/utils/cn';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  className?: string;
  text?: string;
  showText?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
  text = 'Loading...',
  showText = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    gray: 'text-gray-400',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-current border-t-transparent',
          sizeClasses[size],
          colorClasses[color]
        )}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">{text}</span>
      </div>
      {showText && (
        <p className={cn('mt-2 text-sm', colorClasses[color])}>{text}</p>
      )}
    </div>
  );
};

// Full screen loading spinner
export const FullScreenSpinner: React.FC<Omit<LoadingSpinnerProps, 'showText'> & { text?: string }> = ({
  text = 'Loading...',
  ...props
}) => (
  <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
    <LoadingSpinner {...props} text={text} showText={true} />
  </div>
);

// Inline loading spinner
export const InlineSpinner: React.FC<LoadingSpinnerProps> = (props) => (
  <div className="inline-flex items-center">
    <LoadingSpinner {...props} />
  </div>
);

// Button loading spinner
export const ButtonSpinner: React.FC<{ className?: string }> = ({ className }) => (
  <LoadingSpinner
    size="sm"
    color="white"
    className={cn('mr-2', className)}
  />
);

// Page loading spinner
export const PageSpinner: React.FC<{ text?: string }> = ({ text = 'Loading page...' }) => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" text={text} showText={true} />
  </div>
);

// Table loading spinner
export const TableSpinner: React.FC<{ text?: string }> = ({ text = 'Loading data...' }) => (
  <div className="flex items-center justify-center py-8">
    <LoadingSpinner size="md" text={text} showText={true} />
  </div>
);

// Card loading spinner
export const CardSpinner: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <div className="flex items-center justify-center p-6">
    <LoadingSpinner size="md" text={text} showText={true} />
  </div>
);

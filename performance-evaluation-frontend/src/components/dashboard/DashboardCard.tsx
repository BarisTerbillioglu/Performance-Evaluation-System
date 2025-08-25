import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const cardVariants = cva(
  'bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md',
  {
    variants: {
      variant: {
        default: 'bg-white',
        accent: 'bg-primary-50 border-primary-200',
        highlight: 'bg-primary-500 text-white border-primary-500',
        success: 'bg-success-50 border-success-200',
        warning: 'bg-warning-50 border-warning-200',
        error: 'bg-error-50 border-error-200',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface DashboardCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
    label?: string;
  };
  action?: React.ReactNode;
  loading?: boolean;
}

export const DashboardCard = React.forwardRef<HTMLDivElement, DashboardCardProps>(
  ({ className, variant, size, title, subtitle, icon, trend, action, loading, children, ...props }, ref) => {
    if (loading) {
      return (
        <div
          ref={ref}
          className={cn(cardVariants({ variant, size, className }))}
          {...props}
        >
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-6 w-6 bg-gray-200 rounded"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, size, className }))}
        {...props}
      >
        {/* Header */}
        {(title || icon || action) && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {icon && (
                <div className={cn(
                  'p-2 rounded-lg',
                  variant === 'highlight' ? 'bg-white bg-opacity-20' : 'bg-primary-100'
                )}>
                  {icon}
                </div>
              )}
              <div>
                {title && (
                  <h3 className={cn(
                    'text-sm font-medium',
                    variant === 'highlight' ? 'text-white' : 'text-gray-900'
                  )}>
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className={cn(
                    'text-xs',
                    variant === 'highlight' ? 'text-white text-opacity-80' : 'text-gray-500'
                  )}>
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {action && (
              <div className="flex-shrink-0">
                {action}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="space-y-2">
          {children}
        </div>

        {/* Trend indicator */}
        {trend && (
          <div className="mt-4 flex items-center space-x-2">
            <div className={cn(
              'flex items-center space-x-1 text-xs font-medium',
              trend.direction === 'up' ? 'text-success-600' : 
              trend.direction === 'down' ? 'text-error-600' : 'text-gray-500'
            )}>
              {trend.direction === 'up' && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
              {trend.direction === 'down' && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              {trend.direction === 'stable' && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                </svg>
              )}
              <span>{trend.value}%</span>
            </div>
            {trend.label && (
              <span className="text-xs text-gray-500">{trend.label}</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

DashboardCard.displayName = 'DashboardCard';

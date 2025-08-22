import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-600 text-white hover:bg-primary-700',
        secondary: 'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200',
        success: 'border-transparent bg-green-100 text-green-800 hover:bg-green-200',
        error: 'border-transparent bg-red-100 text-red-800 hover:bg-red-200',
        warning: 'border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        info: 'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200',
        primary: 'border-transparent bg-primary-600 text-white hover:bg-primary-700',
        danger: 'border-transparent bg-red-100 text-red-800 hover:bg-red-200',
        outline: 'border border-gray-200 bg-transparent text-gray-900 hover:bg-gray-50',
        'outline-success': 'border border-green-200 bg-transparent text-green-800 hover:bg-green-50',
        'outline-error': 'border border-red-200 bg-transparent text-red-800 hover:bg-red-50',
        'outline-warning': 'border border-yellow-200 bg-transparent text-yellow-800 hover:bg-yellow-50',
        'outline-info': 'border border-blue-200 bg-transparent text-blue-800 hover:bg-blue-50',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
      rounded: {
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      rounded: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRemove?: () => void;
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      rounded,
      dot = false,
      leftIcon,
      rightIcon,
      onRemove,
      children,
      ...props
    },
    ref
  ) => {
    if (dot) {
      return (
        <span
          ref={ref}
          className={cn(
            'inline-flex h-2 w-2 rounded-full',
            variant === 'success' && 'bg-green-500',
            variant === 'error' && 'bg-red-500',
            variant === 'warning' && 'bg-yellow-500',
            variant === 'info' && 'bg-blue-500',
            variant === 'default' && 'bg-primary-600',
            variant === 'secondary' && 'bg-gray-500',
            className
          )}
          role="status"
          aria-label={typeof children === 'string' ? children : 'Status indicator'}
          {...props}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size, rounded }), className)}
        {...props}
      >
        {leftIcon && (
          <span className="mr-1 -ml-0.5">
            {leftIcon}
          </span>
        )}
        {children}
        {rightIcon && (
          <span className="ml-1 -mr-0.5">
            {rightIcon}
          </span>
        )}
        {onRemove && (
          <button
            type="button"
            className="ml-1 -mr-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-current"
            onClick={onRemove}
            aria-label="Remove badge"
          >
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

// Status Badge Component with predefined status colors
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'draft' | 'published';
}

const StatusBadge = forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status, ...props }, ref) => {
    const statusVariants = {
      active: 'success',
      inactive: 'secondary',
      pending: 'warning',
      completed: 'success',
      cancelled: 'error',
      draft: 'secondary',
      published: 'info',
    } as const;

    const statusLabels = {
      active: 'Active',
      inactive: 'Inactive',
      pending: 'Pending',
      completed: 'Completed',
      cancelled: 'Cancelled',
      draft: 'Draft',
      published: 'Published',
    };

    return (
      <Badge
        ref={ref}
        variant={statusVariants[status]}
        {...props}
      >
        {statusLabels[status]}
      </Badge>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

// Priority Badge Component
export interface PriorityBadgeProps extends Omit<BadgeProps, 'variant'> {
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

const PriorityBadge = forwardRef<HTMLDivElement, PriorityBadgeProps>(
  ({ priority, ...props }, ref) => {
    const priorityVariants = {
      low: 'info',
      medium: 'warning',
      high: 'error',
      urgent: 'error',
    } as const;

    const priorityLabels = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent',
    };

    return (
      <Badge
        ref={ref}
        variant={priorityVariants[priority]}
        {...props}
      >
        {priorityLabels[priority]}
      </Badge>
    );
  }
);

PriorityBadge.displayName = 'PriorityBadge';

// Notification Badge with count
export interface NotificationBadgeProps extends BadgeProps {
  count?: number;
  showZero?: boolean;
  max?: number;
}

const NotificationBadge = forwardRef<HTMLDivElement, NotificationBadgeProps>(
  ({ count = 0, showZero = false, max = 99, children, ...props }, ref) => {
    if (count === 0 && !showZero) {
      return <>{children}</>;
    }

    const displayCount = count > max ? `${max}+` : count.toString();

    return (
      <div className="relative inline-flex">
        {children}
        <Badge
          ref={ref}
          size="sm"
          rounded="full"
          className="absolute -top-1 -right-1 h-5 w-5 min-w-[1.25rem] p-0 text-xs"
          {...props}
        >
          {displayCount}
        </Badge>
      </div>
    );
  }
);

NotificationBadge.displayName = 'NotificationBadge';

export {
  Badge,
  StatusBadge,
  PriorityBadge,
  NotificationBadge,
  badgeVariants,
};

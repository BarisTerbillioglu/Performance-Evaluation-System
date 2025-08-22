import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const spinnerVariants = cva(
  'animate-spin rounded-full border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]',
  {
    variants: {
      size: {
        xs: 'h-3 w-3 border-2',
        sm: 'h-4 w-4 border-2',
        md: 'h-6 w-6 border-2',
        lg: 'h-8 w-8 border-[3px]',
        xl: 'h-12 w-12 border-4',
        '2xl': 'h-16 w-16 border-4',
      },
      variant: {
        primary: 'text-primary-600',
        secondary: 'text-gray-500',
        white: 'text-white',
        current: 'text-current',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'primary',
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, label = 'Loading...', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(spinnerVariants({ size, variant }), className)}
        role="status"
        aria-label={label}
        {...props}
      >
        <span className="sr-only">{label}</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

// Loading overlay component
export interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  spinnerSize?: VariantProps<typeof spinnerVariants>['size'];
  label?: string;
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ isLoading, children, className, spinnerSize = 'lg', label = 'Loading...', ...props }, ref) => {
    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        {children}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex flex-col items-center space-y-2">
              <Spinner size={spinnerSize} label={label} />
              <p className="text-sm text-gray-600">{label}</p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

LoadingOverlay.displayName = 'LoadingOverlay';

// Loading button wrapper
export interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ isLoading, children, loadingText, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn('relative', className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner size="sm" variant="current" />
          </div>
        )}
        <span className={cn(isLoading && 'opacity-0')}>
          {isLoading && loadingText ? loadingText : children}
        </span>
      </button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

export { Spinner, LoadingOverlay, LoadingButton, spinnerVariants };

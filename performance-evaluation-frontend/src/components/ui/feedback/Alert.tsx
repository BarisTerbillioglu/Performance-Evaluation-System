import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { XMarkIcon } from '@heroicons/react/20/solid';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/utils/cn';
import { Button } from '../button';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground border-border',
        success: 'border-green-200 bg-green-50 text-green-800 [&>svg]:text-green-600',
        error: 'border-red-200 bg-red-50 text-red-800 [&>svg]:text-red-600',
        warning: 'border-yellow-200 bg-yellow-50 text-yellow-800 [&>svg]:text-yellow-600',
        info: 'border-blue-200 bg-blue-50 text-blue-800 [&>svg]:text-blue-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const getIcon = (variant: 'success' | 'error' | 'warning' | 'info' | 'default') => {
  switch (variant) {
    case 'success':
      return CheckCircleIcon;
    case 'error':
      return XCircleIcon;
    case 'warning':
      return ExclamationTriangleIcon;
    case 'info':
      return InformationCircleIcon;
    default:
      return InformationCircleIcon;
  }
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  description?: string;
  onClose?: () => void;
  closable?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = 'default',
      title,
      description,
      onClose,
      closable = false,
      icon,
      actions,
      children,
      ...props
    },
    ref
  ) => {
    const IconComponent = icon || getIcon(variant);

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        <IconComponent className="h-5 w-5" aria-hidden="true" />
        
        <div className="flex-1">
          {title && (
            <h5 className="mb-1 font-medium leading-none tracking-tight">
              {title}
            </h5>
          )}
          
          {description && (
            <div className="text-sm opacity-90">
              {description}
            </div>
          )}
          
          {children && (
            <div className="mt-2">
              {children}
            </div>
          )}
          
          {actions && (
            <div className="mt-3 flex gap-2">
              {actions}
            </div>
          )}
        </div>
        
        {closable && onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6 rounded-md p-0 text-current hover:bg-current/10"
            onClick={onClose}
            aria-label="Close alert"
          >
            <XMarkIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

// Alert variants for specific use cases
const AlertTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

// Banner Alert (full width, no border radius)
export interface BannerAlertProps extends AlertProps {
  position?: 'top' | 'bottom';
}

const BannerAlert = forwardRef<HTMLDivElement, BannerAlertProps>(
  ({ className, position = 'top', ...props }, ref) => {
    return (
      <Alert
        ref={ref}
        className={cn(
          'rounded-none border-x-0',
          position === 'top' && 'border-t-0',
          position === 'bottom' && 'border-b-0',
          className
        )}
        {...props}
      />
    );
  }
);

BannerAlert.displayName = 'BannerAlert';

// Toast Alert (for notification system)
export interface ToastAlertProps extends AlertProps {
  duration?: number;
  onAutoClose?: () => void;
}

const ToastAlert = forwardRef<HTMLDivElement, ToastAlertProps>(
  ({ duration = 5000, onAutoClose, ...props }, ref) => {
    React.useEffect(() => {
      if (duration > 0 && onAutoClose) {
        const timer = setTimeout(() => {
          onAutoClose();
        }, duration);

        return () => clearTimeout(timer);
      }
    }, [duration, onAutoClose]);

    return (
      <Alert
        ref={ref}
        closable
        onClose={onAutoClose}
        className="shadow-lg border-0 bg-white"
        {...props}
      />
    );
  }
);

ToastAlert.displayName = 'ToastAlert';

export {
  Alert,
  AlertTitle,
  AlertDescription,
  BannerAlert,
  ToastAlert,
  alertVariants,
};

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../design-system/Card';
import { cn } from '../../utils/cn';

export interface SettingCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'accent' | 'highlight';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  showHeader?: boolean;
  showFooter?: boolean;
  footerContent?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string;
  required?: boolean;
  disabled?: boolean;
}

const SettingCard: React.FC<SettingCardProps> = ({
  title,
  description,
  children,
  className,
  variant = 'default',
  padding = 'md',
  showHeader = true,
  showFooter = false,
  footerContent,
  icon,
  badge,
  required = false,
  disabled = false,
}) => {
  return (
    <Card
      variant={variant}
      padding={padding}
      className={cn(
        'transition-all duration-200',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {showHeader && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {icon && (
                <div className="flex-shrink-0 text-primary-500">
                  {icon}
                </div>
              )}
              <div className="flex-1">
                <CardTitle className="flex items-center space-x-2">
                  <span>{title}</span>
                  {required && (
                    <span className="text-error-500 text-sm font-normal">*</span>
                  )}
                  {badge && (
                    <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800">
                      {badge}
                    </span>
                  )}
                </CardTitle>
                {description && (
                  <CardDescription className="mt-1">
                    {description}
                  </CardDescription>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className={cn(showHeader ? 'pt-0' : '')}>
        {children}
      </CardContent>
      
      {showFooter && footerContent && (
        <CardFooter className="pt-4">
          {footerContent}
        </CardFooter>
      )}
    </Card>
  );
};

export default SettingCard;

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const statsCardVariants = cva(
  'relative overflow-hidden transition-all duration-200 hover:shadow-md',
  {
    variants: {
      variant: {
        default: 'bg-white border border-gray-200',
        accent: 'bg-primary-50 border-primary-200',
        highlight: 'bg-primary-500 text-white border-primary-500',
        success: 'bg-green-50 border-green-200',
        warning: 'bg-orange-50 border-orange-200',
        danger: 'bg-red-50 border-red-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface TeamStatsCardProps extends VariantProps<typeof statsCardVariants> {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  className?: string;
}

export const TeamStatsCard: React.FC<TeamStatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendDirection = 'neutral',
  subtitle,
  variant,
  className,
}) => {
  const getTrendIcon = () => {
    if (trendDirection === 'up') {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
    if (trendDirection === 'down') {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getTrendColor = () => {
    if (trendDirection === 'up') return 'text-green-600';
    if (trendDirection === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  const isHighlightVariant = variant === 'highlight';

  return (
    <Card variant={variant} className={cn(statsCardVariants({ variant }), className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div className={cn(
                "flex-shrink-0 p-2 rounded-lg",
                isHighlightVariant ? "bg-white bg-opacity-20" : "bg-primary-100"
              )}>
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium",
                  isHighlightVariant ? "text-white" : "text-gray-500"
                )}>
                  {title}
                </p>
                <div className="flex items-baseline space-x-2">
                  <p className={cn(
                    "text-2xl font-bold",
                    isHighlightVariant ? "text-white" : "text-gray-900"
                  )}>
                    {value}
                  </p>
                  {trend && (
                    <div className="flex items-center space-x-1">
                      {getTrendIcon()}
                      <span className={cn(
                        "text-xs font-medium",
                        isHighlightVariant ? "text-white" : getTrendColor()
                      )}>
                        {trend}
                      </span>
                    </div>
                  )}
                </div>
                {subtitle && (
                  <p className={cn(
                    "text-xs mt-1",
                    isHighlightVariant ? "text-white text-opacity-80" : "text-gray-500"
                  )}>
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Decorative accent */}
          {variant === 'accent' && (
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary-200 rounded-full -translate-y-8 translate-x-8 opacity-20"></div>
          )}
          {variant === 'highlight' && (
            <div className="absolute top-0 right-0 w-16 h-16 bg-white rounded-full -translate-y-8 translate-x-8 opacity-10"></div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

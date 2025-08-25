import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface PerformanceTrendChartProps {
  data: any[];
  title?: string;
  className?: string;
}

const PerformanceTrendChart = forwardRef<HTMLDivElement, PerformanceTrendChartProps>(
  ({ data, title, className }, ref) => {
    if (!data || data.length === 0) {
      return (
        <div ref={ref} className={cn("flex items-center justify-center h-64 text-gray-500", className)}>
          <p>No data available</p>
        </div>
      );
    }

    return (
      <div ref={ref} className={cn("w-full", className)}>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        )}
        
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{item.date}</div>
                <div className="text-sm text-gray-500">{item.evaluations} evaluations</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">{item.score.toFixed(1)}</div>
                <div className="text-sm text-gray-500">Average Score</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

PerformanceTrendChart.displayName = "PerformanceTrendChart";

export { PerformanceTrendChart };

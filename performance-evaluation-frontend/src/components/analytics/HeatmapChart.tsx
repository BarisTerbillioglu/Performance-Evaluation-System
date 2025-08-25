import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface HeatmapChartProps {
  data: any[];
  title?: string;
  className?: string;
}

const HeatmapChart = forwardRef<HTMLDivElement, HeatmapChartProps>(
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
        
        <div className="grid grid-cols-7 gap-1">
          {data.map((item, index) => (
            <div
              key={index}
              className="aspect-square rounded-sm bg-gray-100 flex items-center justify-center text-xs"
              style={{
                backgroundColor: `rgba(59, 130, 246, ${item.intensity || 0.1})`
              }}
              title={`${item.label}: ${item.value}`}
            >
              {item.value}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

HeatmapChart.displayName = "HeatmapChart";

export { HeatmapChart };

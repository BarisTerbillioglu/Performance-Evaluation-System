import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface GaugeChartProps {
  value: number;
  maxValue: number;
  className?: string;
}

const GaugeChart = forwardRef<HTMLDivElement, GaugeChartProps>(
  ({ value, maxValue, className }, ref) => {
    const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);
    const angle = (percentage / 100) * 180;

    return (
      <div ref={ref} className={cn("relative w-full h-32", className)}>
        <div className="relative w-full h-full">
          {/* Background circle */}
          <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
          
          {/* Progress circle */}
          <div 
            className="absolute inset-0 rounded-full border-8 border-transparent border-t-blue-600 transition-all duration-500"
            style={{ 
              transform: `rotate(${angle - 90}deg)`,
              clipPath: percentage > 50 ? 'none' : 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
            }}
          ></div>
          
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{value.toFixed(1)}</div>
              <div className="text-sm text-gray-500">out of {maxValue}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

GaugeChart.displayName = "GaugeChart";

export { GaugeChart };

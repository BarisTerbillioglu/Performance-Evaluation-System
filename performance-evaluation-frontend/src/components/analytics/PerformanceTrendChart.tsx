import React, { forwardRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { TrendData } from '@/types/analytics';
import { exportChartAsImage } from '@/utils/chartExport';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface PerformanceTrendChartProps {
  data: TrendData[];
  title: string;
  height?: number;
  showArea?: boolean;
  multipleLines?: boolean;
}

export const PerformanceTrendChart = forwardRef<HTMLDivElement, PerformanceTrendChartProps>(({
  data,
  title,
  height = 300,
  showArea = false,
  multipleLines = false
}, ref) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const ChartComponent = showArea ? AreaChart : LineChart;
  const DataComponent = showArea ? Area : Line;

  const handleExport = async () => {
    if (ref && 'current' in ref && ref.current) {
      try {
        await exportChartAsImage(ref.current, {
          format: 'png',
          filename: `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}`
        });
      } catch (error) {
        console.error('Export failed:', error);
      }
    }
  };

  return (
    <div ref={ref} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button
          onClick={handleExport}
          className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {multipleLines ? (
            <>
              <DataComponent
                type="monotone"
                dataKey="averageScore"
                stroke="#3b82f6"
                strokeWidth={2}
                fill={showArea ? "#3b82f6" : undefined}
                fillOpacity={showArea ? 0.1 : undefined}
                name="Average Score"
              />
              <DataComponent
                type="monotone"
                dataKey="completionRate"
                stroke="#10b981"
                strokeWidth={2}
                fill={showArea ? "#10b981" : undefined}
                fillOpacity={showArea ? 0.1 : undefined}
                name="Completion Rate"
              />
              <DataComponent
                type="monotone"
                dataKey="totalEvaluations"
                stroke="#f59e0b"
                strokeWidth={2}
                fill={showArea ? "#f59e0b" : undefined}
                fillOpacity={showArea ? 0.1 : undefined}
                name="Total Evaluations"
              />
            </>
          ) : (
            <DataComponent
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              fill={showArea ? "#3b82f6" : undefined}
              fillOpacity={showArea ? 0.1 : undefined}
              name="Performance"
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
});

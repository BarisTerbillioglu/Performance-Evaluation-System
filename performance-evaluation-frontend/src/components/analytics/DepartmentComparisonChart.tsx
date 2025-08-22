import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { DepartmentComparison } from '@/types/analytics';

interface DepartmentComparisonChartProps {
  data: DepartmentComparison[];
  title: string;
  height?: number;
  metric?: 'averageScore' | 'completionRate' | 'totalEvaluations';
}

export const DepartmentComparisonChart: React.FC<DepartmentComparisonChartProps> = ({
  data,
  title,
  height = 400,
  metric = 'averageScore'
}) => {
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];

  const getMetricLabel = () => {
    switch (metric) {
      case 'averageScore':
        return 'Average Score';
      case 'completionRate':
        return 'Completion Rate (%)';
      case 'totalEvaluations':
        return 'Total Evaluations';
      default:
        return 'Average Score';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            Average Score: <span className="font-medium">{data.averageScore.toFixed(2)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Completion Rate: <span className="font-medium">{data.completionRate.toFixed(1)}%</span>
          </p>
          <p className="text-sm text-gray-600">
            Total Evaluations: <span className="font-medium">{data.totalEvaluations}</span>
          </p>
          <p className="text-sm text-gray-600">
            Employees: <span className="font-medium">{data.employeeCount}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-4">
          <select
            value={metric}
            onChange={(e) => e.target.value as any}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="averageScore">Average Score</option>
            <option value="completionRate">Completion Rate</option>
            <option value="totalEvaluations">Total Evaluations</option>
          </select>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="departmentName"
            stroke="#6b7280"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey={metric} name={getMetricLabel()} radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

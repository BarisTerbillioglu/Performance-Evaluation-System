import React, { useState, useEffect, useRef } from 'react';
import { analyticsService } from '@/services/analyticsService';
import { AnalyticsRequest, AdvancedAnalytics } from '@/types/analytics';
import { PerformanceTrendChart } from '@/components/analytics/PerformanceTrendChart';
import { DepartmentComparisonChart } from '@/components/analytics/DepartmentComparisonChart';
import { ScoreDistributionChart } from '@/components/analytics/ScoreDistributionChart';
import { EvaluationProgressChart } from '@/components/analytics/EvaluationProgressChart';
import { TopPerformersLeaderboard } from '@/components/analytics/TopPerformersLeaderboard';
import { RealTimeMetricsCards } from '@/components/analytics/RealTimeMetricsCards';
import { AnalyticsFilters } from '@/components/analytics/AnalyticsFilters';
import { exportDashboardAsPDF } from '@/utils/chartExport';
import { 
  ChartBarIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

export const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdvancedAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsRequest>({
    groupBy: 'month'
  });
  const [departments, setDepartments] = useState<Array<{ id: number; name: string }>>([]);
  const [teams, setTeams] = useState<Array<{ id: number; name: string }>>([]);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Chart refs for export functionality
  const trendChartRef = useRef<HTMLDivElement>(null);
  const departmentChartRef = useRef<HTMLDivElement>(null);
  const scoreChartRef = useRef<HTMLDivElement>(null);
  const progressChartRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Load analytics data
  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await analyticsService.getAdvancedAnalytics(filters);
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics data');
      console.error('Analytics loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load departments and teams for filters
  const loadFilterOptions = async () => {
    try {
      // This would typically come from your department and team services
      // For now, using mock data
      setDepartments([
        { id: 1, name: 'Engineering' },
        { id: 2, name: 'Marketing' },
        { id: 3, name: 'Sales' },
        { id: 4, name: 'HR' },
        { id: 5, name: 'Finance' }
      ]);
      
      setTeams([
        { id: 1, name: 'Frontend Team' },
        { id: 2, name: 'Backend Team' },
        { id: 3, name: 'QA Team' },
        { id: 4, name: 'DevOps Team' }
      ]);
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  };

  // Export functionality
  const handleExport = async () => {
    try {
      if (dashboardRef.current) {
        await exportDashboardAsPDF(dashboardRef.current, {
          format: 'pdf',
          filename: `analytics-dashboard-${new Date().toISOString().split('T')[0]}`,
          title: 'Performance Analytics Dashboard'
        });
      }
    } catch (err: any) {
      console.error('Export failed:', err);
      alert('Failed to export analytics data');
    }
  };

  // Set up real-time refresh
  useEffect(() => {
    loadAnalytics();
    loadFilterOptions();

    // Refresh data every 5 minutes
    refreshIntervalRef.current = setInterval(() => {
      loadAnalytics();
    }, 5 * 60 * 1000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [filters]);

  // Generate mock data for demonstration
  const generateMockData = (): AdvancedAnalytics => {
    const now = new Date();
    const mockTrendData = Array.from({ length: 12 }, (_, i) => ({
      label: new Date(now.getFullYear(), now.getMonth() - 11 + i, 1).toLocaleDateString('en-US', { month: 'short' }),
      date: new Date(now.getFullYear(), now.getMonth() - 11 + i, 1).toISOString(),
      value: Math.random() * 20 + 70,
      category: 'Performance'
    }));

    const mockDepartmentData = [
      { departmentId: 1, departmentName: 'Engineering', averageScore: 85.2, totalEvaluations: 45, completedEvaluations: 42, completionRate: 93.3, employeeCount: 25 },
      { departmentId: 2, departmentName: 'Marketing', averageScore: 78.9, totalEvaluations: 32, completedEvaluations: 28, completionRate: 87.5, employeeCount: 18 },
      { departmentId: 3, departmentName: 'Sales', averageScore: 82.1, totalEvaluations: 38, completedEvaluations: 35, completionRate: 92.1, employeeCount: 22 },
      { departmentId: 4, departmentName: 'HR', averageScore: 88.5, totalEvaluations: 28, completedEvaluations: 26, completionRate: 92.9, employeeCount: 12 },
      { departmentId: 5, departmentName: 'Finance', averageScore: 91.3, totalEvaluations: 25, completedEvaluations: 24, completionRate: 96.0, employeeCount: 15 }
    ];

    const mockTopPerformers = [
      { userId: 1, employeeName: 'John Smith', departmentName: 'Engineering', averageScore: 95.2, totalEvaluations: 8, rank: 1 },
      { userId: 2, employeeName: 'Sarah Johnson', departmentName: 'Marketing', averageScore: 93.8, totalEvaluations: 6, rank: 2 },
      { userId: 3, employeeName: 'Mike Davis', departmentName: 'Sales', averageScore: 92.1, totalEvaluations: 7, rank: 3 },
      { userId: 4, employeeName: 'Emily Wilson', departmentName: 'HR', averageScore: 90.5, totalEvaluations: 5, rank: 4 },
      { userId: 5, employeeName: 'David Brown', departmentName: 'Finance', averageScore: 89.7, totalEvaluations: 6, rank: 5 }
    ];

    const mockScoreDistribution = [
      { range: '90-100', count: 45, percentage: 25.0, color: '#10b981' },
      { range: '80-89', count: 78, percentage: 43.3, color: '#3b82f6' },
      { range: '70-79', count: 42, percentage: 23.3, color: '#f59e0b' },
      { range: '60-69', count: 12, percentage: 6.7, color: '#ef4444' },
      { range: '0-59', count: 3, percentage: 1.7, color: '#dc2626' }
    ];

    const mockEvaluationProgress = [
      { status: 'Completed', count: 156, percentage: 86.7, color: '#10b981' },
      { status: 'In Progress', count: 18, percentage: 10.0, color: '#3b82f6' },
      { status: 'Pending', count: 6, percentage: 3.3, color: '#f59e0b' }
    ];

    return {
      metrics: {
        totalEvaluations: 180,
        completedEvaluations: 156,
        completionRate: 86.7,
        averageScore: 82.3,
        totalUsers: 92,
        activeUsers: 87,
        totalDepartments: 5,
        totalTeams: 4
      },
      trendData: mockTrendData,
      departmentComparisons: mockDepartmentData,
      topPerformers: mockTopPerformers,
      scoreDistribution: mockScoreDistribution,
      evaluationProgress: mockEvaluationProgress,
      realTimeMetrics: {
        evaluationsCompletedToday: 12,
        evaluationsInProgress: 18,
        averageCompletionTime: 3.2,
        systemHealth: 'excellent' as const
      },
      generatedAt: new Date().toISOString(),
      period: 'Last 12 months'
    };
  };

  // Use mock data for demonstration
  const mockAnalytics = generateMockData();

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <ArrowPathIcon className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Failed to load analytics</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <button
            onClick={loadAnalytics}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const data = analytics || mockAnalytics;

  return (
    <div ref={dashboardRef} className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              Analytics Dashboard
            </h1>
            <p className="mt-2 max-w-4xl text-sm text-gray-500">
              Comprehensive performance analytics and insights
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadAnalytics}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <AnalyticsFilters
        filters={filters}
        onFiltersChange={setFilters}
        onExport={handleExport}
        departments={departments}
        teams={teams}
        loading={loading}
      />

      {/* Real-time Metrics */}
      <RealTimeMetricsCards data={data.realTimeMetrics} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trends */}
        <PerformanceTrendChart
          ref={trendChartRef}
          data={data.trendData}
          title="Performance Trends"
          height={350}
          showArea={true}
          multipleLines={true}
        />

        {/* Department Comparison */}
        <DepartmentComparisonChart
          data={data.departmentComparisons}
          title="Department Performance"
          height={350}
        />

        {/* Score Distribution */}
        <ScoreDistributionChart
          data={data.scoreDistribution}
          title="Score Distribution"
          height={300}
        />

        {/* Evaluation Progress */}
        <EvaluationProgressChart
          data={data.evaluationProgress}
          title="Evaluation Status"
          height={300}
        />
      </div>

      {/* Top Performers */}
      <TopPerformersLeaderboard
        data={data.topPerformers}
        title="Top Performers"
        maxItems={10}
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <ChartBarIcon className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Evaluations</p>
              <p className="text-2xl font-bold text-gray-900">{data.metrics.totalEvaluations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <ChartBarIcon className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{data.metrics.completionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <ChartBarIcon className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{data.metrics.averageScore.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <ChartBarIcon className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{data.metrics.activeUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {new Date(data.generatedAt).toLocaleString()}
      </div>
    </div>
  );
};

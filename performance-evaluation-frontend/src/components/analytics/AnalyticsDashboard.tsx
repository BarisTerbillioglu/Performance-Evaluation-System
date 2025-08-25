import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  UsersIcon, 
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { 
  UserGroupIcon,
  DocumentTextIcon,
  StarIcon,
  CalendarIcon
} from '@heroicons/react/24/solid';
import { AnalyticsFilters } from './AnalyticsFilters';
import { RealTimeMetricsCards } from './RealTimeMetricsCards';
import { PerformanceTrendChart } from './PerformanceTrendChart';
import { DepartmentComparisonChart } from './DepartmentComparisonChart';
import { TopPerformersLeaderboard } from './TopPerformersLeaderboard';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole } from '@/types/roles';
import { analyticsService } from '@/services';
import { 
  AnalyticsRequest, 
  AnalyticsResponse, 
  RealTimeMetrics
} from '@/types';

interface AnalyticsDashboardProps {
  role?: string;
  filters?: AnalyticsRequest;
  onFiltersChange?: (filters: AnalyticsRequest) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  role = 'all',
  filters: initialFilters,
  onFiltersChange
}) => {
  const { state } = useAuth();
  const { user } = state;
  const { hasRole } = usePermissions();
  
  const [filters, setFilters] = useState<AnalyticsRequest>(initialFilters || {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(),
    departmentIds: [],
    metricTypes: [],
    groupBy: 'month',
    includeComparisons: false
  });
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await analyticsService.getAnalytics(filters);
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch real-time metrics
  const fetchRealTimeMetrics = async () => {
    try {
      const metrics = await analyticsService.getRealTimeMetrics();
      setRealTimeMetrics(metrics);
    } catch (err) {
      console.error('Failed to fetch real-time metrics:', err);
    }
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: AnalyticsRequest) => {
    setFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAnalyticsData();
    fetchRealTimeMetrics();
  }, [filters]);

  // Set up real-time updates
  useEffect(() => {
    const interval = setInterval(fetchRealTimeMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <ExclamationTriangleIcon className="h-5 w-5" />
            <span>Error: {error}</span>
          </div>
          <Button 
            onClick={fetchAnalyticsData} 
            variant="outline" 
            className="mt-4"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData) {
    return null;
  }

  const {
    totalUsers,
    totalEvaluations,
    completedEvaluations,
    averageScore,
    performanceTrend,
    departmentPerformance,
    topPerformers,
    recentActivity
  } = analyticsData;

  const completionRate = totalEvaluations > 0 ? (completedEvaluations / totalEvaluations) * 100 : 0;
  const scoreTrend = performanceTrend?.length > 1 
    ? (performanceTrend[performanceTrend.length - 1] as any).score - (performanceTrend[0] as any).score 
    : 0;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <AnalyticsFilters 
        filters={filters} 
        onFiltersChange={handleFiltersChange} 
        onExport={() => {
          // TODO: Implement export functionality
          console.log('Export analytics data');
        }}
      />

      {/* Real-time Metrics */}
      {realTimeMetrics && (
        <RealTimeMetricsCards metrics={realTimeMetrics} />
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active users in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evaluations</CardTitle>
            <DocumentTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvaluations}</div>
            <p className="text-xs text-muted-foreground">
              {completedEvaluations} completed ({completionRate.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <StarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore.toFixed(1)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {scoreTrend > 0 ? (
                <span className="text-green-500 mr-1">↗</span>
              ) : (
                <span className="text-red-500 mr-1">↘</span>
              )}
              {Math.abs(scoreTrend).toFixed(1)} from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
            <UserGroupIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.departmentId ? '1' : analyticsData.totalTeams || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Teams with active evaluations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceTrendChart data={performanceTrend || []} />
          </CardContent>
        </Card>

        {/* Department Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <DepartmentComparisonChart data={departmentPerformance || []} />
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <TopPerformersLeaderboard data={topPerformers || []} title="Top Performers" />
          </CardContent>
        </Card>

        {/* Performance Gauge */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{averageScore.toFixed(1)}%</div>
              <p className="text-sm text-gray-500">Average Score</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      {hasRole(UserRole.ADMIN) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500">
                Radar chart component not implemented
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500">
                Heatmap chart component not implemented
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <CalendarIcon className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.description}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Badge variant={activity.type === 'success' ? 'default' : 'secondary'}>
                    {activity.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

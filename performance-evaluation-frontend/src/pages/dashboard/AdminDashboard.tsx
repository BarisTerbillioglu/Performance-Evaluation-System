import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  StatCard, 
  QuickActionButton, 
  RecentActivity 
} from '@/components/dashboard';
import { dashboardService } from '@/services';
import { AdminStatisticsDto } from '@/types';
import { useAuth } from '@/store';

export const AdminDashboard: React.FC = () => {
  const { state } = useAuth();
  const [dashboardData, setDashboardData] = useState<AdminStatisticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getAdminStatistics();
        setDashboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {state.user?.firstName}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your performance evaluation system today.
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-3">
            <QuickActionButton
              label="Add New User"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
              to="/users/create"
              variant="primary"
            />
            <QuickActionButton
              label="Create Evaluation"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              to="/evaluations/create"
              variant="secondary"
            />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={dashboardData?.totalUsers || 0}
          subtitle="Active employees"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          }
          trend={{ value: 12, direction: 'up', label: 'vs last month' }}
          loading={loading}
        />
        
        <StatCard
          title="Active Evaluations"
          value={dashboardData?.totalEvaluations || 0}
          subtitle="In progress"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          variant="accent"
          loading={loading}
        />
        
        <StatCard
          title="Completion Rate"
          value={`${dashboardData ? Math.round((dashboardData.completedEvaluations / dashboardData.totalEvaluations) * 100) : 0}%`}
          subtitle="Evaluations completed"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          variant="success"
          loading={loading}
        />
        
        <StatCard
          title="Average Score"
          value={dashboardData?.averageScore?.toFixed(1) || '0.0'}
          subtitle="System-wide average"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          }
          variant="highlight"
          loading={loading}
        />
      </div>

      {/* Department Statistics */}
      {dashboardData?.departmentStats && dashboardData.departmentStats.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Department Performance</h2>
            <Link
              to="/reports"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All Reports →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.departmentStats.map((dept) => (
              <div key={dept.departmentId} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{dept.departmentName}</h3>
                  <span className="text-sm text-gray-500">{dept.userCount} users</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {dept.evaluationCount} evaluations
                  </span>
                  <span className="text-sm font-medium text-primary-600">
                    Avg: {dept.averageScore.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <QuickActionButton
                label="Manage Users"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                }
                to="/users"
                variant="secondary"
                size="sm"
                className="w-full justify-start"
              />
              <QuickActionButton
                label="Manage Criteria"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                to="/criteria"
                variant="secondary"
                size="sm"
                className="w-full justify-start"
              />
              <QuickActionButton
                label="System Settings"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
                to="/settings"
                variant="secondary"
                size="sm"
                className="w-full justify-start"
              />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity
            title="Recent System Activity"
            activities={[
              {
                id: 1,
                type: 'evaluation',
                title: 'New evaluation period created',
                description: 'Q4 2024 evaluation period has been created',
                timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                user: { name: 'Admin User' },
                status: 'completed'
              },
              {
                id: 2,
                type: 'user',
                title: 'New user registered',
                description: 'John Doe has been added to the system',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                user: { name: 'HR Manager' },
                status: 'completed'
              },
              {
                id: 3,
                type: 'system',
                title: 'System maintenance completed',
                description: 'Scheduled maintenance has been completed successfully',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
                status: 'completed'
              }
            ]}
            loading={loading}
            maxItems={5}
          />
        </div>
      </div>
    </div>
  );
};

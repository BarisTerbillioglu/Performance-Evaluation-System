import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  StatCard, 
  QuickActionButton, 
  RecentActivity 
} from '@/components/dashboard';
import { dashboardService } from '@/services';
import { TeamPerformanceDto } from '@/types';
import { useAuth } from '@/store';

export const EvaluatorDashboard: React.FC = () => {
  const { state } = useAuth();
  const [dashboardData, setDashboardData] = useState<TeamPerformanceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getTeamPerformance();
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
              Team Dashboard, {state.user?.firstName}!
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your team's performance evaluations and track progress.
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-3">
            <QuickActionButton
              label="Start Evaluation"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
              to="/evaluations"
              variant="primary"
            />
            <QuickActionButton
              label="View Team Report"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              to="/reports"
              variant="secondary"
            />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="My Team Size"
          value={dashboardData?.memberCount || 0}
          subtitle="Team members"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          loading={loading}
        />
        
        <StatCard
          title="Pending Evaluations"
          value={dashboardData?.pendingEvaluations || 0}
          subtitle="Awaiting review"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          variant="warning"
          loading={loading}
        />
        
        <StatCard
          title="Completed This Month"
          value={dashboardData?.completedEvaluations || 0}
          subtitle="Evaluations done"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          variant="success"
          loading={loading}
        />
        
        <StatCard
          title="Team Average Score"
          value={dashboardData?.averageScore?.toFixed(1) || '0.0'}
          subtitle="Overall performance"
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

      {/* Team Member Performance */}
      {dashboardData?.memberPerformance && dashboardData.memberPerformance.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Team Member Performance</h2>
            <Link
              to="/teams"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All Members →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.memberPerformance.map((member) => (
              <div key={member.userId} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{member.userName}</h3>
                  <span className="text-sm font-medium text-primary-600">
                    {member.averageScore.toFixed(1)}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Evaluations:</span>
                    <span className="text-gray-900">{member.evaluationCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Completed:</span>
                    <span className="text-gray-900">{member.completedEvaluations}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <QuickActionButton
                    label="Evaluate"
                    icon={
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    }
                    to={`/evaluations/create?userId=${member.userId}`}
                    variant="primary"
                    size="sm"
                    className="w-full justify-center"
                  />
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
                label="View My Team"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
                to="/teams"
                variant="secondary"
                size="sm"
                className="w-full justify-start"
              />
              <QuickActionButton
                label="Evaluation History"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                to="/evaluations/history"
                variant="secondary"
                size="sm"
                className="w-full justify-start"
              />
              <QuickActionButton
                label="Team Reports"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
                to="/reports"
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
            title="Recent Evaluation Activity"
            activities={[
              {
                id: 1,
                type: 'evaluation',
                title: 'Evaluation completed for John Doe',
                description: 'Q4 2024 evaluation has been submitted',
                timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                user: { name: 'John Doe' },
                status: 'completed'
              },
              {
                id: 2,
                type: 'evaluation',
                title: 'Evaluation started for Jane Smith',
                description: 'Q4 2024 evaluation is in progress',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                user: { name: 'Jane Smith' },
                status: 'pending'
              },
              {
                id: 3,
                type: 'evaluation',
                title: 'Evaluation overdue for Mike Johnson',
                description: 'Q4 2024 evaluation is overdue',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                user: { name: 'Mike Johnson' },
                status: 'overdue'
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

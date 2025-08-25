import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  StatCard, 
  QuickActionButton, 
  RecentActivity 
} from '@/components/dashboard';
import { dashboardService } from '@/services';
import { PersonalPerformanceDto } from '@/types';
import { useAuth } from '@/store';

export const EmployeeDashboard: React.FC = () => {
  const { state } = useAuth();
  const [dashboardData, setDashboardData] = useState<PersonalPerformanceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getPersonalPerformance();
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

  const getPerformanceColor = (score: number) => {
    if (score >= 4.5) return 'text-success-600';
    if (score >= 3.5) return 'text-primary-600';
    if (score >= 2.5) return 'text-warning-600';
    return 'text-error-600';
  };

  const getPerformanceVariant = (score: number) => {
    if (score >= 4.5) return 'success';
    if (score >= 3.5) return 'default';
    if (score >= 2.5) return 'warning';
    return 'error';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {state.user?.firstName}!
            </h1>
            <p className="text-gray-600 mt-1">
              Track your performance and stay updated with your evaluations.
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-3">
            <QuickActionButton
              label="View My Latest Evaluation"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              to="/evaluations/history"
              variant="primary"
            />
            <QuickActionButton
              label="Update Goals"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              to="/goals"
              variant="secondary"
            />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Current Performance Score"
          value={dashboardData?.averageScore?.toFixed(1) || '0.0'}
          subtitle="Overall rating"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          }
          variant={getPerformanceVariant(dashboardData?.averageScore || 0)}
          loading={loading}
        />
        
        <StatCard
          title="Department Ranking"
          value={`#${dashboardData?.departmentRanking || 'N/A'}`}
          subtitle="Your position"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          variant="accent"
          loading={loading}
        />
        
        <StatCard
          title="Total Evaluations"
          value={dashboardData?.evaluationCount || 0}
          subtitle="Completed reviews"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          variant="default"
          loading={loading}
        />
        
        <StatCard
          title="Department"
          value={dashboardData?.departmentName || 'N/A'}
          subtitle="Your department"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          variant="default"
          loading={loading}
        />
      </div>

      {/* Recent Evaluations */}
      {dashboardData?.recentEvaluations && dashboardData.recentEvaluations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Evaluations</h2>
            <Link
              to="/evaluations/history"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {dashboardData.recentEvaluations.map((evaluation) => (
              <div key={evaluation.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{evaluation.period}</h3>
                    <p className="text-sm text-gray-500">Status: {evaluation.status}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getPerformanceColor(evaluation.score)}`}>
                      {evaluation.score}
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(evaluation.completedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <QuickActionButton
                    label="View Details"
                    icon={
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    }
                    to={`/evaluations/${evaluation.id}`}
                    variant="secondary"
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Trend and Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last 6 months</span>
              <span className="text-sm font-medium text-primary-600">+12%</span>
            </div>
            <div className="h-32 bg-gray-100 rounded-lg flex items-end justify-between p-4">
              {[65, 72, 68, 78, 82, 85].map((value, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="bg-primary-500 rounded-t w-6"
                    style={{ height: `${value}%` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-1">{index + 1}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 text-center">
              Your performance has been consistently improving over the past 6 months.
            </p>
          </div>
        </div>

        {/* Upcoming Evaluations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Evaluations</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Q1 2025 Evaluation</h3>
                <p className="text-sm text-gray-500">Due: March 31, 2025</p>
              </div>
              <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                Upcoming
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Annual Review</h3>
                <p className="text-sm text-gray-500">Due: December 15, 2024</p>
              </div>
              <span className="text-xs bg-warning-100 text-warning-800 px-2 py-1 rounded-full">
                Soon
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <QuickActionButton
                label="View My Performance"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                to="/profile"
                variant="secondary"
                size="sm"
                className="w-full justify-start"
              />
              <QuickActionButton
                label="Performance History"
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
                label="Goals & Feedback"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                to="/goals"
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
            title="Recent Feedback"
            activities={[
              {
                id: 1,
                type: 'evaluation',
                title: 'Q4 2024 evaluation completed',
                description: 'Your manager has completed your quarterly evaluation',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                user: { name: 'Your Manager' },
                status: 'completed'
              },
              {
                id: 2,
                type: 'notification',
                title: 'New feedback received',
                description: 'You have received new feedback on your project work',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
                user: { name: 'Team Lead' },
                status: 'completed'
              },
              {
                id: 3,
                type: 'evaluation',
                title: 'Goal update reminder',
                description: 'Time to update your quarterly goals',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                status: 'pending'
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

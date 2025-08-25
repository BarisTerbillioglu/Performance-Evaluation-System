import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../design-system/Card';
import { Button } from '../design-system/Button';
import SettingsService from '../../services/settingsService';
import { SystemHealth } from '../../types/settings';

export interface SystemHealthDashboardProps {
  className?: string;
  refreshInterval?: number; // in seconds
}

const SystemHealthDashboard: React.FC<SystemHealthDashboardProps> = ({
  className,
  refreshInterval = 30,
}) => {
  const [healthData, setHealthData] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    loadHealthData();
    
    const interval = setInterval(loadHealthData, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const loadHealthData = async () => {
    try {
      setLoading(true);
      const data = await SettingsService.getSystemHealth();
      setHealthData(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to load system health data');
      console.error('Error loading system health:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'offline':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'critical':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'offline':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };

  if (loading && !healthData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading system health...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Health Dashboard</h2>
          <p className="text-gray-600">
            Real-time system performance and health monitoring
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {lastUpdate && (
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={loadHealthData}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {healthData && (
        <>
          {/* Overall Status */}
          <Card variant="accent">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Overall System Status</CardTitle>
                  <CardDescription>
                    Current system health and performance overview
                  </CardDescription>
                </div>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(healthData.status.overall)}`}>
                  {getStatusIcon(healthData.status.overall)}
                  <span className="font-medium capitalize">{healthData.status.overall}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatUptime(healthData.status.uptime)}
                  </p>
                  <p className="text-sm text-gray-600">Uptime</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {healthData.status.services.length}
                  </p>
                  <p className="text-sm text-gray-600">Active Services</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {healthData.status.services.filter(s => s.status === 'healthy').length}
                  </p>
                  <p className="text-sm text-gray-600">Healthy Services</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>System performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Response Time</span>
                    <span className="text-sm text-gray-900">
                      {healthData.performance.responseTime}ms
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((healthData.performance.responseTime / 1000) * 100, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Memory Usage</span>
                    <span className="text-sm text-gray-900">
                      {formatPercentage(healthData.performance.memoryUsage)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        healthData.performance.memoryUsage > 80 ? 'bg-red-500' :
                        healthData.performance.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${healthData.performance.memoryUsage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">CPU Usage</span>
                    <span className="text-sm text-gray-900">
                      {formatPercentage(healthData.performance.cpuUsage)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        healthData.performance.cpuUsage > 80 ? 'bg-red-500' :
                        healthData.performance.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${healthData.performance.cpuUsage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Network Latency</span>
                    <span className="text-sm text-gray-900">
                      {healthData.performance.networkLatency}ms
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Database Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Database Performance</CardTitle>
                <CardDescription>Database metrics and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Query Time</span>
                    <span className="text-sm text-gray-900">
                      {healthData.performance.databasePerformance.queryTime}ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Active Connections</span>
                    <span className="text-sm text-gray-900">
                      {healthData.performance.databasePerformance.connectionCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Slow Queries</span>
                    <span className="text-sm text-gray-900">
                      {healthData.performance.databasePerformance.slowQueries}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Deadlocks</span>
                    <span className="text-sm text-gray-900">
                      {healthData.performance.databasePerformance.deadlocks}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Service Status */}
          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>Individual service health and response times</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {healthData.status.services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-1 rounded-full ${getStatusColor(service.status)}`}>
                        {getStatusIcon(service.status)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{service.name}</p>
                        {service.message && (
                          <p className="text-sm text-gray-600">{service.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {service.responseTime}ms
                      </p>
                      <p className="text-xs text-gray-500">
                        {service.lastCheck.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>Current user engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Active Users</span>
                    <span className="text-sm text-gray-900">
                      {healthData.activity.activeUsers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Total Users</span>
                    <span className="text-sm text-gray-900">
                      {healthData.activity.totalUsers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Session Duration</span>
                    <span className="text-sm text-gray-900">
                      {Math.round(healthData.activity.sessionDuration)}min
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Page Views</span>
                    <span className="text-sm text-gray-900">
                      {healthData.activity.pageViews}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Error Tracking</CardTitle>
                <CardDescription>System error rates and recent issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Error Rate</span>
                    <span className="text-sm text-gray-900">
                      {formatPercentage(healthData.errors.errorRate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Total Errors</span>
                    <span className="text-sm text-gray-900">
                      {healthData.errors.errorCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Critical Errors</span>
                    <span className="text-sm text-red-600 font-medium">
                      {healthData.errors.criticalErrors}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Recent Errors</span>
                    <span className="text-sm text-gray-900">
                      {healthData.errors.recentErrors.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Errors */}
          {healthData.errors.recentErrors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Errors</CardTitle>
                <CardDescription>Latest error logs and issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {healthData.errors.recentErrors.slice(0, 5).map((error, index) => (
                    <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              error.level === 'critical' ? 'bg-red-100 text-red-800' :
                              error.level === 'error' ? 'bg-orange-100 text-orange-800' :
                              error.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {error.level.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {error.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900">{error.message}</p>
                          {error.userId && (
                            <p className="text-xs text-gray-600 mt-1">
                              User ID: {error.userId}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default SystemHealthDashboard;

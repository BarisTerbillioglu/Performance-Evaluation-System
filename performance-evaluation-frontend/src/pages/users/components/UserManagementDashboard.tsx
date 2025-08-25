import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon,
  UserPlusIcon,
  UserMinusIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { userService } from '@/services/userService';

interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByDepartment: { departmentName: string; count: number }[];
  usersByRole: { roleName: string; count: number }[];
  recentActivity?: {
    newUsers: number;
    deactivatedUsers: number;
    lastWeek: number;
    lastMonth: number;
  };
}

interface UserManagementDashboardProps {
  onViewUsers: () => void;
  onAddUser: () => void;
  onViewAnalytics: () => void;
}

export const UserManagementDashboard: React.FC<UserManagementDashboardProps> = ({
  onViewUsers,
  onAddUser,
  onViewAnalytics
}) => {
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const data = await userService.getUserStatistics();
      setStatistics(data);
    } catch (error) {
      console.error('Failed to load user statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
        <p className="mt-1 text-sm text-gray-500">
          User statistics will appear here once users are added to the system.
        </p>
      </div>
    );
  }

  const activePercentage = Math.round((statistics.activeUsers / statistics.totalUsers) * 100);
  const inactivePercentage = Math.round((statistics.inactiveUsers / statistics.totalUsers) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500">
            Overview of user statistics and system activity
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onViewAnalytics}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ChartBarIcon className="w-4 h-4 mr-2" />
            View Analytics
          </button>
          <button
            onClick={onAddUser}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <UserPlusIcon className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalUsers}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Active</span>
              <span className="font-medium text-gray-900">{activePercentage}%</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-success-600 h-2 rounded-full" 
                style={{ width: `${activePercentage}%` }}
              ></div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserPlusIcon className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.activeUsers}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUpIcon className="h-4 w-4 text-success-600" />
            <span className="ml-1 text-sm text-success-600 font-medium">
              {activePercentage}% of total
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserMinusIcon className="h-8 w-8 text-error-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Inactive Users</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.inactiveUsers}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingDownIcon className="h-4 w-4 text-error-600" />
            <span className="ml-1 text-sm text-error-600 font-medium">
              {inactivePercentage}% of total
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BuildingOfficeIcon className="h-8 w-8 text-info-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Departments</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.usersByDepartment.length}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Users distributed across departments
            </p>
          </div>
        </Card>
      </div>

      {/* Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Department</h3>
          <div className="space-y-3">
            {statistics.usersByDepartment.map((dept, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-primary-600"></div>
                  <span className="text-sm font-medium text-gray-900">{dept.departmentName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{dept.count} users</span>
                  <Badge variant="primary" size="sm">
                    {Math.round((dept.count / statistics.totalUsers) * 100)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Role</h3>
          <div className="space-y-3">
            {statistics.usersByRole.map((role, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-success-600"></div>
                  <span className="text-sm font-medium text-gray-900">{role.roleName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{role.count} users</span>
                  <Badge variant="success" size="sm">
                    {Math.round((role.count / statistics.totalUsers) * 100)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={onViewUsers}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <UserGroupIcon className="h-6 w-6 text-primary-600 mr-3" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">View All Users</p>
              <p className="text-xs text-gray-500">Browse and manage users</p>
            </div>
          </button>

          <button
            onClick={onAddUser}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <UserPlusIcon className="h-6 w-6 text-success-600 mr-3" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Add New User</p>
              <p className="text-xs text-gray-500">Create a new user account</p>
            </div>
          </button>

          <button
            onClick={onViewAnalytics}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <ChartBarIcon className="h-6 w-6 text-info-600 mr-3" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">View Analytics</p>
              <p className="text-xs text-gray-500">Detailed reports and insights</p>
            </div>
          </button>
        </div>
      </Card>

      {/* Recent Activity */}
      {statistics.recentActivity && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary-50 rounded-lg">
              <CalendarIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary-600">{statistics.recentActivity.newUsers}</p>
              <p className="text-sm text-gray-600">New Users</p>
            </div>
            <div className="text-center p-4 bg-error-50 rounded-lg">
              <UserMinusIcon className="h-8 w-8 text-error-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-error-600">{statistics.recentActivity.deactivatedUsers}</p>
              <p className="text-sm text-gray-600">Deactivated</p>
            </div>
            <div className="text-center p-4 bg-success-50 rounded-lg">
              <TrendingUpIcon className="h-8 w-8 text-success-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-success-600">{statistics.recentActivity.lastWeek}</p>
              <p className="text-sm text-gray-600">Last Week</p>
            </div>
            <div className="text-center p-4 bg-info-50 rounded-lg">
              <ChartBarIcon className="h-8 w-8 text-info-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-info-600">{statistics.recentActivity.lastMonth}</p>
              <p className="text-sm text-gray-600">Last Month</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

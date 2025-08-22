import React from 'react';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Target,
  Award,
  Activity,
  DollarSign,
  FileText,
  Building
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '../design-system';
import { Header } from '../design-system/Header';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
  variant?: 'default' | 'accent' | 'highlight';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon, variant = 'default' }) => (
  <Card variant={variant} className="hover:shadow-md transition-shadow duration-200">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            {title}
          </p>
          <p className={`text-3xl font-bold mt-2 ${
            variant === 'highlight' ? 'text-white' : 'text-black'
          }`}>
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {changeType === 'increase' ? (
                <ArrowUpRight className="h-4 w-4 text-success-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-error-500" />
              )}
              <span className={`text-sm font-medium ml-1 ${
                changeType === 'increase' ? 'text-success-500' : 'text-error-500'
              }`}>
                {Math.abs(change)}%
              </span>
              <span className={`text-sm ml-1 ${
                variant === 'highlight' ? 'text-white opacity-80' : 'text-gray-500'
              }`}>
                from last month
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${
          variant === 'highlight' ? 'bg-white bg-opacity-20' : 'bg-primary-500'
        }`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

interface ActivityCardProps {
  title: string;
  activities: Array<{
    id: number;
    type: string;
    message: string;
    time: string;
    status: 'completed' | 'pending' | 'overdue';
  }>;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ title, activities }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Activity className="h-5 w-5 mr-2 text-primary-500" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              {activity.status === 'completed' && (
                <CheckCircle className="h-4 w-4 text-success-500" />
              )}
              {activity.status === 'pending' && (
                <Clock className="h-4 w-4 text-warning-500" />
              )}
              {activity.status === 'overdue' && (
                <AlertCircle className="h-4 w-4 text-error-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-black">
                {activity.message}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {activity.time}
              </p>
            </div>
            <Badge
              variant={
                activity.status === 'completed' ? 'success' :
                activity.status === 'pending' ? 'warning' : 'error'
              }
              size="sm"
            >
              {activity.status}
            </Badge>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const VakifBankDashboard: React.FC = () => {
  const notifications = [
    { id: 1, message: 'New evaluation assigned', time: '2 min ago', unread: true },
    { id: 2, message: 'Evaluation completed', time: '1 hour ago', unread: true },
    { id: 3, message: 'System maintenance scheduled', time: '2 hours ago', unread: false },
  ];

  const stats = [
    {
      title: 'Total Employees',
      value: '1,234',
      change: 12,
      changeType: 'increase' as const,
      icon: <Users className="h-6 w-6 text-white" />,
      variant: 'highlight' as const
    },
    {
      title: 'Active Evaluations',
      value: '89',
      change: 5,
      changeType: 'increase' as const,
      icon: <Target className="h-6 w-6 text-white" />,
      variant: 'accent' as const
    },
    {
      title: 'Pending Reviews',
      value: '23',
      change: 8,
      changeType: 'decrease' as const,
      icon: <Clock className="h-6 w-6 text-white" />,
      variant: 'default' as const
    },
    {
      title: 'Average Score',
      value: '87%',
      change: 3,
      changeType: 'increase' as const,
      icon: <TrendingUp className="h-6 w-6 text-white" />,
      variant: 'default' as const
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'evaluation',
      message: 'John Doe completed Q4 evaluation',
      time: '2 hours ago',
      status: 'completed' as const
    },
    {
      id: 2,
      type: 'review',
      message: 'Sarah Wilson evaluation due tomorrow',
      time: '4 hours ago',
      status: 'pending' as const
    },
    {
      id: 3,
      type: 'overdue',
      message: 'Mike Johnson evaluation overdue',
      time: '1 day ago',
      status: 'overdue' as const
    },
    {
      id: 4,
      type: 'completed',
      message: 'Jane Smith received performance award',
      time: '2 days ago',
      status: 'completed' as const
    }
  ];

  const quickActions = [
    {
      title: 'Add Employee',
      description: 'Create new employee profile',
      icon: <Users className="h-8 w-8 text-primary-500" />,
      action: () => console.log('Add Employee')
    },
    {
      title: 'Start Evaluation',
      description: 'Begin new evaluation cycle',
      icon: <Target className="h-8 w-8 text-success-500" />,
      action: () => console.log('Start Evaluation')
    },
    {
      title: 'Generate Report',
      description: 'Create performance reports',
      icon: <BarChart3 className="h-8 w-8 text-info-500" />,
      action: () => console.log('Generate Report')
    },
    {
      title: 'Schedule Review',
      description: 'Plan evaluation meetings',
      icon: <Calendar className="h-8 w-8 text-warning-500" />,
      action: () => console.log('Schedule Review')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* VakıfBank-style Header */}
      <Header 
        title="Performance Evaluation System"
        notifications={notifications}
        onLogout={() => console.log('Logout')}
        onSearch={(query) => console.log('Search:', query)}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-black">Dashboard Overview</h2>
          <p className="text-gray-500 mt-1">Monitor your performance evaluation system</p>
        </div>

        {/* Key Metrics - Yellow accent cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Chart Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary-500" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Chart component would go here</p>
                    <p className="text-sm text-gray-400">Performance metrics over time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <div>
            <ActivityCard title="Recent Activities" activities={recentActivities} />
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-primary-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left group"
                  >
                    <div className="mb-3 group-hover:scale-110 transition-transform duration-200">
                      {action.icon}
                    </div>
                    <p className="font-medium text-black mb-1">{action.title}</p>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department Overview */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-primary-500" />
                Department Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-primary-50 rounded-lg border border-primary-200">
                  <Users className="h-8 w-8 text-primary-500 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-black">Engineering</p>
                  <p className="text-sm text-gray-500">156 employees</p>
                  <p className="text-xs text-primary-600 mt-1">Avg. Score: 89%</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Users className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-black">Marketing</p>
                  <p className="text-sm text-gray-500">89 employees</p>
                  <p className="text-xs text-gray-600 mt-1">Avg. Score: 85%</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Users className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-black">Sales</p>
                  <p className="text-sm text-gray-500">234 employees</p>
                  <p className="text-xs text-gray-600 mt-1">Avg. Score: 82%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default VakifBankDashboard;

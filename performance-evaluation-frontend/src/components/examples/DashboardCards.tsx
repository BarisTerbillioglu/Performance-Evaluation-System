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
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../design-system';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon, color }) => (
  <Card className="hover:shadow-md transition-shadow duration-200">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-3xl font-bold text-black mt-2">
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
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
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

export const DashboardCards: React.FC = () => {
  const stats = [
    {
      title: 'Total Employees',
      value: '1,234',
      change: 12,
      changeType: 'increase' as const,
      icon: <Users className="h-6 w-6 text-white" />,
      color: 'bg-primary-500'
    },
    {
      title: 'Active Evaluations',
      value: '89',
      change: 5,
      changeType: 'increase' as const,
      icon: <Target className="h-6 w-6 text-white" />,
      color: 'bg-success-500'
    },
    {
      title: 'Pending Reviews',
      value: '23',
      change: 8,
      changeType: 'decrease' as const,
      icon: <Clock className="h-6 w-6 text-white" />,
      color: 'bg-warning-500'
    },
    {
      title: 'Average Score',
      value: '87%',
      change: 3,
      changeType: 'increase' as const,
      icon: <TrendingUp className="h-6 w-6 text-white" />,
      color: 'bg-info-500'
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

  const upcomingEvaluations = [
    {
      id: 1,
      type: 'evaluation',
      message: 'Q1 2024 evaluations start next week',
      time: 'Next Monday',
      status: 'pending' as const
    },
    {
      id: 2,
      type: 'review',
      message: 'Department head reviews scheduled',
      time: 'This Friday',
      status: 'pending' as const
    },
    {
      id: 3,
      type: 'training',
      message: 'New evaluation criteria training',
      time: 'Next Wednesday',
      status: 'pending' as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-black">Dashboard Overview</h2>
        <p className="text-gray-500 mt-1">Monitor your performance evaluation system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts and Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Evaluations */}
        <ActivityCard title="Upcoming Evaluations" activities={upcomingEvaluations} />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-primary-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left">
                <Users className="h-8 w-8 text-primary-500 mb-2" />
                <p className="font-medium text-black">Add Employee</p>
                <p className="text-sm text-gray-500">Create new employee profile</p>
              </button>
              
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left">
                <Target className="h-8 w-8 text-success-500 mb-2" />
                <p className="font-medium text-black">Start Evaluation</p>
                <p className="text-sm text-gray-500">Begin new evaluation cycle</p>
              </button>
              
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left">
                <BarChart3 className="h-8 w-8 text-info-500 mb-2" />
                <p className="font-medium text-black">Generate Report</p>
                <p className="text-sm text-gray-500">Create performance reports</p>
              </button>
              
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left">
                <Calendar className="h-8 w-8 text-warning-500 mb-2" />
                <p className="font-medium text-black">Schedule Review</p>
                <p className="text-sm text-gray-500">Plan evaluation meetings</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardCards;

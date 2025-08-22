import React, { useState, useEffect } from 'react';
import { X, BarChart3, TrendingUp, Users, Target, Calendar } from 'lucide-react';
import { TeamWithMembersDto, TeamAnalyticsDto, TeamPerformanceMetricsDto } from '@/types';
import { teamService } from '@/services/teamService';
import { useUIStore } from '@/stores';
import { Button } from '@/components/ui/button/Button';
import { Select } from '@/components/ui/form/Select';
import { Card } from '@/components/ui/layout/Card';
import { Badge } from '@/components/ui/feedback/Badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface TeamAnalyticsModalProps {
  team: TeamWithMembersDto;
  onClose: () => void;
}

export const TeamAnalyticsModal: React.FC<TeamAnalyticsModalProps> = ({
  team,
  onClose,
}) => {
  const [analytics, setAnalytics] = useState<TeamAnalyticsDto | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<TeamPerformanceMetricsDto | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  const { showNotification } = useUIStore();

  useEffect(() => {
    loadAnalytics();
    loadPerformanceMetrics();
  }, [team.id, selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await teamService.getTeamAnalytics(team.id);
      setAnalytics(data);
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load team analytics',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPerformanceMetrics = async () => {
    try {
      const data = await teamService.getTeamPerformanceMetrics(team.id, selectedPeriod);
      setPerformanceMetrics(data);
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
    }
  };

  const formatPercentage = (value: number) => `${Math.round(value * 100)}%`;
  const formatScore = (value: number) => value.toFixed(1);

  const memberDistributionData = analytics ? [
    { name: 'Employees', value: analytics.employees, color: '#3B82F6' },
    { name: 'Evaluators', value: analytics.evaluators, color: '#10B981' },
  ] : [];

  const performanceTrendData = performanceMetrics ? [
    { month: 'Jan', score: 85, completion: 92, satisfaction: 88 },
    { month: 'Feb', score: 87, completion: 89, satisfaction: 90 },
    { month: 'Mar', score: 82, completion: 95, satisfaction: 85 },
    { month: 'Apr', score: 89, completion: 91, satisfaction: 92 },
    { month: 'May', score: 91, completion: 94, satisfaction: 89 },
    { month: 'Jun', score: 88, completion: 93, satisfaction: 91 },
  ] : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Team Analytics
              </h2>
              <p className="text-sm text-gray-500">{team.name}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Period Selector */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Performance Metrics</h3>
            <Select
              value={selectedPeriod}
              onChange={(value) => setSelectedPeriod(value.toString())}
              options={[
                { value: 'week', label: 'Last Week' },
                { value: 'month', label: 'Last Month' },
                { value: 'quarter', label: 'Last Quarter' },
                { value: 'year', label: 'Last Year' },
              ]}
              className="w-40"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading analytics...</div>
            </div>
          ) : (
            <>
              {/* Key Metrics Cards */}
              {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Members</p>
                        <p className="text-2xl font-semibold text-gray-900">{analytics.totalMembers}</p>
                        <p className="text-sm text-gray-500">{analytics.activeMembers} active</p>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Target className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Avg Performance</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {formatScore(analytics.averagePerformanceScore)}
                        </p>
                        <Badge variant="success" size="sm">
                          {analytics.teamEfficiency > 0.8 ? 'High' : analytics.teamEfficiency > 0.6 ? 'Medium' : 'Low'} Efficiency
                        </Badge>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Calendar className="h-8 w-8 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Evaluations</p>
                        <p className="text-2xl font-semibold text-gray-900">{analytics.completedEvaluations}</p>
                        <p className="text-sm text-gray-500">{analytics.pendingEvaluations} pending</p>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <TrendingUp className="h-8 w-8 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Team Efficiency</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {formatPercentage(analytics.teamEfficiency)}
                        </p>
                        <p className="text-sm text-gray-500">Completion rate</p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Member Distribution */}
                <Card>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Member Distribution</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={memberDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {memberDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>

                {/* Performance Trends */}
                <Card>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Performance Trends</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="score" stroke="#3B82F6" name="Performance Score" />
                      <Line type="monotone" dataKey="completion" stroke="#10B981" name="Completion Rate" />
                      <Line type="monotone" dataKey="satisfaction" stroke="#F59E0B" name="Satisfaction" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Performance Metrics Table */}
              {performanceMetrics && (
                <Card>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Detailed Metrics</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Metric
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Value
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trend
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Average Score
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatScore(performanceMetrics.metrics.averageScore)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant={performanceMetrics.trends.scoreTrend > 0 ? 'success' : 'danger'} 
                              size="sm"
                            >
                              {performanceMetrics.trends.scoreTrend > 0 ? '+' : ''}{performanceMetrics.trends.scoreTrend.toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Completion Rate
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatPercentage(performanceMetrics.metrics.completionRate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant={performanceMetrics.trends.completionTrend > 0 ? 'success' : 'danger'} 
                              size="sm"
                            >
                              {performanceMetrics.trends.completionTrend > 0 ? '+' : ''}{performanceMetrics.trends.completionTrend.toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Member Satisfaction
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatScore(performanceMetrics.metrics.memberSatisfaction)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant={performanceMetrics.trends.satisfactionTrend > 0 ? 'success' : 'danger'} 
                              size="sm"
                            >
                              {performanceMetrics.trends.satisfactionTrend > 0 ? '+' : ''}{performanceMetrics.trends.satisfactionTrend.toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

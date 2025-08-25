import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BarChart3, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Star,
  Download,
  FileText,
  MessageSquare,
  Plus,
  Filter,
  Search,
  MoreVertical,
  Eye,
  Edit,
  MessageCircle
} from 'lucide-react';
import { TeamDashboardStatsDto, TeamMemberDto } from '@/types';
import { teamService } from '@/services/teamService';
import { useUIStore } from '@/stores';
import { Button } from '@/components/design-system/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { Input } from '@/components/ui/form/Input';
import { Select } from '@/components/ui/form/Select';
import { Avatar } from '@/components/ui/feedback/Avatar';
import { Container } from '@/components/ui/layout/Container';
import { TeamMemberCard } from './components/TeamMemberCard';
import { TeamStatsCard } from './components/TeamStatsCard';
import { QuickActionButton } from '@/components/dashboard/QuickActionButton';
import { PerformanceTrendChart } from './components/PerformanceTrendChart';

export const TeamDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<TeamDashboardStatsDto | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMemberDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { showNotification } = useUIStore();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, membersData] = await Promise.all([
        teamService.getTeamDashboardStats(),
        teamService.getTeamMembers(1) // Assuming current user's team ID is 1
      ]);
      setDashboardData(statsData);
      setTeamMembers(membersData);
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load team dashboard data',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportTeamData = async () => {
    try {
      const blob = await teamService.exportTeamData(1, 'excel');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'team-data.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
      
      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Team data exported successfully',
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to export team data',
      });
    }
  };

  const handleBulkEvaluate = () => {
    // Navigate to bulk evaluation page
    window.location.href = '/evaluations/bulk';
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || member.currentEvaluationStatus === statusFilter;
    const matchesRole = !roleFilter || member.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'pending': return 'warning';
      case 'overdue': return 'danger';
      default: return 'secondary';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                My Team Dashboard
              </h1>
              <p className="mt-2 max-w-4xl text-sm text-gray-500">
                Manage your team's performance evaluations and track progress
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <QuickActionButton
                label="Start Evaluation"
                icon={<Plus className="h-4 w-4" />}
                to="/evaluations/create"
                variant="primary"
              />
              <QuickActionButton
                label="Team Report"
                icon={<FileText className="h-4 w-4" />}
                to="/reports/team"
                variant="secondary"
              />
            </div>
          </div>
        </div>

        {/* Team Statistics Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <TeamStatsCard
              title="Total Team Members"
              value={dashboardData.totalMembers}
              icon={<Users className="h-8 w-8 text-blue-600" />}
              trend="+2 this month"
              trendDirection="up"
              variant="accent"
            />
            <TeamStatsCard
              title="Active Evaluations"
              value={dashboardData.activeEvaluations}
              icon={<BarChart3 className="h-8 w-8 text-green-600" />}
              trend={`${dashboardData.completionRate}% completion rate`}
              trendDirection="up"
              variant="default"
            />
            <TeamStatsCard
              title="Team Average Score"
              value={dashboardData.teamAverageScore.toFixed(1)}
              icon={<Star className="h-8 w-8 text-yellow-500" />}
              trend={`${dashboardData.teamAverageScore > dashboardData.departmentAverageScore ? '+' : ''}${(dashboardData.teamAverageScore - dashboardData.departmentAverageScore).toFixed(1)} vs department`}
              trendDirection={dashboardData.teamAverageScore > dashboardData.departmentAverageScore ? "up" : "down"}
              variant="default"
            />
            <TeamStatsCard
              title="Pending Evaluations"
              value={dashboardData.pendingEvaluations}
              icon={<Clock className="h-8 w-8 text-orange-600" />}
              trend={`${dashboardData.overdueEvaluations} overdue`}
              trendDirection={dashboardData.overdueEvaluations > 0 ? "down" : "up"}
              variant={dashboardData.overdueEvaluations > 0 ? "highlight" : "default"}
            />
          </div>
        )}

        {/* Quick Actions Toolbar */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search team members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value.toString())}
                  options={[
                    { value: '', label: 'All Status' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'overdue', label: 'Overdue' },
                  ]}
                  className="w-40"
                />
                <Select
                  value={roleFilter}
                  onChange={(value) => setRoleFilter(value.toString())}
                  options={[
                    { value: '', label: 'All Roles' },
                    { value: 'Developer', label: 'Developer' },
                    { value: 'QA', label: 'QA' },
                    { value: 'Analyst', label: 'Analyst' },
                    { value: 'Manager', label: 'Manager' },
                  ]}
                  className="w-40"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {viewMode === 'grid' ? 'List View' : 'Grid View'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBulkEvaluate}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Evaluate All
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExportTeamData}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performers Section */}
        {dashboardData?.topPerformers && dashboardData.topPerformers.length > 0 && (
          <Card variant="accent">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-2" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.topPerformers.slice(0, 3).map((performer, index) => (
                  <div key={performer.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-yellow-200">
                    <div className="flex-shrink-0">
                      <Badge variant="accent" size="sm">
                        #{index + 1}
                      </Badge>
                    </div>
                    <Avatar
                      src={performer.avatar}
                      alt={`${performer.firstName} ${performer.lastName}`}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {performer.firstName} {performer.lastName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        Score: {performer.latestScore?.toFixed(1)}/100
                      </p>
                    </div>
                    {getTrendIcon(performer.performanceTrend)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Team Members Grid/List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Team Members ({filteredMembers.length})</span>
              <div className="flex items-center space-x-2">
                <Badge variant="info" size="sm">
                  {dashboardData?.activeEvaluations || 0} Active Evaluations
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMembers.map((member) => (
                  <TeamMemberCard
                    key={member.id}
                    member={member}
                    onEvaluate={() => window.location.href = `/evaluations/create?employeeId=${member.userId}`}
                    onViewHistory={() => window.location.href = `/evaluations?employeeId=${member.userId}`}
                    onMessage={() => window.location.href = `/messages?userId=${member.userId}`}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar
                        src={member.avatar}
                        alt={`${member.firstName} ${member.lastName}`}
                        size="md"
                      />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">{member.role} • {member.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {member.latestScore ? `${member.latestScore.toFixed(1)}/100` : 'No Score'}
                        </p>
                        <Badge variant={getStatusColor(member.currentEvaluationStatus)} size="sm">
                          {member.currentEvaluationStatus.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.location.href = `/evaluations/create?employeeId=${member.userId}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.location.href = `/evaluations?employeeId=${member.userId}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.location.href = `/messages?userId=${member.userId}`}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {activity.type === 'evaluation_completed' && <BarChart3 className="h-5 w-5 text-green-500" />}
                      {activity.type === 'evaluation_started' && <Clock className="h-5 w-5 text-blue-500" />}
                      {activity.type === 'member_added' && <Users className="h-5 w-5 text-purple-500" />}
                      {activity.type === 'member_removed' && <Users className="h-5 w-5 text-red-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Container>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Users, 
  BarChart3, 
  Network, 
  Settings, 
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  Edit,
  Eye,
  UserPlus,
  UserMinus,
  ArrowRight,
  ArrowLeft,
  MoreHorizontal,
  Calendar,
  Target,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { 
  TeamWithMembersDto, 
  TeamStatisticsDto, 
  AvailableUserDto,
  TeamTemplateDto,
  TeamGoalDto,
  TeamAnnouncementDto
} from '@/types';
import { teamService } from '@/services/teamService';
import { useUIStore } from '@/stores';
import { Button } from '@/components/design-system/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { Input } from '@/components/ui/form/Input';
import { Select } from '@/components/ui/form/Select';
import { Avatar } from '@/components/ui/feedback/Avatar';
import { Container } from '@/components/ui/layout/Container';
import { DataTable } from '@/components/ui/data/DataTable';
import { TeamFormModal } from './components/TeamFormModal';
import { TeamAnalyticsModal } from './components/TeamAnalyticsModal';
import { TeamHierarchyModal } from './components/TeamHierarchyModal';
import { BulkOperationsModal } from './components/BulkOperationsModal';
import { MemberTransferModal } from './components/MemberTransferModal';
import { EvaluatorAssignmentModal } from './components/EvaluatorAssignmentModal';
import { TeamAssignmentPanel } from './components/TeamAssignmentPanel';
import { TeamTemplatesModal } from './components/TeamTemplatesModal';
import { TeamGoalsModal } from './components/TeamGoalsModal';
import { TeamAnnouncementsModal } from './components/TeamAnnouncementsModal';

export const TeamManagementPage: React.FC = () => {
  const [teams, setTeams] = useState<TeamWithMembersDto[]>([]);
  const [statistics, setStatistics] = useState<TeamStatisticsDto | null>(null);
  const [availableUsers, setAvailableUsers] = useState<AvailableUserDto[]>([]);
  const [templates, setTemplates] = useState<TeamTemplateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  // Modal states
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showHierarchy, setShowHierarchy] = useState(false);
  const [showBulkOperations, setShowBulkOperations] = useState(false);
  const [showMemberTransfer, setShowMemberTransfer] = useState(false);
  const [showEvaluatorAssignment, setShowEvaluatorAssignment] = useState(false);
  const [showAssignmentPanel, setShowAssignmentPanel] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamWithMembersDto | null>(null);

  const { showNotification } = useUIStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [teamsData, statsData, usersData, templatesData] = await Promise.all([
        teamService.getTeamsWithMembers(),
        teamService.getTeamStatistics(),
        teamService.getAvailableUsers(),
        teamService.getTeamTemplates()
      ]);
      setTeams(teamsData);
      setStatistics(statsData);
      setAvailableUsers(usersData);
      setTemplates(templatesData);
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load team management data',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = () => {
    setEditingTeam(null);
    setShowTeamForm(true);
  };

  const handleEditTeam = (team: TeamWithMembersDto) => {
    setEditingTeam(team);
    setShowTeamForm(true);
  };

  const handleTeamSaved = () => {
    setShowTeamForm(false);
    setEditingTeam(null);
    loadData();
    showNotification({
      type: 'success',
      title: 'Success',
      message: 'Team saved successfully',
    });
  };

  const handleDeleteTeam = async (teamId: number) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await teamService.deleteTeam(teamId);
        loadData();
        showNotification({
          type: 'success',
          title: 'Success',
          message: 'Team deleted successfully',
        });
      } catch (error) {
        showNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to delete team',
        });
      }
    }
  };

  const handleBulkOperation = () => {
    if (selectedTeams.length === 0) {
      showNotification({
        type: 'warning',
        title: 'Warning',
        message: 'Please select teams for bulk operations',
      });
      return;
    }
    setShowBulkOperations(true);
  };

  const handleMemberTransfer = () => {
    if (selectedTeams.length !== 2) {
      showNotification({
        type: 'warning',
        title: 'Warning',
        message: 'Please select exactly 2 teams for member transfer',
      });
      return;
    }
    setShowMemberTransfer(true);
  };

  const handleExportData = async () => {
    try {
      const blob = await teamService.exportTeamData(0, 'excel'); // 0 for all teams
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'teams-data.xlsx';
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

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !departmentFilter || team.departmentId?.toString() === departmentFilter;
    const matchesStatus = !statusFilter || 
                         (statusFilter === 'active' && team.isActive) ||
                         (statusFilter === 'inactive' && !team.isActive);
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const columns = [
    {
      key: 'name',
      title: 'Team Name',
      render: (team: TeamWithMembersDto) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-primary-600" />
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900">{team.name}</div>
            <div className="text-sm text-gray-500">{team.description}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'members',
      title: 'Members',
      render: (team: TeamWithMembersDto) => (
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">{team.memberCount}</span>
          {team.evaluatorCount > 0 && (
            <Badge variant="success" size="sm">
              {team.evaluatorCount} Evaluators
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'department',
      title: 'Department',
      render: (team: TeamWithMembersDto) => (
        <span className="text-sm text-gray-600">
          {team.departmentName || 'No Department'}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (team: TeamWithMembersDto) => (
        <Badge 
          variant={team.isActive ? 'success' : 'danger'} 
          size="sm"
        >
          {team.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'createdDate',
      title: 'Created',
      render: (team: TeamWithMembersDto) => (
        <span className="text-sm text-gray-500">
          {new Date(team.createdDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (team: TeamWithMembersDto) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEditTeam(team)}
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditingTeam(team);
              setShowAnalytics(true);
            }}
          >
            <BarChart3 className="h-3 w-3 mr-1" />
            Analytics
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditingTeam(team);
              setShowAssignmentPanel(true);
            }}
          >
            <UserPlus className="h-3 w-3 mr-1" />
            Members
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteTeam(team.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                Team Management
              </h1>
              <p className="mt-2 max-w-4xl text-sm text-gray-500">
                Create, manage, and monitor teams across the organization
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowTemplates(true)}
              >
                <Download className="h-4 w-4 mr-2" />
                Templates
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowHierarchy(true)}
              >
                <Network className="h-4 w-4 mr-2" />
                Hierarchy
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateTeam}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card variant="accent">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Teams</p>
                    <p className="text-2xl font-semibold text-gray-900">{statistics.totalTeams}</p>
                    <p className="text-xs text-gray-500">{statistics.activeTeams} active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BarChart3 className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Members</p>
                    <p className="text-2xl font-semibold text-gray-900">{statistics.totalMembers}</p>
                    <p className="text-xs text-gray-500">Avg {statistics.averageTeamSize.toFixed(1)} per team</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Target className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Evaluators</p>
                    <p className="text-2xl font-semibold text-gray-900">{statistics.totalEvaluators}</p>
                    <p className="text-xs text-gray-500">{statistics.teamsWithEvaluators} teams covered</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Unassigned Teams</p>
                    <p className="text-2xl font-semibold text-gray-900">{statistics.teamsWithoutEvaluators}</p>
                    <p className="text-xs text-gray-500">Need evaluators</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search teams..."
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
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                  ]}
                  className="w-40"
                />
                <Select
                  value={departmentFilter}
                  onChange={(value) => setDepartmentFilter(value.toString())}
                  options={[
                    { value: '', label: 'All Departments' },
                    { value: '1', label: 'IT' },
                    { value: '2', label: 'HR' },
                    { value: '3', label: 'Finance' },
                  ]}
                  className="w-40"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {viewMode === 'table' ? 'Card View' : 'Table View'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExportData}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBulkOperation}
                  disabled={selectedTeams.length === 0}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Bulk Operations
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleMemberTransfer}
                  disabled={selectedTeams.length !== 2}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Transfer Members
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teams Table/Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Teams ({filteredTeams.length})</span>
              <div className="flex items-center space-x-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowGoals(true)}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Team Goals
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAnnouncements(true)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Announcements
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viewMode === 'table' ? (
              <DataTable
                data={filteredTeams}
                columns={columns}
                loading={loading}
                selectable
                selectedItems={selectedTeams}
                onSelectionChange={setSelectedTeams}
                keyField="id"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeams.map((team) => (
                  <Card key={team.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{team.name}</h3>
                            <p className="text-sm text-gray-500">{team.departmentName || 'No Department'}</p>
                          </div>
                        </div>
                        <Badge variant={team.isActive ? 'success' : 'danger'} size="sm">
                          {team.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">{team.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">{team.memberCount}</p>
                            <p className="text-xs text-gray-500">Members</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">{team.evaluatorCount}</p>
                            <p className="text-xs text-gray-500">Evaluators</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleEditTeam(team)}
                          className="flex-1"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setEditingTeam(team);
                            setShowAnalytics(true);
                          }}
                        >
                          <BarChart3 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteTeam(team.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {showTeamForm && (
        <TeamFormModal
          team={editingTeam}
          onClose={() => setShowTeamForm(false)}
          onSaved={handleTeamSaved}
        />
      )}

      {showAnalytics && editingTeam && (
        <TeamAnalyticsModal
          team={editingTeam}
          onClose={() => {
            setShowAnalytics(false);
            setEditingTeam(null);
          }}
        />
      )}

      {showHierarchy && (
        <TeamHierarchyModal
          onClose={() => setShowHierarchy(false)}
        />
      )}

      {showBulkOperations && (
        <BulkOperationsModal
          selectedTeams={selectedTeams}
          onClose={() => setShowBulkOperations(false)}
          onSuccess={() => {
            setShowBulkOperations(false);
            setSelectedTeams([]);
            loadData();
          }}
        />
      )}

      {showMemberTransfer && (
        <MemberTransferModal
          selectedTeams={selectedTeams}
          onClose={() => setShowMemberTransfer(false)}
          onSuccess={() => {
            setShowMemberTransfer(false);
            setSelectedTeams([]);
            loadData();
          }}
        />
      )}

      {showAssignmentPanel && editingTeam && (
        <TeamAssignmentPanel
          team={editingTeam}
          availableUsers={availableUsers}
          onClose={() => {
            setShowAssignmentPanel(false);
            setEditingTeam(null);
          }}
          onSuccess={() => {
            setShowAssignmentPanel(false);
            setEditingTeam(null);
            loadData();
          }}
        />
      )}

      {showTemplates && (
        <TeamTemplatesModal
          templates={templates}
          onClose={() => setShowTemplates(false)}
          onSuccess={() => {
            setShowTemplates(false);
            loadData();
          }}
        />
      )}

      {showGoals && (
        <TeamGoalsModal
          onClose={() => setShowGoals(false)}
          onSuccess={() => {
            setShowGoals(false);
            loadData();
          }}
        />
      )}

      {showAnnouncements && (
        <TeamAnnouncementsModal
          onClose={() => setShowAnnouncements(false)}
          onSuccess={() => {
            setShowAnnouncements(false);
            loadData();
          }}
        />
      )}
    </Container>
  );
};

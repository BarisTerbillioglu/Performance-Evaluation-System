import React, { useState, useEffect } from 'react';
import { Plus, Users, BarChart3, Network, Settings, Search } from 'lucide-react';
import { TeamWithMembersDto, TeamStatisticsDto } from '@/types';
import { teamService } from '@/services/teamService';
import { useUIStore } from '@/stores';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/form/Input';
import { Select } from '@/components/ui/form/Select';
import { Badge } from '@/components/ui/feedback/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Container } from '@/components/ui/layout/Container';
import { DataTable } from '@/components/ui/data/DataTable';
import { TeamFormModal } from './components/TeamFormModal';
import { TeamAnalyticsModal } from './components/TeamAnalyticsModal';
import { TeamHierarchyModal } from './components/TeamHierarchyModal';
import { BulkOperationsModal } from './components/BulkOperationsModal';
import { MemberTransferModal } from './components/MemberTransferModal';
import { EvaluatorAssignmentModal } from './components/EvaluatorAssignmentModal';

export const TeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<TeamWithMembersDto[]>([]);
  const [statistics, setStatistics] = useState<TeamStatisticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  
  // Modal states
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showHierarchy, setShowHierarchy] = useState(false);
  const [showBulkOperations, setShowBulkOperations] = useState(false);
  const [showMemberTransfer, setShowMemberTransfer] = useState(false);
  const [showEvaluatorAssignment, setShowEvaluatorAssignment] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamWithMembersDto | null>(null);

  const { showNotification } = useUIStore();

  useEffect(() => {
    loadTeams();
    loadStatistics();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await teamService.getTeamsWithMembers();
      setTeams(data);
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load teams',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const data = await teamService.getTeamStatistics();
      setStatistics(data);
    } catch (error) {
      console.error('Failed to load team statistics:', error);
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
    loadTeams();
    showNotification({
      type: 'success',
      title: 'Success',
      message: 'Team saved successfully',
    });
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
        <div>
          <div className="font-medium text-gray-900">{team.name}</div>
          <div className="text-sm text-gray-500">{team.description}</div>
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
      key: 'actions',
      title: 'Actions',
      render: (team: TeamWithMembersDto) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEditTeam(team)}
          >
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
            Analytics
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditingTeam(team);
              setShowEvaluatorAssignment(true);
            }}
          >
            Assign Evaluator
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
                Manage teams, assign members, and track performance
              </p>
            </div>
            <div className="flex items-center space-x-3">
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
            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Teams</p>
                  <p className="text-2xl font-semibold text-gray-900">{statistics.totalTeams}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Teams</p>
                  <p className="text-2xl font-semibold text-gray-900">{statistics.activeTeams}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Members</p>
                  <p className="text-2xl font-semibold text-gray-900">{statistics.totalMembers}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Settings className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Evaluators</p>
                  <p className="text-2xl font-semibold text-gray-900">{statistics.totalEvaluators}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters and Actions */}
        <Card>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search teams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
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
            </div>
            <div className="flex items-center space-x-2">
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
                <Users className="h-4 w-4 mr-2" />
                Transfer Members
              </Button>
            </div>
          </div>
        </Card>

        {/* Teams Table */}
        <Card>
          <DataTable
            data={filteredTeams}
            columns={columns}
            loading={loading}
            selectable
            selectedItems={selectedTeams}
            onSelectionChange={setSelectedTeams}
            keyField="id"
          />
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
            loadTeams();
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
            loadTeams();
          }}
        />
      )}

      {showEvaluatorAssignment && editingTeam && (
        <EvaluatorAssignmentModal
          team={editingTeam}
          onClose={() => {
            setShowEvaluatorAssignment(false);
            setEditingTeam(null);
          }}
          onSuccess={() => {
            setShowEvaluatorAssignment(false);
            setEditingTeam(null);
            loadTeams();
          }}
        />
      )}
    </Container>
  );
};

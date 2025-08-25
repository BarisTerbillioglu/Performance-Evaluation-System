import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Filter, 
  UserPlus, 
  UserMinus, 
  Users, 
  ArrowRight, 
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building,
  User
} from 'lucide-react';
import { TeamWithMembersDto, AvailableUserDto } from '@/types';
import { teamService } from '@/services/teamService';
import { useUIStore } from '@/stores';
import { Button } from '@/components/design-system/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { Input } from '@/components/ui/form/Input';
import { Select } from '@/components/ui/form/Select';
import { Avatar } from '@/components/ui/feedback/Avatar';
import { Modal } from '@/components/ui/feedback/Modal';

export interface TeamAssignmentPanelProps {
  team: TeamWithMembersDto;
  availableUsers: AvailableUserDto[];
  onClose: () => void;
  onSuccess: () => void;
}

export const TeamAssignmentPanel: React.FC<TeamAssignmentPanelProps> = ({
  team,
  availableUsers,
  onClose,
  onSuccess,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedAvailableUsers, setSelectedAvailableUsers] = useState<number[]>([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { showNotification } = useUIStore();

  // Filter available users
  const filteredAvailableUsers = availableUsers.filter(user => {
    const matchesSearch = `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !departmentFilter || user.department === departmentFilter;
    const matchesRole = !roleFilter || user.role === roleFilter;
    
    return matchesSearch && matchesDepartment && matchesRole && user.isAvailable;
  });

  // Get unique departments and roles for filters
  const departments = Array.from(new Set(availableUsers.map(u => u.department)));
  const roles = Array.from(new Set(availableUsers.map(u => u.role)));

  const handleAddMembers = async () => {
    if (selectedAvailableUsers.length === 0) {
      showNotification({
        type: 'warning',
        title: 'Warning',
        message: 'Please select users to add to the team',
      });
      return;
    }

    setLoading(true);
    try {
      // Validate assignments
      const errors: string[] = [];
      
      for (const userId of selectedAvailableUsers) {
        const user = availableUsers.find(u => u.id === userId);
        if (user?.isEvaluator) {
          // Check if evaluator is trying to be added to their own team
          const validation = await teamService.validateTeamAssignment(team.id, userId);
          if (!validation.isValid) {
            errors.push(`${user.firstName} ${user.lastName}: ${validation.message}`);
          }
        }
      }

      if (errors.length > 0) {
        setValidationErrors(errors);
        setLoading(false);
        return;
      }

      // Add members to team
      await teamService.bulkTeamAssignment({
        teamId: team.id,
        userIds: selectedAvailableUsers,
        role: 'Member',
        isEvaluator: false
      });

      showNotification({
        type: 'success',
        title: 'Success',
        message: `${selectedAvailableUsers.length} members added to team`,
      });

      setSelectedAvailableUsers([]);
      onSuccess();
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add members to team',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMembers = async () => {
    if (selectedTeamMembers.length === 0) {
      showNotification({
        type: 'warning',
        title: 'Warning',
        message: 'Please select team members to remove',
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to remove ${selectedTeamMembers.length} members from the team?`)) {
      return;
    }

    setLoading(true);
    try {
      // Remove members from team
      for (const userId of selectedTeamMembers) {
        await teamService.removeTeamMember(team.id, userId);
      }

      showNotification({
        type: 'success',
        title: 'Success',
        message: `${selectedTeamMembers.length} members removed from team`,
      });

      setSelectedTeamMembers([]);
      onSuccess();
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to remove members from team',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (user: AvailableUserDto) => {
    if (user.currentTeamId) {
      return <Clock className="h-4 w-4 text-orange-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusBadge = (user: AvailableUserDto) => {
    if (user.currentTeamId) {
      return (
        <Badge variant="warning" size="sm">
          In Team: {user.currentTeamName}
        </Badge>
      );
    }
    return (
      <Badge variant="success" size="sm">
        Available
      </Badge>
    );
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Manage Team Members - ${team.name}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Team Info */}
        <Card variant="accent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{team.name}</h3>
                <p className="text-sm text-gray-500">{team.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{team.memberCount} Members</p>
                <p className="text-xs text-gray-500">{team.evaluatorCount} Evaluators</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Card variant="danger">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Assignment Conflicts</h4>
                  <ul className="mt-2 text-sm text-red-700 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={departmentFilter}
                onChange={(value) => setDepartmentFilter(value.toString())}
                options={[
                  { value: '', label: 'All Departments' },
                  ...departments.map(dept => ({ value: dept, label: dept }))
                ]}
                className="w-40"
              />
              <Select
                value={roleFilter}
                onChange={(value) => setRoleFilter(value.toString())}
                options={[
                  { value: '', label: 'All Roles' },
                  ...roles.map(role => ({ value: role, label: role }))
                ]}
                className="w-40"
              />
            </div>
          </CardContent>
        </Card>

        {/* Assignment Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Available Users ({filteredAvailableUsers.length})</span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddMembers}
                  disabled={selectedAvailableUsers.length === 0 || loading}
                  loading={loading}
                >
                  <ArrowRight className="h-4 w-4 mr-1" />
                  Add to Team
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredAvailableUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedAvailableUsers.includes(user.id)
                        ? 'bg-primary-50 border-primary-200'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedAvailableUsers(prev =>
                        prev.includes(user.id)
                          ? prev.filter(id => id !== user.id)
                          : [...prev, user.id]
                      );
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAvailableUsers.includes(user.id)}
                      onChange={() => {}}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <Avatar
                      src={user.avatar}
                      alt={`${user.firstName} ${user.lastName}`}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">{user.role}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{user.department}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(user)}
                      {getStatusBadge(user)}
                    </div>
                  </div>
                ))}
                {filteredAvailableUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No available users found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Team Members ({team.members.length})</span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleRemoveMembers}
                  disabled={selectedTeamMembers.length === 0 || loading}
                  loading={loading}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Remove from Team
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {team.members.map((member) => (
                  <div
                    key={member.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTeamMembers.includes(member.userId)
                        ? 'bg-red-50 border-red-200'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedTeamMembers(prev =>
                        prev.includes(member.userId)
                          ? prev.filter(id => id !== member.userId)
                          : [...prev, member.userId]
                      );
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTeamMembers.includes(member.userId)}
                      onChange={() => {}}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <div className="relative">
                      <Avatar
                        src={member.user.avatar}
                        alt={`${member.user.firstName} ${member.user.lastName}`}
                        size="sm"
                      />
                      {member.isEvaluator && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-bold">E</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.user.firstName} {member.user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{member.user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">{member.role}</span>
                        {member.isEvaluator && (
                          <>
                            <span className="text-xs text-gray-400">•</span>
                            <Badge variant="accent" size="xs">Evaluator</Badge>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge variant="success" size="sm">
                      Team Member
                    </Badge>
                  </div>
                ))}
                {team.members.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No team members</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onSuccess}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};

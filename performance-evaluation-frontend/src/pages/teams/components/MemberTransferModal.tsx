import React, { useState, useEffect } from 'react';
import { X, Users, ArrowRight, UserCheck, UserX } from 'lucide-react';
import { BulkMemberTransferRequest, TeamWithMembersDto, UserSummaryDto } from '@/types';
import { teamService } from '@/services/teamService';
import { useUIStore } from '@/stores';
import { Button } from '@/components/ui/button/Button';
import { Select } from '@/components/ui/form/Select';
import { Input } from '@/components/ui/form/Input';
import { Card } from '@/components/ui/layout/Card';
import { Badge } from '@/components/ui/feedback/Badge';

interface MemberTransferModalProps {
  selectedTeams: number[];
  onClose: () => void;
  onSuccess: () => void;
}

export const MemberTransferModal: React.FC<MemberTransferModalProps> = ({
  selectedTeams,
  onClose,
  onSuccess,
}) => {
  const [sourceTeam, setSourceTeam] = useState<TeamWithMembersDto | null>(null);
  const [targetTeam, setTargetTeam] = useState<TeamWithMembersDto | null>(null);
  const [teams, setTeams] = useState<TeamWithMembersDto[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [newRole, setNewRole] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const { showNotification } = useUIStore();

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (selectedTeams.length === 2) {
      const [sourceId, targetId] = selectedTeams;
      const source = teams.find(t => t.id === sourceId);
      const target = teams.find(t => t.id === targetId);
      setSourceTeam(source || null);
      setTargetTeam(target || null);
    }
  }, [selectedTeams, teams]);

  const loadTeams = async () => {
    try {
      const data = await teamService.getTeamsWithMembers();
      setTeams(data);
    } catch (error) {
      console.error('Failed to load teams:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sourceTeam || !targetTeam) {
      showNotification({
        type: 'warning',
        title: 'Warning',
        message: 'Please select source and target teams',
      });
      return;
    }

    if (selectedMembers.length === 0) {
      showNotification({
        type: 'warning',
        title: 'Warning',
        message: 'Please select members to transfer',
      });
      return;
    }

    try {
      setLoading(true);
      
      const request: BulkMemberTransferRequest = {
        sourceTeamId: sourceTeam.id,
        targetTeamId: targetTeam.id,
        userIds: selectedMembers,
        newRole: newRole || undefined,
      };

      const response = await teamService.bulkMemberTransfer(request);
      setResults(response.results || []);

      showNotification({
        type: 'success',
        title: 'Success',
        message: response.message || 'Members transferred successfully',
      });

      onSuccess();
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to transfer members',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMemberToggle = (userId: number) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllMembers = () => {
    if (sourceTeam) {
      const memberIds = sourceTeam.members.map(m => m.userId);
      setSelectedMembers(memberIds);
    }
  };

  const deselectAllMembers = () => {
    setSelectedMembers([]);
  };

  const getMemberRole = (userId: number) => {
    const member = sourceTeam?.members.find(m => m.userId === userId);
    return member?.role || 'Member';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Transfer Team Members
              </h2>
              <p className="text-sm text-gray-500">
                Move members between teams
              </p>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Team Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Source Team */}
            <Card>
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Source Team</h4>
                {sourceTeam ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{sourceTeam.name}</span>
                      <Badge variant={sourceTeam.isActive ? 'success' : 'danger'} size="sm">
                        {sourceTeam.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">{sourceTeam.description}</p>
                    <div className="text-xs text-gray-500">
                      {sourceTeam.memberCount} members
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No source team selected</div>
                )}
              </div>
            </Card>

            {/* Arrow */}
            <div className="flex items-center justify-center">
              <ArrowRight className="h-8 w-8 text-gray-400" />
            </div>

            {/* Target Team */}
            <Card>
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Target Team</h4>
                {targetTeam ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{targetTeam.name}</span>
                      <Badge variant={targetTeam.isActive ? 'success' : 'danger'} size="sm">
                        {targetTeam.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">{targetTeam.description}</p>
                    <div className="text-xs text-gray-500">
                      {targetTeam.memberCount} members
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No target team selected</div>
                )}
              </div>
            </Card>
          </div>

          {/* Member Selection */}
          {sourceTeam && (
            <Card>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-900">Select Members to Transfer</h4>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={selectAllMembers}
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={deselectAllMembers}
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Deselect All
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {sourceTeam.members.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No members in source team
                    </div>
                  ) : (
                    sourceTeam.members.map(member => (
                      <div
                        key={member.userId}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedMembers.includes(member.userId)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleMemberToggle(member.userId)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">
                                {member.user.firstName.charAt(0)}{member.user.lastName.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {member.user.firstName} {member.user.lastName}
                            </div>
                            <div className="text-xs text-gray-500">{member.user.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="default" size="sm">
                            {member.role}
                          </Badge>
                          {member.isEvaluator && (
                            <Badge variant="success" size="sm">
                              Evaluator
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {selectedMembers.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-900">
                      {selectedMembers.length} member(s) selected for transfer
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* New Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Role (Optional)
            </label>
            <Input
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder="Enter new role for transferred members"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to keep current roles
            </p>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <Card>
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Transfer Results
                </h4>
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">
                        User {result.userId}: {result.success ? 'Transferred' : 'Failed'}
                      </span>
                      <Badge
                        variant={result.success ? 'success' : 'danger'}
                        size="sm"
                      >
                        {result.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !sourceTeam || !targetTeam || selectedMembers.length === 0}
              className="flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>Transfer Members</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

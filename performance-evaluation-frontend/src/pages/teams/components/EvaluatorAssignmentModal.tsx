import React, { useState, useEffect } from 'react';
import { X, Users, UserPlus, UserMinus, Search } from 'lucide-react';
import { TeamWithMembersDto, UserSummaryDto, AssignEvaluatorRequest } from '@/types';
import { teamService } from '@/services/teamService';
import { useUIStore } from '@/stores';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/form/Input';
import { Select } from '@/components/ui/form/Select';
import { Card } from '@/components/ui/layout/Card';
import { Badge } from '@/components/ui/feedback/Badge';

interface EvaluatorAssignmentModalProps {
  team: TeamWithMembersDto;
  onClose: () => void;
  onSuccess: () => void;
}

export const EvaluatorAssignmentModal: React.FC<EvaluatorAssignmentModalProps> = ({
  team,
  onClose,
  onSuccess,
}) => {
  const [availableEvaluators, setAvailableEvaluators] = useState<UserSummaryDto[]>([]);
  const [currentEvaluators, setCurrentEvaluators] = useState<UserSummaryDto[]>([]);
  const [selectedEvaluator, setSelectedEvaluator] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const { showNotification } = useUIStore();

  useEffect(() => {
    loadEvaluators();
  }, [team.id]);

  const loadEvaluators = async () => {
    try {
      setLoading(true);
      
      // Load available evaluators
      const available = await teamService.getAvailableEvaluators(team.id);
      setAvailableEvaluators(available);
      
      // Get current evaluators from team members
      const evaluators = team.members
        .filter(member => member.isEvaluator)
        .map(member => member.user);
      setCurrentEvaluators(evaluators);
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load evaluators',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignEvaluator = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEvaluator) {
      showNotification({
        type: 'warning',
        title: 'Warning',
        message: 'Please select an evaluator',
      });
      return;
    }

    try {
      setLoading(true);
      
      const request: AssignEvaluatorRequest = {
        userId: parseInt(selectedEvaluator),
        role: role || 'Evaluator',
      };

      await teamService.assignEvaluator(team.id, request);

      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Evaluator assigned successfully',
      });

      // Reset form and reload data
      setSelectedEvaluator('');
      setRole('');
      await loadEvaluators();
      onSuccess();
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to assign evaluator',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveEvaluator = async (userId: number) => {
    try {
      setLoading(true);
      
      await teamService.removeUserFromTeam(team.id, userId);

      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Evaluator removed successfully',
      });

      await loadEvaluators();
      onSuccess();
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to remove evaluator',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAvailableEvaluators = availableEvaluators.filter(evaluator =>
    evaluator.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evaluator.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evaluator.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEvaluatorRole = (userId: number) => {
    const member = team.members.find(m => m.userId === userId);
    return member?.role || 'Evaluator';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Evaluator Assignment
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
          {/* Team Info */}
          <Card>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{team.name}</h3>
                  <p className="text-sm text-gray-500">{team.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{team.memberCount}</div>
                  <div className="text-sm text-gray-500">Total Members</div>
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">{team.evaluatorCount} Evaluators</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600">{team.employeeCount} Employees</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Evaluators */}
            <Card>
              <div className="p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Current Evaluators</h4>
                
                {currentEvaluators.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p>No evaluators assigned to this team</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentEvaluators.map(evaluator => (
                      <div
                        key={evaluator.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-green-600">
                              {evaluator.firstName.charAt(0)}{evaluator.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {evaluator.firstName} {evaluator.lastName}
                            </div>
                            <div className="text-xs text-gray-500">{evaluator.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="success" size="sm">
                            {getEvaluatorRole(evaluator.id)}
                          </Badge>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemoveEvaluator(evaluator.id)}
                            disabled={loading}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Assign New Evaluator */}
            <Card>
              <div className="p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Assign New Evaluator</h4>
                
                <form onSubmit={handleAssignEvaluator} className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search evaluators..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Evaluator Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Evaluator *
                    </label>
                    <Select
                      value={selectedEvaluator}
                      onChange={setSelectedEvaluator}
                      options={[
                        { value: '', label: 'Choose an evaluator' },
                        ...filteredAvailableEvaluators.map(evaluator => ({
                          value: evaluator.id.toString(),
                          label: `${evaluator.firstName} ${evaluator.lastName} (${evaluator.email})`,
                        })),
                      ]}
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <Input
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Enter role (e.g., Lead Evaluator, Senior Evaluator)"
                    />
                  </div>

                  {/* Available Evaluators List */}
                  {searchTerm && filteredAvailableEvaluators.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Available Evaluators</h5>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {filteredAvailableEvaluators.map(evaluator => (
                          <div
                            key={evaluator.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                            onClick={() => setSelectedEvaluator(evaluator.id.toString())}
                          >
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-blue-600">
                                  {evaluator.firstName.charAt(0)}{evaluator.lastName.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {evaluator.firstName} {evaluator.lastName}
                                </div>
                                <div className="text-xs text-gray-500">{evaluator.email}</div>
                              </div>
                            </div>
                            {selectedEvaluator === evaluator.id.toString() && (
                              <Badge variant="success" size="sm">Selected</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading || !selectedEvaluator}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Assign Evaluator</span>
                  </Button>
                </form>
              </div>
            </Card>
          </div>

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

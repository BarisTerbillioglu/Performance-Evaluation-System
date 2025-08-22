import React, { useState, useEffect } from 'react';
import { X, Save, Users } from 'lucide-react';
import { TeamWithMembersDto, CreateTeamRequest, UpdateTeamRequest, DepartmentDto } from '@/types';
import { teamService } from '@/services/teamService';
import { useUIStore } from '@/stores';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/form/Input';
import { Select } from '@/components/ui/form/Select';
import { TextArea } from '@/components/ui/form/TextArea';


interface TeamFormModalProps {
  team?: TeamWithMembersDto | null;
  onClose: () => void;
  onSaved: () => void;
}

export const TeamFormModal: React.FC<TeamFormModalProps> = ({
  team,
  onClose,
  onSaved,
}) => {
  const [formData, setFormData] = useState<CreateTeamRequest>({
    name: '',
    description: '',
    parentTeamId: undefined,
    departmentId: undefined,
  });
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [teams, setTeams] = useState<TeamWithMembersDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { showNotification } = useUIStore();
  const isEditing = !!team;

  useEffect(() => {
    loadFormData();
    loadDepartments();
    loadTeams();
  }, [team]);

  const loadFormData = () => {
    if (team) {
      setFormData({
        name: team.name,
        description: team.description,
        parentTeamId: team.parentTeamId,
        departmentId: team.departmentId,
      });
    }
  };

  const loadDepartments = async () => {
    try {
      // This would come from departmentService
      const deptData = await fetch('/api/department').then(res => res.json());
      setDepartments(deptData);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const loadTeams = async () => {
    try {
      const teamsData = await teamService.getTeamsWithMembers();
      setTeams(teamsData);
    } catch (error) {
      console.error('Failed to load teams:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Team description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      if (isEditing && team) {
        const updateData: UpdateTeamRequest = {
          name: formData.name,
          description: formData.description,
          parentTeamId: formData.parentTeamId,
          departmentId: formData.departmentId,
        };
        await teamService.updateTeam(team.id, updateData);
      } else {
        await teamService.createTeam(formData);
      }

      showNotification({
        type: 'success',
        title: 'Success',
        message: `Team ${isEditing ? 'updated' : 'created'} successfully`,
      });
      
      onSaved();
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: `Failed to ${isEditing ? 'update' : 'create'} team`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateTeamRequest, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Team' : 'Create New Team'}
            </h2>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter team name"
                error={errors.name}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                placeholder="Enter team description"
                rows={3}
                error={errors.description}
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <Select
                value={formData.departmentId?.toString() || ''}
                onChange={(value) => handleInputChange('departmentId', value ? parseInt(value.toString()) : undefined)}
                options={[
                  { value: '', label: 'Select Department' },
                  ...departments.map(dept => ({
                    value: dept.id.toString(),
                    label: dept.name,
                  })),
                ]}
              />
            </div>

            {/* Parent Team */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Team
              </label>
              <Select
                value={formData.parentTeamId?.toString() || ''}
                onChange={(value) => handleInputChange('parentTeamId', value ? parseInt(value.toString()) : undefined)}
                options={[
                  { value: '', label: 'No Parent Team' },
                  ...teams
                    .filter(t => !isEditing || t.id !== team?.id) // Exclude current team when editing
                    .map(team => ({
                      value: team.id.toString(),
                      label: team.name,
                    })),
                ]}
              />
            </div>
          </div>

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
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{isEditing ? 'Update Team' : 'Create Team'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  PencilIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Card } from '@/components/design-system/Card';
import { useUIStore } from '@/stores';
import { userService } from '@/services/userService';
import { UserWithDetailsDto } from '@/types';
import { formatFullName } from '@/utils';

interface UserProfileModalProps {
  userId: number;
  onEdit?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ userId, onEdit }) => {
  const { hideModal, showNotification } = useUIStore();
  const [user, setUser] = useState<UserWithDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'evaluations' | 'teams' | 'activity'>('overview');

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await userService.getUserById(userId);
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load user profile'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    hideModal();
  };

  const handleEdit = () => {
    onEdit?.();
    handleClose();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
        <span className="ml-3 text-gray-600">Loading user profile...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">User not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The user you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: UserCircleIcon },
    { id: 'evaluations', name: 'Evaluations', icon: ChartBarIcon },
    { id: 'teams', name: 'Teams', icon: UserGroupIcon },
    { id: 'activity', name: 'Activity', icon: ClockIcon }
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={formatFullName(user.firstName, user.lastName)}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <UserCircleIcon className="h-12 w-12 text-primary-600" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {formatFullName(user.firstName, user.lastName)}
            </h2>
            <p className="text-gray-600">{user.jobTitle || 'No job title'}</p>
            <div className="flex items-center mt-2 space-x-2">
              <Badge variant={user.isActive ? 'success' : 'error'} size="sm">
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <span className="text-sm text-gray-500">
                Member since {new Date(user.createdDate).toLocaleDateString('tr-TR')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            onClick={handleEdit}
            leftIcon={<PencilIcon className="w-4 h-4" />}
          >
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                
                {user.phoneNumber && (
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <p className="text-sm text-gray-600">{user.phoneNumber}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-3">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Department</p>
                    <p className="text-sm text-gray-600">{user.departmentName}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Created</p>
                    <p className="text-sm text-gray-600">
                      {new Date(user.createdDate).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Roles and Permissions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Roles & Permissions</h3>
              <div className="space-y-3">
                {user.roles.map((role, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ShieldCheckIcon className="h-5 w-5 text-primary-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{role.roleName}</p>
                        {role.description && (
                          <p className="text-xs text-gray-500">{role.description}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="primary" size="sm">
                      {role.roleType}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Account Statistics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-primary-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">
                    {user.teams?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Teams</div>
                </div>
                <div className="text-center p-4 bg-success-50 rounded-lg">
                  <div className="text-2xl font-bold text-success-600">
                    {user.isActive ? 'Active' : 'Inactive'}
                  </div>
                  <div className="text-sm text-gray-600">Status</div>
                </div>
                <div className="text-center p-4 bg-info-50 rounded-lg">
                  <div className="text-2xl font-bold text-info-600">
                    {user.roles?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Roles</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'evaluations' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluation History</h3>
              <div className="text-center py-8">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No evaluations yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Evaluation history will appear here once evaluations are completed.
                </p>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Memberships</h3>
              {user.teams && user.teams.length > 0 ? (
                <div className="space-y-3">
                  {user.teams.map((team, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <UserGroupIcon className="h-5 w-5 text-primary-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{team.teamName}</p>
                          <p className="text-xs text-gray-500">Role: {team.role}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" size="sm">
                        Member
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No team memberships</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This user is not currently a member of any teams.
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="text-center py-8">
                <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Activity log will appear here once the user performs actions in the system.
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          variant="secondary"
          onClick={handleClose}
        >
          Close
        </Button>
        <Button
          onClick={handleEdit}
          leftIcon={<PencilIcon className="w-4 h-4" />}
        >
          Edit User
        </Button>
      </div>
    </div>
  );
};

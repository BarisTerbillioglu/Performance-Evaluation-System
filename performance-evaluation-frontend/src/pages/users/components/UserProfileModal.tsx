import React, { useState, useEffect } from 'react';
import { 
  PencilIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/feedback';
import { Card } from '@/components/ui/layout';
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
    hideModal('view-user');
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
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={formatFullName(user.firstName, user.lastName)}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <UserCircleIcon className="h-10 w-10 text-primary-600" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {formatFullName(user.firstName, user.lastName)}
            </h2>
            <p className="text-gray-600">{user.jobTitle || 'No job title'}</p>
            <div className="flex items-center mt-2">
              <Badge variant={user.isActive ? 'success' : 'error'}>
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>
        <Button onClick={handleEdit} leftIcon={<PencilIcon className="w-4 h-4" />}>
          Edit Profile
        </Button>
      </div>

      {/* Contact Information */}
      <Card title="Contact Information" className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3">
            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
          </div>
          
          {user.phoneNumber && (
            <div className="flex items-center space-x-3">
              <PhoneIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{user.phoneNumber}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Department</p>
              <p className="font-medium text-gray-900">{user.departmentName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-medium text-gray-900">
                {new Date(user.createdDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Role Information */}
      <Card title="Role & Permissions" className="p-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
              <h4 className="text-sm font-medium text-gray-900">Assigned Roles</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {user.roles.map((role, index) => (
                <Badge 
                  key={index} 
                  variant="default"
                  className="flex items-center space-x-1"
                >
                  <span>{role.roleName}</span>
                  <span className="text-xs">(Role)</span>
                </Badge>
              ))}
            </div>
          </div>
          
          {user.roles.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <p>No roles assigned</p>
            </div>
          )}
        </div>
      </Card>

      {/* Team Memberships */}
      <Card title="Team Memberships" className="p-6">
        <div className="space-y-3">
          {user.teams.length > 0 ? (
            user.teams.map((team, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{team.teamName}</p>
                  <p className="text-sm text-gray-500">Role: {team.role}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p>Not a member of any teams</p>
            </div>
          )}
        </div>
      </Card>

      {/* Account Activity */}
      <Card title="Account Activity" className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Account Created</p>
              <p className="font-medium text-gray-900">
                {new Date(user.createdDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <ClockIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="font-medium text-gray-900">
                {new Date(user.updatedDate || user.createdDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button variant="outline" onClick={handleClose}>
          Close
        </Button>
        <Button onClick={handleEdit} leftIcon={<PencilIcon className="w-4 h-4" />}>
          Edit Profile
        </Button>
      </div>
    </div>
  );
};

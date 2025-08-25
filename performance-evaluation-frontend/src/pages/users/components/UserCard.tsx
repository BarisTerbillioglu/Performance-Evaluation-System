import React from 'react';
import { 
  PencilIcon, 
  EyeIcon, 
  UserPlusIcon, 
  UserMinusIcon, 
  TrashIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Card } from '@/components/design-system/Card';
import { UserSearchDto } from '@/types';
import { formatFullName } from '@/utils';

interface UserCardProps {
  user: UserSearchDto;
  selected: boolean;
  onSelect: (userId: number, selected: boolean) => void;
  onView: (user: UserSearchDto) => void;
  onEdit: (user: UserSearchDto) => void;
  onActivate: (user: UserSearchDto) => void;
  onDeactivate: (user: UserSearchDto) => void;
  onDelete: (user: UserSearchDto) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  selected,
  onSelect,
  onView,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete
}) => {
  const getRoleColor = (role: string) => {
    const roleColors = {
      'Admin': 'error',
      'Manager': 'info',
      'Evaluator': 'success',
      'Employee': 'default'
    } as const;
    
    return roleColors[role as keyof typeof roleColors] || 'default';
  };

  return (
    <Card className={`p-4 transition-all duration-200 ${selected ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:shadow-md'}`}>
      <div className="flex items-start space-x-3">
        {/* Avatar and Selection */}
        <div className="flex flex-col items-center space-y-2">
          <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-700">
            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
          </div>
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(user.id, e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {formatFullName(user.firstName, user.lastName)}
              </h3>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
              <p className="text-sm text-gray-600 font-medium">{user.departmentName}</p>
            </div>
            
            {/* Status Badge */}
            <Badge variant={user.isActive ? 'success' : 'error'} size="sm">
              {user.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Roles */}
          <div className="mt-2 flex flex-wrap gap-1">
            {user.roles.map((role, index) => (
              <Badge 
                key={index} 
                variant={getRoleColor(role)} 
                size="sm"
              >
                {role}
              </Badge>
            ))}
          </div>

          {/* Created Date */}
          <p className="mt-2 text-xs text-gray-500">
            Created: {new Date(user.createdDate).toLocaleDateString('tr-TR')}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(user)}
            title="View Profile"
          >
            <EyeIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(user)}
            title="Edit User"
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => user.isActive ? onDeactivate(user) : onActivate(user)}
            title={user.isActive ? 'Deactivate' : 'Activate'}
          >
            {user.isActive ? (
              <UserMinusIcon className="w-4 h-4 text-red-600" />
            ) : (
              <UserPlusIcon className="w-4 h-4 text-green-600" />
            )}
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(user)}
          title="Delete User"
        >
          <TrashIcon className="w-4 h-4 text-red-600" />
        </Button>
      </div>
    </Card>
  );
};

import React, { useState } from 'react';
import { 
  UserPlusIcon, 
  UserMinusIcon, 
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/feedback';
import { useUIStore } from '@/stores';
import { userService } from '@/services/userService';
import { UserSearchDto } from '@/types';
import { formatFullName } from '@/utils';

interface BulkActionsModalProps {
  selectedUserIds: (string | number)[];
  selectedUsers: UserSearchDto[];
  onSuccess?: () => void;
}

type BulkAction = 'activate' | 'deactivate' | 'delete' | null;

export const BulkActionsModal: React.FC<BulkActionsModalProps> = ({ 
  selectedUserIds, 
  selectedUsers, 
  onSuccess 
}) => {
  const { hideModal, showNotification } = useUIStore();
  const [selectedAction, setSelectedAction] = useState<BulkAction>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'confirm' | 'processing' | 'complete'>('select');
  const [results, setResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  }>({ success: 0, failed: 0, errors: [] });

  const handleClose = () => {
    hideModal('bulk-actions');
  };

  const handleActionSelect = (action: BulkAction) => {
    setSelectedAction(action);
    setStep('confirm');
  };

  const handleBack = () => {
    setSelectedAction(null);
    setStep('select');
  };

  const getActionInfo = (action: BulkAction) => {
    switch (action) {
      case 'activate':
        return {
          title: 'Activate Users',
          description: 'Activate selected users to allow them to log in',
          icon: UserPlusIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          buttonColor: 'bg-green-600 hover:bg-green-700'
        };
      case 'deactivate':
        return {
          title: 'Deactivate Users',
          description: 'Deactivate selected users to prevent them from logging in',
          icon: UserMinusIcon,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case 'delete':
        return {
          title: 'Delete Users',
          description: 'Permanently delete selected users. This action cannot be undone.',
          icon: TrashIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          buttonColor: 'bg-red-600 hover:bg-red-700'
        };
      default:
        return null;
    }
  };

  const executeBulkAction = async () => {
    if (!selectedAction) return;

    setLoading(true);
    setStep('processing');
    
    const results = { success: 0, failed: 0, errors: [] as string[] };

    try {
      for (const userId of selectedUserIds) {
        try {
          const numericUserId = typeof userId === 'string' ? parseInt(userId) : userId;
          
          switch (selectedAction) {
            case 'activate':
              await userService.activateUser(numericUserId);
              break;
            case 'deactivate':
              await userService.deactivateUser(numericUserId);
              break;
            case 'delete':
              await userService.deleteUser(numericUserId);
              break;
          }
          results.success++;
        } catch (error: any) {
          results.failed++;
          const user = selectedUsers.find(u => u.id === userId);
          const userName = user ? formatFullName(user.firstName, user.lastName) : `User ${userId}`;
          results.errors.push(`${userName}: ${error.response?.data?.message || 'Unknown error'}`);
        }
      }

      setResults(results);
      setStep('complete');

      if (results.success > 0) {
        onSuccess?.();
      }

    } catch (error) {
      console.error('Bulk action failed:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Bulk action failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const activeUsers = selectedUsers.filter(user => user.isActive);
  const inactiveUsers = selectedUsers.filter(user => !user.isActive);

  if (step === 'select') {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Bulk Actions
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Select an action to perform on {selectedUsers.length} selected users
          </p>
          
          {/* Selected Users Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Selected Users:</span>
              <Badge variant="secondary">{selectedUsers.length}</Badge>
            </div>
            <div className="flex space-x-4 text-sm">
              <span className="text-green-600">{activeUsers.length} Active</span>
              <span className="text-red-600">{inactiveUsers.length} Inactive</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {/* Activate Users */}
          {inactiveUsers.length > 0 && (
            <button
              onClick={() => handleActionSelect('activate')}
              className="w-full p-4 text-left border-2 border-green-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <UserPlusIcon className="h-6 w-6 text-green-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Activate Users</h4>
                  <p className="text-sm text-gray-500">
                    Activate {inactiveUsers.length} inactive users
                  </p>
                </div>
              </div>
            </button>
          )}

          {/* Deactivate Users */}
          {activeUsers.length > 0 && (
            <button
              onClick={() => handleActionSelect('deactivate')}
              className="w-full p-4 text-left border-2 border-yellow-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <UserMinusIcon className="h-6 w-6 text-yellow-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Deactivate Users</h4>
                  <p className="text-sm text-gray-500">
                    Deactivate {activeUsers.length} active users
                  </p>
                </div>
              </div>
            </button>
          )}

          {/* Delete Users */}
          <button
            onClick={() => handleActionSelect('delete')}
            className="w-full p-4 text-left border-2 border-red-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <TrashIcon className="h-6 w-6 text-red-600" />
              <div>
                <h4 className="font-medium text-gray-900">Delete Users</h4>
                <p className="text-sm text-gray-500">
                  Permanently delete all {selectedUsers.length} selected users
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'confirm') {
    const actionInfo = getActionInfo(selectedAction);
    if (!actionInfo) return null;

    const Icon = actionInfo.icon;

    return (
      <div className="space-y-6">
        <div className={`p-4 rounded-lg border ${actionInfo.bgColor} ${actionInfo.borderColor}`}>
          <div className="flex items-center space-x-3">
            <Icon className={`h-6 w-6 ${actionInfo.color}`} />
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {actionInfo.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {actionInfo.description}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            This action will affect the following users:
          </h4>
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
            {selectedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">
                    {formatFullName(user.firstName, user.lastName)}
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <Badge variant={user.isActive ? 'success' : 'error'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {selectedAction === 'delete' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              <p className="text-sm font-medium text-red-800">Warning</p>
            </div>
            <p className="text-sm text-red-700 mt-1">
              This action cannot be undone. All user data, including evaluations and comments, will be permanently deleted.
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={handleBack} disabled={loading}>
            Back
          </Button>
          <Button
            onClick={executeBulkAction}
            disabled={loading}
            className={actionInfo.buttonColor}
          >
            {loading ? 'Processing...' : `Confirm ${actionInfo.title}`}
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-600 border-t-transparent mx-auto mb-4"></div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Processing Bulk Action
        </h3>
        <p className="text-gray-500">
          Please wait while we process your request...
        </p>
      </div>
    );
  }

  if (step === 'complete') {
    const actionInfo = getActionInfo(selectedAction);
    if (!actionInfo) return null;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Bulk Action Complete
          </h3>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{results.success}</div>
              <div className="text-sm text-gray-600">Successful</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{results.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </div>
        </div>

        {results.errors.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Errors:</h4>
            <div className="max-h-32 overflow-y-auto bg-red-50 border border-red-200 rounded-lg p-3">
              {results.errors.map((error, index) => (
                <p key={index} className="text-sm text-red-700 mb-1 last:mb-0">
                  {error}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button onClick={handleClose}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

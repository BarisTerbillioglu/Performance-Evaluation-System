import React, { useState, useEffect } from 'react';
import { ReportShare, ReportPermission } from '@/types/reports';
import { reportService } from '@/services/reportService';
import { 
  ShareIcon, 
  UserIcon, 
  UserGroupIcon,
  BuildingOfficeIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  PlusIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface ReportSharingProps {
  reportId: string;
  reportName: string;
  onClose: () => void;
}

export const ReportSharing: React.FC<ReportSharingProps> = ({
  reportId,
  reportName,
  onClose
}) => {
  const [shares, setShares] = useState<ReportShare[]>([]);
  const [permissions, setPermissions] = useState<ReportPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  useEffect(() => {
    loadShares();
    loadPermissions();
  }, [reportId]);

  const loadShares = async () => {
    try {
      setLoading(true);
      const data = await reportService.getShares(reportId);
      setShares(data);
    } catch (error) {
      console.error('Failed to load shares:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      // This would typically come from the report definition
      // For now, using mock data
      setPermissions([
        {
          id: '1',
          userId: 'user1',
          permission: 'view',
          grantedBy: 'admin',
          grantedAt: new Date().toISOString()
        },
        {
          id: '2',
          roleId: 'role1',
          permission: 'edit',
          grantedBy: 'admin',
          grantedAt: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Failed to load permissions:', error);
    }
  };

  const createShare = async (share: Partial<ReportShare>) => {
    try {
      const newShare = await reportService.shareReport(reportId, share);
      setShares(prev => [...prev, newShare]);
      setShowShareModal(false);
    } catch (error) {
      console.error('Failed to create share:', error);
    }
  };

  const updateShare = async (shareId: string, updates: Partial<ReportShare>) => {
    try {
      const updatedShare = await reportService.updateShare(shareId, updates);
      setShares(prev => 
        prev.map(share => share.id === shareId ? updatedShare : share)
      );
    } catch (error) {
      console.error('Failed to update share:', error);
    }
  };

  const deleteShare = async (shareId: string) => {
    try {
      await reportService.deleteShare(shareId);
      setShares(prev => prev.filter(share => share.id !== shareId));
    } catch (error) {
      console.error('Failed to delete share:', error);
    }
  };

  const getPermissionIcon = (type: 'user' | 'role' | 'department') => {
    switch (type) {
      case 'user':
        return <UserIcon className="w-4 h-4" />;
      case 'role':
        return <UserGroupIcon className="w-4 h-4" />;
      case 'department':
        return <BuildingOfficeIcon className="w-4 h-4" />;
      default:
        return <UserIcon className="w-4 h-4" />;
    }
  };

  const getPermissionType = (permission: ReportPermission) => {
    if (permission.userId) return 'user';
    if (permission.roleId) return 'role';
    if (permission.departmentId) return 'department';
    return 'user';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Share Report</h2>
            <p className="text-sm text-gray-600">{reportName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Quick Share */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-medium text-gray-900">Quick Share</h3>
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <ShareIcon className="w-4 h-4" />
              <span>Share Report</span>
            </button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              Share this report with specific users, roles, or departments
            </p>
            <div className="flex items-center space-x-4">
              <input
                type="email"
                placeholder="Enter email address"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                <option value="view">View</option>
                <option value="download">Download</option>
              </select>
              <button className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Active Shares */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-900 mb-4">Active Shares</h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading shares...</p>
            </div>
          ) : shares.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShareIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No active shares</p>
              <p className="text-sm">Share the report to see active shares</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shares.map((share) => (
                <ShareItem
                  key={share.id}
                  share={share}
                  onUpdate={(updates) => updateShare(share.id, updates)}
                  onDelete={() => deleteShare(share.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Permissions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-medium text-gray-900">Permissions</h3>
            <button
              onClick={() => setShowPermissionModal(true)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add Permission</span>
            </button>
          </div>
          
          <div className="space-y-3">
            {permissions.map((permission) => (
              <PermissionItem
                key={permission.id}
                permission={permission}
                onUpdate={(updates) => {
                  const newPermissions = permissions.map(p => 
                    p.id === permission.id ? { ...p, ...updates } : p
                  );
                  setPermissions(newPermissions);
                }}
                onDelete={() => {
                  const newPermissions = permissions.filter(p => p.id !== permission.id);
                  setPermissions(newPermissions);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          onShare={createShare}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Permission Modal */}
      {showPermissionModal && (
        <PermissionModal
          onAdd={(permission) => {
            setPermissions(prev => [...prev, { ...permission, id: `perm_${Date.now()}` }]);
            setShowPermissionModal(false);
          }}
          onClose={() => setShowPermissionModal(false)}
        />
      )}
    </div>
  );
};

// Share Item Component
const ShareItem: React.FC<{
  share: ReportShare;
  onUpdate: (updates: Partial<ReportShare>) => void;
  onDelete: () => void;
}> = ({ share, onUpdate, onDelete }) => {
  const isExpired = share.expiresAt && new Date(share.expiresAt) < new Date();

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <UserIcon className="w-5 h-5 text-gray-600" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {share.sharedWith}
            </p>
            <p className="text-xs text-gray-500">
              Shared by {share.sharedBy} on {new Date(share.sharedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            isExpired 
              ? 'text-red-600 bg-red-100' 
              : 'text-green-600 bg-green-100'
          }`}>
            {isExpired ? 'Expired' : share.permission}
          </span>
          
          {share.expiresAt && (
            <span className="text-xs text-gray-500">
              Expires: {new Date(share.expiresAt).toLocaleDateString()}
            </span>
          )}
          
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
            title="Remove Share"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Permission Item Component
const PermissionItem: React.FC<{
  permission: ReportPermission;
  onUpdate: (updates: Partial<ReportPermission>) => void;
  onDelete: () => void;
}> = ({ permission, onUpdate, onDelete }) => {
  const getPermissionType = (permission: ReportPermission) => {
    if (permission.userId) return 'user';
    if (permission.roleId) return 'role';
    if (permission.departmentId) return 'department';
    return 'user';
  };

  const getPermissionIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <UserIcon className="w-4 h-4" />;
      case 'role':
        return <UserGroupIcon className="w-4 h-4" />;
      case 'department':
        return <BuildingOfficeIcon className="w-4 h-4" />;
      default:
        return <UserIcon className="w-4 h-4" />;
    }
  };

  const type = getPermissionType(permission);
  const identifier = permission.userId || permission.roleId || permission.departmentId;

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getPermissionIcon(type)}
          <div>
            <p className="text-sm font-medium text-gray-900">
              {identifier} ({type})
            </p>
            <p className="text-xs text-gray-500">
              Granted by {permission.grantedBy} on {new Date(permission.grantedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={permission.permission}
            onChange={(e) => onUpdate({ permission: e.target.value as any })}
            className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="view">View</option>
            <option value="edit">Edit</option>
            <option value="delete">Delete</option>
            <option value="share">Share</option>
            <option value="schedule">Schedule</option>
          </select>
          
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
            title="Remove Permission"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Share Modal Component
const ShareModal: React.FC<{
  onShare: (share: Partial<ReportShare>) => void;
  onClose: () => void;
}> = ({ onShare, onClose }) => {
  const [formData, setFormData] = useState({
    sharedWith: '',
    permission: 'view' as const,
    expiresAt: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onShare({
      ...formData,
      expiresAt: formData.expiresAt || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Share Report</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.sharedWith}
                onChange={(e) => setFormData(prev => ({ ...prev, sharedWith: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Permission
              </label>
              <select
                value={formData.permission}
                onChange={(e) => setFormData(prev => ({ ...prev, permission: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="view">View</option>
                <option value="download">Download</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expires At (Optional)
              </label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Share
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Permission Modal Component
const PermissionModal: React.FC<{
  onAdd: (permission: Partial<ReportPermission>) => void;
  onClose: () => void;
}> = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    type: 'user' as 'user' | 'role' | 'department',
    identifier: '',
    permission: 'view' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const permission: Partial<ReportPermission> = {
      permission: formData.permission,
      grantedBy: 'current_user'
    };

    switch (formData.type) {
      case 'user':
        permission.userId = formData.identifier;
        break;
      case 'role':
        permission.roleId = formData.identifier;
        break;
      case 'department':
        permission.departmentId = formData.identifier;
        break;
    }

    onAdd(permission);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Add Permission</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">User</option>
                <option value="role">Role</option>
                <option value="department">Department</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Identifier
              </label>
              <input
                type="text"
                required
                value={formData.identifier}
                onChange={(e) => setFormData(prev => ({ ...prev, identifier: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Enter ${formData.type} identifier`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Permission
              </label>
              <select
                value={formData.permission}
                onChange={(e) => setFormData(prev => ({ ...prev, permission: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="view">View</option>
                <option value="edit">Edit</option>
                <option value="delete">Delete</option>
                <option value="share">Share</option>
                <option value="schedule">Schedule</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Permission
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

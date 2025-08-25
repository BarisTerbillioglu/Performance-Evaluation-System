import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlusIcon, 
  UserGroupIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  UserPlusIcon,
  UserMinusIcon,
  FunnelIcon,
  ClockIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { DataTable, Column } from '@/components/ui/data';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Input, Select } from '@/components/ui/form';
import { Card } from '@/components/design-system/Card';
import { useUIStore } from '@/stores';
import { userService } from '@/services/userService';
import { departmentService } from '@/services/departmentService';
import { roleService } from '@/services/roleService';
import { 
  UserSearchDto, 
  UserSearchRequest, 
  DepartmentDto, 
  RoleDto
} from '@/types';
import { formatFullName } from '@/utils';
import { UserFormModal } from './components/UserFormModal';
import { UserProfileModal } from './components/UserProfileModal';
import { BulkActionsModal } from './components/BulkActionsModal';
import { ImportExportModal } from './components/ImportExportModal';
import { AuditTrailModal } from './components/AuditTrailModal';

interface UserListFilters {
  searchTerm: string;
  departmentId: number | null;
  roleId: number | null;
  isActive: boolean | null;
  dateRange: {
    start: string;
    end: string;
  } | null;
}

interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByDepartment: { departmentName: string; count: number }[];
  usersByRole: { roleName: string; count: number }[];
}

export const UserManagementPage: React.FC = () => {
  const { showNotification, showModal } = useUIStore();
  
  // State
  const [users, setUsers] = useState<UserSearchDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<(string | number)[]>([]);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  
  // Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // Filters
  const [filters, setFilters] = useState<UserListFilters>({
    searchTerm: '',
    departmentId: null,
    roleId: null,
    isActive: null,
    dateRange: null
  });
  
  // Filter panel visibility
  const [showFilters, setShowFilters] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadDepartments(),
        loadRoles(),
        loadStatistics()
      ]);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const searchRequest: UserSearchRequest = {
        searchTerm: filters.searchTerm || undefined,
        departmentId: filters.departmentId || undefined,
        roleId: filters.roleId || undefined,
        isActive: filters.isActive || undefined,
        page: pagination.current,
        pageSize: pagination.pageSize
      };

      const response = await userService.searchUsers(searchRequest);
      setUsers(response.data);
      setPagination(prev => ({ ...prev, total: response.totalCount }));
    } catch (error) {
      console.error('Failed to load users:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load users'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await departmentService.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const loadRoles = async () => {
    try {
      const data = await roleService.getRoles();
      setRoles(data);
    } catch (error) {
      console.error('Failed to load roles:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const data = await userService.getUserStatistics();
      setStatistics(data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof UserListFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 })); // Reset to first page
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      departmentId: null,
      roleId: null,
      isActive: null,
      dateRange: null
    });
  };

  // Handle user actions
  const handleAddUser = () => {
    showModal({
      type: 'custom',
      title: 'Add New User',
      size: 'lg',
      component: UserFormModal,
      props: {
        onSuccess: () => {
          loadUsers();
          loadStatistics();
          showNotification({
            type: 'success',
            title: 'Success',
            message: 'User created successfully'
          });
        }
      }
    });
  };

  const handleEditUser = (user: UserSearchDto) => {
    showModal({
      type: 'custom',
      title: 'Edit User',
      size: 'lg',
      component: UserFormModal,
      props: {
        user,
        onSuccess: () => {
          loadUsers();
          loadStatistics();
          showNotification({
            type: 'success',
            title: 'Success',
            message: 'User updated successfully'
          });
        }
      }
    });
  };

  const handleViewUser = (user: UserSearchDto) => {
    showModal({
      type: 'custom',
      title: 'User Profile',
      size: 'xl',
      component: UserProfileModal,
      props: {
        userId: user.id,
        onEdit: () => handleEditUser(user)
      }
    });
  };

  const handleDeleteUser = async (user: UserSearchDto) => {
    showModal({
      type: 'confirm',
      title: 'Delete User',
      content: `Are you sure you want to delete ${formatFullName(user.firstName, user.lastName)}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await userService.deleteUser(user.id);
          loadUsers();
          loadStatistics();
          showNotification({
            type: 'success',
            title: 'Success',
            message: 'User deleted successfully'
          });
        } catch (error) {
          showNotification({
            type: 'error',
            title: 'Error',
            message: 'Failed to delete user'
          });
          throw error;
        }
      }
    });
  };

  const handleActivateUser = async (user: UserSearchDto) => {
    try {
      await userService.activateUser(user.id);
      loadUsers();
      loadStatistics();
      showNotification({
        type: 'success',
        title: 'Success',
        message: `User ${formatFullName(user.firstName, user.lastName)} activated`
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to activate user'
      });
    }
  };

  const handleDeactivateUser = async (user: UserSearchDto) => {
    try {
      await userService.deactivateUser(user.id);
      loadUsers();
      loadStatistics();
      showNotification({
        type: 'success',
        title: 'Success',
        message: `User ${formatFullName(user.firstName, user.lastName)} deactivated`
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to deactivate user'
      });
    }
  };

  const handleBulkActions = () => {
    showModal({
      type: 'custom',
      title: 'Bulk Actions',
      size: 'md',
      component: BulkActionsModal,
      props: {
        selectedUserIds: selectedUsers,
        selectedUsers: users.filter(user => selectedUsers.includes(user.id)),
        onSuccess: () => {
          loadUsers();
          loadStatistics();
          setSelectedUsers([]);
        }
      }
    });
  };

  const handleImportExport = () => {
    showModal({
      type: 'custom',
      title: 'Import/Export Users',
      size: 'lg',
      component: ImportExportModal,
      props: {
        onImportSuccess: () => {
          loadUsers();
          loadStatistics();
          showNotification({
            type: 'success',
            title: 'Success',
            message: 'Users imported successfully'
          });
        }
      }
    });
  };

  const handleViewAuditTrail = () => {
    showModal({
      type: 'custom',
      title: 'User Management Audit Trail',
      size: 'xl',
      component: AuditTrailModal,
      props: {
        entityType: 'User',
        title: 'User Management Audit Trail'
      }
    });
  };

  const handleExportUsers = async () => {
    try {
      const blob = await userService.exportUsers({
        searchTerm: filters.searchTerm || undefined,
        departmentId: filters.departmentId || undefined,
        roleId: filters.roleId || undefined,
        isActive: filters.isActive || undefined,
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Users exported successfully'
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to export users'
      });
    }
  };

  // Table columns
  const columns: Column<Record<string, any>>[] = [
    {
      key: 'firstName',
      title: 'Name',
      sortable: true,
      render: (_, record) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-700">
            {record.firstName.charAt(0)}{record.lastName.charAt(0)}
          </div>
          <div className="ml-3">
            <div className="text-sm font-semibold text-gray-900">
              {formatFullName(record.firstName, record.lastName)}
            </div>
            <div className="text-sm text-gray-500">{record.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'departmentName',
      title: 'Department',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-900 font-medium">{value}</span>
      )
    },
    {
      key: 'roles',
      title: 'Roles',
      render: (roles: string[]) => (
        <div className="flex flex-wrap gap-1">
          {roles.map((role, index) => {
            const roleColors = {
              'Admin': 'error',
              'Manager': 'info',
              'Evaluator': 'success',
              'Employee': 'default'
            } as const;
            
            return (
              <Badge 
                key={index} 
                variant={roleColors[role as keyof typeof roleColors] || 'default'} 
                size="sm"
              >
                {role}
              </Badge>
            );
          })}
        </div>
      )
    },
    {
      key: 'isActive',
      title: 'Status',
      sortable: true,
      render: (isActive: boolean) => (
        <Badge variant={isActive ? 'success' : 'error'} size="sm">
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'createdDate',
      title: 'Created',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-900">
          {new Date(value).toLocaleDateString('tr-TR')}
        </span>
      )
    },
    {
      key: 'lastLoginDate',
      title: 'Last Login',
      render: (value) => (
        <span className="text-sm text-gray-500">
          {value ? new Date(value).toLocaleDateString('tr-TR') : 'Never'}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '140px',
      render: (_, record) => (
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewUser(record as UserSearchDto)}
            title="View Profile"
          >
            <EyeIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditUser(record as UserSearchDto)}
            title="Edit User"
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => record.isActive ? handleDeactivateUser(record as UserSearchDto) : handleActivateUser(record as UserSearchDto)}
            title={record.isActive ? 'Deactivate' : 'Activate'}
          >
            {record.isActive ? (
              <UserMinusIcon className="w-4 h-4 text-red-600" />
            ) : (
              <UserPlusIcon className="w-4 h-4 text-green-600" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteUser(record as UserSearchDto)}
            title="Delete User"
          >
            <TrashIcon className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      )
    }
  ];

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.departmentId) count++;
    if (filters.roleId) count++;
    if (filters.isActive !== null) count++;
    if (filters.dateRange) count++;
    return count;
  }, [filters]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              User Management
            </h1>
            <p className="mt-2 max-w-4xl text-sm text-gray-500">
              Manage users, roles, and permissions across your organization with comprehensive tools and analytics
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={handleViewAuditTrail}
              leftIcon={<ClockIcon className="w-4 h-4" />}
            >
              Audit Trail
            </Button>
            <Button
              variant="secondary"
              onClick={handleExportUsers}
              leftIcon={<DocumentArrowDownIcon className="w-4 h-4" />}
            >
              Export
            </Button>
            <Button
              variant="secondary"
              onClick={handleImportExport}
              leftIcon={<DocumentArrowUpIcon className="w-4 h-4" />}
            >
              Import
            </Button>
            <Button
              onClick={handleAddUser}
              leftIcon={<PlusIcon className="w-4 h-4" />}
            >
              Add User
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalUsers}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserPlusIcon className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.activeUsers}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserMinusIcon className="h-8 w-8 text-error-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Inactive Users</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.inactiveUsers}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-info-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Departments</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.usersByDepartment.length}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Card className="overflow-hidden">
        {/* Filters Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                leftIcon={<FunnelIcon className="w-4 h-4" />}
              >
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="primary" size="sm" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear All
                </Button>
              )}
            </div>
            
            {selectedUsers.length > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500 font-medium">
                  {selectedUsers.length} selected
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBulkActions}
                  leftIcon={<CogIcon className="w-4 h-4" />}
                >
                  Bulk Actions
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="px-6 py-4 border-b border-gray-200 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <Input
                  placeholder="Search by name or email..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <Select
                  value={filters.departmentId?.toString() || ''}
                  onChange={(value) => handleFilterChange('departmentId', value ? parseInt(value.toString()) : null)}
                  options={[
                    { value: '', label: 'All Departments' },
                    ...departments.map(dept => ({ value: dept.id.toString(), label: dept.name }))
                  ]}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <Select
                  value={filters.roleId?.toString() || ''}
                  onChange={(value) => handleFilterChange('roleId', value ? parseInt(value.toString()) : null)}
                  options={[
                    { value: '', label: 'All Roles' },
                    ...roles.map(role => ({ value: role.id.toString(), label: role.name }))
                  ]}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select
                  value={filters.isActive === null ? '' : filters.isActive.toString()}
                  onChange={(value) => handleFilterChange('isActive', value === '' ? null : value === 'true')}
                  options={[
                    { value: '', label: 'All Status' },
                    { value: 'true', label: 'Active' },
                    { value: 'false', label: 'Inactive' }
                  ]}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <DataTable
            data={users}
            columns={columns}
            loading={loading}
            rowKey="id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: (page, pageSize) => {
                setPagination(prev => ({ ...prev, current: page, pageSize }));
              },
              showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} users`,
              showSizeChanger: true,
              pageSizeOptions: ['10', '25', '50', '100']
            }}
            rowSelection={{
              selectedRowKeys: selectedUsers,
              onChange: (selectedRowKeys) => setSelectedUsers(selectedRowKeys)
            }}
            onRow={(record) => ({
              onDoubleClick: () => handleViewUser(record as UserSearchDto),
              className: 'hover:bg-primary-50 transition-colors duration-150'
            })}
            empty={
              <div className="text-center py-12">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by adding your first user or adjusting your filters.
                </p>
                <div className="mt-6">
                  <Button onClick={handleAddUser}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>
            }
          />
        </div>
      </Card>
    </div>
  );
};

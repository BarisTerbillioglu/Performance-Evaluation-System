import React, { useState, useMemo, useCallback } from 'react';
import { VirtualList } from '@/components/ui/data';
import { Skeleton, TableSkeleton } from '@/components/ui/feedback';
import { useOptimizedCallback, usePerformanceMonitor } from '@/hooks';
import { ErrorBoundary } from '@/components/common';

interface User {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'active' | 'inactive';
}

interface OptimizedUserListProps {
  users: User[];
  loading?: boolean;
  onUserSelect?: (user: User) => void;
  onUserEdit?: (user: User) => void;
  onUserDelete?: (user: User) => void;
}

// Memoized user row component
const UserRow = React.memo<{
  user: User;
  onSelect: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}>(({ user, onSelect, onEdit, onDelete }) => {
  const handleSelect = useCallback(() => onSelect(user), [user, onSelect]);
  const handleEdit = useCallback(() => onEdit(user), [user, onEdit]);
  const handleDelete = useCallback(() => onDelete(user), [user, onDelete]);

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 text-xs rounded-full ${
          user.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {user.status}
        </span>
        <button
          onClick={handleSelect}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View
        </button>
        <button
          onClick={handleEdit}
          className="text-gray-600 hover:text-gray-800 text-sm font-medium"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
});

UserRow.displayName = 'UserRow';

// Memoized loading skeleton
const LoadingSkeleton = React.memo(() => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4 p-4 border-b border-gray-200">
        <Skeleton variant="circular" className="w-10 h-10" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="h-4 w-1/3" />
          <Skeleton variant="text" className="h-3 w-1/2" />
        </div>
        <Skeleton variant="text" className="h-6 w-16" />
      </div>
    ))}
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

// Main optimized component
export const OptimizedUserList: React.FC<OptimizedUserListProps> = ({
  users,
  loading = false,
  onUserSelect,
  onUserEdit,
  onUserDelete,
}) => {
  // Performance monitoring
  usePerformanceMonitor({
    componentName: 'OptimizedUserList',
    logToConsole: process.env.NODE_ENV === 'development',
  });

  // Memoized filtered and sorted users
  const processedUsers = useMemo(() => {
    return users
      .filter(user => user.status === 'active')
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [users]);

  // Optimized callbacks
  const handleUserSelect = useOptimizedCallback(
    (user: User) => onUserSelect?.(user),
    [onUserSelect]
  );

  const handleUserEdit = useOptimizedCallback(
    (user: User) => onUserEdit?.(user),
    [onUserEdit]
  );

  const handleUserDelete = useOptimizedCallback(
    (user: User) => onUserDelete?.(user),
    [onUserDelete]
  );

  // Memoized virtual list render function
  const renderUser = useCallback((user: User, index: number) => (
    <UserRow
      key={user.id}
      user={user}
      onSelect={handleUserSelect}
      onEdit={handleUserEdit}
      onDelete={handleUserDelete}
    />
  ), [handleUserSelect, handleUserEdit, handleUserDelete]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (processedUsers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No users found</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Users ({processedUsers.length})
          </h2>
        </div>
        
        <VirtualList
          items={processedUsers}
          height={600}
          itemHeight={80}
          renderItem={renderUser}
          overscan={3}
          className="divide-y divide-gray-200"
        />
      </div>
    </ErrorBoundary>
  );
};

// Export with display name
OptimizedUserList.displayName = 'OptimizedUserList';

import React from 'react';
import { useAuth } from '@/store';
import { formatFullName } from '@/utils';

export const ProfilePage: React.FC = () => {
  const { state } = useAuth();

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold leading-tight text-gray-900">
          Profile
        </h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>
      
      {state.user && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-xl font-medium text-gray-700">
                {state.user.firstName[0]}{state.user.lastName[0]}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {formatFullName(state.user.firstName, state.user.lastName)}
              </h2>
              <p className="text-gray-600">{state.user.email}</p>
              <p className="text-sm text-gray-500">{state.user.primaryRole}</p>
            </div>
          </div>
          <p className="text-gray-600">Profile management features will be implemented here.</p>
        </div>
      )}
    </div>
  );
};

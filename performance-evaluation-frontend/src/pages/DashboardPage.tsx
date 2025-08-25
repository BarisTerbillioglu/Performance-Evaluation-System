import React from 'react';
import { useAuth } from '@/store';
import { DashboardLayout } from '@/components/layout';
import { 
  AdminDashboard, 
  EvaluatorDashboard, 
  EmployeeDashboard 
} from '@/pages/dashboard';
import { UserRole } from '@/types/roles';

export const DashboardPage: React.FC = () => {
  const { state, hasRole } = useAuth();

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark-800 mb-4">Please log in to continue</h1>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const renderDashboardContent = () => {
    // Admin Dashboard
    if (hasRole(UserRole.ADMIN)) {
      return <AdminDashboard />;
    }

    // Evaluator/Manager Dashboard
    if (hasRole(UserRole.EVALUATOR) || hasRole(UserRole.MANAGER)) {
      return <EvaluatorDashboard />;
    }

    // Employee Dashboard
    if (hasRole(UserRole.EMPLOYEE)) {
      return <EmployeeDashboard />;
    }

    // Default fallback
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Dashboard Available</h3>
        <p className="text-gray-600">
          Your role doesn't have a specific dashboard assigned. Please contact your administrator.
        </p>
      </div>
    );
  };

  return (
    <DashboardLayout>
      {renderDashboardContent()}
    </DashboardLayout>
  );
};

import React from 'react';
import { useAuth } from '@/store';
import { TeamDashboard } from './TeamDashboard';
import { TeamManagementPage } from './TeamManagementPage';

export const TeamsPage: React.FC = () => {
  const { state } = useAuth();
  
  // Check if user is admin or evaluator
  const isAdmin = state.user?.roleIds?.includes(1); // Assuming role ID 1 is Admin
  const isEvaluator = state.user?.roleIds?.includes(2); // Assuming role ID 2 is Evaluator

  // Show evaluator dashboard for evaluators, admin management for admins
  if (isEvaluator && !isAdmin) {
    return <TeamDashboard />;
  }

  return <TeamManagementPage />;
};

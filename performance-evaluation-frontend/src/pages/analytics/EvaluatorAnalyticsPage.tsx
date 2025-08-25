import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { UserRole } from '@/types/roles';

export const EvaluatorAnalyticsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <PermissionGuard requiredRoles={[UserRole.EVALUATOR, UserRole.ADMIN]}>
      <AnalyticsDashboard role="evaluator" />
    </PermissionGuard>
  );
};

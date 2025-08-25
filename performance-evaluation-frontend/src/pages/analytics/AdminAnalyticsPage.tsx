import React from 'react';
import { AnalyticsDashboard } from '@/components/analytics';
import { useAuth } from '@/hooks/useAuth';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { UserRole } from '@/types/user';

export const AdminAnalyticsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <PermissionGuard requiredRoles={[UserRole.ADMIN]}>
      <AnalyticsDashboard role="admin" />
    </PermissionGuard>
  );
};

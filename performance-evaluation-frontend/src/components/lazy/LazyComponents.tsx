import React, { Suspense } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

// Lazy load all major components
const AdminDashboardPage = React.lazy(() => import('../../pages/dashboard/AdminDashboard'));
const EmployeeDashboardPage = React.lazy(() => import('../../pages/dashboard/EmployeeDashboard'));
const EvaluatorDashboardPage = React.lazy(() => import('../../pages/dashboard/EvaluatorDashboard'));
const UserManagementPage = React.lazy(() => import('../../pages/users/UserManagementPage'));
const EvaluationPage = React.lazy(() => import('../../pages/evaluations/EvaluationPage'));
const ReportsPage = React.lazy(() => import('../../pages/reports/ReportsPage'));
const AnalyticsPage = React.lazy(() => import('../../pages/analytics/AnalyticsPage'));
const SystemSettingsPage = React.lazy(() => import('../../pages/settings/SystemSettingsPage'));
const TeamManagementPage = React.lazy(() => import('../../pages/teams/TeamManagementPage'));
const DepartmentManagementPage = React.lazy(() => import('../../pages/departments/DepartmentManagementPage'));
const CriteriaManagementPage = React.lazy(() => import('../../pages/criteria/CriteriaManagementPage'));
const ProfilePage = React.lazy(() => import('../../pages/profile/ProfilePage'));

// Loading component for Suspense fallback
const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>
);

// Wrapper component for lazy-loaded pages
const LazyPageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);

// Lazy-loaded page components
export const LazyDashboardPage: React.FC = () => (
  <LazyPageWrapper>
    <DashboardPage />
  </LazyPageWrapper>
);

export const LazyUserManagementPage: React.FC = () => (
  <LazyPageWrapper>
    <UserManagementPage />
  </LazyPageWrapper>
);

export const LazyEvaluationPage: React.FC = () => (
  <LazyPageWrapper>
    <EvaluationPage />
  </LazyPageWrapper>
);

export const LazyReportsPage: React.FC = () => (
  <LazyPageWrapper>
    <ReportsPage />
  </LazyPageWrapper>
);

export const LazyAnalyticsPage: React.FC = () => (
  <LazyPageWrapper>
    <AnalyticsPage />
  </LazyPageWrapper>
);

export const LazySystemSettingsPage: React.FC = () => (
  <LazyPageWrapper>
    <SystemSettingsPage />
  </LazyPageWrapper>
);

export const LazyTeamManagementPage: React.FC = () => (
  <LazyPageWrapper>
    <TeamManagementPage />
  </LazyPageWrapper>
);

export const LazyDepartmentManagementPage: React.FC = () => (
  <LazyPageWrapper>
    <DepartmentManagementPage />
  </LazyPageWrapper>
);

export const LazyCriteriaManagementPage: React.FC = () => (
  <LazyPageWrapper>
    <CriteriaManagementPage />
  </LazyPageWrapper>
);

export const LazyProfilePage: React.FC = () => (
  <LazyPageWrapper>
    <ProfilePage />
  </LazyPageWrapper>
);

// Lazy load heavy components
export const LazyDataTable = React.lazy(() => import('../ui/data/DataTable'));
export const LazyChart = React.lazy(() => import('../ui/charts/Chart'));
export const LazyAdvancedReportBuilder = React.lazy(() => import('../reports/AdvancedReportBuilder'));
export const LazySystemHealthDashboard = React.lazy(() => import('../settings/SystemHealthDashboard'));

// Export all lazy components
export {
  DashboardPage,
  UserManagementPage,
  EvaluationPage,
  ReportsPage,
  AnalyticsPage,
  SystemSettingsPage,
  TeamManagementPage,
  DepartmentManagementPage,
  CriteriaManagementPage,
  ProfilePage,
};

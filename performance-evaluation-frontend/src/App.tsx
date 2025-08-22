import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, NotificationSystem, ModalSystem } from '@/components';
import { ProtectedRoute, PublicRoute, RoleGuard } from '@/components/auth';
import { LoginPage, DashboardPage } from '@/pages';
import { UserRole } from '@/types/roles';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

// Admin Pages (lazy loaded)
const AdminDashboard = React.lazy(() => 
  import('@/pages/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard }))
);

const UsersPage = React.lazy(() => 
  import('@/pages/users/UsersPage').then(module => ({ default: module.UsersPage }))
);

const EvaluationsPage = React.lazy(() => 
  import('@/pages/evaluations/EvaluationsPage').then(module => ({ default: module.EvaluationsPage }))
);

const CriteriaPage = React.lazy(() => 
  import('@/pages/criteria/CriteriaPage').then(module => ({ default: module.CriteriaPage }))
);

const DepartmentsPage = React.lazy(() => 
  import('@/pages/departments/DepartmentsPage').then(module => ({ default: module.DepartmentsPage }))
);

const TeamsPage = React.lazy(() => 
  import('@/pages/teams/TeamsPage').then(module => ({ default: module.TeamsPage }))
);

const ReportsPage = React.lazy(() => 
  import('@/pages/reports/ReportsPage').then(module => ({ default: module.ReportsPage }))
);

const ProfilePage = React.lazy(() => 
  import('@/pages/profile/ProfilePage').then(module => ({ default: module.ProfilePage }))
);

// Loading fallback component
const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <React.Suspense 
    fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    }
  >
    {children}
  </React.Suspense>
);

// Main App Routes
const AppRoutes: React.FC = () => {
  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
              <SuspenseWrapper>
                <AdminDashboard />
              </SuspenseWrapper>
            </ProtectedRoute>
          }
        />

        {/* Users Management */}
        <Route
          path="/users/*"
          element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.HR]}>
              <SuspenseWrapper>
                <UsersPage />
              </SuspenseWrapper>
            </ProtectedRoute>
          }
        />

        {/* Evaluations */}
        <Route
          path="/evaluations/*"
          element={
            <ProtectedRoute>
              <SuspenseWrapper>
                <EvaluationsPage />
              </SuspenseWrapper>
            </ProtectedRoute>
          }
        />

        {/* Criteria Management */}
        <Route
          path="/criteria/*"
          element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
              <SuspenseWrapper>
                <CriteriaPage />
              </SuspenseWrapper>
            </ProtectedRoute>
          }
        />

        {/* Departments */}
        <Route
          path="/departments/*"
          element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.HR]}>
              <SuspenseWrapper>
                <DepartmentsPage />
              </SuspenseWrapper>
            </ProtectedRoute>
          }
        />

        {/* Teams */}
        <Route
          path="/teams/*"
          element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
              <SuspenseWrapper>
                <TeamsPage />
              </SuspenseWrapper>
            </ProtectedRoute>
          }
        />

        {/* Reports */}
        <Route
          path="/reports/*"
          element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.HR]}>
              <SuspenseWrapper>
                <ReportsPage />
              </SuspenseWrapper>
            </ProtectedRoute>
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <SuspenseWrapper>
                <ProfilePage />
              </SuspenseWrapper>
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* 404 Page */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="max-w-md w-full text-center">
                <div className="mb-8">
                  <svg
                    className="mx-auto h-24 w-24 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
                <p className="text-lg text-gray-600 mb-8">Page not found</p>
                <div className="space-y-3">
                  <button
                    onClick={() => window.history.back()}
                    className="block w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    Go Back
                  </button>
                  <Navigate to="/dashboard" replace />
                </div>
              </div>
            </div>
          }
        />
      </Routes>
    </Layout>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AppRoutes />
        <NotificationSystem />
        <ModalSystem />
      </Router>
    </ErrorBoundary>
  );
};

export default App;

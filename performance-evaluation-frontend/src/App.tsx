import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { UserRole } from '@/types/roles';
import { useAuth } from '@/hooks/useAuth';
import { useServiceWorker } from '@/hooks/useServiceWorker';

// Import analytics pages
import { AdminAnalyticsPage } from '@/pages/analytics/AdminAnalyticsPage';
import { EmployeeAnalyticsPage } from '@/pages/analytics/EmployeeAnalyticsPage';
import { EvaluatorAnalyticsPage } from '@/pages/analytics/EvaluatorAnalyticsPage';



// Import examples
import { DesignSystemShowcase } from '@/components/DesignSystemShowcase';

// Service Worker Registration
const ServiceWorkerRegistration: React.FC = () => {
  useServiceWorker();
  return null;
};

// Main App Component
const AppContent: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;

  // Get default redirect path based on user role
  const getDefaultRedirectPath = () => {
    if (!user) return '/login';
    
    if (user.roles?.includes('ADMIN')) {
      return '/admin/analytics';
    } else if (user.roles?.includes('EVALUATOR')) {
      return '/evaluator/analytics';
    } else {
      return '/employee/analytics';
    }
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<AuthGuard><Layout><Outlet /></Layout></AuthGuard>}>
          {/* Dashboard Routes */}
          <Route index element={<Navigate to={getDefaultRedirectPath()} replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          
          {/* Admin Routes */}
          <Route path="admin" element={<PermissionGuard requiredRoles={[UserRole.ADMIN]}><Outlet /></PermissionGuard>}>
            <Route path="analytics" element={<AdminAnalyticsPage />} />
          </Route>
          
          {/* Employee Routes */}
          <Route path="employee" element={<PermissionGuard requiredRoles={[UserRole.EMPLOYEE]}><Outlet /></PermissionGuard>}>
            <Route path="analytics" element={<EmployeeAnalyticsPage />} />
          </Route>
          
          {/* Evaluator Routes */}
          <Route path="evaluator" element={<PermissionGuard requiredRoles={[UserRole.EVALUATOR]}><Outlet /></PermissionGuard>}>
            <Route path="analytics" element={<EvaluatorAnalyticsPage />} />
          </Route>
          
          {/* Development/Example Routes */}
          {process.env.NODE_ENV === 'development' && (
            <Route path="design-system" element={<DesignSystemShowcase />} />
          )}
        </Route>
        
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

// Root App Component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
      <ServiceWorkerRegistration />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
};

export default App;

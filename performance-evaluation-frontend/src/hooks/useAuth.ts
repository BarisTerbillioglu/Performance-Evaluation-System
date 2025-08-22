import { useAuthStore } from '@/stores';
import { AuthContextType } from '@/types/auth';

/**
 * Custom hook that provides the same interface as the old React Context-based useAuth
 * but uses Zustand store under the hood for better performance and persistence
 */
export const useAuth = (): AuthContextType & { getDefaultRedirectPath: () => string } => {
  const store = useAuthStore();
  
  return {
    state: {
      user: store.user,
      isAuthenticated: store.isAuthenticated,
      isLoading: store.isLoading,
      isInitialized: store.isInitialized,
      error: store.error,
    },
    login: store.login,
    logout: store.logout,
    refreshAuth: store.refreshAuth,
    checkAuth: store.checkAuth,
    hasRole: store.hasRole,
    hasPermission: store.hasPermission,
    canAccessRoute: store.canAccessRoute,
    clearError: store.clearError,
    getDefaultRedirectPath: store.getDefaultRedirectPath,
  };
};

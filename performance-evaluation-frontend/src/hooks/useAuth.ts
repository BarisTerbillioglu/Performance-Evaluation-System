import { useAuthStore } from '@/stores';
import { AuthContextType, UserInfo } from '@/types/auth';

/**
 * Custom hook that provides the same interface as the old React Context-based useAuth
 * but uses Zustand store under the hood for better performance and persistence
 */
export const useAuth = (): AuthContextType & { getDefaultRedirectPath: () => string } => {
  const store = useAuthStore();
  
  // Wrapper function to handle type mismatch
  const updateUser = (userData: Partial<UserInfo>) => {
    if (store.user) {
      store.setUser({ ...store.user, ...userData });
    }
  };
  
  return {
    state: {
      user: store.user,
      isAuthenticated: store.isAuthenticated,
      isLoading: store.isLoading,
      isInitialized: store.isInitialized,
      error: store.error,
      loading: store.isLoading,
    },
    user: store.user,
    loading: store.isLoading,
    login: store.login,
    logout: store.logout,
    checkAuth: store.checkAuth,
    refreshAuth: store.refreshAuth,
    refreshToken: store.refreshAuth, // Alias for refreshAuth
    updateUser,
    initializeAuth: store.checkAuth, // Alias for checkAuth
    hasRole: store.hasRole,
    hasPermission: store.hasPermission,
    canAccessRoute: store.canAccessRoute,
    clearError: store.clearError,
    getDefaultRedirectPath: store.getDefaultRedirectPath,
  };
};

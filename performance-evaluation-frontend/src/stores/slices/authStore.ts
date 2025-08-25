import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { AuthStore } from '../types/auth';
import { UserRole } from '@/types/roles';
import { authService } from '@/services';
import {
  hasRole,
  hasPermission,
  canAccessRoute,
  getUserPrimaryRole,
  getRedirectPath,
} from '@/utils/rbac';
import { persist, createAuthPersistConfig } from '../middleware/persist';
import { loggerWithActions } from '../middleware/logger';

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  tokenExpiresAt: null,
  lastRefresh: null,
};

export const useAuthStore = create<AuthStore>()(
  loggerWithActions(
    persist(
      immer((set, get) => ({
          // Initial state
          ...initialState,

          // Authentication actions
          login: async (credentials: { email: string; password: string }) => {
            try {
              set((state: AuthStore) => {
                state.isLoading = true;
                state.error = null;
              });

              const response = await authService.login(credentials);

              if (response.success) {
                const userWithRole = {
                  ...response.user,
                  primaryRole: getUserPrimaryRole(response.user),
                };

                set((state: AuthStore) => {
                  state.user = userWithRole;
                  state.isAuthenticated = true;
                  state.isLoading = false;
                  state.isInitialized = true;
                  state.error = null;
                  if (response.expiresAt) {
                    state.tokenExpiresAt = response.expiresAt;
                  }
                  state.lastRefresh = new Date().toISOString();
                });
              } else {
                throw new Error(response.message || 'Login failed');
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Login failed';
              set((state: AuthStore) => {
                state.error = errorMessage;
                state.isLoading = false;
              });
              throw error;
            }
          },

          logout: async () => {
            try {
              set((state: AuthStore) => {
                state.isLoading = true;
              });

              // Call logout endpoint to clear server-side cookies
              await authService.logout();
            } catch (error) {
              console.error('Logout error:', error);
            } finally {
              // Always clear local state
              set((state: AuthStore) => {
                Object.assign(state, {
                  ...initialState,
                  isInitialized: true,
                });
              });
            }
          },

          refreshAuth: async () => {
            try {
              // Refresh token using HTTP-only cookies
              await authService.refreshToken();

              // Get updated user info
              const user = await authService.getCurrentUser();
              const userWithRole = {
                ...user,
                primaryRole: getUserPrimaryRole(user),
              };

              set((state: AuthStore) => {
                state.user = userWithRole;
                state.isAuthenticated = true;
                state.lastRefresh = new Date().toISOString();
                state.error = null;
              });
            } catch (error) {
              console.error('Token refresh failed:', error);
              set((state: AuthStore) => {
                Object.assign(state, {
                  ...initialState,
                  isInitialized: true,
                });
              });
              throw error;
            }
          },

          checkAuth: async () => {
            try {
              if (!get().isInitialized) {
                set((state: AuthStore) => {
                  state.isLoading = true;
                });
              }

              // Try to get current user using HTTP-only cookies
              const user = await authService.checkAuth();

              if (user) {
                const userWithRole = {
                  ...user,
                  primaryRole: getUserPrimaryRole(user),
                };

                set((state: AuthStore) => {
                  state.user = userWithRole;
                  state.isAuthenticated = true;
                  state.isLoading = false;
                  state.isInitialized = true;
                  state.error = null;
                });
              } else {
                set((state: AuthStore) => {
                  Object.assign(state, {
                    ...initialState,
                    isInitialized: true,
                  });
                });
              }
            } catch (error) {
              console.error('Auth check failed:', error);
              set((state: AuthStore) => {
                Object.assign(state, {
                  ...initialState,
                  isInitialized: true,
                });
              });
            }
          },

          // User management
          setUser: (user) => {
            set((state) => {
              state.user = {
                ...user,
                primaryRole: getUserPrimaryRole(user),
              };
              state.isAuthenticated = true;
            });
          },

          clearError: () => {
            set((state) => {
              state.error = null;
            });
          },

          setError: (error) => {
            set((state) => {
              state.error = error;
            });
          },

          setLoading: (loading) => {
            set((state) => {
              state.isLoading = loading;
            });
          },

          // Role and permission helpers
          hasRole: (role: UserRole) => {
            return hasRole(get().user, role);
          },

          hasPermission: (resource: string, action: string) => {
            return hasPermission(get().user, resource, action);
          },

          canAccessRoute: (path: string) => {
            return canAccessRoute(get().user, path);
          },

          getPrimaryRole: () => {
            const { user } = get();
            return user ? getUserPrimaryRole(user) : null;
          },

          getDefaultRedirectPath: () => {
            const { user } = get();
            return user ? getRedirectPath(user) : '/dashboard';
          },

          // Internal state management
          setTokenInfo: (expiresAt: string) => {
            set((state) => {
              state.tokenExpiresAt = expiresAt;
            });
          },

          markRefresh: () => {
            set((state) => {
              state.lastRefresh = new Date().toISOString();
            });
          },
        })),
        createAuthPersistConfig()
      ),
      {
        name: 'AuthStore',
        enabled: true,
      }
    )
  );

// Auto-refresh token setup
let refreshInterval: NodeJS.Timeout | null = null;

// Function to start auto-refresh
const startAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  refreshInterval = setInterval(async () => {
    const { isAuthenticated, refreshAuth } = useAuthStore.getState();
    
    if (isAuthenticated) {
      try {
        await refreshAuth();
      } catch (error) {
        console.error('Auto-refresh failed:', error);
        // The error will trigger logout in refreshAuth
      }
    } else {
      // Stop refreshing if not authenticated
      if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
      }
    }
  }, 14 * 60 * 1000); // 14 minutes
};

// Function to stop auto-refresh
const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

// Subscribe to auth state changes to manage auto-refresh
useAuthStore.subscribe((state, prevState) => {
  if (state.isAuthenticated && !prevState.isAuthenticated) {
    startAutoRefresh();
  } else if (!state.isAuthenticated && prevState.isAuthenticated) {
    stopAutoRefresh();
  }
});

// Initialize auth check when store is created
if (typeof window !== 'undefined') {
  // Delay initialization to avoid hydration issues
  setTimeout(() => {
    const { checkAuth, isInitialized } = useAuthStore.getState();
    if (!isInitialized) {
      checkAuth();
    }
  }, 0);
}

// Export selectors for better performance
export const authSelectors = {
  user: (state: AuthStore) => state.user,
  isAuthenticated: (state: AuthStore) => state.isAuthenticated,
  isLoading: (state: AuthStore) => state.isLoading,
  isInitialized: (state: AuthStore) => state.isInitialized,
  error: (state: AuthStore) => state.error,
  primaryRole: (state: AuthStore) => state.user?.primaryRole || null,
};

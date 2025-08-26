import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { StateCreator } from 'zustand';
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
import {
  LoginRequest,
  UserInfo,
  LoginResponse,
  ApiError
} from '@/types';

interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  token: string | null;
  refreshToken: string | null;
  expiresAt: Date | null;
  loading: boolean;
  error: string | null;
  loginAttempts: number;
  lockoutUntil: Date | null;
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    timezone: string;
  };
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (user: UserInfo) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

type AuthStoreType = AuthState & AuthActions;

// Fix the StateCreator type
const createAuthSlice: StateCreator<
  AuthStoreType,
  [['zustand/immer', never]],
  [],
  AuthStoreType
> = (set, get) => ({
  // State
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
  expiresAt: null,
  loading: false,
  error: null,
  loginAttempts: 0,
  lockoutUntil: null,
  preferences: {
    theme: 'light',
    language: 'en',
    timezone: 'UTC'
  },

  // Actions
  login: async (credentials: LoginRequest) => {
    set((state) => {
      state.loading = true;
      state.error = null;
    });

    try {
      const response: LoginResponse = await authService.login(credentials);

      set((state) => {
        state.isAuthenticated = true;
        state.user = {
          ...response.user,
          primaryRole: response.user.primaryRole ?? undefined // Fix null to undefined
        };
        state.token = response.accessToken;
        state.refreshToken = response.refreshToken;
        state.expiresAt = new Date(response.expiresAt); // Fix Date conversion
        state.loading = false;
        state.loginAttempts = 0;
        state.lockoutUntil = null;
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.loading = false;
        state.error = apiError.message;
        state.loginAttempts += 1;
      });
    }
  },

  logout: async () => {
    set((state) => {
      state.loading = true;
    });

    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set((state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.expiresAt = null;
        state.loading = false;
        state.error = null;
      });
    }
  },

  refreshAccessToken: async () => {
    try {
      const response = await authService.refresh();
      set((state) => {
        state.token = response.accessToken;
        state.refreshToken = response.refreshToken;
        state.expiresAt = new Date(response.expiresAt);
      });
    } catch (error) {
      set((state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.expiresAt = null;
      });
    }
  },

  checkAuth: async () => {
    set((state) => {
      state.loading = true;
    });

    try {
      const user = await authService.getCurrentUser();
      set((state) => {
        state.isAuthenticated = true;
        state.user = {
          ...user,
          primaryRole: user.primaryRole ?? undefined
        };
        state.loading = false;
      });
    } catch (error) {
      set((state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.loading = false;
      });
    }
  },

  updateUser: (user: UserInfo) => {
    set((state) => {
      state.user = {
        ...user,
        primaryRole: user.primaryRole ?? undefined
      };
    });
  },

  clearError: () => {
    set((state) => {
      state.error = null;
    });
  },

  setLoading: (loading: boolean) => {
    set((state) => {
      state.loading = loading;
    });
  },

  reset: () => {
    set((state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.expiresAt = null;
      state.loading = false;
      state.error = null;
      state.loginAttempts = 0;
      state.lockoutUntil = null;
      state.preferences = {
        theme: 'light',
        language: 'en',
        timezone: 'UTC'
      };
    });
  }
});

export const useAuthStore = create<AuthStoreType>()(
  loggerWithActions(
    persist(
      immer(createAuthSlice),
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
  user: (state: AuthStoreType) => state.user,
  isAuthenticated: (state: AuthStoreType) => state.isAuthenticated,
  loading: (state: AuthStoreType) => state.loading,
  error: (state: AuthStoreType) => state.error,
  primaryRole: (state: AuthStoreType) => state.user?.primaryRole || null,
};

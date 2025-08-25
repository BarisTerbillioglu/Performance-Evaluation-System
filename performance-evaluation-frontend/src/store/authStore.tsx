import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { AuthState, UserInfo, LoginRequest, AuthContextType } from '@/types';
import { UserRole } from '@/types/roles';
import { authService } from '@/services';
import { 
  hasRole, 
  hasPermission, 
  canAccessRoute, 
  getUserPrimaryRole,
  getRedirectPath 
} from '@/utils/rbac';

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  error: null,
  loading: true,
};

// Action types
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: UserInfo }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: UserInfo }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, loading: action.payload };
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };
    case 'LOGIN_SUCCESS':
      // Enhance user with primary role for RBAC
      const userWithRole = {
        ...action.payload,
        primaryRole: getUserPrimaryRole(action.payload)
      };
      return {
        ...state,
        user: userWithRole,
        isAuthenticated: true,
        isLoading: false,
        loading: false,
        isInitialized: true,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
        loading: false,
        isInitialized: true,
      };
    case 'SET_USER':
      const updatedUserWithRole = {
        ...action.payload,
        primaryRole: getUserPrimaryRole(action.payload)
      };
      return { 
        ...state, 
        user: updatedUserWithRole, 
        isAuthenticated: true,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Login function
  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await authService.login(credentials);
      
      if (response.success) {
        // Cookies are automatically set by the server
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: response.user,
        });
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // Call logout endpoint to clear server-side cookies
      await authService.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout error:', error);
    } finally {
      // Clear local state
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      if (!state.isInitialized) {
        dispatch({ type: 'SET_LOADING', payload: true });
      }
      
      // Try to get current user using HTTP-only cookies
      const user = await authService.checkAuth();
      
      if (user) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      dispatch({ type: 'LOGOUT' });
    }
  }, [state.isInitialized]);

  // Refresh authentication
  const refreshAuth = useCallback(async () => {
    try {
      // Refresh token using HTTP-only cookies
      await authService.refreshToken();
      
      // Get updated user info
      const user = await authService.getCurrentUser();
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error) {
      console.error('Token refresh failed:', error);
      dispatch({ type: 'LOGOUT' });
      throw error;
    }
  }, []);

  // Update user function
  const updateUser = useCallback((userData: Partial<UserInfo>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...userData };
      dispatch({ type: 'SET_USER', payload: updatedUser });
    }
  }, [state.user]);

  // Initialize auth function
  const initializeAuth = useCallback(async () => {
    if (!state.isInitialized) {
      await checkAuth();
    }
  }, [state.isInitialized, checkAuth]);

  // RBAC helper functions
  const hasRoleCheck = useCallback((role: UserRole): boolean => {
    return hasRole(state.user, role);
  }, [state.user]);

  const hasPermissionCheck = useCallback((resource: string, action: string): boolean => {
    return hasPermission(state.user, resource, action);
  }, [state.user]);

  const canAccessRouteCheck = useCallback((path: string): boolean => {
    return canAccessRoute(state.user, path);
  }, [state.user]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Get redirect path for user
  const getDefaultRedirectPath = useCallback((): string => {
    if (!state.user) return '/dashboard';
    return getRedirectPath(state.user);
  }, [state.user]);

  // Initialize auth on mount
  useEffect(() => {
    if (!state.isInitialized) {
      checkAuth();
    }
  }, [checkAuth, state.isInitialized]);

  // Auto-refresh token every 14 minutes (if token expires in 15 minutes)
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const refreshInterval = setInterval(async () => {
      try {
        await refreshAuth();
      } catch (error) {
        console.error('Auto-refresh failed:', error);
        // The error will trigger logout in refreshAuth
      }
    }, 14 * 60 * 1000); // 14 minutes

    return () => clearInterval(refreshInterval);
  }, [state.isAuthenticated, refreshAuth]);

  const value: AuthContextType = {
    state,
    login,
    logout,
    checkAuth,
    refreshAuth,
    updateUser,
    initializeAuth,
    hasRole: hasRoleCheck,
    hasPermission: hasPermissionCheck,
    canAccessRoute: canAccessRouteCheck,
    clearError,
  };

  // Add the getDefaultRedirectPath to context value
  const enhancedValue = {
    ...value,
    getDefaultRedirectPath,
  };

  return <AuthContext.Provider value={enhancedValue}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = (): AuthContextType & { getDefaultRedirectPath: () => string } => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context as AuthContextType & { getDefaultRedirectPath: () => string };
};

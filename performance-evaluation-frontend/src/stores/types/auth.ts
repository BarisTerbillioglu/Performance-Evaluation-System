import { UserInfo, LoginRequest } from '@/types/auth';
import { UserRole } from '@/types/roles';

export interface AuthState {
  // User data
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Token info (for debugging/monitoring)
  tokenExpiresAt: string | null;
  lastRefresh: string | null;
}

export interface AuthActions {
  // Authentication actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  checkAuth: () => Promise<void>;
  
  // User management
  setUser: (user: UserInfo) => void;
  clearError: () => void;
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
  
  // Role and permission helpers
  hasRole: (role: UserRole) => boolean;
  hasPermission: (resource: string, action: string) => boolean;
  canAccessRoute: (path: string) => boolean;
  getPrimaryRole: () => UserRole | null;
  getDefaultRedirectPath: () => string;
  
  // Internal state management
  setTokenInfo: (expiresAt: string) => void;
  markRefresh: () => void;
}

export interface AuthStore extends AuthState, AuthActions {}

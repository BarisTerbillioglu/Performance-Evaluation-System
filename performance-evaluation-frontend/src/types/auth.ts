import { UserRole } from './roles';

// Authentication types matching backend DTOs exactly
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: UserInfo;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface UserInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  departmentId?: number;
  roleIds: number[];
  roles?: string[];
  primaryRole?: UserRole;
}

export interface RefreshTokenResponse {
  message: string;
  expiresAt: Date;
}

export interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  loading: boolean;
}

export interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  refreshToken: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (userData: Partial<UserInfo>) => void;
  initializeAuth: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (resource: string, action: string) => boolean;
  canAccessRoute: (path: string) => boolean;
  clearError: () => void;
  // Add missing properties that are being used
  loading: boolean;
  user: UserInfo | null;
}

// Form validation schemas
export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

import { UserRole } from './roles';

// Authentication types matching backend DTOs
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: UserInfo;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
}

export interface UserInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  departmentID: number;
  roleIds: number[];
  roles?: string[]; // Role names from backend
  primaryRole?: UserRole | null; // Primary role for RBAC
  permissions?: string[];
  profilePicture?: string;
  isActive: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  isSuccess: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

export interface AuthResult {
  isSuccess: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
}

export interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (resource: string, action: string) => boolean;
  canAccessRoute: (path: string) => boolean;
  clearError: () => void;
}

// Form validation schemas
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

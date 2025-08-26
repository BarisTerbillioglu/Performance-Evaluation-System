import { UserInfo, LoginRequest, LoginResponse, ApiError } from '@/types';
import { UserRole } from '@/types/roles';

export interface AuthState {
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

export interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (user: UserInfo) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export interface AuthStore extends AuthState, AuthActions {}

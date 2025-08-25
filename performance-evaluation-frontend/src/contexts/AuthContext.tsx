import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '../stores/slices/authStore';
import { UserInfo } from '../types';

interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (user: UserInfo) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    user,
    isAuthenticated,
    loading,
    login: storeLogin,
    logout: storeLogout,
    refreshToken: storeRefreshToken,
    updateUser: storeUpdateUser,
    initializeAuth,
  } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (email: string, password: string) => {
    await storeLogin(email, password);
  };

  const logout = async () => {
    await storeLogout();
  };

  const refreshToken = async () => {
    await storeRefreshToken();
  };

  const updateUser = (user: UserInfo) => {
    storeUpdateUser(user);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    refreshToken,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

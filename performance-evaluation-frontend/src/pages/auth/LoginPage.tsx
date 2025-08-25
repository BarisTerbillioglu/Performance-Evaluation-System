import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/store';
import { Button } from '@/components/design-system';
import { loginSchema, LoginFormData } from '@/utils/validation';
import { CONFIG } from '@/constants/config';

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { state, login, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from location state
  const from = (location.state as { from?: string })?.from || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Clear errors when component mounts or when auth error changes
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Redirect if already authenticated
  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      const redirectPath = from !== '/login' ? from : '/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [state.isAuthenticated, state.user, navigate, from]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearErrors();
      clearError();
      
      await login({
        email: data.email,
        password: data.password,
      });

      // Navigation will be handled by the useEffect above
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      // Set specific field errors based on error type
      if (errorMessage.toLowerCase().includes('email')) {
        setError('email', { 
          type: 'manual', 
          message: errorMessage 
        });
      } else if (errorMessage.toLowerCase().includes('password')) {
        setError('password', { 
          type: 'manual', 
          message: errorMessage 
        });
      } else {
        setError('root', { 
          type: 'manual', 
          message: errorMessage 
        });
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Show loading spinner while checking authentication
  if (state.isLoading && !state.isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-primary-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          {/* VakıfBank Logo/Icon */}
          <div className="mx-auto h-20 w-20 bg-primary-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <svg 
              className="h-10 w-10 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-black mb-2">
            {CONFIG.APP_NAME}
          </h1>
          <h2 className="text-xl font-medium text-dark-600 mb-4">
            Performance Evaluation System
          </h2>
          <p className="text-dark-500 text-sm">
            Sign in to access your account
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-dark-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className={`
                    w-full px-4 py-3 border-2 rounded-lg text-dark-900 placeholder-dark-400
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    transition-all duration-200
                    ${errors.email 
                      ? 'border-error-300 focus:ring-error-500' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  placeholder="Enter your email address"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-error-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-error-600 flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-dark-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`
                    w-full px-4 py-3 pr-12 border-2 rounded-lg text-dark-900 placeholder-dark-400
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    transition-all duration-200
                    ${errors.password 
                      ? 'border-error-300 focus:ring-error-500' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-dark-400 hover:text-dark-600 transition-colors"
                  onClick={togglePasswordVisibility}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-error-600 flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Error Messages */}
            {(errors.root || state.error) && (
              <div className="rounded-lg bg-error-50 border border-error-200 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-error-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-error-800">
                      {errors.root?.message || state.error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>

            {/* Help Links */}
            <div className="text-center pt-4">
              <p className="text-sm text-dark-500">
                Need help?{' '}
                <Link
                  to="/contact"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Contact your administrator
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-dark-400">
            © 2024 {CONFIG.APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

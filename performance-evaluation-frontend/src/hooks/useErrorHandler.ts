import { useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { logSecurityEvent } from '../utils/security';

interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  userId?: string;
}

interface ApiError {
  message: string;
  status?: number;
  statusText?: string;
  url?: string;
  method?: string;
  data?: any;
}

export const useErrorHandler = () => {
  // Handle React errors
  const handleReactError = useCallback((error: Error, errorInfo: any) => {
    const errorData: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: localStorage.getItem('userId') || undefined,
    };

    // Log error for security monitoring
    logSecurityEvent('react_error', errorData);

    // Show user-friendly error message
    toast.error('Something went wrong. Please try again or contact support.');

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.error('React Error:', error);
      console.error('Error Info:', errorInfo);
    }
  }, []);

  // Handle API errors
  const handleApiError = useCallback((error: ApiError) => {
    const errorData = {
      ...error,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: localStorage.getItem('userId') || undefined,
    };

    // Log error for security monitoring
    logSecurityEvent('api_error', errorData);

    // Show appropriate error message based on status
    let userMessage = 'An error occurred. Please try again.';

    switch (error.status) {
      case 400:
        userMessage = 'Invalid request. Please check your input and try again.';
        break;
      case 401:
        userMessage = 'You are not authorized to perform this action.';
        // Redirect to login if unauthorized
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        break;
      case 403:
        userMessage = 'Access denied. You do not have permission to perform this action.';
        break;
      case 404:
        userMessage = 'The requested resource was not found.';
        break;
      case 409:
        userMessage = 'This resource already exists or conflicts with existing data.';
        break;
      case 422:
        userMessage = 'Validation error. Please check your input and try again.';
        break;
      case 429:
        userMessage = 'Too many requests. Please wait a moment and try again.';
        break;
      case 500:
        userMessage = 'Server error. Please try again later or contact support.';
        break;
      case 502:
      case 503:
      case 504:
        userMessage = 'Service temporarily unavailable. Please try again later.';
        break;
      default:
        if (error.message) {
          userMessage = error.message;
        }
    }

    toast.error(userMessage);

    // In development, log detailed error
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error);
    }
  }, []);

  // Handle network errors
  const handleNetworkError = useCallback((error: any) => {
    const errorData = {
      message: error.message || 'Network error',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: localStorage.getItem('userId') || undefined,
    };

    // Log error for security monitoring
    logSecurityEvent('network_error', errorData);

    // Check if user is offline
    if (!navigator.onLine) {
      toast.error('You are offline. Please check your internet connection.');
    } else {
      toast.error('Network error. Please check your connection and try again.');
    }

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.error('Network Error:', error);
    }
  }, []);

  // Handle validation errors
  const handleValidationError = useCallback((errors: Record<string, string[]>) => {
    const errorData = {
      errors,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: localStorage.getItem('userId') || undefined,
    };

    // Log error for security monitoring
    logSecurityEvent('validation_error', errorData);

    // Show first validation error
    const firstError = Object.values(errors)[0]?.[0];
    if (firstError) {
      toast.error(firstError);
    } else {
      toast.error('Please check your input and try again.');
    }

    // In development, log all validation errors
    if (process.env.NODE_ENV === 'development') {
      console.error('Validation Errors:', errors);
    }
  }, []);

  // Handle timeout errors
  const handleTimeoutError = useCallback((timeout: number) => {
    const errorData = {
      timeout,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: localStorage.getItem('userId') || undefined,
    };

    // Log error for security monitoring
    logSecurityEvent('timeout_error', errorData);

    toast.error(`Request timed out after ${timeout}ms. Please try again.`);

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.error('Timeout Error:', errorData);
    }
  }, []);

  // Handle permission errors
  const handlePermissionError = useCallback((permission: string) => {
    const errorData = {
      permission,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: localStorage.getItem('userId') || undefined,
    };

    // Log error for security monitoring
    logSecurityEvent('permission_error', errorData);

    toast.error(`Permission denied: ${permission}`);

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.error('Permission Error:', errorData);
    }
  }, []);

  // Handle storage errors
  const handleStorageError = useCallback((error: any) => {
    const errorData = {
      message: error.message || 'Storage error',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: localStorage.getItem('userId') || undefined,
    };

    // Log error for security monitoring
    logSecurityEvent('storage_error', errorData);

    toast.error('Storage error. Please try again or contact support.');

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.error('Storage Error:', error);
    }
  }, []);

  // Handle unknown errors
  const handleUnknownError = useCallback((error: any) => {
    const errorData = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: localStorage.getItem('userId') || undefined,
    };

    // Log error for security monitoring
    logSecurityEvent('unknown_error', errorData);

    toast.error('An unexpected error occurred. Please try again or contact support.');

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.error('Unknown Error:', error);
    }
  }, []);

  // Global error handler
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      const error = {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      };

      handleUnknownError(error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = {
        message: event.reason?.message || 'Unhandled promise rejection',
        reason: event.reason,
      };

      handleUnknownError(error);
    };

    // Add global error listeners
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [handleUnknownError]);

  // Error boundary handler
  const handleErrorBoundaryError = useCallback((error: Error, errorInfo: any) => {
    handleReactError(error, errorInfo);
  }, [handleReactError]);

  return {
    handleReactError,
    handleApiError,
    handleNetworkError,
    handleValidationError,
    handleTimeoutError,
    handlePermissionError,
    handleStorageError,
    handleUnknownError,
    handleErrorBoundaryError,
  };
};

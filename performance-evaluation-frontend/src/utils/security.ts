// Security utilities for production deployment

// ============================================================================
// INPUT SANITIZATION
// ============================================================================

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Sanitize user input for safe display
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/script/gi, '') // Remove script tags
    .replace(/iframe/gi, ''); // Remove iframe tags
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ============================================================================
// CSRF PROTECTION
// ============================================================================

/**
 * Get CSRF token from meta tag or cookie
 */
export const getCsrfToken = (): string | null => {
  // Try to get from meta tag first
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  if (metaTag) {
    return metaTag.getAttribute('content');
  }
  
  // Fallback to cookie
  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('XSRF-TOKEN='));
  if (csrfCookie) {
    return decodeURIComponent(csrfCookie.split('=')[1]);
  }
  
  return null;
};

/**
 * Add CSRF token to headers
 */
export const addCsrfHeaders = (headers: Record<string, string> = {}): Record<string, string> => {
  const token = getCsrfToken();
  if (token) {
    headers['X-CSRF-TOKEN'] = token;
    headers['X-Requested-With'] = 'XMLHttpRequest';
  }
  return headers;
};

// ============================================================================
// RATE LIMITING
// ============================================================================

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitInfo>();

/**
 * Check if request is within rate limit
 */
export const checkRateLimit = (
  key: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean => {
  const now = Date.now();
  const stored = rateLimitStore.get(key);
  
  if (!stored || now > stored.resetTime) {
    // Reset or create new rate limit entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }
  
  if (stored.count >= maxRequests) {
    return false;
  }
  
  stored.count++;
  return true;
};

/**
 * Get remaining requests for a key
 */
export const getRemainingRequests = (key: string): number => {
  const stored = rateLimitStore.get(key);
  if (!stored) return 100;
  
  const now = Date.now();
  if (now > stored.resetTime) {
    return 100;
  }
  
  return Math.max(0, 100 - stored.count);
};

// ============================================================================
// CONTENT SECURITY POLICY
// ============================================================================

/**
 * Generate CSP nonce for inline scripts
 */
export const generateCspNonce = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Validate CSP nonce
 */
export const validateCspNonce = (nonce: string): boolean => {
  return /^[a-zA-Z0-9]{20,}$/.test(nonce);
};

// ============================================================================
// URL VALIDATION
// ============================================================================

/**
 * Validate URL format and security
 */
export const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    
    // Check for allowed protocols
    const allowedProtocols = ['http:', 'https:'];
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return false;
    }
    
    // Check for localhost or internal IPs (block in production)
    if (process.env.NODE_ENV === 'production') {
      const hostname = urlObj.hostname.toLowerCase();
      if (hostname === 'localhost' || hostname.startsWith('127.') || hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
        return false;
      }
    }
    
    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitize URL for safe navigation
 */
export const sanitizeUrl = (url: string): string => {
  if (!validateUrl(url)) {
    return '#';
  }
  
  return sanitizeInput(url);
};

// ============================================================================
// FILE UPLOAD SECURITY
// ============================================================================

/**
 * Validate file type
 */
export const validateFileType = (
  file: File,
  allowedTypes: string[]
): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size
 */
export const validateFileSize = (
  file: File,
  maxSizeBytes: number
): boolean => {
  return file.size <= maxSizeBytes;
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * Validate file extension
 */
export const validateFileExtension = (
  filename: string,
  allowedExtensions: string[]
): boolean => {
  const extension = getFileExtension(filename);
  return allowedExtensions.includes(extension);
};

// ============================================================================
// SESSION SECURITY
// ============================================================================

/**
 * Generate secure random string
 */
export const generateSecureRandom = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Hash sensitive data (client-side, for basic protection)
 */
export const hashData = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
};

// ============================================================================
// DOM SECURITY
// ============================================================================

/**
 * Safely set innerHTML with sanitization
 */
export const setSafeInnerHTML = (element: HTMLElement, content: string): void => {
  element.innerHTML = sanitizeHtml(content);
};

/**
 * Create safe anchor element
 */
export const createSafeAnchor = (href: string, text: string): HTMLAnchorElement => {
  const anchor = document.createElement('a');
  anchor.href = sanitizeUrl(href);
  anchor.textContent = sanitizeInput(text);
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  return anchor;
};

// ============================================================================
// API SECURITY
// ============================================================================

/**
 * Sanitize API response data
 */
export const sanitizeApiResponse = (data: any): any => {
  if (typeof data === 'string') {
    return sanitizeInput(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeApiResponse);
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[sanitizeInput(key)] = sanitizeApiResponse(value);
    }
    return sanitized;
  }
  
  return data;
};

/**
 * Validate API response structure
 */
export const validateApiResponse = (response: any): boolean => {
  if (!response || typeof response !== 'object') {
    return false;
  }
  
  // Add specific validation rules based on your API structure
  return true;
};

// ============================================================================
// ENVIRONMENT SECURITY
// ============================================================================

/**
 * Check if running in secure context (HTTPS)
 */
export const isSecureContext = (): boolean => {
  return window.isSecureContext;
};

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Get environment-specific security settings
 */
export const getSecuritySettings = () => {
  return {
    isSecure: isSecureContext(),
    isDevelopment: isDevelopment(),
    enableStrictMode: !isDevelopment(),
    maxFileSize: isDevelopment() ? 10 * 1024 * 1024 : 5 * 1024 * 1024, // 10MB dev, 5MB prod
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    rateLimitRequests: isDevelopment() ? 1000 : 100,
    rateLimitWindow: 60000, // 1 minute
  };
};

// ============================================================================
// AUDIT LOGGING
// ============================================================================

/**
 * Log security events
 */
export const logSecurityEvent = (
  event: string,
  details: Record<string, any> = {}
): void => {
  const securityLog = {
    timestamp: new Date().toISOString(),
    event,
    details,
    userAgent: navigator.userAgent,
    url: window.location.href,
    userId: localStorage.getItem('userId') || 'anonymous',
  };
  
  // In production, send to security monitoring service
  if (!isDevelopment()) {
    // Send to security logging endpoint
    fetch('/api/security/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...addCsrfHeaders(),
      },
      body: JSON.stringify(securityLog),
    }).catch(console.error);
  } else {
    // Log to console in development
    console.warn('Security Event:', securityLog);
  }
};

// ============================================================================
// EXPORT ALL SECURITY UTILITIES
// ============================================================================

export default {
  sanitizeHtml,
  sanitizeInput,
  validateEmail,
  validatePassword,
  getCsrfToken,
  addCsrfHeaders,
  checkRateLimit,
  getRemainingRequests,
  generateCspNonce,
  validateCspNonce,
  validateUrl,
  sanitizeUrl,
  validateFileType,
  validateFileSize,
  validateFileExtension,
  generateSecureRandom,
  hashData,
  setSafeInnerHTML,
  createSafeAnchor,
  sanitizeApiResponse,
  validateApiResponse,
  isSecureContext,
  isDevelopment,
  getSecuritySettings,
  logSecurityEvent,
};

import React from 'react';
import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';

// Import global styles
import './index.css';

// Import the main App component
import App from './App';

// Import error boundary
import ErrorBoundary from './components/error/ErrorBoundary';

// Import performance monitoring
import { usePerformanceMonitoring } from './hooks/usePerformanceMonitoring';

// Import security utilities
import { logSecurityEvent } from './utils/security';

// Performance monitoring wrapper
const PerformanceWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  usePerformanceMonitoring();
  return <>{children}</>;
};

// Initialize application
const initializeApp = () => {
  // Log application initialization
  logSecurityEvent('application_initializing', {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    environment: process.env.NODE_ENV,
  });

  // Check for required browser features
  const requiredFeatures = [
    'serviceWorker' in navigator,
    'fetch' in window,
    'Promise' in window,
    'localStorage' in window,
  ];

  const missingFeatures = requiredFeatures.filter(feature => !feature);
  if (missingFeatures.length > 0) {
    console.error('Missing required browser features:', missingFeatures);
    logSecurityEvent('missing_browser_features', {
      missingFeatures,
      userAgent: navigator.userAgent,
    });
  }

  // Check for secure context in production
  if (process.env.NODE_ENV === 'production' && !window.isSecureContext) {
    console.warn('Application is not running in a secure context');
    logSecurityEvent('insecure_context', {
      url: window.location.href,
      protocol: window.location.protocol,
    });
  }

  // Initialize performance monitoring
  if ('performance' in window) {
    // Mark the start of the application
    performance.mark('app-start');
  }

  // Get the root element
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  // Create React root
  const root = ReactDOM.createRoot(rootElement);

  // Render the application
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <PerformanceWrapper>
          <App />
        </PerformanceWrapper>
      </ErrorBoundary>
    </StrictMode>
  );

  // Mark the end of initial render
  if ('performance' in window) {
    performance.mark('app-rendered');
    performance.measure('app-initialization', 'app-start', 'app-rendered');
  }

  // Log successful initialization
  logSecurityEvent('application_initialized', {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  });

  // Report to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Send to your analytics service
    console.log('Application initialized successfully');
  }
};

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  logSecurityEvent('unhandled_promise_rejection', {
    reason: event.reason?.toString(),
    stack: event.reason?.stack,
    timestamp: new Date().toISOString(),
  });
  event.preventDefault();
});

// Handle global errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  logSecurityEvent('global_error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error?.toString(),
    timestamp: new Date().toISOString(),
  });
});

// Initialize the application
try {
  initializeApp();
} catch (error) {
  console.error('Failed to initialize application:', error);
  logSecurityEvent('initialization_failed', {
    error: error instanceof Error ? error.toString() : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  });
  
  // Show error page
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background-color: #f3f4f6;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="
          text-align: center;
          max-width: 400px;
          padding: 2rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        ">
          <div style="
            width: 64px;
            height: 64px;
            margin: 0 auto 1rem;
            background-color: #ef4444;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h1 style="
            font-size: 1.5rem;
            font-weight: 600;
            color: #111827;
            margin-bottom: 0.5rem;
          ">
            Application Error
          </h1>
          <p style="
            color: #6b7280;
            margin-bottom: 1.5rem;
          ">
            Failed to initialize the application. Please refresh the page or contact support.
          </p>
          <button onclick="window.location.reload()" style="
            background-color: #3b82f6;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.875rem;
          ">
            Refresh Page
          </button>
        </div>
      </div>
    `;
  }
}

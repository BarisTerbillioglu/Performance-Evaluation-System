import { CONFIG } from '@/constants/config';

// Error monitoring interface
interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  additionalData?: Record<string, unknown>;
}

// Performance monitoring interface
interface PerformanceMetric {
  name: string;
  value: number;
  category: 'navigation' | 'resource' | 'paint' | 'largest-contentful-paint' | 'first-input-delay' | 'cumulative-layout-shift';
  timestamp: string;
  url: string;
  userId?: string;
}

// Analytics interface
interface AnalyticsEvent {
  event: string;
  properties: Record<string, unknown>;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

class MonitoringService {
  private isInitialized = false;
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeMonitoring();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeMonitoring(): void {
    if (this.isInitialized) return;

    // Initialize error monitoring
    this.setupErrorMonitoring();
    
    // Initialize performance monitoring
    this.setupPerformanceMonitoring();
    
    // Initialize analytics
    this.setupAnalytics();

    this.isInitialized = true;
  }

  private setupErrorMonitoring(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        userId: this.userId,
        sessionId: this.sessionId,
        additionalData: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        userId: this.userId,
        sessionId: this.sessionId,
        additionalData: {
          reason: event.reason
        }
      });
    });
  }

  private setupPerformanceMonitoring(): void {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.capturePerformanceMetric({
          name: 'largest-contentful-paint',
          value: lastEntry.startTime,
          category: 'largest-contentful-paint',
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userId: this.userId
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.capturePerformanceMetric({
            name: 'first-input-delay',
            value: entry.processingStart - entry.startTime,
            category: 'first-input-delay',
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userId: this.userId
          });
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.capturePerformanceMetric({
          name: 'cumulative-layout-shift',
          value: clsValue,
          category: 'cumulative-layout-shift',
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userId: this.userId
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }

    // Monitor navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.capturePerformanceMetric({
            name: 'page-load-time',
            value: navigation.loadEventEnd - navigation.navigationStart,
            category: 'navigation',
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userId: this.userId
          });
        }
      }, 0);
    });
  }

  private setupAnalytics(): void {
    // Track page views
    this.trackPageView();

    // Track user interactions
    this.setupInteractionTracking();
  }

  private setupInteractionTracking(): void {
    // Track button clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        this.trackEvent('button_click', {
          buttonText: target.textContent?.trim(),
          buttonId: target.id,
          buttonClass: target.className,
          page: window.location.pathname
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.trackEvent('form_submit', {
        formId: form.id,
        formAction: form.action,
        page: window.location.pathname
      });
    });
  }

  private trackPageView(): void {
    this.trackEvent('page_view', {
      page: window.location.pathname,
      title: document.title,
      referrer: document.referrer
    });
  }

  public captureError(error: ErrorInfo): void {
    // Send to Sentry if configured
    if (import.meta.env.VITE_SENTRY_DSN) {
      this.sendToSentry(error);
    }

    // Send to internal API
    this.sendToInternalAPI('/api/monitoring/errors', error);

    // Log to console in development
    if (CONFIG.isDevelopment()) {
      console.error('Error captured:', error);
    }
  }

  public capturePerformanceMetric(metric: PerformanceMetric): void {
    // Send to internal API
    this.sendToInternalAPI('/api/monitoring/performance', metric);

    // Log to console in development
    if (CONFIG.isDevelopment()) {
      console.log('Performance metric captured:', metric);
    }
  }

  public trackEvent(event: string, properties: Record<string, unknown>): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId
    };

    // Send to internal API
    this.sendToInternalAPI('/api/monitoring/analytics', analyticsEvent);

    // Send to Google Analytics if configured
    if (import.meta.env.VITE_GOOGLE_ANALYTICS_ID && window.gtag) {
      window.gtag('event', event, properties);
    }

    // Log to console in development
    if (CONFIG.isDevelopment()) {
      console.log('Analytics event tracked:', analyticsEvent);
    }
  }

  private async sendToInternalAPI(endpoint: string, data: unknown): Promise<void> {
    try {
      await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        // Don't wait for response to avoid blocking
        keepalive: true
      });
    } catch (error) {
      // Silently fail to avoid infinite loops
      if (CONFIG.isDevelopment()) {
        console.warn('Failed to send monitoring data:', error);
      }
    }
  }

  private sendToSentry(error: ErrorInfo): void {
    // Implement Sentry integration
    if (window.Sentry) {
      window.Sentry.captureException(new Error(error.message), {
        extra: error.additionalData,
        tags: {
          userId: error.userId,
          sessionId: error.sessionId
        }
      });
    }
  }

  public setUser(userId: string): void {
    this.userId = userId;
    
    // Update Sentry user context
    if (window.Sentry) {
      window.Sentry.setUser({ id: userId });
    }
  }

  public clearUser(): void {
    this.userId = undefined;
    
    // Clear Sentry user context
    if (window.Sentry) {
      window.Sentry.setUser(null);
    }
  }

  // Public methods for manual tracking
  public trackNavigation(from: string, to: string): void {
    this.trackEvent('navigation', { from, to });
  }

  public trackApiCall(endpoint: string, method: string, duration: number, status: number): void {
    this.trackEvent('api_call', {
      endpoint,
      method,
      duration,
      status,
      success: status >= 200 && status < 300
    });
  }

  public trackUserAction(action: string, details: Record<string, unknown>): void {
    this.trackEvent('user_action', {
      action,
      ...details
    });
  }
}

// Global type declarations
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    Sentry?: {
      captureException: (error: Error, context?: unknown) => void;
      setUser: (user: { id: string } | null) => void;
    };
  }
}

// Export singleton instance
export const monitoringService = new MonitoringService();

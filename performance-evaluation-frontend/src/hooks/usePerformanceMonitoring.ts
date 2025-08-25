import { useEffect, useCallback, useRef } from 'react';
import { logSecurityEvent } from '../utils/security';

interface PerformanceMetrics {
  // Core Web Vitals
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  FCP: number; // First Contentful Paint
  TTFB: number; // Time to First Byte
  
  // Custom metrics
  bundleSize: number;
  apiResponseTime: number;
  renderTime: number;
  memoryUsage: number;
  networkRequests: number;
  
  // User interaction metrics
  timeToInteractive: number;
  firstMeaningfulPaint: number;
  domContentLoaded: number;
  windowLoad: number;
}

interface PerformanceThresholds {
  LCP: number; // 2.5 seconds
  FID: number; // 100 milliseconds
  CLS: number; // 0.1
  FCP: number; // 1.8 seconds
  TTFB: number; // 600 milliseconds
  bundleSize: number; // 500KB
  apiResponseTime: number; // 1 second
  renderTime: number; // 100 milliseconds
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  LCP: 2500,
  FID: 100,
  CLS: 0.1,
  FCP: 1800,
  TTFB: 600,
  bundleSize: 500000,
  apiResponseTime: 1000,
  renderTime: 100,
};

export const usePerformanceMonitoring = (thresholds: Partial<PerformanceThresholds> = {}) => {
  const metricsRef = useRef<Partial<PerformanceMetrics>>({});
  const observerRef = useRef<PerformanceObserver | null>(null);
  const thresholdsRef = useRef({ ...DEFAULT_THRESHOLDS, ...thresholds });

  // Measure Core Web Vitals
  const measureCoreWebVitals = useCallback(() => {
    if (!('PerformanceObserver' in window)) {
      console.warn('PerformanceObserver not supported');
      return;
    }

    // Largest Contentful Paint (LCP)
    try {
      observerRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          const lcp = lastEntry.startTime;
          metricsRef.current.LCP = lcp;
          
          if (lcp > thresholdsRef.current.LCP) {
            console.warn(`LCP (${lcp}ms) exceeds threshold (${thresholdsRef.current.LCP}ms)`);
          }
        }
      });
      observerRef.current.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.error('Error observing LCP:', error);
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          // Use the correct property for FID calculation
          const fid = (entry as any).processingStart ? (entry as any).processingStart - entry.startTime : 0;
          metricsRef.current.FID = fid;
          
          if (fid > thresholdsRef.current.FID) {
            console.warn(`FID (${fid}ms) exceeds threshold (${thresholdsRef.current.FID}ms)`);
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.error('Error observing FID:', error);
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            metricsRef.current.CLS = clsValue;
            
            if (clsValue > thresholdsRef.current.CLS) {
              console.warn(`CLS (${clsValue}) exceeds threshold (${thresholdsRef.current.CLS})`);
            }
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.error('Error observing CLS:', error);
    }

    // First Contentful Paint (FCP)
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcp = entries[0]?.startTime;
        if (fcp) {
          metricsRef.current.FCP = fcp;
          
          if (fcp > thresholdsRef.current.FCP) {
            console.warn(`FCP (${fcp}ms) exceeds threshold (${thresholdsRef.current.FCP}ms)`);
          }
        }
      });
      fcpObserver.observe({ entryTypes: ['first-contentful-paint'] });
    } catch (error) {
      console.error('Error observing FCP:', error);
    }
  }, []);

  // Measure bundle size
  const measureBundleSize = useCallback(() => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const transferSize = navigation.transferSize || 0;
        metricsRef.current.bundleSize = transferSize;
        
        if (transferSize > thresholdsRef.current.bundleSize) {
          console.warn(`Bundle size (${transferSize} bytes) exceeds threshold (${thresholdsRef.current.bundleSize} bytes)`);
        }
      }
    }
  }, []);

  // Measure API response time
  const measureApiResponseTime = useCallback((url: string, startTime: number, endTime: number) => {
    const responseTime = endTime - startTime;
    metricsRef.current.apiResponseTime = responseTime;
    
    if (responseTime > thresholdsRef.current.apiResponseTime) {
      console.warn(`API response time (${responseTime}ms) exceeds threshold (${thresholdsRef.current.apiResponseTime}ms) for ${url}`);
    }
  }, []);

  // Measure render time
  const measureRenderTime = useCallback((componentName: string, startTime: number, endTime: number) => {
    const renderTime = endTime - startTime;
    metricsRef.current.renderTime = renderTime;
    
    if (renderTime > thresholdsRef.current.renderTime) {
      console.warn(`Render time (${renderTime}ms) exceeds threshold (${thresholdsRef.current.renderTime}ms) for ${componentName}`);
    }
  }, []);

  // Measure memory usage
  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metricsRef.current.memoryUsage = memory.usedJSHeapSize;
      
      // Log memory usage if it's high
      const memoryUsageMB = memory.usedJSHeapSize / 1024 / 1024;
      if (memoryUsageMB > 100) { // 100MB threshold
        console.warn(`High memory usage: ${memoryUsageMB.toFixed(2)}MB`);
      }
    }
  }, []);

  // Measure network requests
  const measureNetworkRequests = useCallback(() => {
    if ('performance' in window) {
      const resources = performance.getEntriesByType('resource');
      metricsRef.current.networkRequests = resources.length;
      
      // Log slow resources
      resources.forEach((resource) => {
        if (resource.duration > 1000) { // 1 second threshold
          console.warn(`Slow resource: ${resource.name} took ${resource.duration}ms`);
        }
      });
    }
  }, []);

  // Measure page load metrics
  const measurePageLoadMetrics = useCallback(() => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        metricsRef.current.TTFB = navigation.responseStart - navigation.requestStart;
        metricsRef.current.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        metricsRef.current.windowLoad = navigation.loadEventEnd - navigation.loadEventStart;
        
        // Log slow metrics
        if (metricsRef.current.TTFB > thresholdsRef.current.TTFB) {
          console.warn(`TTFB (${metricsRef.current.TTFB}ms) exceeds threshold (${thresholdsRef.current.TTFB}ms)`);
        }
      }
    }
  }, []);

  // Get current metrics
  const getMetrics = useCallback(() => {
    return { ...metricsRef.current };
  }, []);

  // Report metrics
  const reportMetrics = useCallback(() => {
    const metrics = getMetrics();
    const report = {
      ...metrics,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: localStorage.getItem('userId') || undefined,
    };

    // Log performance metrics
    logSecurityEvent('performance_metrics', report);

    // Send to analytics service in production
    if (process.env.NODE_ENV === 'production') {
      // Send to your analytics service
      console.log('Performance metrics:', report);
    }

    return report;
  }, [getMetrics]);

  // Monitor performance continuously
  const startMonitoring = useCallback(() => {
    // Measure initial metrics
    measureCoreWebVitals();
    measureBundleSize();
    measureMemoryUsage();
    measureNetworkRequests();
    measurePageLoadMetrics();

    // Set up periodic monitoring
    const interval = setInterval(() => {
      measureMemoryUsage();
      measureNetworkRequests();
    }, 30000); // Every 30 seconds

    return () => {
      clearInterval(interval);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [measureCoreWebVitals, measureBundleSize, measureMemoryUsage, measureNetworkRequests, measurePageLoadMetrics]);

  // Initialize monitoring
  useEffect(() => {
    const cleanup = startMonitoring();

    // Report metrics on page unload
    const handleBeforeUnload = () => {
      reportMetrics();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      cleanup();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [startMonitoring, reportMetrics]);

  // Performance monitoring utilities
  const createPerformanceTimer = useCallback((name: string) => {
    const startTime = performance.now();
    
    return {
      end: () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        console.log(`${name} took ${duration.toFixed(2)}ms`);
        return duration;
      },
    };
  }, []);

  const measureAsyncOperation = useCallback(async <T>(
    name: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    const timer = createPerformanceTimer(name);
    try {
      const result = await operation();
      timer.end();
      return result;
    } catch (error) {
      timer.end();
      throw error;
    }
  }, [createPerformanceTimer]);

  return {
    getMetrics,
    reportMetrics,
    measureApiResponseTime,
    measureRenderTime,
    createPerformanceTimer,
    measureAsyncOperation,
    startMonitoring,
  };
};

import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  renderCount: number;
  averageRenderTime: number;
  slowRenders: number;
}

interface UsePerformanceMonitorOptions {
  componentName?: string;
  slowRenderThreshold?: number; // in milliseconds
  logToConsole?: boolean;
  onSlowRender?: (metrics: PerformanceMetrics) => void;
}

export function usePerformanceMonitor(options: UsePerformanceMonitorOptions = {}) {
  const {
    componentName = 'Component',
    slowRenderThreshold = 16, // 60fps = ~16ms per frame
    logToConsole = false,
    onSlowRender,
  } = options;

  const metricsRef = useRef<PerformanceMetrics>({
    renderTime: 0,
    renderCount: 0,
    averageRenderTime: 0,
    slowRenders: 0,
  });

  const startTimeRef = useRef<number>(0);

  const startRender = useCallback(() => {
    startTimeRef.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTimeRef.current;
    
    const metrics = metricsRef.current;
    metrics.renderCount++;
    metrics.renderTime = renderTime;
    metrics.averageRenderTime = 
      (metrics.averageRenderTime * (metrics.renderCount - 1) + renderTime) / metrics.renderCount;

    if (renderTime > slowRenderThreshold) {
      metrics.slowRenders++;
      
      if (logToConsole) {
        console.warn(
          `Slow render detected in ${componentName}:`,
          `${renderTime.toFixed(2)}ms (threshold: ${slowRenderThreshold}ms)`
        );
      }
      
      onSlowRender?.(metrics);
    }

    if (logToConsole && metrics.renderCount % 10 === 0) {
      console.log(
        `${componentName} performance:`,
        `Render #${metrics.renderCount}`,
        `Time: ${renderTime.toFixed(2)}ms`,
        `Avg: ${metrics.averageRenderTime.toFixed(2)}ms`,
        `Slow renders: ${metrics.slowRenders}`
      );
    }
  }, [componentName, slowRenderThreshold, logToConsole, onSlowRender]);

  useEffect(() => {
    startRender();
    return () => {
      endRender();
    };
  });

  return {
    metrics: metricsRef.current,
    startRender,
    endRender,
  };
}

// Hook for monitoring specific operations
export function useOperationTimer(operationName: string) {
  const startTimeRef = useRef<number>(0);
  const operationCountRef = useRef<number>(0);
  const totalTimeRef = useRef<number>(0);

  const startOperation = useCallback(() => {
    startTimeRef.current = performance.now();
  }, []);

  const endOperation = useCallback(() => {
    const endTime = performance.now();
    const duration = endTime - startTimeRef.current;
    
    operationCountRef.current++;
    totalTimeRef.current += duration;
    
    const averageTime = totalTimeRef.current / operationCountRef.current;
    
    console.log(
      `${operationName}:`,
      `Duration: ${duration.toFixed(2)}ms`,
      `Average: ${averageTime.toFixed(2)}ms`,
      `Count: ${operationCountRef.current}`
    );
    
    return duration;
  }, [operationName]);

  return {
    startOperation,
    endOperation,
    getStats: () => ({
      totalOperations: operationCountRef.current,
      totalTime: totalTimeRef.current,
      averageTime: operationCountRef.current > 0 
        ? totalTimeRef.current / operationCountRef.current 
        : 0,
    }),
  };
}

// Hook for monitoring memory usage
export function useMemoryMonitor(componentName?: string) {
  useEffect(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      
      const logMemoryUsage = () => {
        const used = memory.usedJSHeapSize / 1024 / 1024; // MB
        const total = memory.totalJSHeapSize / 1024 / 1024; // MB
        const limit = memory.jsHeapSizeLimit / 1024 / 1024; // MB
        
        console.log(
          `${componentName || 'Component'} memory usage:`,
          `Used: ${used.toFixed(2)}MB`,
          `Total: ${total.toFixed(2)}MB`,
          `Limit: ${limit.toFixed(2)}MB`,
          `Usage: ${((used / limit) * 100).toFixed(1)}%`
        );
      };

      // Log memory usage every 30 seconds
      const interval = setInterval(logMemoryUsage, 30000);
      
      return () => clearInterval(interval);
    }
  }, [componentName]);
}

// Hook for monitoring network requests
export function useNetworkMonitor() {
  const requestCountRef = useRef<number>(0);
  const slowRequestsRef = useRef<number>(0);
  const totalRequestTimeRef = useRef<number>(0);

  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = performance.now();
      requestCountRef.current++;
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        totalRequestTimeRef.current += duration;
        
        if (duration > 1000) { // 1 second threshold
          slowRequestsRef.current++;
          console.warn(
            'Slow network request detected:',
            args[0],
            `${duration.toFixed(2)}ms`
          );
        }
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.error(
          'Network request failed:',
          args[0],
          `Duration: ${duration.toFixed(2)}ms`,
          error
        );
        
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return {
    getStats: () => ({
      totalRequests: requestCountRef.current,
      slowRequests: slowRequestsRef.current,
      averageRequestTime: requestCountRef.current > 0 
        ? totalRequestTimeRef.current / requestCountRef.current 
        : 0,
    }),
  };
}

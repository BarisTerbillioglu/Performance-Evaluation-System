import { useCallback, useRef, useMemo } from 'react';

/**
 * Optimized callback hook that prevents unnecessary re-renders
 * by memoizing callbacks and providing stable references
 */
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

/**
 * Debounced callback hook
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay, ...deps]
  );
}

/**
 * Throttled callback hook
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const lastCallRef = useRef(0);
  const lastCallTimerRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCallRef.current >= delay) {
        callback(...args);
        lastCallRef.current = now;
      } else {
        if (lastCallTimerRef.current) {
          clearTimeout(lastCallTimerRef.current);
        }
        lastCallTimerRef.current = setTimeout(() => {
          callback(...args);
          lastCallRef.current = Date.now();
        }, delay - (now - lastCallRef.current));
      }
    }) as T,
    [callback, delay, ...deps]
  );
}

/**
 * Stable callback that only changes when dependencies actually change
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const depsRef = useRef(deps);
  const callbackRef = useRef(callback);

  // Check if dependencies actually changed
  const depsChanged = useMemo(() => {
    if (depsRef.current.length !== deps.length) return true;
    return deps.some((dep, index) => depsRef.current[index] !== dep);
  }, deps);

  if (depsChanged) {
    depsRef.current = deps;
    callbackRef.current = callback;
  }

  return useCallback(
    ((...args: Parameters<T>) => {
      return callbackRef.current(...args);
    }) as T,
    [depsChanged]
  );
}

/**
 * Callback that runs only once
 */
export function useOnceCallback<T extends (...args: any[]) => any>(callback: T): T {
  const hasRunRef = useRef(false);
  
  return useCallback(
    ((...args: Parameters<T>) => {
      if (!hasRunRef.current) {
        hasRunRef.current = true;
        return callback(...args);
      }
    }) as T,
    [callback]
  );
}

/**
 * Callback that resets after a delay
 */
export function useResetCallback<T extends (...args: any[]) => any>(
  callback: T,
  resetDelay: number,
  deps: React.DependencyList = []
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      const result = callback(...args);
      
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = undefined;
      }, resetDelay);
      
      return result;
    }) as T,
    [callback, resetDelay, ...deps]
  );
}

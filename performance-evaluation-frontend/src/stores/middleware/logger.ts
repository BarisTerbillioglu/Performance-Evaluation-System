import { StateCreator } from 'zustand';
import { isDevelopment } from '@/constants/config';

type Logger<T> = (
  f: StateCreator<T, [], [], T>,
  name?: string
) => StateCreator<T, [], [], T>;

type LoggerImpl = <T>(
  f: StateCreator<T, [], [], T>,
  name?: string
) => StateCreator<T, [], [], T>;

const loggerImpl: LoggerImpl = (f, name) => (set, get, store) => {
  const loggedSet: typeof set = (...a: Parameters<typeof set>) => {
    if (isDevelopment()) {
      const prevState = get();
      set(...a);
      const nextState = get();
      
      console.group(`%c🏪 ${name || 'Store'} Update`, 'color: #4CAF50; font-weight: bold;');
      console.log('%cPrevious State:', 'color: #9E9E9E; font-weight: bold;', prevState);
      console.log('%cAction:', 'color: #2196F3; font-weight: bold;', a);
      console.log('%cNext State:', 'color: #4CAF50; font-weight: bold;', nextState);
      console.groupEnd();
    } else {
      set(...a);
    }
  };
  
  return f(loggedSet, get, store);
};

export const logger = loggerImpl as unknown as Logger<any>;

// Enhanced logger with action tracking
type LoggerWithActions<T> = (
  f: StateCreator<T, [], [], T>,
  options?: {
    name?: string;
    enabled?: boolean;
    logActions?: boolean;
    logState?: boolean;
  }
) => StateCreator<T, [], [], T>;

const loggerWithActionsImpl = <T>(
  f: StateCreator<T, [], []>,
  options: {
    name?: string;
    enabled?: boolean;
    logActions?: boolean;
    logState?: boolean;
  } = {}
) => (set, get, store) => {
  const {
    name = 'Store',
    enabled = isDevelopment(),
    logActions = true,
    logState = true,
  } = options;
  
  if (!enabled) {
    return f(set, get, store);
  }
  
  const loggedSet: typeof set = (...a) => {
    const prevState = logState ? get() : null;
    const start = performance.now();
    
    set(...a);
    
    const end = performance.now();
    const nextState = logState ? get() : null;
    
    if (logActions || logState) {
      console.group(
        `%c🏪 ${name} Update (${(end - start).toFixed(2)}ms)`,
        'color: #4CAF50; font-weight: bold;'
      );
      
      if (logState && prevState) {
        console.log('%cPrevious State:', 'color: #9E9E9E; font-weight: bold;', prevState);
      }
      
      if (logActions) {
        console.log('%cAction:', 'color: #2196F3; font-weight: bold;', a);
      }
      
      if (logState && nextState) {
        console.log('%cNext State:', 'color: #4CAF50; font-weight: bold;', nextState);
        
        // Show state diff for better debugging
        if (prevState && nextState) {
          const diff = getStateDiff(prevState, nextState);
          if (Object.keys(diff).length > 0) {
            console.log('%cState Diff:', 'color: #FF9800; font-weight: bold;', diff);
          }
        }
      }
      
      console.groupEnd();
    }
  };
  
  return f(loggedSet, get, store);
};

export const loggerWithActions = loggerWithActionsImpl as unknown as LoggerWithActions<any>;

// Utility function to get state differences
function getStateDiff(prev: any, next: any): Record<string, any> {
  const diff: Record<string, any> = {};
  
  // Simple shallow diff - can be enhanced for deep diff if needed
  const allKeys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  
  for (const key of allKeys) {
    if (prev[key] !== next[key]) {
      diff[key] = {
        from: prev[key],
        to: next[key],
      };
    }
  }
  
  return diff;
}

// Error boundary for store actions
export const withErrorBoundary = <T>(
  f: StateCreator<T, [], [], T>,
  onError?: (error: Error, action: string) => void
) => (set: any, get: any, store: any) => {
  const errorBoundarySet = (...args: any[]) => {
    try {
      set(...args);
    } catch (error) {
      console.error('Store action failed:', error);
      if (onError) {
        onError(error as Error, 'unknown');
      }
      // Optionally set error state
      if (typeof get().setError === 'function') {
        get().setError((error as Error).message);
      }
    }
  };
  
  return f(errorBoundarySet, get, store);
};

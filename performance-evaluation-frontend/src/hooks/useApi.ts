import { useState, useCallback } from 'react';
import { LoadingState, ApiError } from '@/types';

interface UseApiState<T> {
  data: T | null;
  loading: LoadingState;
  error: ApiError | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: unknown[]) => Promise<T>;
  reset: () => void;
}

export const useApi = <T>(
  apiFunction: (...args: unknown[]) => Promise<T>
): UseApiReturn<T> => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: 'idle',
    error: null,
  });

  const execute = useCallback(
    async (...args: unknown[]): Promise<T> => {
      setState(prev => ({ ...prev, loading: 'loading', error: null }));
      
      try {
        const result = await apiFunction(...args);
        setState({
          data: result,
          loading: 'succeeded',
          error: null,
        });
        return result;
      } catch (error) {
        const apiError = error as ApiError;
        setState({
          data: null,
          loading: 'failed',
          error: apiError,
        });
        throw error;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: 'idle',
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};

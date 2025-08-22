// Export all stores and selectors
export * from './slices/authStore';
export * from './slices/evaluationStore';
export * from './slices/userStore';
export * from './slices/criteriaStore';
export * from './slices/uiStore';

// Export types
export * from './types';

// Export middleware
export * from './middleware';

// Import the hooks
import { useAuthStore, authSelectors } from './slices/authStore';
import { useEvaluationStore, evaluationSelectors } from './slices/evaluationStore';
import { useUserStore, userSelectors } from './slices/userStore';
import { useCriteriaStore, criteriaSelectors } from './slices/criteriaStore';
import { useUIStore, uiSelectors } from './slices/uiStore';

// Combined store hook for convenience
export const useStores = () => ({
  auth: useAuthStore,
  evaluation: useEvaluationStore,
  user: useUserStore,
  criteria: useCriteriaStore,
  ui: useUIStore,
});

// Combined selectors
export const selectors = {
  auth: authSelectors,
  evaluation: evaluationSelectors,
  user: userSelectors,
  criteria: criteriaSelectors,
  ui: uiSelectors,
};

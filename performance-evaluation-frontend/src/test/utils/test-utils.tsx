import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });



// Mock data generators
export const createMockUser = (overrides = {}) => ({
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  departmentName: 'Engineering',
  isActive: true,
  roleNames: ['Developer'],
  lastLoginDate: '2024-01-15T10:30:00Z',
  ...overrides,
});

export const createMockDepartment = (overrides = {}) => ({
  id: 1,
  name: 'Engineering',
  description: 'Software Engineering Department',
  ...overrides,
});

export const createMockTeam = (overrides = {}) => ({
  id: 1,
  name: 'Frontend Team',
  description: 'Frontend Development Team',
  departmentId: 1,
  departmentName: 'Engineering',
  parentTeamId: null,
  parentTeamName: null,
  memberCount: 5,
  evaluatorCount: 2,
  isActive: true,
  createdDate: '2024-01-01T00:00:00Z',
  updatedDate: '2024-01-15T00:00:00Z',
  ...overrides,
});

// Wait for loading states to complete
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

// Mock IntersectionObserver
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
};

// Mock ResizeObserver
export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.ResizeObserver = mockResizeObserver;
};

// Export everything
export * from '@testing-library/react';
export { customRender as render };

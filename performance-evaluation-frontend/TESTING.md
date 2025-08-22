# Testing Guide

This document provides a comprehensive guide to testing the Performance Evaluation System frontend application.

## Table of Contents

- [Overview](#overview)
- [Testing Stack](#testing-stack)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [E2E Testing](#e2e-testing)
- [Accessibility Testing](#accessibility-testing)
- [Performance Testing](#performance-testing)
- [Test Utilities](#test-utilities)
- [Mock Data](#mock-data)
- [Running Tests](#running-tests)
- [Best Practices](#best-practices)

## Overview

The application uses a comprehensive testing strategy with multiple layers:

- **Unit Tests**: Test individual components and functions in isolation
- **Integration Tests**: Test API interactions and component integration
- **E2E Tests**: Test complete user workflows
- **Accessibility Tests**: Ensure WCAG compliance
- **Performance Tests**: Monitor rendering and runtime performance

## Testing Stack

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **MSW (Mock Service Worker)**: API mocking
- **Playwright**: E2E testing
- **jest-axe**: Accessibility testing
- **@testing-library/user-event**: User interaction simulation

## Unit Testing

### Component Testing

Components are tested using React Testing Library with custom render utilities:

```typescript
import { render, screen, fireEvent } from '@/test/utils/test-utils';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Hook Testing

Custom hooks are tested using React Testing Library's `renderHook`:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '@/hooks/useCounter';

describe('useCounter', () => {
  it('increments counter', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

### Service Testing

API services are tested with MSW for mocking:

```typescript
import { rest } from 'msw';
import { server } from '@/test/mocks/server';
import { userService } from '@/services/userService';

describe('userService', () => {
  it('fetches users successfully', async () => {
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(ctx.json({ data: mockUsers }));
      })
    );

    const result = await userService.getUsers();
    expect(result.data).toHaveLength(2);
  });
});
```

## Integration Testing

Integration tests focus on component interactions and API integration:

### Form Testing

```typescript
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils';
import { UserForm } from '@/components/UserForm';

describe('UserForm Integration', () => {
  it('submits form successfully', async () => {
    const onSubmit = jest.fn();
    render(<UserForm onSubmit={onSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });
  });
});
```

### Store Testing

Zustand stores are tested for state management:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useUserStore } from '@/stores/userStore';

describe('UserStore', () => {
  it('manages user state', () => {
    const { result } = renderHook(() => useUserStore());
    
    act(() => {
      result.current.setUser(mockUser);
    });
    
    expect(result.current.user).toEqual(mockUser);
  });
});
```

## E2E Testing

E2E tests use Playwright to test complete user workflows:

### Authentication Flow

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'user@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveURL('/dashboard');
  });
});
```

### User Management Flow

```typescript
test.describe('User Management', () => {
  test('should create new user', async ({ page }) => {
    await page.goto('/users');
    await page.click('[data-testid="add-user-button"]');
    await page.fill('[data-testid="first-name"]', 'John');
    await page.fill('[data-testid="last-name"]', 'Doe');
    await page.fill('[data-testid="email"]', 'john@example.com');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=User created successfully')).toBeVisible();
  });
});
```

## Accessibility Testing

Accessibility tests ensure WCAG compliance:

```typescript
import { render } from '@/test/utils/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/components/ui/button';

expect.extend(toHaveNoViolations);

describe('Button Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## Performance Testing

Performance tests monitor rendering and runtime performance:

```typescript
describe('Component Performance', () => {
  it('should render efficiently', () => {
    const startTime = performance.now();
    render(<DataTable data={largeDataset} />);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100);
  });
});
```

## Test Utilities

### Custom Render Function

```typescript
// src/test/utils/test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

export const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });
```

### Mock Data Generators

```typescript
// src/test/utils/test-utils.tsx
export const createMockUser = (overrides = {}) => ({
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  ...overrides,
});
```

## Mock Data

### MSW Handlers

```typescript
// src/test/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json({ data: mockUsers }));
  }),
  
  rest.post('/api/users', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json(createdUser));
  }),
];
```

### Mock Store State

```typescript
// src/test/mocks/store.ts
export const mockStoreState = {
  user: createMockUser(),
  departments: mockDepartments,
  teams: mockTeams,
};
```

## Running Tests

### Unit and Integration Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- Button.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="Button"
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode
npm run test:e2e:headed

# Run specific E2E test file
npm run test:e2e -- auth.spec.ts
```

### All Tests

```bash
# Run unit, integration, and E2E tests
npm run test:all
```

## Test Coverage

The project aims for comprehensive test coverage:

- **Statements**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%

## Best Practices

### Component Testing

1. **Test behavior, not implementation**
   ```typescript
   // Good
   expect(screen.getByRole('button')).toBeInTheDocument();
   
   // Avoid
   expect(container.querySelector('.btn')).toBeInTheDocument();
   ```

2. **Use semantic queries**
   ```typescript
   // Good
   screen.getByRole('button', { name: /submit/i });
   screen.getByLabelText(/email/i);
   
   // Avoid
   screen.getByTestId('submit-button');
   ```

3. **Test user interactions**
   ```typescript
   fireEvent.click(screen.getByRole('button'));
   fireEvent.change(screen.getByLabelText(/email/i), {
     target: { value: 'test@example.com' },
   });
   ```

### API Testing

1. **Mock API responses**
   ```typescript
   server.use(
     rest.get('/api/users', (req, res, ctx) => {
       return res(ctx.json({ data: mockUsers }));
     })
   );
   ```

2. **Test error scenarios**
   ```typescript
   server.use(
     rest.get('/api/users', (req, res, ctx) => {
       return res(ctx.status(500));
     })
   );
   ```

### E2E Testing

1. **Use data attributes for selectors**
   ```typescript
   await page.click('[data-testid="add-user-button"]');
   ```

2. **Test complete user workflows**
   ```typescript
   test('complete user creation flow', async ({ page }) => {
     // Navigate to page
     // Fill form
     // Submit
     // Verify success
   });
   ```

3. **Mock external dependencies**
   ```typescript
   await page.route('**/api/users', async route => {
     await route.fulfill({
       status: 200,
       body: JSON.stringify(mockUsers),
     });
   });
   ```

### Performance Testing

1. **Set realistic thresholds**
   ```typescript
   expect(renderTime).toBeLessThan(100); // 100ms threshold
   ```

2. **Test with realistic data sizes**
   ```typescript
   const largeDataset = Array.from({ length: 1000 }, createMockUser);
   ```

3. **Monitor memory usage**
   ```typescript
   const memoryIncrease = finalMemory - initialMemory;
   expect(memoryIncrease).toBeLessThan(1024 * 1024); // 1MB
   ```

## Continuous Integration

Tests are automatically run in CI/CD pipelines:

- Unit and integration tests run on every commit
- E2E tests run on pull requests
- Performance tests run nightly
- Accessibility tests run weekly

## Debugging Tests

### Jest Debugging

```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test with debugging
npm test -- --testNamePattern="Button" --verbose
```

### Playwright Debugging

```bash
# Run tests with debugging
npm run test:e2e -- --debug

# Run tests with headed mode
npm run test:e2e -- --headed
```

### Visual Testing

```bash
# Run tests with screenshots
npm run test:e2e -- --screenshot=only-on-failure

# Run tests with video recording
npm run test:e2e -- --video=retain-on-failure
```

## Resources

- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [MSW Documentation](https://mswjs.io/docs/)
- [jest-axe Documentation](https://github.com/nickcolley/jest-axe)

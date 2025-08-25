# Authentication System Documentation

## Overview

This document describes the complete authentication system implemented for the Performance Evaluation System, which uses JWT tokens stored in HTTP-only cookies for security.

## Architecture

### Authentication Flow

1. **Login**: User submits credentials → Server validates → JWT tokens set in HTTP-only cookies
2. **API Calls**: Axios automatically includes cookies with `withCredentials: true`
3. **Token Refresh**: Automatic refresh on 401 responses using HTTP-only cookies
4. **Logout**: Server clears cookies, client clears local state

### Security Features

- **HTTP-only Cookies**: JWT tokens stored in secure, HTTP-only cookies
- **Automatic Token Refresh**: Seamless token renewal without user interaction
- **CORS Configuration**: Properly configured for cookie handling
- **Role-based Access Control**: Comprehensive RBAC system
- **Error Handling**: Consistent error responses and status codes

## API Configuration

### Base Configuration

```typescript
// constants/config.ts
export const CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5282',
  APP_NAME: 'Performance Evaluation System',
  VERSION: '1.0.0',
} as const;
```

### Axios Setup

```typescript
// services/api.ts
const api = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable HTTP-only cookies
});
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/auth/login` | Login user | `{ email, password }` | `LoginResponse` |
| GET | `/api/auth/me` | Get current user | - | `UserInfo` |
| POST | `/api/auth/refresh` | Refresh token | - | `RefreshTokenResponse` |
| POST | `/api/auth/logout` | Logout user | - | `{ message }` |

### User Management Endpoints

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| GET | `/api/user` | Get all users | `page`, `pageSize`, `search`, `department`, `role` |
| GET | `/api/user/{id}` | Get user by ID | - |
| POST | `/api/user` | Create user | `CreateUserRequest` |
| PUT | `/api/user/{id}` | Update user | `UpdateUserRequest` |
| DELETE | `/api/user/{id}` | Delete user | - |
| GET | `/api/user/evaluators` | Get evaluators | - |
| GET | `/api/user/employees` | Get employees | - |
| GET | `/api/user/departments/{id}/employees` | Get department employees | - |

### Other Endpoints

- **Departments**: `/api/department/*`
- **Teams**: `/api/team/*`
- **Evaluations**: `/api/evaluation/*`
- **Criteria**: `/api/criteria/*`
- **Criteria Categories**: `/api/criteriacategory/*`
- **Dashboard**: `/api/dashboard/*`
- **Files**: `/api/file/*`

## TypeScript Interfaces

### Core Authentication Types

```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  user: UserInfo;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

interface UserInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  departmentId?: number;
  roleIds: number[];
}

interface RefreshTokenResponse {
  message: string;
  expiresAt: Date;
}
```

### Entity Types

```typescript
interface UserDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  departmentId?: number;
  departmentName?: string;
  roleIds: number[];
  roleNames: string[];
  isActive: boolean;
  createdDate: Date;
  updatedDate?: Date;
}

interface PagedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

## Services

### Auth Service

```typescript
export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse>,
  getCurrentUser: async (): Promise<UserInfo>,
  refreshToken: async (): Promise<RefreshTokenResponse>,
  logout: async (): Promise<{ message: string }>,
  checkAuth: async (): Promise<UserInfo | null>,
};
```

### Other Services

- `userService`: User management operations
- `departmentService`: Department CRUD operations
- `teamService`: Team management
- `evaluationService`: Evaluation operations
- `criteriaService`: Criteria management
- `criteriaCategoryService`: Criteria categories
- `dashboardService`: Dashboard data
- `fileService`: File upload/download

## Role-Based Access Control

### Role Hierarchy

```typescript
enum UserRole {
  EMPLOYEE = 1,    // Basic access
  EVALUATOR = 2,   // Can evaluate others
  MANAGER = 3,     // Can manage teams/departments
  ADMIN = 4,       // Full system access
}
```

### Policies

```typescript
export const POLICIES = {
  ADMIN_ONLY: [UserRole.ADMIN],
  EVALUATOR_OR_ADMIN: [UserRole.EVALUATOR, UserRole.MANAGER, UserRole.ADMIN],
  ALL_USERS: [UserRole.EMPLOYEE, UserRole.EVALUATOR, UserRole.MANAGER, UserRole.ADMIN],
};
```

### Permission System

```typescript
// Check if user has role
const hasRole = (user: UserInfo | null, role: UserRole): boolean

// Check if user has permission
const hasPermission = (user: UserInfo | null, resource: string, action: string): boolean

// Check if user can access route
const canAccessRoute = (user: UserInfo | null, path: string): boolean
```

## Authentication Store

### State Management

```typescript
interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}
```

### Actions

```typescript
interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (resource: string, action: string) => boolean;
  canAccessRoute: (path: string) => boolean;
  clearError: () => void;
}
```

## Usage Examples

### Login Component

```typescript
import { useAuth } from '@/store';
import { loginSchema } from '@/utils/validation';

export const LoginPage: React.FC = () => {
  const { login, state } = useAuth();
  
  const onSubmit = async (data: LoginFormData) => {
    try {
      await login({
        email: data.email,
        password: data.password,
      });
      // Redirect handled automatically
    } catch (error) {
      // Handle error
    }
  };
  
  // Component JSX...
};
```

### Protected Route

```typescript
import { useAuth } from '@/store';
import { UserRole } from '@/types/roles';

export const ProtectedComponent: React.FC = () => {
  const { hasRole, hasPermission } = useAuth();
  
  if (!hasRole(UserRole.ADMIN)) {
    return <div>Access denied</div>;
  }
  
  if (!hasPermission('users', 'create')) {
    return <div>Insufficient permissions</div>;
  }
  
  return <div>Protected content</div>;
};
```

### API Service Usage

```typescript
import { userService } from '@/services';

// Get users with pagination
const users = await userService.getUsers({
  page: 1,
  pageSize: 10,
  search: 'john',
  department: 'IT'
});

// Create user
const newUser = await userService.createUser({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'password123',
  departmentId: 1,
  roleIds: [UserRole.EMPLOYEE]
});
```

## Error Handling

### API Error Format

```typescript
interface ApiError {
  message: string;
  errors?: { [key: string]: string[] };
  status?: number;
  details?: any;
}
```

### Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

### Error Handling in Components

```typescript
try {
  const result = await apiService.someOperation();
} catch (error) {
  if (error.status === 401) {
    // Handle unauthorized - redirect to login
  } else if (error.status === 403) {
    // Handle forbidden - show access denied
  } else {
    // Handle other errors
    console.error('Operation failed:', error.message);
  }
}
```

## Styling

### VakıfBank Design System

The authentication system uses the VakıfBank-inspired design system with:

- **Primary Colors**: Yellow/Orange (`#F59E0B`)
- **Background**: Gradient from primary-50 to white
- **Typography**: Inter font family
- **Components**: Consistent button, input, and card styles

### Login Page Features

- Beautiful gradient background
- Modern card-based layout
- Form validation with error messages
- Loading states and animations
- Responsive design
- Password visibility toggle
- Error handling with user-friendly messages

## Security Considerations

1. **HTTP-only Cookies**: Prevents XSS attacks
2. **Automatic Token Refresh**: Maintains session security
3. **CORS Configuration**: Properly configured for cookie handling
4. **Role-based Access**: Granular permission system
5. **Error Handling**: No sensitive information in error messages
6. **Form Validation**: Client and server-side validation

## Environment Setup

### Required Environment Variables

```bash
VITE_API_BASE_URL=http://localhost:5282
```

### CORS Configuration (Backend)

The backend must be configured to allow credentials:

```csharp
app.UseCors(options => options
    .WithOrigins("http://localhost:5173") // Frontend URL
    .AllowCredentials()
    .AllowAnyMethod()
    .AllowAnyHeader());
```

## Testing

### Unit Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginPage } from './LoginPage';

test('login form validation', () => {
  render(<LoginPage />);
  
  const emailInput = screen.getByLabelText(/email/i);
  const passwordInput = screen.getByLabelText(/password/i);
  
  fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
  fireEvent.change(passwordInput, { target: { value: '123' } });
  
  expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
  expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
});
```

### Integration Tests

```typescript
import { authService } from '@/services';

test('login flow', async () => {
  const credentials = {
    email: 'test@example.com',
    password: 'password123'
  };
  
  const response = await authService.login(credentials);
  expect(response.success).toBe(true);
  expect(response.user).toBeDefined();
});
```

## Deployment

### Production Considerations

1. **HTTPS**: Required for secure cookie transmission
2. **Domain Configuration**: Ensure proper CORS origins
3. **Environment Variables**: Configure production API URLs
4. **Error Monitoring**: Implement error tracking
5. **Performance**: Optimize bundle size and loading

### Build Configuration

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check backend CORS configuration
2. **Cookie Not Set**: Verify `withCredentials: true`
3. **Token Refresh Fails**: Check refresh endpoint configuration
4. **Permission Denied**: Verify user roles and permissions
5. **API Errors**: Check network tab for detailed error responses

### Debug Mode

Enable debug logging in development:

```typescript
if (import.meta.env.DEV) {
  console.log('Auth state:', state);
  console.log('API response:', response);
}
```

## Conclusion

This authentication system provides a secure, scalable, and user-friendly foundation for the Performance Evaluation System. It follows modern security best practices and provides comprehensive role-based access control while maintaining a beautiful user interface.

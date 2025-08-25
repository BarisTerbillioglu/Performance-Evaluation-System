# User Management System

A comprehensive user management system built with React, TypeScript, and the VakıfBank design system. This system provides administrators with powerful tools to manage users, roles, and permissions across the organization.

## Features

### 🎯 Core Functionality
- **User CRUD Operations**: Create, read, update, and delete users
- **Role Management**: Assign and manage user roles with different permissions
- **Department Assignment**: Organize users by departments
- **User Status Management**: Activate/deactivate user accounts
- **Bulk Operations**: Perform actions on multiple users simultaneously

### 📊 Analytics & Reporting
- **User Statistics Dashboard**: Real-time overview of user metrics
- **Department Distribution**: Visual representation of users by department
- **Role Analytics**: Distribution of users across different roles
- **Activity Tracking**: Monitor user activity and system usage

### 🔍 Advanced Search & Filtering
- **Global Search**: Search by name, email, or other user attributes
- **Advanced Filters**: Filter by department, role, status, and date ranges
- **Pagination**: Efficient handling of large user lists
- **Sortable Columns**: Sort users by any column

### 📱 Mobile Responsive
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Touch-Friendly Interface**: Optimized for touch interactions
- **Card Layout**: Mobile-optimized user cards for better UX

### 🔐 Security & Permissions
- **Role-Based Access Control**: Different permissions for different roles
- **Audit Trail**: Track all user management activities
- **Email Validation**: Real-time email uniqueness checking
- **Password Strength**: Password strength indicator for new users

## Components

### Main Components

#### `UserManagementPage`
The main user management interface with:
- User list/grid view with sorting and filtering
- Bulk action capabilities
- Statistics dashboard
- Import/export functionality

#### `UserFormModal`
Comprehensive user creation/editing form with:
- Real-time validation
- Password strength indicator
- Email uniqueness checking
- Role assignment interface
- Department selection

#### `UserProfileModal`
Detailed user profile view with:
- Tabbed interface (Overview, Evaluations, Teams, Activity)
- Contact information
- Role and permission details
- Team memberships
- Account statistics

#### `UserCard`
Mobile-responsive user card component for:
- Touch-friendly interactions
- Quick user information display
- Action buttons for common operations

#### `UserManagementDashboard`
Analytics dashboard showing:
- Key user metrics
- Department and role distributions
- Recent activity
- Quick action buttons

### Supporting Components

#### `BulkActionsModal`
Modal for performing bulk operations on selected users:
- Bulk activate/deactivate
- Bulk role assignment
- Bulk department transfer
- Bulk delete with confirmation

#### `ImportExportModal`
Handles user data import/export:
- CSV import with validation
- Template download
- Export filtered user lists
- Import error reporting

#### `AuditTrailModal`
Displays audit trail for user management activities:
- User creation/modification history
- Admin action tracking
- Timestamp and user information

## API Integration

### User Service Methods

```typescript
// Core user operations
getUsers(params?: UserSearchParams): Promise<PagedResult<UserDto[]>>
getUserById(id: number): Promise<UserWithDetailsDto>
createUser(userData: CreateUserRequest): Promise<UserDto>
updateUser(id: number, userData: UpdateUserRequest): Promise<UserDto>
deleteUser(id: number): Promise<{ message: string }>

// User status management
activateUser(id: number): Promise<{ message: string }>
deactivateUser(id: number): Promise<{ message: string }>

// Bulk operations
bulkActivateUsers(userIds: number[]): Promise<{ message: string }>
bulkDeactivateUsers(userIds: number[]): Promise<{ message: string }>
bulkDeleteUsers(userIds: number[]): Promise<{ message: string }>
bulkAssignRoles(userIds: number[], roleIds: number[]): Promise<{ message: string }>
bulkAssignDepartments(userIds: number[], departmentId: number): Promise<{ message: string }>

// Import/Export
importUsers(file: File): Promise<ImportResult>
exportUsers(filters?: UserSearchRequest): Promise<Blob>

// Validation and statistics
checkEmailUniqueness(email: string, excludeUserId?: number): Promise<{ isUnique: boolean }>
getUserStatistics(): Promise<UserStatistics>
```

## Design System Integration

The User Management System uses the VakıfBank design system with:

### Color Scheme
- **Primary**: Yellow (#F59E0B) for main actions and highlights
- **Success**: Green for positive actions and active states
- **Error**: Red for destructive actions and inactive states
- **Info**: Blue for informational elements
- **Warning**: Orange for warning states

### Components
- **Button**: Multiple variants (primary, secondary, ghost, danger)
- **Badge**: Status indicators with different colors
- **Card**: Content containers with consistent styling
- **Input**: Form inputs with validation states
- **Select**: Dropdown components for selections

### Typography
- **Headings**: Bold, professional typography
- **Body Text**: Clean, readable fonts
- **Labels**: Clear, descriptive text

## Usage Examples

### Basic User Management

```typescript
import { UserManagementPage } from '@/pages/users';

// In your route configuration
<Route path="/users" element={<UserManagementPage />} />
```

### Custom User Form

```typescript
import { UserFormModal } from '@/pages/users/components';

const handleAddUser = () => {
  showModal({
    type: 'custom',
    title: 'Add New User',
    size: 'lg',
    component: UserFormModal,
    props: {
      onSuccess: () => {
        // Handle success
        loadUsers();
        showNotification({
          type: 'success',
          title: 'Success',
          message: 'User created successfully'
        });
      }
    }
  });
};
```

### User Profile View

```typescript
import { UserProfileModal } from '@/pages/users/components';

const handleViewUser = (user: UserSearchDto) => {
  showModal({
    type: 'custom',
    title: 'User Profile',
    size: 'xl',
    component: UserProfileModal,
    props: {
      userId: user.id,
      onEdit: () => handleEditUser(user)
    }
  });
};
```

## Configuration

### Environment Variables

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=VakıfBank Performance Evaluation

# Feature Flags
VITE_ENABLE_USER_IMPORT=true
VITE_ENABLE_BULK_OPERATIONS=true
VITE_ENABLE_AUDIT_TRAIL=true
```

### TypeScript Types

```typescript
// User types
interface UserSearchDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  departmentName: string;
  roles: string[];
  isActive: boolean;
  createdDate: string;
  lastLoginDate?: string;
}

interface UserWithDetailsDto extends BaseEntity {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: number;
  departmentName: string;
  roles: RoleAssignmentDto[];
  teams: TeamSummaryDto[];
  isActive: boolean;
  profilePicture?: string;
  phoneNumber?: string;
  jobTitle?: string;
}

// Request types
interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  departmentId: number;
  roleIds: number[];
  isActive: boolean;
  phoneNumber?: string;
  jobTitle?: string;
}

interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  departmentId?: number;
  isActive?: boolean;
  phoneNumber?: string;
  jobTitle?: string;
  roleIds?: number[];
}
```

## Best Practices

### Performance Optimization
- Use pagination for large user lists
- Implement debounced search
- Cache department and role data
- Optimistic updates for better UX

### Security Considerations
- Validate all user inputs
- Implement proper role-based access control
- Log all user management activities
- Use secure password requirements

### Accessibility
- Provide keyboard navigation
- Include proper ARIA labels
- Ensure color contrast compliance
- Support screen readers

### Error Handling
- Display user-friendly error messages
- Implement retry mechanisms
- Provide fallback states
- Log errors for debugging

## Contributing

When contributing to the User Management System:

1. Follow the existing code style and patterns
2. Use TypeScript for all new code
3. Add proper error handling
4. Include unit tests for new features
5. Update documentation as needed
6. Test on multiple devices and screen sizes

## Support

For questions or issues with the User Management System:

1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information
4. Contact the development team

---

**Built with ❤️ for VakıfBank Performance Evaluation System**

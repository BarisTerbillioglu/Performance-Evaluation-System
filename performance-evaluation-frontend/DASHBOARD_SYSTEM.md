# Dashboard System Documentation

## Overview

The Performance Evaluation System now features a comprehensive role-based dashboard system built with the VakıfBank design system. The dashboard provides different views and functionality based on user roles.

## Architecture

### Layout Structure

```
DashboardLayout
├── Sidebar (Role-based navigation)
├── Header (Breadcrumbs, user profile, notifications)
└── Main Content (Role-specific dashboard pages)
```

### Components

#### Core Layout Components

- **DashboardLayout**: Main layout wrapper with sidebar and header
- **Sidebar**: Role-based navigation with collapsible functionality
- **Header**: Top navigation with breadcrumbs and user profile dropdown

#### Dashboard Components

- **DashboardCard**: Reusable card component with variants
- **StatCard**: Specialized card for displaying metrics
- **QuickActionButton**: Action buttons for common tasks
- **RecentActivity**: Activity feed component

#### Role-Based Dashboard Pages

- **AdminDashboard**: System-wide statistics and management
- **EvaluatorDashboard**: Team management and evaluation tools
- **EmployeeDashboard**: Personal performance tracking

## Role-Based Navigation

### Admin Navigation
- Dashboard
- User Management
- Department Management
- Team Management
- Criteria Management
- Evaluation Management
- Reports & Analytics
- System Settings

### Evaluator/Manager Navigation
- Dashboard
- My Team
- Evaluate Performance
- Team Reports
- Evaluation History

### Employee Navigation
- Dashboard
- My Performance
- Performance History
- Goals & Feedback

## Design System

### VakıfBank Styling
- **Primary Color**: Yellow (#F59E0B) for accents and CTAs
- **Background**: Clean white with subtle gray borders
- **Typography**: Professional hierarchy with proper spacing
- **Shadows**: Minimal shadows for depth
- **Responsive**: Mobile-first design approach

### Card Variants
- `default`: Standard white background
- `accent`: Light yellow background for highlights
- `highlight`: Yellow background with white text
- `success`: Green accent for positive metrics
- `warning`: Orange accent for warnings
- `error`: Red accent for errors

## API Integration

### Dashboard Endpoints
- `GET /api/dashboard/overview` - General statistics
- `GET /api/dashboard/admin-stats` - Admin-specific data
- `GET /api/dashboard/team-performance` - Evaluator-specific data
- `GET /api/dashboard/personal-performance` - Employee-specific data

### Data Structures
- `AdminStatisticsDto`: System-wide metrics
- `TeamPerformanceDto`: Team and evaluation data
- `PersonalPerformanceDto`: Individual performance data

## Features

### Admin Dashboard
- Total users and evaluations
- Department performance overview
- System health indicators
- Quick actions for management tasks
- Recent system activity feed

### Evaluator Dashboard
- Team member overview
- Pending evaluations
- Team performance metrics
- Quick evaluation actions
- Recent evaluation activity

### Employee Dashboard
- Personal performance score
- Department ranking
- Recent evaluations
- Performance trends
- Upcoming evaluation reminders

### Responsive Design
- **Mobile**: Collapsible sidebar, stacked cards
- **Tablet**: 2-column card layout
- **Desktop**: 3-4 column grid for cards
- Touch-friendly navigation

### Interactive Elements
- Hover effects on cards and buttons
- Loading skeleton states
- Error handling with retry mechanisms
- Click outside to close dropdowns
- Mobile overlay for sidebar

## State Management

### Dashboard Data
- Cached dashboard statistics
- Loading states for all components
- Error handling and retry logic
- Real-time updates (future enhancement)

### User Preferences
- Sidebar collapsed state
- Dashboard layout preferences
- Notification settings

## Quick Actions

### Admin Quick Actions
- Add New User
- Create Evaluation Period
- Manage Users
- Manage Criteria
- System Settings

### Evaluator Quick Actions
- Start Evaluation
- View Team Report
- View My Team
- Evaluation History
- Team Reports

### Employee Quick Actions
- View My Latest Evaluation
- Update Goals
- View My Performance
- Performance History
- Goals & Feedback

## Performance Optimizations

### Code Splitting
- Lazy loading for dashboard pages
- Suspense boundaries for loading states
- Optimized bundle splitting

### Caching
- Dashboard data caching
- API response caching
- Component memoization

### Accessibility
- ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- Color contrast compliance

## Future Enhancements

### Planned Features
- Real-time notifications
- Advanced analytics charts
- Export functionality
- Custom dashboard layouts
- Widget customization
- Dark mode support

### Performance Improvements
- Virtual scrolling for large lists
- Image optimization
- Service worker caching
- Progressive web app features

## Usage Examples

### Basic Dashboard Card
```tsx
<StatCard
  title="Total Users"
  value={1234}
  subtitle="Active employees"
  icon={<UsersIcon />}
  trend={{ value: 12, direction: 'up', label: 'vs last month' }}
/>
```

### Quick Action Button
```tsx
<QuickActionButton
  label="Add New User"
  icon={<PlusIcon />}
  to="/users/create"
  variant="primary"
/>
```

### Recent Activity
```tsx
<RecentActivity
  title="Recent System Activity"
  activities={activities}
  loading={loading}
  maxItems={5}
/>
```

## Troubleshooting

### Common Issues
1. **Sidebar not collapsing**: Check z-index and transform properties
2. **Mobile navigation issues**: Verify overlay and touch events
3. **API errors**: Check network requests and error boundaries
4. **Performance issues**: Monitor bundle size and lazy loading

### Debug Tools
- React DevTools for component inspection
- Network tab for API debugging
- Console for error messages
- Lighthouse for performance analysis

## Contributing

### Development Guidelines
1. Follow the VakıfBank design system
2. Use TypeScript for type safety
3. Implement responsive design
4. Add proper error handling
5. Write unit tests for components
6. Document new features

### Code Structure
- Components in `src/components/dashboard/`
- Pages in `src/pages/dashboard/`
- Types in `src/types/dashboard.ts`
- Services in `src/services/dashboardService.ts`

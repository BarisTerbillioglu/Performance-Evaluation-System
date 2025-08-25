# Team Management System

## Overview

The Team Management System provides comprehensive team management capabilities for both evaluators and administrators in the Performance Evaluation System. It features role-based access control, advanced team analytics, member assignment, and performance tracking.

## Features

### 🎯 Evaluator Dashboard
- **Team Overview**: Complete team statistics and performance metrics
- **Member Management**: View and manage team members with performance data
- **Quick Actions**: Start evaluations, view reports, and export data
- **Performance Tracking**: Real-time performance trends and analytics
- **Recent Activity**: Track team activities and changes

### 🏢 Admin Management
- **Team Administration**: Create, edit, and delete teams
- **Member Assignment**: Advanced drag-and-drop member management
- **Bulk Operations**: Mass team operations and member transfers
- **Team Templates**: Predefined team structures for quick creation
- **Analytics**: Comprehensive team performance analytics
- **Export/Import**: Data export and team template management

### 📊 Analytics & Reporting
- **Performance Metrics**: Team and individual performance tracking
- **Trend Analysis**: Performance trends over time
- **Department Comparison**: Compare team performance across departments
- **Goal Setting**: Team performance goals and OKR tracking
- **Custom Reports**: Generate detailed team reports

## Architecture

### Components Structure

```
src/pages/teams/
├── TeamsPage.tsx                 # Main routing component
├── TeamDashboard.tsx             # Evaluator dashboard
├── TeamManagementPage.tsx        # Admin management interface
└── components/
    ├── TeamStatsCard.tsx         # Statistics display cards
    ├── TeamMemberCard.tsx        # Individual member cards
    ├── PerformanceTrendChart.tsx # Mini performance charts
    ├── TeamAssignmentPanel.tsx   # Member assignment interface
    ├── TeamTemplatesModal.tsx    # Team template management
    ├── TeamGoalsModal.tsx        # Goal setting interface
    └── TeamAnnouncementsModal.tsx # Team communications
```

### Data Flow

1. **Authentication**: Role-based access control determines user interface
2. **Data Loading**: API calls fetch team data, statistics, and member information
3. **State Management**: React state manages UI interactions and data updates
4. **API Integration**: Comprehensive service layer handles all team operations
5. **Real-time Updates**: Live data updates and notifications

## API Integration

### Core Endpoints

```typescript
// Team Operations
GET /api/team                    // Get all teams
GET /api/team/{id}              // Get team details
POST /api/team                  // Create team
PUT /api/team/{id}              // Update team
DELETE /api/team/{id}           // Delete team

// Team Members
GET /api/team/{id}/members      // Get team members
POST /api/team/{id}/members     // Add members
DELETE /api/team/{id}/members/{userId} // Remove member

// Dashboard & Analytics
GET /api/dashboard/team-performance // Evaluator dashboard
GET /api/team/{id}/analytics    // Team analytics
GET /api/team/statistics        // Admin statistics

// User Management
GET /api/user/available-for-team // Available users
GET /api/user/evaluators        // Evaluator list
PUT /api/user/{id}/team         // Assign user to team

// Bulk Operations
POST /api/team/bulk-operations  // Bulk team operations
POST /api/team/bulk-transfer    // Member transfer
POST /api/team/bulk-assignment  // Bulk member assignment
```

### Data Types

```typescript
// Core Team Types
interface TeamDto {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  departmentId?: number;
  departmentName?: string;
}

interface TeamWithMembersDto extends TeamDto {
  members: TeamAssignmentDto[];
  memberCount: number;
  evaluatorCount: number;
  employeeCount: number;
}

// Dashboard Types
interface TeamDashboardStatsDto {
  totalMembers: number;
  activeEvaluations: number;
  completedEvaluations: number;
  completionRate: number;
  teamAverageScore: number;
  departmentAverageScore: number;
  pendingEvaluations: number;
  overdueEvaluations: number;
  topPerformers: TeamMemberDto[];
  recentActivity: ActivityItem[];
}

// Member Types
interface TeamMemberDto {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  avatar?: string;
  isEvaluator: boolean;
  currentEvaluationStatus: 'pending' | 'in_progress' | 'completed' | 'overdue';
  latestScore?: number;
  performanceTrend: 'improving' | 'declining' | 'stable';
  performanceHistory: PerformanceData[];
}
```

## User Experience

### Evaluator Workflow

1. **Dashboard Access**: View team overview with key metrics
2. **Member Management**: See team member performance and status
3. **Quick Actions**: Start evaluations, view reports, export data
4. **Performance Tracking**: Monitor team and individual performance
5. **Communication**: Send messages and view team announcements

### Admin Workflow

1. **Team Creation**: Create teams with templates or custom structures
2. **Member Assignment**: Assign and manage team members
3. **Bulk Operations**: Perform mass operations on multiple teams
4. **Analytics Review**: Analyze team performance and trends
5. **Goal Setting**: Set and track team performance goals

## Design System Integration

### VakıfBank Design Elements

- **Color Scheme**: Yellow primary (#fbbf24) with professional grays
- **Typography**: Clean, readable fonts with proper hierarchy
- **Cards**: White cards with subtle shadows and yellow accents
- **Buttons**: Primary yellow buttons with secondary white variants
- **Badges**: Color-coded status indicators
- **Icons**: Lucide React icons for consistency

### Responsive Design

- **Mobile**: Stacked layouts with touch-friendly interactions
- **Tablet**: Grid layouts with side panels
- **Desktop**: Full-featured interface with advanced controls

## Performance Features

### Loading States
- Skeleton loading for team cards
- Progressive loading for member lists
- Smooth transitions for drag-and-drop
- Loading indicators for bulk operations

### Error Handling
- Graceful handling of assignment conflicts
- Clear error messages for validation failures
- Retry mechanisms for failed operations
- User-friendly conflict resolution

### Real-time Updates
- Live team member count updates
- Real-time evaluation progress
- Instant performance metric updates
- Collaborative team editing

## Security & Validation

### Business Rules
- Prevent evaluator from being in their own team
- Warn about team size limits
- Check department conflicts
- Validate evaluator permissions
- Ensure data integrity during transfers

### Access Control
- Role-based interface rendering
- Permission-based action availability
- Secure API endpoint access
- Audit trail for team changes

## Future Enhancements

### Planned Features
- **Team Templates**: Advanced template system with role definitions
- **Team Communication**: Integrated messaging and announcements
- **Goal Management**: OKR tracking and goal achievement
- **Advanced Analytics**: Machine learning insights and predictions
- **Mobile App**: Native mobile application for team management

### Integration Opportunities
- **HR Systems**: Integration with HR management systems
- **Communication Tools**: Slack, Teams integration
- **Calendar Systems**: Meeting scheduling and team events
- **Document Management**: Team document sharing and collaboration

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- React 18+
- TypeScript 4.8+
- Tailwind CSS 3.0+

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Configuration
1. Update API endpoints in `src/services/teamService.ts`
2. Configure authentication in `src/store/authStore.tsx`
3. Set up environment variables for API URLs
4. Configure role-based access control

### Usage Examples

```typescript
// Load team dashboard data
const dashboardData = await teamService.getTeamDashboardStats();

// Add member to team
await teamService.addTeamMember(teamId, {
  userId: 123,
  role: 'Developer'
});

// Export team data
const blob = await teamService.exportTeamData(teamId, 'excel');
```

## Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Use VakıfBank design system components
3. Implement proper error handling
4. Add comprehensive unit tests
5. Document new features

### Code Style
- Use functional components with hooks
- Implement proper TypeScript interfaces
- Follow ESLint and Prettier configurations
- Use meaningful component and variable names

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Maintainer**: Performance Evaluation System Team

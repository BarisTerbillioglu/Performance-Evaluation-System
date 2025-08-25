# System Settings & Configuration Module

A comprehensive system administration and configuration module for the Performance Evaluation System, built with the VakıfBank design system.

## 🎯 Overview

The System Settings & Configuration module provides administrators with powerful tools to manage all aspects of the Performance Evaluation System, from basic application settings to advanced system monitoring and health tracking.

## 🏗️ Architecture

### Core Components

- **SystemSettingsPage**: Main settings hub with tabbed navigation
- **UserPreferencesModal**: Personal user preferences management
- **SystemHealthDashboard**: Real-time system monitoring and health tracking
- **SettingsTab**: Tabbed navigation component
- **SettingCard**: Individual setting group containers
- **ToggleSwitch**: Boolean setting controls
- **ColorPicker**: Branding color selection
- **FileUploadArea**: Logo and asset upload functionality

### Service Layer

- **SettingsService**: Comprehensive API service for all settings operations
- **Type Definitions**: Complete TypeScript interfaces for all settings categories

## 📋 Features

### 1. System Administration Settings

#### General System Configuration
- System name and branding customization
- Default evaluation period settings (quarterly, yearly, custom)
- Default score scale configuration (1-5, 1-10, custom)
- Evaluation deadline settings (auto-reminders, grace periods)
- Language and localization settings
- Time zone configuration for multi-location organizations

#### Email & Notification Settings
- SMTP server configuration
- Email template customization
- Notification frequency settings (immediate, daily, weekly)
- Reminder schedule configuration
- System notification preferences
- Email signature customization

#### Security & Access Settings
- Password policy configuration (length, complexity, expiration)
- Session timeout settings
- Multi-factor authentication toggle
- IP access restrictions
- API rate limiting configuration
- Audit log retention settings

#### Data & Backup Settings
- Database backup schedule configuration
- Data retention policies
- Export/import settings
- Data privacy controls
- GDPR compliance settings
- Data archival policies

### 2. User Preference Management

#### Personal Settings Interface
- Personal information management
- Profile photo upload
- Contact information
- Department and role display preferences
- Language preference selection
- Time zone personal settings

#### Dashboard Preferences
- Dashboard layout customization
- Widget selection and arrangement
- Default view preferences (list/grid)
- Chart type preferences
- Notification preferences
- Theme selection

#### Evaluation Preferences
- Default evaluation period preferences
- Auto-save frequency settings
- Comment template preferences
- Score display preferences
- Evaluation reminder settings
- Progress tracking preferences

### 3. Organization Structure Settings

#### Department & Role Management
- Add/edit/delete departments
- Department hierarchy management
- Department-specific settings
- Default evaluation criteria per department
- Department lead assignment
- Inter-department reporting relationships

#### Role & Permission Management
- Custom role creation and editing
- Permission matrix configuration
- Role-based access control settings
- Default role assignments
- Role hierarchy definition
- Special permission grants

### 4. Evaluation System Configuration

#### Evaluation Process Settings
- Evaluation approval process settings
- Multi-step evaluation workflows
- Evaluation review requirements
- Score modification permissions
- Evaluation deadline enforcement
- Late evaluation handling policies

#### Criteria System Settings
- Default criteria templates
- Criteria weight validation rules
- Role-specific description requirements
- Criteria usage analytics settings
- Criteria versioning and history
- Custom criteria field configurations

### 5. Reporting & Analytics Settings

#### Report Configuration
- Default report templates
- Report scheduling permissions
- Report sharing policies
- Export format preferences
- Report retention policies
- Custom report builder permissions

#### Analytics Configuration
- Performance metric definitions
- Benchmark data sources
- Trend analysis settings
- Comparative analysis parameters
- Data visualization preferences
- Real-time analytics toggles

### 6. API Integration & Developer Settings

#### API Configuration
- API key generation and management
- Rate limiting configuration
- API endpoint permissions
- Webhook configuration for integrations
- External system integration settings
- API usage monitoring and logs

#### Integration Settings
- LDAP/Active Directory integration
- Single Sign-On (SSO) configuration
- Third-party HR system integration
- Calendar system integration
- Email system integration
- File storage integration settings

### 7. System Health & Monitoring

#### Performance Monitoring
- System response time tracking
- Database performance metrics
- User activity monitoring
- Error rate tracking
- Storage usage monitoring
- Memory and CPU usage displays

#### Health Dashboard
- Real-time system status
- Service health monitoring
- Performance metrics visualization
- Error tracking and logging
- User activity analytics
- System alerts and notifications

## 🎨 Design System Integration

### VakıfBank Styling
- Yellow accent colors for active tabs and buttons
- Professional form layouts with proper spacing
- Card-based organization of setting groups
- Consistent typography and spacing throughout
- Mobile-responsive settings panels

### Component Styling
- Professional input fields with VakıfBank styling
- Toggle switches for boolean settings
- Dropdown selections with proper styling
- Color pickers for branding customization
- File upload areas for logos and assets
- Save/Cancel buttons with proper states

## 🚀 Usage

### Basic System Settings

```tsx
import { SystemSettingsPage } from '../pages/settings/SystemSettingsPage';

// In your router or app
<Route path="/settings" element={<SystemSettingsPage />} />
```

### User Preferences Modal

```tsx
import { UserPreferencesModal } from '../components/settings';

const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

<UserPreferencesModal
  isOpen={isPreferencesOpen}
  onClose={() => setIsPreferencesOpen(false)}
  userId={currentUser.id}
/>
```

### System Health Dashboard

```tsx
import { SystemHealthDashboard } from '../components/settings';

<SystemHealthDashboard
  refreshInterval={30}
  className="p-6"
/>
```

### Individual Settings Components

```tsx
import { 
  SettingsTab, 
  SettingCard, 
  ToggleSwitch, 
  ColorPicker,
  FileUploadArea 
} from '../components/settings';

// Tabbed navigation
<SettingsTab
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>

// Setting group
<SettingCard
  title="Email Settings"
  description="Configure email notifications"
  icon={<EmailIcon />}
>
  <ToggleSwitch
    label="Enable Email Notifications"
    checked={emailEnabled}
    onChange={setEmailEnabled}
  />
</SettingCard>

// Color picker
<ColorPicker
  label="Primary Color"
  value={primaryColor}
  onChange={setPrimaryColor}
  presetColors={vakifbankColors}
/>

// File upload
<FileUploadArea
  label="Company Logo"
  onFileSelect={handleLogoUpload}
  acceptedFileTypes={['image/*']}
  maxFileSize={5}
/>
```

## 🔧 API Integration

### Settings Service

```tsx
import { SettingsService } from '../services/settingsService';

// Get all system settings
const settings = await SettingsService.getSystemSettings();

// Update specific category
await SettingsService.updateSystemSettingsCategory('email', {
  enableEmailNotifications: true,
  smtp: { host: 'smtp.gmail.com', port: 587 }
});

// Get user preferences
const preferences = await SettingsService.getUserPreferences();

// Update user preferences
await SettingsService.updateUserPreferences('dashboard', {
  layout: 'grid',
  defaultView: 'overview'
});

// Get system health
const health = await SettingsService.getSystemHealth();
```

### API Endpoints

The module integrates with the following API endpoints:

- `GET /api/settings/system` - Get all system settings
- `PUT /api/settings/system` - Update system settings
- `GET /api/settings/user` - Get user preferences
- `PUT /api/settings/user` - Update user preferences
- `GET /api/system/health` - Get system health status
- `GET /api/system/stats` - Get system statistics
- `GET /api/system/logs` - Get system logs (Admin only)

## 🔒 Security & Permissions

### Role-Based Access Control

The settings module implements comprehensive role-based access control:

- **Admin**: Full access to all settings
- **Manager**: Access to department and evaluation settings
- **Evaluator**: Access to evaluation and reporting settings
- **Employee**: Access to personal preferences only

### Permission Matrix

```typescript
// System Settings Permissions
'settings.view'     // View system settings
'settings.edit'     // Edit system settings
'settings.admin'    // Full admin access

// User Management
'users.view'        // View users
'users.create'      // Create users
'users.edit'        // Edit users
'users.delete'      // Delete users

// System Administration
'system.health'     // View system health
'system.backup'     // Perform backups
'system.restore'    // Restore from backup
'system.logs'       // View system logs
```

## 📱 Mobile Responsiveness

All settings components are fully responsive and optimized for mobile devices:

- Touch-friendly controls
- Collapsible setting categories
- Mobile-optimized form inputs
- Responsive grid layouts
- Touch-friendly toggles and buttons

## 🧪 Testing

### Component Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { SystemSettingsPage } from '../pages/settings/SystemSettingsPage';

test('renders system settings page', () => {
  render(<SystemSettingsPage />);
  expect(screen.getByText('System Settings')).toBeInTheDocument();
});

test('toggles email notifications', () => {
  render(<SystemSettingsPage />);
  const toggle = screen.getByLabelText('Enable Email Notifications');
  fireEvent.click(toggle);
  expect(toggle).toBeChecked();
});
```

### Service Testing

```tsx
import { SettingsService } from '../services/settingsService';

test('loads system settings', async () => {
  const settings = await SettingsService.getSystemSettings();
  expect(settings).toHaveProperty('application');
  expect(settings).toHaveProperty('email');
  expect(settings).toHaveProperty('security');
});
```

## 🔄 State Management

The settings module uses React hooks for state management:

- `useState` for local component state
- `useEffect` for data loading and side effects
- Custom hooks for reusable logic
- Context for global settings state (if needed)

## 📊 Performance Optimization

### Lazy Loading
- Settings components are lazy-loaded for better performance
- Tab content is only rendered when active
- Images and assets are optimized

### Caching
- Settings data is cached to reduce API calls
- User preferences are cached locally
- System health data is cached with TTL

### Memoization
- Expensive calculations are memoized
- Component re-renders are optimized
- List rendering is optimized with keys

## 🚨 Error Handling

### Graceful Degradation
- Settings load with fallback values
- API errors are handled gracefully
- User-friendly error messages
- Retry mechanisms for failed requests

### Validation
- Form validation on client and server
- Type safety with TypeScript
- Input sanitization
- File upload validation

## 🔧 Configuration

### Environment Variables

```env
# Settings Configuration
REACT_APP_SETTINGS_CACHE_TTL=300
REACT_APP_HEALTH_REFRESH_INTERVAL=30
REACT_APP_MAX_FILE_UPLOAD_SIZE=5242880
REACT_APP_ENABLE_ANALYTICS=true
```

### Feature Flags

```typescript
// Feature flags for settings
const FEATURES = {
  ADVANCED_SECURITY: process.env.REACT_APP_ENABLE_ADVANCED_SECURITY === 'true',
  API_MANAGEMENT: process.env.REACT_APP_ENABLE_API_MANAGEMENT === 'true',
  SYSTEM_MONITORING: process.env.REACT_APP_ENABLE_SYSTEM_MONITORING === 'true',
};
```

## 📈 Analytics & Monitoring

### Usage Tracking
- Settings page visits
- Configuration changes
- Feature usage statistics
- Error tracking and reporting

### Performance Monitoring
- Page load times
- API response times
- Component render performance
- Memory usage tracking

## 🔮 Future Enhancements

### Planned Features
- Advanced workflow builder
- Custom field builder
- Advanced reporting templates
- Real-time collaboration features
- Mobile app integration
- Advanced analytics dashboard

### Technical Improvements
- WebSocket integration for real-time updates
- Advanced caching strategies
- Performance optimizations
- Enhanced security features
- Better accessibility support

## 📚 Documentation

### Additional Resources
- [API Documentation](../api/README.md)
- [Design System Guide](../design-system/README.md)
- [Component Library](../components/README.md)
- [Testing Guide](../test/README.md)

### Support
For questions or issues with the System Settings module, please refer to:
- Component documentation
- API documentation
- Design system guidelines
- Testing documentation

---

**Built with ❤️ for VakıfBank Performance Evaluation System**

# Criteria Management System

A comprehensive criteria management system for administrators to manage evaluation criteria, categories, and weight distribution using the VakıfBank design system.

## Overview

The Criteria Management System provides administrators with powerful tools to:

- **Manage Criteria Categories**: Create, edit, and organize evaluation criteria into categories with weight distribution
- **Define Evaluation Criteria**: Create detailed criteria with role-specific descriptions
- **Weight Management**: Visual weight distribution with real-time validation and rebalancing tools
- **Advanced Filtering**: Filter criteria by various parameters including role coverage and usage frequency
- **Bulk Operations**: Perform bulk actions on multiple criteria
- **Role-Based Descriptions**: Create role-specific descriptions for different user types

## Features

### 1. Category Statistics Dashboard

**Overview Page** provides comprehensive statistics and insights:

- **Metric Cards**: Total active categories, weight distribution, categories needing attention, active criteria count
- **Weight Distribution Visualization**: Interactive chart showing category weight distribution
- **Category Performance Analysis**: Most used categories, categories needing attention, weight issues
- **Quick Actions**: Direct access to weight validation and category management

### 2. Category Weight Management

**Advanced weight management with visual controls**:

- **Interactive Weight Editing**: Real-time weight adjustment with validation
- **Visual Weight Chart**: Color-coded weight distribution display
- **Auto-Rebalancing**: Automatic weight distribution tools
- **Drag & Drop**: Reorder categories with drag and drop functionality
- **Weight Validation**: Real-time validation ensuring total equals 100%

### 3. Criteria Management

**Comprehensive criteria management interface**:

- **Grid/List Views**: Toggle between grid and list view modes
- **Advanced Filtering**: Filter by category, status, role coverage, usage frequency
- **Bulk Operations**: Select and perform actions on multiple criteria
- **Role Coverage Indicators**: Visual indicators showing role description completion
- **Usage Analytics**: Mock usage frequency indicators (to be replaced with real data)

### 4. Create/Edit Criteria Modal

**Multi-tab criteria creation and editing**:

- **Basic Information**: Name, category, base description, active status
- **Role Descriptions**: Role-specific descriptions for Admin, Manager, Evaluator, Employee
- **Advanced Settings**: Display order, importance weight, score ranges, comment thresholds
- **Preview Mode**: Preview how criteria appears to different roles

## Components

### Main Components

#### `CriteriaManagementPage`
The main entry point for the criteria management system.

**Features:**
- Three main views: Overview, Categories, Criteria
- Navigation tabs with counts
- Modal management for forms and dialogs
- State management for filters and selections

#### `CategoryStatisticsDashboard`
Comprehensive dashboard showing category statistics and performance metrics.

**Features:**
- Metric cards with trends and status indicators
- Weight distribution visualization
- Category performance analysis
- Quick action buttons

#### `CategoryWeightManagement`
Advanced weight management interface with visual controls.

**Features:**
- Interactive weight editing
- Visual weight distribution chart
- Auto-rebalancing tools
- Drag and drop category reordering
- Real-time validation

#### `CriteriaGrid`
Grid and list view for criteria management.

**Features:**
- Toggle between grid and list views
- Bulk selection and operations
- Role coverage indicators
- Usage frequency indicators
- Expandable role descriptions

#### `CriteriaFilters`
Advanced filtering interface for criteria.

**Features:**
- Search functionality
- Category filtering
- Status filtering
- Role coverage filtering
- Usage frequency filtering
- Quick filter presets

#### `CreateCriteriaModal`
Multi-tab modal for creating and editing criteria.

**Features:**
- Basic information tab
- Role descriptions tab with completion tracking
- Advanced settings tab
- Preview tab
- Form validation

### Supporting Components

#### `WeightValidationModal`
Modal for weight validation and rebalancing.

#### `ImportExportModal`
Modal for importing and exporting criteria data.

#### `VersionHistoryModal`
Modal for viewing criteria version history.

#### `CriteriaPreviewModal`
Modal for previewing criteria as different roles.

## API Integration

### Category Operations

```typescript
// Get all categories
GET /api/criteriacategory

// Get single category
GET /api/criteriacategory/{id}

// Create category (Admin only)
POST /api/criteriacategory

// Update category (Admin only)
PUT /api/criteriacategory/{id}

// Delete category (Admin only)
DELETE /api/criteriacategory/{id}

// Get active categories
GET /api/criteriacategory/active

// Validate weights
GET /api/criteriacategory/validate-weights

// Rebalance weights (Admin only)
POST /api/criteriacategory/rebalance-weights
```

### Criteria Operations

```typescript
// Get all criteria with filtering
GET /api/criteria

// Get single criteria
GET /api/criteria/{id}

// Create criteria (Admin only)
POST /api/criteria

// Update criteria (Admin only)
PUT /api/criteria/{id}

// Delete criteria (Admin only)
DELETE /api/criteria/{id}

// Get active criteria
GET /api/criteria/active
```

### Role Description Operations

```typescript
// Add role description
POST /api/criteria/role-description

// Update role description
PUT /api/criteria/role-description/{id}

// Delete role description
DELETE /api/criteria/role-description/{id}

// Get role descriptions for criteria
GET /api/criteria/{id}/role-descriptions
```

## Data Types

### Category Types

```typescript
interface CriteriaCategoryDto {
  id: number;
  name: string;
  description?: string;
  weight: number;
  isActive: boolean;
  createdDate: Date;
  updatedDate?: Date;
}

interface WeightValidationDto {
  isValid: boolean;
  totalWeight: number;
  categories: CategoryWeightDto[];
  errors: string[];
}

interface CategoryWeightDto {
  categoryId: number;
  categoryName: string;
  currentWeight: number;
  proposedWeight: number;
}
```

### Criteria Types

```typescript
interface CriteriaDto {
  id: number;
  categoryId: number;
  name: string;
  baseDescription?: string;
  categoryName: string;
  categoryWeight: number;
  isActive: boolean;
  roleDescriptions: CriteriaRoleDescriptionDto[];
}

interface CriteriaRoleDescriptionDto {
  id: number;
  criteriaId: number;
  roleId: number;
  roleName: string;
  description: string;
  isActive: boolean;
}
```

## Usage Examples

### Basic Category Management

```typescript
import { useCriteriaCategories } from '@/hooks/useCriteriaCategories';

const { categories, createCategory, updateCategory, deleteCategory } = useCriteriaCategories();

// Create a new category
await createCategory({
  name: 'Technical Skills',
  description: 'Technical competencies and skills',
  weight: 30
});

// Update category weight
await updateCategory(categoryId, { weight: 35 });

// Delete category
await deleteCategory(categoryId);
```

### Criteria Management

```typescript
import { useCriteria } from '@/hooks/useCriteria';

const { criteria, createCriteria, updateCriteria, deleteCriteria } = useCriteria();

// Create new criteria
await createCriteria({
  categoryId: 1,
  name: 'Problem Solving',
  baseDescription: 'Ability to analyze and solve complex problems'
});

// Update criteria
await updateCriteria(criteriaId, {
  name: 'Advanced Problem Solving',
  isActive: true
});
```

### Weight Validation

```typescript
import { useCriteriaCategories } from '@/hooks/useCriteriaCategories';

const { validateWeights, rebalanceWeights } = useCriteriaCategories();

// Validate current weights
const validation = await validateWeights();

// Rebalance weights
await rebalanceWeights([
  { categoryId: 1, categoryName: 'Technical', currentWeight: 30, proposedWeight: 35 },
  { categoryId: 2, categoryName: 'Leadership', currentWeight: 40, proposedWeight: 35 },
  { categoryId: 3, categoryName: 'Communication', currentWeight: 30, proposedWeight: 30 }
]);
```

## Design System Integration

The system uses the VakıfBank design system with:

- **Primary Colors**: Yellow accents for key actions and highlights
- **Cards**: Clean white cards with subtle shadows
- **Buttons**: Consistent button variants (primary, secondary, ghost, danger)
- **Badges**: Status indicators with appropriate colors
- **Alerts**: Warning and error messages with actions
- **Forms**: Consistent form styling with validation

### Color Scheme

- **Primary**: Yellow (#F59E0B) for main actions and highlights
- **Success**: Green for positive states and validations
- **Warning**: Yellow/Orange for attention states
- **Error**: Red for error states and destructive actions
- **Secondary**: Gray for neutral states and inactive items

## Responsive Design

The system is fully responsive with:

- **Mobile**: Collapsible sections, touch-friendly controls
- **Tablet**: Optimized layouts for medium screens
- **Desktop**: Full-featured interface with advanced controls

## Performance Considerations

- **Lazy Loading**: Components load data on demand
- **Memoization**: Filtered results are memoized for performance
- **Pagination**: Large datasets are paginated
- **Optimistic Updates**: UI updates immediately with rollback on error

## Security

- **Role-Based Access**: Admin-only access to management functions
- **Input Validation**: Client and server-side validation
- **CSRF Protection**: Built-in CSRF protection for forms
- **Audit Trail**: All changes are logged for audit purposes

## Future Enhancements

### Planned Features

1. **Criteria Templates**: Pre-built criteria sets for different industries
2. **Advanced Analytics**: Detailed usage analytics and performance metrics
3. **Workflow Integration**: Integration with evaluation workflows
4. **Bulk Import/Export**: Enhanced import/export functionality
5. **Version Control**: Advanced versioning and rollback capabilities
6. **Real-time Collaboration**: Multi-user editing with conflict resolution

### API Enhancements

1. **Bulk Operations**: Bulk create, update, delete operations
2. **Advanced Filtering**: Server-side filtering and sorting
3. **Real-time Updates**: WebSocket integration for real-time updates
4. **Caching**: Redis caching for improved performance

## Troubleshooting

### Common Issues

1. **Weight Validation Errors**: Ensure total weights equal exactly 100%
2. **Role Description Issues**: Check that all required roles have descriptions
3. **Performance Issues**: Use pagination for large datasets
4. **Validation Errors**: Check form validation messages

### Debug Mode

Enable debug mode for detailed error messages and logging:

```typescript
// In development
const DEBUG_MODE = process.env.NODE_ENV === 'development';
```

## Contributing

When contributing to the Criteria Management System:

1. Follow the established design patterns
2. Use the VakıfBank design system components
3. Add proper TypeScript types
4. Include comprehensive tests
5. Update documentation for new features

## Support

For support and questions:

1. Check the API documentation
2. Review the component examples
3. Check the troubleshooting section
4. Contact the development team

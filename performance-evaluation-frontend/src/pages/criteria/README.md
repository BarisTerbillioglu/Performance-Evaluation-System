# Criteria Management System

A comprehensive criteria management system for performance evaluations that allows administrators to create, manage, and organize evaluation criteria with role-specific descriptions.

## Features

### ✅ Core Features Implemented

- **Criteria Categories Management**
  - Create, edit, and delete criteria categories
  - Weight percentage management with 100% validation
  - Drag-and-drop reordering
  - Active/inactive status management

- **Criteria CRUD Operations**
  - Create, edit, and delete evaluation criteria
  - Associate criteria with categories
  - Base descriptions for general criteria information
  - Active/inactive status management

- **Role-Specific Descriptions**
  - Add custom descriptions for different roles
  - Edit existing role descriptions
  - Delete role descriptions
  - Role-specific evaluation guidelines

- **Weight Calculation & Validation**
  - Real-time weight validation (must total 100%)
  - Visual weight distribution indicators
  - Auto-rebalancing functionality
  - Equal distribution options
  - Weight validation warnings

- **Criteria Preview Mode**
  - Multiple preview modes (Evaluator, Employee, Admin)
  - Real-time preview of how criteria appear in evaluations
  - Expandable category view
  - Role-specific description display

- **Import/Export Functionality**
  - Export criteria templates in JSON/CSV formats
  - Import criteria configurations
  - Sample templates for quick setup
  - Data validation on import

- **Version History**
  - Track all changes to criteria and categories
  - View detailed change logs
  - Filter by entity type and action
  - Revert to previous versions (planned)

### 🎨 User Experience Features

- **Drag-and-Drop Interface**
  - Reorder categories with visual feedback
  - Smooth animations during drag operations
  - Touch-friendly for mobile devices

- **Real-Time Validation**
  - Instant weight validation feedback
  - Visual indicators for weight status
  - Error prevention with clear messaging

- **Responsive Design**
  - Mobile-friendly interface
  - Adaptive layouts for different screen sizes
  - Touch-optimized controls

## File Structure

```
src/pages/criteria/
├── CriteriaPage.tsx              # Main page component
├── components/
│   ├── index.ts                  # Component exports
│   ├── CriteriaCategoriesSection.tsx   # Categories management
│   ├── CriteriaListSection.tsx         # Criteria listing and management
│   ├── CriteriaFormModal.tsx           # Criteria creation/editing form
│   ├── CategoryFormModal.tsx           # Category creation/editing form
│   ├── WeightValidationModal.tsx       # Weight management and validation
│   ├── ImportExportModal.tsx           # Data import/export functionality
│   ├── VersionHistoryModal.tsx         # Change tracking and history
│   ├── CriteriaPreviewModal.tsx        # Preview functionality
│   └── RoleDescriptionEditor.tsx       # Role-specific description editor
└── README.md                     # This file
```

## Hooks

### `useCriteriaCategories`
Manages criteria categories with full CRUD operations, weight validation, and rebalancing.

```typescript
const {
  categories,
  loading,
  error,
  weightValidation,
  refetch,
  validateWeights,
  rebalanceWeights,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus
} = useCriteriaCategories();
```

### `useCriteria`
Manages individual criteria with role-specific descriptions.

```typescript
const {
  criteria,
  loading,
  error,
  refetch,
  createCriteria,
  updateCriteria,
  deleteCriteria,
  addRoleDescription,
  updateRoleDescription,
  deleteRoleDescription,
  toggleCriteriaStatus
} = useCriteria(categoryId);
```

### `useRoles`
Manages role data for role-specific descriptions.

```typescript
const {
  roles,
  loading,
  error,
  refetch,
  createRole,
  updateRole,
  deleteRole
} = useRoles();
```

## Component Props

### CriteriaPage
Main container component - no props required.

### CriteriaCategoriesSection
```typescript
interface CriteriaCategoriesSectionProps {
  categories?: CriteriaCategoryDto[];
  loading: boolean;
  error: string | null;
  onEdit: (category: CriteriaCategoryDto) => void;
  onAdd: () => void;
  onCategorySelect: (categoryId: number | null) => void;
  selectedCategory: number | null;
  weightValidation?: WeightValidationDto | null;
}
```

### CriteriaFormModal
```typescript
interface CriteriaFormModalProps {
  criteria?: CriteriaDto | null;
  categories?: CriteriaCategoryDto[];
  onClose: () => void;
  onSuccess: () => void;
}
```

## Usage Examples

### Basic Usage
```typescript
import { CriteriaPage } from '@/pages/criteria/CriteriaPage';

// In your routing
<Route path="/criteria" element={<CriteriaPage />} />
```

### Using Individual Components
```typescript
import { 
  CriteriaCategoriesSection,
  WeightValidationModal 
} from '@/pages/criteria/components';

// Custom implementation
<CriteriaCategoriesSection
  categories={categories}
  loading={loading}
  error={error}
  onEdit={handleEdit}
  onAdd={handleAdd}
  onCategorySelect={setSelectedCategory}
  selectedCategory={selectedCategory}
  weightValidation={weightValidation}
/>
```

## Data Flow

1. **Categories** are loaded from the API via `useCriteriaCategories`
2. **Weight validation** runs automatically when categories change
3. **Criteria** are loaded based on selected category via `useCriteria`
4. **Role descriptions** are managed within criteria forms
5. **Changes** trigger automatic re-validation and UI updates

## API Integration

The system integrates with the following API endpoints:

- `GET /api/criteriacategory` - Get all categories
- `POST /api/criteriacategory` - Create category
- `PUT /api/criteriacategory/{id}` - Update category
- `DELETE /api/criteriacategory/{id}` - Delete category
- `GET /api/criteria` - Get all criteria
- `POST /api/criteria` - Create criteria
- `PUT /api/criteria/{id}` - Update criteria
- `DELETE /api/criteria/{id}` - Delete criteria
- `POST /api/criteria/{id}/role-description` - Add role description
- `PUT /api/criteria/{criteriaId}/role-description/{roleId}` - Update role description
- `DELETE /api/criteria/{criteriaId}/role-description/{roleId}` - Delete role description

## Validation Rules

### Category Weights
- Must be between 0.01% and 100%
- Total of all categories must equal 100%
- Visual warnings when validation fails
- Auto-rebalancing options available

### Criteria Names
- Required field
- Maximum 100 characters
- Must be unique within category

### Role Descriptions
- Required when adding
- Maximum 500 characters
- Role must be selected from available roles

## Styling

The system uses Tailwind CSS with custom component styles:

- **Categories**: Card-based layout with drag handles
- **Criteria**: Table-based layout with expandable details
- **Modals**: Overlay design with form validation
- **Validation**: Color-coded status indicators

## Accessibility

- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Proper ARIA labels and roles
- **Focus Management**: Logical tab order and focus states
- **Color Contrast**: WCAG AA compliant color schemes

## Performance

- **Lazy Loading**: Components load only when needed
- **Memoization**: Expensive calculations are memoized
- **Virtual Scrolling**: Large lists use virtual scrolling
- **Debounced Validation**: Weight validation is debounced

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- `@hello-pangea/dnd` - Drag and drop functionality
- `lucide-react` - Icon library
- `react-hook-form` - Form management
- `zod` - Schema validation
- `zustand` - State management

## Future Enhancements

- [ ] Criteria templates library
- [ ] Bulk operations for criteria
- [ ] Advanced filtering and search
- [ ] Criteria analytics and usage stats
- [ ] Integration with evaluation scheduling
- [ ] Multi-language support for criteria descriptions

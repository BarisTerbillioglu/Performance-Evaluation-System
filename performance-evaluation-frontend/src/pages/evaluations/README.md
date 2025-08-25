# Evaluation Creation & Scoring System

A comprehensive evaluation management system built with React, TypeScript, and the VakıfBank design system. This system provides evaluators and administrators with powerful tools to create, manage, and score performance evaluations across the organization.

## Features

### 🎯 Core Functionality
- **Evaluation Creation**: Create new evaluations with employee selection and period setup
- **Dynamic Scoring**: Score criteria on a 1-5 scale with real-time feedback
- **Auto-Save**: Automatic progress saving every 30 seconds
- **Comments System**: Add detailed feedback for each criteria
- **Bulk Operations**: Perform actions on multiple evaluations simultaneously

### 📊 Analytics & Reporting
- **Evaluation Dashboard**: Real-time overview of evaluation metrics
- **Progress Tracking**: Visual progress indicators for completion
- **Score Analytics**: Performance trends and comparisons
- **Status Management**: Track evaluation lifecycle from draft to completion

### 🔍 Advanced Search & Filtering
- **Global Search**: Search by employee name, evaluator name, or period
- **Advanced Filters**: Filter by status, department, evaluator, and date ranges
- **Pagination**: Efficient handling of large evaluation lists
- **Sortable Columns**: Sort evaluations by any attribute

### 📱 Mobile Responsive
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Touch-Friendly Interface**: Optimized for touch interactions
- **Collapsible Sections**: Space-efficient criteria display
- **Mobile-Optimized Forms**: Touch-friendly scoring interface

### 🔐 Security & Validation
- **Role-Based Access Control**: Different permissions for different roles
- **Validation Rules**: Prevent submission with incomplete scores
- **Duplicate Prevention**: Check for existing evaluations
- **Audit Trail**: Track all evaluation activities

## Components

### Main Components

#### `EvaluationManagementPage`
The main evaluation management interface with:
- Evaluation list/grid view with sorting and filtering
- Statistics dashboard with completion metrics
- Bulk action capabilities
- Export functionality

#### `CreateEvaluationModal`
Comprehensive evaluation creation form with:
- Employee search and selection
- Evaluator assignment
- Period setup with quick presets
- Duplicate evaluation checking
- Validation and error handling

#### `EvaluationScoringForm`
The core evaluation scoring interface with:
- Dynamic criteria-based scoring
- Real-time score calculation
- Auto-save functionality
- Comments system
- Progress tracking
- Category-based organization

#### `BulkOperationsModal`
Modal for performing bulk operations on selected evaluations:
- Bulk status updates
- Bulk evaluation creation
- Bulk export functionality
- Operation confirmation

### Supporting Components

#### `ScoreInput`
Individual score selection component with:
- 1-5 rating scale with visual feedback
- Score validation
- Color-coded score indicators
- Touch-friendly interface

#### `CommentsSection`
Expandable comments interface with:
- Rich text input
- Comment history display
- Author and timestamp information
- Character limit indicators

#### `ProgressIndicator`
Visual progress tracking with:
- Overall completion percentage
- Category-wise progress
- Progress bar animations
- Status indicators

#### `AutoSaveIndicator`
Auto-save status display with:
- Save status indicators
- Unsaved changes warnings
- Loading states
- Error handling

## API Integration

### Evaluation Service Methods

```typescript
// Core evaluation operations
getEvaluations(params?: EvaluationSearchParams): Promise<PagedResult<EvaluationListDto[]>>
getEvaluationById(id: number): Promise<EvaluationDetailDto>
createEvaluation(evaluationData: CreateEvaluationRequest): Promise<EvaluationDto>
updateEvaluation(id: number, evaluationData: UpdateEvaluationRequest): Promise<EvaluationDto>
deleteEvaluation(id: number): Promise<{ message: string }>

// Scoring operations
getEvaluationForm(id: number): Promise<EvaluationFormDto>
updateCriteriaScore(evaluationId: number, criteriaId: number, score: number): Promise<EvaluationScoreDto>
addCriteriaComment(evaluationId: number, criteriaId: number, comment: string): Promise<CommentDto>
getCriteriaComments(evaluationId: number, criteriaId: number): Promise<CommentDto[]>

// Status operations
submitEvaluation(id: number): Promise<{ message: string }>
getEvaluationsByStatus(status: EvaluationStatus): Promise<EvaluationListDto[]>
getEvaluationSummary(id: number): Promise<EvaluationFormDto>

// Bulk operations
bulkCreateEvaluations(evaluations: CreateEvaluationRequest[]): Promise<BulkCreateResult>
bulkUpdateStatus(evaluationIds: number[], status: EvaluationStatus): Promise<{ message: string }>
exportEvaluations(filters?: ExportFilters): Promise<Blob>

// Analytics and statistics
getEvaluationDashboard(): Promise<EvaluationDashboardDto>
getEvaluationStatistics(params?: StatisticsParams): Promise<EvaluationStatistics>
getEvaluationProgress(evaluationId: number): Promise<ProgressInfo>

// Auto-save and validation
autoSaveEvaluation(evaluationId: number, scores: ScoreData[]): Promise<{ message: string }>
checkEvaluationExists(employeeId: number, period: string): Promise<{ exists: boolean; evaluationId?: number }>
```

## Design System Integration

The Evaluation System uses the VakıfBank design system with:

### Color Scheme
- **Primary**: Yellow (#F59E0B) for main actions and highlights
- **Success**: Green for completed evaluations and high scores
- **Warning**: Orange for in-progress evaluations and medium scores
- **Error**: Red for overdue evaluations and low scores
- **Info**: Blue for informational elements

### Components
- **Button**: Multiple variants (primary, secondary, ghost, danger)
- **Badge**: Status indicators with different colors
- **Card**: Content containers with consistent styling
- **Input**: Form inputs with validation states
- **Select**: Dropdown components for selections

### Scoring Interface
- **Score Buttons**: 1-5 rating buttons with hover effects
- **Progress Bars**: Visual completion indicators
- **Status Badges**: Color-coded evaluation status
- **Category Headers**: Collapsible criteria sections

## Usage Examples

### Basic Evaluation Management

```typescript
import { EvaluationManagementPage } from '@/pages/evaluations';

// In your route configuration
<Route path="/evaluations" element={<EvaluationManagementPage />} />
```

### Create New Evaluation

```typescript
import { CreateEvaluationModal } from '@/pages/evaluations/components';

const handleCreateEvaluation = () => {
  showModal({
    type: 'custom',
    title: 'Create New Evaluation',
    size: 'lg',
    component: CreateEvaluationModal,
    props: {
      onSuccess: () => {
        loadEvaluations();
        showNotification({
          type: 'success',
          title: 'Success',
          message: 'Evaluation created successfully'
        });
      }
    }
  });
};
```

### Scoring Interface

```typescript
import { EvaluationScoringForm } from '@/pages/evaluations/components';

const handleScoreEvaluation = (evaluationId: number) => {
  return (
    <EvaluationScoringForm
      evaluationId={evaluationId}
      onSave={() => {
        showNotification({
          type: 'success',
          title: 'Saved',
          message: 'Evaluation progress saved'
        });
      }}
      onComplete={() => {
        showNotification({
          type: 'success',
          title: 'Completed',
          message: 'Evaluation completed successfully'
        });
      }}
    />
  );
};
```

## Configuration

### Environment Variables

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=VakıfBank Performance Evaluation

# Feature Flags
VITE_ENABLE_AUTO_SAVE=true
VITE_AUTO_SAVE_INTERVAL=30000
VITE_ENABLE_BULK_OPERATIONS=true
VITE_ENABLE_EVALUATION_TEMPLATES=true
```

### TypeScript Types

```typescript
// Evaluation types
interface EvaluationFormDto {
  evaluationId: number;
  employeeName: string;
  evaluatorName: string;
  period: string;
  status: string;
  totalScore: number;
  generalComments?: string;
  criteriaWithScores: CriteriaWithScoreDto[];
}

interface CriteriaWithScoreDto {
  criteriaId: number;
  criteriaName: string;
  description: string;
  categoryName: string;
  categoryWeight: number;
  score: number | null;
  comments: CommentDto[];
}

interface CreateEvaluationRequest {
  employeeId: number;
  evaluatorId: number;
  period: string;
  startDate: string;
  endDate: string;
}

// Status enum
enum EvaluationStatus {
  Draft = 'Draft',
  InProgress = 'InProgress',
  Submitted = 'Submitted',
  Completed = 'Completed',
  Overdue = 'Overdue',
  Cancelled = 'Cancelled'
}
```

## Best Practices

### Performance Optimization
- Use pagination for large evaluation lists
- Implement debounced search
- Cache evaluation data
- Optimistic updates for better UX

### Security Considerations
- Validate all user inputs
- Implement proper role-based access control
- Log all evaluation activities
- Use secure API endpoints

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

## User Workflows

### Evaluator Workflow
1. **View Dashboard**: See assigned evaluations and progress
2. **Create Evaluation**: Select employee and set up evaluation period
3. **Score Criteria**: Rate each criteria on 1-5 scale with comments
4. **Auto-Save**: Progress automatically saved every 30 seconds
5. **Submit**: Complete and submit evaluation for review

### Employee Workflow
1. **View Results**: Access completed evaluation results
2. **Read Feedback**: Review detailed comments and scores
3. **Track Progress**: Monitor performance trends over time
4. **Historical Access**: View past evaluation results

### Admin Workflow
1. **Monitor Progress**: Track evaluation completion rates
2. **Bulk Operations**: Create evaluations for entire teams
3. **Review Submissions**: Approve completed evaluations
4. **Generate Reports**: Export evaluation data for analysis

## Performance & UX

### Loading States
- Skeleton loading for evaluation forms
- Shimmer effects for score updates
- Progressive loading for large criteria lists
- Smooth transitions between states

### Auto-Save Features
- Automatic saving every 30 seconds
- Visual indicators for save status
- Conflict resolution for concurrent edits
- Recovery from network interruptions

### Mobile Optimization
- Touch-friendly score selection
- Collapsible criteria sections
- Optimized comment input
- Responsive design patterns

## Contributing

When contributing to the Evaluation System:

1. Follow the existing code style and patterns
2. Use TypeScript for all new code
3. Add proper error handling
4. Include unit tests for new features
5. Update documentation as needed
6. Test on multiple devices and screen sizes

## Support

For questions or issues with the Evaluation System:

1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information
4. Contact the development team

---

**Built with ❤️ for VakıfBank Performance Evaluation System**

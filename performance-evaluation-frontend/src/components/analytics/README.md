# Analytics Dashboard Components

This directory contains the interactive analytics dashboard components built with Recharts for the Performance Evaluation System.

## Components Overview

### Core Chart Components

1. **PerformanceTrendChart** - Line/Area charts for performance trends over time
   - Supports single and multiple line charts
   - Configurable area fill
   - Interactive tooltips with formatted dates
   - Export functionality

2. **DepartmentComparisonChart** - Bar charts for department performance comparison
   - Multiple metrics (average score, completion rate, total evaluations)
   - Color-coded bars
   - Interactive tooltips with detailed information
   - Metric selector

3. **ScoreDistributionChart** - Histogram for score distribution analysis
   - Color-coded score ranges
   - Percentage and count display
   - Summary cards below chart

4. **EvaluationProgressChart** - Pie chart for evaluation status breakdown
   - Status-based color coding
   - Interactive legend
   - Summary cards with counts and percentages

### Supporting Components

5. **TopPerformersLeaderboard** - Leaderboard for top performing employees
   - Rank-based icons (trophy, medals)
   - Score color coding
   - Department information
   - Avatar support

6. **RealTimeMetricsCards** - Real-time metrics display
   - System health indicators
   - Live data updates
   - Color-coded status indicators

7. **AnalyticsFilters** - Filtering and export controls
   - Date range selection
   - Department and team filters
   - Group by options
   - Export functionality

## Features

### Interactive Charts
- **Responsive Design**: All charts adapt to container size
- **Custom Tooltips**: Rich tooltips with formatted data
- **Interactive Legends**: Click to show/hide data series
- **Hover Effects**: Visual feedback on chart interactions

### Filtering & Export
- **Date Range Filtering**: Filter data by custom date ranges
- **Department/Team Filtering**: Multi-select filtering
- **Group By Options**: Day, week, month, quarter, year, department, team
- **Export Functionality**: Export charts as PNG, JPG, or PDF

### Real-time Features
- **Auto-refresh**: Data refreshes every 5 minutes
- **Live Metrics**: Real-time system health and performance indicators
- **Loading States**: Smooth loading animations
- **Error Handling**: Graceful error states with retry options

## Usage

### Basic Chart Usage

```tsx
import { PerformanceTrendChart } from '@/components/analytics';

<PerformanceTrendChart
  data={trendData}
  title="Performance Trends"
  height={350}
  showArea={true}
  multipleLines={true}
/>
```

### Dashboard Integration

```tsx
import { AnalyticsDashboard } from '@/pages/reports/AnalyticsDashboard';

// In your routing
<Route path="/analytics" element={<AnalyticsDashboard />} />
```

## Data Structure

### AnalyticsRequest
```typescript
interface AnalyticsRequest {
  startDate?: string;
  endDate?: string;
  departmentIds?: number[];
  teamIds?: number[];
  metricTypes?: string[];
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'department' | 'team';
  includeComparisons?: boolean;
}
```

### AdvancedAnalytics
```typescript
interface AdvancedAnalytics {
  metrics: PerformanceMetrics;
  trendData: TrendData[];
  departmentComparisons: DepartmentComparison[];
  topPerformers: TopPerformer[];
  scoreDistribution: ScoreDistribution[];
  evaluationProgress: EvaluationProgress[];
  realTimeMetrics: RealTimeMetrics;
  generatedAt: string;
  period: string;
}
```

## Styling

All components use Tailwind CSS for styling and are designed to match the application's design system:

- **Color Scheme**: Blue primary, green success, yellow warning, red error
- **Spacing**: Consistent 6-unit grid system
- **Typography**: Inter font family with proper hierarchy
- **Shadows**: Subtle shadows for depth and elevation

## Dependencies

- **Recharts**: Chart library for React
- **html2canvas**: Chart export functionality
- **jsPDF**: PDF generation for exports
- **Heroicons**: Icon library
- **Tailwind CSS**: Styling framework

## Performance Considerations

- **Lazy Loading**: Charts load data on demand
- **Memoization**: Components are optimized to prevent unnecessary re-renders
- **Debounced Updates**: Filter changes are debounced to prevent excessive API calls
- **Responsive Images**: Export functionality generates optimized images

## Accessibility

- **ARIA Labels**: Proper accessibility labels for screen readers
- **Keyboard Navigation**: Full keyboard support for interactive elements
- **Color Contrast**: WCAG compliant color contrast ratios
- **Focus Indicators**: Clear focus states for all interactive elements

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Support**: Responsive design for tablet and mobile devices
- **Export Support**: PDF export works in all modern browsers

## Future Enhancements

- **Drill-down Capabilities**: Click to explore detailed data
- **Custom Chart Types**: Additional chart types (scatter plots, heatmaps)
- **Advanced Filtering**: More sophisticated filtering options
- **Real-time WebSocket**: Live data updates via WebSocket
- **Chart Annotations**: Add annotations and comments to charts
- **Scheduled Reports**: Automated report generation and delivery

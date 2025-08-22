# VakıfBank-Inspired Design System

A professional design system for the Performance Evaluation System, inspired by VakıfBank's clean, trustworthy, and corporate-friendly design language.

## 🎨 Color Palette

### Primary Colors
- **Primary Yellow/Orange**: `#F59E0B` - Main brand color for primary actions
- **Primary Dark**: `#D97706` - Darker shade for hover states
- **White**: `#FFFFFF` - Dominant background color (80% of interface)

### Supporting Colors
- **Black**: `#000000` - Primary text and strong emphasis
- **Dark Gray**: `#1F2937` - Secondary text
- **Medium Gray**: `#6B7280` - Muted text
- **Light Gray**: `#F3F4F6` - Subtle backgrounds
- **Border Gray**: `#E5E7EB` - Borders and dividers

### Status Colors
- **Success**: `#10B981` - Green for positive actions
- **Warning**: `#F59E0B` - Yellow for warnings (same as primary)
- **Error**: `#EF4444` - Red for errors
- **Info**: `#3B82F6` - Blue for information

### Color Usage Strategy
- **White**: 80% of the interface (backgrounds, cards, content areas)
- **Yellow**: 15% for accents, buttons, and highlights
- **Black/Gray**: 5% for text and subtle elements

## 📝 Typography

### Font Family
- **Primary**: Inter (clean, readable, professional)
- **Fallbacks**: system-ui, Roboto, sans-serif

### Font Sizes
- **Heading 1**: 36px (text-4xl)
- **Heading 2**: 30px (text-3xl)
- **Heading 3**: 24px (text-2xl)
- **Heading 4**: 20px (text-xl)
- **Heading 5**: 18px (text-lg)
- **Heading 6**: 16px (text-base)
- **Body Large**: 18px (text-lg)
- **Body**: 16px (text-base)
- **Body Small**: 14px (text-sm)
- **Caption**: 12px (text-xs)

### Font Weights
- **Thin**: 100
- **Extra Light**: 200
- **Light**: 300
- **Normal**: 400
- **Medium**: 500
- **Semi Bold**: 600
- **Bold**: 700
- **Extra Bold**: 800
- **Black**: 900

## 🧩 Components

### Header (VakıfBank Style)
A professional header component with clean white background, yellow brand area, and black navigation.

```tsx
import { Header } from './components/design-system';

<Header 
  title="Performance Evaluation System"
  notifications={notifications}
  onLogout={() => console.log('Logout')}
  onSearch={(query) => console.log('Search:', query)}
/>
```

### Button Hierarchy
A versatile button component with VakıfBank-specific hierarchy.

```tsx
import { Button } from './components/design-system';

// Primary Actions (Yellow background with white text)
<Button variant="primary">Primary Action</Button>

// Secondary Actions (White background with yellow border)
<Button variant="secondary">Secondary Action</Button>
<Button variant="ghost">Ghost Action</Button>

// Strong CTAs (Black background with white text - Internet Banking style)
<Button variant="black">Internet Banking</Button>

// Status Actions (White background with colored borders)
<Button variant="success">Success Action</Button>
<Button variant="danger">Danger Action</Button>
<Button variant="info">Info Action</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
```

### Card (VakıfBank Style)
A container component with yellow accent variants for key metrics.

```tsx
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from './components/design-system';

// Default Card (White background)
<Card>
  <CardHeader>
    <CardTitle>Default Card</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Standard white background card.</p>
  </CardContent>
</Card>

// Accent Card (Yellow accent background for key metrics)
<Card variant="accent">
  <CardHeader>
    <CardTitle>Key Metric</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Yellow accent background for important metrics.</p>
  </CardContent>
</Card>

// Highlight Card (Yellow background with white text)
<Card variant="highlight">
  <CardHeader>
    <CardTitle>Important Information</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Important information with yellow background.</p>
  </CardContent>
</Card>
```

### Input
A form input component with validation states.

```tsx
import { Input } from './components/design-system';

<Input
  label="Email Address"
  placeholder="Enter your email"
  leftIcon={<MailIcon />}
  error="This field is required"
  help="We'll never share your email"
/>

// Sizes
<Input size="sm" />
<Input size="md" />
<Input size="lg" />
```

### Badge
A small component for displaying status or labels.

```tsx
import { Badge } from './components/design-system';

<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="info">Info</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>
```

### Modal
A dialog component for overlays and forms.

```tsx
import { Modal } from './components/design-system';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="md"
>
  <p>Modal content goes here</p>
</Modal>

// Sizes
<Modal size="sm" />
<Modal size="md" />
<Modal size="lg" />
<Modal size="xl" />
<Modal size="full" />
```

### Table
A data table component with proper styling.

```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './components/design-system';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Department</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>Engineering</TableCell>
      <TableCell><Badge variant="success">Active</Badge></TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## 📱 Example Components

### VakıfBank Dashboard
A complete dashboard example showcasing VakıfBank's design principles.

```tsx
import { VakifBankDashboard } from './components/examples/VakifBankDashboard';

<VakifBankDashboard />
```

### Login Form
A complete login form showcasing the design system.

```tsx
import { LoginForm } from './components/examples/LoginForm';

<LoginForm />
```

### Dashboard Header
A navigation header with search, notifications, and user menu.

```tsx
import { DashboardHeader } from './components/examples/DashboardHeader';

<DashboardHeader />
```

### Data Table
A comprehensive data table with filtering, search, and actions.

```tsx
import { DataTable } from './components/examples/DataTable';

<DataTable />
```

### Dashboard Cards
A dashboard layout with statistics cards and activity feeds.

```tsx
import { DashboardCards } from './components/examples/DashboardCards';

<DashboardCards />
```

### Sidebar Navigation
A collapsible sidebar with navigation items and user profile.

```tsx
import { SidebarNavigation } from './components/examples/SidebarNavigation';

<SidebarNavigation />
```

### Modal Example
A modal dialog with form validation and proper styling.

```tsx
import { ModalExample } from './components/examples/ModalExample';

<ModalExample />
```

## 🎯 Design Principles

### 1. Professional and Trustworthy
- Clean, corporate-friendly appearance
- Consistent with banking interface standards
- Professional color scheme and typography

### 2. Clean and Spacious
- Generous white space usage (80% white backgrounds)
- Uncluttered layouts
- Clear visual hierarchy

### 3. Strategic Color Usage
- Yellow as accent color, not overwhelming (15%)
- Black for primary text and strong emphasis
- Subtle grays for secondary elements (5%)

### 4. Modern but Conservative
- Contemporary design patterns
- Conservative color choices
- Professional animations and transitions

### 5. Easy to Read and Navigate
- High contrast text
- Clear navigation patterns
- Accessible design elements

## 🛠️ Usage Guidelines

### Button Usage
- **Primary (Yellow)**: Main actions (Submit, Save, Continue)
- **Secondary (White with yellow border)**: Alternative actions (Cancel, Back)
- **Ghost (Transparent with yellow text)**: Subtle actions (Edit, Delete)
- **Black**: Strong CTAs (Internet Banking style)
- **Status variants**: Context-specific actions (Success, Danger, Info)

### Color Usage
- **Primary Yellow**: Use sparingly for key actions and highlights (15%)
- **Black**: Primary text, headings, and strong emphasis
- **Gray scale**: Secondary text, borders, and subtle backgrounds
- **Status colors**: Only for actual status indicators

### Typography
- **Headings**: Use proper hierarchy (H1 → H2 → H3)
- **Body text**: Use appropriate sizes for readability
- **Captions**: Use for metadata and small text

### Spacing
- **Consistent**: Use Tailwind's spacing scale
- **Generous**: Prefer more space over less
- **Hierarchical**: More space around important elements

## 📋 Implementation

### Installation
The design system is built into the project using:
- **Tailwind CSS**: For utility classes and responsive design
- **Class Variance Authority**: For component variants
- **Lucide React**: For consistent icons
- **Headless UI**: For accessible components

### File Structure
```
src/components/
├── design-system/          # Core design system components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Badge.tsx
│   ├── Modal.tsx
│   ├── Table.tsx
│   ├── Header.tsx          # VakıfBank-style header
│   └── index.ts
├── examples/               # Example implementations
│   ├── LoginForm.tsx
│   ├── DashboardHeader.tsx
│   ├── DataTable.tsx
│   ├── DashboardCards.tsx
│   ├── SidebarNavigation.tsx
│   ├── ModalExample.tsx
│   ├── VakifBankDashboard.tsx  # Complete VakıfBank dashboard
│   └── index.ts
└── DesignSystemShowcase.tsx  # Complete showcase
```

### Configuration
The design system is configured in:
- `tailwind.config.js`: Color palette, typography, spacing
- `src/index.css`: Global styles and component classes
- `src/utils/cn.ts`: Utility function for class merging

## 🎨 Showcase

To view the complete design system showcase:

```tsx
import { DesignSystemShowcase } from './components/DesignSystemShowcase';

<DesignSystemShowcase />
```

This showcase includes:
- **Components**: All design system components with variants
- **Examples**: Real-world usage examples
- **VakıfBank Style**: Complete dashboard and design principles
- **Colors**: Complete color palette display
- **Typography**: Typography scale and examples

## 🔧 Customization

### Adding New Colors
Add to `tailwind.config.js`:
```js
colors: {
  custom: {
    50: '#fef7ed',
    500: '#f59e0b',
    900: '#78350f',
  }
}
```

### Adding New Components
1. Create component in `src/components/design-system/`
2. Use CVA for variants
3. Export from `index.ts`
4. Add to showcase

### Modifying Existing Components
1. Update component file
2. Update showcase if needed
3. Test across different variants

## 📱 Responsive Design

All components are built with responsive design in mind:
- **Mobile-first**: Components work on all screen sizes
- **Touch-friendly**: Appropriate touch targets (44px minimum)
- **Readable**: Text scales appropriately
- **Accessible**: Proper contrast ratios and focus states

## ♿ Accessibility

The design system follows accessibility best practices:
- **WCAG 2.1 AA**: Color contrast ratios
- **Keyboard navigation**: All interactive elements
- **Screen readers**: Proper ARIA labels
- **Focus management**: Visible focus indicators
- **Semantic HTML**: Proper element usage

## 🚀 Performance

Components are optimized for performance:
- **Tree-shaking**: Only import what you use
- **CSS-in-JS**: No runtime CSS generation
- **Minimal dependencies**: Lightweight implementation
- **Efficient rendering**: React best practices

## 📚 Resources

- **Tailwind CSS**: https://tailwindcss.com/
- **Class Variance Authority**: https://cva.style/docs
- **Lucide React**: https://lucide.dev/
- **Headless UI**: https://headlessui.com/
- **VakıfBank Design**: Inspiration for corporate design patterns

---

This design system provides a solid foundation for building professional, trustworthy, and user-friendly interfaces that align with VakıfBank's design philosophy while being specifically tailored for HR and performance management applications. The refined design system now includes VakıfBank-specific touches like the header design, button hierarchy, dashboard layout, and color usage strategy that make it feel like a genuine VakıfBank internal business application.

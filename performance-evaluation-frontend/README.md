# Performance Evaluation System - Frontend

A modern React TypeScript application built with Vite for managing employee performance evaluations.

## 🚀 Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **ESLint** for linting

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components (Button, Input, etc.)
│   ├── layout/         # Layout components (Navbar, Layout)
│   └── forms/          # Form-specific components
├── pages/              # Route components
├── services/           # API calls and external services
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
├── utils/              # Helper functions
├── store/              # State management (Context API)
├── constants/          # App constants and configuration
└── index.css           # Global styles and Tailwind imports
```

## 🛠️ Setup and Installation

### Prerequisites

Make sure you have Node.js (v16 or later) and npm installed.

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd performance-evaluation-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your API base URL:
   ```
   VITE_API_BASE_URL=http://localhost:5282
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔧 Configuration

### Absolute Imports

The project is configured with absolute imports using the `@/` alias:

```typescript
import { Button } from '@/components/common';
import { useAuth } from '@/store';
import { formatDate } from '@/utils';
```

### API Configuration

API calls are centralized in the `services/` directory. The base URL is configured through environment variables:

```typescript
// In src/constants/config.ts
export const CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5282',
  // ...
};
```

### State Management

The application uses React Context API for state management, specifically for authentication:

```typescript
import { useAuth } from '@/store';

const { state, login, logout } = useAuth();
```

## 🎨 Styling

The project uses Tailwind CSS for styling with custom theme configuration:

- Primary colors: Blue palette
- Secondary colors: Gray palette
- Custom components in `@layer components`

## 🔐 Authentication

The authentication system includes:

- JWT token management
- Automatic token refresh
- Protected routes
- Persistent login state

## 📱 Responsive Design

The application is fully responsive and works on:

- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🧪 Development Guidelines

### Component Structure

```typescript
import React from 'react';
import { SomeType } from '@/types';

interface ComponentProps {
  // Define props with TypeScript
}

export const Component: React.FC<ComponentProps> = ({ props }) => {
  // Component logic
  
  return (
    <div className="tailwind-classes">
      {/* JSX */}
    </div>
  );
};
```

### API Service Pattern

```typescript
import { apiClient } from './api';
import { SomeType } from '@/types';

export const someService = {
  getItems: async (): Promise<SomeType[]> => {
    const response = await apiClient.get<SomeType[]>('/api/items');
    return response.data;
  },
  
  createItem: async (data: CreateItemRequest): Promise<SomeType> => {
    const response = await apiClient.post<SomeType>('/api/items', data);
    return response.data;
  },
};
```

## 🤝 Contributing

1. Follow the established folder structure
2. Use TypeScript for all new files
3. Follow the component naming convention
4. Add proper type definitions
5. Use absolute imports
6. Follow Tailwind CSS conventions

## 📞 Support

For support or questions, please contact the development team.

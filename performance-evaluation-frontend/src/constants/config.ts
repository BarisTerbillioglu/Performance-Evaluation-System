export const CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5282',
  APP_NAME: 'Performance Evaluation System',
  VERSION: '1.0.0',
} as const;

// Environment types
export type Environment = 'development' | 'production' | 'test';

export const getEnvironment = (): Environment => {
  return (import.meta.env.MODE as Environment) || 'development';
};

export const isDevelopment = () => getEnvironment() === 'development';
export const isProduction = () => getEnvironment() === 'production';

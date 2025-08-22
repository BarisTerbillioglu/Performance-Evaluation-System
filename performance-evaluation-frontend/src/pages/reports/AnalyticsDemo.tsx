import React from 'react';
import { AnalyticsDashboard } from './AnalyticsDashboard';

export const AnalyticsDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analytics Dashboard Demo
          </h1>
          <p className="text-gray-600">
            Interactive analytics dashboard with Recharts - Performance trends, department comparisons, 
            evaluation progress, and real-time metrics.
          </p>
        </div>
        
        <AnalyticsDashboard />
      </div>
    </div>
  );
};

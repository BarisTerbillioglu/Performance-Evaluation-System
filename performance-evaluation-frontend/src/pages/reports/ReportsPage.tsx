import React, { useState } from 'react';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ReportsMainPage } from './ReportsMainPage';
import { 
  ChartBarIcon, 
  DocumentChartBarIcon,
  TableCellsIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

type ReportView = 'analytics' | 'reports' | 'exports' | 'builder';

export const ReportsPage: React.FC = () => {
  const [activeView, setActiveView] = useState<ReportView>('analytics');

  const views = [
    {
      id: 'analytics' as ReportView,
      name: 'Analytics Dashboard',
      icon: ChartBarIcon,
      description: 'Interactive charts and real-time metrics'
    },
    {
      id: 'reports' as ReportView,
      name: 'Report Builder',
      icon: DocumentTextIcon,
      description: 'Create and manage custom reports'
    },
    {
      id: 'builder' as ReportView,
      name: 'Standard Reports',
      icon: DocumentChartBarIcon,
      description: 'Traditional reports and summaries'
    },
    {
      id: 'exports' as ReportView,
      name: 'Data Exports',
      icon: TableCellsIcon,
      description: 'Export data in various formats'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold leading-tight text-gray-900">
          Reports & Analytics
        </h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          View performance reports, analytics, and export data
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeView === view.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{view.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeView === 'analytics' && <AnalyticsDashboard />}
        
        {activeView === 'reports' && <ReportsMainPage />}
        
        {activeView === 'builder' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Standard Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <DocumentChartBarIcon className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-medium text-gray-900 mb-2">Performance Summary</h3>
                <p className="text-sm text-gray-600 mb-3">Monthly performance overview with key metrics</p>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Generate Report →
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <DocumentChartBarIcon className="w-8 h-8 text-green-600 mb-3" />
                <h3 className="font-medium text-gray-900 mb-2">Department Analysis</h3>
                <p className="text-sm text-gray-600 mb-3">Department-wise performance comparison</p>
                <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                  Generate Report →
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <DocumentChartBarIcon className="w-8 h-8 text-purple-600 mb-3" />
                <h3 className="font-medium text-gray-900 mb-2">Trend Analysis</h3>
                <p className="text-sm text-gray-600 mb-3">Performance trends over time</p>
                <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  Generate Report →
                </button>
              </div>
            </div>
          </div>
        )}
        
        {activeView === 'exports' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Exports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <TableCellsIcon className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-medium text-gray-900 mb-2">Evaluation Data</h3>
                <p className="text-sm text-gray-600 mb-3">Export all evaluation data to Excel/CSV</p>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Export Data →
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <TableCellsIcon className="w-8 h-8 text-green-600 mb-3" />
                <h3 className="font-medium text-gray-900 mb-2">User Data</h3>
                <p className="text-sm text-gray-600 mb-3">Export user information and statistics</p>
                <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                  Export Data →
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <TableCellsIcon className="w-8 h-8 text-purple-600 mb-3" />
                <h3 className="font-medium text-gray-900 mb-2">Analytics Report</h3>
                <p className="text-sm text-gray-600 mb-3">Export comprehensive analytics as PDF</p>
                <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  Export Report →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

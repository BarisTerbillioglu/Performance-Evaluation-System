import React, { useState, useEffect } from 'react';
import { AdvancedReportBuilder } from '@/components/reports/AdvancedReportBuilder';
import { Button } from '@/components/design-system/Button';
import { 
  DocumentTextIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface Report {
  id: string;
  name: string;
  description: string;
  category: string;
  createdAt: string;
  lastExecuted?: string;
  status: 'active' | 'inactive' | 'scheduled';
}

export const ReportsPage: React.FC = () => {
  const [showBuilder, setShowBuilder] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'All Reports', icon: DocumentTextIcon },
    { id: 'performance', name: 'Performance', icon: ChartBarIcon },
    { id: 'evaluation', name: 'Evaluation', icon: DocumentTextIcon },
    { id: 'department', name: 'Department', icon: ChartBarIcon },
    { id: 'custom', name: 'Custom', icon: DocumentTextIcon }
  ];

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockReports: Report[] = [
      {
        id: '1',
        name: 'Monthly Performance Summary',
        description: 'Comprehensive monthly performance overview',
        category: 'performance',
        createdAt: '2024-01-15T10:30:00Z',
        lastExecuted: '2024-01-31T09:00:00Z',
        status: 'active'
      },
      {
        id: '2',
        name: 'Evaluation Completion Report',
        description: 'Current evaluation status and progress',
        category: 'evaluation',
        createdAt: '2024-01-10T14:20:00Z',
        lastExecuted: '2024-01-30T16:00:00Z',
        status: 'scheduled'
      },
      {
        id: '3',
        name: 'Department Comparison Analysis',
        description: 'Department performance comparison',
        category: 'department',
        createdAt: '2024-01-05T11:15:00Z',
        status: 'active'
      }
    ];
    setReports(mockReports);
    setLoading(false);
  }, []);

  const filteredReports = selectedCategory === 'all' 
    ? reports 
    : reports.filter(report => report.category === selectedCategory);

  const handleSaveReport = (report: any) => {
    console.log('Saving report:', report);
    // Add API call to save report
  };

  const handlePreviewReport = (report: any) => {
    console.log('Previewing report:', report);
    // Add preview functionality
  };

  const handleExportReport = (report: any, format: string) => {
    console.log('Exporting report:', report, format);
    // Add export functionality
  };

  const handleScheduleReport = (report: any, schedule: any) => {
    console.log('Scheduling report:', report, schedule);
    // Add scheduling functionality
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success-100 text-success-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-primary-100 text-primary-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (showBuilder) {
    return (
      <AdvancedReportBuilder
        onSave={handleSaveReport}
        onPreview={handlePreviewReport}
        onExport={handleExportReport}
        onSchedule={handleScheduleReport}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600 mt-1">Create, manage, and schedule comprehensive reports</p>
            </div>
            <Button
              variant="primary"
              leftIcon={<PlusIcon className="w-4 h-4" />}
              onClick={() => setShowBuilder(true)}
            >
              Create New Report
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Category Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-colors ${
                  selectedCategory === category.id
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <category.icon className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedCategory === 'all' ? 'All Reports' : categories.find(c => c.id === selectedCategory)?.name}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredReports.length} reports)
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-12 text-center">
              <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-500 mb-6">
                {selectedCategory === 'all' 
                  ? 'Get started by creating your first report'
                  : `No ${categories.find(c => c.id === selectedCategory)?.name.toLowerCase()} reports available`
                }
              </p>
              <Button
                variant="primary"
                leftIcon={<PlusIcon className="w-4 h-4" />}
                onClick={() => setShowBuilder(true)}
              >
                Create New Report
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredReports.map(report => (
                <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">{report.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{report.description}</p>
                      <div className="flex items-center space-x-6 mt-3 text-sm text-gray-500">
                        <span>Created: {new Date(report.createdAt).toLocaleDateString()}</span>
                        {report.lastExecuted && (
                          <span>Last run: {new Date(report.lastExecuted).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<EyeIcon className="w-4 h-4" />}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<DocumentArrowDownIcon className="w-4 h-4" />}
                      >
                        Export
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<ClockIcon className="w-4 h-4" />}
                      >
                        Schedule
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<TrashIcon className="w-4 h-4" />}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

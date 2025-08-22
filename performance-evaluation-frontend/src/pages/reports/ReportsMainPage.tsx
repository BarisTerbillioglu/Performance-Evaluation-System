import React, { useState, useEffect } from 'react';
import { ReportDefinition, ReportTemplate, ReportCategory, ReportStats } from '@/types/reports';
import { reportService } from '@/services/reportService';
import { ReportBuilder } from '@/components/reports/ReportBuilder';
import { ReportExecution } from '@/components/reports/ReportExecution';
import { ReportSharing } from '@/components/reports/ReportSharing';
import { 
  PlusIcon, 
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon,
  ShareIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DuplicateIcon,
  ArrowDownTrayIcon,
  CogIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

export const ReportsMainPage: React.FC = () => {
  const [reports, setReports] = useState<ReportDefinition[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'reports' | 'templates' | 'categories'>('reports');
  const [showBuilder, setShowBuilder] = useState(false);
  const [showExecution, setShowExecution] = useState(false);
  const [showSharing, setShowSharing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportDefinition | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reportsData, templatesData, categoriesData, statsData] = await Promise.all([
        reportService.getReports(),
        reportService.getTemplates(),
        reportService.getCategories(),
        reportService.getStats()
      ]);
      
      setReports(reportsData);
      setTemplates(templatesData);
      setCategories(categoriesData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async (data: any) => {
    try {
      const newReport = await reportService.createReport(data);
      setReports(prev => [newReport, ...prev]);
      setShowBuilder(false);
    } catch (error) {
      console.error('Failed to create report:', error);
    }
  };

  const handleUpdateReport = async (id: string, data: any) => {
    try {
      const updatedReport = await reportService.updateReport(id, data);
      setReports(prev => 
        prev.map(report => report.id === id ? updatedReport : report)
      );
      setShowBuilder(false);
    } catch (error) {
      console.error('Failed to update report:', error);
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await reportService.deleteReport(id);
        setReports(prev => prev.filter(report => report.id !== id));
      } catch (error) {
        console.error('Failed to delete report:', error);
      }
    }
  };

  const handleDuplicateReport = async (id: string) => {
    try {
      const originalReport = reports.find(r => r.id === id);
      if (!originalReport) return;
      
      const newReport = await reportService.duplicateReport(id, `${originalReport.name} (Copy)`);
      setReports(prev => [newReport, ...prev]);
    } catch (error) {
      console.error('Failed to duplicate report:', error);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || report.templateId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const views = [
    { id: 'reports', name: 'Reports', icon: DocumentTextIcon, count: reports.length },
    { id: 'templates', name: 'Templates', icon: ChartBarIcon, count: templates.length },
    { id: 'categories', name: 'Categories', icon: UserGroupIcon, count: categories.length }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              Reports & Analytics
            </h1>
            <p className="mt-2 max-w-4xl text-sm text-gray-500">
              Create, manage, and execute comprehensive reports
            </p>
          </div>
          <button
            onClick={() => setShowBuilder(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create Report</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <DocumentTextIcon className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <ClockIcon className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">{stats.scheduledReports}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <ChartBarIcon className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Executions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalExecutions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <ShareIcon className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Shared</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeShares}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeView === view.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{view.name}</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {view.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <DocumentTextIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {activeView === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onEdit={() => {
                setSelectedReport(report);
                setShowBuilder(true);
              }}
              onExecute={() => {
                setSelectedReport(report);
                setShowExecution(true);
              }}
              onShare={() => {
                setSelectedReport(report);
                setShowSharing(true);
              }}
              onDuplicate={() => handleDuplicateReport(report.id)}
              onDelete={() => handleDeleteReport(report.id)}
            />
          ))}
        </div>
      )}

      {activeView === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUse={() => {
                setShowBuilder(true);
                // Pre-populate with template data
              }}
            />
          ))}
        </div>
      )}

      {activeView === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <ReportBuilder
              initialData={selectedReport ? {
                name: selectedReport.name,
                description: selectedReport.description,
                filters: selectedReport.filters,
                columns: selectedReport.columns,
                chartConfig: selectedReport.chartConfig,
                schedule: selectedReport.schedule,
                permissions: selectedReport.permissions
              } : undefined}
              onSave={selectedReport ? 
                (data) => handleUpdateReport(selectedReport.id, data) : 
                handleCreateReport
              }
              onPreview={(data) => {
                console.log('Preview report:', data);
              }}
              onCancel={() => {
                setShowBuilder(false);
                setSelectedReport(null);
              }}
            />
          </div>
        </div>
      )}

      {showExecution && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <ReportExecution
              reportId={selectedReport.id}
              reportName={selectedReport.name}
              onClose={() => {
                setShowExecution(false);
                setSelectedReport(null);
              }}
            />
          </div>
        </div>
      )}

      {showSharing && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <ReportSharing
              reportId={selectedReport.id}
              reportName={selectedReport.name}
              onClose={() => {
                setShowSharing(false);
                setSelectedReport(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Report Card Component
const ReportCard: React.FC<{
  report: ReportDefinition;
  onEdit: () => void;
  onExecute: () => void;
  onShare: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}> = ({ report, onEdit, onExecute, onShare, onDuplicate, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.name}</h3>
          <p className="text-sm text-gray-600 mb-3">{report.description}</p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>v{report.version}</span>
            <span>•</span>
            <span>{report.columns.length} columns</span>
            <span>•</span>
            <span>{report.filters.length} filters</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={onExecute}
            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
            title="Execute"
          >
            <PlayIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onShare}
            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
            title="Share"
          >
            <ShareIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            title="Edit"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            report.isActive ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
          }`}>
            {report.isActive ? 'Active' : 'Inactive'}
          </span>
          {report.schedule && (
            <span className="px-2 py-1 text-xs font-medium rounded-full text-blue-600 bg-blue-100">
              Scheduled
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={onDuplicate}
            className="p-1 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
            title="Duplicate"
          >
            <DuplicateIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Template Card Component
const TemplateCard: React.FC<{
  template: ReportTemplate;
  onUse: () => void;
}> = ({ template, onUse }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
          <p className="text-sm text-gray-600 mb-3">{template.description}</p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>{template.category}</span>
            <span>•</span>
            <span>{template.columns.length} columns</span>
            <span>•</span>
            <span>{template.isSystem ? 'System' : 'Custom'}</span>
          </div>
        </div>
      </div>
      
      <button
        onClick={onUse}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Use Template
      </button>
    </div>
  );
};

// Category Card Component
const CategoryCard: React.FC<{
  category: ReportCategory;
}> = ({ category }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3 mb-4">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: category.color }}
        >
          <span className="text-white font-semibold">{category.icon}</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
          <p className="text-sm text-gray-600">{category.templateCount} templates</p>
        </div>
      </div>
      
      <p className="text-sm text-gray-600">{category.description}</p>
    </div>
  );
};

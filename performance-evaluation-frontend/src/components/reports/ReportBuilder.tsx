import React, { useState, useEffect } from 'react';
import { ReportBuilderState, ReportFilter, ReportColumn, ReportTemplate, ChartConfig } from '@/types/reports';
import { reportService } from '@/services/reportService';
import { 
  PlusIcon, 
  TrashIcon, 
  EyeIcon,
  CogIcon,
  DocumentTextIcon,
  ChartBarIcon,
  TableCellsIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface ReportBuilderProps {
  initialData?: Partial<ReportBuilderState>;
  onSave: (data: ReportBuilderState) => void;
  onPreview: (data: ReportBuilderState) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ReportBuilder: React.FC<ReportBuilderProps> = ({
  initialData,
  onSave,
  onPreview,
  onCancel,
  loading = false
}) => {
  const [state, setState] = useState<ReportBuilderState>({
    name: '',
    description: '',
    filters: [],
    columns: [],
    permissions: [],
    ...initialData
  });

  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<'general' | 'filters' | 'columns' | 'charts' | 'schedule' | 'permissions'>('general');
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await reportService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleTemplateSelect = (template: ReportTemplate) => {
    setState(prev => ({
      ...prev,
      templateId: template.id,
      filters: [...template.filters],
      columns: [...template.columns],
      chartConfig: template.chartTypes?.length ? {
        type: 'table' as const,
        title: template.name,
        xAxis: '',
        yAxis: '',
        series: []
      } : undefined
    }));
    setShowTemplateModal(false);
  };

  const addFilter = () => {
    const newFilter: ReportFilter = {
      id: `filter_${Date.now()}`,
      name: '',
      type: 'date',
      value: null,
      operator: 'equals',
      label: ''
    };
    setState(prev => ({
      ...prev,
      filters: [...prev.filters, newFilter]
    }));
  };

  const updateFilter = (id: string, updates: Partial<ReportFilter>) => {
    setState(prev => ({
      ...prev,
      filters: prev.filters.map(filter => 
        filter.id === id ? { ...filter, ...updates } : filter
      )
    }));
  };

  const removeFilter = (id: string) => {
    setState(prev => ({
      ...prev,
      filters: prev.filters.filter(filter => filter.id !== id)
    }));
  };

  const addColumn = () => {
    const newColumn: ReportColumn = {
      id: `column_${Date.now()}`,
      name: '',
      field: '',
      type: 'text',
      sortable: true,
      filterable: true
    };
    setState(prev => ({
      ...prev,
      columns: [...prev.columns, newColumn]
    }));
  };

  const updateColumn = (id: string, updates: Partial<ReportColumn>) => {
    setState(prev => ({
      ...prev,
      columns: prev.columns.map(column => 
        column.id === id ? { ...column, ...updates } : column
      )
    }));
  };

  const removeColumn = (id: string) => {
    setState(prev => ({
      ...prev,
      columns: prev.columns.filter(column => column.id !== id)
    }));
  };

  const updateChartConfig = (config: Partial<ChartConfig>) => {
    setState(prev => ({
      ...prev,
      chartConfig: prev.chartConfig ? { ...prev.chartConfig, ...config } : config as ChartConfig
    }));
  };

  const handleSave = () => {
    if (!state.name.trim()) {
      alert('Please enter a report name');
      return;
    }
    if (state.columns.length === 0) {
      alert('Please add at least one column');
      return;
    }
    onSave(state);
  };

  const tabs = [
    { id: 'general', name: 'General', icon: DocumentTextIcon },
    { id: 'filters', name: 'Filters', icon: FunnelIcon },
    { id: 'columns', name: 'Columns', icon: TableCellsIcon },
    { id: 'charts', name: 'Charts', icon: ChartBarIcon },
    { id: 'schedule', name: 'Schedule', icon: CogIcon },
    { id: 'permissions', name: 'Permissions', icon: EyeIcon }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Report Builder</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowTemplateModal(true)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Use Template</span>
            </button>
            <button
              onClick={() => onPreview(state)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <EyeIcon className="w-4 h-4" />
              <span>Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Name *
              </label>
              <input
                type="text"
                value={state.name}
                onChange={(e) => setState(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter report name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={state.description}
                onChange={(e) => setState(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter report description"
              />
            </div>

            {state.templateId && (
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-blue-800">
                  Based on template: {templates.find(t => t.id === state.templateId)?.name}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'filters' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium text-gray-900">Filters</h3>
              <button
                onClick={addFilter}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Filter</span>
              </button>
            </div>

            {state.filters.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FunnelIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No filters added yet</p>
                <p className="text-sm">Click "Add Filter" to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.filters.map((filter) => (
                  <FilterEditor
                    key={filter.id}
                    filter={filter}
                    onUpdate={(updates) => updateFilter(filter.id, updates)}
                    onRemove={() => removeFilter(filter.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'columns' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium text-gray-900">Columns</h3>
              <button
                onClick={addColumn}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Column</span>
              </button>
            </div>

            {state.columns.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TableCellsIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No columns added yet</p>
                <p className="text-sm">Click "Add Column" to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.columns.map((column) => (
                  <ColumnEditor
                    key={column.id}
                    column={column}
                    onUpdate={(updates) => updateColumn(column.id, updates)}
                    onRemove={() => removeColumn(column.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'charts' && (
          <ChartConfigEditor
            config={state.chartConfig}
            onUpdate={updateChartConfig}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleEditor
            schedule={state.schedule}
            onUpdate={(schedule) => setState(prev => ({ ...prev, schedule }))}
          />
        )}

        {activeTab === 'permissions' && (
          <PermissionsEditor
            permissions={state.permissions}
            onUpdate={(permissions) => setState(prev => ({ ...prev, permissions }))}
          />
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onPreview(state)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Preview
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !state.name.trim()}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'Save Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <TemplateSelector
          templates={templates}
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplateModal(false)}
        />
      )}
    </div>
  );
};

// Filter Editor Component
const FilterEditor: React.FC<{
  filter: ReportFilter;
  onUpdate: (updates: Partial<ReportFilter>) => void;
  onRemove: () => void;
}> = ({ filter, onUpdate, onRemove }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-900">Filter</h4>
        <button
          onClick={onRemove}
          className="text-red-600 hover:text-red-700"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={filter.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={filter.type}
            onChange={(e) => onUpdate({ type: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="date">Date</option>
            <option value="department">Department</option>
            <option value="user">User</option>
            <option value="team">Team</option>
            <option value="status">Status</option>
            <option value="score_range">Score Range</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Operator</label>
          <select
            value={filter.operator}
            onChange={(e) => onUpdate({ operator: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="equals">Equals</option>
            <option value="not_equals">Not Equals</option>
            <option value="contains">Contains</option>
            <option value="greater_than">Greater Than</option>
            <option value="less_than">Less Than</option>
            <option value="between">Between</option>
            <option value="in">In</option>
            <option value="not_in">Not In</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Column Editor Component
const ColumnEditor: React.FC<{
  column: ReportColumn;
  onUpdate: (updates: Partial<ReportColumn>) => void;
  onRemove: () => void;
}> = ({ column, onUpdate, onRemove }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-900">Column</h4>
        <button
          onClick={onRemove}
          className="text-red-600 hover:text-red-700"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={column.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
          <input
            type="text"
            value={column.field}
            onChange={(e) => onUpdate({ field: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={column.type}
            onChange={(e) => onUpdate({ type: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="boolean">Boolean</option>
            <option value="percentage">Percentage</option>
            <option value="currency">Currency</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={column.sortable}
              onChange={(e) => onUpdate({ sortable: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Sortable</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={column.filterable}
              onChange={(e) => onUpdate({ filterable: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Filterable</span>
          </label>
        </div>
      </div>
    </div>
  );
};

// Chart Config Editor Component
const ChartConfigEditor: React.FC<{
  config?: ChartConfig;
  onUpdate: (config: Partial<ChartConfig>) => void;
}> = ({ config, onUpdate }) => {
  if (!config) {
    return (
      <div className="text-center py-8 text-gray-500">
        <ChartBarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No chart configuration</p>
        <button
          onClick={() => onUpdate({
            type: 'table',
            title: '',
            xAxis: '',
            yAxis: '',
            series: []
          })}
          className="mt-3 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Chart
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chart Type</label>
          <select
            value={config.type}
            onChange={(e) => onUpdate({ type: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="table">Table</option>
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="area">Area Chart</option>
            <option value="scatter">Scatter Plot</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={config.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

// Schedule Editor Component
const ScheduleEditor: React.FC<{
  schedule?: any;
  onUpdate: (schedule: any) => void;
}> = ({ schedule, onUpdate }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-medium text-gray-900">Schedule Report</h3>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={schedule?.isActive || false}
            onChange={(e) => onUpdate({ ...schedule, isActive: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Enable Scheduling</span>
        </label>
      </div>
      
      {schedule?.isActive && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
            <select
              value={schedule?.frequency || 'monthly'}
              onChange={(e) => onUpdate({ ...schedule, frequency: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input
              type="time"
              value={schedule?.time || '09:00'}
              onChange={(e) => onUpdate({ ...schedule, time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
            <select
              value={schedule?.format || 'pdf'}
              onChange={(e) => onUpdate({ ...schedule, format: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

// Permissions Editor Component
const PermissionsEditor: React.FC<{
  permissions: any[];
  onUpdate: (permissions: any[]) => void;
}> = ({ permissions, onUpdate }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-medium text-gray-900">Permissions</h3>
        <button
          onClick={() => onUpdate([...permissions, {
            id: `perm_${Date.now()}`,
            permission: 'view',
            grantedBy: 'current_user'
          }])}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add Permission</span>
        </button>
      </div>
      
      {permissions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <EyeIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No permissions configured</p>
          <p className="text-sm">Click "Add Permission" to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {permissions.map((permission, index) => (
            <div key={permission.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md">
              <select
                value={permission.permission}
                onChange={(e) => {
                  const newPermissions = [...permissions];
                  newPermissions[index].permission = e.target.value;
                  onUpdate(newPermissions);
                }}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="view">View</option>
                <option value="edit">Edit</option>
                <option value="delete">Delete</option>
                <option value="share">Share</option>
                <option value="schedule">Schedule</option>
              </select>
              
              <button
                onClick={() => {
                  const newPermissions = permissions.filter((_, i) => i !== index);
                  onUpdate(newPermissions);
                }}
                className="text-red-600 hover:text-red-700"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Template Selector Modal
const TemplateSelector: React.FC<{
  templates: ReportTemplate[];
  onSelect: (template: ReportTemplate) => void;
  onClose: () => void;
}> = ({ templates, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-96 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Select Template</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-80">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => onSelect(template)}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <h4 className="font-medium text-gray-900 mb-2">{template.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{template.category}</span>
                  <span>{template.columns.length} columns</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

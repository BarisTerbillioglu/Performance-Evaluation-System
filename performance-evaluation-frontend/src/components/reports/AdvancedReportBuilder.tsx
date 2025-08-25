import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@/components/design-system/Button';
import { 
  DocumentTextIcon,
  ChartBarIcon,
  TableCellsIcon,
  CalendarIcon,
  FunnelIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface ReportElement {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'text';
  title: string;
  config: any;
  position: number;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  elements: ReportElement[];
  filters: ReportFilter[];
}

interface ReportFilter {
  id: string;
  field: string;
  operator: string;
  value: any;
  label: string;
}

interface AdvancedReportBuilderProps {
  onSave?: (report: any) => void;
  onPreview?: (report: any) => void;
  onExport?: (report: any, format: string) => void;
  onSchedule?: (report: any, schedule: any) => void;
}

export const AdvancedReportBuilder: React.FC<AdvancedReportBuilderProps> = ({
  onSave,
  onPreview,
  onExport,
  onSchedule
}) => {
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [elements, setElements] = useState<ReportElement[]>([]);
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [activeTab, setActiveTab] = useState<'design' | 'filters' | 'schedule' | 'preview'>('design');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'performance-summary',
      name: 'Performance Summary Report',
      description: 'Comprehensive performance overview with key metrics and trends',
      category: 'performance',
      elements: [
        { id: '1', type: 'metric', title: 'Key Performance Indicators', config: {}, position: 0 },
        { id: '2', type: 'chart', title: 'Performance Trends', config: { chartType: 'line' }, position: 1 },
        { id: '3', type: 'table', title: 'Department Comparison', config: {}, position: 2 }
      ],
      filters: []
    },
    {
      id: 'evaluation-status',
      name: 'Evaluation Status Report',
      description: 'Current evaluation progress and completion status',
      category: 'evaluation',
      elements: [
        { id: '1', type: 'metric', title: 'Completion Status', config: {}, position: 0 },
        { id: '2', type: 'chart', title: 'Progress Overview', config: { chartType: 'pie' }, position: 1 },
        { id: '3', type: 'table', title: 'Pending Evaluations', config: {}, position: 2 }
      ],
      filters: []
    },
    {
      id: 'department-analysis',
      name: 'Department Analysis Report',
      description: 'Detailed department performance analysis',
      category: 'department',
      elements: [
        { id: '1', type: 'chart', title: 'Department Comparison', config: { chartType: 'bar' }, position: 0 },
        { id: '2', type: 'chart', title: 'Performance Heatmap', config: { chartType: 'heatmap' }, position: 1 },
        { id: '3', type: 'table', title: 'Department Details', config: {}, position: 2 }
      ],
      filters: []
    }
  ];

  const availableElements = [
    { type: 'metric', title: 'Key Metrics', icon: ChartBarIcon, description: 'Display key performance indicators' },
    { type: 'chart', title: 'Chart', icon: ChartBarIcon, description: 'Add various chart types' },
    { type: 'table', title: 'Data Table', icon: TableCellsIcon, description: 'Display data in table format' },
    { type: 'text', title: 'Text Block', icon: DocumentTextIcon, description: 'Add explanatory text or notes' }
  ];

  const filterFields = [
    { field: 'departmentId', label: 'Department', type: 'select' },
    { field: 'teamId', label: 'Team', type: 'select' },
    { field: 'dateRange', label: 'Date Range', type: 'daterange' },
    { field: 'status', label: 'Status', type: 'select' },
    { field: 'score', label: 'Score Range', type: 'range' }
  ];

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(elements);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setElements(items.map((item, index) => ({ ...item, position: index })));
  };

  const addElement = (type: string) => {
    const newElement: ReportElement = {
      id: Date.now().toString(),
      type: type as any,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      config: {},
      position: elements.length
    };
    setElements([...elements, newElement]);
  };

  const removeElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
  };

  const updateElement = (id: string, updates: Partial<ReportElement>) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const addFilter = () => {
    const newFilter: ReportFilter = {
      id: Date.now().toString(),
      field: '',
      operator: 'equals',
      value: '',
      label: ''
    };
    setFilters([...filters, newFilter]);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id));
  };

  const updateFilter = (id: string, updates: Partial<ReportFilter>) => {
    setFilters(filters.map(f => 
      f.id === id ? { ...f, ...updates } : f
    ));
  };

  const loadTemplate = (templateId: string) => {
    const template = reportTemplates.find(t => t.id === templateId);
    if (template) {
      setElements(template.elements);
      setFilters(template.filters);
      setSelectedTemplate(templateId);
    }
  };

  const handleSave = () => {
    const report = {
      name: reportName,
      description: reportDescription,
      templateId: selectedTemplate,
      elements,
      filters,
      createdAt: new Date().toISOString()
    };
    onSave?.(report);
  };

  const handlePreview = () => {
    const report = {
      name: reportName,
      description: reportDescription,
      elements,
      filters
    };
    onPreview?.(report);
  };

  const handleExport = (format: string) => {
    const report = {
      name: reportName,
      description: reportDescription,
      elements,
      filters
    };
    onExport?.(report, format);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Advanced Report Builder</h1>
              <p className="text-gray-600 mt-1">Create comprehensive reports with drag-and-drop interface</p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                leftIcon={<EyeIcon className="w-4 h-4" />}
                onClick={handlePreview}
              >
                Preview
              </Button>
              <Button
                variant="secondary"
                leftIcon={<DocumentArrowDownIcon className="w-4 h-4" />}
                onClick={() => handleExport('pdf')}
              >
                Export PDF
              </Button>
              <Button
                variant="primary"
                leftIcon={<ClockIcon className="w-4 h-4" />}
                onClick={() => setShowScheduleModal(true)}
              >
                Schedule
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
              >
                Save Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Report Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Name
              </label>
              <input
                type="text"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter report name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => loadTemplate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a template</option>
                {reportTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter report description"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'design', label: 'Design', icon: ChartBarIcon },
                { id: 'filters', label: 'Filters', icon: FunnelIcon },
                { id: 'schedule', label: 'Schedule', icon: ClockIcon },
                { id: 'preview', label: 'Preview', icon: EyeIcon }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Design Tab */}
            {activeTab === 'design' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Elements Palette */}
                <div className="lg:col-span-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Elements</h3>
                  <div className="space-y-2">
                    {availableElements.map(element => (
                      <button
                        key={element.type}
                        onClick={() => addElement(element.type)}
                        className="w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <element.icon className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">{element.title}</div>
                          <div className="text-sm text-gray-500">{element.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Report Canvas */}
                <div className="lg:col-span-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Layout</h3>
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="report-elements">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="min-h-96 border-2 border-dashed border-gray-300 rounded-lg p-4"
                        >
                          {elements.length === 0 ? (
                            <div className="text-center py-12">
                              <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-500">Drag elements here to build your report</p>
                            </div>
                          ) : (
                            elements.map((element, index) => (
                              <Draggable key={element.id} draggableId={element.id} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <input
                                        type="text"
                                        value={element.title}
                                        onChange={(e) => updateElement(element.id, { title: e.target.value })}
                                        className="font-medium text-gray-900 bg-transparent border-none focus:ring-0"
                                      />
                                      <button
                                        onClick={() => removeElement(element.id)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <TrashIcon className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {element.type.charAt(0).toUpperCase() + element.type.slice(1)} Element
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              </div>
            )}

            {/* Filters Tab */}
            {activeTab === 'filters' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Report Filters</h3>
                  <Button
                    variant="secondary"
                    leftIcon={<PlusIcon className="w-4 h-4" />}
                    onClick={addFilter}
                  >
                    Add Filter
                  </Button>
                </div>
                <div className="space-y-4">
                  {filters.map(filter => (
                    <div key={filter.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <select
                        value={filter.field}
                        onChange={(e) => updateFilter(filter.id, { field: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select field</option>
                        {filterFields.map(field => (
                          <option key={field.field} value={field.field}>
                            {field.label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={filter.operator}
                        onChange={(e) => updateFilter(filter.id, { operator: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="equals">Equals</option>
                        <option value="contains">Contains</option>
                        <option value="greater_than">Greater than</option>
                        <option value="less_than">Less than</option>
                        <option value="between">Between</option>
                      </select>
                      <input
                        type="text"
                        value={filter.value}
                        onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="Enter value"
                      />
                      <button
                        onClick={() => removeFilter(filter.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Report</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Time
                    </label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipients
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter email addresses (comma-separated)"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Preview Tab */}
            {activeTab === 'preview' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Preview</h3>
                <div className="bg-gray-50 rounded-lg p-6 min-h-96">
                  <div className="text-center py-12">
                    <EyeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Preview will be generated based on your report configuration</p>
                    <Button
                      variant="primary"
                      className="mt-4"
                      onClick={handlePreview}
                    >
                      Generate Preview
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlusIcon, 
  EyeIcon,
  PencilIcon,
  FunnelIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  UserGroupIcon,
  TrendingUpIcon,
  XCircleIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { DataTable, Column } from '@/components/ui/data';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Input, Select } from '@/components/ui/form';
import { Card } from '@/components/design-system/Card';
import { useAuth } from '@/store';
import { usePermissions } from '@/hooks/usePermissions';
import { evaluationService } from '@/services/evaluationService';
import { userService } from '@/services/userService';
import { 
  EvaluationListDto, 
  EvaluationStatus,
  EvaluationDashboardDto,
  CreateEvaluationRequest
} from '@/types';
import { formatFullName } from '@/utils';
import { UserRole } from '@/types/roles';
import { CreateEvaluationModal } from './components/CreateEvaluationModal';
import { BulkOperationsModal } from './components/BulkOperationsModal';

interface EvaluationFilters {
  searchTerm: string;
  status: EvaluationStatus | '';
  departmentId: number | null;
  evaluatorId: number | null;
  period: string;
  startDate: string;
  endDate: string;
  view: 'all' | 'my' | 'assigned' | 'team';
}

const statusColors = {
  [EvaluationStatus.Draft]: 'default',
  [EvaluationStatus.InProgress]: 'warning',
  [EvaluationStatus.Submitted]: 'info',
  [EvaluationStatus.Completed]: 'success',
  [EvaluationStatus.Overdue]: 'error',
  [EvaluationStatus.Cancelled]: 'default'
} as const;

const statusIcons = {
  [EvaluationStatus.Draft]: ClockIcon,
  [EvaluationStatus.InProgress]: PlayIcon,
  [EvaluationStatus.Submitted]: CheckCircleIcon,
  [EvaluationStatus.Completed]: CheckCircleIcon,
  [EvaluationStatus.Overdue]: ExclamationTriangleIcon,
  [EvaluationStatus.Cancelled]: XCircleIcon
};

export const EvaluationManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, hasRole } = useAuth();
  const { hasPermission } = usePermissions();
  
  // State
  const [evaluations, setEvaluations] = useState<EvaluationListDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dashboard, setDashboard] = useState<EvaluationDashboardDto | null>(null);
  const [selectedEvaluations, setSelectedEvaluations] = useState<(string | number)[]>([]);
  
  // Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // Filters
  const [filters, setFilters] = useState<EvaluationFilters>({
    searchTerm: '',
    status: '',
    departmentId: null,
    evaluatorId: null,
    period: '',
    startDate: '',
    endDate: '',
    view: 'all'
  });

  // Determine available views based on user role
  const availableViews = useMemo(() => {
    const views = [
      { key: 'all', label: 'All Evaluations', roles: [UserRole.ADMIN, UserRole.MANAGER] }
    ];

    if (hasRole(UserRole.EMPLOYEE) || hasRole(UserRole.EVALUATOR) || hasRole(UserRole.MANAGER)) {
      views.push({ key: 'my', label: 'My Evaluations', roles: [UserRole.EMPLOYEE, UserRole.EVALUATOR, UserRole.MANAGER] });
    }

    if (hasRole(UserRole.EVALUATOR) || hasRole(UserRole.MANAGER)) {
      views.push({ key: 'assigned', label: 'Assigned to Me', roles: [UserRole.EVALUATOR, UserRole.MANAGER] });
    }

    if (hasRole(UserRole.MANAGER)) {
      views.push({ key: 'team', label: 'Team Evaluations', roles: [UserRole.MANAGER] });
    }

    return views.filter(view => 
      view.roles.some(role => hasRole(role))
    );
  }, [hasRole]);

  // Load initial data
  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    loadEvaluations();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadDashboard = async () => {
    try {
      const data = await evaluationService.getEvaluationDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  };

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      const params = {
        searchTerm: filters.searchTerm || undefined,
        status: filters.status || undefined,
        departmentId: filters.departmentId || undefined,
        evaluatorId: filters.evaluatorId || undefined,
        period: filters.period || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        page: pagination.current,
        pageSize: pagination.pageSize
      };

      const response = await evaluationService.getEvaluations(params);
      setEvaluations(response.data);
      setPagination(prev => ({ ...prev, total: response.totalCount }));
    } catch (error) {
      console.error('Failed to load evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof EvaluationFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 })); // Reset to first page
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      status: '',
      departmentId: null,
      evaluatorId: null,
      period: '',
      startDate: '',
      endDate: '',
      view: 'all'
    });
  };

  // Handle evaluation actions
  const handleCreateEvaluation = () => {
    // This will be handled by the CreateEvaluationModal
  };

  const handleViewEvaluation = (evaluation: EvaluationListDto) => {
    navigate(`/evaluations/${evaluation.id}`);
  };

  const handleEditEvaluation = (evaluation: EvaluationListDto) => {
    navigate(`/evaluations/${evaluation.id}/edit`);
  };

  const handleDeleteEvaluation = async (evaluation: EvaluationListDto) => {
    if (window.confirm(`Are you sure you want to delete this evaluation for ${evaluation.employeeName}?`)) {
      try {
        await evaluationService.deleteEvaluation(evaluation.id);
        loadEvaluations();
        loadDashboard();
      } catch (error) {
        console.error('Failed to delete evaluation:', error);
      }
    }
  };

  const handleBulkOperations = () => {
    // This will be handled by the BulkOperationsModal
  };

  const handleExportEvaluations = async () => {
    try {
      const blob = await evaluationService.exportEvaluations({
        status: filters.status || undefined,
        departmentId: filters.departmentId || undefined,
        period: filters.period || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evaluations-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export evaluations:', error);
    }
  };

  // Table columns
  const columns: Column<Record<string, any>>[] = [
    {
      key: 'employeeName',
      title: 'Employee',
      sortable: true,
      render: (_, record) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-700">
            {record.employeeName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="ml-3">
            <div className="text-sm font-semibold text-gray-900">
              {record.employeeName}
            </div>
            <div className="text-sm text-gray-500">{record.departmentName}</div>
          </div>
        </div>
      )
    },
    {
      key: 'evaluatorName',
      title: 'Evaluator',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-900 font-medium">{value}</span>
      )
    },
    {
      key: 'period',
      title: 'Period',
      sortable: true,
      render: (value) => (
        <Badge variant="secondary" size="sm">
          {value}
        </Badge>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (status: EvaluationStatus) => {
        const Icon = statusIcons[status];
        return (
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4 text-gray-400" />
            <Badge variant={statusColors[status]} size="sm">
              {status}
            </Badge>
          </div>
        );
      }
    },
    {
      key: 'totalScore',
      title: 'Score',
      sortable: true,
      render: (score: number, record) => {
        if (record.status === EvaluationStatus.Completed && score !== null) {
          const getScoreColor = (score: number) => {
            if (score >= 4.5) return 'success';
            if (score >= 3.5) return 'info';
            if (score >= 2.5) return 'warning';
            return 'error';
          };
          
          return (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-gray-900">{score.toFixed(1)}</span>
              <Badge variant={getScoreColor(score)} size="sm">
                {score >= 4.5 ? 'A' : score >= 3.5 ? 'B' : score >= 2.5 ? 'C' : 'D'}
              </Badge>
            </div>
          );
        }
        return <span className="text-sm text-gray-500">-</span>;
      }
    },
    {
      key: 'createdDate',
      title: 'Created',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-900">
          {new Date(value).toLocaleDateString('tr-TR')}
        </span>
      )
    },
    {
      key: 'completedDate',
      title: 'Completed',
      render: (value) => (
        <span className="text-sm text-gray-500">
          {value ? new Date(value).toLocaleDateString('tr-TR') : '-'}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '140px',
      render: (_, record) => (
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewEvaluation(record as EvaluationListDto)}
            title="View Evaluation"
          >
            <EyeIcon className="w-4 h-4" />
          </Button>
          {record.status !== EvaluationStatus.Completed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditEvaluation(record as EvaluationListDto)}
              title="Edit Evaluation"
            >
              <PencilIcon className="w-4 h-4" />
            </Button>
          )}
          {record.status === EvaluationStatus.Draft && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteEvaluation(record as EvaluationListDto)}
              title="Delete Evaluation"
            >
              <XCircleIcon className="w-4 h-4 text-red-600" />
            </Button>
          )}
        </div>
      )
    }
  ];

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.status) count++;
    if (filters.departmentId) count++;
    if (filters.evaluatorId) count++;
    if (filters.period) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    return count;
  }, [filters]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              Evaluation Management
            </h1>
            <p className="mt-2 max-w-4xl text-sm text-gray-500">
              Create, manage, and track performance evaluations across your organization
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={handleExportEvaluations}
              leftIcon={<DocumentArrowDownIcon className="w-4 h-4" />}
            >
              Export
            </Button>
            <Button
              variant="secondary"
              onClick={handleBulkOperations}
              leftIcon={<UserGroupIcon className="w-4 h-4" />}
            >
              Bulk Operations
            </Button>
            <Button
              onClick={handleCreateEvaluation}
              leftIcon={<PlusIcon className="w-4 h-4" />}
            >
              Create Evaluation
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Evaluations</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.totalEvaluations}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.completedEvaluations}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.pendingEvaluations}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-error-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.overdueEvaluations}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Card className="overflow-hidden">
        {/* Filters Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                leftIcon={<FunnelIcon className="w-4 h-4" />}
              >
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="primary" size="sm" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear All
                </Button>
              )}
            </div>
            
            {selectedEvaluations.length > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500 font-medium">
                  {selectedEvaluations.length} selected
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBulkOperations}
                  leftIcon={<UserGroupIcon className="w-4 h-4" />}
                >
                  Bulk Actions
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="px-6 py-4 border-b border-gray-200 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <Input
                  placeholder="Search by employee or evaluator..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select
                  value={filters.status}
                  onChange={(value) => handleFilterChange('status', value)}
                  options={[
                    { value: '', label: 'All Status' },
                    { value: EvaluationStatus.Draft, label: 'Draft' },
                    { value: EvaluationStatus.InProgress, label: 'In Progress' },
                    { value: EvaluationStatus.Submitted, label: 'Submitted' },
                    { value: EvaluationStatus.Completed, label: 'Completed' },
                    { value: EvaluationStatus.Overdue, label: 'Overdue' },
                    { value: EvaluationStatus.Cancelled, label: 'Cancelled' }
                  ]}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period
                </label>
                <Input
                  placeholder="e.g., Q1 2024"
                  value={filters.period}
                  onChange={(e) => handleFilterChange('period', e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  View
                </label>
                <Select
                  value={filters.view}
                  onChange={(value) => handleFilterChange('view', value)}
                  options={availableViews.map(view => ({ value: view.key, label: view.label }))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <DataTable
            data={evaluations}
            columns={columns}
            loading={loading}
            rowKey="id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: (page, pageSize) => {
                setPagination(prev => ({ ...prev, current: page, pageSize }));
              },
              showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} evaluations`,
              showSizeChanger: true,
              pageSizeOptions: ['10', '25', '50', '100']
            }}
            rowSelection={{
              selectedRowKeys: selectedEvaluations,
              onChange: (selectedRowKeys) => setSelectedEvaluations(selectedRowKeys)
            }}
            onRow={(record) => ({
              onDoubleClick: () => handleViewEvaluation(record as EvaluationListDto),
              className: 'hover:bg-primary-50 transition-colors duration-150'
            })}
            empty={
              <div className="text-center py-12">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No evaluations found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first evaluation or adjusting your filters.
                </p>
                <div className="mt-6">
                  <Button onClick={handleCreateEvaluation}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Create Evaluation
                  </Button>
                </div>
              </div>
            }
          />
        </div>
      </Card>
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlusIcon, 
  EyeIcon,
  PencilIcon,
  FunnelIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { DataTable, Column } from '@/components/ui/data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/feedback';
import { Input, Select } from '@/components/ui/form';
import { Card } from '@/components/ui/layout';
import { useAuth } from '@/store';
import { usePermissions } from '@/hooks/usePermissions';
import { evaluationService } from '@/services/evaluationService';
import { 
  EvaluationListDto, 
  EvaluationStatus,
  BaseSearchRequest,
  PaginatedResponse 
} from '@/types';
import { formatFullName } from '@/utils';
import { UserRole } from '@/types/roles';

interface EvaluationFilters {
  searchTerm: string;
  status: EvaluationStatus | '';
  startDate: string;
  endDate: string;
  view: 'all' | 'my' | 'assigned' | 'team';
}

const statusColors = {
  [EvaluationStatus.Draft]: 'secondary',
  [EvaluationStatus.InProgress]: 'warning',
  [EvaluationStatus.Submitted]: 'info',
  [EvaluationStatus.Completed]: 'success',
  [EvaluationStatus.Overdue]: 'error',
  [EvaluationStatus.Cancelled]: 'secondary'
} as const;

const statusIcons = {
  [EvaluationStatus.Draft]: ClockIcon,
  [EvaluationStatus.InProgress]: ExclamationTriangleIcon,
  [EvaluationStatus.Submitted]: CheckCircleIcon,
  [EvaluationStatus.Completed]: CheckCircleIcon,
  [EvaluationStatus.Overdue]: ExclamationTriangleIcon,
  [EvaluationStatus.Cancelled]: ClockIcon
};

export const EvaluationListPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, hasRole } = useAuth();
  const { hasPermission } = usePermissions();
  
  // State
  const [evaluations, setEvaluations] = useState<EvaluationListDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
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
    startDate: '',
    endDate: '',
    view: 'all'
  });

  // Determine available views based on user role
  const availableViews = useMemo(() => {
    const views = [
      { key: 'all', label: 'All Evaluations', roles: ['Admin', 'Manager', 'HR'] }
    ];

    if (hasRole(UserRole.EMPLOYEE) || hasRole(UserRole.EVALUATOR) || hasRole(UserRole.MANAGER)) {
      views.push({ key: 'my', label: 'My Evaluations', roles: ['Employee', 'Evaluator', 'Manager'] });
    }

    if (hasRole(UserRole.EVALUATOR) || hasRole(UserRole.MANAGER)) {
      views.push({ key: 'assigned', label: 'Assigned to Me', roles: ['Evaluator', 'Manager'] });
    }

    if (hasRole(UserRole.MANAGER)) {
      views.push({ key: 'team', label: 'Team Evaluations', roles: ['Manager'] });
    }

    return views.filter(view => 
      view.roles.some(role => hasRole(role as UserRole))
    );
  }, [hasRole]);

  // Set default view based on user role
  useEffect(() => {
    if (hasRole(UserRole.ADMIN) || hasRole(UserRole.HR)) {
      setFilters(prev => ({ ...prev, view: 'all' }));
    } else if (hasRole(UserRole.EVALUATOR) || hasRole(UserRole.MANAGER)) {
      setFilters(prev => ({ ...prev, view: 'assigned' }));
    } else {
      setFilters(prev => ({ ...prev, view: 'my' }));
    }
  }, [hasRole]);

  // Load evaluations
  useEffect(() => {
    loadEvaluations();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      
      let response: EvaluationListDto[] | PaginatedResponse<EvaluationListDto>;
      
      if (filters.view === 'my') {
        response = await evaluationService.getMyEvaluations();
      } else if (filters.view === 'assigned') {
        response = await evaluationService.getAssignedEvaluations();
      } else {
        // Build search request for filtered views
        const searchRequest: BaseSearchRequest = {
          searchTerm: filters.searchTerm || undefined,
          page: pagination.current,
          pageSize: pagination.pageSize
        };
        
        response = await evaluationService.searchEvaluations(searchRequest);
      }

      // Handle both array and paginated responses
      if (Array.isArray(response)) {
        setEvaluations(response);
        setPagination(prev => ({ ...prev, total: response.length }));
      } else {
        setEvaluations(response.items);
        setPagination(prev => ({ ...prev, total: response.totalCount }));
      }

      // Apply client-side filtering for non-paginated responses
      if (Array.isArray(response)) {
        let filteredData = response;
        
        if (filters.searchTerm) {
          filteredData = filteredData.filter(evaluation =>
            evaluation.employeeName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
            evaluation.evaluatorName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
            evaluation.period.toLowerCase().includes(filters.searchTerm.toLowerCase())
          );
        }
        
        if (filters.status) {
          filteredData = filteredData.filter(evaluation => evaluation.status === filters.status);
        }
        
        if (filters.startDate) {
          filteredData = filteredData.filter(evaluation => 
            new Date(evaluation.createdDate) >= new Date(filters.startDate)
          );
        }
        
        if (filters.endDate) {
          filteredData = filteredData.filter(evaluation => 
            new Date(evaluation.createdDate) <= new Date(filters.endDate)
          );
        }
        
        setEvaluations(filteredData);
      }

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

  // Clear filters
  const clearFilters = () => {
    setFilters(prev => ({
      searchTerm: '',
      status: '',
      startDate: '',
      endDate: '',
      view: prev.view // Keep the current view
    }));
  };

  // Navigation handlers
  const handleViewEvaluation = (evaluation: EvaluationListDto) => {
    navigate(`/evaluations/${evaluation.id}`);
  };

  const handleEditEvaluation = (evaluation: EvaluationListDto) => {
    if (evaluation.status === EvaluationStatus.Completed) {
      // Can't edit completed evaluations, just view
      handleViewEvaluation(evaluation);
      return;
    }
    navigate(`/evaluations/${evaluation.id}/edit`);
  };

  const handleCreateEvaluation = () => {
    navigate('/evaluations/new');
  };

  // Get evaluation status stats
  const statusStats = useMemo(() => {
    const stats = {
      total: evaluations.length,
      draft: evaluations.filter(e => e.status === EvaluationStatus.Draft).length,
      inProgress: evaluations.filter(e => e.status === EvaluationStatus.InProgress).length,
      completed: evaluations.filter(e => e.status === EvaluationStatus.Completed).length,
      overdue: evaluations.filter(e => e.status === EvaluationStatus.Overdue).length
    };
    return stats;
  }, [evaluations]);

  // Table columns
  const columns: Column<EvaluationListDto>[] = [
    {
      key: 'employeeName',
      title: 'Employee',
      sortable: true,
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-900">{record.employeeName}</div>
          <div className="text-sm text-gray-500">{record.departmentName}</div>
        </div>
      )
    },
    {
      key: 'evaluatorName',
      title: 'Evaluator',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-900">{value}</span>
      )
    },
    {
      key: 'period',
      title: 'Period',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-medium text-gray-900">{value}</span>
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
            <Icon className="w-4 h-4" />
            <Badge variant={statusColors[status]}>
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
      render: (value) => (
        <div className="text-center">
          {value > 0 ? (
            <span className="text-lg font-semibold text-gray-900">{value.toFixed(1)}</span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      )
    },
    {
      key: 'createdDate',
      title: 'Created',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'completedDate',
      title: 'Completed',
      render: (value) => (
        <span className="text-sm text-gray-500">
          {value ? new Date(value).toLocaleDateString() : '-'}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '120px',
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewEvaluation(record)}
            title="View Details"
          >
            <EyeIcon className="w-4 h-4" />
          </Button>
          {(record.status !== EvaluationStatus.Completed && hasPermission('evaluations', 'update')) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditEvaluation(record)}
              title="Edit"
            >
              <PencilIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.status) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    return count;
  }, [filters]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              Evaluations
            </h1>
            <p className="mt-2 max-w-4xl text-sm text-gray-500">
              Manage performance evaluations and track progress
            </p>
          </div>
          {hasPermission('evaluations', 'create') && (
            <div className="mt-4 sm:mt-0">
              <Button
                onClick={handleCreateEvaluation}
                leftIcon={<PlusIcon className="w-4 h-4" />}
              >
                New Evaluation
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-lg font-semibold text-gray-900">{statusStats.total}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-lg font-semibold text-gray-900">{statusStats.inProgress}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-6 w-6 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-lg font-semibold text-gray-900">{statusStats.completed}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Overdue</p>
              <p className="text-lg font-semibold text-gray-900">{statusStats.overdue}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Draft</p>
              <p className="text-lg font-semibold text-gray-900">{statusStats.draft}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* View Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {availableViews.map(view => (
            <button
              key={view.key}
              onClick={() => handleFilterChange('view', view.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filters.view === view.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {view.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
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
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="px-4 py-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <Input
                  placeholder="Search evaluations..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value={EvaluationStatus.Draft}>Draft</option>
                  <option value={EvaluationStatus.InProgress}>In Progress</option>
                  <option value={EvaluationStatus.Submitted}>Submitted</option>
                  <option value={EvaluationStatus.Completed}>Completed</option>
                  <option value={EvaluationStatus.Overdue}>Overdue</option>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Table */}
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
            showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} evaluations`
          }}
          onRow={(record) => ({
            onDoubleClick: () => handleViewEvaluation(record)
          })}
          empty={
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No evaluations found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.view === 'my' ? 'You have no evaluations yet.' : 
                 filters.view === 'assigned' ? 'No evaluations are assigned to you.' :
                 'No evaluations match your current filters.'}
              </p>
              {hasPermission('evaluations', 'create') && filters.view !== 'my' && (
                <div className="mt-6">
                  <Button onClick={handleCreateEvaluation}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Create Evaluation
                  </Button>
                </div>
              )}
            </div>
          }
        />
      </div>
    </div>
  );
};

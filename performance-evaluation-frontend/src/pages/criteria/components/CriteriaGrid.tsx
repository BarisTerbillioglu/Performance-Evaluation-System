import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Filter, 
  Search,
  Users,
  FileText,
  MoreHorizontal,
  XCircle,
  Eye,
  Grid,
  List,
  CheckSquare,
  Square,
  Download,
  Upload,
  Settings,
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/ui/feedback/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/design-system/Card';
import { LoadingSpinner } from '@/components/ui/feedback/LoadingSpinner';
import { DataTable } from '@/components/ui/data/DataTable';
import { 
  CriteriaDto, 
  CriteriaCategoryDto 
} from '@/types';

interface CriteriaGridProps {
  criteria?: CriteriaDto[];
  categories?: CriteriaCategoryDto[];
  loading: boolean;
  error: string | null;
  viewMode: 'grid' | 'list';
  filters: {
    search: string;
    categoryId: number | null;
    isActive: boolean | null;
    roleCoverage: 'complete' | 'incomplete' | null;
    usageFrequency: 'high' | 'medium' | 'low' | null;
  };
  onEdit: (criteria: CriteriaDto) => void;
  onCategoryFilter: (categoryId: number | null) => void;
  selectedCategory: number | null;
}

export const CriteriaGrid: React.FC<CriteriaGridProps> = ({
  criteria = [],
  categories = [],
  loading,
  error,
  viewMode,
  filters,
  onEdit,
  onCategoryFilter,
  selectedCategory
}) => {
  const [selectedCriteria, setSelectedCriteria] = useState<Set<number>>(new Set());
  const [showRoleDescriptions, setShowRoleDescriptions] = useState<number | null>(null);
  const [bulkActionMode, setBulkActionMode] = useState(false);

  // Filter criteria based on current filters
  const filteredCriteria = useMemo(() => {
    return criteria.filter(criterion => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          criterion.name.toLowerCase().includes(searchLower) ||
          criterion.baseDescription?.toLowerCase().includes(searchLower) ||
          criterion.categoryName.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.categoryId !== null && criterion.categoryId !== filters.categoryId) {
        return false;
      }

      // Status filter
      if (filters.isActive !== null && criterion.isActive !== filters.isActive) {
        return false;
      }

      // Role coverage filter
      if (filters.roleCoverage !== null) {
        const roleCount = criterion.roleDescriptions.length;
        const isComplete = roleCount >= 4; // Assuming 4 roles: Admin, Manager, Evaluator, Employee
        if (filters.roleCoverage === 'complete' && !isComplete) return false;
        if (filters.roleCoverage === 'incomplete' && isComplete) return false;
      }

      // Usage frequency filter (mock implementation)
      if (filters.usageFrequency !== null) {
        // This would be based on actual usage data from evaluations
        const mockUsage = Math.random(); // Replace with actual usage data
        let usageLevel: 'high' | 'medium' | 'low';
        if (mockUsage > 0.7) usageLevel = 'high';
        else if (mockUsage > 0.3) usageLevel = 'medium';
        else usageLevel = 'low';
        
        if (usageLevel !== filters.usageFrequency) return false;
      }

      return true;
    });
  }, [criteria, filters]);

  const handleSelectCriteria = (criteriaId: number) => {
    const newSelected = new Set(selectedCriteria);
    if (newSelected.has(criteriaId)) {
      newSelected.delete(criteriaId);
    } else {
      newSelected.add(criteriaId);
    }
    setSelectedCriteria(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedCriteria.size === filteredCriteria.length) {
      setSelectedCriteria(new Set());
    } else {
      setSelectedCriteria(new Set(filteredCriteria.map(c => c.id)));
    }
  };

  const getRoleCoverageStatus = (criteria: CriteriaDto) => {
    const roleCount = criteria.roleDescriptions.length;
    const totalRoles = 4; // Admin, Manager, Evaluator, Employee
    const percentage = (roleCount / totalRoles) * 100;
    
    if (percentage === 100) return { status: 'complete', color: 'success', icon: CheckCircle };
    if (percentage >= 75) return { status: 'mostly-complete', color: 'warning', icon: AlertTriangle };
    return { status: 'incomplete', color: 'error', icon: XCircle };
  };

  const getUsageFrequency = (criteria: CriteriaDto) => {
    // Mock implementation - replace with actual usage data
    const mockUsage = Math.random();
    if (mockUsage > 0.7) return { level: 'high', color: 'success', icon: Activity };
    if (mockUsage > 0.3) return { level: 'medium', color: 'warning', icon: BarChart3 };
    return { level: 'low', color: 'secondary', icon: FileText };
  };

  const columns = [
    {
      key: 'select',
      header: () => (
        <input
          type="checkbox"
          checked={selectedCriteria.size === filteredCriteria.length && filteredCriteria.length > 0}
          onChange={handleSelectAll}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
      ),
      render: (criterion: CriteriaDto) => (
        <input
          type="checkbox"
          checked={selectedCriteria.has(criterion.id)}
          onChange={() => handleSelectCriteria(criterion.id)}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
      )
    },
    {
      key: 'name',
      header: 'Criteria Name',
      render: (criterion: CriteriaDto) => (
        <div>
          <div className="font-medium text-gray-900">{criterion.name}</div>
          {criterion.baseDescription && (
            <div className="text-sm text-gray-500 mt-1 truncate max-w-xs">
              {criterion.baseDescription}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category',
      render: (criterion: CriteriaDto) => (
        <div className="flex items-center space-x-2">
          <Badge variant="outline" size="sm">
            {criterion.categoryName}
          </Badge>
          <span className="text-xs text-gray-500">
            {criterion.categoryWeight.toFixed(1)}%
          </span>
        </div>
      )
    },
    {
      key: 'roleCoverage',
      header: 'Role Coverage',
      render: (criterion: CriteriaDto) => {
        const coverage = getRoleCoverageStatus(criterion);
        const Icon = coverage.icon;
        return (
          <div className="flex items-center space-x-2">
            <Icon className={`w-4 h-4 text-${coverage.color}-500`} />
            <Badge variant={coverage.color as any} size="sm">
              {criterion.roleDescriptions.length}/4 roles
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRoleDescriptions(
                showRoleDescriptions === criterion.id ? null : criterion.id
              )}
            >
              <Eye className="w-3 h-3" />
            </Button>
          </div>
        );
      }
    },
    {
      key: 'usage',
      header: 'Usage',
      render: (criterion: CriteriaDto) => {
        const usage = getUsageFrequency(criterion);
        const Icon = usage.icon;
        return (
          <div className="flex items-center space-x-2">
            <Icon className={`w-4 h-4 text-${usage.color}-500`} />
            <Badge variant={usage.color as any} size="sm">
              {usage.level}
            </Badge>
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (criterion: CriteriaDto) => (
        <Badge
          variant={criterion.isActive ? 'success' : 'secondary'}
          size="sm"
        >
          {criterion.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (criterion: CriteriaDto) => (
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(criterion)}
            leftIcon={<Edit2 className="w-3 h-3" />}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            leftIcon={<MoreHorizontal className="w-4 h-4" />}
          >
            More
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="elevated" className="p-6">
        <div className="flex items-center justify-center text-red-600">
          <XCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bulk Actions Toolbar */}
      {selectedCriteria.size > 0 && (
        <Card variant="accent" className="border-primary-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-primary-700">
                  {selectedCriteria.size} criteria selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCriteria(new Set())}
                  leftIcon={<X className="w-4 h-4" />}
                >
                  Clear Selection
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                >
                  Activate Selected
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<XCircle className="w-4 h-4" />}
                >
                  Deactivate Selected
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<Trash2 className="w-4 h-4" />}
                >
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Criteria Display */}
      {viewMode === 'list' ? (
        <Card variant="elevated">
          <CardContent className="p-6">
            <DataTable
              data={filteredCriteria}
              columns={columns}
              loading={loading}
              emptyState={{
                title: 'No Criteria Found',
                description: selectedCategory 
                  ? 'No criteria found for the selected category. Try changing the filter or add new criteria.'
                  : 'Create your first evaluation criteria to get started.',
                action: {
                  label: 'Add Criteria',
                  onClick: () => {/* TODO: Open add criteria modal */}
                }
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCriteria.map((criterion) => {
            const coverage = getRoleCoverageStatus(criterion);
            const usage = getUsageFrequency(criterion);
            const CoverageIcon = coverage.icon;
            const UsageIcon = usage.icon;
            
            return (
              <Card key={criterion.id} variant="elevated" className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{criterion.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" size="sm">
                            {criterion.categoryName}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {criterion.categoryWeight.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedCriteria.has(criterion.id)}
                        onChange={() => handleSelectCriteria(criterion.id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </div>

                    {/* Description */}
                    {criterion.baseDescription && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {criterion.baseDescription}
                      </p>
                    )}

                    {/* Status Indicators */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CoverageIcon className={`w-4 h-4 text-${coverage.color}-500`} />
                        <Badge variant={coverage.color as any} size="sm">
                          {criterion.roleDescriptions.length}/4 roles
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <UsageIcon className={`w-4 h-4 text-${usage.color}-500`} />
                        <Badge variant={usage.color as any} size="sm">
                          {usage.level}
                        </Badge>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={criterion.isActive ? 'success' : 'secondary'}
                        size="sm"
                      >
                        {criterion.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowRoleDescriptions(
                            showRoleDescriptions === criterion.id ? null : criterion.id
                          )}
                          leftIcon={<Eye className="w-3 h-3" />}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(criterion)}
                          leftIcon={<Edit2 className="w-3 h-3" />}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredCriteria.length === 0 && !loading && (
        <Card variant="elevated" className="p-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                No Criteria Found
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {selectedCategory 
                  ? 'No criteria found for the selected category. Try changing the filter or add new criteria.'
                  : 'Create your first evaluation criteria to get started.'
                }
              </p>
            </div>
            <Button
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Criteria
            </Button>
          </div>
        </Card>
      )}

      {/* Role Descriptions Expansion */}
      {showRoleDescriptions && (
        <Card variant="elevated" className="mt-4">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Role-Specific Descriptions
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRoleDescriptions(null)}
                leftIcon={<X className="w-4 h-4" />}
              >
                Close
              </Button>
            </div>
            
            {(() => {
              const criterion = criteria.find(c => c.id === showRoleDescriptions);
              if (!criterion) return null;

              return (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{criterion.name}</h4>
                    <p className="text-sm text-gray-600">{criterion.baseDescription}</p>
                  </div>
                  
                  {criterion.roleDescriptions.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No role-specific descriptions yet</p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onEdit(criterion)}
                        className="mt-2"
                        leftIcon={<Plus className="w-4 h-4" />}
                      >
                        Add Role Description
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {criterion.roleDescriptions.map((roleDesc) => (
                        <div key={roleDesc.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900">
                              {roleDesc.roleName}
                            </h5>
                            <Badge
                              variant={roleDesc.isActive ? 'success' : 'secondary'}
                              size="sm"
                            >
                              {roleDesc.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {roleDesc.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

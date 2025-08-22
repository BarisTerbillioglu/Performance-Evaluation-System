import React, { useState } from 'react';
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
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/form/Input';
import { Badge } from '@/components/ui/feedback/Badge';
import { Card } from '@/components/ui/layout/Card';
import { LoadingSpinner } from '@/components/ui/feedback/LoadingSpinner';
import { DataTable } from '@/components/ui/data/DataTable';
import { 
  CriteriaDto, 
  CriteriaCategoryDto 
} from '@/types';

interface CriteriaListSectionProps {
  criteria?: CriteriaDto[];
  categories?: CriteriaCategoryDto[];
  loading: boolean;
  error: string | null;
  onEdit: (criteria: CriteriaDto) => void;
  onAdd: () => void;
  selectedCategory: number | null;
  onCategoryFilter: (categoryId: number | null) => void;
}

export const CriteriaListSection: React.FC<CriteriaListSectionProps> = ({
  criteria = [],
  categories = [],
  loading,
  error,
  onEdit,
  onAdd,
  selectedCategory,
  onCategoryFilter
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showRoleDescriptions, setShowRoleDescriptions] = useState<number | null>(null);

  const filteredCriteria = criteria.filter(criterion => {
    const matchesSearch = !searchTerm || 
      criterion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      criterion.baseDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      criterion.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const selectedCategoryName = categories.find(cat => cat.id === selectedCategory)?.name;

  const columns = [
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
      key: 'roleDescriptions',
      header: 'Role Descriptions',
      render: (criterion: CriteriaDto) => (
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {criterion.roleDescriptions.length} role{criterion.roleDescriptions.length !== 1 ? 's' : ''}
          </span>
          {criterion.roleDescriptions.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRoleDescriptions(
                showRoleDescriptions === criterion.id ? null : criterion.id
              )}
            >
              <Eye className="w-3 h-3" />
            </Button>
          )}
        </div>
      )
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
            variant="outline"
            size="sm"
            onClick={() => onEdit(criterion)}
            className="flex items-center space-x-1"
          >
            <Edit2 className="w-3 h-3" />
            <span>Edit</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <MoreHorizontal className="w-4 h-4" />
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <XCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters and Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Evaluation Criteria
          </h2>
          {selectedCategoryName && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Filtered by:</span>
              <Badge variant="outline" className="flex items-center space-x-1">
                <span>{selectedCategoryName}</span>
                <button
                  onClick={() => onCategoryFilter(null)}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <XCircle className="w-3 h-3" />
                </button>
              </Badge>
            </div>
          )}
        </div>
        <Button onClick={onAdd} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Criteria</span>
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search criteria by name, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Category:</span>
            <select
              value={selectedCategory || ''}
              onChange={(e) => onCategoryFilter(e.target.value ? parseInt(e.target.value) : null)}
              className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Criteria Table */}
      <Card>
        <div className="p-6">
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
                onClick: onAdd
              }
            }}
          />
        </div>
      </Card>

      {/* Role Descriptions Expansion */}
      {showRoleDescriptions && (
        <Card className="mt-4">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Role-Specific Descriptions
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRoleDescriptions(null)}
              >
                <XCircle className="w-4 h-4" />
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
                      <FileText className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No role-specific descriptions yet</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(criterion)}
                        className="mt-2"
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
          </div>
        </Card>
      )}
    </div>
  );
};

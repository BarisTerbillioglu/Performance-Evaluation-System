import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  Users,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/ui/form/Input';
import { Badge } from '@/components/ui/feedback/Badge';
import { Card, CardContent } from '@/components/design-system/Card';
import { CriteriaCategoryDto } from '@/types';

interface CriteriaFiltersProps {
  filters: {
    search: string;
    categoryId: number | null;
    isActive: boolean | null;
    roleCoverage: 'complete' | 'incomplete' | null;
    usageFrequency: 'high' | 'medium' | 'low' | null;
  };
  categories: CriteriaCategoryDto[];
  onFiltersChange: (filters: any) => void;
}

export const CriteriaFilters: React.FC<CriteriaFiltersProps> = ({
  filters,
  categories,
  onFiltersChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  // Count active filters
  React.useEffect(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.categoryId !== null) count++;
    if (filters.isActive !== null) count++;
    if (filters.roleCoverage !== null) count++;
    if (filters.usageFrequency !== null) count++;
    setActiveFilters(count);
  }, [filters]);

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      categoryId: null,
      isActive: null,
      roleCoverage: null,
      usageFrequency: null
    });
  };

  const clearFilter = (key: string) => {
    handleFilterChange(key, key === 'search' ? '' : null);
  };

  const getFilterBadge = (key: string, value: any) => {
    if (value === null || value === '') return null;

    let label = '';
    let variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' = 'primary';

    switch (key) {
      case 'search':
        label = `Search: "${value}"`;
        break;
      case 'categoryId':
        const category = categories.find(c => c.id === value);
        label = `Category: ${category?.name || 'Unknown'}`;
        variant = 'secondary';
        break;
      case 'isActive':
        label = `Status: ${value ? 'Active' : 'Inactive'}`;
        variant = value ? 'success' : 'secondary';
        break;
      case 'roleCoverage':
        label = `Role Coverage: ${value === 'complete' ? 'Complete' : 'Incomplete'}`;
        variant = value === 'complete' ? 'success' : 'warning';
        break;
      case 'usageFrequency':
        label = `Usage: ${value.charAt(0).toUpperCase() + value.slice(1)}`;
        variant = value === 'high' ? 'success' : value === 'medium' ? 'warning' : 'secondary';
        break;
    }

    return (
      <Badge
        key={key}
        variant={variant}
        size="sm"
        className="flex items-center space-x-1"
      >
        <span>{label}</span>
        <button
          onClick={() => clearFilter(key)}
          className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
        >
          <X className="w-3 h-3" />
        </button>
      </Badge>
    );
  };

  return (
    <Card variant="elevated">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search criteria by name, description, or category..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              leftIcon={isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            >
              Filters
              {activeFilters > 0 && (
                <Badge variant="primary" size="sm" className="ml-2">
                  {activeFilters}
                </Badge>
              )}
            </Button>
            {activeFilters > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                leftIcon={<X className="w-4 h-4" />}
              >
                Clear All
              </Button>
            )}
          </div>

          {/* Active Filters */}
          {activeFilters > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => 
                getFilterBadge(key, value)
              )}
            </div>
          )}

          {/* Advanced Filters */}
          {isExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.categoryId || ''}
                  onChange={(e) => handleFilterChange('categoryId', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.isActive === null ? '' : filters.isActive.toString()}
                  onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? null : e.target.value === 'true')}
                  className="w-full rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              {/* Role Coverage Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Coverage
                </label>
                <select
                  value={filters.roleCoverage || ''}
                  onChange={(e) => handleFilterChange('roleCoverage', e.target.value || null)}
                  className="w-full rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">All Coverage</option>
                  <option value="complete">Complete</option>
                  <option value="incomplete">Incomplete</option>
                </select>
              </div>

              {/* Usage Frequency Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usage Frequency
                </label>
                <select
                  value={filters.usageFrequency || ''}
                  onChange={(e) => handleFilterChange('usageFrequency', e.target.value || null)}
                  className="w-full rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">All Usage</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          )}

          {/* Filter Presets */}
          {isExpanded && (
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Filters</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterChange('isActive', true)}
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                >
                  Active Only
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterChange('roleCoverage', 'complete')}
                  leftIcon={<Users className="w-4 h-4" />}
                >
                  Complete Role Coverage
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterChange('roleCoverage', 'incomplete')}
                  leftIcon={<AlertTriangle className="w-4 h-4" />}
                >
                  Incomplete Role Coverage
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterChange('usageFrequency', 'high')}
                  leftIcon={<Activity className="w-4 h-4" />}
                >
                  High Usage
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterChange('usageFrequency', 'low')}
                  leftIcon={<XCircle className="w-4 h-4" />}
                >
                  Low Usage
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

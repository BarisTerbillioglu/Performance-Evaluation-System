import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Users,
  FileText,
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/design-system/Card';
import { Badge } from '@/components/ui/feedback/Badge';
import { Button } from '@/components/design-system/Button';
import { LoadingSpinner } from '@/components/ui/feedback/LoadingSpinner';
import { CriteriaCategoryDto, CriteriaDto, WeightValidationDto } from '@/types';

interface CategoryStatisticsDashboardProps {
  categories?: CriteriaCategoryDto[];
  criteria?: CriteriaDto[];
  weightValidation?: WeightValidationDto | null;
  loading: boolean;
  onCategorySelect: (categoryId: number) => void;
  onWeightValidation: () => void;
}

export const CategoryStatisticsDashboard: React.FC<CategoryStatisticsDashboardProps> = ({
  categories = [],
  criteria = [],
  weightValidation,
  loading,
  onCategorySelect,
  onWeightValidation
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Calculate statistics
  const totalCategories = categories.length;
  const activeCategories = categories.filter(cat => cat.isActive).length;
  const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);
  const weightStatus = weightValidation?.isValid ? 'valid' : 'invalid';
  
  const totalCriteria = criteria.length;
  const activeCriteria = criteria.filter(c => c.isActive).length;
  
  // Categories needing attention (weight < 1% or > 50%)
  const categoriesNeedingAttention = categories.filter(cat => 
    cat.weight < 1 || cat.weight > 50
  ).length;

  // Most used categories (categories with most criteria)
  const categoryUsage = categories.map(cat => ({
    ...cat,
    criteriaCount: criteria.filter(c => c.categoryId === cat.id).length
  })).sort((a, b) => b.criteriaCount - a.criteriaCount);

  const mostUsedCategory = categoryUsage[0];
  const leastUsedCategory = categoryUsage[categoryUsage.length - 1];

  // Weight distribution analysis
  const weightDistribution = categories.map(cat => ({
    ...cat,
    percentage: (cat.weight / totalWeight) * 100,
    status: cat.weight < 1 ? 'low' : cat.weight > 50 ? 'high' : 'optimal'
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'text-green-600 bg-green-50 border-green-200';
      case 'invalid': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getWeightStatusColor = (weight: number) => {
    if (weight < 1) return 'text-red-600 bg-red-50 border-red-200';
    if (weight > 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const metricCards = [
    {
      title: 'Total Active Categories',
      value: activeCategories,
      total: totalCategories,
      icon: PieChart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: activeCategories > 0 ? 'up' : 'down',
      description: 'Categories currently in use'
    },
    {
      title: 'Total Weight Distribution',
      value: totalWeight.toFixed(1),
      unit: '%',
      icon: Target,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      status: weightStatus,
      description: weightStatus === 'valid' ? 'Weights are balanced' : 'Weight validation needed'
    },
    {
      title: 'Categories Needing Attention',
      value: categoriesNeedingAttention,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: 'Categories with extreme weights'
    },
    {
      title: 'Total Active Criteria',
      value: activeCriteria,
      total: totalCriteria,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: activeCriteria > 0 ? 'up' : 'down',
      description: 'Criteria currently in use'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => (
          <Card key={index} variant="elevated" className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {metric.title}
                  </p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {metric.value}
                      {metric.unit && <span className="text-lg">{metric.unit}</span>}
                    </p>
                    {metric.total && (
                      <p className="text-sm text-gray-500">
                        / {metric.total}
                      </p>
                    )}
                    {metric.trend && (
                      <div className={`flex items-center ${
                        metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.trend === 'up' ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {metric.description}
                  </p>
                  {metric.status && (
                    <Badge 
                      variant={metric.status === 'valid' ? 'success' : 'error'}
                      size="sm"
                      className="mt-2"
                    >
                      {metric.status === 'valid' ? 'Valid' : 'Invalid'}
                    </Badge>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weight Distribution and Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Distribution Chart */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-primary-600" />
              <span>Weight Distribution</span>
              <Badge 
                variant={weightStatus === 'valid' ? 'success' : 'error'}
                size="sm"
              >
                {weightStatus === 'valid' ? 'Valid' : 'Invalid'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Weight</span>
                <span className={`text-lg font-bold ${
                  weightStatus === 'valid' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {totalWeight.toFixed(1)}%
                </span>
              </div>
              
              <div className="space-y-3">
                {weightDistribution.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                      <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded border ${getWeightStatusColor(cat.weight)}`}>
                        {cat.weight.toFixed(1)}%
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCategorySelect(cat.id)}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {weightStatus === 'invalid' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onWeightValidation}
                  className="w-full"
                  leftIcon={<AlertTriangle className="w-4 h-4" />}
                >
                  Fix Weight Issues
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              <span>Category Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Most Used Category */}
              {mostUsedCategory && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-900">Most Used Category</h4>
                    <Badge variant="success" size="sm">
                      {mostUsedCategory.criteriaCount} criteria
                    </Badge>
                  </div>
                  <p className="text-sm text-green-700 mb-2">{mostUsedCategory.name}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCategorySelect(mostUsedCategory.id)}
                    className="text-green-600 hover:text-green-700"
                  >
                    View Details
                  </Button>
                </div>
              )}

              {/* Least Used Category */}
              {leastUsedCategory && leastUsedCategory.criteriaCount === 0 && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-yellow-900">Needs Attention</h4>
                    <Badge variant="warning" size="sm">
                      No criteria
                    </Badge>
                  </div>
                  <p className="text-sm text-yellow-700 mb-2">{leastUsedCategory.name}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCategorySelect(leastUsedCategory.id)}
                    className="text-yellow-600 hover:text-yellow-700"
                  >
                    Add Criteria
                  </Button>
                </div>
              )}

              {/* Categories Needing Attention */}
              {categoriesNeedingAttention > 0 && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-red-900">Weight Issues</h4>
                    <Badge variant="error" size="sm">
                      {categoriesNeedingAttention} categories
                    </Badge>
                  </div>
                  <p className="text-sm text-red-700 mb-2">
                    Categories with extreme weight values need adjustment
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onWeightValidation}
                    className="text-red-600 hover:text-red-700"
                  >
                    Review Weights
                  </Button>
                </div>
              )}

              {/* Quick Actions */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onWeightValidation()}
                    leftIcon={<Target className="w-4 h-4" />}
                  >
                    Validate Weights
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onCategorySelect(categories[0]?.id || 0)}
                    leftIcon={<BarChart3 className="w-4 h-4" />}
                  >
                    View All Categories
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category List with Quick Actions */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary-600" />
            <span>All Categories</span>
            <Badge variant="outline" size="sm">
              {categories.length} total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {categories.map((category) => {
              const criteriaCount = criteria.filter(c => c.categoryId === category.id).length;
              const activeCriteriaCount = criteria.filter(c => c.categoryId === category.id && c.isActive).length;
              
              return (
                <div key={category.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      category.isActive ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <div>
                      <h4 className="font-medium text-gray-900">{category.name}</h4>
                      {category.description && (
                        <p className="text-sm text-gray-500">{category.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getWeightStatusColor(category.weight)}`}>
                          {category.weight.toFixed(1)}%
                        </span>
                        <Badge variant={category.isActive ? 'success' : 'secondary'} size="sm">
                          {category.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {activeCriteriaCount}/{criteriaCount} criteria active
                      </p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCategorySelect(category.id)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

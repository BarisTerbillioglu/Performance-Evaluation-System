import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Settings, 
  Download, 
  Upload, 
  History, 
  Eye, 
  BarChart3,
  PieChart,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Filter,
  Search,
  Grid,
  List,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/design-system/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/design-system/Card';
import { Badge } from '@/components/ui/feedback/Badge';
import { Alert } from '@/components/ui/feedback/Alert';
import { LoadingSpinner } from '@/components/ui/feedback/LoadingSpinner';
import { CategoryStatisticsDashboard } from './components/CategoryStatisticsDashboard';
import { CategoryWeightManagement } from './components/CategoryWeightManagement';
import { CriteriaGrid } from './components/CriteriaGrid';
import { CriteriaFilters } from './components/CriteriaFilters';
import { CreateCriteriaModal } from './components/CreateCriteriaModal';
import { CategoryFormModal } from './components/CategoryFormModal';
import { WeightValidationModal } from './components/WeightValidationModal';
import { ImportExportModal } from './components/ImportExportModal';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { CriteriaPreviewModal } from './components/CriteriaPreviewModal';
import { useCriteria } from '@/hooks/useCriteria';
import { useCriteriaCategories } from '@/hooks/useCriteriaCategories';
import { CriteriaCategoryDto, CriteriaDto, WeightValidationDto } from '@/types';

export const CriteriaManagementPage: React.FC = () => {
  const [activeView, setActiveView] = useState<'overview' | 'categories' | 'criteria'>('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCriteriaForm, setShowCriteriaForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showWeightValidation, setShowWeightValidation] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CriteriaCategoryDto | null>(null);
  const [editingCriteria, setEditingCriteria] = useState<CriteriaDto | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    categoryId: null as number | null,
    isActive: null as boolean | null,
    roleCoverage: null as 'complete' | 'incomplete' | null,
    usageFrequency: null as 'high' | 'medium' | 'low' | null
  });

  const { 
    categories, 
    loading: categoriesLoading, 
    error: categoriesError,
    refetch: refetchCategories,
    weightValidation,
    validateWeights
  } = useCriteriaCategories();

  const { 
    criteria, 
    loading: criteriaLoading, 
    error: criteriaError,
    refetch: refetchCriteria
  } = useCriteria(selectedCategory);

  useEffect(() => {
    validateWeights();
  }, [categories, validateWeights]);

  const handleCategoryEdit = (category: CriteriaCategoryDto) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleCriteriaEdit = (criteria: CriteriaDto) => {
    setEditingCriteria(criteria);
    setShowCriteriaForm(true);
  };

  const handleFormClose = () => {
    setShowCriteriaForm(false);
    setShowCategoryForm(false);
    setEditingCategory(null);
    setEditingCriteria(null);
  };

  const handleFormSuccess = () => {
    refetchCategories();
    refetchCriteria();
    handleFormClose();
  };

  const getWeightStatus = (validation: WeightValidationDto | null) => {
    if (!validation) return { status: 'unknown', color: 'gray' };
    if (validation.isValid) return { status: 'valid', color: 'green' };
    return { status: 'invalid', color: 'red' };
  };

  const weightStatus = getWeightStatus(weightValidation);

  const views = [
    { 
      id: 'overview' as const, 
      label: 'Overview', 
      icon: BarChart3,
      description: 'Category statistics and weight distribution'
    },
    { 
      id: 'categories' as const, 
      label: 'Categories', 
      icon: PieChart,
      description: 'Manage criteria categories and weights',
      count: categories?.length || 0
    },
    { 
      id: 'criteria' as const, 
      label: 'Criteria', 
      icon: Grid,
      description: 'Manage individual evaluation criteria',
      count: criteria?.length || 0
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              Criteria Management System
            </h1>
            <p className="mt-2 max-w-4xl text-sm text-gray-500">
              Comprehensive management of evaluation criteria, categories, and weight distribution for the performance evaluation system.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowPreview(true)}
              leftIcon={<Eye className="w-4 h-4" />}
            >
              Preview
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowVersionHistory(true)}
              leftIcon={<History className="w-4 h-4" />}
            >
              History
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowImportExport(true)}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Import/Export
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowWeightValidation(true)}
              leftIcon={<Settings className="w-4 h-4" />}
            >
              Validate Weights
            </Button>
          </div>
        </div>
      </div>

      {/* Weight Validation Alert */}
      {weightValidation && !weightValidation.isValid && (
        <Alert
          type="warning"
          title="Weight Validation Issues"
          message={`Total weight is ${weightValidation.totalWeight}%. ${weightValidation.errors.join(', ')}`}
          action={{
            label: "Fix Weights",
            onClick: () => setShowWeightValidation(true)
          }}
        />
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                activeView === view.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <view.icon className="w-4 h-4" />
              <span>{view.label}</span>
              {view.count !== undefined && view.count > 0 && (
                <Badge variant="outline" size="sm" className="ml-2">
                  {view.count}
                </Badge>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* View Content */}
      <div className="space-y-6">
        {activeView === 'overview' && (
          <CategoryStatisticsDashboard
            categories={categories}
            criteria={criteria}
            weightValidation={weightValidation}
            loading={categoriesLoading || criteriaLoading}
            onCategorySelect={(categoryId) => {
              setSelectedCategory(categoryId);
              setActiveView('criteria');
            }}
            onWeightValidation={() => setShowWeightValidation(true)}
          />
        )}

        {activeView === 'categories' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Category Management
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Manage criteria categories and their weight distribution
                </p>
              </div>
              <Button
                onClick={() => setShowCategoryForm(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Category
              </Button>
            </div>

            <CategoryWeightManagement
              categories={categories}
              loading={categoriesLoading}
              error={categoriesError}
              weightValidation={weightValidation}
              onEdit={handleCategoryEdit}
              onWeightValidation={() => setShowWeightValidation(true)}
            />
          </div>
        )}

        {activeView === 'criteria' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Criteria Management
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Manage individual evaluation criteria and role descriptions
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-white text-primary-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-white text-primary-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                <Button
                  onClick={() => setShowCriteriaForm(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Criteria
                </Button>
              </div>
            </div>

            <CriteriaFilters
              filters={filters}
              categories={categories}
              onFiltersChange={setFilters}
            />

            <CriteriaGrid
              criteria={criteria}
              categories={categories}
              loading={criteriaLoading}
              error={criteriaError}
              viewMode={viewMode}
              filters={filters}
              onEdit={handleCriteriaEdit}
              onCategoryFilter={setSelectedCategory}
              selectedCategory={selectedCategory}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {showCategoryForm && (
        <CategoryFormModal
          category={editingCategory}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {showCriteriaForm && (
        <CreateCriteriaModal
          criteria={editingCriteria}
          categories={categories}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {showWeightValidation && (
        <WeightValidationModal
          categories={categories}
          weightValidation={weightValidation}
          onClose={() => setShowWeightValidation(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {showImportExport && (
        <ImportExportModal
          onClose={() => setShowImportExport(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {showVersionHistory && (
        <VersionHistoryModal
          onClose={() => setShowVersionHistory(false)}
        />
      )}

      {showPreview && (
        <CriteriaPreviewModal
          categories={categories}
          criteria={criteria}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

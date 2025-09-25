import React, { useState, useEffect } from 'react';
import { Plus, Settings, Download, Upload, History, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button/Button';
import { Alert } from '@/components/ui/feedback/Alert';
import { CriteriaCategoriesSection } from './components/CriteriaCategoriesSection';
import { CriteriaListSection } from './components/CriteriaListSection';
import { CriteriaFormModal } from './components/CriteriaFormModal';
import { CategoryFormModal } from './components/CategoryFormModal';
import { WeightValidationModal } from './components/WeightValidationModal';
import { ImportExportModal } from './components/ImportExportModal';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { CriteriaPreviewModal } from './components/CriteriaPreviewModal';
import { useCriteria } from '@/hooks/useCriteria';
import { useCriteriaCategories } from '@/hooks/useCriteriaCategories';
import { CriteriaCategoryDto, CriteriaDto } from '@/types';

export const CriteriaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'criteria'>('categories');
  const [showCriteriaForm, setShowCriteriaForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showWeightValidation, setShowWeightValidation] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CriteriaCategoryDto | null>(null);
  const [editingCriteria, setEditingCriteria] = useState<CriteriaDto | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

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
  }, [categories]);

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

  const tabs = [
    { id: 'categories' as const, label: 'Categories', count: categories?.length || 0 },
    { id: 'criteria' as const, label: 'Criteria', count: criteria?.length || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              Evaluation Criteria Management
            </h1>
            <p className="mt-2 max-w-4xl text-sm text-gray-500">
              Manage evaluation criteria, categories, and their weights. Ensure total weights equal 100%.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(true)}
              className="flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVersionHistory(true)}
              className="flex items-center space-x-2"
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImportExport(true)}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Import/Export</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowWeightValidation(true)}
              className="flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Validate Weights</span>
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'categories' && (
          <CriteriaCategoriesSection
            categories={categories}
            loading={categoriesLoading}
            error={categoriesError}
            onEdit={handleCategoryEdit}
            onAdd={() => setShowCategoryForm(true)}
            onCategorySelect={setSelectedCategory}
            selectedCategory={selectedCategory}
            weightValidation={weightValidation}
          />
        )}

        {activeTab === 'criteria' && (
          <CriteriaListSection
            criteria={criteria}
            categories={categories}
            loading={criteriaLoading}
            error={criteriaError}
            onEdit={handleCriteriaEdit}
            onAdd={() => setShowCriteriaForm(true)}
            selectedCategory={selectedCategory}
            onCategoryFilter={setSelectedCategory}
          />
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
        <CriteriaFormModal
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
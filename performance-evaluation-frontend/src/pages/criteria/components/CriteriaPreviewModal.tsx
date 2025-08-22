import React, { useState } from 'react';
import { 
  X, 
  Eye, 
  Users, 
  BarChart3,
  FileText,
  ChevronDown,
  ChevronRight,
  Download,
  Print
} from 'lucide-react';
import { Button } from '@/components/ui/button/Button';
import { Badge } from '@/components/ui/feedback/Badge';
import { Card } from '@/components/ui/layout/Card';
import { CriteriaCategoryDto, CriteriaDto, RoleDto } from '@/types';

interface CriteriaPreviewModalProps {
  categories?: CriteriaCategoryDto[];
  criteria?: CriteriaDto[];
  onClose: () => void;
}

export const CriteriaPreviewModal: React.FC<CriteriaPreviewModalProps> = ({
  categories = [],
  criteria = [],
  onClose
}) => {
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [previewMode, setPreviewMode] = useState<'evaluator' | 'evaluatee' | 'admin'>('evaluator');

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getCriteriaForCategory = (categoryId: number) => {
    return criteria.filter(c => c.categoryId === categoryId && c.isActive);
  };

  const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);
  const totalCriteria = criteria.filter(c => c.isActive).length;

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting criteria preview...');
  };

  const handlePrint = () => {
    window.print();
  };

  const previewModes = [
    { id: 'evaluator' as const, label: 'Evaluator View', description: 'How evaluators will see the criteria' },
    { id: 'evaluatee' as const, label: 'Employee View', description: 'How employees will see their evaluation criteria' },
    { id: 'admin' as const, label: 'Admin View', description: 'Complete administrative view with all details' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Eye className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Criteria Preview
              </h2>
              <p className="text-sm text-gray-500">
                Preview how your criteria will appear in evaluations
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex items-center space-x-2"
            >
              <Print className="w-4 h-4" />
              <span>Print</span>
            </Button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-80 border-r bg-gray-50 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Preview Mode Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Preview Mode
                </h3>
                <div className="space-y-2">
                  {previewModes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setPreviewMode(mode.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        previewMode === mode.id
                          ? 'bg-blue-100 border-blue-300 text-blue-900'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      } border`}
                    >
                      <div className="font-medium">{mode.label}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {mode.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary Stats */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">
                  Summary
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Categories</span>
                    <Badge variant="outline">{categories.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Criteria</span>
                    <Badge variant="outline">{totalCriteria}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Weight</span>
                    <Badge
                      variant={totalWeight === 100 ? 'success' : 'warning'}
                    >
                      {totalWeight.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Category Navigation */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Categories
                </h3>
                <div className="space-y-1">
                  {categories.map((category) => {
                    const categoryCriteria = getCriteriaForCategory(category.id);
                    return (
                      <button
                        key={category.id}
                        onClick={() => toggleCategory(category.id)}
                        className="w-full text-left p-2 rounded hover:bg-white transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {expandedCategories.has(category.id) ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="text-sm font-medium text-gray-700">
                              {category.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Badge variant="outline" size="sm">
                              {categoryCriteria.length}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {category.weight.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Preview Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Performance Evaluation Criteria
                  </h1>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {previewModes.find(m => m.id === previewMode)?.label}
                    </span>
                  </div>
                </div>
                
                {previewMode === 'evaluatee' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-1">
                      About Your Evaluation
                    </h3>
                    <p className="text-sm text-blue-700">
                      Your performance will be evaluated across {categories.length} key areas. 
                      Each area has specific criteria with different weights contributing to your overall score.
                    </p>
                  </div>
                )}

                {previewMode === 'evaluator' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-medium text-green-900 mb-1">
                      Evaluation Guidelines
                    </h3>
                    <p className="text-sm text-green-700">
                      Use these criteria to evaluate performance fairly and consistently. 
                      Pay attention to the weight of each category when scoring.
                    </p>
                  </div>
                )}
              </div>

              {/* Categories and Criteria */}
              <div className="space-y-6">
                {categories.map((category) => {
                  const categoryCriteria = getCriteriaForCategory(category.id);
                  const isExpanded = expandedCategories.has(category.id);
                  
                  return (
                    <Card key={category.id} className="overflow-hidden">
                      <div className="p-6">
                        {/* Category Header */}
                        <div 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => toggleCategory(category.id)}
                        >
                          <div className="flex items-center space-x-3">
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {category.name}
                              </h3>
                              {category.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {category.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">
                              {categoryCriteria.length} criteria
                            </Badge>
                            <Badge 
                              variant={category.weight > 30 ? 'warning' : 'success'}
                              className="font-medium"
                            >
                              {category.weight.toFixed(1)}% weight
                            </Badge>
                          </div>
                        </div>

                        {/* Category Criteria */}
                        {isExpanded && categoryCriteria.length > 0 && (
                          <div className="mt-6 space-y-4">
                            {categoryCriteria.map((criterion, index) => (
                              <div 
                                key={criterion.id} 
                                className="border-l-4 border-blue-200 pl-4 py-3"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 mb-2">
                                      {index + 1}. {criterion.name}
                                    </h4>
                                    {criterion.baseDescription && (
                                      <p className="text-sm text-gray-600 mb-3">
                                        {criterion.baseDescription}
                                      </p>
                                    )}

                                    {/* Role Descriptions */}
                                    {previewMode === 'admin' && criterion.roleDescriptions.length > 0 && (
                                      <div className="mt-3">
                                        <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                          Role-Specific Descriptions
                                        </h5>
                                        <div className="space-y-2">
                                          {criterion.roleDescriptions.map((roleDesc) => (
                                            <div key={roleDesc.id} className="bg-gray-50 rounded p-3">
                                              <div className="flex items-center space-x-2 mb-1">
                                                <Users className="w-3 h-3 text-gray-400" />
                                                <span className="text-xs font-medium text-gray-700">
                                                  {roleDesc.roleName}
                                                </span>
                                                <Badge
                                                  variant={roleDesc.isActive ? 'success' : 'secondary'}
                                                  size="sm"
                                                >
                                                  {roleDesc.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                              </div>
                                              <p className="text-xs text-gray-600">
                                                {roleDesc.description}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Score Range Indicator */}
                                    {previewMode === 'evaluator' && (
                                      <div className="mt-3 p-3 bg-gray-50 rounded">
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-gray-500">Score Range:</span>
                                          <div className="flex space-x-4">
                                            <span>1 (Poor)</span>
                                            <span>2 (Below Expectations)</span>
                                            <span>3 (Meets Expectations)</span>
                                            <span>4 (Exceeds Expectations)</span>
                                            <span>5 (Outstanding)</span>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Empty State */}
                        {isExpanded && categoryCriteria.length === 0 && (
                          <div className="mt-6 text-center py-8">
                            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">
                              No active criteria in this category
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Empty State */}
              {categories.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Criteria to Preview
                  </h3>
                  <p className="text-gray-500">
                    Create categories and criteria to see how they will appear in evaluations.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

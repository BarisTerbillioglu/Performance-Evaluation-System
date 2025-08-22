import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/form/Input';
import { Badge } from '@/components/ui/feedback/Badge';
import { Alert } from '@/components/ui/feedback/Alert';
import { useCriteriaCategories } from '@/hooks/useCriteriaCategories';
import { CriteriaCategoryDto } from '@/types';

interface CategoryFormModalProps {
  category?: CriteriaCategoryDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  category,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    weight: 0,
    isActive: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    createCategory, 
    updateCategory, 
    categories, 
    weightValidation 
  } = useCriteriaCategories();

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        weight: category.weight,
        isActive: category.isActive
      });
    }
  }, [category]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Category name must be less than 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (formData.weight < 0.01) {
      newErrors.weight = 'Weight must be at least 0.01%';
    } else if (formData.weight > 100) {
      newErrors.weight = 'Weight cannot exceed 100%';
    }

    // Check if total weight would exceed 100%
    const otherCategoriesWeight = categories
      .filter(cat => cat.id !== category?.id)
      .reduce((sum, cat) => sum + cat.weight, 0);
    
    const totalWeight = otherCategoriesWeight + formData.weight;
    if (totalWeight > 100) {
      newErrors.weight = `Total weight would be ${totalWeight.toFixed(1)}%. Maximum allowed is 100%.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (category) {
        await updateCategory(category.id, formData);
      } else {
        await createCategory(formData);
      }
      onSuccess();
    } catch (error) {
      setErrors({ 
        submit: error instanceof Error ? error.message : 'An error occurred' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const currentTotalWeight = categories
    .filter(cat => cat.id !== category?.id)
    .reduce((sum, cat) => sum + cat.weight, 0);
  
  const projectedTotalWeight = currentTotalWeight + formData.weight;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {category ? 'Edit Category' : 'Create Category'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Alert */}
          {errors.submit && (
            <Alert
              type="error"
              title="Error"
              message={errors.submit}
            />
          )}

          {/* Weight Warning */}
          {projectedTotalWeight > 100 && (
            <Alert
              type="warning"
              title="Weight Validation"
              message={`Total weight would be ${projectedTotalWeight.toFixed(1)}%. This exceeds the maximum of 100%.`}
            />
          )}

          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter category name"
              error={errors.name}
              maxLength={100}
            />
            <div className="mt-1 text-xs text-gray-500">
              {formData.name.length}/100 characters
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter category description (optional)"
              rows={3}
              maxLength={500}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <div className="mt-1 text-xs text-gray-500">
              {formData.description.length}/500 characters
            </div>
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight (%) *
            </label>
            <div className="space-y-2">
              <Input
                type="number"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                placeholder="Enter weight percentage"
                min="0.01"
                max="100"
                step="0.01"
                error={errors.weight}
              />
              
              {/* Weight Summary */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Other categories:</span>
                  <span className="font-medium">{currentTotalWeight.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">This category:</span>
                  <span className="font-medium">{formData.weight.toFixed(1)}%</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-sm font-medium">
                  <span>Total:</span>
                  <div className="flex items-center space-x-2">
                    <span className={
                      projectedTotalWeight === 100 
                        ? 'text-green-600' 
                        : projectedTotalWeight > 100 
                        ? 'text-red-600' 
                        : 'text-yellow-600'
                    }>
                      {projectedTotalWeight.toFixed(1)}%
                    </span>
                    <Badge
                      variant={
                        projectedTotalWeight === 100 
                          ? 'success' 
                          : projectedTotalWeight > 100 
                          ? 'error' 
                          : 'warning'
                      }
                      size="sm"
                    >
                      {projectedTotalWeight === 100 
                        ? 'Perfect' 
                        : projectedTotalWeight > 100 
                        ? 'Over' 
                        : 'Under'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
            <p className="mt-1 text-xs text-gray-500">
              Inactive categories will not be used in new evaluations
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || Object.keys(errors).length > 0}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Category'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

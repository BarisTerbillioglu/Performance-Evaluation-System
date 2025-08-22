import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/form/Input';
import { Badge } from '@/components/ui/feedback/Badge';
import { Alert } from '@/components/ui/feedback/Alert';
import { RoleDescriptionEditor } from './RoleDescriptionEditor';
import { useCriteria } from '@/hooks/useCriteria';
import { useRoles } from '@/hooks/useRoles';
import { CriteriaDto, CriteriaCategoryDto, RoleDto } from '@/types';

interface CriteriaFormModalProps {
  criteria?: CriteriaDto | null;
  categories?: CriteriaCategoryDto[];
  onClose: () => void;
  onSuccess: () => void;
}

export const CriteriaFormModal: React.FC<CriteriaFormModalProps> = ({
  criteria,
  categories = [],
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    baseDescription: '',
    categoryId: 0,
    isActive: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRoleEditor, setShowRoleEditor] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null);

  const { 
    createCriteria, 
    updateCriteria,
    addRoleDescription,
    updateRoleDescription,
    deleteRoleDescription
  } = useCriteria();

  const { roles } = useRoles();

  useEffect(() => {
    if (criteria) {
      setFormData({
        name: criteria.name,
        baseDescription: criteria.baseDescription || '',
        categoryId: criteria.categoryId,
        isActive: criteria.isActive
      });
    } else if (categories.length > 0) {
      setFormData(prev => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [criteria, categories]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Criteria name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Criteria name must be less than 100 characters';
    }

    if (formData.baseDescription && formData.baseDescription.length > 500) {
      newErrors.baseDescription = 'Description must be less than 500 characters';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (criteria) {
        await updateCriteria(criteria.id, {
          name: formData.name,
          baseDescription: formData.baseDescription,
          isActive: formData.isActive
        });
      } else {
        await createCriteria({
          categoryId: formData.categoryId,
          name: formData.name,
          baseDescription: formData.baseDescription
        });
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

  const handleRoleDescriptionSave = async (roleData: {
    roleId: number;
    description: string;
    example?: string;
  }) => {
    if (!criteria) return;

    try {
      const existingRole = criteria.roleDescriptions.find(rd => rd.roleId === roleData.roleId);
      
      if (existingRole) {
        await updateRoleDescription(criteria.id, roleData.roleId, {
          description: roleData.description
        });
      } else {
        await addRoleDescription(criteria.id, {
          roleId: roleData.roleId,
          description: roleData.description
        });
      }
      
      setShowRoleEditor(false);
      setSelectedRole(null);
      // Refresh data will be handled by parent component
    } catch (error) {
      console.error('Error saving role description:', error);
    }
  };

  const handleRoleDescriptionDelete = async (roleId: number) => {
    if (!criteria) return;

    try {
      await deleteRoleDescription(criteria.id, roleId);
      // Refresh data will be handled by parent component
    } catch (error) {
      console.error('Error deleting role description:', error);
    }
  };

  const selectedCategory = categories.find(cat => cat.id === formData.categoryId);
  const availableRoles = roles?.filter(role => 
    !criteria?.roleDescriptions.some(rd => rd.roleId === role.id)
  ) || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {criteria ? 'Edit Criteria' : 'Create Criteria'}
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

          {/* Criteria Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Criteria Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter criteria name"
              error={errors.name}
              maxLength={100}
            />
            <div className="mt-1 text-xs text-gray-500">
              {formData.name.length}/100 characters
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => handleInputChange('categoryId', parseInt(e.target.value))}
              disabled={!!criteria} // Can't change category for existing criteria
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.categoryId ? 'border-red-300' : 'border-gray-300'
              } ${criteria ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.weight.toFixed(1)}%)
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
            )}
            {selectedCategory && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{selectedCategory.name}</Badge>
                  <span className="text-sm text-gray-600">
                    Weight: {selectedCategory.weight.toFixed(1)}%
                  </span>
                </div>
                {selectedCategory.description && (
                  <p className="mt-1 text-sm text-gray-600">
                    {selectedCategory.description}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Base Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Description
            </label>
            <textarea
              value={formData.baseDescription}
              onChange={(e) => handleInputChange('baseDescription', e.target.value)}
              placeholder="Enter general description for this criteria (optional)"
              rows={3}
              maxLength={500}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.baseDescription ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.baseDescription && (
              <p className="mt-1 text-sm text-red-600">{errors.baseDescription}</p>
            )}
            <div className="mt-1 text-xs text-gray-500">
              {formData.baseDescription.length}/500 characters
            </div>
          </div>

          {/* Role-Specific Descriptions */}
          {criteria && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Role-Specific Descriptions
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRoleEditor(true)}
                  disabled={availableRoles.length === 0}
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Role Description</span>
                </Button>
              </div>

              {criteria.roleDescriptions.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Users className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 mb-3">
                    No role-specific descriptions yet
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRoleEditor(true)}
                    disabled={availableRoles.length === 0}
                  >
                    Add First Description
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {criteria.roleDescriptions.map((roleDesc) => {
                    const role = roles?.find(r => r.id === roleDesc.roleId);
                    return (
                      <div key={roleDesc.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {role?.name || `Role ${roleDesc.roleId}`}
                            </Badge>
                            <Badge
                              variant={roleDesc.isActive ? 'success' : 'secondary'}
                              size="sm"
                            >
                              {roleDesc.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedRole(role || null);
                                setShowRoleEditor(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRoleDescriptionDelete(roleDesc.roleId)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          {roleDesc.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {availableRoles.length === 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  All available roles have descriptions. Create new roles to add more descriptions.
                </p>
              )}
            </div>
          )}

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
              Inactive criteria will not be used in new evaluations
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
              <span>{isSubmitting ? 'Saving...' : 'Save Criteria'}</span>
            </Button>
          </div>
        </form>

        {/* Role Description Editor Modal */}
        {showRoleEditor && (
          <RoleDescriptionEditor
            criteria={criteria}
            selectedRole={selectedRole}
            availableRoles={availableRoles}
            onSave={handleRoleDescriptionSave}
            onClose={() => {
              setShowRoleEditor(false);
              setSelectedRole(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

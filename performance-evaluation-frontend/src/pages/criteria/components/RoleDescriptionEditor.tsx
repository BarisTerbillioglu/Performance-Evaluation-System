import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Users } from 'lucide-react';
import { Button } from '@/components/ui/button/Button';
import { Badge } from '@/components/ui/feedback/Badge';
import { Alert } from '@/components/ui/feedback/Alert';
import { CriteriaDto, RoleDto } from '@/types';

interface RoleDescriptionEditorProps {
  criteria?: CriteriaDto | null;
  selectedRole?: RoleDto | null;
  availableRoles: RoleDto[];
  onSave: (data: { roleId: number; description: string; example?: string }) => void;
  onClose: () => void;
}

export const RoleDescriptionEditor: React.FC<RoleDescriptionEditorProps> = ({
  criteria,
  selectedRole,
  availableRoles,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState({
    roleId: 0,
    description: '',
    example: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedRole) {
      // Editing existing role description
      const existingDesc = criteria?.roleDescriptions.find(rd => rd.roleId === selectedRole.id);
      setFormData({
        roleId: selectedRole.id,
        description: existingDesc?.description || '',
        example: '' // Backend doesn't seem to have example field in the current DTO
      });
    } else if (availableRoles.length > 0) {
      // Creating new role description
      setFormData({
        roleId: availableRoles[0].id,
        description: '',
        example: ''
      });
    }
  }, [selectedRole, availableRoles, criteria]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.roleId) {
      newErrors.roleId = 'Please select a role';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (formData.example && formData.example.length > 500) {
      newErrors.example = 'Example must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        roleId: formData.roleId,
        description: formData.description,
        example: formData.example || undefined
      });
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

  const selectedRoleObj = selectedRole || availableRoles.find(r => r.id === formData.roleId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedRole ? 'Edit Role Description' : 'Add Role Description'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
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

          {/* Criteria Context */}
          {criteria && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                {criteria.name}
              </h4>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" size="sm">
                  {criteria.categoryName}
                </Badge>
                <span className="text-xs text-gray-500">
                  {criteria.categoryWeight.toFixed(1)}%
                </span>
              </div>
              {criteria.baseDescription && (
                <p className="text-sm text-gray-600">
                  {criteria.baseDescription}
                </p>
              )}
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role *
            </label>
            <select
              value={formData.roleId}
              onChange={(e) => handleInputChange('roleId', parseInt(e.target.value))}
              disabled={!!selectedRole}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.roleId ? 'border-red-300' : 'border-gray-300'
              } ${selectedRole ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">Select a role</option>
              {selectedRole ? (
                <option value={selectedRole.id}>
                  {selectedRole.name}
                </option>
              ) : (
                availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))
              )}
            </select>
            {errors.roleId && (
              <p className="mt-1 text-sm text-red-600">{errors.roleId}</p>
            )}
            
            {/* Selected Role Info */}
            {selectedRoleObj && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    {selectedRoleObj.name}
                  </span>
                  <Badge
                    variant={selectedRoleObj.isActive ? 'success' : 'secondary'}
                    size="sm"
                  >
                    {selectedRoleObj.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {selectedRoleObj.description && (
                  <p className="text-sm text-blue-700">
                    {selectedRoleObj.description}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Role-Specific Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role-Specific Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe how this criteria applies specifically to this role..."
              rows={4}
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
            <p className="mt-1 text-xs text-gray-500">
              Be specific about how this role should be evaluated on this criteria. 
              Consider the role's responsibilities and expected outcomes.
            </p>
          </div>

          {/* Example (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Example or Guidelines (Optional)
            </label>
            <textarea
              value={formData.example}
              onChange={(e) => handleInputChange('example', e.target.value)}
              placeholder="Provide specific examples or additional guidelines for evaluators..."
              rows={3}
              maxLength={500}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.example ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.example && (
              <p className="mt-1 text-sm text-red-600">{errors.example}</p>
            )}
            <div className="mt-1 text-xs text-gray-500">
              {formData.example.length}/500 characters
            </div>
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
              disabled={isSubmitting || Object.keys(errors).some(key => key !== 'submit' && errors[key])}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>
                {isSubmitting 
                  ? 'Saving...' 
                  : selectedRole 
                  ? 'Update Description' 
                  : 'Add Description'
                }
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

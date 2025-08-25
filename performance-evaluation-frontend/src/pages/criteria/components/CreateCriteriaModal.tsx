import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Users, 
  FileText, 
  Settings, 
  Eye,
  EyeOff,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/ui/form/Input';
import { TextArea } from '@/components/ui/form/TextArea';
import { Badge } from '@/components/ui/feedback/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/design-system/Card';
import { Alert } from '@/components/ui/feedback/Alert';
import { 
  CriteriaDto, 
  CriteriaCategoryDto,
  CreateCriteriaRequest,
  UpdateCriteriaRequest,
  AddRoleDescriptionRequest
} from '@/types';

interface CreateCriteriaModalProps {
  criteria?: CriteriaDto | null;
  categories?: CriteriaCategoryDto[];
  onClose: () => void;
  onSuccess: () => void;
}

interface RoleDescription {
  roleId: number;
  roleName: string;
  description: string;
  isActive: boolean;
}

export const CreateCriteriaModal: React.FC<CreateCriteriaModalProps> = ({
  criteria,
  categories = [],
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    categoryId: 0,
    baseDescription: '',
    isActive: true,
    displayOrder: 1,
    importanceWeight: 1,
    minScore: 1,
    maxScore: 5,
    requireCommentThreshold: 2
  });

  const [roleDescriptions, setRoleDescriptions] = useState<RoleDescription[]>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'roles' | 'advanced' | 'preview'>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Mock roles - replace with actual roles from API
  const availableRoles = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Manager' },
    { id: 3, name: 'Evaluator' },
    { id: 4, name: 'Employee' }
  ];

  useEffect(() => {
    if (criteria) {
      // Editing existing criteria
      setFormData({
        name: criteria.name,
        categoryId: criteria.categoryId,
        baseDescription: criteria.baseDescription || '',
        isActive: criteria.isActive,
        displayOrder: 1,
        importanceWeight: 1,
        minScore: 1,
        maxScore: 5,
        requireCommentThreshold: 2
      });

      // Load existing role descriptions
      const existingRoles = availableRoles.map(role => {
        const existingDesc = criteria.roleDescriptions.find(rd => rd.roleId === role.id);
        return {
          roleId: role.id,
          roleName: role.name,
          description: existingDesc?.description || '',
          isActive: existingDesc?.isActive ?? true
        };
      });
      setRoleDescriptions(existingRoles);
    } else {
      // Creating new criteria
      setFormData({
        name: '',
        categoryId: categories[0]?.id || 0,
        baseDescription: '',
        isActive: true,
        displayOrder: 1,
        importanceWeight: 1,
        minScore: 1,
        maxScore: 5,
        requireCommentThreshold: 2
      });

      // Initialize empty role descriptions
      const emptyRoles = availableRoles.map(role => ({
        roleId: role.id,
        roleName: role.name,
        description: '',
        isActive: true
      }));
      setRoleDescriptions(emptyRoles);
    }
  }, [criteria, categories]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Criteria name is required';
    }

    if (formData.categoryId === 0) {
      newErrors.categoryId = 'Category is required';
    }

    if (!formData.baseDescription.trim()) {
      newErrors.baseDescription = 'Base description is required';
    }

    if (formData.minScore >= formData.maxScore) {
      newErrors.scoreRange = 'Minimum score must be less than maximum score';
    }

    if (formData.requireCommentThreshold < formData.minScore || formData.requireCommentThreshold > formData.maxScore) {
      newErrors.commentThreshold = 'Comment threshold must be within score range';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // TODO: Implement API call to create/update criteria
      // const request: CreateCriteriaRequest | UpdateCriteriaRequest = {
      //   ...formData,
      //   roleDescriptions: roleDescriptions.filter(rd => rd.description.trim())
      // };

      // if (criteria) {
      //   await criteriaService.updateCriteria(criteria.id, request);
      // } else {
      //   await criteriaService.createCriteria(request);
      // }

      onSuccess();
    } catch (error) {
      console.error('Error saving criteria:', error);
      setErrors({ submit: 'Failed to save criteria. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleDescriptionChange = (roleId: number, field: keyof RoleDescription, value: any) => {
    setRoleDescriptions(prev => 
      prev.map(role => 
        role.roleId === roleId 
          ? { ...role, [field]: value }
          : role
      )
    );
  };

  const getRoleCoverageStatus = () => {
    const completedRoles = roleDescriptions.filter(rd => rd.description.trim()).length;
    const totalRoles = roleDescriptions.length;
    const percentage = (completedRoles / totalRoles) * 100;

    if (percentage === 100) return { status: 'complete', color: 'success', icon: CheckCircle };
    if (percentage >= 75) return { status: 'mostly-complete', color: 'warning', icon: AlertTriangle };
    return { status: 'incomplete', color: 'error', icon: XCircle };
  };

  const tabs = [
    { id: 'basic' as const, label: 'Basic Info', icon: FileText },
    { id: 'roles' as const, label: 'Role Descriptions', icon: Users, badge: roleDescriptions.filter(rd => rd.description.trim()).length },
    { id: 'advanced' as const, label: 'Advanced Settings', icon: Settings },
    { id: 'preview' as const, label: 'Preview', icon: Eye }
  ];

  const coverageStatus = getRoleCoverageStatus();
  const CoverageIcon = coverageStatus.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {criteria ? 'Edit Criteria' : 'Create New Criteria'}
              </h2>
              <p className="text-sm text-gray-500">
                {criteria ? 'Update criteria information and role descriptions' : 'Define new evaluation criteria with role-specific descriptions'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <Badge variant="outline" size="sm">
                    {tab.badge}
                  </Badge>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Criteria Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter criteria name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: parseInt(e.target.value) }))}
                    className={`w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 ${
                      errors.categoryId ? 'border-red-500' : ''
                    }`}
                  >
                    <option value={0}>Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.weight.toFixed(1)}%)
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="text-sm text-red-600 mt-1">{errors.categoryId}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Description *
                </label>
                <TextArea
                  value={formData.baseDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, baseDescription: e.target.value }))}
                  placeholder="Enter the base description for this criteria"
                  rows={4}
                  className={errors.baseDescription ? 'border-red-500' : ''}
                />
                {errors.baseDescription && (
                  <p className="text-sm text-red-600 mt-1">{errors.baseDescription}</p>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>
            </div>
          )}

          {/* Role Descriptions Tab */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Role-Specific Descriptions</h3>
                <div className="flex items-center space-x-2">
                  <CoverageIcon className={`w-5 h-5 text-${coverageStatus.color}-500`} />
                  <Badge variant={coverageStatus.color as any} size="sm">
                    {roleDescriptions.filter(rd => rd.description.trim()).length}/{roleDescriptions.length} roles configured
                  </Badge>
                </div>
              </div>

              <div className="grid gap-6">
                {roleDescriptions.map((role) => (
                  <Card key={role.roleId} variant="outlined">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-base">{role.roleName}</span>
                        <div className="flex items-center space-x-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={role.isActive}
                              onChange={(e) => handleRoleDescriptionChange(role.roleId, 'isActive', e.target.checked)}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Active</span>
                          </label>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TextArea
                        value={role.description}
                        onChange={(e) => handleRoleDescriptionChange(role.roleId, 'description', e.target.value)}
                        placeholder={`Enter specific description for ${role.roleName} role...`}
                        rows={3}
                        className={role.description.trim() ? 'border-green-500' : ''}
                      />
                      {role.description.trim() && (
                        <div className="flex items-center space-x-1 mt-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Description configured</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Alert
                type="info"
                title="Role Descriptions"
                message="Each role can have a specific description that will be shown to users with that role during evaluations. This helps provide context-appropriate guidance."
              />
            </div>
          )}

          {/* Advanced Settings Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <Input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 1 }))}
                    min="1"
                    placeholder="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Order within category</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Importance Weight
                  </label>
                  <Input
                    type="number"
                    value={formData.importanceWeight}
                    onChange={(e) => setFormData(prev => ({ ...prev, importanceWeight: parseFloat(e.target.value) || 1 }))}
                    min="0.1"
                    max="10"
                    step="0.1"
                    placeholder="1.0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Relative importance within category</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Score
                  </label>
                  <Input
                    type="number"
                    value={formData.minScore}
                    onChange={(e) => setFormData(prev => ({ ...prev, minScore: parseInt(e.target.value) || 1 }))}
                    min="1"
                    max="10"
                    className={errors.scoreRange ? 'border-red-500' : ''}
                  />
                  {errors.scoreRange && (
                    <p className="text-sm text-red-600 mt-1">{errors.scoreRange}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Score
                  </label>
                  <Input
                    type="number"
                    value={formData.maxScore}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxScore: parseInt(e.target.value) || 5 }))}
                    min="1"
                    max="10"
                    className={errors.scoreRange ? 'border-red-500' : ''}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment Threshold
                  </label>
                  <Input
                    type="number"
                    value={formData.requireCommentThreshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, requireCommentThreshold: parseInt(e.target.value) || 2 }))}
                    min={formData.minScore}
                    max={formData.maxScore}
                    className={errors.commentThreshold ? 'border-red-500' : ''}
                  />
                  <p className="text-xs text-gray-500 mt-1">Require comment for scores ≤ this value</p>
                  {errors.commentThreshold && (
                    <p className="text-sm text-red-600 mt-1">{errors.commentThreshold}</p>
                  )}
                </div>
              </div>

              <Alert
                type="warning"
                title="Advanced Settings"
                message="These settings affect how the criteria behaves during evaluations. Changes may impact existing evaluation forms."
              />
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Criteria Preview</h3>
              
              <Card variant="outlined">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{formData.name || 'Criteria Name'}</h4>
                      <p className="text-sm text-gray-500">
                        Category: {categories.find(c => c.id === formData.categoryId)?.name || 'Not selected'}
                      </p>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Base Description</h5>
                      <p className="text-sm text-gray-600">
                        {formData.baseDescription || 'No description provided'}
                      </p>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Role Descriptions</h5>
                      <div className="space-y-2">
                        {roleDescriptions.map((role) => (
                          <div key={role.roleId} className="border-l-4 border-gray-200 pl-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">{role.roleName}</span>
                              <Badge variant={role.isActive ? 'success' : 'secondary'} size="sm">
                                {role.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {role.description || 'No description provided'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Score Range:</span>
                        <span className="text-sm text-gray-600 ml-2">
                          {formData.minScore} - {formData.maxScore}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Status:</span>
                        <Badge variant={formData.isActive ? 'success' : 'secondary'} size="sm" className="ml-2">
                          {formData.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Error Display */}
          {errors.submit && (
            <Alert
              type="error"
              title="Error"
              message={errors.submit}
            />
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center space-x-2">
              <CoverageIcon className={`w-5 h-5 text-${coverageStatus.color}-500`} />
              <span className="text-sm text-gray-600">
                {roleDescriptions.filter(rd => rd.description.trim()).length}/{roleDescriptions.length} roles configured
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                leftIcon={<Save className="w-4 h-4" />}
              >
                {isSubmitting ? 'Saving...' : (criteria ? 'Update Criteria' : 'Create Criteria')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

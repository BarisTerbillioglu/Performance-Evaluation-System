import React, { useState, useEffect } from 'react';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from '@hello-pangea/dnd';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  GripVertical, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  PieChart,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Save,
  RefreshCw,
  Calculator,
  Eye
} from 'lucide-react';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/ui/feedback/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/design-system/Card';
import { LoadingSpinner } from '@/components/ui/feedback/LoadingSpinner';
import { Input } from '@/components/ui/form/Input';
import { Alert } from '@/components/ui/feedback/Alert';
import { 
  CriteriaCategoryDto, 
  WeightValidationDto 
} from '@/types';

interface CategoryWeightManagementProps {
  categories?: CriteriaCategoryDto[];
  loading: boolean;
  error: string | null;
  weightValidation?: WeightValidationDto | null;
  onEdit: (category: CriteriaCategoryDto) => void;
  onWeightValidation: () => void;
}

export const CategoryWeightManagement: React.FC<CategoryWeightManagementProps> = ({
  categories = [],
  loading,
  error,
  weightValidation,
  onEdit,
  onWeightValidation
}) => {
  const [draggedCategories, setDraggedCategories] = useState(categories);
  const [editingWeights, setEditingWeights] = useState<{[key: number]: number}>({});
  const [isEditing, setIsEditing] = useState(false);
  const [showWeightChart, setShowWeightChart] = useState(false);

  useEffect(() => {
    setDraggedCategories(categories);
  }, [categories]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(draggedCategories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setDraggedCategories(items);
    // TODO: Implement API call to save new order
  };

  const handleWeightChange = (categoryId: number, newWeight: number) => {
    setEditingWeights(prev => ({
      ...prev,
      [categoryId]: Math.max(0, Math.min(100, newWeight))
    }));
  };

  const getWeightStatusIcon = (weight: number) => {
    if (weight < 1) return <XCircle className="w-4 h-4 text-red-500" />;
    if (weight > 50) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getWeightStatusColor = (weight: number) => {
    if (weight < 1) return 'bg-red-50 text-red-700 border-red-200';
    if (weight > 50) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-green-50 text-green-700 border-green-200';
  };

  const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);
  const totalEditingWeight = categories.reduce((sum, cat) => {
    const editingWeight = editingWeights[cat.id];
    return sum + (editingWeight !== undefined ? editingWeight : cat.weight);
  }, 0);

  const weightDifference = totalEditingWeight - 100;
  const isValidTotal = Math.abs(totalEditingWeight - 100) < 0.01;

  const handleSaveWeights = () => {
    // TODO: Implement API call to save weight changes
    setIsEditing(false);
    setEditingWeights({});
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditingWeights({});
  };

  const handleAutoRebalance = () => {
    const activeCategories = categories.filter(cat => cat.isActive);
    const equalWeight = Math.round((100 / activeCategories.length) * 100) / 100;
    
    const newWeights: {[key: number]: number} = {};
    activeCategories.forEach((cat, index) => {
      // Give the last category the remainder to ensure total = 100%
      if (index === activeCategories.length - 1) {
        const usedWeight = activeCategories.slice(0, -1).reduce((sum, c) => sum + equalWeight, 0);
        newWeights[cat.id] = Math.round((100 - usedWeight) * 100) / 100;
      } else {
        newWeights[cat.id] = equalWeight;
      }
    });
    
    setEditingWeights(newWeights);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        title="Error Loading Categories"
        message={error}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Weight Summary and Controls */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Target className="w-5 h-5 text-primary-600" />
              <span>Weight Distribution</span>
              <Badge
                variant={isValidTotal ? 'success' : 'error'}
                size="sm"
              >
                {isValidTotal ? 'Valid' : 'Invalid'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWeightChart(!showWeightChart)}
                leftIcon={<PieChart className="w-4 h-4" />}
              >
                {showWeightChart ? 'Hide Chart' : 'Show Chart'}
              </Button>
              {!isEditing ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  leftIcon={<Edit2 className="w-4 h-4" />}
                >
                  Edit Weights
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAutoRebalance}
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                  >
                    Auto Rebalance
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCancelEditing}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveWeights}
                    disabled={!isValidTotal}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Save
                  </Button>
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {isEditing ? totalEditingWeight.toFixed(1) : totalWeight.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Total Weight</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${
                isValidTotal ? 'text-green-600' : 'text-red-600'
              }`}>
                {isValidTotal ? '100.0' : totalEditingWeight.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Target</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${
                Math.abs(weightDifference) < 0.01 
                  ? 'text-green-600' 
                  : weightDifference > 0 
                  ? 'text-red-600' 
                  : 'text-yellow-600'
              }`}>
                {weightDifference > 0 ? '+' : ''}{weightDifference.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Difference</div>
            </div>
          </div>

          {!isValidTotal && isEditing && (
            <Alert
              type="warning"
              title="Weight Validation Required"
              message={`Total weight must equal 100%. Current total: ${totalEditingWeight.toFixed(1)}%`}
              action={{
                label: "Auto Rebalance",
                onClick: handleAutoRebalance
              }}
            />
          )}

          {/* Weight Distribution Chart (Simple Visual) */}
          {showWeightChart && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Weight Distribution</h4>
              <div className="flex h-8 bg-gray-200 rounded-full overflow-hidden">
                {categories.map((category, index) => {
                  const weight = editingWeights[category.id] !== undefined 
                    ? editingWeights[category.id] 
                    : category.weight;
                  const width = (weight / 100) * 100;
                  
                  const colors = [
                    'bg-primary-500',
                    'bg-blue-500',
                    'bg-green-500',
                    'bg-yellow-500',
                    'bg-purple-500',
                    'bg-pink-500',
                    'bg-indigo-500',
                    'bg-red-500'
                  ];
                  
                  return (
                    <div
                      key={category.id}
                      className={`${colors[index % colors.length]} relative group cursor-pointer transition-all duration-200 hover:opacity-80`}
                      style={{ width: `${width}%` }}
                      title={`${category.name}: ${weight.toFixed(1)}%`}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-medium text-white bg-black bg-opacity-50 px-1 rounded">
                          {weight.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map((category, index) => {
                  const weight = editingWeights[category.id] !== undefined 
                    ? editingWeights[category.id] 
                    : category.weight;
                  const colors = [
                    'bg-primary-500',
                    'bg-blue-500',
                    'bg-green-500',
                    'bg-yellow-500',
                    'bg-purple-500',
                    'bg-pink-500',
                    'bg-indigo-500',
                    'bg-red-500'
                  ];
                  
                  return (
                    <div key={category.id} className="flex items-center space-x-1">
                      <div className={`w-3 h-3 rounded ${colors[index % colors.length]}`}></div>
                      <span className="text-xs text-gray-600">{category.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weight Validation Alert */}
      {weightValidation && !weightValidation.isValid && (
        <Alert
          type="warning"
          title="Weight Validation Issues"
          message={`Total weight is ${weightValidation.totalWeight}%. ${weightValidation.errors.join(', ')}`}
          action={{
            label: "Fix Weights",
            onClick: onWeightValidation
          }}
        />
      )}

      {/* Categories List with Drag & Drop */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="categories">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-3 ${
                snapshot.isDraggingOver ? 'bg-primary-50 rounded-lg p-2' : ''
              }`}
            >
              {draggedCategories.map((category, index) => {
                const currentWeight = editingWeights[category.id] !== undefined 
                  ? editingWeights[category.id] 
                  : category.weight;
                const hasChanged = editingWeights[category.id] !== undefined;
                
                return (
                  <Draggable
                    key={category.id}
                    draggableId={category.id.toString()}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        variant="elevated"
                        className={`transition-all duration-200 ${
                          snapshot.isDragging 
                            ? 'shadow-lg rotate-2 scale-105' 
                            : 'hover:shadow-md'
                        } ${
                          hasChanged ? 'ring-2 ring-primary-500 border-primary-300' : ''
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {/* Drag Handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
                              >
                                <GripVertical className="w-4 h-4 text-gray-400" />
                              </div>

                              {/* Category Info */}
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <h3 className="text-lg font-medium text-gray-900">
                                    {category.name}
                                  </h3>
                                  <div className="flex items-center space-x-2">
                                    {getWeightStatusIcon(currentWeight)}
                                    <span 
                                      className={`px-2 py-1 text-xs font-medium rounded border ${getWeightStatusColor(currentWeight)}`}
                                    >
                                      {currentWeight.toFixed(1)}%
                                    </span>
                                    {hasChanged && (
                                      <Badge variant="warning" size="sm">
                                        Modified
                                      </Badge>
                                    )}
                                  </div>
                                  <Badge
                                    variant={category.isActive ? 'success' : 'secondary'}
                                    size="sm"
                                  >
                                    {category.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>
                                {category.description && (
                                  <p className="mt-1 text-sm text-gray-600">
                                    {category.description}
                                  </p>
                                )}
                                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                  <span>Created: {new Date(category.createdDate).toLocaleDateString()}</span>
                                  {category.updatedDate && (
                                    <span>Updated: {new Date(category.updatedDate).toLocaleDateString()}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Weight Input and Actions */}
                            <div className="flex items-center space-x-3">
                              {isEditing && (
                                <div className="flex items-center space-x-2">
                                  <Input
                                    type="number"
                                    value={currentWeight}
                                    onChange={(e) => handleWeightChange(
                                      category.id, 
                                      parseFloat(e.target.value) || 0
                                    )}
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    className="w-20"
                                  />
                                  <span className="text-sm text-gray-500">%</span>
                                </div>
                              )}
                              
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onEdit(category)}
                                  leftIcon={<Edit2 className="w-3 h-3" />}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  leftIcon={<MoreHorizontal className="w-4 h-4" />}
                                >
                                  More
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
              
              {/* Empty State */}
              {categories.length === 0 && (
                <Card variant="elevated" className="p-8 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Plus className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        No Categories Yet
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Create your first criteria category to get started
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

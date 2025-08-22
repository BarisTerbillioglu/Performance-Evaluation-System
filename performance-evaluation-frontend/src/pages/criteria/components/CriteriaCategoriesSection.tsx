import React, { useState } from 'react';
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
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button/Button';
import { Badge } from '@/components/ui/feedback/Badge';
import { Card } from '@/components/ui/layout/Card';
import { LoadingSpinner } from '@/components/ui/feedback/LoadingSpinner';
import { 
  CriteriaCategoryDto, 
  WeightValidationDto 
} from '@/types';

interface CriteriaCategoriesSectionProps {
  categories?: CriteriaCategoryDto[];
  loading: boolean;
  error: string | null;
  onEdit: (category: CriteriaCategoryDto) => void;
  onAdd: () => void;
  onCategorySelect: (categoryId: number | null) => void;
  selectedCategory: number | null;
  weightValidation?: WeightValidationDto | null;
}

export const CriteriaCategoriesSection: React.FC<CriteriaCategoriesSectionProps> = ({
  categories = [],
  loading,
  error,
  onEdit,
  onAdd,
  onCategorySelect,
  selectedCategory,
  weightValidation
}) => {
  const [draggedCategories, setDraggedCategories] = useState(categories);

  React.useEffect(() => {
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

  const getWeightStatusIcon = (weight: number) => {
    if (weightValidation) {
      const categoryValidation = weightValidation.categories.find(
        c => c.currentWeight === weight
      );
      if (categoryValidation && categoryValidation.currentWeight !== categoryValidation.proposedWeight) {
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      }
    }
    
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <XCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button and Weight Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Criteria Categories
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Total Weight:</span>
            <Badge
              variant={totalWeight === 100 ? 'success' : totalWeight > 100 ? 'error' : 'warning'}
              className="font-medium"
            >
              {totalWeight.toFixed(1)}%
            </Badge>
          </div>
        </div>
        <Button onClick={onAdd} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </Button>
      </div>

      {/* Weight Validation Summary */}
      {weightValidation && !weightValidation.isValid && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Weight Validation Issues
              </h3>
              <div className="mt-1 text-sm text-yellow-700">
                <p>Total weight: {weightValidation.totalWeight}%</p>
                <ul className="mt-1 list-disc list-inside">
                  {weightValidation.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories List with Drag & Drop */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="categories">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-3 ${
                snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg p-2' : ''
              }`}
            >
              {draggedCategories.map((category, index) => (
                <Draggable
                  key={category.id}
                  draggableId={category.id.toString()}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`transition-all duration-200 ${
                        snapshot.isDragging 
                          ? 'shadow-lg rotate-2 scale-105' 
                          : 'hover:shadow-md'
                      } ${
                        selectedCategory === category.id
                          ? 'ring-2 ring-blue-500 border-blue-300'
                          : ''
                      }`}
                    >
                      <div className="p-4">
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
                                  {getWeightStatusIcon(category.weight)}
                                  <span 
                                    className={`px-2 py-1 text-xs font-medium rounded border ${getWeightStatusColor(category.weight)}`}
                                  >
                                    {category.weight.toFixed(1)}%
                                  </span>
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

                          {/* Actions */}
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onCategorySelect(
                                selectedCategory === category.id ? null : category.id
                              )}
                              className={
                                selectedCategory === category.id
                                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                                  : ''
                              }
                            >
                              {selectedCategory === category.id ? 'Deselect' : 'Select'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEdit(category)}
                              className="flex items-center space-x-1"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              
              {/* Empty State */}
              {categories.length === 0 && (
                <Card className="p-8 text-center">
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
                    <Button onClick={onAdd} className="mt-2">
                      Create Category
                    </Button>
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

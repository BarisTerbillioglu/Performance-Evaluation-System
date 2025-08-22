import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Calculator,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/form/Input';
import { Badge } from '@/components/ui/feedback/Badge';
import { Alert } from '@/components/ui/feedback/Alert';
import { Card } from '@/components/ui/layout/Card';
import { useCriteriaCategories } from '@/hooks/useCriteriaCategories';
import { CriteriaCategoryDto, WeightValidationDto, CategoryWeightDto } from '@/types';

interface WeightValidationModalProps {
  categories?: CriteriaCategoryDto[];
  weightValidation?: WeightValidationDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const WeightValidationModal: React.FC<WeightValidationModalProps> = ({
  categories = [],
  weightValidation,
  onClose,
  onSuccess
}) => {
  const [adjustedWeights, setAdjustedWeights] = useState<CategoryWeightDto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoRebalanceMode, setAutoRebalanceMode] = useState(false);

  const { rebalanceWeights, validateWeights } = useCriteriaCategories();

  useEffect(() => {
    // Initialize with current weights
    const weights: CategoryWeightDto[] = categories.map(category => ({
      categoryId: category.id,
      categoryName: category.name,
      currentWeight: category.weight,
      proposedWeight: category.weight
    }));
    setAdjustedWeights(weights);
  }, [categories]);

  const totalCurrentWeight = adjustedWeights.reduce((sum, w) => sum + w.currentWeight, 0);
  const totalProposedWeight = adjustedWeights.reduce((sum, w) => sum + w.proposedWeight, 0);
  const weightDifference = totalProposedWeight - 100;

  const handleWeightChange = (categoryId: number, newWeight: number) => {
    setAdjustedWeights(prev => 
      prev.map(weight => 
        weight.categoryId === categoryId 
          ? { ...weight, proposedWeight: Math.max(0, Math.min(100, newWeight)) }
          : weight
      )
    );
  };

  const handleAutoRebalance = () => {
    const activeWeights = adjustedWeights.filter(w => w.proposedWeight > 0);
    const totalActiveWeights = activeWeights.reduce((sum, w) => sum + w.proposedWeight, 0);
    
    if (totalActiveWeights === 0) return;

    const rebalanced = adjustedWeights.map(weight => {
      if (weight.proposedWeight === 0) return weight;
      
      const proportion = weight.proposedWeight / totalActiveWeights;
      return {
        ...weight,
        proposedWeight: Math.round((proportion * 100) * 100) / 100
      };
    });

    setAdjustedWeights(rebalanced);
  };

  const handleEqualDistribution = () => {
    const activeCategories = adjustedWeights.filter(w => w.proposedWeight > 0);
    const equalWeight = Math.round((100 / activeCategories.length) * 100) / 100;
    
    setAdjustedWeights(prev => 
      prev.map(weight => 
        weight.proposedWeight > 0 
          ? { ...weight, proposedWeight: equalWeight }
          : weight
      )
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await rebalanceWeights(adjustedWeights);
      onSuccess();
    } catch (error) {
      console.error('Error rebalancing weights:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWeights = () => {
    setAdjustedWeights(prev => 
      prev.map(weight => ({ ...weight, proposedWeight: weight.currentWeight }))
    );
  };

  const getWeightChangeIcon = (current: number, proposed: number) => {
    if (proposed > current) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (proposed < current) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getWeightStatus = (weight: number) => {
    if (weight < 1) return { color: 'text-red-600', bg: 'bg-red-50', label: 'Too Low' };
    if (weight > 50) return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'High' };
    return { color: 'text-green-600', bg: 'bg-green-50', label: 'Good' };
  };

  const isValidTotal = Math.abs(totalProposedWeight - 100) < 0.01;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Calculator className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Weight Validation & Rebalancing
              </h2>
              <p className="text-sm text-gray-500">
                Adjust category weights to ensure they total exactly 100%
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

        <div className="p-6 space-y-6">
          {/* Weight Summary */}
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {totalCurrentWeight.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Current Total</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  isValidTotal ? 'text-green-600' : 'text-red-600'
                }`}>
                  {totalProposedWeight.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Proposed Total</div>
              </div>
              <div className="text-center">
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

            {!isValidTotal && (
              <div className="mt-4 flex justify-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAutoRebalance}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Auto Rebalance</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEqualDistribution}
                  className="flex items-center space-x-2"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Equal Distribution</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetWeights}
                  className="flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Reset</span>
                </Button>
              </div>
            )}
          </Card>

          {/* Validation Errors */}
          {weightValidation && !weightValidation.isValid && (
            <Alert
              type="warning"
              title="Validation Issues"
              message={
                <ul className="list-disc list-inside space-y-1">
                  {weightValidation.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              }
            />
          )}

          {/* Weight Adjustment Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Category Weight Adjustments
            </h3>
            
            <div className="grid gap-4">
              {adjustedWeights.map((weight) => {
                const status = getWeightStatus(weight.proposedWeight);
                const hasChanged = Math.abs(weight.currentWeight - weight.proposedWeight) > 0.01;
                
                return (
                  <Card key={weight.categoryId} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">
                            {weight.categoryName}
                          </h4>
                          {hasChanged && getWeightChangeIcon(weight.currentWeight, weight.proposedWeight)}
                          <Badge
                            variant={status.color.includes('green') ? 'success' : status.color.includes('red') ? 'error' : 'warning'}
                            size="sm"
                          >
                            {status.label}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 items-center">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              Current Weight
                            </label>
                            <div className="text-sm font-medium text-gray-700">
                              {weight.currentWeight.toFixed(1)}%
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              New Weight
                            </label>
                            <Input
                              type="number"
                              value={weight.proposedWeight}
                              onChange={(e) => handleWeightChange(
                                weight.categoryId, 
                                parseFloat(e.target.value) || 0
                              )}
                              min="0"
                              max="100"
                              step="0.01"
                              className="w-20"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              Change
                            </label>
                            <div className={`text-sm font-medium ${
                              hasChanged 
                                ? weight.proposedWeight > weight.currentWeight 
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                                : 'text-gray-500'
                            }`}>
                              {hasChanged 
                                ? `${weight.proposedWeight > weight.currentWeight ? '+' : ''}${(weight.proposedWeight - weight.currentWeight).toFixed(1)}%`
                                : 'No change'
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2">
              {isValidTotal ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Weights are valid</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    Total must equal 100% (currently {totalProposedWeight.toFixed(1)}%)
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!isValidTotal || isSubmitting}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : 'Save Weights'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

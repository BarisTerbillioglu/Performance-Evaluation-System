import React, { useState } from 'react';
import { X, Settings, Users, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { BulkTeamOperationRequest } from '@/types';
import { teamService } from '@/services/teamService';
import { useUIStore } from '@/stores';
import { Button } from '@/components/ui/button/Button';
import { Select } from '@/components/ui/form/Select';
import { Input } from '@/components/ui/form/Input';
import { Card } from '@/components/ui/layout/Card';
import { Badge } from '@/components/ui/feedback/Badge';

interface BulkOperationsModalProps {
  selectedTeams: number[];
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkOperationsModal: React.FC<BulkOperationsModalProps> = ({
  selectedTeams,
  onClose,
  onSuccess,
}) => {
  const [operation, setOperation] = useState<string>('');
  const [evaluatorId, setEvaluatorId] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const { showNotification } = useUIStore();

  const operations = [
    { value: 'activate', label: 'Activate Teams', icon: CheckCircle, color: 'text-green-600' },
    { value: 'deactivate', label: 'Deactivate Teams', icon: XCircle, color: 'text-red-600' },
    { value: 'delete', label: 'Delete Teams', icon: Trash2, color: 'text-red-600' },
    { value: 'assignEvaluator', label: 'Assign Evaluator', icon: Users, color: 'text-blue-600' },
    { value: 'removeEvaluator', label: 'Remove Evaluator', icon: Users, color: 'text-orange-600' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!operation) {
      showNotification({
        type: 'warning',
        title: 'Warning',
        message: 'Please select an operation',
      });
      return;
    }

    if ((operation === 'assignEvaluator' || operation === 'removeEvaluator') && !evaluatorId) {
      showNotification({
        type: 'warning',
        title: 'Warning',
        message: 'Please select an evaluator',
      });
      return;
    }

    try {
      setLoading(true);
      
      const request: BulkTeamOperationRequest = {
        teamIds: selectedTeams,
        operation: operation as any,
        data: {
          evaluatorId: evaluatorId ? parseInt(evaluatorId) : undefined,
          role: role || undefined,
        },
      };

      const response = await teamService.bulkTeamOperations(request);
      setResults(response.results || []);

      showNotification({
        type: 'success',
        title: 'Success',
        message: response.message || 'Bulk operation completed successfully',
      });

      onSuccess();
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to perform bulk operation',
      });
    } finally {
      setLoading(false);
    }
  };

  const getOperationIcon = (op: string) => {
    const opConfig = operations.find(o => o.value === op);
    return opConfig ? opConfig.icon : Settings;
  };

  const getOperationColor = (op: string) => {
    const opConfig = operations.find(o => o.value === op);
    return opConfig ? opConfig.color : 'text-gray-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Bulk Team Operations
              </h2>
              <p className="text-sm text-gray-500">
                {selectedTeams.length} teams selected
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Operation Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Operation *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {operations.map((op) => {
                const Icon = op.icon;
                return (
                  <button
                    key={op.value}
                    type="button"
                    onClick={() => setOperation(op.value)}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors ${
                      operation === op.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${op.color}`} />
                    <span className="text-sm font-medium text-gray-900">
                      {op.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Operation-specific fields */}
          {(operation === 'assignEvaluator' || operation === 'removeEvaluator') && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evaluator *
                </label>
                <Select
                  value={evaluatorId}
                  onChange={setEvaluatorId}
                  options={[
                    { value: '', label: 'Select Evaluator' },
                    { value: '1', label: 'John Doe (Evaluator)' },
                    { value: '2', label: 'Jane Smith (Evaluator)' },
                    { value: '3', label: 'Mike Johnson (Evaluator)' },
                  ]}
                />
              </div>
              
              {operation === 'assignEvaluator' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <Input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Enter role (optional)"
                  />
                </div>
              )}
            </div>
          )}

          {/* Confirmation */}
          {operation && (
            <Card>
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Operation Summary
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span>Operation:</span>
                    <div className="flex items-center space-x-1">
                      {React.createElement(getOperationIcon(operation), {
                        className: `h-4 w-4 ${getOperationColor(operation)}`,
                      })}
                      <span className="font-medium">
                        {operations.find(o => o.value === operation)?.label}
                      </span>
                    </div>
                  </div>
                  <div>Teams affected: {selectedTeams.length}</div>
                  {evaluatorId && (
                    <div>Evaluator ID: {evaluatorId}</div>
                  )}
                  {role && (
                    <div>Role: {role}</div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Results */}
          {results.length > 0 && (
            <Card>
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Operation Results
                </h4>
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">
                        Team {result.teamId}: {result.success ? 'Success' : 'Failed'}
                      </span>
                      <Badge
                        variant={result.success ? 'success' : 'danger'}
                        size="sm"
                      >
                        {result.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !operation}
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Execute Operation</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

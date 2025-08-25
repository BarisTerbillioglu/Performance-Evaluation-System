import React, { useState } from 'react';
import { 
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Card } from '@/components/design-system/Card';
import { Select, Input } from '@/components/ui/form';
import { useUIStore } from '@/stores';
import { evaluationService } from '@/services/evaluationService';
import { 
  EvaluationListDto,
  EvaluationStatus,
  CreateEvaluationRequest
} from '@/types';

interface BulkOperationsModalProps {
  selectedEvaluations: EvaluationListDto[];
  onSuccess?: () => void;
}

export const BulkOperationsModal: React.FC<BulkOperationsModalProps> = ({
  selectedEvaluations,
  onSuccess
}) => {
  const { hideModal, showNotification } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [operation, setOperation] = useState<'status' | 'create' | 'export'>('status');
  const [status, setStatus] = useState<EvaluationStatus>(EvaluationStatus.InProgress);
  const [period, setPeriod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleBulkStatusUpdate = async () => {
    try {
      setLoading(true);
      const evaluationIds = selectedEvaluations.map(e => e.id);
      
      await evaluationService.bulkUpdateStatus(evaluationIds, status);
      
      showNotification({
        type: 'success',
        title: 'Success',
        message: `Updated status for ${selectedEvaluations.length} evaluations`
      });
      
      onSuccess?.();
      hideModal();
    } catch (error) {
      console.error('Failed to update status:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update evaluation status'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCreate = async () => {
    if (!period || !startDate || !endDate) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Create evaluations for all selected employees
      const evaluations: CreateEvaluationRequest[] = selectedEvaluations.map(evaluation => ({
        employeeId: evaluation.id, // This would need to be the actual employee ID
        evaluatorId: 1, // This would need to be the actual evaluator ID
        period,
        startDate,
        endDate
      }));

      const result = await evaluationService.bulkCreateEvaluations(evaluations);
      
      showNotification({
        type: 'success',
        title: 'Success',
        message: `Created ${result.createdCount} evaluations successfully`
      });
      
      if (result.errors.length > 0) {
        showNotification({
          type: 'warning',
          title: 'Partial Success',
          message: `${result.errors.length} evaluations failed to create`
        });
      }
      
      onSuccess?.();
      hideModal();
    } catch (error) {
      console.error('Failed to create evaluations:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to create evaluations'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkExport = async () => {
    try {
      setLoading(true);
      const evaluationIds = selectedEvaluations.map(e => e.id);
      
      // This would need to be implemented in the API
      const blob = await evaluationService.exportEvaluations({
        evaluationIds: evaluationIds.join(',')
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evaluations-bulk-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Evaluations exported successfully'
      });
      
      hideModal();
    } catch (error) {
      console.error('Failed to export evaluations:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to export evaluations'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: EvaluationStatus) => {
    switch (status) {
      case EvaluationStatus.Completed:
        return <CheckCircleIcon className="h-5 w-5 text-success-600" />;
      case EvaluationStatus.InProgress:
        return <ClockIcon className="h-5 w-5 text-warning-600" />;
      case EvaluationStatus.Overdue:
        return <ExclamationTriangleIcon className="h-5 w-5 text-error-600" />;
      case EvaluationStatus.Cancelled:
        return <XCircleIcon className="h-5 w-5 text-gray-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: EvaluationStatus) => {
    switch (status) {
      case EvaluationStatus.Completed:
        return 'success';
      case EvaluationStatus.InProgress:
        return 'warning';
      case EvaluationStatus.Overdue:
        return 'error';
      case EvaluationStatus.Cancelled:
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <UserGroupIcon className="mx-auto h-12 w-12 text-primary-600" />
        <h2 className="mt-4 text-xl font-bold text-gray-900">
          Bulk Operations
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Perform operations on {selectedEvaluations.length} selected evaluations
        </p>
      </div>

      {/* Selected Evaluations Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Evaluations</h3>
        <div className="space-y-3 max-h-40 overflow-y-auto">
          {selectedEvaluations.map((evaluation) => (
            <div key={evaluation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(evaluation.status as EvaluationStatus)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{evaluation.employeeName}</p>
                  <p className="text-xs text-gray-500">{evaluation.period}</p>
                </div>
              </div>
              <Badge variant={getStatusColor(evaluation.status as EvaluationStatus)} size="sm">
                {evaluation.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Operation Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Operation</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setOperation('status')}
              className={`p-4 border-2 rounded-lg text-left transition-colors duration-200 ${
                operation === 'status'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CheckCircleIcon className="h-6 w-6 text-primary-600 mb-2" />
              <h4 className="font-medium text-gray-900">Update Status</h4>
              <p className="text-sm text-gray-500">Change status for all selected evaluations</p>
            </button>

            <button
              type="button"
              onClick={() => setOperation('create')}
              className={`p-4 border-2 rounded-lg text-left transition-colors duration-200 ${
                operation === 'create'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <UserGroupIcon className="h-6 w-6 text-primary-600 mb-2" />
              <h4 className="font-medium text-gray-900">Create New</h4>
              <p className="text-sm text-gray-500">Create new evaluations for selected employees</p>
            </button>

            <button
              type="button"
              onClick={() => setOperation('export')}
              className={`p-4 border-2 rounded-lg text-left transition-colors duration-200 ${
                operation === 'export'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <DocumentArrowDownIcon className="h-6 w-6 text-primary-600 mb-2" />
              <h4 className="font-medium text-gray-900">Export</h4>
              <p className="text-sm text-gray-500">Export selected evaluations to CSV</p>
            </button>
          </div>
        </div>
      </Card>

      {/* Operation Configuration */}
      {operation === 'status' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <Select
                value={status}
                onChange={(value) => setStatus(value as EvaluationStatus)}
                options={[
                  { value: EvaluationStatus.Draft, label: 'Draft' },
                  { value: EvaluationStatus.InProgress, label: 'In Progress' },
                  { value: EvaluationStatus.Submitted, label: 'Submitted' },
                  { value: EvaluationStatus.Completed, label: 'Completed' },
                  { value: EvaluationStatus.Cancelled, label: 'Cancelled' }
                ]}
                className="w-full"
              />
            </div>
            <div className="p-4 bg-warning-50 rounded-lg">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-warning-600 mr-2" />
                <span className="text-sm text-warning-800">
                  This will update the status for all {selectedEvaluations.length} selected evaluations
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {operation === 'create' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Evaluations</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Period *
              </label>
              <Input
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="e.g., Q1 2024"
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <div className="p-4 bg-info-50 rounded-lg">
              <div className="flex items-center">
                <UserGroupIcon className="h-5 w-5 text-info-600 mr-2" />
                <span className="text-sm text-info-800">
                  This will create new evaluations for {selectedEvaluations.length} employees
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {operation === 'export' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Evaluations</h3>
          <div className="p-4 bg-info-50 rounded-lg">
            <div className="flex items-center">
              <DocumentArrowDownIcon className="h-5 w-5 text-info-600 mr-2" />
              <span className="text-sm text-info-800">
                This will export {selectedEvaluations.length} evaluations to a CSV file
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          variant="secondary"
          onClick={() => hideModal()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={
            operation === 'status' ? handleBulkStatusUpdate :
            operation === 'create' ? handleBulkCreate :
            handleBulkExport
          }
          loading={loading}
          disabled={
            operation === 'create' && (!period || !startDate || !endDate)
          }
        >
          {operation === 'status' && 'Update Status'}
          {operation === 'create' && 'Create Evaluations'}
          {operation === 'export' && 'Export'}
        </Button>
      </div>
    </div>
  );
};

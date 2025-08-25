import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  UserIcon, 
  CalendarIcon, 
  BuildingOfficeIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/design-system/Button';
import { Input, Select } from '@/components/ui/form';
import { Badge } from '@/components/design-system/Badge';
import { Card } from '@/components/design-system/Card';
import { useUIStore } from '@/stores';
import { evaluationService } from '@/services/evaluationService';
import { userService } from '@/services/userService';
import { 
  CreateEvaluationRequest,
  UserSearchDto,
  DepartmentDto
} from '@/types';
import { formatFullName } from '@/utils';

// Validation schema
const createEvaluationSchema = z.object({
  employeeId: z.number().min(1, 'Employee is required'),
  evaluatorId: z.number().min(1, 'Evaluator is required'),
  period: z.string().min(1, 'Evaluation period is required').max(50, 'Period must be less than 50 characters'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required')
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate > startDate;
}, {
  message: "End date must be after start date",
  path: ["endDate"]
});

type CreateEvaluationFormData = z.infer<typeof createEvaluationSchema>;

interface CreateEvaluationModalProps {
  onSuccess?: () => void;
}

export const CreateEvaluationModal: React.FC<CreateEvaluationModalProps> = ({ onSuccess }) => {
  const { hideModal, showNotification } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<UserSearchDto[]>([]);
  const [evaluators, setEvaluators] = useState<UserSearchDto[]>([]);
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<UserSearchDto | null>(null);
  const [evaluationExists, setEvaluationExists] = useState<boolean | false>(false);
  const [checkingExists, setCheckingExists] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger
  } = useForm<CreateEvaluationFormData>({
    resolver: zodResolver(createEvaluationSchema),
    mode: 'onChange',
    defaultValues: {
      employeeId: 0,
      evaluatorId: 0,
      period: '',
      startDate: '',
      endDate: ''
    }
  });

  const watchedEmployeeId = watch('employeeId');
  const watchedPeriod = watch('period');

  // Check if evaluation already exists
  useEffect(() => {
    const checkEvaluationExists = async () => {
      if (watchedEmployeeId && watchedPeriod) {
        setCheckingExists(true);
        try {
          const result = await evaluationService.checkEvaluationExists(watchedEmployeeId, watchedPeriod);
          setEvaluationExists(result.exists);
        } catch (error) {
          setEvaluationExists(false);
        } finally {
          setCheckingExists(false);
        }
      } else {
        setEvaluationExists(false);
      }
    };

    const timeoutId = setTimeout(checkEvaluationExists, 500);
    return () => clearTimeout(timeoutId);
  }, [watchedEmployeeId, watchedPeriod]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Update evaluator when employee changes
  useEffect(() => {
    if (watchedEmployeeId) {
      const employee = employees.find(emp => emp.id === watchedEmployeeId);
      setSelectedEmployee(employee || null);
      
      // Auto-select evaluator based on employee's department
      if (employee) {
        const departmentEvaluators = evaluators.filter(eval => 
          eval.departmentName === employee.departmentName
        );
        if (departmentEvaluators.length > 0) {
          setValue('evaluatorId', departmentEvaluators[0].id);
          trigger('evaluatorId');
        }
      }
    }
  }, [watchedEmployeeId, employees, evaluators, setValue, trigger]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadEmployees(),
        loadEvaluators(),
        loadDepartments()
      ]);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load required data'
      });
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await userService.getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const loadEvaluators = async () => {
    try {
      const data = await userService.getEvaluators();
      setEvaluators(data);
    } catch (error) {
      console.error('Failed to load evaluators:', error);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await userService.getUserStatistics();
      // This would need to be adjusted based on actual API response
      setDepartments([]);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const onSubmit = async (data: CreateEvaluationFormData) => {
    if (evaluationExists) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'An evaluation already exists for this employee and period'
      });
      return;
    }

    try {
      setLoading(true);
      
      const evaluationData: CreateEvaluationRequest = {
        employeeId: data.employeeId,
        evaluatorId: data.evaluatorId,
        period: data.period,
        startDate: data.startDate,
        endDate: data.endDate
      };

      await evaluationService.createEvaluation(evaluationData);
      
      onSuccess?.();
      hideModal();
      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Evaluation created successfully'
      });
    } catch (error) {
      console.error('Failed to create evaluation:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to create evaluation'
      });
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeDisplayName = (employee: UserSearchDto) => {
    return `${formatFullName(employee.firstName, employee.lastName)} - ${employee.departmentName}`;
  };

  const getEvaluatorDisplayName = (evaluator: UserSearchDto) => {
    return `${formatFullName(evaluator.firstName, evaluator.lastName)} - ${evaluator.departmentName}`;
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Employee Selection */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Selection</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee *
              </label>
              <Controller
                name="employeeId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value?.toString() || ''}
                    onChange={(value) => field.onChange(value ? parseInt(value) : 0)}
                    options={[
                      { value: '', label: 'Select employee' },
                      ...employees.map(emp => ({ 
                        value: emp.id.toString(), 
                        label: getEmployeeDisplayName(emp) 
                      }))
                    ]}
                    error={errors.employeeId?.message}
                    className="w-full"
                  />
                )}
              />
            </div>

            {selectedEmployee && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      {formatFullName(selectedEmployee.firstName, selectedEmployee.lastName)}
                    </h4>
                    <p className="text-sm text-gray-600">{selectedEmployee.email}</p>
                    <div className="flex items-center mt-1">
                      <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-500">{selectedEmployee.departmentName}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Evaluator Selection */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluator Assignment</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evaluator *
            </label>
            <Controller
              name="evaluatorId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value?.toString() || ''}
                  onChange={(value) => field.onChange(value ? parseInt(value) : 0)}
                  options={[
                    { value: '', label: 'Select evaluator' },
                    ...evaluators.map(eval => ({ 
                      value: eval.id.toString(), 
                      label: getEvaluatorDisplayName(eval) 
                    }))
                  ]}
                  error={errors.evaluatorId?.message}
                  className="w-full"
                />
              )}
            />
            <p className="mt-2 text-xs text-gray-500">
              Evaluator will be automatically selected based on employee's department
            </p>
          </div>
        </Card>

        {/* Evaluation Period */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluation Period</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Period *
              </label>
              <div className="relative">
                <Controller
                  name="period"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="e.g., Q1 2024"
                      error={errors.period?.message}
                      className="w-full pr-10"
                    />
                  )}
                />
                {checkingExists && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent"></div>
                  </div>
                )}
                {!checkingExists && evaluationExists && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <ExclamationTriangleIcon className="h-4 w-4 text-error-600" />
                  </div>
                )}
                {!checkingExists && !evaluationExists && watchedPeriod && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckIcon className="h-4 w-4 text-success-600" />
                  </div>
                )}
              </div>
              {evaluationExists && (
                <p className="mt-1 text-sm text-error-600">
                  An evaluation already exists for this employee and period
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="date"
                    error={errors.startDate?.message}
                    className="w-full"
                  />
                )}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="date"
                    error={errors.endDate?.message}
                    className="w-full"
                  />
                )}
              />
            </div>
          </div>
        </Card>

        {/* Quick Period Presets */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Period Presets</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Q1 2024', period: 'Q1 2024', startDate: '2024-01-01', endDate: '2024-03-31' },
              { label: 'Q2 2024', period: 'Q2 2024', startDate: '2024-04-01', endDate: '2024-06-30' },
              { label: 'Q3 2024', period: 'Q3 2024', startDate: '2024-07-01', endDate: '2024-09-30' },
              { label: 'Q4 2024', period: 'Q4 2024', startDate: '2024-10-01', endDate: '2024-12-31' }
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setValue('period', preset.period);
                  setValue('startDate', preset.startDate);
                  setValue('endDate', preset.endDate);
                  trigger(['period', 'startDate', 'endDate']);
                }}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left"
              >
                <div className="text-sm font-medium text-gray-900">{preset.label}</div>
                <div className="text-xs text-gray-500">
                  {new Date(preset.startDate).toLocaleDateString('tr-TR')} - {new Date(preset.endDate).toLocaleDateString('tr-TR')}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={() => hideModal()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={!isValid || evaluationExists}
          >
            Create Evaluation
          </Button>
        </div>
      </form>
    </div>
  );
};

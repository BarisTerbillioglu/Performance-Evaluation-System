import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EyeIcon, EyeSlashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/design-system/Button';
import { Input, Select, Checkbox } from '@/components/ui/form';
import { Badge } from '@/components/design-system/Badge';
import { Card } from '@/components/design-system/Card';
import { useUIStore } from '@/stores';
import { userService } from '@/services/userService';
import { departmentService } from '@/services/departmentService';
import { roleService } from '@/services/roleService';
import { 
  UserSearchDto, 
  CreateUserRequest, 
  UpdateUserRequest,
  DepartmentDto,
  RoleDto
} from '@/types';

// Validation schemas
const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  departmentId: z.number().min(1, 'Department is required'),
  phoneNumber: z.string().optional(),
  jobTitle: z.string().optional(),
  roleIds: z.array(z.number()).min(1, 'At least one role is required'),
  isActive: z.boolean().default(true)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const updateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  departmentId: z.number().min(1, 'Department is required'),
  phoneNumber: z.string().optional(),
  jobTitle: z.string().optional(),
  roleIds: z.array(z.number()).min(1, 'At least one role is required'),
  isActive: z.boolean()
});

type CreateUserFormData = z.infer<typeof createUserSchema>;
type UpdateUserFormData = z.infer<typeof updateUserSchema>;

interface UserFormModalProps {
  user?: UserSearchDto;
  onSuccess?: () => void;
}

// Password strength checker
const checkPasswordStrength = (password: string) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  
  const score = Object.values(checks).filter(Boolean).length;
  
  return {
    score,
    checks,
    strength: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong',
    color: score < 2 ? 'error' : score < 4 ? 'warning' : 'success'
  };
};

export const UserFormModal: React.FC<UserFormModalProps> = ({ user, onSuccess }) => {
  const { hideModal, showNotification } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailUnique, setEmailUnique] = useState<boolean | null>(null);

  const isEdit = !!user;
  const schema = isEdit ? updateUserSchema : createUserSchema;
  
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue,
    trigger
  } = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: isEdit ? {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      departmentId: 0, // Will be set when departments load
      phoneNumber: '',
      jobTitle: '',
      roleIds: [],
      isActive: user.isActive
    } : {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      departmentId: 0,
      phoneNumber: '',
      jobTitle: '',
      roleIds: [],
      isActive: true
    }
  });

  const watchedEmail = watch('email');
  const watchedPassword = watch('password');

  // Check email uniqueness
  useEffect(() => {
    const checkEmail = async () => {
      if (watchedEmail && watchedEmail.includes('@')) {
        setEmailChecking(true);
        try {
          const result = await userService.checkEmailUniqueness(watchedEmail, isEdit ? user.id : undefined);
          setEmailUnique(result.isUnique);
        } catch (error) {
          setEmailUnique(null);
        } finally {
          setEmailChecking(false);
        }
      } else {
        setEmailUnique(null);
      }
    };

    const timeoutId = setTimeout(checkEmail, 500);
    return () => clearTimeout(timeoutId);
  }, [watchedEmail, isEdit, user?.id]);

  // Load departments and roles
  useEffect(() => {
    loadDepartments();
    loadRoles();
  }, []);

  // Set department when departments load
  useEffect(() => {
    if (departments.length > 0 && isEdit && user) {
      // Find user's department
      const userDept = departments.find(dept => dept.name === user.departmentName);
      if (userDept) {
        setValue('departmentId', userDept.id);
      }
    }
  }, [departments, isEdit, user, setValue]);

  // Set roles when roles load
  useEffect(() => {
    if (roles.length > 0 && isEdit && user) {
      // Find user's roles
      const userRoleIds = roles
        .filter(role => user.roles.includes(role.name))
        .map(role => role.id);
      setSelectedRoles(userRoleIds);
      setValue('roleIds', userRoleIds);
    }
  }, [roles, isEdit, user, setValue]);

  const loadDepartments = async () => {
    try {
      const data = await departmentService.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Failed to load departments:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load departments'
      });
    }
  };

  const loadRoles = async () => {
    try {
      const data = await roleService.getRoles();
      setRoles(data);
    } catch (error) {
      console.error('Failed to load roles:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load roles'
      });
    }
  };

  const handleRoleToggle = (roleId: number) => {
    const newSelectedRoles = selectedRoles.includes(roleId)
      ? selectedRoles.filter(id => id !== roleId)
      : [...selectedRoles, roleId];
    
    setSelectedRoles(newSelectedRoles);
    setValue('roleIds', newSelectedRoles);
    trigger('roleIds');
  };

  const onSubmit = async (data: CreateUserFormData | UpdateUserFormData) => {
    if (!emailUnique) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Email address is already in use'
      });
      return;
    }

    try {
      setLoading(true);
      
      if (isEdit) {
        const updateData = data as UpdateUserFormData;
        await userService.updateUser(user.id, updateData);
      } else {
        const createData = data as CreateUserFormData;
        await userService.createUser({
          ...createData,
          passwordHash: createData.password // Backend will hash this
        });
      }
      
      onSuccess?.();
      hideModal();
    } catch (error) {
      console.error('Failed to save user:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: isEdit ? 'Failed to update user' : 'Failed to create user'
      });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = checkPasswordStrength(watchedPassword || '');

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter first name"
                    error={errors.firstName?.message}
                    className="w-full"
                  />
                )}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter last name"
                    error={errors.lastName?.message}
                    className="w-full"
                  />
                )}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter email address"
                      error={errors.email?.message}
                      className="w-full pr-10"
                    />
                  )}
                />
                {emailChecking && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent"></div>
                  </div>
                )}
                {!emailChecking && emailUnique !== null && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {emailUnique ? (
                      <CheckIcon className="h-4 w-4 text-success-600" />
                    ) : (
                      <XMarkIcon className="h-4 w-4 text-error-600" />
                    )}
                  </div>
                )}
              </div>
              {!emailUnique && watchedEmail && (
                <p className="mt-1 text-sm text-error-600">This email address is already in use</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title
              </label>
              <Controller
                name="jobTitle"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter job title"
                    className="w-full"
                  />
                )}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter phone number"
                    className="w-full"
                  />
                )}
              />
            </div>
          </div>
        </Card>

        {/* Password Section (only for new users) */}
        {!isEdit && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        error={errors.password?.message}
                        className="w-full pr-10"
                      />
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {watchedPassword && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs text-gray-500">Password strength:</span>
                      <Badge variant={passwordStrength.color} size="sm">
                        {passwordStrength.strength}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {Object.entries(passwordStrength.checks).map(([check, passed]) => (
                        <div key={check} className="flex items-center space-x-2">
                          {passed ? (
                            <CheckIcon className="h-3 w-3 text-success-600" />
                          ) : (
                            <XMarkIcon className="h-3 w-3 text-gray-400" />
                          )}
                          <span className={`text-xs ${passed ? 'text-success-600' : 'text-gray-500'}`}>
                            {check === 'length' && 'At least 8 characters'}
                            {check === 'uppercase' && 'Contains uppercase letter'}
                            {check === 'lowercase' && 'Contains lowercase letter'}
                            {check === 'number' && 'Contains number'}
                            {check === 'special' && 'Contains special character'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm password"
                        error={errors.confirmPassword?.message}
                        className="w-full pr-10"
                      />
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Department and Roles */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department & Roles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <Controller
                name="departmentId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value?.toString() || ''}
                    onChange={(value) => field.onChange(value ? parseInt(value) : 0)}
                    options={[
                      { value: '', label: 'Select department' },
                      ...departments.map(dept => ({ value: dept.id.toString(), label: dept.name }))
                    ]}
                    error={errors.departmentId?.message}
                    className="w-full"
                  />
                )}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Roles *
              </label>
              <div className="space-y-2">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center">
                    <Checkbox
                      checked={selectedRoles.includes(role.id)}
                      onChange={() => handleRoleToggle(role.id)}
                      id={`role-${role.id}`}
                    />
                    <label htmlFor={`role-${role.id}`} className="ml-2 text-sm text-gray-700">
                      {role.name}
                    </label>
                  </div>
                ))}
              </div>
              {errors.roleIds && (
                <p className="mt-1 text-sm text-error-600">{errors.roleIds.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
          <div className="flex items-center">
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onChange={(checked) => field.onChange(checked)}
                  id="isActive"
                />
              )}
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
              Active account
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Inactive users cannot log in to the system
          </p>
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
            disabled={!isValid || !emailUnique}
          >
            {isEdit ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </form>
    </div>
  );
};

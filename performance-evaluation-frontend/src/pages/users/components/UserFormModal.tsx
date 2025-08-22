import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/form';
import { Badge } from '@/components/ui/feedback';
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

export const UserFormModal: React.FC<UserFormModalProps> = ({ user, onSuccess }) => {
  const { hideModal, showNotification } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

  const isEdit = !!user;
  const schema = isEdit ? updateUserSchema : createUserSchema;
  
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,

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

  // Load departments and roles
  useEffect(() => {
    loadDepartments();
    loadRoles();
  }, []);

  // Load user details for edit mode
  useEffect(() => {
    if (isEdit && user) {
      loadUserDetails();
    }
  }, [isEdit, user]);

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

  const loadUserDetails = async () => {
    if (!user) return;
    
    try {
      const userDetails = await userService.getUserById(user.id);
      const userRoleIds = userDetails.roles.map(r => r.roleId);
      setSelectedRoles(userRoleIds);
      
      reset({
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        email: userDetails.email,
        departmentId: userDetails.departmentId,
        phoneNumber: userDetails.phoneNumber || '',
        jobTitle: userDetails.jobTitle || '',
        roleIds: userRoleIds,
        isActive: userDetails.isActive
      });
    } catch (error) {
      console.error('Failed to load user details:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load user details'
      });
    }
  };

  const handleRoleToggle = (roleId: number) => {
    const newSelectedRoles = selectedRoles.includes(roleId)
      ? selectedRoles.filter(id => id !== roleId)
      : [...selectedRoles, roleId];
    
    setSelectedRoles(newSelectedRoles);
  };

  const onSubmit = async (data: CreateUserFormData | UpdateUserFormData) => {
    try {
      setLoading(true);

      if (isEdit && user) {
        const updateData: UpdateUserRequest = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          departmentId: data.departmentId,
          phoneNumber: data.phoneNumber || undefined,
          jobTitle: data.jobTitle || undefined,
          isActive: data.isActive
        };

        await userService.updateUser(user.id, updateData);
        
        // Update roles separately if needed
        // This would require a separate role assignment API
        
      } else {
        const createData = data as CreateUserFormData;
        const newUser: CreateUserRequest = {
          firstName: createData.firstName,
          lastName: createData.lastName,
          email: createData.email,
          passwordHash: createData.password, // This should be hashed on the backend
          departmentId: createData.departmentId
        };

        await userService.createUser(newUser);
        
        // Assign roles separately if needed
        // This would require a separate role assignment API
      }

      hideModal('add-user');
      hideModal('edit-user');
      onSuccess?.();

    } catch (error: any) {
      console.error('Failed to save user:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} user`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    hideModal('add-user');
    hideModal('edit-user');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="First Name"
                placeholder="Enter first name"
                error={errors.firstName?.message}
                required
              />
            )}
          />
          
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Last Name"
                placeholder="Enter last name"
                error={errors.lastName?.message}
                required
              />
            )}
          />
          
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="email"
                label="Email Address"
                placeholder="Enter email address"
                error={errors.email?.message}
                required
              />
            )}
          />
          
          <Controller
            name="departmentId"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <Select
                  value={field.value?.toString() || ''}
                  onChange={(value) => field.onChange(parseInt(value.toString()))}
                  options={[
                    { value: '', label: 'Select Department' },
                    ...departments.map(dept => ({
                      value: dept.id.toString(),
                      label: dept.name,
                    }))
                  ]}
                />
                {errors.departmentId && (
                  <p className="mt-1 text-sm text-red-600">{errors.departmentId.message}</p>
                )}
              </div>
            )}
          />
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Phone Number"
                placeholder="Enter phone number"
                error={errors.phoneNumber?.message}
              />
            )}
          />
          
          <Controller
            name="jobTitle"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Job Title"
                placeholder="Enter job title"
                error={errors.jobTitle?.message}
              />
            )}
          />
        </div>
      </div>

      {/* Password (Create mode only) */}
      {!isEdit && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Security</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Input
                    {...field}
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    placeholder="Enter password"
                    error={(errors as any).password?.message}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              )}
            />
            
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Input
                    {...field}
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm Password"
                    placeholder="Confirm password"
                    error={(errors as any).confirmPassword?.message}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              )}
            />
          </div>
        </div>
      )}

      {/* Role Assignment */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Role Assignment</h3>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Roles <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
            {roles.map(role => (
              <label key={role.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role.id)}
                  onChange={() => handleRoleToggle(role.id)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{role.name}</span>
                {role.description && (
                  <span className="text-xs text-gray-500">({role.description})</span>
                )}
              </label>
            ))}
          </div>
          {selectedRoles.length === 0 && (
            <p className="text-sm text-red-600">At least one role is required</p>
          )}
          {selectedRoles.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedRoles.map(roleId => {
                const role = roles.find(r => r.id === roleId);
                return role ? (
                  <Badge key={roleId} variant="default" size="sm">
                    {role.name}
                  </Badge>
                ) : null;
              })}
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={field.value}
                onChange={field.onChange}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Active User</span>
              <span className="text-xs text-gray-500">
                (Inactive users cannot log in to the system)
              </span>
            </label>
          )}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || !isValid || selectedRoles.length === 0}
        >
          {loading ? 'Saving...' : (isEdit ? 'Update User' : 'Create User')}
        </Button>
      </div>
    </form>
  );
};

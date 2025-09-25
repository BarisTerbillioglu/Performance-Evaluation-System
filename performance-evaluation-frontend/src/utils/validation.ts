import { z } from 'zod';

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Phone number validation
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
};

// Required field validation
export const isRequired = (value: string | null | undefined): boolean => {
  return value !== null && value !== undefined && value.trim() !== '';
};

// Zod schemas for form validation

// Login form schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters'),
  rememberMe: z.boolean().default(false)
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Password change schema
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// User creation schema
export const createUserSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  departmentId: z
    .number()
    .min(1, 'Please select a department'),
  jobTitle: z
    .string()
    .max(100, 'Job title must be less than 100 characters')
    .optional(),
  phoneNumber: z
    .string()
    .regex(/^\+?[\d\s-()]{10,}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal(''))
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

// Evaluation creation schema
export const createEvaluationSchema = z.object({
  employeeId: z
    .number()
    .min(1, 'Please select an employee'),
  evaluatorId: z
    .number()
    .min(1, 'Please select an evaluator'),
  period: z
    .string()
    .min(1, 'Period is required')
    .max(50, 'Period must be less than 50 characters'),
  startDate: z
    .string()
    .min(1, 'Start date is required')
    .refine((date) => !isNaN(Date.parse(date)), 'Please enter a valid start date'),
  endDate: z
    .string()
    .min(1, 'End date is required')
    .refine((date) => !isNaN(Date.parse(date)), 'Please enter a valid end date')
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate > startDate;
}, {
  message: 'End date must be after start date',
  path: ['endDate']
});

export type CreateEvaluationFormData = z.infer<typeof createEvaluationSchema>;

// Department creation schema
export const createDepartmentSchema = z.object({
  name: z
    .string()
    .min(1, 'Department name is required')
    .max(100, 'Department name must be less than 100 characters')
    .regex(/^[a-zA-Z\s&-]+$/, 'Department name can only contain letters, spaces, hyphens, and ampersands'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
});

export type CreateDepartmentFormData = z.infer<typeof createDepartmentSchema>;

// Team creation schema
export const createTeamSchema = z.object({
  name: z
    .string()
    .min(1, 'Team name is required')
    .max(100, 'Team name must be less than 100 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters')
});

export type CreateTeamFormData = z.infer<typeof createTeamSchema>;

// Search schema
export const searchSchema = z.object({
  searchTerm: z
    .string()
    .max(100, 'Search term must be less than 100 characters')
    .optional(),
  page: z
    .number()
    .min(1, 'Page must be at least 1')
    .default(1),
  pageSize: z
    .number()
    .min(1, 'Page size must be at least 1')
    .max(100, 'Page size must be at most 100')
    .default(10)
});

export type SearchFormData = z.infer<typeof searchSchema>;

// Comment schema
export const commentSchema = z.object({
  description: z
    .string()
    .min(1, 'Comment is required')
    .max(1000, 'Comment must be less than 1000 characters')
});

export type CommentFormData = z.infer<typeof commentSchema>;

// Score update schema
export const scoreSchema = z.object({
  score: z
    .number()
    .min(1, 'Score must be at least 1')
    .max(5, 'Score must be at most 5')
    .int('Score must be a whole number')
});

export type ScoreFormData = z.infer<typeof scoreSchema>;

// Form validation helper
export const validateForm = <T extends Record<string, unknown>>(
  data: T,
  schema: z.ZodSchema<T>
): { success: boolean; errors: Record<string, string>; data?: T } => {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      errors: {},
      data: validatedData
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return {
        success: false,
        errors
      };
    }
    return {
      success: false,
      errors: { general: 'Validation failed' }
    };
  }
};

// Async validation helper for react-hook-form
export const createAsyncValidator = <T>(schema: z.ZodSchema<T>) => {
  return async (data: T) => {
    try {
      schema.parse(data);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message || 'Validation failed';
      }
      return 'Validation failed';
    }
  };
};
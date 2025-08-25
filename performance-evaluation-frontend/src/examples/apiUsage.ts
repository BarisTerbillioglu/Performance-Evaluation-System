/**
 * Example usage of API services
 * This file demonstrates how to use the various API services in your components
 */

import {
  userService,
  departmentService,
  teamService,
  evaluationService,
  criteriaService,
  criteriaCategoryService,
  dashboardService,
  fileService,
} from '@/services';

import {
  CreateUserRequest,
  UpdateUserRequest,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  CreateTeamRequest,
  UpdateTeamRequest,
  CreateEvaluationRequest,
  UpdateEvaluationRequest,
  UpdateScoreRequest,
  AddCommentRequest,
  CreateCriteriaRequest,
  UpdateCriteriaRequest,
  AddRoleDescriptionRequest,
  CreateCriteriaCategoryRequest,
  UpdateCriteriaCategoryRequest,
  WeightValidationDto,
  RebalanceWeightRequest,
  CategoryWeightDto,
  UserDto,
  DepartmentDto,
  TeamDto,
  EvaluationDto,
  CriteriaDto,
  CriteriaCategoryDto,
  DashboardOverviewDto,
  AdminStatisticsDto,
  TeamPerformanceDto,
  PersonalPerformanceDto,
  FileUploadDto,
  FileInfoDto,
  PagedResult,
} from '@/types';

export const apiUsageExamples = {
  // User management examples
  createUser: async () => {
    // Create a new user
    const newUser: CreateUserRequest = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'hashedPassword123',
      departmentId: 1,
      roleIds: [1, 2], // Employee and Evaluator roles
    };

    try {
      const createdUser = await userService.createUser(newUser);
      console.log('User created:', createdUser);
      return createdUser;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  },

  updateUser: async (userId: number) => {
    const updateData: UpdateUserRequest = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      departmentId: 2,
      roleIds: [1, 3], // Employee and Manager roles
      isActive: true,
    };

    try {
      const updatedUser = await userService.updateUser(userId, updateData);
      console.log('User updated:', updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  },

  getUsers: async () => {
    try {
      const users = await userService.getUsers();
      console.log('Users:', users);
      return users;
    } catch (error) {
      console.error('Failed to get users:', error);
      throw error;
    }
  },

  // Department management examples
  createDepartment: async () => {
    const departmentData: CreateDepartmentRequest = {
      name: 'Engineering',
      description: 'Software Engineering Department',
    };

    try {
      const department = await departmentService.createDepartment(departmentData);
      console.log('Department created:', department);
      return department;
    } catch (error) {
      console.error('Failed to create department:', error);
      throw error;
    }
  },

  getDepartments: async () => {
    try {
      const departments = await departmentService.getDepartments();
      console.log('Departments:', departments);
      return departments;
    } catch (error) {
      console.error('Failed to get departments:', error);
      throw error;
    }
  },

  // Team management examples
  createTeam: async () => {
    const teamData: CreateTeamRequest = {
      name: 'Frontend Team',
      description: 'Frontend Development Team',
      evaluatorId: 2,
    };

    try {
      const team = await teamService.createTeam(teamData);
      console.log('Team created:', team);
      return team;
    } catch (error) {
      console.error('Failed to create team:', error);
      throw error;
    }
  },

  getTeams: async () => {
    try {
      const teams = await teamService.getTeams();
      console.log('Teams:', teams);
      return teams;
    } catch (error) {
      console.error('Failed to get teams:', error);
      throw error;
    }
  },

  // Evaluation management examples
  createEvaluation: async () => {
    const evaluationData: CreateEvaluationRequest = {
      employeeId: 1,
      period: 'Q1 2024',
    };

    try {
      const evaluation = await evaluationService.createEvaluation(evaluationData);
      console.log('Evaluation created:', evaluation);
      return evaluation;
    } catch (error) {
      console.error('Failed to create evaluation:', error);
      throw error;
    }
  },

  updateScore: async (evaluationId: number) => {
    const scoreUpdate: UpdateScoreRequest = {
      evaluationId: evaluationId,
      criteriaId: 1,
      score: 85,
    };

    try {
      const updatedScore = await evaluationService.updateScore(evaluationId, scoreUpdate);
      console.log('Score updated:', updatedScore);
      return updatedScore;
    } catch (error) {
      console.error('Failed to update score:', error);
      throw error;
    }
  },

  getEvaluations: async () => {
    try {
      const evaluations = await evaluationService.getEvaluations();
      console.log('Evaluations:', evaluations);
      return evaluations;
    } catch (error) {
      console.error('Failed to get evaluations:', error);
      throw error;
    }
  },

  // Criteria management examples
  createCriteria: async () => {
    const criteriaData: CreateCriteriaRequest = {
      categoryId: 1,
      name: 'Code Quality',
      baseDescription: 'Ability to write clean, maintainable code',
    };

    try {
      const criteria = await criteriaService.createCriteria(criteriaData);
      console.log('Criteria created:', criteria);
      return criteria;
    } catch (error) {
      console.error('Failed to create criteria:', error);
      throw error;
    }
  },

  getCriteria: async () => {
    try {
      const criteria = await criteriaService.getCriteria();
      console.log('Criteria:', criteria);
      return criteria;
    } catch (error) {
      console.error('Failed to get criteria:', error);
      throw error;
    }
  },

  // Category management examples
  createCategory: async () => {
    const categoryData: CreateCriteriaCategoryRequest = {
      name: 'Technical Skills',
      description: 'Technical competencies and skills',
      weight: 30,
    };

    try {
      const category = await criteriaCategoryService.createCategory(categoryData);
      console.log('Category created:', category);
      return category;
    } catch (error) {
      console.error('Failed to create category:', error);
      throw error;
    }
  },

  getCategories: async () => {
    try {
      const categories = await criteriaCategoryService.getCategories();
      console.log('Categories:', categories);
      return categories;
    } catch (error) {
      console.error('Failed to get categories:', error);
      throw error;
    }
  },

  // Dashboard examples
  getDashboardOverview: async () => {
    try {
      const overview = await dashboardService.getDashboardOverview();
      console.log('Dashboard overview:', overview);
      return overview;
    } catch (error) {
      console.error('Failed to get dashboard overview:', error);
      throw error;
    }
  },

  getAdminStats: async () => {
    try {
      const stats = await dashboardService.getAdminStatistics();
      console.log('Admin statistics:', stats);
      return stats;
    } catch (error) {
      console.error('Failed to get admin statistics:', error);
      throw error;
    }
  },

  // File management examples
  uploadFile: async (file: File) => {
    try {
      const uploadResult = await fileService.uploadFile(file);
      console.log('File uploaded:', uploadResult);
      return uploadResult;
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  },

  getFileInfo: async (filePath: string) => {
    try {
      const fileInfo = await fileService.getFileInfo(filePath);
      console.log('File info:', fileInfo);
      return fileInfo;
    } catch (error) {
      console.error('Failed to get file info:', error);
      throw error;
    }
  },
};

/**
 * Error Handling Example
 */
export const errorHandlingExample = {
  // Example of proper error handling
  handleApiCall: async () => {
    try {
      const users = await userService.getUsers();
      return { success: true, data: users };
    } catch (error) {
      console.error('API call failed:', error);
      
      // Handle different types of errors
      if (error && typeof error === 'object' && 'status' in error) {
        const apiError = error as { status: number; message: string };
        
        switch (apiError.status) {
          case 401:
            // Unauthorized - redirect to login
            console.log('User not authenticated');
            break;
          case 403:
            // Forbidden - user doesn't have permission
            console.log('User not authorized');
            break;
          case 404:
            // Not found
            console.log('Resource not found');
            break;
          case 500:
            // Server error
            console.log('Server error occurred');
            break;
          default:
            console.log('Unexpected error:', apiError.message);
        }
      }
      
      return { success: false, error: error };
    }
  }
};

/**
 * Usage in React Components
 */
export const reactComponentExample = `
// Example React component using the API services
import React, { useState, useEffect } from 'react';
import { userService } from '@/services';
import { UserListDto } from '@/types';
import { useApi } from '@/hooks';

export const UserList: React.FC = () => {
  const [users, setUsers] = useState<UserListDto[]>([]);
  const { loading, error, execute } = useApi(userService.getUsers);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const userData = await execute();
        setUsers(userData);
      } catch (err) {
        console.error('Failed to load users:', err);
      }
    };

    loadUsers();
  }, [execute]);

  if (loading === 'loading') {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.firstName} {user.lastName} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
};
`;

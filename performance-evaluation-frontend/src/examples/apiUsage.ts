/**
 * Example usage of API services
 * This file demonstrates how to use the various API services in your components
 */

import {
  authService,
  userService,
  evaluationService,
  criteriaService,
  criteriaCategoryService,
  departmentService,
  roleService,
  teamService,
  dashboardService,
} from '@/services';

import {
  LoginRequest,
  CreateUserRequest,
  CreateEvaluationRequest,
  CreateDepartmentRequest,
  CreateTeamRequest,
  UpdateScoreRequest,
  UserSearchRequest,
} from '@/types';

/**
 * Authentication Examples
 */
export const authExamples = {
  // Login user
  login: async () => {
    const credentials: LoginRequest = {
      email: 'user@example.com',
      password: 'password123'
    };
    
    try {
      const response = await authService.login(credentials);
      console.log('Login successful:', response.user);
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const user = await authService.getCurrentUser();
      console.log('Current user:', user);
      return user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await authService.logout();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
};

/**
 * User Management Examples
 */
export const userExamples = {
  // Get all users
  getAllUsers: async () => {
    try {
      const users = await userService.getUsers();
      console.log('Users:', users);
      return users;
    } catch (error) {
      console.error('Failed to get users:', error);
      throw error;
    }
  },

  // Create new user
  createUser: async () => {
    const newUser: CreateUserRequest = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      passwordHash: 'hashedPassword123',
      departmentId: 1
    };

    try {
      const user = await userService.createUser(newUser);
      console.log('User created:', user);
      return user;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  },

  // Search users
  searchUsers: async () => {
    const searchRequest: UserSearchRequest = {
      searchTerm: 'john',
      departmentId: 1,
      isActive: true,
      page: 1,
      pageSize: 10
    };

    try {
      const results = await userService.searchUsers(searchRequest);
      console.log('Search results:', results);
      return results;
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }
};

/**
 * Evaluation Management Examples
 */
export const evaluationExamples = {
  // Get all evaluations
  getAllEvaluations: async () => {
    try {
      const evaluations = await evaluationService.getEvaluations();
      console.log('Evaluations:', evaluations);
      return evaluations;
    } catch (error) {
      console.error('Failed to get evaluations:', error);
      throw error;
    }
  },

  // Create new evaluation
  createEvaluation: async () => {
    const newEvaluation: CreateEvaluationRequest = {
      employeeId: 1,
      evaluatorId: 2,
      period: '2024 Q1',
      startDate: '2024-01-01',
      endDate: '2024-03-31'
    };

    try {
      const evaluation = await evaluationService.createEvaluation(newEvaluation);
      console.log('Evaluation created:', evaluation);
      return evaluation;
    } catch (error) {
      console.error('Failed to create evaluation:', error);
      throw error;
    }
  },

  // Get evaluation form
  getEvaluationForm: async (evaluationId: number) => {
    try {
      const form = await evaluationService.getEvaluationForm(evaluationId);
      console.log('Evaluation form:', form);
      return form;
    } catch (error) {
      console.error('Failed to get evaluation form:', error);
      throw error;
    }
  },

  // Update evaluation score
  updateScore: async (evaluationId: number) => {
    const scoreUpdate: UpdateScoreRequest = {
      criteriaId: 1,
      score: 4
    };

    try {
      const updatedScore = await evaluationService.updateScore(evaluationId, scoreUpdate);
      console.log('Score updated:', updatedScore);
      return updatedScore;
    } catch (error) {
      console.error('Failed to update score:', error);
      throw error;
    }
  }
};

/**
 * Department Management Examples
 */
export const departmentExamples = {
  // Get all departments
  getAllDepartments: async () => {
    try {
      const departments = await departmentService.getDepartments();
      console.log('Departments:', departments);
      return departments;
    } catch (error) {
      console.error('Failed to get departments:', error);
      throw error;
    }
  },

  // Create new department
  createDepartment: async () => {
    const newDepartment: CreateDepartmentRequest = {
      name: 'Engineering',
      description: 'Software Development Department'
    };

    try {
      const department = await departmentService.createDepartment(newDepartment);
      console.log('Department created:', department);
      return department;
    } catch (error) {
      console.error('Failed to create department:', error);
      throw error;
    }
  },

  // Get department with users
  getDepartmentWithUsers: async (departmentId: number) => {
    try {
      const department = await departmentService.getDepartmentWithUsers(departmentId);
      console.log('Department with users:', department);
      return department;
    } catch (error) {
      console.error('Failed to get department with users:', error);
      throw error;
    }
  }
};

/**
 * Team Management Examples
 */
export const teamExamples = {
  // Get all teams
  getAllTeams: async () => {
    try {
      const teams = await teamService.getTeams();
      console.log('Teams:', teams);
      return teams;
    } catch (error) {
      console.error('Failed to get teams:', error);
      throw error;
    }
  },

  // Create new team
  createTeam: async () => {
    const newTeam: CreateTeamRequest = {
      name: 'Frontend Team',
      description: 'Frontend Development Team'
    };

    try {
      const team = await teamService.createTeam(newTeam);
      console.log('Team created:', team);
      return team;
    } catch (error) {
      console.error('Failed to create team:', error);
      throw error;
    }
  },

  // Assign employee to team
  assignEmployee: async (teamId: number) => {
    try {
      const result = await teamService.assignEmployee(teamId, {
        userId: 1,
        role: 'Developer'
      });
      console.log('Employee assigned:', result);
      return result;
    } catch (error) {
      console.error('Failed to assign employee:', error);
      throw error;
    }
  }
};

/**
 * Dashboard Examples
 */
export const dashboardExamples = {
  // Get dashboard overview
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

  // Get admin dashboard
  getAdminDashboard: async () => {
    try {
      const adminData = await dashboardService.getAdminDashboard();
      console.log('Admin dashboard:', adminData);
      return adminData;
    } catch (error) {
      console.error('Failed to get admin dashboard:', error);
      throw error;
    }
  }
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

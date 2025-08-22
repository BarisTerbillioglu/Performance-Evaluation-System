import {
  UserDto,
  UserListDto,
  UserWithDetailsDto,
  CreateUserRequest,
  UpdateUserRequest,
  DepartmentDto,
  DepartmentWithUsersDto,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  TeamDto,
  TeamWithMembersDto,
  CreateTeamRequest,
  UpdateTeamRequest,
  UserSearchRequest,
} from '@/types';

export interface UserState {
  // Users data
  users: UserListDto[];
  currentUser: UserWithDetailsDto | null;
  employees: UserListDto[];
  evaluators: UserListDto[];
  
  // Departments data
  departments: DepartmentDto[];
  currentDepartment: DepartmentWithUsersDto | null;
  
  // Teams data
  teams: TeamDto[];
  currentTeam: TeamWithMembersDto | null;
  
  // UI state
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
  
  // Search and filters
  searchTerm: string;
  filters: {
    departmentId?: number;
    roleId?: number;
    isActive?: boolean;
    teamId?: number;
  };
  
  // Pagination
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  
  // Cache timestamps
  lastFetch: Record<string, number>;
}

export interface UserActions {
  // User management
  fetchUsers: (params?: UserSearchRequest) => Promise<void>;
  fetchUserById: (id: number) => Promise<void>;
  createUser: (data: CreateUserRequest) => Promise<UserDto>;
  updateUser: (id: number, data: UpdateUserRequest) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  activateUser: (id: number) => Promise<void>;
  deactivateUser: (id: number) => Promise<void>;
  
  // Employee/Evaluator specific
  fetchEmployees: () => Promise<void>;
  fetchEvaluators: () => Promise<void>;
  
  // Department management
  fetchDepartments: () => Promise<void>;
  fetchDepartmentById: (id: number) => Promise<void>;
  createDepartment: (data: CreateDepartmentRequest) => Promise<DepartmentDto>;
  updateDepartment: (id: number, data: UpdateDepartmentRequest) => Promise<void>;
  deleteDepartment: (id: number) => Promise<void>;
  
  // Team management
  fetchTeams: () => Promise<void>;
  fetchTeamById: (id: number) => Promise<void>;
  createTeam: (data: CreateTeamRequest) => Promise<TeamDto>;
  updateTeam: (id: number, data: UpdateTeamRequest) => Promise<void>;
  deleteTeam: (id: number) => Promise<void>;
  assignUserToTeam: (teamId: number, userId: number, role: string) => Promise<void>;
  removeUserFromTeam: (teamId: number, userId: number) => Promise<void>;
  
  // Optimistic updates
  addUserOptimistic: (user: UserListDto) => void;
  updateUserOptimistic: (id: number, data: Partial<UserListDto>) => void;
  removeUserOptimistic: (id: number) => void;
  
  // Search and filters
  setSearchTerm: (term: string) => void;
  setFilters: (filters: Partial<UserState['filters']>) => void;
  setPagination: (pagination: Partial<UserState['pagination']>) => void;
  
  // UI state management
  setError: (error: string | null) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  
  // Cache management
  invalidateCache: (key?: string) => void;
  clearCurrentUser: () => void;
  clearCurrentDepartment: () => void;
  clearCurrentTeam: () => void;
  reset: () => void;
}

export interface UserStore extends UserState, UserActions {}

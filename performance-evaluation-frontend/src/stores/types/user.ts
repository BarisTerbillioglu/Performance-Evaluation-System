import {
  UserDto,
  UserListDto,
  UserWithDetailsDto,
  CreateUserRequest,
  UpdateUserRequest,
  DepartmentDto,
  TeamDto,
  UserSearchRequest,
  PagedResult,
  ApiError
} from '@/types';

export interface UserState {
  users: UserDto[];
  userDetails: UserWithDetailsDto | null;
  departments: DepartmentDto[];
  teams: TeamDto[];
  searchResults: UserListDto[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: {
    searchTerm: string;
    departmentId: number | null;
    roleId: number | null;
    isActive: boolean | null;
  };
  loading: {
    users: boolean;
    userDetails: boolean;
    departments: boolean;
    teams: boolean;
    search: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  error: string | null;
  cache: Record<string, any>;
  lastFetch: Date | null;
}

export interface UserActions {
  // User actions
  fetchUsers: () => Promise<void>;
  fetchUserById: (id: number) => Promise<void>;
  createUser: (userData: CreateUserRequest) => Promise<void>;
  updateUser: (id: number, userData: UpdateUserRequest) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;

  // Department actions
  fetchDepartments: () => Promise<void>;
  fetchDepartmentById: (id: number) => Promise<void>;
  createDepartment: (departmentData: any) => Promise<void>;
  updateDepartment: (id: number, departmentData: any) => Promise<void>;
  deleteDepartment: (id: number) => Promise<void>;

  // Team actions
  fetchTeams: () => Promise<void>;
  fetchTeamById: (id: number) => Promise<void>;
  createTeam: (teamData: any) => Promise<void>;
  updateTeam: (id: number, teamData: any) => Promise<void>;
  deleteTeam: (id: number) => Promise<void>;
  assignEmployee: (teamId: number, userId: number) => Promise<void>;
  removeUserFromTeam: (teamId: number, userId: number) => Promise<void>;

  // Utility actions
  setSearchTerm: (term: string) => void;
  setFilters: (filters: any) => void;
  setPagination: (pagination: any) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  invalidateCache: (key?: string) => void;
  reset: () => void;
}

export interface UserStore extends UserState, UserActions {}

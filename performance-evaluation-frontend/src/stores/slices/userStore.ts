import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { StateCreator } from 'zustand';
import {
  userService,
  teamService,
  departmentService
} from '@/services';
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
import { loggerWithActions } from '../middleware/logger';

interface UserState {
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

interface UserActions {
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

type UserStoreType = UserState & UserActions;

const createUserSlice: StateCreator<
  UserStoreType,
  [['zustand/immer', never]],
  [],
  UserStoreType
> = (set, get) => ({
  // State
  users: [],
  userDetails: null,
  departments: [],
  teams: [],
  searchResults: [],
  pagination: {
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  filters: {
    searchTerm: '',
    departmentId: null,
    roleId: null,
    isActive: null,
  },
  loading: {
    users: false,
    userDetails: false,
    departments: false,
    teams: false,
    search: false,
    create: false,
    update: false,
    delete: false,
  },
  error: null,
  cache: {},
  lastFetch: null,

  // Actions
  fetchUsers: async () => {
    set((state) => {
      state.loading.users = true;
      state.error = null;
    });

    try {
      const response: PagedResult<UserDto> = await userService.getUsers();
      set((state) => {
        state.users = response.data;
        state.loading.users = false;
        state.lastFetch = new Date();
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
        state.loading.users = false;
      });
    }
  },

  fetchUserById: async (id: number) => {
    set((state) => {
      state.loading.userDetails = true;
      state.error = null;
    });

    try {
      const user: UserWithDetailsDto = await userService.getUserById(id);
      set((state) => {
        state.userDetails = user;
        state.loading.userDetails = false;
        state.cache[`user-${id}`] = new Date();
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
        state.loading.userDetails = false;
      });
    }
  },

  createUser: async (userData: CreateUserRequest) => {
    set((state) => {
      state.loading.create = true;
      state.error = null;
    });

    try {
      const newUser: UserDto = await userService.createUser(userData);
      set((state) => {
        state.users.push(newUser);
        state.loading.create = false;
        delete state.cache.users;
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
        state.loading.create = false;
      });
      throw error;
    }
  },

  updateUser: async (id: number, userData: UpdateUserRequest) => {
    set((state) => {
      state.loading.update = true;
      state.error = null;
    });

    try {
      const updatedUser: UserDto = await userService.updateUser(id, userData);
      set((state) => {
        const index = state.users.findIndex(u => u.id === id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
        if (state.userDetails?.id === id) {
          state.userDetails = { ...state.userDetails, ...updatedUser };
        }
        state.loading.update = false;
        delete state.cache.users;
        delete state.cache[`user-${id}`];
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
        state.loading.update = false;
      });
      throw error;
    }
  },

  deleteUser: async (id: number) => {
    set((state) => {
      state.loading.delete = true;
      state.error = null;
    });

    try {
      await userService.deleteUser(id);
      set((state) => {
        state.users = state.users.filter(u => u.id !== id);
        if (state.userDetails?.id === id) {
          state.userDetails = null;
        }
        state.loading.delete = false;
        delete state.cache[`user-${id}`];
        delete state.cache.users;
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
        state.loading.delete = false;
      });
      throw error;
    }
  },

  fetchDepartments: async () => {
    set((state) => {
      state.loading.departments = true;
      state.error = null;
    });

    try {
      const departments: DepartmentDto[] = await departmentService.getDepartments();
      set((state) => {
        state.departments = departments;
        state.loading.departments = false;
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
        state.loading.departments = false;
      });
    }
  },

  fetchDepartmentById: async (id: number) => {
    try {
      const department: DepartmentDto = await departmentService.getDepartmentById(id);
      set((state) => {
        const index = state.departments.findIndex(d => d.id === id);
        if (index === -1) {
          state.departments.push(department);
        } else {
          state.departments[index] = department;
        }
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
      });
    }
  },

  createDepartment: async (departmentData: any) => {
    try {
      const newDepartment: DepartmentDto = await departmentService.createDepartment(departmentData);
      set((state) => {
        state.departments.push(newDepartment);
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
      });
      throw error;
    }
  },

  updateDepartment: async (id: number, departmentData: any) => {
    try {
      const updatedDepartment: DepartmentDto = await departmentService.updateDepartment(id, departmentData);
      set((state) => {
        const index = state.departments.findIndex(d => d.id === id);
        if (index !== -1) {
          state.departments[index] = updatedDepartment;
        }
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
      });
      throw error;
    }
  },

  deleteDepartment: async (id: number) => {
    try {
      await departmentService.deleteDepartment(id);
      set((state) => {
        state.departments = state.departments.filter(d => d.id !== id);
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
      });
      throw error;
    }
  },

  fetchTeams: async () => {
    set((state) => {
      state.loading.teams = true;
      state.error = null;
    });

    try {
      const teams: TeamDto[] = await teamService.getTeams();
      set((state) => {
        state.teams = teams;
        state.loading.teams = false;
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
        state.loading.teams = false;
      });
    }
  },

  fetchTeamById: async (id: number) => {
    try {
      const team: TeamDto = await teamService.getTeamById(id);
      set((state) => {
        const index = state.teams.findIndex(t => t.id === id);
        if (index === -1) {
          state.teams.push(team);
        } else {
          state.teams[index] = team;
        }
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
      });
    }
  },

  createTeam: async (teamData: any) => {
    try {
      const newTeam: TeamDto = await teamService.createTeam(teamData);
      set((state) => {
        state.teams.push(newTeam);
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
      });
      throw error;
    }
  },

  updateTeam: async (id: number, teamData: any) => {
    try {
      const updatedTeam: TeamDto = await teamService.updateTeam(id, teamData);
      set((state) => {
        const index = state.teams.findIndex(t => t.id === id);
        if (index !== -1) {
          state.teams[index] = updatedTeam;
        }
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
      });
      throw error;
    }
  },

  deleteTeam: async (id: number) => {
    try {
      await teamService.deleteTeam(id);
      set((state) => {
        state.teams = state.teams.filter(t => t.id !== id);
      });
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
      });
      throw error;
    }
  },

  assignEmployee: async (teamId: number, userId: number) => {
    try {
      await teamService.assignEmployee(teamId, userId);
      await get().fetchTeamById(teamId);
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
      });
      throw error;
    }
  },

  removeUserFromTeam: async (teamId: number, userId: number) => {
    try {
      await teamService.removeUserFromTeam(teamId, userId);
      await get().fetchTeamById(teamId);
    } catch (error) {
      const apiError = error as ApiError;
      set((state) => {
        state.error = apiError.message;
      });
      throw error;
    }
  },

  setSearchTerm: (term: string) => {
    set((state) => {
      state.filters.searchTerm = term;
    });
  },

  setFilters: (filters: any) => {
    set((state) => {
      state.filters = { ...state.filters, ...filters };
    });
  },

  setPagination: (pagination: any) => {
    set((state) => {
      state.pagination = { ...state.pagination, ...pagination };
    });
  },

  setError: (error: string | null) => {
    set((state) => {
      state.error = error;
    });
  },

  clearError: () => {
    set((state) => {
      state.error = null;
    });
  },

  setLoading: (loading: boolean) => {
    set((state) => {
      state.loading.users = loading;
    });
  },

  invalidateCache: (key?: string) => {
    set((state) => {
      if (key) {
        delete state.cache[key];
      } else {
        state.cache = {};
      }
    });
  },

  reset: () => {
    set((state) => {
      state.users = [];
      state.userDetails = null;
      state.departments = [];
      state.teams = [];
      state.searchResults = [];
      state.pagination = {
        page: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };
      state.filters = {
        searchTerm: '',
        departmentId: null,
        roleId: null,
        isActive: null,
      };
      state.loading = {
        users: false,
        userDetails: false,
        departments: false,
        teams: false,
        search: false,
        create: false,
        update: false,
        delete: false,
      };
      state.error = null;
      state.cache = {};
      state.lastFetch = null;
    });
  }
});

export const useUserStore = create<UserStoreType>()(
  loggerWithActions(
    immer(createUserSlice),
    {
      name: 'UserStore',
    }
  )
);

// Export selectors for better performance
export const userSelectors = {
  users: (state: UserStoreType) => state.users,
  currentUser: (state: UserStoreType) => state.userDetails,
  employees: (state: UserStoreType) => state.users,
  evaluators: (state: UserStoreType) => state.users,
  departments: (state: UserStoreType) => state.departments,
  teams: (state: UserStoreType) => state.teams,
  loading: (state: UserStoreType) => state.loading,
  error: (state: UserStoreType) => state.error,
  searchTerm: (state: UserStoreType) => state.filters.searchTerm,
  filters: (state: UserStoreType) => state.filters,
  pagination: (state: UserStoreType) => state.pagination,
};

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { userService, teamService, departmentService } from '@/services';
import { 
  UserDto, 
  UserListDto,
  UserWithDetailsDto,
  CreateUserRequest, 
  UpdateUserRequest,
  DepartmentDto,
  DepartmentWithUsersDto,
  TeamDto,
  TeamWithMembersDto,
  UserSearchRequest,
  PagedResult
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
}

type UserStore = UserState & UserActions;

const initialState: UserState = {
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
};

export const useUserStore = create<UserStore>()(
  loggerWithActions(
    immer((set, get) => ({
      ...initialState,

      // User actions
      fetchUsers: async () => {
        try {
          set((state: UserStore) => {
            state.loading.users = true;
            state.error = null;
          });

          const response = await userService.getUsers();

          set((state: UserStore) => {
            state.users = response.data;
            state.loading.users = false;
            state.lastFetch = new Date();
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
          set((state: UserStore) => {
            state.error = errorMessage;
            state.loading.users = false;
          });
        }
      },

      fetchUserById: async (id: number) => {
        try {
          set((state: UserStore) => {
            state.loading.userDetails = true;
            state.error = null;
          });

          const user = await userService.getUserById(id);

          set((state: UserStore) => {
            state.userDetails = user as UserWithDetailsDto;
            state.loading.userDetails = false;
            state.cache[`user-${id}`] = new Date();
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user';
          set((state: UserStore) => {
            state.error = errorMessage;
            state.loading.userDetails = false;
          });
        }
      },

      createUser: async (userData: CreateUserRequest) => {
        try {
          set((state: UserStore) => {
            state.loading.create = true;
            state.error = null;
          });

          await userService.createUser(userData);

          set((state: UserStore) => {
            state.loading.create = false;
            delete state.cache.users;
          });

          // Refresh users list
          get().fetchUsers();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
          set((state: UserStore) => {
            state.error = errorMessage;
            state.loading.create = false;
          });
        }
      },

      updateUser: async (id: number, userData: UpdateUserRequest) => {
        try {
          set((state: UserStore) => {
            state.loading.update = true;
            state.error = null;
          });

          await userService.updateUser(id, userData);

          set((state: UserStore) => {
            state.loading.update = false;
            delete state.cache.users;
            delete state.cache[`user-${id}`];
          });

          // Refresh data
          get().fetchUsers();
          if (get().userDetails?.id === id) {
            get().fetchUserById(id);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
          set((state: UserStore) => {
            state.error = errorMessage;
            state.loading.update = false;
          });
        }
      },

      deleteUser: async (id: number) => {
        try {
          set((state: UserStore) => {
            state.loading.delete = true;
            state.error = null;
          });

          await userService.deleteUser(id);

          set((state: UserStore) => {
            state.loading.delete = false;
            if (state.userDetails?.id === id) {
              state.userDetails = null;
            }
            delete state.cache[`user-${id}`];
            delete state.cache.users;
          });

          // Refresh users list
          get().fetchUsers();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
          set((state: UserStore) => {
            state.error = errorMessage;
            state.loading.delete = false;
          });
        }
      },

      // Department actions
      fetchDepartments: async () => {
        try {
          set((state: UserStore) => {
            state.loading.departments = true;
            state.error = null;
          });

          const departments = await departmentService.getDepartments();

          set((state: UserStore) => {
            state.departments = departments;
            state.loading.departments = false;
            state.cache.departments = new Date();
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch departments';
          set((state: UserStore) => {
            state.error = errorMessage;
            state.loading.departments = false;
          });
        }
      },

      fetchDepartmentById: async (id: number) => {
        try {
          const department = await departmentService.getDepartmentById(id);
          set((state: UserStore) => {
            state.userDetails = department as any;
            state.cache[`department-${id}`] = new Date();
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch department';
          set((state: UserStore) => {
            state.error = errorMessage;
          });
        }
      },

      createDepartment: async (departmentData: any) => {
        try {
          set((state: UserStore) => {
            state.loading.create = true;
            state.error = null;
          });

          await departmentService.createDepartment(departmentData);

          set((state: UserStore) => {
            state.loading.create = false;
            delete state.cache.departments;
          });

          get().fetchDepartments();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create department';
          set((state: UserStore) => {
            state.error = errorMessage;
            state.loading.create = false;
          });
        }
      },

      updateDepartment: async (id: number, departmentData: any) => {
        try {
          set((state: UserStore) => {
            state.loading.update = true;
            state.error = null;
          });

          await departmentService.updateDepartment(id, departmentData);

          set((state: UserStore) => {
            state.loading.update = false;
            delete state.cache.departments;
            delete state.cache[`department-${id}`];
          });

          get().fetchDepartments();
          if (get().userDetails?.id === id) {
            get().fetchDepartmentById(id);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update department';
          set((state: UserStore) => {
            state.error = errorMessage;
            state.loading.update = false;
          });
        }
      },

      deleteDepartment: async (id: number) => {
        try {
          await departmentService.deleteDepartment(id);
          set((state: UserStore) => {
            if (state.userDetails?.id === id) {
              state.userDetails = null;
            }
            delete state.cache[`department-${id}`];
            delete state.cache.departments;
          });
          get().fetchDepartments();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete department';
          set((state: UserStore) => {
            state.error = errorMessage;
          });
        }
      },

      // Team actions
      fetchTeams: async () => {
        try {
          set((state: UserStore) => {
            state.loading.teams = true;
            state.error = null;
          });

          const teams = await teamService.getTeams();

          set((state: UserStore) => {
            state.teams = teams;
            state.loading.teams = false;
            state.cache.teams = new Date();
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch teams';
          set((state: UserStore) => {
            state.error = errorMessage;
            state.loading.teams = false;
          });
        }
      },

      fetchTeamById: async (id: number) => {
        try {
          const team = await teamService.getTeamById(id);
          set((state: UserStore) => {
            state.userDetails = team as any;
            state.cache[`team-${id}`] = new Date();
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch team';
          set((state: UserStore) => {
            state.error = errorMessage;
          });
        }
      },

      createTeam: async (teamData: any) => {
        try {
          set((state: UserStore) => {
            state.loading.create = true;
            state.error = null;
          });

          await teamService.createTeam(teamData);

          set((state: UserStore) => {
            state.loading.create = false;
            delete state.cache.teams;
          });

          get().fetchTeams();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create team';
          set((state: UserStore) => {
            state.error = errorMessage;
            state.loading.create = false;
          });
        }
      },

      updateTeam: async (id: number, teamData: any) => {
        try {
          set((state: UserStore) => {
            state.loading.update = true;
            state.error = null;
          });

          await teamService.updateTeam(id, teamData);

          set((state: UserStore) => {
            state.loading.update = false;
            delete state.cache.teams;
            delete state.cache[`team-${id}`];
          });

          get().fetchTeams();
          if (get().userDetails?.id === id) {
            get().fetchTeamById(id);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update team';
          set((state: UserStore) => {
            state.error = errorMessage;
            state.loading.update = false;
          });
        }
      },

      deleteTeam: async (id: number) => {
        try {
          await teamService.deleteTeam(id);
          set((state: UserStore) => {
            if (state.userDetails?.id === id) {
              state.userDetails = null;
            }
            delete state.cache[`team-${id}`];
            delete state.cache.teams;
          });
          get().fetchTeams();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete team';
          set((state: UserStore) => {
            state.error = errorMessage;
          });
        }
      },

      assignEmployee: async (teamId: number, userId: number) => {
        try {
          await teamService.assignEmployee(teamId, { userId });
          if (get().userDetails?.id === teamId) {
            get().fetchTeamById(teamId);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to assign employee';
          set((state: UserStore) => {
            state.error = errorMessage;
          });
        }
      },

      removeUserFromTeam: async (teamId: number, userId: number) => {
        try {
          await teamService.removeUserFromTeam(teamId, userId);
          if (get().userDetails?.id === teamId) {
            get().fetchTeamById(teamId);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to remove user from team';
          set((state: UserStore) => {
            state.error = errorMessage;
          });
        }
      },

      // Utility actions
      setSearchTerm: (term: string) => {
        set((state: UserStore) => {
          state.filters.searchTerm = term;
        });
      },

      setFilters: (filters: any) => {
        set((state: UserStore) => {
          state.filters = { ...state.filters, ...filters };
        });
      },

      setPagination: (pagination: any) => {
        set((state: UserStore) => {
          state.pagination = { ...state.pagination, ...pagination };
        });
      },

      setError: (error: string | null) => {
        set((state: UserStore) => {
          state.error = error;
        });
      },

      clearError: () => {
        set((state: UserStore) => {
          state.error = null;
        });
      },

      setLoading: (loading: boolean) => {
        set((state: UserStore) => {
          state.loading.users = loading;
        });
      },

      invalidateCache: (key?: string) => {
        set((state: UserStore) => {
          if (key) {
            delete state.cache[key];
          } else {
            state.cache = {};
          }
        });
      },
    }))
  )
);

// Export selectors for better performance
export const userSelectors = {
  users: (state: UserStore) => state.users,
  currentUser: (state: UserStore) => state.userDetails,
  employees: (state: UserStore) => state.users,
  evaluators: (state: UserStore) => state.users,
  departments: (state: UserStore) => state.departments,
  currentDepartment: (state: UserStore) => state.userDetails,
  teams: (state: UserStore) => state.teams,
  currentTeam: (state: UserStore) => state.userDetails,
  isLoading: (state: UserStore) => state.loading.users,
  error: (state: UserStore) => state.error,
  searchTerm: (state: UserStore) => state.filters.searchTerm,
  filters: (state: UserStore) => state.filters,
  pagination: (state: UserStore) => state.pagination,
};

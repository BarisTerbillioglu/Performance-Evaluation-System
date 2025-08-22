import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { UserStore } from '../types/user';
import { userService, departmentService, teamService } from '@/services';
import { loggerWithActions } from '../middleware/logger';
import { useUIStore } from './uiStore';

const initialState = {
  users: [],
  currentUser: null,
  employees: [],
  evaluators: [],
  departments: [],
  currentDepartment: null,
  teams: [],
  currentTeam: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
  searchTerm: '',
  filters: {},
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },
  lastFetch: {},
};

export const useUserStore = create<UserStore>()(
  loggerWithActions(
    immer((set, get) => ({
        // Initial state
        ...initialState,

        // User management
        fetchUsers: async (params = {}) => {
          try {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            useUIStore.getState().setLoading('fetchUsers', true);

            const users = await userService.getUsers();

            set((state) => {
              state.users = users;
              state.isLoading = false;
              state.lastFetch.users = Date.now();
            });

            useUIStore.getState().setLoading('fetchUsers', false);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
            set((state) => {
              state.error = errorMessage;
              state.isLoading = false;
            });
            useUIStore.getState().setLoading('fetchUsers', false);
            useUIStore.getState().showError('Failed to load users', errorMessage);
            throw error;
          }
        },

        fetchUserById: async (id: number) => {
          try {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            const user = await userService.getUserById(id);

            set((state) => {
              state.currentUser = user;
              state.isLoading = false;
              state.lastFetch[`user-${id}`] = Date.now();
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user';
            set((state) => {
              state.error = errorMessage;
              state.isLoading = false;
            });
            useUIStore.getState().showError('Failed to load user', errorMessage);
            throw error;
          }
        },

        createUser: async (data) => {
          try {
            set((state) => {
              state.isCreating = true;
              state.error = null;
            });

            useUIStore.getState().setLoading('createUser', true);

            const newUser = await userService.createUser(data);

            set((state) => {
              state.isCreating = false;
              // Invalidate users cache
              delete state.lastFetch.users;
            });

            useUIStore.getState().setLoading('createUser', false);
            useUIStore.getState().showSuccess('User created successfully');

            // Refresh users list
            get().fetchUsers();

            return newUser;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
            set((state) => {
              state.error = errorMessage;
              state.isCreating = false;
            });
            useUIStore.getState().setLoading('createUser', false);
            useUIStore.getState().showError('Failed to create user', errorMessage);
            throw error;
          }
        },

        updateUser: async (id: number, data) => {
          try {
            set((state) => {
              state.isUpdating = true;
              state.error = null;
            });

            useUIStore.getState().setLoading('updateUser', true);

            await userService.updateUser(id, data);

            set((state) => {
              state.isUpdating = false;
              // Invalidate cache
              delete state.lastFetch.users;
              delete state.lastFetch[`user-${id}`];
            });

            useUIStore.getState().setLoading('updateUser', false);
            useUIStore.getState().showSuccess('User updated successfully');

            // Refresh data
            get().fetchUsers();
            if (get().currentUser?.id === id) {
              get().fetchUserById(id);
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
            set((state) => {
              state.error = errorMessage;
              state.isUpdating = false;
            });
            useUIStore.getState().setLoading('updateUser', false);
            useUIStore.getState().showError('Failed to update user', errorMessage);
            throw error;
          }
        },

        deleteUser: async (id: number) => {
          try {
            // Optimistic update
            const previousUsers = get().users;
            set((state) => {
              state.users = state.users.filter(u => u.id !== id);
            });

            useUIStore.getState().setLoading('deleteUser', true);

            await userService.deleteUser(id);

            set((state) => {
              // Clear related data
              if (state.currentUser?.id === id) {
                state.currentUser = null;
              }
              delete state.lastFetch[`user-${id}`];
              delete state.lastFetch.users;
            });

            useUIStore.getState().setLoading('deleteUser', false);
            useUIStore.getState().showSuccess('User deleted successfully');
          } catch (error) {
            // Revert optimistic update
            set((state) => {
              state.users = previousUsers;
            });

            const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
            set((state) => {
              state.error = errorMessage;
            });
            useUIStore.getState().setLoading('deleteUser', false);
            useUIStore.getState().showError('Failed to delete user', errorMessage);
            throw error;
          }
        },

        activateUser: async (id: number) => {
          try {
            // Optimistic update
            set((state) => {
              const user = state.users.find(u => u.id === id);
              if (user) {
                user.isActive = true;
              }
            });

            await userService.activateUser(id);

            useUIStore.getState().showSuccess('User activated successfully');
          } catch (error) {
            // Revert optimistic update
            set((state) => {
              const user = state.users.find(u => u.id === id);
              if (user) {
                user.isActive = false;
              }
            });

            const errorMessage = error instanceof Error ? error.message : 'Failed to activate user';
            set((state) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to activate user', errorMessage);
            throw error;
          }
        },

        deactivateUser: async (id: number) => {
          try {
            // Optimistic update
            set((state) => {
              const user = state.users.find(u => u.id === id);
              if (user) {
                user.isActive = false;
              }
            });

            await userService.deactivateUser(id);

            useUIStore.getState().showSuccess('User deactivated successfully');
          } catch (error) {
            // Revert optimistic update
            set((state) => {
              const user = state.users.find(u => u.id === id);
              if (user) {
                user.isActive = true;
              }
            });

            const errorMessage = error instanceof Error ? error.message : 'Failed to deactivate user';
            set((state) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to deactivate user', errorMessage);
            throw error;
          }
        },

        // Employee/Evaluator specific
        fetchEmployees: async () => {
          try {
            const employees = await userService.getEmployees();

            set((state) => {
              state.employees = employees;
              state.lastFetch.employees = Date.now();
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch employees';
            set((state) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to load employees', errorMessage);
            throw error;
          }
        },

        fetchEvaluators: async () => {
          try {
            const evaluators = await userService.getEvaluators();

            set((state) => {
              state.evaluators = evaluators;
              state.lastFetch.evaluators = Date.now();
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch evaluators';
            set((state) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to load evaluators', errorMessage);
            throw error;
          }
        },

        // Department management
        fetchDepartments: async () => {
          try {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            useUIStore.getState().setLoading('fetchDepartments', true);

            const departments = await departmentService.getDepartments();

            set((state) => {
              state.departments = departments;
              state.isLoading = false;
              state.lastFetch.departments = Date.now();
            });

            useUIStore.getState().setLoading('fetchDepartments', false);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch departments';
            set((state) => {
              state.error = errorMessage;
              state.isLoading = false;
            });
            useUIStore.getState().setLoading('fetchDepartments', false);
            useUIStore.getState().showError('Failed to load departments', errorMessage);
            throw error;
          }
        },

        fetchDepartmentById: async (id: number) => {
          try {
            const department = await departmentService.getDepartmentWithUsers(id);

            set((state) => {
              state.currentDepartment = department;
              state.lastFetch[`department-${id}`] = Date.now();
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch department';
            set((state) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to load department', errorMessage);
            throw error;
          }
        },

        createDepartment: async (data) => {
          try {
            set((state) => {
              state.isCreating = true;
              state.error = null;
            });

            useUIStore.getState().setLoading('createDepartment', true);

            const newDepartment = await departmentService.createDepartment(data);

            set((state) => {
              state.isCreating = false;
              // Invalidate departments cache
              delete state.lastFetch.departments;
            });

            useUIStore.getState().setLoading('createDepartment', false);
            useUIStore.getState().showSuccess('Department created successfully');

            // Refresh departments list
            get().fetchDepartments();

            return newDepartment;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create department';
            set((state) => {
              state.error = errorMessage;
              state.isCreating = false;
            });
            useUIStore.getState().setLoading('createDepartment', false);
            useUIStore.getState().showError('Failed to create department', errorMessage);
            throw error;
          }
        },

        updateDepartment: async (id: number, data) => {
          try {
            set((state) => {
              state.isUpdating = true;
              state.error = null;
            });

            useUIStore.getState().setLoading('updateDepartment', true);

            await departmentService.updateDepartment(id, data);

            set((state) => {
              state.isUpdating = false;
              // Invalidate cache
              delete state.lastFetch.departments;
              delete state.lastFetch[`department-${id}`];
            });

            useUIStore.getState().setLoading('updateDepartment', false);
            useUIStore.getState().showSuccess('Department updated successfully');

            // Refresh data
            get().fetchDepartments();
            if (get().currentDepartment?.id === id) {
              get().fetchDepartmentById(id);
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update department';
            set((state) => {
              state.error = errorMessage;
              state.isUpdating = false;
            });
            useUIStore.getState().setLoading('updateDepartment', false);
            useUIStore.getState().showError('Failed to update department', errorMessage);
            throw error;
          }
        },

        deleteDepartment: async (id: number) => {
          try {
            // Optimistic update
            const previousDepartments = get().departments;
            set((state) => {
              state.departments = state.departments.filter(d => d.id !== id);
            });

            await departmentService.deleteDepartment(id);

            set((state) => {
              // Clear related data
              if (state.currentDepartment?.id === id) {
                state.currentDepartment = null;
              }
              delete state.lastFetch[`department-${id}`];
              delete state.lastFetch.departments;
            });

            useUIStore.getState().showSuccess('Department deleted successfully');
          } catch (error) {
            // Revert optimistic update
            set((state) => {
              state.departments = previousDepartments;
            });

            const errorMessage = error instanceof Error ? error.message : 'Failed to delete department';
            set((state) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to delete department', errorMessage);
            throw error;
          }
        },

        // Team management
        fetchTeams: async () => {
          try {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            useUIStore.getState().setLoading('fetchTeams', true);

            const teams = await teamService.getTeams();

            set((state) => {
              state.teams = teams;
              state.isLoading = false;
              state.lastFetch.teams = Date.now();
            });

            useUIStore.getState().setLoading('fetchTeams', false);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch teams';
            set((state) => {
              state.error = errorMessage;
              state.isLoading = false;
            });
            useUIStore.getState().setLoading('fetchTeams', false);
            useUIStore.getState().showError('Failed to load teams', errorMessage);
            throw error;
          }
        },

        fetchTeamById: async (id: number) => {
          try {
            const team = await teamService.getTeamWithMembers(id);

            set((state) => {
              state.currentTeam = team;
              state.lastFetch[`team-${id}`] = Date.now();
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch team';
            set((state) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to load team', errorMessage);
            throw error;
          }
        },

        createTeam: async (data) => {
          try {
            set((state) => {
              state.isCreating = true;
              state.error = null;
            });

            useUIStore.getState().setLoading('createTeam', true);

            const newTeam = await teamService.createTeam(data);

            set((state) => {
              state.isCreating = false;
              // Invalidate teams cache
              delete state.lastFetch.teams;
            });

            useUIStore.getState().setLoading('createTeam', false);
            useUIStore.getState().showSuccess('Team created successfully');

            // Refresh teams list
            get().fetchTeams();

            return newTeam;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create team';
            set((state) => {
              state.error = errorMessage;
              state.isCreating = false;
            });
            useUIStore.getState().setLoading('createTeam', false);
            useUIStore.getState().showError('Failed to create team', errorMessage);
            throw error;
          }
        },

        updateTeam: async (id: number, data) => {
          try {
            set((state) => {
              state.isUpdating = true;
              state.error = null;
            });

            useUIStore.getState().setLoading('updateTeam', true);

            await teamService.updateTeam(id, data);

            set((state) => {
              state.isUpdating = false;
              // Invalidate cache
              delete state.lastFetch.teams;
              delete state.lastFetch[`team-${id}`];
            });

            useUIStore.getState().setLoading('updateTeam', false);
            useUIStore.getState().showSuccess('Team updated successfully');

            // Refresh data
            get().fetchTeams();
            if (get().currentTeam?.id === id) {
              get().fetchTeamById(id);
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update team';
            set((state) => {
              state.error = errorMessage;
              state.isUpdating = false;
            });
            useUIStore.getState().setLoading('updateTeam', false);
            useUIStore.getState().showError('Failed to update team', errorMessage);
            throw error;
          }
        },

        deleteTeam: async (id: number) => {
          try {
            // Optimistic update
            const previousTeams = get().teams;
            set((state) => {
              state.teams = state.teams.filter(t => t.id !== id);
            });

            await teamService.deleteTeam(id);

            set((state) => {
              // Clear related data
              if (state.currentTeam?.id === id) {
                state.currentTeam = null;
              }
              delete state.lastFetch[`team-${id}`];
              delete state.lastFetch.teams;
            });

            useUIStore.getState().showSuccess('Team deleted successfully');
          } catch (error) {
            // Revert optimistic update
            set((state) => {
              state.teams = previousTeams;
            });

            const errorMessage = error instanceof Error ? error.message : 'Failed to delete team';
            set((state) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to delete team', errorMessage);
            throw error;
          }
        },

        assignUserToTeam: async (teamId: number, userId: number, role: string) => {
          try {
            await teamService.assignEmployee(teamId, { userId, role });

            // Refresh team data
            if (get().currentTeam?.id === teamId) {
              get().fetchTeamById(teamId);
            }

            useUIStore.getState().showSuccess('User assigned to team successfully');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to assign user to team';
            set((state) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to assign user to team', errorMessage);
            throw error;
          }
        },

        removeUserFromTeam: async (teamId: number, userId: number) => {
          try {
            await teamService.removeUserFromTeam(teamId, userId);

            // Refresh team data
            if (get().currentTeam?.id === teamId) {
              get().fetchTeamById(teamId);
            }

            useUIStore.getState().showSuccess('User removed from team successfully');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to remove user from team';
            set((state) => {
              state.error = errorMessage;
            });
            useUIStore.getState().showError('Failed to remove user from team', errorMessage);
            throw error;
          }
        },

        // Optimistic updates
        addUserOptimistic: (user) => {
          set((state) => {
            state.users.unshift(user);
          });
        },

        updateUserOptimistic: (id, data) => {
          set((state) => {
            const userIndex = state.users.findIndex(u => u.id === id);
            if (userIndex !== -1) {
              state.users[userIndex] = { ...state.users[userIndex], ...data };
            }
          });
        },

        removeUserOptimistic: (id) => {
          set((state) => {
            state.users = state.users.filter(u => u.id !== id);
          });
        },

        // Search and filters
        setSearchTerm: (term) => {
          set((state) => {
            state.searchTerm = term;
          });
        },

        setFilters: (filters) => {
          set((state) => {
            state.filters = { ...state.filters, ...filters };
          });
        },

        setPagination: (pagination) => {
          set((state) => {
            state.pagination = { ...state.pagination, ...pagination };
          });
        },

        // UI state management
        setError: (error) => {
          set((state) => {
            state.error = error;
          });
        },

        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },

        setLoading: (loading) => {
          set((state) => {
            state.isLoading = loading;
          });
        },

        // Cache management
        invalidateCache: (key) => {
          set((state) => {
            if (key) {
              delete state.lastFetch[key];
            } else {
              state.lastFetch = {};
            }
          });
        },

        clearCurrentUser: () => {
          set((state) => {
            state.currentUser = null;
          });
        },

        clearCurrentDepartment: () => {
          set((state) => {
            state.currentDepartment = null;
          });
        },

        clearCurrentTeam: () => {
          set((state) => {
            state.currentTeam = null;
          });
        },

        reset: () => {
          set((state) => {
            Object.assign(state, initialState);
          });
        },
      })),
      {
        name: 'UserStore',
      }
    )
  );

// Export selectors
export const userSelectors = {
  users: (state: UserStore) => state.users,
  currentUser: (state: UserStore) => state.currentUser,
  employees: (state: UserStore) => state.employees,
  evaluators: (state: UserStore) => state.evaluators,
  departments: (state: UserStore) => state.departments,
  currentDepartment: (state: UserStore) => state.currentDepartment,
  teams: (state: UserStore) => state.teams,
  currentTeam: (state: UserStore) => state.currentTeam,
  isLoading: (state: UserStore) => state.isLoading,
  error: (state: UserStore) => state.error,
  searchTerm: (state: UserStore) => state.searchTerm,
  filters: (state: UserStore) => state.filters,
  pagination: (state: UserStore) => state.pagination,
};

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { UIStore, LoadingStates, Notification, Modal } from '../types/ui';
import { persist, createAuthPersistConfig } from '../middleware/persist';
import { loggerWithActions } from '../middleware/logger';

const initialLoadingStates: LoadingStates = {
  global: false,
  login: false,
  logout: false,
  refreshAuth: false,
  fetchUsers: false,
  createUser: false,
  updateUser: false,
  deleteUser: false,
  fetchEvaluations: false,
  createEvaluation: false,
  updateEvaluation: false,
  submitEvaluation: false,
  fetchCriteria: false,
  createCriteria: false,
  updateCriteria: false,
  fetchDepartments: false,
  createDepartment: false,
  updateDepartment: false,
  fetchTeams: false,
  createTeam: false,
  updateTeam: false,
};

const initialState = {
  loading: initialLoadingStates,
  notifications: [],
  modals: [],
  sidebarOpen: true,
  sidebarCollapsed: false,
  theme: 'light' as const,
  layout: 'default' as const,
  pageTitle: '',
  breadcrumbs: [],
  formDirty: {},
  isOnline: true,
  optimisticUpdates: true,
};

let notificationId = 0;
let modalId = 0;

export const useUIStore = create<UIStore>()(
  loggerWithActions(
    persist(
      immer((set, get) => ({
          // Initial state
          ...initialState,

          // Loading state management
          setLoading: (key, loading) => {
            set((state) => {
              state.loading[key] = loading;
            });
          },

          setGlobalLoading: (loading) => {
            set((state) => {
              state.loading.global = loading;
            });
          },

          isLoading: (key) => {
            const state = get();
            if (key) {
              return state.loading[key];
            }
            // Check if any loading state is true
            return Object.values(state.loading).some(loading => loading);
          },

          // Notification management
          showNotification: (notification) => {
            const id = `notification-${++notificationId}`;
            const newNotification: Notification = {
              ...notification,
              id,
              createdAt: Date.now(),
              duration: notification.duration ?? 5000, // Default 5 seconds
            };

            set((state) => {
              state.notifications.push(newNotification);
            });

            // Auto-dismiss if duration is set
            if (newNotification.duration && newNotification.duration > 0) {
              setTimeout(() => {
                get().hideNotification(id);
              }, newNotification.duration);
            }

            return id;
          },

          hideNotification: (id) => {
            set((state) => {
              state.notifications = state.notifications.filter(n => n.id !== id);
            });
          },

          clearNotifications: () => {
            set((state) => {
              state.notifications = [];
            });
          },

          showSuccess: (title, message) => {
            return get().showNotification({
              type: 'success',
              title,
              message: message || '',
            });
          },

          showError: (title, message) => {
            return get().showNotification({
              type: 'error',
              title,
              message: message || '',
              duration: 8000, // Error messages stay longer
            });
          },

          showWarning: (title, message) => {
            return get().showNotification({
              type: 'warning',
              title,
              message: message || '',
            });
          },

          showInfo: (title, message) => {
            return get().showNotification({
              type: 'info',
              title,
              message: message || '',
            });
          },

          // Modal management
          showModal: (modal) => {
            const id = `modal-${++modalId}`;
            const newModal: Modal = {
              ...modal,
              id,
              closable: modal.closable ?? true,
              size: modal.size ?? 'md',
            };

            set((state) => {
              state.modals.push(newModal);
            });

            return id;
          },

          hideModal: (id) => {
            set((state) => {
              const modal = state.modals.find(m => m.id === id);
              if (modal?.onClose) {
                modal.onClose();
              }
              state.modals = state.modals.filter(m => m.id !== id);
            });
          },

          clearModals: () => {
            set((state) => {
              // Call onClose for all modals
              state.modals.forEach(modal => {
                if (modal.onClose) {
                  modal.onClose();
                }
              });
              state.modals = [];
            });
          },

          showConfirm: (title, content, onConfirm) => {
            return get().showModal({
              type: 'confirm',
              title,
              content,
              onConfirm,
              size: 'sm',
            });
          },

          // Sidebar management
          toggleSidebar: () => {
            set((state) => {
              state.sidebarOpen = !state.sidebarOpen;
            });
          },

          setSidebarOpen: (open) => {
            set((state) => {
              state.sidebarOpen = open;
            });
          },

          toggleSidebarCollapsed: () => {
            set((state) => {
              state.sidebarCollapsed = !state.sidebarCollapsed;
            });
          },

          setSidebarCollapsed: (collapsed) => {
            set((state) => {
              state.sidebarCollapsed = collapsed;
            });
          },

          // Theme management
          setTheme: (theme) => {
            set((state) => {
              state.theme = theme;
            });
            
            // Apply theme to document
            if (typeof document !== 'undefined') {
              document.documentElement.classList.toggle('dark', theme === 'dark');
            }
          },

          toggleTheme: () => {
            const currentTheme = get().theme;
            get().setTheme(currentTheme === 'light' ? 'dark' : 'light');
          },

          // Layout management
          setLayout: (layout) => {
            set((state) => {
              state.layout = layout;
            });
          },

          // Page state management
          setPageTitle: (title) => {
            set((state) => {
              state.pageTitle = title;
            });
            
            // Update document title
            if (typeof document !== 'undefined') {
              document.title = title ? `${title} - Performance Evaluation System` : 'Performance Evaluation System';
            }
          },

          setBreadcrumbs: (breadcrumbs) => {
            set((state) => {
              state.breadcrumbs = breadcrumbs;
            });
          },

          // Form state management
          setFormDirty: (formId, dirty) => {
            set((state) => {
              if (dirty) {
                state.formDirty[formId] = true;
              } else {
                delete state.formDirty[formId];
              }
            });
          },

          isFormDirty: (formId) => {
            return Boolean(get().formDirty[formId]);
          },

          clearFormDirty: (formId) => {
            set((state) => {
              if (formId) {
                delete state.formDirty[formId];
              } else {
                state.formDirty = {};
              }
            });
          },

          // Network state
          setOnlineStatus: (online) => {
            set((state) => {
              state.isOnline = online;
            });
            
            if (online) {
              get().showSuccess('Connection restored', 'You are back online');
            } else {
              get().showWarning('Connection lost', 'Working offline');
            }
          },

          // Performance settings
          setOptimisticUpdates: (enabled) => {
            set((state) => {
              state.optimisticUpdates = enabled;
            });
          },

          // Bulk actions
          resetUI: () => {
            set((state) => {
              Object.assign(state, {
                ...initialState,
                // Keep theme preference
                theme: state.theme,
                // Keep sidebar preferences
                sidebarCollapsed: state.sidebarCollapsed,
                // Keep performance settings
                optimisticUpdates: state.optimisticUpdates,
              });
            });
          },
        })),
        createPersistConfig('ui-store', {
          partialize: (state) => ({
            theme: state.theme,
            layout: state.layout,
            sidebarCollapsed: state.sidebarCollapsed,
            optimisticUpdates: state.optimisticUpdates,
            // Don't persist notifications, modals, or loading states
          }),
        })
      ),
      {
        name: 'UIStore',
      }
    )
  );

// Set up online/offline listeners
if (typeof window !== 'undefined') {
  const handleOnline = () => useUIStore.getState().setOnlineStatus(true);
  const handleOffline = () => useUIStore.getState().setOnlineStatus(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Set initial online status
  useUIStore.getState().setOnlineStatus(navigator.onLine);
}

// Apply theme on initialization
if (typeof document !== 'undefined') {
  const theme = useUIStore.getState().theme;
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

// Export selectors
export const uiSelectors = {
  loading: (state: UIStore) => state.loading,
  isLoading: (key?: keyof LoadingStates) => (state: UIStore) => {
    if (key) return state.loading[key];
    return Object.values(state.loading).some(loading => loading);
  },
  notifications: (state: UIStore) => state.notifications,
  modals: (state: UIStore) => state.modals,
  theme: (state: UIStore) => state.theme,
  sidebarOpen: (state: UIStore) => state.sidebarOpen,
  sidebarCollapsed: (state: UIStore) => state.sidebarCollapsed,
  pageTitle: (state: UIStore) => state.pageTitle,
  breadcrumbs: (state: UIStore) => state.breadcrumbs,
  isOnline: (state: UIStore) => state.isOnline,
};

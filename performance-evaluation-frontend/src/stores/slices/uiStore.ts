import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { UIStore, UIState, LoadingStates, Notification, Modal } from '../types/ui';
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
    immer((set, get) => ({
        // Initial state
        ...initialState,

        // Loading state management
        setLoading: (key: keyof LoadingStates, loading: boolean) => {
          set((state) => {
            state.loading[key] = loading;
          });
        },

        setGlobalLoading: (loading: boolean) => {
          set((state) => {
            state.loading.global = loading;
          });
        },

        isLoading: (key?: keyof LoadingStates) => {
          const state = get();
          if (key) {
            return state.loading[key];
          }
          // Check if any loading state is true
          return Object.values(state.loading).some((loading: unknown) => Boolean(loading));
        },

        // Notification management
        showNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => {
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

        hideNotification: (id: string) => {
          set((state) => {
            state.notifications = state.notifications.filter((n: Notification) => n.id !== id);
          });
        },

        clearNotifications: () => {
          set((state) => {
            state.notifications = [];
          });
        },

        showSuccess: (title: string, message?: string) => {
          return get().showNotification({
            type: 'success',
            title,
            message: message || '',
          });
        },

        showError: (title: string, message?: string) => {
          return get().showNotification({
            type: 'error',
            title,
            message: message || '',
            duration: 8000, // Error messages stay longer
          });
        },

        showWarning: (title: string, message?: string) => {
          return get().showNotification({
            type: 'warning',
            title,
            message: message || '',
          });
        },

        showInfo: (title: string, message?: string) => {
          return get().showNotification({
            type: 'info',
            title,
            message: message || '',
          });
        },

        // Modal management
        showModal: (modal: Omit<Modal, 'id'>) => {
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

        hideModal: (id?: string) => {
          set((state) => {
            let modalToHide: Modal | undefined;

            if (id) {
              modalToHide = state.modals.find((m: Modal) => m.id === id);
            } else {
              // If no id provided, hide the most recent modal
              modalToHide = state.modals[state.modals.length - 1];
            }

            if (modalToHide?.onClose) {
              modalToHide.onClose();
            }

            if (id) {
              state.modals = state.modals.filter((m: Modal) => m.id !== id);
            } else {
              state.modals.pop(); // Remove the last modal
            }
          });
        },

        clearModals: () => {
          set((state) => {
            // Call onClose for all modals
            state.modals.forEach((modal: Modal) => {
              if (modal.onClose) {
                modal.onClose();
              }
            });
            state.modals = [];
          });
        },

        showConfirm: (title: string, content: string, onConfirm: () => void) => {
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

        setSidebarOpen: (open: boolean) => {
          set((state) => {
            state.sidebarOpen = open;
          });
        },

        toggleSidebarCollapsed: () => {
          set((state) => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
          });
        },

        setSidebarCollapsed: (collapsed: boolean) => {
          set((state) => {
            state.sidebarCollapsed = collapsed;
          });
        },

        // Theme management
        setTheme: (theme: 'light' | 'dark') => {
          set((state) => {
            state.theme = theme;
          });
        },

        toggleTheme: () => {
          set((state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
          });
        },

        // Layout management
        setLayout: (layout: 'default' | 'compact') => {
          set((state) => {
            state.layout = layout;
          });
        },

        // Page state management
        setPageTitle: (title: string) => {
          set((state) => {
            state.pageTitle = title;
          });
        },

        setBreadcrumbs: (breadcrumbs: Array<{ label: string; href?: string }>) => {
          set((state) => {
            state.breadcrumbs = breadcrumbs;
          });
        },

        // Form state management
        setFormDirty: (formId: string, dirty: boolean) => {
          set((state) => {
            state.formDirty[formId] = dirty;
          });
        },

        isFormDirty: (formId: string) => {
          const state = get();
          return state.formDirty[formId] || false;
        },

        clearFormDirty: (formId?: string) => {
          set((state) => {
            if (formId) {
              delete state.formDirty[formId];
            } else {
              state.formDirty = {};
            }
          });
        },

        // Network state
        setOnlineStatus: (online: boolean) => {
          set((state) => {
            state.isOnline = online;
          });
        },

        // Performance settings
        setOptimisticUpdates: (enabled: boolean) => {
          set((state) => {
            state.optimisticUpdates = enabled;
          });
        },

        // Bulk actions
        resetUI: () => {
          set((state) => {
            Object.assign(state, initialState);
          });
        },
      }))
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

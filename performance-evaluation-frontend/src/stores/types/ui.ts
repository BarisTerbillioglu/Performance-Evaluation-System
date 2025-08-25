export interface LoadingStates {
  // Global loading
  global: boolean;
  
  // Auth loading
  login: boolean;
  logout: boolean;
  refreshAuth: boolean;
  
  // User operations
  fetchUsers: boolean;
  createUser: boolean;
  updateUser: boolean;
  deleteUser: boolean;
  
  // Evaluation operations
  fetchEvaluations: boolean;
  createEvaluation: boolean;
  updateEvaluation: boolean;
  submitEvaluation: boolean;
  
  // Criteria operations
  fetchCriteria: boolean;
  createCriteria: boolean;
  updateCriteria: boolean;
  
  // Department operations
  fetchDepartments: boolean;
  createDepartment: boolean;
  updateDepartment: boolean;
  
  // Team operations
  fetchTeams: boolean;
  createTeam: boolean;
  updateTeam: boolean;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // auto-dismiss after duration (ms), 0 = no auto-dismiss
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: number;
}

export interface Modal {
  id: string;
  type: 'confirm' | 'form' | 'info' | 'custom';
  title: string;
  content?: string;
  component?: React.ComponentType<any>;
  props?: Record<string, any>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  onClose?: () => void;
}

export interface UIState {
  // Loading states
  loading: LoadingStates;
  
  // Notifications
  notifications: Notification[];
  
  // Modals
  modals: Modal[];
  
  // Sidebar state
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  
  // Theme
  theme: 'light' | 'dark';
  
  // Layout
  layout: 'default' | 'compact';
  
  // Page state
  pageTitle: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
  
  // Form states
  formDirty: Record<string, boolean>;
  
  // Offline state
  isOnline: boolean;
  
  // Performance
  optimisticUpdates: boolean;
}

export interface UIActions {
  // Loading state management
  setLoading: (key: keyof LoadingStates, loading: boolean) => void;
  setGlobalLoading: (loading: boolean) => void;
  isLoading: (key?: keyof LoadingStates) => boolean;
  
  // Notification management
  showNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  hideNotification: (id: string) => void;
  clearNotifications: () => void;
  showSuccess: (title: string, message?: string) => string;
  showError: (title: string, message?: string) => string;
  showWarning: (title: string, message?: string) => string;
  showInfo: (title: string, message?: string) => string;
  
  // Modal management
  showModal: (modal: Omit<Modal, 'id'>) => string;
  hideModal: (id?: string) => void;
  clearModals: () => void;
  showConfirm: (title: string, content: string, onConfirm: () => void) => string;
  
  // Sidebar management
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Theme management
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  
  // Layout management
  setLayout: (layout: 'default' | 'compact') => void;
  
  // Page state management
  setPageTitle: (title: string) => void;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; href?: string }>) => void;
  
  // Form state management
  setFormDirty: (formId: string, dirty: boolean) => void;
  isFormDirty: (formId: string) => boolean;
  clearFormDirty: (formId?: string) => void;
  
  // Network state
  setOnlineStatus: (online: boolean) => void;
  
  // Performance settings
  setOptimisticUpdates: (enabled: boolean) => void;
  
  // Bulk actions
  resetUI: () => void;
}

export interface UIStore extends UIState, UIActions {}

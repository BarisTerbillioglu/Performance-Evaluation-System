/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_ENVIRONMENT: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_ANALYTICS_ID?: string
  readonly VITE_FEATURE_FLAGS?: string
  readonly VITE_DEBUG_MODE?: string
  readonly VITE_LOG_LEVEL?: string
  readonly VITE_CACHE_DURATION?: string
  readonly VITE_SESSION_TIMEOUT?: string
  readonly VITE_MAX_FILE_SIZE?: string
  readonly VITE_ALLOWED_FILE_TYPES?: string
  readonly VITE_RATE_LIMIT?: string
  readonly VITE_CORS_ORIGINS?: string
  readonly VITE_SSL_REQUIRED?: string
  readonly VITE_MAINTENANCE_MODE?: string
  readonly VITE_BACKUP_ENABLED?: string
  readonly VITE_MONITORING_ENABLED?: string
  readonly VITE_NOTIFICATIONS_ENABLED?: string
  readonly VITE_AUDIT_LOGGING?: string
  readonly VITE_DATA_RETENTION_DAYS?: string
  readonly VITE_BACKUP_RETENTION_DAYS?: string
  readonly VITE_SESSION_RETENTION_DAYS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Service Worker types
interface SyncManager {
  register(tag: string): Promise<void>
  getTags(): Promise<string[]>
}

interface ServiceWorkerRegistration {
  sync: SyncManager
  updateFound: boolean
  oncontrollerchange: ((this: ServiceWorkerRegistration, ev: Event) => any) | null
  onstatechange: ((this: ServiceWorkerRegistration, ev: Event) => any) | null
  getPushSubscription(): Promise<PushSubscription | null>
}

interface PushSubscription {
  unregister(): Promise<boolean>
}

// Performance API extensions
interface PerformanceEntry {
  processingStart?: number
}

// Toast types
interface Toast {
  action?: {
    label: string
    onClick: () => Promise<void>
  }
}

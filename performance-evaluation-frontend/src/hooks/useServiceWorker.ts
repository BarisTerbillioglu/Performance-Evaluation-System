import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

// Service Worker types - these should be defined in vite-env.d.ts
declare global {
  interface ServiceWorkerRegistration {
    sync: SyncManager;
    updateFound: boolean;
    oncontrollerchange: ((this: ServiceWorkerRegistration, ev: Event) => any) | null;
    onstatechange: ((this: ServiceWorkerRegistration, ev: Event) => any) | null;
    getPushSubscription(): Promise<PushSubscription | null>;
  }

  interface PushSubscription {
    unregister(): Promise<boolean>;
  }

  interface SyncManager {
    register(tag: string): Promise<void>;
    getTags(): Promise<string[]>;
  }
}

export const useServiceWorker = () => {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker is not supported');
      return;
    }

    // Register service worker
    const registerServiceWorker = async () => {
      try {
        const swRegistration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        setRegistration(swRegistration as ServiceWorkerRegistration);

        // Handle service worker updates
        swRegistration.addEventListener('updatefound', () => {
          const newWorker = swRegistration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setIsUpdateAvailable(true);
                showUpdateNotification();
              }
            });
          }
        });

        // Handle controller change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('Service Worker controller changed');
          window.location.reload();
        });

        // Handle service worker errors
        navigator.serviceWorker.addEventListener('error', (event) => {
          console.error('Service Worker error:', event);
        });

        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    // Handle online/offline status
    const handleOnline = () => {
      setIsOffline(false);
      toast.success('You are back online!');
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast.error('You are offline. Some features may not work.');
    };

    // Register event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker
    registerServiceWorker();

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show update notification
  const showUpdateNotification = () => {
    toast.success('New version available! Click to update.', {
      duration: 10000,
      position: 'top-right',
    });
  };

  // Update service worker
  const updateServiceWorker = async () => {
    if (registration && registration.waiting) {
      // Send message to waiting service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('Notifications are not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      toast.error('Notification permission denied');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  // Subscribe to push notifications
  const subscribeToPushNotifications = async () => {
    if (!registration) {
      console.warn('Service Worker not registered');
      return null;
    }

    const permission = await requestNotificationPermission();
    if (!permission) {
      return null;
    }

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY,
      });

      console.log('Push notification subscription:', subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  };

  // Unsubscribe from push notifications
  const unsubscribeFromPushNotifications = async () => {
    if (!registration) {
      return;
    }

    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      console.log('Unsubscribed from push notifications');
    }
  };

  // Send message to service worker
  const sendMessageToServiceWorker = (message: any) => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    }
  };

  // Cache API response
  const cacheApiResponse = (url: string, response: any) => {
    sendMessageToServiceWorker({
      type: 'CACHE_API_RESPONSE',
      url,
      response,
    });
  };

  // Get cache status
  const getCacheStatus = async () => {
    if (!registration) {
      return null;
    }

    try {
      const cacheNames = await caches.keys();
      const cacheStatus: Record<string, number> = {};

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        cacheStatus[cacheName] = keys.length;
      }

      return cacheStatus;
    } catch (error) {
      console.error('Failed to get cache status:', error);
      return null;
    }
  };

  // Clear all caches
  const clearAllCaches = async () => {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
      console.log('All caches cleared');
      toast.success('Cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear caches:', error);
      toast.error('Failed to clear cache');
    }
  };

  // Unregister service worker
  const unregisterServiceWorker = async () => {
    if (registration) {
      const unregistered = await registration.unregister();
      if (unregistered) {
        console.log('Service Worker unregistered');
        window.location.reload();
      }
    }
  };

  return {
    registration,
    isUpdateAvailable,
    isOffline,
    updateServiceWorker,
    requestNotificationPermission,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    sendMessageToServiceWorker,
    cacheApiResponse,
    getCacheStatus,
    clearAllCaches,
    unregisterServiceWorker,
  };
};

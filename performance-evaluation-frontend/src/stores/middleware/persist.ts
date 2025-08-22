import { StateCreator } from 'zustand';

// Simple persist middleware for Zustand
export type PersistOptions<T> = {
  name: string;
  storage?: Storage;
  partialize?: (state: T) => Partial<T>;
  version?: number;
  skipHydration?: boolean;
};

export type PersistImpl<T> = {
  persist: {
    clearStorage: () => void;
    rehydrate: () => void;
    hasHydrated: () => boolean;
  };
};

type Persist<T> = (
  initializer: StateCreator<T, [], [], T>,
  options: PersistOptions<T>
) => StateCreator<T & PersistImpl<T>, [], [], T & PersistImpl<T>>;

const persistImpl: Persist<any> = (initializer, options) => (set, get, api) => {
  const { name, storage = localStorage, partialize, skipHydration } = options;
  
  let hasHydrated = false;
  
  const getStorage = () => {
    try {
      return storage;
    } catch {
      return undefined;
    }
  };

  const serialize = (state: any) => {
    try {
      const stateToStore = partialize ? partialize(state) : state;
      return JSON.stringify(stateToStore);
    } catch {
      return undefined;
    }
  };

  const deserialize = (str: string) => {
    try {
      return JSON.parse(str);
    } catch {
      return undefined;
    }
  };

  const persistedState = (() => {
    const item = getStorage()?.getItem(name);
    if (!item) return undefined;
    return deserialize(item);
  })();

  const setState = (state: any, replace?: boolean) => {
    const newState = replace ? state : { ...get(), ...state };
    set(newState);
    
    const serializedState = serialize(newState);
    if (serializedState) {
      getStorage()?.setItem(name, serializedState);
    }
  };

  const rehydrate = () => {
    if (persistedState && !hasHydrated) {
      setState(persistedState, true);
      hasHydrated = true;
    }
  };

  const clearStorage = () => {
    getStorage()?.removeItem(name);
  };

  // Initialize the store
  const storeApi = initializer(setState, get, api);

  // Add persist methods
  const storeWithPersist = {
    ...storeApi,
    persist: {
      clearStorage,
      rehydrate,
      hasHydrated: () => hasHydrated,
    },
  };

  // Auto-rehydrate if not skipped
  if (!skipHydration) {
    rehydrate();
  }

  return storeWithPersist;
};

// Default auth persist configuration
export const createAuthPersistConfig = (): PersistOptions<any> => ({
  name: 'auth-store',
  partialize: (state: any) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    tokenExpiresAt: state.tokenExpiresAt,
    lastRefresh: state.lastRefresh,
  }),
});

export const persist = persistImpl;
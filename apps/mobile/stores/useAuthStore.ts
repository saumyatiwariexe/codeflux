import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthUser {
  userId: string;   // Clerk user ID
  email: string;
  displayName: string;
  imageUrl?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;

  // Actions
  setUser: (user: AuthUser | null) => void;
  signOut: () => Promise<void>;
  hydrateFromStorage: () => Promise<void>;
}

/**
 * Auth store — kept lean because Clerk's useAuth/useUser hooks
 * are the canonical source of truth for session state.
 * This store is only used for cross-component access to user data
 * (e.g., SquadUp profile cards) without threading props.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isHydrated: false,

  /**
   * Sets the local user state. Call this inside a Clerk hook listener
   * (e.g., useUser effect in _layout.tsx) to keep the store in sync.
   */
  setUser: (user) => {
    set({ user, isAuthenticated: user !== null, isLoading: false });
    if (user) {
      AsyncStorage.setItem('paladeium_user', JSON.stringify(user));
    } else {
      AsyncStorage.removeItem('paladeium_user');
    }
  },

  /**
   * Signs out by clearing local cache.
   * The actual Clerk session sign-out is done via `useClerk().signOut()` in the UI.
   */
  signOut: async () => {
    await AsyncStorage.removeItem('paladeium_user');
    set({ user: null, isAuthenticated: false });
  },

  /**
   * Hydrates the local user cache from AsyncStorage on app startup.
   * Clerk's token will still be validated server-side — this is UI-only pre-hydration.
   */
  hydrateFromStorage: async () => {
    set({ isLoading: true });
    try {
      const stored = await AsyncStorage.getItem('paladeium_user');
      if (stored) {
        const user: AuthUser = JSON.parse(stored);
        set({ user, isAuthenticated: true });
      }
    } catch {
      // Storage read failed — Clerk will handle session state
    } finally {
      set({ isLoading: false, isHydrated: true });
    }
  },
}));

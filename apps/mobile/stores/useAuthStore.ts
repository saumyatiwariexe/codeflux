import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthUser {
  userId: string;
  email: string;
  token: string;
  isNewUser: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;

  // Actions
  signIn: (user: AuthUser) => Promise<void>;
  signOut: () => Promise<void>;
  hydrateFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isHydrated: false,

  /**
   * Signs the user in by persisting their auth info to AsyncStorage
   * and updating global state.
   */
  signIn: async (user: AuthUser) => {
    await AsyncStorage.setItem('campus_pulse_auth', JSON.stringify(user));
    set({ user, isAuthenticated: true, isLoading: false });
  },

  /**
   * Signs the user out, clearing persisted storage and global state.
   */
  signOut: async () => {
    await AsyncStorage.removeItem('campus_pulse_auth');
    set({ user: null, isAuthenticated: false });
  },

  /**
   * Hydrates auth state from AsyncStorage on app startup.
   * Call this in the root layout's useEffect.
   */
  hydrateFromStorage: async () => {
    set({ isLoading: true });
    try {
      const stored = await AsyncStorage.getItem('campus_pulse_auth');
      if (stored) {
        const user: AuthUser = JSON.parse(stored);
        set({ user, isAuthenticated: true });
      }
    } catch {
      // Storage read failed — start fresh
    } finally {
      set({ isLoading: false, isHydrated: true });
    }
  },
}));

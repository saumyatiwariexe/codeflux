import { create } from 'zustand';

<<<<<<< Updated upstream
export interface AuthUser {
  userId: string;   // Clerk user ID
  email: string;
  displayName: string;
  imageUrl?: string;
=======
/**
 * UI-facing user profile stored in Zustand.
 * Auth tokens are managed entirely by Clerk — we never store them here.
 * This store is populated after sign-in by syncing from the Clerk user
 * object and the Supabase `profiles` row.
 */
export interface UserProfile {
  /** Clerk user ID — used as the primary key across the system */
  clerkUserId: string;
  /** The user's primary email from Clerk */
  email: string;
  /** Display name shown in UI */
  displayName: string;
  /** Public avatar URL (Supabase Storage or Clerk-provided) */
  avatarUrl: string | null;
  /** Unique handle (e.g. @john_doe) */
  handle: string | null;
  /** Campus XP points */
  campusXp: number;
  /** Whether the user has completed onboarding */
  onboardingComplete: boolean;
>>>>>>> Stashed changes
}

interface AuthState {
  /** The loaded user profile, or null if not signed in */
  userProfile: UserProfile | null;
  /** True while loading profile data after sign-in */
  isLoadingProfile: boolean;

  // Actions
<<<<<<< Updated upstream
  setUser: (user: AuthUser | null) => void;
  signOut: () => Promise<void>;
  hydrateFromStorage: () => Promise<void>;
}

/**
 * Auth store — kept lean because Clerk's useAuth/useUser hooks
 * are the canonical source of truth for session state.
 * This store is only used for cross-component access to user data
 * (e.g., SquadUp profile cards) without threading props.
=======
  setUserProfile: (profile: UserProfile) => void;
  clearUserProfile: () => void;
  setLoadingProfile: (loading: boolean) => void;
}

/**
 * Global auth/profile store.
 * Sign-in / sign-out is handled by Clerk hooks (`useAuth`, `useUser`).
 * This store is only responsible for caching the extended profile data
 * (Supabase row + Clerk user fields) for fast UI access.
>>>>>>> Stashed changes
 */
export const useAuthStore = create<AuthState>((set) => ({
  userProfile: null,
  isLoadingProfile: false,

  /**
<<<<<<< Updated upstream
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
=======
   * Sets the user profile after successful Clerk sign-in and
   * Supabase profile fetch.
   */
  setUserProfile: (profile: UserProfile) =>
    set({ userProfile: profile, isLoadingProfile: false }),

  /**
   * Clears the profile on sign-out.
   */
  clearUserProfile: () => set({ userProfile: null }),

  setLoadingProfile: (loading: boolean) => set({ isLoadingProfile: loading }),
>>>>>>> Stashed changes
}));

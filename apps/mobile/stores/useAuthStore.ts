import { create } from 'zustand';

export interface UserProfile {
  clerkUserId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  handle: string | null;
  campusXp: number;
  onboardingComplete: boolean;
}

export type AuthUser = UserProfile;

interface AuthState {
  user: UserProfile | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoadingProfile: boolean;
  setUser: (user: UserProfile | null) => void;
  setUserProfile: (profile: UserProfile) => void;
  clearUserProfile: () => void;
  setLoadingProfile: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userProfile: null,
  isAuthenticated: false,
  isLoadingProfile: false,

  setUser: (user) =>
    set({
      user,
      userProfile: user,
      isAuthenticated: user !== null,
      isLoadingProfile: false,
    }),

  setUserProfile: (profile: UserProfile) =>
    set({
      user: profile,
      userProfile: profile,
      isAuthenticated: true,
      isLoadingProfile: false,
    }),

  clearUserProfile: () =>
    set({
      user: null,
      userProfile: null,
      isAuthenticated: false,
      isLoadingProfile: false,
    }),

  setLoadingProfile: (loading: boolean) => set({ isLoadingProfile: loading }),
}));

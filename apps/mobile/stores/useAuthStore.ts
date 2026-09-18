import { create } from 'zustand';

export interface UserProfile {
  id: string; // Registration Number
  email: string;
  name?: string;
  displayName?: string;
  avatarUrl?: string | null;
  handle?: string | null;
  bio?: string;
  department?: string;
  year?: number;
  hostelBlock?: string;
  phoneNumber?: string;
  links?: any[];
  experiences?: any[];
  projects?: any[];
  socialHandles?: Record<string, string>;
  campusXp?: number;
  onboardingComplete?: boolean;
  token?: string;
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
  signOut: () => void;
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

  signOut: () =>
    set({
      user: null,
      userProfile: null,
      isAuthenticated: false,
      isLoadingProfile: false,
    }),
}));

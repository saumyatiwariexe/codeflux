// ============================================================
// Paladeium — API Service Layer (AMD-008)
// Token is now fetched from Clerk on each request instead of
// being stored statically. Pass a token getter via initApi().
// ============================================================

const BASE_URL = __DEV__
  ? (process.env.EXPO_PUBLIC_API_URL || 'https://paladeium-backend.loca.lt') + '/api/v1'
  : 'https://campus-pulse-api.railway.app/api/v1';

/** Global token stored in memory after login */
let _token: string | null = null;

/**
 * Call this to set the JWT token for all subsequent requests.
 */
export function setAuthToken(token: string | null): void {
  _token = token;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data: T | null; error: string | null }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true', // Bypasses localtunnel's abuse page
    ...(options.headers as Record<string, string>),
  };

  if (_token) {
    headers['Authorization'] = `Bearer ${_token}`;
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    const json = await res.json();
    return json;
  } catch (err) {
    return {
      success: false,
      data: null,
      error: 'Network error — check your connection',
    };
  }
}

import { supabase } from '../lib/supabase';

function decodeJWT(token: string) {
  try {
    const payload = token.split('.')[1];
    if (typeof atob === 'function') {
      return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    }
  } catch (e) {
    console.error("Decode err:", e);
  }
  return null;
}

// ---- Auth ----
export const authApi = {
  login: async (data: { regNo: string; password: string }) => {
    try {
      // 1. Fetch real LPU Auth token directly from mobile device!
      const res = await fetch('https://mobileapi.lpu.in/security/createToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 11; Pixel 4) LPUTouch/23.45'
        },
        body: JSON.stringify({ Username: data.regNo, Password: data.password, DEVICE_ID: "Paladeium-App" })
      });
      const tokenData = await res.json();
      
      if (tokenData.status === true && tokenData.token) {
         const decoded = decodeJWT(tokenData.token);
         
         // 2. Upsert User in Supabase (Uses the Service Key in lib/supabase.ts to bypass RLS)
         await supabase.from('users').upsert({ id: data.regNo, lpu_email: `${data.regNo}@lpu.in`, is_active: true });
         
         // 3. Check profile and create if missing
         const { data: profile } = await supabase.from('profiles').select('id, onboarding_complete').eq('id', data.regNo).maybeSingle();
         if (!profile) {
            await supabase.from('profiles').insert({ id: data.regNo, handle: `user_${data.regNo}`, display_name: decoded?.Name || data.regNo });
         }
         
         return {
           success: true,
           data: {
             userId: data.regNo,
             token: tokenData.token,
             isNewUser: !profile?.onboarding_complete,
             name: decoded?.Name || data.regNo
           }
         };
      } else {
         return { success: false, error: tokenData.message || "Invalid LPU credentials" };
      }
    } catch (err) {
      return { success: false, error: "Network Error hitting LPU server" };
    }
  },
  logout: () => Promise.resolve({ success: true, data: null, error: null }),
};

// ---- Users ----
export const usersApi = {
  getMe: async () => {
    const { useAuthStore } = require('../stores/useAuthStore');
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return { success: false, error: 'Not logged in' };
    
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) return { success: false, error: error.message };
    
    return { success: true, data: { ...data, squadVisibility: data.squad_visibility } };
  },
  updateMe: async (data: Partial<any>) => {
    const { useAuthStore } = require('../stores/useAuthStore');
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return { success: false, error: 'Not logged in' };

    const profileData = {
      id: userId,
      bio: data.bio,
      onboarding_complete: data.onboardingComplete !== undefined ? data.onboardingComplete : undefined,
      handle: data.socialHandles?.github || userId,
      display_name: data.displayName || 'Paladeium User',
    };

    const { error } = await supabase.from('profiles').upsert(profileData);
    if (error) return { success: false, error: error.message };

    return { success: true, data: { ...data } };
  },
  getProfile: (handle: string) => request<any>(`/users/${handle}`),
};

// ---- SquadUp ----
export const squadApi = {
  getDeck: () => request<any[]>('/squad/deck'),
  swipe: (targetId: string, action: 'like' | 'pass' | 'super', context = 'general') =>
    request<{ isMatch: boolean; action: string; targetId: string }>('/squad/swipe', {
      method: 'POST',
      body: JSON.stringify({ targetId, action, context }),
    }),
  getMatches: () => request<any[]>('/squad/matches'),
};

// ---- Events ----
export const eventsApi = {
  list: (params?: { category?: string; status?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<any[]>(`/events${qs ? '?' + qs : ''}`);
  },
  getById: (id: string) => request<any>(`/events/${id}`),
  rsvp: (id: string) =>
    request<{ bookingId: string; qrCode: string }>(`/events/${id}/rsvp`, {
      method: 'POST',
    }),
};

// ---- Quests ----
export const questsApi = {
  list: () => request<any[]>('/quests'),
  leaderboard: () => request<any[]>('/quests/leaderboard'),
  verify: (questId: string, lat: number, lng: number) =>
    request<any>(`/quests/${questId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ lat, lng }),
    }),
};

// ---- EduRev ----
export const edurevApi = {
  getHistory: () => request<any[]>('/edurev/history'),
  getBenefits: () => request<any>('/edurev/benefits'),
  logAchievement: (data: { title: string; description: string }) =>
    request<any>('/edurev/achievement', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ---- Clubs ----
export const clubsApi = {
  list: (params?: { category?: string; recruiting?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<any[]>(`/clubs${qs ? '?' + qs : ''}`);
  },
  getBySlug: (slug: string) => request<any>(`/clubs/${slug}`),
};

// ---- Lost & Found ----
export const lostfoundApi = {
  getLost: () => request<any[]>('/lostfound/lost'),
  getFound: () => request<any[]>('/lostfound/found'),
  reportLost: (data: any) =>
    request<any>('/lostfound/lost', { method: 'POST', body: JSON.stringify(data) }),
  reportFound: (data: any) =>
    request<any>('/lostfound/found', { method: 'POST', body: JSON.stringify(data) }),
  getMatches: () => request<any[]>('/lostfound/matches'),
};

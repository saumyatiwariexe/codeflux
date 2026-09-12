// ============================================================
// Paladeium — API Service Layer (Mock-first)
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const debuggerHost = Constants.expoConfig?.hostUri;
let localIp = debuggerHost ? debuggerHost.split(':')[0] : '10.33.3.166';
if (Platform.OS === 'android') {
  localIp = '10.33.3.166'; // Hardcode host IP for reliable Android physical device connection
}

const BASE_URL = __DEV__
  ? `http://${localIp}:3000/api/v1`
  : 'https://campus-pulse-api.railway.app/api/v1';

let authToken: string | null = null;

/** Call this after sign-in to attach the token to all future requests */
export function setAuthToken(token: string | null) {
  authToken = token;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data: T | null; error: string | null }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
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

// ---- Auth ----
export const authApi = {
  sendOtp: (email: string) =>
    request<{ expiresIn: number; devOtp?: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyOtp: (email: string, otp: string) =>
    request<{ token: string; userId: string; isNewUser: boolean }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  logout: () => request<void>('/auth/logout', { method: 'DELETE' }),
};

// ---- Users ----
export const usersApi = {
  getMe: () => request<any>('/users/me'),
  updateMe: (data: Partial<any>) =>
    request<any>('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
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

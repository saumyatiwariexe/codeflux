// ============================================================
// Paladeium — API Service Layer (AMD-008)
// Token is now fetched from Clerk on each request instead of
// being stored statically. Pass a token getter via initApi().
// ============================================================

const BASE_URL = __DEV__
  ? 'http://localhost:3000/api/v1'
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

// ---- Auth ----
export const authApi = {
  login: async (data: { regNo: string; password: string }) => {
    // Mocking the response so you can test the UI without running the backend!
    console.log("Mocking login for:", data.regNo);
    return {
      success: true,
      data: {
        userId: 'mock-user-id',
        name: 'Test Student',
        token: 'mock-jwt-token',
        isNewUser: true // Set to true so it routes you to the Onboarding/Signup screen!
      }
    };
  },
  logout: () => request<any>('/auth/logout', { method: 'POST' }),
};

// ---- Users ----
export const usersApi = {
  getMe: () => request<any>('/users/me'),
  updateMe: async (data: Partial<any>) => {
    console.log("Mocking updateMe with data:", data);
    return {
      success: true,
      data: { ...data }
    };
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

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach Privy token to every request automatically
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = 'Bearer ' + token
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

// ── Users ──────────────────────────────────────────
export const usersApi = {
  me: () => api.get('/users/me'),
  getById: (id: string) => api.get('/users/' + id),
  create: (data: { display_name: string; email?: string; wallet_address?: string; referral_code?: string }) =>
    api.post('/users', data),
  updateMe: (data: { display_name: string }) => api.patch('/users/me', data),
}

// ── Passports ─────────────────────────────────────
export const passportsApi = {
  get: (user_id: string) => api.get('/passports/' + user_id),
  mint: (data: { user_id: string; passport_type: string; team_code?: string }) =>
    api.post('/passports/mint', data),
}

// ── Quests ─────────────────────────────────────────
export const questsApi = {
  list: (params?: { status?: string; quest_type?: string; limit?: number }) =>
    api.get('/quests', { params }),
  getById: (id: string) => api.get('/quests/' + id),
  complete: (quest_id: string, metadata?: object) =>
    api.post('/quests/' + quest_id + '/complete', { metadata }),
  myCompletions: () => api.get('/quests/completions/list'),
}

// ── Badges ─────────────────────────────────────────
export const badgesApi = {
  list: (params?: { badge_type?: string }) => api.get('/badges', { params }),
  myBadges: (user_id: string) => api.get('/badges/holdings?user_id=' + user_id),
}

// ── Leaderboard ────────────────────────────────────
export const leaderboardApi = {
  get: (params?: { scope?: string; team_code?: string; limit?: number }) =>
    api.get('/leaderboard', { params }),
  myRank: (user_id: string, scope = 'overall') =>
    api.get('/leaderboard/rank?user_id=' + user_id + '&scope=' + scope),
}

// ── Points ─────────────────────────────────────────
export const pointsApi = {
  get: (user_id: string) => api.get('/points/' + user_id),
}

// ── Watch Parties ──────────────────────────────────
export const watchPartiesApi = {
  list: (params?: { match_id?: string }) => api.get('/watch-parties', { params }),
  getById: (id: string) => api.get('/watch-parties/' + id),
  create: (data: object) => api.post('/watch-parties', data),
  checkin: (party_id: string, host_code: string) =>
    api.post('/watch-parties/' + party_id + '/checkin', { host_code }),
}

// ── Referrals ──────────────────────────────────────
export const referralsApi = {
  getLink: (user_id: string) => api.get('/referrals/link?user_id=' + user_id),
  getStats: (user_id: string) => api.get('/referrals/stats?user_id=' + user_id),
}

import { create } from 'zustand'

interface User {
  id: string
  display_name: string
  wallet_address: string | null
  passport_type: string | null
  team_code: string | null
  status_tier: string
  points: number
  referral_code: string
  created_at: string
}

interface UserStore {
  user: User | null
  isLoading: boolean
  isOnboarded: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setOnboarded: (onboarded: boolean) => void
  reset: () => void
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoading: true,
  isOnboarded: false,
  setUser: (user) => set({ user, isOnboarded: !!user?.passport_type }),
  setLoading: (isLoading) => set({ isLoading }),
  setOnboarded: (isOnboarded) => set({ isOnboarded }),
  reset: () => set({ user: null, isLoading: false, isOnboarded: false }),
}))

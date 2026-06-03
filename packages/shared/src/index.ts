// Shared types across all FanCurva apps

export type PassportType = 'team' | 'host_city' | 'tournament' | 'creator'

export type StatusTier = 'supporter' | 'true_fan' | 'ultras' | 'legend'

export type QuestType =
  | 'match_checkin'
  | 'trivia'
  | 'prediction'
  | 'reaction'
  | 'watch_party_join'
  | 'watch_party_host'
  | 'referral'
  | 'badge_collect'
  | 'social_share'
  | 'sponsored'
  | 'neutral_fan'

export interface User {
  id: string
  display_name: string
  wallet_address: string
  passport_type: PassportType
  team_code: string | null
  status_tier: StatusTier
  points: number
  created_at: string
}

export interface Quest {
  id: string
  title: string
  description: string
  quest_type: QuestType
  points_reward: number
  badge_id: string | null
  starts_at: string
  expires_at: string
  is_sponsored: boolean
}

export interface Badge {
  id: string
  token_id: number
  name: string
  description: string
  image_uri: string
  is_soulbound: boolean
  badge_type: string
}

export const STATUS_TIERS = {
  supporter: { min: 0, max: 499, label: 'Supporter' },
  true_fan: { min: 500, max: 1499, label: 'True Fan' },
  ultras: { min: 1500, max: 3499, label: 'Ultras' },
  legend: { min: 3500, max: null, label: 'Legend' },
}

export const POINT_VALUES = {
  mint_passport: 100,
  first_quest: 50,
  match_checkin: 20,
  trivia_correct: 10,
  trivia_streak: 50,
  reaction_post: 15,
  prediction_correct: 30,
  badge_collect: 25,
  watch_party_join: 30,
  watch_party_host: 60,
  referral: 75,
}

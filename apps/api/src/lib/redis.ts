import { createClient } from 'redis'
import 'dotenv/config'

const client = createClient({
  url: process.env.UPSTASH_REDIS_URL || 'redis://localhost:6379',
})

client.on('error', (err) => console.error('Redis error:', err))
client.on('connect', () => console.log('Redis connected'))

await client.connect()

export const redis = client

// ── Leaderboard helpers ────────────────────────────

export const leaderboard = {
  // Add or update a user score
  addScore: (scope: string, userId: string, points: number) =>
    client.zAdd(`leaderboard:${scope}`, [{ score: points, value: userId }]),

  // Get top N users
  getTop: (scope: string, limit: number) =>
    client.zRangeWithScores(`leaderboard:${scope}`, 0, limit - 1, { REV: true }),

  // Get a user rank (0-indexed)
  getRank: (scope: string, userId: string) =>
    client.zRevRank(`leaderboard:${scope}`, userId),

  // Get a user score
  getScore: (scope: string, userId: string) =>
    client.zScore(`leaderboard:${scope}`, userId),

  // Increment score
  incrementScore: (scope: string, userId: string, by: number) =>
    client.zIncrBy(`leaderboard:${scope}`, by, userId),
}

export default client

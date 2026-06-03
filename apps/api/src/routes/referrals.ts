import { Hono } from 'hono'
import { db } from '../lib/db'

const referrals = new Hono()

// ── Point structure ────────────────────────────────
// Diminishing returns on quantity
const REFERRAL_TIER_POINTS = [
  { upTo: 3,  points: 75 },  // 1st-3rd referral
  { upTo: 7,  points: 40 },  // 4th-7th
  { upTo: 15, points: 15 },  // 8th-15th
  { upTo: Infinity, points: 5 }, // 16th+
]

// Quality depth rewards (awarded as referred user hits milestones)
const QUALITY_REWARDS = {
  signup:        10,  // referred user signs up
  passport_mint: 20,  // referred user mints passport
  quests_5:      30,  // referred user completes 5 quests
  true_fan_tier: 50,  // referred user reaches true_fan status
}

function getReferralPoints(existingConversions: number): number {
  let tier = REFERRAL_TIER_POINTS[REFERRAL_TIER_POINTS.length - 1]
  for (const t of REFERRAL_TIER_POINTS) {
    if (existingConversions < t.upTo) {
      tier = t
      break
    }
  }
  return tier.points
}

// ── GET /referrals/link ────────────────────────────
referrals.get('/link', async (c) => {
  const user_id = c.req.query('user_id')
  if (!user_id) {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'user_id is required' } }, 422)
  }

  const result = await db.query('SELECT referral_code FROM users WHERE id = $1', [user_id])
  if (result.rows.length === 0) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'User not found' } }, 404)
  }

  const code = result.rows[0].referral_code
  const base_url = process.env.APP_URL || 'http://localhost:5173'

  return c.json({
    data: {
      referral_code: code,
      referral_url: base_url + '/join?ref=' + code,
      reward_structure: {
        note: 'Points decrease as you refer more people. Quality of referrals matters more than quantity.',
        tiers: [
          { referrals: '1st to 3rd', points_each: 75 },
          { referrals: '4th to 7th', points_each: 40 },
          { referrals: '8th to 15th', points_each: 15 },
          { referrals: '16th+', points_each: 5 },
        ],
        quality_bonuses: [
          { milestone: 'Friend mints passport', bonus: 20 },
          { milestone: 'Friend completes 5 quests', bonus: 30 },
          { milestone: 'Friend reaches True Fan', bonus: 50 },
        ]
      }
    }
  })
})

// ── GET /referrals/stats ───────────────────────────
referrals.get('/stats', async (c) => {
  const user_id = c.req.query('user_id')
  if (!user_id) {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'user_id is required' } }, 422)
  }

  const result = await db.query(
    'SELECT status, COUNT(*) as count FROM referrals WHERE referrer_id = $1 GROUP BY status',
    [user_id]
  )

  const pointsResult = await db.query(
    'SELECT COALESCE(SUM(points), 0) as total FROM point_transactions WHERE user_id = $1 AND reason LIKE \'referral%\'',
    [user_id]
  )

  const stats = { total: 0, converted: 0, pending: 0 }
  result.rows.forEach((row: any) => {
    stats.total += Number(row.count)
    if (row.status === 'converted') stats.converted = Number(row.count)
    if (row.status === 'pending') stats.pending = Number(row.count)
  })

  // What points they would earn for next referral
  const nextReferralPoints = getReferralPoints(stats.converted)

  // Rank on inviters leaderboard (by converted referrals, not total)
  const rankResult = await db.query(
    'SELECT rank FROM (SELECT referrer_id, RANK() OVER (ORDER BY COUNT(*) DESC) as rank FROM referrals WHERE status = \'converted\' GROUP BY referrer_id) r WHERE referrer_id = $1',
    [user_id]
  )

  return c.json({
    data: {
      total_referrals: stats.total,
      converted_referrals: stats.converted,
      pending_referrals: stats.pending,
      total_points_from_referrals: Number(pointsResult.rows[0].total),
      next_referral_worth: nextReferralPoints,
      rank_on_inviters_leaderboard: rankResult.rows[0]?.rank || null,
      note: stats.converted >= 15
        ? 'You are in the high-volume tier. Focus on quality — depth bonuses still apply.'
        : 'Keep inviting genuine fans to unlock better rewards.'
    }
  })
})

// ── POST /referrals/convert ────────────────────────
referrals.post('/convert', async (c) => {
  const body = await c.req.json()
  const { new_user_id, referral_code } = body

  if (!new_user_id || !referral_code) {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'new_user_id and referral_code are required' } }, 422)
  }

  // Find referrer
  const referrerResult = await db.query('SELECT id FROM users WHERE referral_code = $1', [referral_code])
  if (referrerResult.rows.length === 0) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Invalid referral code' } }, 404)
  }

  const referrer_id = referrerResult.rows[0].id

  if (referrer_id === new_user_id) {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'Cannot refer yourself' } }, 422)
  }

  // Check not already referred
  const existing = await db.query('SELECT id FROM referrals WHERE referred_id = $1', [new_user_id])
  if (existing.rows.length > 0) {
    return c.json({ error: { code: 'ALREADY_EXISTS', message: 'User already referred' } }, 409)
  }

  // Count referrer existing conversions to determine tier
  const conversionCount = await db.query(
    'SELECT COUNT(*) as count FROM referrals WHERE referrer_id = $1 AND status = \'converted\'',
    [referrer_id]
  )
  const existingConversions = Number(conversionCount.rows[0].count)
  const referrerPoints = getReferralPoints(existingConversions)

  // Create referral record
  const referral = await db.query(
    'INSERT INTO referrals (referrer_id, referred_id, status, converted_at, points_awarded) VALUES ($1, $2, \'converted\', NOW(), $3) RETURNING *',
    [referrer_id, new_user_id, referrerPoints]
  )

  // Update referred_by on new user
  await db.query('UPDATE users SET referred_by = $1 WHERE id = $2', [referrer_id, new_user_id])

  // Award tiered points to referrer (signup milestone = base points)
  const signupBonus = QUALITY_REWARDS.signup
  const totalReferrerPoints = referrerPoints + signupBonus

  await db.query('UPDATE users SET points = points + $1, updated_at = NOW() WHERE id = $2', [totalReferrerPoints, referrer_id])
  await db.query(
    'INSERT INTO point_transactions (user_id, points, reason, reference_id) VALUES ($1, $2, $3, $4)',
    [referrer_id, referrerPoints, 'referral_conversion', new_user_id]
  )
  await db.query(
    'INSERT INTO point_transactions (user_id, points, reason, reference_id) VALUES ($1, $2, $3, $4)',
    [referrer_id, signupBonus, 'referral_quality_signup', new_user_id]
  )

  // Welcome bonus to new user (fixed — not affected by tiers)
  const welcomeBonus = 50
  await db.query('UPDATE users SET points = points + $1, updated_at = NOW() WHERE id = $2', [welcomeBonus, new_user_id])
  await db.query(
    'INSERT INTO point_transactions (user_id, points, reason, reference_id) VALUES ($1, $2, $3, $4)',
    [new_user_id, welcomeBonus, 'referral_welcome_bonus', referrer_id]
  )

  return c.json({
    data: {
      referral_id: referral.rows[0].id,
      referrer_id,
      new_user_id,
      referrer_points_awarded: totalReferrerPoints,
      breakdown: {
        base_referral: referrerPoints,
        signup_quality_bonus: signupBonus,
        tier_note: existingConversions < 3 ? 'Top tier (1-3 referrals)' :
                   existingConversions < 7 ? 'Second tier (4-7 referrals)' :
                   existingConversions < 15 ? 'Third tier (8-15 referrals)' : 'Base tier (16+)'
      },
      new_user_welcome_bonus: welcomeBonus,
      converted_at: referral.rows[0].converted_at
    }
  })
})

// ── POST /referrals/milestone ──────────────────────
// Called internally when a referred user hits a quality milestone
referrals.post('/milestone', async (c) => {
  const body = await c.req.json()
  const { user_id, milestone } = body

  const validMilestones = ['passport_mint', 'quests_5', 'true_fan_tier']
  if (!user_id || !validMilestones.includes(milestone)) {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'user_id and valid milestone required' } }, 422)
  }

  // Find who referred this user
  const referralResult = await db.query(
    'SELECT r.referrer_id, r.id FROM referrals r WHERE r.referred_id = $1 AND r.status = \'converted\'',
    [user_id]
  )

  if (referralResult.rows.length === 0) {
    return c.json({ data: { message: 'User was not referred, no bonus awarded' } })
  }

  const referrer_id = referralResult.rows[0].referrer_id
  const referral_id = referralResult.rows[0].id

  // Check milestone not already awarded
  const alreadyAwarded = await db.query(
    'SELECT id FROM point_transactions WHERE user_id = $1 AND reason = $2 AND reference_id = $3',
    [referrer_id, 'referral_quality_' + milestone, user_id]
  )

  if (alreadyAwarded.rows.length > 0) {
    return c.json({ data: { message: 'Milestone already rewarded' } })
  }

  const bonusPoints = QUALITY_REWARDS[milestone as keyof typeof QUALITY_REWARDS]

  // Award quality bonus to referrer
  await db.query('UPDATE users SET points = points + $1, updated_at = NOW() WHERE id = $2', [bonusPoints, referrer_id])
  await db.query(
    'INSERT INTO point_transactions (user_id, points, reason, reference_id) VALUES ($1, $2, $3, $4)',
    [referrer_id, bonusPoints, 'referral_quality_' + milestone, user_id]
  )

  return c.json({
    data: {
      referrer_id,
      referred_user_id: user_id,
      milestone,
      bonus_points_awarded: bonusPoints,
    }
  })
})

export default referrals

import { Hono } from 'hono'
import { db } from '../lib/db'
import { requireAuth } from '../middleware/auth'

const users = new Hono()

// GET /users/me — get current authenticated user
users.get('/me', requireAuth, async (c) => {
  const privy_id = c.get('privy_user_id')

  const result = await db.query(
    'SELECT id, display_name, wallet_address, passport_type, team_code, status_tier, points, referral_code, created_at FROM users WHERE privy_id = $1',
    [privy_id]
  )

  if (result.rows.length === 0) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'User not found. Please complete signup.' } }, 404)
  }

  return c.json({ data: result.rows[0] })
})

// GET /users/:id — public profile
users.get('/:id', async (c) => {
  const id = c.req.param('id')
  const result = await db.query(
    'SELECT id, display_name, passport_type, team_code, status_tier, points, referral_code, created_at FROM users WHERE id = $1',
    [id]
  )
  if (result.rows.length === 0) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'User not found' } }, 404)
  }
  return c.json({ data: result.rows[0] })
})

// POST /users — create or sync user from Privy (called after login)
users.post('/', requireAuth, async (c) => {
  const privy_id = c.get('privy_user_id')
  const body = await c.req.json()
  const { display_name, email, wallet_address, referral_code } = body

  if (!display_name) return c.json({ error: { code: 'INVALID_INPUT', message: 'display_name required' } }, 422)

  const new_referral_code = Math.random().toString(36).substring(2, 10).toUpperCase()

  const sql = 'INSERT INTO users (privy_id, display_name, email, wallet_address, referral_code) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (privy_id) DO UPDATE SET display_name = EXCLUDED.display_name, email = EXCLUDED.email, updated_at = NOW() RETURNING id, display_name, wallet_address, passport_type, team_code, status_tier, points, referral_code, created_at'
  const result = await db.query(sql, [privy_id, display_name, email || null, wallet_address || null, new_referral_code])
  const newUser = result.rows[0]

  // Auto-convert referral if code was passed
  if (referral_code) {
    try {
      const referrerResult = await db.query('SELECT id FROM users WHERE referral_code = $1', [referral_code])
      if (referrerResult.rows.length > 0) {
        const referrer_id = referrerResult.rows[0].id
        if (referrer_id !== newUser.id) {
          const existing = await db.query('SELECT id FROM referrals WHERE referred_id = $1', [newUser.id])
          if (existing.rows.length === 0) {
            const countResult = await db.query(
              "SELECT COUNT(*) as count FROM referrals WHERE referrer_id = $1 AND status = 'converted'",
              [referrer_id]
            )
            const existingConversions = Number(countResult.rows[0].count)
            const tiers = [
              { upTo: 3, points: 75 },
              { upTo: 7, points: 40 },
              { upTo: 15, points: 15 },
              { upTo: Infinity, points: 5 },
            ]
            let referrerPoints = 5
            for (const t of tiers) {
              if (existingConversions < t.upTo) { referrerPoints = t.points; break }
            }
            const totalReferrerPoints = referrerPoints + 10
            await db.query(
              "INSERT INTO referrals (referrer_id, referred_id, status, converted_at, points_awarded) VALUES ($1, $2, 'converted', NOW(), $3)",
              [referrer_id, newUser.id, totalReferrerPoints]
            )
            await db.query('UPDATE users SET referred_by = $1 WHERE id = $2', [referrer_id, newUser.id])
            await db.query('UPDATE users SET points = points + $1, updated_at = NOW() WHERE id = $2', [totalReferrerPoints, referrer_id])
            await db.query('INSERT INTO point_transactions (user_id, points, reason, reference_id) VALUES ($1, $2, $3, $4)', [referrer_id, referrerPoints, 'referral_conversion', newUser.id])
            await db.query('INSERT INTO point_transactions (user_id, points, reason, reference_id) VALUES ($1, $2, $3, $4)', [referrer_id, 10, 'referral_quality_signup', newUser.id])
            await db.query('UPDATE users SET points = points + 50, updated_at = NOW() WHERE id = $1', [newUser.id])
            await db.query('INSERT INTO point_transactions (user_id, points, reason, reference_id) VALUES ($1, 50, $2, $3)', [newUser.id, 'referral_welcome_bonus', referrer_id])
            const refreshed = await db.query('SELECT points FROM users WHERE id = $1', [newUser.id])
            newUser.points = refreshed.rows[0].points
            newUser.referred_by = referrer_id
          }
        }
      }
    } catch (err) {
      console.error('[REFERRAL ERROR]', err)
    }
  }

  return c.json({ data: newUser }, 201)
})

// PATCH /users/me — update own profile
users.patch('/me', requireAuth, async (c) => {
  const privy_id = c.get('privy_user_id')
  const body = await c.req.json()
  const { display_name } = body

  const result = await db.query(
    'UPDATE users SET display_name = $1, updated_at = NOW() WHERE privy_id = $2 RETURNING id, display_name, status_tier, points',
    [display_name, privy_id]
  )

  if (result.rows.length === 0) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'User not found' } }, 404)
  }

  return c.json({ data: result.rows[0] })
})

export default users

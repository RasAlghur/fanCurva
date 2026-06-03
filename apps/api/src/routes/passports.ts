import { Hono } from 'hono'
import { db } from '../lib/db'

const passports = new Hono()

// GET /passports/:user_id
passports.get('/:user_id', async (c) => {
  const user_id = c.req.param('user_id')

  const result = await db.query(
    'SELECT p.*, u.display_name, u.team_code, u.status_tier, u.points FROM passports p JOIN users u ON p.user_id = u.id WHERE p.user_id = $1',
    [user_id]
  )

  if (result.rows.length === 0) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Passport not found' } }, 404)
  }

  // Get badge count
  const badgeCount = await db.query(
    'SELECT COUNT(*) as count FROM badge_holdings WHERE user_id = $1',
    [user_id]
  )

  return c.json({
    data: {
      ...result.rows[0],
      badge_count: Number(badgeCount.rows[0].count)
    }
  })
})

// POST /passports/mint
passports.post('/mint', async (c) => {
  const body = await c.req.json()
  const { user_id, passport_type, team_code, display_name } = body

  if (!user_id || !passport_type) {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'user_id and passport_type are required' } }, 422)
  }

  const validTypes = ['team', 'host_city', 'tournament', 'creator']
  if (!validTypes.includes(passport_type)) {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'Invalid passport_type' } }, 422)
  }

  if (passport_type === 'team' && !team_code) {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'team_code is required for team passport' } }, 422)
  }

  // Check user exists
  const userResult = await db.query('SELECT id FROM users WHERE id = $1', [user_id])
  if (userResult.rows.length === 0) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'User not found' } }, 404)
  }

  // Check already has passport
  const existing = await db.query('SELECT id FROM passports WHERE user_id = $1', [user_id])
  if (existing.rows.length > 0) {
    return c.json({ error: { code: 'ALREADY_EXISTS', message: 'User already has a passport' } }, 409)
  }

  // Update user team and passport type
  await db.query(
    'UPDATE users SET passport_type = $1, team_code = $2, updated_at = NOW() WHERE id = $3',
    [passport_type, team_code || null, user_id]
  )

  // Create passport record
  const result = await db.query(
    'INSERT INTO passports (user_id, passport_type, team_code) VALUES ($1, $2, $3) RETURNING *',
    [user_id, passport_type, team_code || null]
  )

  const passport = result.rows[0]

  // Award passport mint points (100 pts)
  await db.query(
    'UPDATE users SET points = points + 100, updated_at = NOW() WHERE id = $1',
    [user_id]
  )

  await db.query(
    'INSERT INTO point_transactions (user_id, points, reason, reference_id) VALUES ($1, $2, $3, $4)',
    [user_id, 100, 'passport_mint', passport.id]
  )

  return c.json({
    data: {
      passport_id: passport.id,
      user_id,
      passport_type,
      team_code: team_code || null,
      status: 'minted',
      points_awarded: 100,
      created_at: passport.created_at,
    }
  }, 201)
})

export default passports

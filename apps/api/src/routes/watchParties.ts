import { Hono } from 'hono'
import { db } from '../lib/db'
import { requireAuth } from '../middleware/auth'

type Variables = {
  privy_user_id: string
}

const watchParties = new Hono<{ Variables: Variables }>()

// GET /watch-parties — public
watchParties.get('/', async (c) => {
  const match_id = c.req.query('match_id')
  const type = c.req.query('type')
  const limit = Number(c.req.query('limit')) || 20
  const offset = Number(c.req.query('offset')) || 0

  const conditions: string[] = []
  const params: any[] = []

  if (match_id) {
    params.push(match_id)
    conditions.push('wp.match_id = $' + params.length)
  }
  if (type) {
    params.push(type)
    conditions.push('wp.type = $' + params.length)
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''
  params.push(limit)
  params.push(offset)

  const sql = [
    'SELECT wp.*, u.display_name as host_name,',
    'COUNT(wpc.id) as attendee_count',
    'FROM watch_parties wp',
    'JOIN users u ON wp.host_user_id = u.id',
    'LEFT JOIN watch_party_checkins wpc ON wpc.party_id = wp.id',
    where,
    'GROUP BY wp.id, u.display_name',
    'ORDER BY wp.created_at DESC',
    'LIMIT $' + (params.length - 1),
    'OFFSET $' + params.length,
  ].join(' ')

  const result = await db.query(sql, params)
  return c.json({ data: result.rows, count: result.rowCount })
})

// GET /watch-parties/:id — public
watchParties.get('/:id', async (c) => {
  const id = c.req.param('id')

  const result = await db.query(
    'SELECT wp.*, u.display_name as host_name FROM watch_parties wp JOIN users u ON wp.host_user_id = u.id WHERE wp.id = $1',
    [id]
  )

  if (result.rows.length === 0) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Watch party not found' } }, 404)
  }

  const attendees = await db.query(
    'SELECT u.id, u.display_name, wpc.checked_in_at FROM watch_party_checkins wpc JOIN users u ON wpc.user_id = u.id WHERE wpc.party_id = $1 ORDER BY wpc.checked_in_at ASC',
    [id]
  )

  return c.json({ data: { ...result.rows[0], attendees: attendees.rows } })
})

// POST /watch-parties — auth required
watchParties.post('/', requireAuth, async (c) => {
  const privy_id = c.get('privy_user_id')
  const body = await c.req.json()
  const { match_id, name, type, location, streaming_url, max_attendees } = body

  if (!match_id || !name) {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'match_id and name are required' } }, 422)
  }

  // Get user from privy_id
  const userResult = await db.query('SELECT id FROM users WHERE privy_id = $1', [privy_id])
  if (userResult.rows.length === 0) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'User not found' } }, 404)
  }
  const host_user_id = userResult.rows[0].id

  const host_code = Math.random().toString(36).substring(2, 8).toUpperCase()
  const result = await db.query(
    "INSERT INTO watch_parties (host_user_id, match_id, name, type, location, streaming_url, host_code, max_attendees, checkin_opens_at, checkin_closes_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW() + INTERVAL '3 hours') RETURNING *",
    [host_user_id, match_id, name, type || 'in_person', location ? JSON.stringify(location) : null, streaming_url || null, host_code, max_attendees || null]
  )
  // Award host points
  await db.query('UPDATE users SET points = points + 60, updated_at = NOW() WHERE id = $1', [host_user_id])
  await db.query(
    'INSERT INTO point_transactions (user_id, points, reason, reference_id) VALUES ($1, $2, $3, $4)',
    [host_user_id, 60, 'watch_party_host', result.rows[0].id]
  )

  return c.json({ data: result.rows[0] }, 201)
})

// POST /watch-parties/:id/checkin — auth required
watchParties.post('/:id/checkin', requireAuth, async (c) => {
  const party_id = c.req.param('id')
  const privy_id = c.get('privy_user_id')
  const body = await c.req.json()
  const { host_code } = body

  if (!host_code) {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'host_code is required' } }, 422)
  }

  // Get user from privy_id
  const userResult = await db.query('SELECT id FROM users WHERE privy_id = $1', [privy_id])
  if (userResult.rows.length === 0) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'User not found' } }, 404)
  }
  const user_id = userResult.rows[0].id

  // Validate party and host code
  const partyResult = await db.query('SELECT * FROM watch_parties WHERE id = $1', [party_id])
  if (partyResult.rows.length === 0) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Watch party not found' } }, 404)
  }

  const party = partyResult.rows[0]

  if (party.host_code !== host_code) {
    return c.json({ error: { code: 'INVALID_CODE', message: 'Invalid host code' } }, 403)
  }

  // Check max attendees
  if (party.max_attendees) {
    const countResult = await db.query(
      'SELECT COUNT(*) as count FROM watch_party_checkins WHERE party_id = $1',
      [party_id]
    )
    if (Number(countResult.rows[0].count) >= party.max_attendees) {
      return c.json({ error: { code: 'PARTY_FULL', message: 'Watch party is full' } }, 409)
    }
  }

  // Check already checked in
  const existing = await db.query(
    'SELECT id FROM watch_party_checkins WHERE party_id = $1 AND user_id = $2',
    [party_id, user_id]
  )
  if (existing.rows.length > 0) {
    return c.json({ error: { code: 'ALREADY_EXISTS', message: 'Already checked in' } }, 409)
  }

  // Record checkin
  const checkin = await db.query(
    'INSERT INTO watch_party_checkins (party_id, user_id) VALUES ($1, $2) RETURNING *',
    [party_id, user_id]
  )

  // Award points
  await db.query('UPDATE users SET points = points + 30, updated_at = NOW() WHERE id = $1', [user_id])
  await db.query(
    'INSERT INTO point_transactions (user_id, points, reason, reference_id) VALUES ($1, $2, $3, $4)',
    [user_id, 30, 'watch_party_join', party_id]
  )

  return c.json({
    data: {
      checkin_id: checkin.rows[0].id,
      party_id,
      user_id,
      points_awarded: 30,
      checked_in_at: checkin.rows[0].checked_in_at,
    }
  })
})

export default watchParties

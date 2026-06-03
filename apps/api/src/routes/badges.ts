import { Hono } from 'hono'
import { db } from '../lib/db'

const badges = new Hono()

// GET /badges — list all badges
badges.get('/', async (c) => {
  const badge_type = c.req.query('badge_type')
  const available = c.req.query('available')
  const limit = Number(c.req.query('limit')) || 20
  const offset = Number(c.req.query('offset')) || 0

  const conditions: string[] = []
  const params: any[] = []

  if (badge_type) {
    params.push(badge_type)
    conditions.push('badge_type = $' + params.length)
  }

  if (available === 'true') {
    const now = new Date().toISOString()
    params.push(now)
    conditions.push('available_from <= $' + params.length)
    params.push(now)
    conditions.push('available_until >= $' + params.length)
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''
  params.push(limit)
  params.push(offset)

  const result = await db.query(
    'SELECT * FROM badges ' + where + ' ORDER BY created_at DESC LIMIT $' + (params.length - 1) + ' OFFSET $' + params.length,
    params
  )

  return c.json({ data: result.rows, count: result.rowCount })
})

// GET /badges/holdings?user_id=x
badges.get('/holdings', async (c) => {
  const user_id = c.req.query('user_id')

  if (!user_id) {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'user_id is required' } }, 422)
  }

  const result = await db.query(
    'SELECT bh.*, b.name, b.description, b.image_uri, b.badge_type, b.is_soulbound FROM badge_holdings bh JOIN badges b ON bh.badge_id = b.id WHERE bh.user_id = $1 ORDER BY bh.minted_at DESC',
    [user_id]
  )

  return c.json({ data: result.rows, count: result.rowCount })
})

// GET /badges/:id
badges.get('/:id', async (c) => {
  const id = c.req.param('id')
  const result = await db.query('SELECT * FROM badges WHERE id = $1', [id])
  if (result.rows.length === 0) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Badge not found' } }, 404)
  }
  return c.json({ data: result.rows[0] })
})

// POST /badges — create badge definition (admin)
badges.post('/', async (c) => {
  const body = await c.req.json()
  const { name, description, image_uri, badge_type, is_soulbound, max_supply, available_from, available_until, attributes } = body

  if (!name || !badge_type) {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'name and badge_type are required' } }, 422)
  }

  const result = await db.query(
    'INSERT INTO badges (name, description, image_uri, badge_type, is_soulbound, max_supply, available_from, available_until, attributes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
    [name, description || null, image_uri || null, badge_type, is_soulbound !== false, max_supply || null, available_from || null, available_until || null, JSON.stringify(attributes || [])]
  )

  return c.json({ data: result.rows[0] }, 201)
})

// POST /badges/:id/award — award badge to user (admin / quest system)
badges.post('/:id/award', async (c) => {
  const badge_id = c.req.param('id')
  const body = await c.req.json()
  const { user_id } = body

  if (!user_id) {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'user_id is required' } }, 422)
  }

  // Check badge exists
  const badgeResult = await db.query('SELECT * FROM badges WHERE id = $1', [badge_id])
  if (badgeResult.rows.length === 0) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Badge not found' } }, 404)
  }

  const badge = badgeResult.rows[0]

  // Check max supply
  if (badge.max_supply && badge.minted_count >= badge.max_supply) {
    return c.json({ error: { code: 'BADGE_SUPPLY_EXHAUSTED', message: 'Max supply reached' } }, 409)
  }

  // Check already holds
  const existing = await db.query(
    'SELECT id FROM badge_holdings WHERE user_id = $1 AND badge_id = $2',
    [user_id, badge_id]
  )
  if (existing.rows.length > 0) {
    return c.json({ error: { code: 'ALREADY_EXISTS', message: 'User already holds this badge' } }, 409)
  }

  // Award badge
  const holding = await db.query(
    'INSERT INTO badge_holdings (user_id, badge_id) VALUES ($1, $2) RETURNING *',
    [user_id, badge_id]
  )

  // Increment minted count
  await db.query(
    'UPDATE badges SET minted_count = minted_count + 1 WHERE id = $1',
    [badge_id]
  )

  return c.json({ data: holding.rows[0] }, 201)
})

export default badges

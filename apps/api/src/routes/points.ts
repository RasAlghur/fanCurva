import { Hono } from 'hono'
import { db } from '../lib/db'

type Variables = { privy_user_id: string }
const points = new Hono<{ Variables: Variables }>()

// GET /points/:user_id
points.get('/:user_id', async (c) => {
  const user_id = c.req.param('user_id')

  const result = await db.query(
    'SELECT id, display_name, points, status_tier FROM users WHERE id = $1',
    [user_id]
  )

  if (result.rows.length === 0) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'User not found' } }, 404)
  }

  const rankResult = await db.query(
    'SELECT rank FROM (SELECT id, RANK() OVER (ORDER BY points DESC) AS rank FROM users) r WHERE id = $1',
    [user_id]
  )

  const teamRankResult = await db.query(
    'SELECT rank FROM (SELECT id, RANK() OVER (PARTITION BY team_code ORDER BY points DESC) AS rank FROM users) r WHERE id = $1',
    [user_id]
  )

  return c.json({
    data: {
      user_id,
      total_points: result.rows[0].points,
      status_tier: result.rows[0].status_tier,
      rank_overall: rankResult.rows[0]?.rank || null,
      rank_team: teamRankResult.rows[0]?.rank || null,
    }
  })
})

// POST /points/award — admin only
points.post('/award', async (c) => {
  const body = await c.req.json()
  const { user_id, points: pts, reason, reference_id } = body

  if (!user_id || !pts || !reason) {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'user_id, points, and reason are required' } }, 422)
  }

  await db.query(
    'UPDATE users SET points = points + $1, updated_at = NOW() WHERE id = $2',
    [pts, user_id]
  )

  await db.query(
    'INSERT INTO point_transactions (user_id, points, reason, reference_id) VALUES ($1, $2, $3, $4)',
    [user_id, pts, reason, reference_id || null]
  )

  const result = await db.query('SELECT points, status_tier FROM users WHERE id = $1', [user_id])

  return c.json({
    data: {
      user_id,
      points_awarded: pts,
      total_points: result.rows[0].points,
      status_tier: result.rows[0].status_tier,
    }
  })
})

export default points

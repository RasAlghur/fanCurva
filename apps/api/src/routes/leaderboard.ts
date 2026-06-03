import { Hono } from 'hono'
import { db } from '../lib/db'

const leaderboard = new Hono()

// GET /leaderboard
leaderboard.get('/', async (c) => {
  const scope = c.req.query('scope') || 'overall'
  const team_code = c.req.query('team_code')
  const limit = Number(c.req.query('limit')) || 100
  const offset = Number(c.req.query('offset')) || 0

  let where = ''
  const params: any[] = []

  if (scope === 'team' && team_code) {
    params.push(team_code)
    where = 'WHERE u.team_code = $1'
  } else if (scope === 'host_country' && team_code) {
    const hostCountries = ['US', 'CA', 'MX']
    if (!hostCountries.includes(team_code)) {
      return c.json({ error: { code: 'INVALID_INPUT', message: 'Invalid host country. Use US, CA, or MX' } }, 422)
    }
    params.push(team_code)
    where = 'WHERE u.team_code = $1'
  }

  params.push(limit)
  params.push(offset)

  const sql = [
    'SELECT u.id, u.display_name, u.team_code, u.passport_type, u.status_tier, u.points,',
    'COUNT(bh.id) AS badge_count,',
    'RANK() OVER (ORDER BY u.points DESC) AS rank',
    'FROM users u',
    'LEFT JOIN badge_holdings bh ON bh.user_id = u.id',
    where,
    'GROUP BY u.id',
    'ORDER BY u.points DESC',
    'LIMIT $' + (params.length - 1),
    'OFFSET $' + params.length,
  ].join(' ')

  const result = await db.query(sql, params)
  return c.json({
    data: {
      scope,
      team_code: team_code || null,
      entries: result.rows,
      updated_at: new Date().toISOString(),
    }
  })
})

// GET /leaderboard/rank?user_id=x&scope=overall
leaderboard.get('/rank', async (c) => {
  const user_id = c.req.query('user_id')
  const scope = c.req.query('scope') || 'overall'

  if (!user_id) {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'user_id is required' } }, 422)
  }

  const result = await db.query(
    'SELECT rank FROM (SELECT id, RANK() OVER (ORDER BY points DESC) AS rank FROM users) ranked WHERE id = $1',
    [user_id]
  )

  if (result.rows.length === 0) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'User not found' } }, 404)
  }

  return c.json({ data: { user_id, scope, rank: result.rows[0].rank } })
})

export default leaderboard

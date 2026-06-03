import { Hono } from 'hono'
import { db } from '../lib/db'
import { requireAuth } from '../middleware/auth'

const quests = new Hono()

async function checkAndAwardReferralMilestone(user_id: string, milestone: string) {
  try {
    const referralResult = await db.query(
      "SELECT referrer_id FROM referrals WHERE referred_id = $1 AND status = 'converted'",
      [user_id]
    )
    if (referralResult.rows.length === 0) return
    const referrer_id = referralResult.rows[0].referrer_id
    const alreadyAwarded = await db.query(
      'SELECT id FROM point_transactions WHERE user_id = $1 AND reason = $2 AND reference_id = $3',
      [referrer_id, 'referral_quality_' + milestone, user_id]
    )
    if (alreadyAwarded.rows.length > 0) return
    const bonusMap: Record<string, number> = { quests_5: 30, true_fan_tier: 50 }
    const bonus = bonusMap[milestone]
    if (!bonus) return
    await db.query('UPDATE users SET points = points + $1, updated_at = NOW() WHERE id = $2', [bonus, referrer_id])
    await db.query(
      'INSERT INTO point_transactions (user_id, points, reason, reference_id) VALUES ($1, $2, $3, $4)',
      [referrer_id, bonus, 'referral_quality_' + milestone, user_id]
    )
  } catch (err) {
    console.error('[REFERRAL MILESTONE ERROR]', err)
  }
}

// GET /quests — public
quests.get('/', async (c) => {
  const status = c.req.query('status') || 'active'
  const quest_type = c.req.query('quest_type')
  const limit = Number(c.req.query('limit')) || 20
  const offset = Number(c.req.query('offset')) || 0
  const conditions: string[] = ['q.is_active = true']
  const params: any[] = []
  if (status === 'active') {
    params.push(new Date().toISOString())
    conditions.push('q.starts_at <= $' + params.length)
    params.push(new Date().toISOString())
    conditions.push('q.expires_at >= $' + params.length)
  }
  if (quest_type) {
    params.push(quest_type)
    conditions.push('q.quest_type = $' + params.length)
  }
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''
  params.push(limit)
  params.push(offset)
  const sql = ['SELECT q.* FROM quests q', where, 'ORDER BY q.starts_at DESC', 'LIMIT $' + (params.length - 1), 'OFFSET $' + params.length].join(' ')
  const result = await db.query(sql, params)
  return c.json({ data: result.rows, count: result.rowCount })
})

// GET /quests/completions/list — auth required
quests.get('/completions/list', requireAuth, async (c) => {
  const privy_id = c.get('privy_user_id')
  const limit = Number(c.req.query('limit')) || 50
  const offset = Number(c.req.query('offset')) || 0
  const userResult = await db.query('SELECT id FROM users WHERE privy_id = $1', [privy_id])
  if (userResult.rows.length === 0) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'User not found' } }, 404)
  }
  const user_id = userResult.rows[0].id
  const result = await db.query(
    'SELECT qc.*, q.title, q.quest_type, q.points_reward FROM quest_completions qc JOIN quests q ON qc.quest_id = q.id WHERE qc.user_id = $1 ORDER BY qc.completed_at DESC LIMIT $2 OFFSET $3',
    [user_id, limit, offset]
  )
  return c.json({ data: result.rows, count: result.rowCount })
})

// GET /quests/:id — public
quests.get('/:id', async (c) => {
  const id = c.req.param('id')
  const result = await db.query('SELECT * FROM quests WHERE id = $1', [id])
  if (result.rows.length === 0) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Quest not found' } }, 404)
  }
  return c.json({ data: result.rows[0] })
})

// POST /quests/:id/complete — auth required
quests.post('/:id/complete', requireAuth, async (c) => {
  const quest_id = c.req.param('id')
  const privy_id = c.get('privy_user_id')

  // Get user from privy_id
  const userResult = await db.query('SELECT id FROM users WHERE privy_id = $1', [privy_id])
  if (userResult.rows.length === 0) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'User not found' } }, 404)
  }
  const user_id = userResult.rows[0].id

  const body = await c.req.json().catch(() => ({}))
  const { metadata } = body

  const questResult = await db.query('SELECT * FROM quests WHERE id = $1', [quest_id])
  if (questResult.rows.length === 0) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Quest not found' } }, 404)
  }

  const quest = questResult.rows[0]
  const now = new Date()

  if (now < new Date(quest.starts_at)) {
    return c.json({ error: { code: 'QUEST_NOT_STARTED', message: 'Quest has not started yet' } }, 400)
  }
  if (now > new Date(quest.expires_at)) {
    return c.json({ error: { code: 'QUEST_EXPIRED', message: 'Quest has expired' } }, 410)
  }

  const existing = await db.query(
    'SELECT id FROM quest_completions WHERE user_id = $1 AND quest_id = $2',
    [user_id, quest_id]
  )
  if (existing.rows.length > 0) {
    return c.json({ error: { code: 'QUEST_ALREADY_COMPLETE', message: 'Quest already completed' } }, 409)
  }

  const completion = await db.query(
    'INSERT INTO quest_completions (user_id, quest_id, points_awarded, metadata) VALUES ($1, $2, $3, $4) RETURNING *',
    [user_id, quest_id, quest.points_reward, metadata ? JSON.stringify(metadata) : '{}']
  )

  await db.query('UPDATE users SET points = points + $1, updated_at = NOW() WHERE id = $2', [quest.points_reward, user_id])
  await db.query(
    'INSERT INTO point_transactions (user_id, points, reason, reference_id) VALUES ($1, $2, $3, $4)',
    [user_id, quest.points_reward, 'quest_completion', quest_id]
  )

  const updatedUser = await db.query('SELECT points FROM users WHERE id = $1', [user_id])
  const totalPoints = updatedUser.rows[0].points
  let status_tier = 'supporter'
  if (totalPoints >= 3500) status_tier = 'legend'
  else if (totalPoints >= 1500) status_tier = 'ultras'
  else if (totalPoints >= 500) status_tier = 'true_fan'

  await db.query('UPDATE users SET status_tier = $1 WHERE id = $2', [status_tier, user_id])

  const completionCount = await db.query('SELECT COUNT(*) as count FROM quest_completions WHERE user_id = $1', [user_id])
  const totalCompletions = Number(completionCount.rows[0].count)

  if (totalCompletions === 5) await checkAndAwardReferralMilestone(user_id, 'quests_5')
  if (status_tier === 'true_fan') await checkAndAwardReferralMilestone(user_id, 'true_fan_tier')

  return c.json({
    data: {
      completion_id: completion.rows[0].id,
      quest_id,
      user_id,
      points_awarded: quest.points_reward,
      completed_at: completion.rows[0].completed_at,
      new_status_tier: status_tier,
      total_completions: totalCompletions,
    }
  })
})

export default quests

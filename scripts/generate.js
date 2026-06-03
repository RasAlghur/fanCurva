const fs = require('fs')

// Updated users POST to handle referral code at signup
const usersRoute = `import { Hono } from 'hono'
import { db } from '../lib/db'

const users = new Hono()

users.get("/:id", async (c) => {
  const id = c.req.param("id")
  const result = await db.query(
    "SELECT id, display_name, wallet_address, passport_type, team_code, status_tier, points, referral_code, created_at FROM users WHERE id = $1",
    [id]
  )
  if (result.rows.length === 0) {
    return c.json({ error: { code: "NOT_FOUND", message: "User not found" } }, 404)
  }
  return c.json({ data: result.rows[0] })
})

users.post("/", async (c) => {
  const body = await c.req.json()
  const { privy_id, display_name, email, wallet_address, referral_code } = body

  if (!privy_id) return c.json({ error: { code: "INVALID_INPUT", message: "privy_id required" } }, 422)
  if (!display_name) return c.json({ error: { code: "INVALID_INPUT", message: "display_name required" } }, 422)

  const new_referral_code = Math.random().toString(36).substring(2, 10).toUpperCase()

  const sql = "INSERT INTO users (privy_id, display_name, email, wallet_address, referral_code) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (privy_id) DO UPDATE SET display_name = EXCLUDED.display_name, email = EXCLUDED.email, updated_at = NOW() RETURNING id, display_name, wallet_address, passport_type, team_code, status_tier, points, referral_code, created_at"
  const result = await db.query(sql, [privy_id, display_name, email || null, wallet_address || null, new_referral_code])
  const newUser = result.rows[0]

  // If a referral code was passed in the signup URL, convert it automatically
  if (referral_code) {
    try {
      // Find referrer
      const referrerResult = await db.query("SELECT id FROM users WHERE referral_code = $1", [referral_code])
      if (referrerResult.rows.length > 0) {
        const referrer_id = referrerResult.rows[0].id

        // Avoid self referral
        if (referrer_id !== newUser.id) {
          // Check not already referred
          const existing = await db.query("SELECT id FROM referrals WHERE referred_id = $1", [newUser.id])
          if (existing.rows.length === 0) {
            // Count referrer existing conversions for tier calculation
            const countResult = await db.query(
              "SELECT COUNT(*) as count FROM referrals WHERE referrer_id = $1 AND status = 'converted'",
              [referrer_id]
            )
            const existingConversions = Number(countResult.rows[0].count)

            // Diminishing returns tiers
            const tiers = [
              { upTo: 3,   points: 75 },
              { upTo: 7,   points: 40 },
              { upTo: 15,  points: 15 },
              { upTo: Infinity, points: 5 },
            ]
            let referrerPoints = 5
            for (const t of tiers) {
              if (existingConversions < t.upTo) { referrerPoints = t.points; break }
            }

            const signupBonus = 10
            const totalReferrerPoints = referrerPoints + signupBonus

            // Create referral record
            await db.query(
              "INSERT INTO referrals (referrer_id, referred_id, status, converted_at, points_awarded) VALUES ($1, $2, 'converted', NOW(), $3)",
              [referrer_id, newUser.id, totalReferrerPoints]
            )

            // Update referred_by
            await db.query("UPDATE users SET referred_by = $1 WHERE id = $2", [referrer_id, newUser.id])

            // Award points to referrer
            await db.query("UPDATE users SET points = points + $1, updated_at = NOW() WHERE id = $2", [totalReferrerPoints, referrer_id])
            await db.query(
              "INSERT INTO point_transactions (user_id, points, reason, reference_id) VALUES ($1, $2, 'referral_conversion', $3)",
              [referrer_id, referrerPoints, newUser.id]
            )
            await db.query(
              "INSERT INTO point_transactions (user_id, points, reason, reference_id) VALUES ($1, $2, 'referral_quality_signup', $3)",
              [referrer_id, signupBonus, newUser.id]
            )

            // Welcome bonus to new user
            await db.query("UPDATE users SET points = points + 50, updated_at = NOW() WHERE id = $1", [newUser.id])
            await db.query(
              "INSERT INTO point_transactions (user_id, points, reason, reference_id) VALUES ($1, 50, 'referral_welcome_bonus', $2)",
              [newUser.id, referrer_id]
            )

            // Refresh user points
            const refreshed = await db.query("SELECT points FROM users WHERE id = $1", [newUser.id])
            newUser.points = refreshed.rows[0].points
            newUser.referred_by = referrer_id
          }
        }
      }
    } catch (err) {
      // Referral error should never block signup — log and continue
      console.error("[REFERRAL ERROR]", err)
    }
  }

  return c.json({ data: newUser }, 201)
})

users.patch("/:id", async (c) => {
  const id = c.req.param("id")
  const body = await c.req.json()
  const { display_name } = body
  const result = await db.query(
    "UPDATE users SET display_name = $1, updated_at = NOW() WHERE id = $2 RETURNING id, display_name, status_tier, points",
    [display_name, id]
  )
  if (result.rows.length === 0) {
    return c.json({ error: { code: "NOT_FOUND", message: "User not found" } }, 404)
  }
  return c.json({ data: result.rows[0] })
})

export default users
`

// Updated quests completion to auto-trigger referral milestones
const questsRoute = `import { Hono } from 'hono'
import { db } from '../lib/db'

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
      "SELECT id FROM point_transactions WHERE user_id = $1 AND reason = $2 AND reference_id = $3",
      [referrer_id, 'referral_quality_' + milestone, user_id]
    )
    if (alreadyAwarded.rows.length > 0) return

    const bonusMap: Record<string, number> = {
      quests_5: 30,
      true_fan_tier: 50,
    }
    const bonus = bonusMap[milestone]
    if (!bonus) return

    await db.query("UPDATE users SET points = points + $1, updated_at = NOW() WHERE id = $2", [bonus, referrer_id])
    await db.query(
      "INSERT INTO point_transactions (user_id, points, reason, reference_id) VALUES ($1, $2, $3, $4)",
      [referrer_id, bonus, 'referral_quality_' + milestone, user_id]
    )
    console.log('[REFERRAL MILESTONE]', milestone, 'awarded', bonus, 'pts to', referrer_id)
  } catch (err) {
    console.error('[REFERRAL MILESTONE ERROR]', err)
  }
}

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

quests.get('/completions/list', async (c) => {
  const user_id = c.req.query('user_id')
  const limit = Number(c.req.query('limit')) || 50
  const offset = Number(c.req.query('offset')) || 0

  if (!user_id) {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'user_id is required' } }, 422)
  }

  const result = await db.query(
    'SELECT qc.*, q.title, q.quest_type, q.points_reward FROM quest_completions qc JOIN quests q ON qc.quest_id = q.id WHERE qc.user_id = $1 ORDER BY qc.completed_at DESC LIMIT $2 OFFSET $3',
    [user_id, limit, offset]
  )
  return c.json({ data: result.rows, count: result.rowCount })
})

quests.get('/:id', async (c) => {
  const id = c.req.param('id')
  const result = await db.query('SELECT * FROM quests WHERE id = $1', [id])
  if (result.rows.length === 0) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Quest not found' } }, 404)
  }
  return c.json({ data: result.rows[0] })
})

quests.post('/:id/complete', async (c) => {
  const quest_id = c.req.param('id')
  const body = await c.req.json()
  const { user_id, metadata } = body

  if (!user_id) {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'user_id is required' } }, 422)
  }

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

  // Record completion
  const completion = await db.query(
    'INSERT INTO quest_completions (user_id, quest_id, points_awarded, metadata) VALUES ($1, $2, $3, $4) RETURNING *',
    [user_id, quest_id, quest.points_reward, metadata ? JSON.stringify(metadata) : '{}']
  )

  // Award points
  await db.query('UPDATE users SET points = points + $1, updated_at = NOW() WHERE id = $2', [quest.points_reward, user_id])
  await db.query(
    'INSERT INTO point_transactions (user_id, points, reason, reference_id) VALUES ($1, $2, $3, $4)',
    [user_id, quest.points_reward, 'quest_completion', quest_id]
  )

  // Update status tier
  const userResult = await db.query('SELECT points, referred_by FROM users WHERE id = $1', [user_id])
  const totalPoints = userResult.rows[0].points
  let status_tier = 'supporter'
  if (totalPoints >= 3500) status_tier = 'legend'
  else if (totalPoints >= 1500) status_tier = 'ultras'
  else if (totalPoints >= 500) status_tier = 'true_fan'

  await db.query('UPDATE users SET status_tier = $1 WHERE id = $2', [status_tier, user_id])

  // Check referral milestones automatically
  // Milestone: 5 quests completed
  const completionCount = await db.query(
    'SELECT COUNT(*) as count FROM quest_completions WHERE user_id = $1',
    [user_id]
  )
  const totalCompletions = Number(completionCount.rows[0].count)

  if (totalCompletions === 5) {
    await checkAndAwardReferralMilestone(user_id, 'quests_5')
  }

  // Milestone: reached true_fan tier
  if (status_tier === 'true_fan') {
    await checkAndAwardReferralMilestone(user_id, 'true_fan_tier')
  }

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
`

const files = {
  'apps/api/src/routes/users.ts': usersRoute,
  'apps/api/src/routes/quests.ts': questsRoute,
}

Object.entries(files).forEach(([path, content]) => {
  fs.writeFileSync(path, content)
  console.log('Written:', path)
})

console.log('\nDone. Referral flow is now fully automatic.')
console.log('\nHow it works now:')
console.log('  1. New user visits /join?ref=NUTEE5XG')
console.log('  2. Frontend passes referral_code in POST /users body')
console.log('  3. Server converts referral automatically — no separate API call needed')
console.log('  4. Quest completion checks milestones automatically')
console.log('  5. POST /referrals/convert and /milestone still exist for admin use only')
import { Hono } from 'hono'
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

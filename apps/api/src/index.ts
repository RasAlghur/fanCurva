import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import 'dotenv/config'

import users from './routes/users'
import quests from './routes/quests'
import leaderboard from './routes/leaderboard'
import points from './routes/points'
import passports from './routes/passports'
import badges from './routes/badges'
import referrals from './routes/referrals'

const app = new Hono()

// ── Middleware ─────────────────────────────────────
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
}))

// ── Routes ─────────────────────────────────────────
app.route('/badges', badges)
app.route('/leaderboard', leaderboard)
app.route('/passports', passports)
app.route('/points', points)
app.route('/quests', quests)
app.route('/referrals', referrals)
app.route('/users', users)

// ── Health check ───────────────────────────────────
app.get('/', (c) => c.json({
  status: 'ok',
  app: 'FanCurva API',
  version: '1.0.0',
  timestamp: new Date().toISOString()
}))

app.get('/health', (c) => c.json({
  status: 'ok',
  services: { api: 'running' }
}))

// ── 404 ────────────────────────────────────────────
app.notFound((c) => c.json({
  error: { code: 'NOT_FOUND', message: 'Route not found' }
}, 404))

// ── Error handler ──────────────────────────────────
app.onError((err, c) => {
  console.error('[ERROR]', err)
  return c.json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' }
  }, 500)
})

// ── Start ──────────────────────────────────────────
const port = Number(process.env.PORT) || 3001
console.log(`FanCurva API running on http://localhost:${port}`)
serve({ fetch: app.fetch, port })

export default app
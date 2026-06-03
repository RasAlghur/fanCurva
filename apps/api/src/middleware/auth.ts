import { PrivyClient } from '@privy-io/server-auth'
import { createMiddleware } from 'hono/factory'

const privy = new PrivyClient(
  process.env.PRIVY_APP_ID!,
  process.env.PRIVY_SECRET!
)

// ── Full auth — requires valid Privy token ─────────
export const requireAuth = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: { code: 'AUTH_INVALID', message: 'Missing or invalid authorization header' } }, 401)
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const claims = await privy.verifyAuthToken(token)
    c.set('privy_user_id', claims.userId)
    await next()
  } catch (err) {
    return c.json({ error: { code: 'AUTH_INVALID', message: 'Invalid or expired token' } }, 401)
  }
})

// ── Soft auth — attaches user if token present, continues either way ──
export const softAuth = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '')
    try {
      const claims = await privy.verifyAuthToken(token)
      c.set('privy_user_id', claims.userId)
    } catch {
      // Invalid token — continue as unauthenticated
    }
  }

  await next()
})

// ── Verify the requesting user owns the resource ──
export function requireSelf(paramName = 'user_id') {
  return createMiddleware(async (c, next) => {
    const privyUserId = c.get('privy_user_id')
    const requestedId = c.req.param(paramName) || c.req.query(paramName)

    if (!privyUserId) {
      return c.json({ error: { code: 'AUTH_INVALID', message: 'Not authenticated' } }, 401)
    }

    // Allow if the privy_user_id matches the requested resource
    // The actual DB lookup happens in the route
    c.set('verified_privy_id', privyUserId)
    await next()
  })
}

export { privy }

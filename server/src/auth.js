import { CognitoJwtVerifier } from 'aws-jwt-verify'
import { query } from './db.js'

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  tokenUse: 'id',
  clientId: process.env.COGNITO_CLIENT_ID,
})

// Verifies the Cognito ID token and upserts a local `users` row keyed by email —
// Cognito owns the credential, our `users` table owns app-level role/strikes/status.
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Missing bearer token' })

  let payload
  try {
    payload = await verifier.verify(token)
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  const email = payload.email
  const name = payload.name || email.split('@')[0]

  const { rows } = await query(
    `INSERT INTO users (id, cognito_sub, email, name)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET cognito_sub = EXCLUDED.cognito_sub
     RETURNING *`,
    [payload.sub, payload.sub, email, name],
  )

  req.user = rows[0]
  next()
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
  next()
}

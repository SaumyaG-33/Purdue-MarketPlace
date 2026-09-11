import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { query } from '../db.js'
import { requireAuth } from '../auth.js'

export const router = Router()
router.use(requireAuth)

async function myProvider(email) {
  const { rows } = await query('SELECT * FROM providers WHERE email = $1', [email])
  return rows[0] ?? null
}

async function withMessages(booking) {
  const { rows: thread } = await query(
    'SELECT sender_name AS from, body AS text, created_at AS when FROM booking_messages WHERE booking_id = $1 ORDER BY created_at ASC',
    [booking.id],
  )
  return { ...booking, thread }
}

function canAccess(booking, req) {
  return booking.client_id === req.user.id || booking.provider_email === req.user.email || req.user.role === 'admin'
}

// Bookings the current user made as a client
router.get('/mine', async (req, res) => {
  const { rows } = await query('SELECT * FROM bookings WHERE client_id = $1 ORDER BY start_at DESC', [req.user.id])
  res.json(rows)
})

// Bookings against the provider the current user owns
router.get('/provider', async (req, res) => {
  const provider = await myProvider(req.user.email)
  if (!provider) return res.status(404).json({ error: 'You do not own a provider profile' })
  const { rows } = await query('SELECT * FROM bookings WHERE provider_id = $1 ORDER BY start_at ASC', [provider.id])
  res.json(rows)
})

router.get('/:id', async (req, res) => {
  const { rows } = await query(
    `SELECT b.*, p.email AS provider_email FROM bookings b LEFT JOIN providers p ON p.id = b.provider_id WHERE b.id = $1`,
    [req.params.id],
  )
  const booking = rows[0]
  if (!booking) return res.status(404).json({ error: 'Not found' })
  if (!canAccess(booking, req)) return res.status(403).json({ error: 'Forbidden' })
  res.json(await withMessages(booking))
})

router.post('/', async (req, res) => {
  const { providerId, providerName, serviceId, serviceName, startAt, durationMinutes, price, deposit, depositPaid, comments } = req.body
  if (!providerId || !startAt || !durationMinutes) return res.status(400).json({ error: 'Missing required fields' })

  const id = `bk-${randomUUID()}`
  const { rows } = await query(
    `INSERT INTO bookings (id, client_id, client_name, client_email, provider_id, provider_name, service_id, service_name, start_at, duration_minutes, price, deposit, deposit_paid, status, comments)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'confirmed',$14)
     RETURNING *`,
    [
      id, req.user.id, req.user.name, req.user.email, providerId, providerName, serviceId, serviceName,
      startAt, durationMinutes, price, deposit ?? 0, Boolean(depositPaid), comments ?? '',
    ],
  )
  res.status(201).json(rows[0])
})

router.patch('/:id/status', async (req, res) => {
  const { status } = req.body
  const allowed = ['requested', 'confirmed', 'declined', 'cancelled', 'completed']
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' })

  const { rows: existing } = await query(
    `SELECT b.*, p.email AS provider_email FROM bookings b LEFT JOIN providers p ON p.id = b.provider_id WHERE b.id = $1`,
    [req.params.id],
  )
  const booking = existing[0]
  if (!booking) return res.status(404).json({ error: 'Not found' })
  if (!canAccess(booking, req)) return res.status(403).json({ error: 'Forbidden' })

  const { rows } = await query('UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id])
  res.json(rows[0])
})

router.post('/:id/messages', async (req, res) => {
  const { text } = req.body
  if (!text?.trim()) return res.status(400).json({ error: 'Message text required' })

  const { rows: existing } = await query(
    `SELECT b.*, p.email AS provider_email FROM bookings b LEFT JOIN providers p ON p.id = b.provider_id WHERE b.id = $1`,
    [req.params.id],
  )
  const booking = existing[0]
  if (!booking) return res.status(404).json({ error: 'Not found' })
  if (!canAccess(booking, req)) return res.status(403).json({ error: 'Forbidden' })

  await query('INSERT INTO booking_messages (id, booking_id, sender_name, body) VALUES ($1,$2,$3,$4)', [
    `msg-${randomUUID()}`, req.params.id, req.user.name, text,
  ])
  res.status(201).json(await withMessages(booking))
})

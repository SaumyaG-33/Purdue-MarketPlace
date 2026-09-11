import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { query } from '../db.js'
import { requireAuth, requireAdmin } from '../auth.js'

export const router = Router()
router.use(requireAuth)

// --- Reports ---

router.post('/reports', async (req, res) => {
  const { kind, providerId, providerName, bookingRef, description } = req.body
  if (!kind || !description) return res.status(400).json({ error: 'Missing required fields' })

  const id = `rpt-${randomUUID()}`
  const { rows } = await query(
    `INSERT INTO reports (id, kind, provider_id, provider_name, reporter_name, booking_ref, description, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'open')
     RETURNING *`,
    [id, kind, providerId ?? null, providerName ?? 'Unknown', req.user.name, bookingRef ?? '', description],
  )
  res.status(201).json(rows[0])
})

router.get('/reports', requireAdmin, async (req, res) => {
  const { rows } = await query("SELECT * FROM reports WHERE status = 'open' ORDER BY created_at ASC")
  res.json(rows)
})

router.patch('/reports/:id', requireAdmin, async (req, res) => {
  const { status } = req.body // 'strike' | 'dismissed'
  if (!['strike', 'dismissed'].includes(status)) return res.status(400).json({ error: 'Invalid status' })

  const { rows: existing } = await query('SELECT * FROM reports WHERE id = $1', [req.params.id])
  const report = existing[0]
  if (!report) return res.status(404).json({ error: 'Not found' })

  await query("UPDATE reports SET status = $1 WHERE id = $2", [status === 'strike' ? 'strike' : 'dismissed', req.params.id])
  if (status === 'strike' && report.provider_id) {
    await query('UPDATE providers SET strikes = strikes + 1 WHERE id = $1', [report.provider_id])
  }
  res.json({ ok: true })
})

// --- Flagged reviews ---

router.get('/review-flags', requireAdmin, async (req, res) => {
  const { rows } = await query(
    "SELECT id, rating, flag_source AS source, created_at AS when, body AS text FROM reviews WHERE flagged = true ORDER BY created_at DESC",
  )
  res.json(rows)
})

router.patch('/review-flags/:id', requireAdmin, async (req, res) => {
  const { action } = req.body // 'keep' | 'remove'
  if (action === 'remove') {
    await query('DELETE FROM reviews WHERE id = $1', [req.params.id])
  } else {
    await query('UPDATE reviews SET flagged = false WHERE id = $1', [req.params.id])
  }
  res.json({ ok: true })
})

// --- Suspensions ---

router.get('/suspensions', requireAdmin, async (req, res) => {
  const { rows: providers } = await query(
    "SELECT id, name, category_id AS \"categoryId\", strikes, status FROM providers WHERE application_status = 'approved' ORDER BY strikes DESC",
  )
  const { rows: clients } = await query(
    "SELECT id, name, email, strikes, status FROM users WHERE role != 'admin' ORDER BY strikes DESC",
  )
  res.json({ providers, clients })
})

router.patch('/providers/:id/status', requireAdmin, async (req, res) => {
  const { status } = req.body // 'active' | 'paused' | 'removed'
  if (!['active', 'paused', 'removed'].includes(status)) return res.status(400).json({ error: 'Invalid status' })
  const { rows } = await query('UPDATE providers SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id])
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
  res.json(rows[0])
})

router.patch('/users/:id/status', requireAdmin, async (req, res) => {
  const { status } = req.body // 'active' | 'warned' | 'blocked'
  if (!['active', 'warned', 'blocked'].includes(status)) return res.status(400).json({ error: 'Invalid status' })
  const { rows } = await query('UPDATE users SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id])
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
  res.json(rows[0])
})

router.post('/providers/:id/clear-strike', requireAdmin, async (req, res) => {
  const { rows } = await query(
    'UPDATE providers SET strikes = GREATEST(strikes - 1, 0) WHERE id = $1 RETURNING *',
    [req.params.id],
  )
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
  res.json(rows[0])
})

router.post('/users/:id/clear-strike', requireAdmin, async (req, res) => {
  const { rows } = await query(
    'UPDATE users SET strikes = GREATEST(strikes - 1, 0) WHERE id = $1 RETURNING *',
    [req.params.id],
  )
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
  res.json(rows[0])
})

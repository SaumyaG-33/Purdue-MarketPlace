import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { query } from '../db.js'
import { requireAuth, requireAdmin } from '../auth.js'

export const router = Router()
router.use(requireAuth)

router.get('/mine', async (req, res) => {
  const { rows } = await query('SELECT * FROM applications WHERE email = $1 ORDER BY submitted_at DESC', [req.user.email])
  res.json(rows)
})

router.get('/', requireAdmin, async (req, res) => {
  const { rows } = await query('SELECT * FROM applications ORDER BY submitted_at ASC')
  res.json(rows)
})

router.post('/', async (req, res) => {
  const { businessName, category, ownerName, phone, priceRange, servicesText, description } = req.body
  if (!businessName || !category) return res.status(400).json({ error: 'Missing required fields' })

  const id = `app-${randomUUID()}`
  const { rows } = await query(
    `INSERT INTO applications (id, business_name, owner_name, email, category, phone, price_range, services_text, description, docs, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'[]','pending')
     RETURNING *`,
    [id, businessName, ownerName, req.user.email, category, phone, priceRange, servicesText, description],
  )
  res.status(201).json(rows[0])
})

router.patch('/:id', requireAdmin, async (req, res) => {
  const { status, internalNote } = req.body
  const allowed = ['pending', 'needs_info', 'approved', 'rejected']
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' })

  const { rows: existing } = await query('SELECT * FROM applications WHERE id = $1', [req.params.id])
  const application = existing[0]
  if (!application) return res.status(404).json({ error: 'Not found' })

  const { rows } = await query(
    'UPDATE applications SET status = $1, internal_note = COALESCE($2, internal_note) WHERE id = $3 RETURNING *',
    [status, internalNote, req.params.id],
  )

  if (status === 'approved') {
    const providerId = `prov-${randomUUID()}`
    await query(
      `INSERT INTO providers (id, name, category_id, owner_name, email, bio, application_status)
       VALUES ($1,$2,$3,$4,$5,$6,'approved')
       ON CONFLICT (email) DO NOTHING`,
      [providerId, application.business_name, application.category, application.owner_name, application.email, application.description],
    )
  }

  res.json(rows[0])
})

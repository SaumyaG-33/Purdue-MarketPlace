import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { query } from '../db.js'
import { requireAuth } from '../auth.js'

export const router = Router()
router.use(requireAuth)

router.post('/', async (req, res) => {
  const { bookingId, rating, text } = req.body
  const ratingNum = Number(rating)
  if (!bookingId || !Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: 'bookingId and a rating 1-5 are required' })
  }

  const { rows: bookingRows } = await query('SELECT * FROM bookings WHERE id = $1', [bookingId])
  const booking = bookingRows[0]
  if (!booking) return res.status(404).json({ error: 'Booking not found' })
  if (booking.client_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' })
  if (booking.status !== 'confirmed' && booking.status !== 'completed') {
    return res.status(400).json({ error: 'Only confirmed or completed bookings can be reviewed' })
  }
  if (new Date(booking.start_at).getTime() > Date.now()) {
    return res.status(400).json({ error: 'This service hasn’t happened yet' })
  }

  const { rows: dupe } = await query('SELECT id FROM reviews WHERE booking_id = $1', [bookingId])
  if (dupe.length > 0) return res.status(409).json({ error: 'Already reviewed' })

  const id = `rev-${randomUUID()}`
  const { rows } = await query(
    `INSERT INTO reviews (id, provider_id, booking_id, author, rating, body)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [id, booking.provider_id, bookingId, req.user.name, ratingNum, text ?? ''],
  )

  await query(
    `UPDATE providers SET
       review_count = (SELECT COUNT(*) FROM reviews WHERE provider_id = $1 AND flagged = false),
       rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE provider_id = $1 AND flagged = false)
     WHERE id = $1`,
    [booking.provider_id],
  )

  res.status(201).json(rows[0])
})

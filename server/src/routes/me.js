import { Router } from 'express'
import { query } from '../db.js'
import { requireAuth } from '../auth.js'

export const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  const { rows: providers } = await query('SELECT * FROM providers WHERE email = $1', [req.user.email])
  res.json({ ...req.user, provider: providers[0] ?? null })
})

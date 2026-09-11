import { Router } from 'express'
import { query } from '../db.js'

export const router = Router()

async function loadProvider(id) {
  const { rows: providers } = await query('SELECT * FROM providers WHERE id = $1', [id])
  if (providers.length === 0) return null
  const provider = providers[0]
  const { rows: services } = await query(
    'SELECT id, name, duration_minutes AS duration, price, deposit FROM provider_services WHERE provider_id = $1',
    [id],
  )
  const { rows: reviews } = await query(
    'SELECT id, author, rating, body AS text, created_at AS "when" FROM reviews WHERE provider_id = $1 AND flagged = false ORDER BY created_at DESC',
    [id],
  )
  return { ...provider, services, reviews }
}

// List providers, optionally filtered by ?serviceId= — includes each provider's
// services so listing pages can show a starting price without an N+1 fetch.
router.get('/', async (req, res) => {
  const { serviceId } = req.query
  const { rows } = serviceId
    ? await query('SELECT * FROM providers WHERE service_id = $1 AND status = $2', [serviceId, 'active'])
    : await query('SELECT * FROM providers WHERE status = $1', ['active'])

  if (rows.length === 0) return res.json([])

  const { rows: services } = await query(
    'SELECT id, provider_id, name, duration_minutes AS duration, price, deposit FROM provider_services WHERE provider_id = ANY($1)',
    [rows.map((p) => p.id)],
  )
  const byProvider = new Map()
  for (const s of services) {
    if (!byProvider.has(s.provider_id)) byProvider.set(s.provider_id, [])
    byProvider.get(s.provider_id).push(s)
  }
  res.json(rows.map((p) => ({ ...p, services: byProvider.get(p.id) ?? [] })))
})

router.get('/:id', async (req, res) => {
  const provider = await loadProvider(req.params.id)
  if (!provider) return res.status(404).json({ error: 'Not found' })
  res.json(provider)
})

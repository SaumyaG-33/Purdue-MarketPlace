import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { router as providersRouter } from './routes/providers.js'
import { router as bookingsRouter } from './routes/bookings.js'
import { router as applicationsRouter } from './routes/applications.js'
import { router as moderationRouter } from './routes/moderation.js'
import { router as meRouter } from './routes/me.js'

const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5183' }))
app.use(express.json())

app.get('/health', (req, res) => res.json({ ok: true }))

app.use('/api/providers', providersRouter)
app.use('/api/bookings', bookingsRouter)
app.use('/api/applications', applicationsRouter)
app.use('/api/me', meRouter)
app.use('/api', moderationRouter) // /api/reports, /api/review-flags, /api/suspensions, ...

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

const port = Number(process.env.PORT || 4000)
app.listen(port, () => console.log(`API listening on http://localhost:${port}`))

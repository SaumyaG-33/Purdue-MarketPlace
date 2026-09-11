import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { router as providersRouter } from './routes/providers.js'
import { router as bookingsRouter } from './routes/bookings.js'
import { router as applicationsRouter } from './routes/applications.js'
import { router as moderationRouter } from './routes/moderation.js'
import { router as meRouter } from './routes/me.js'
import { router as reviewsRouter } from './routes/reviews.js'

const app = express()

// Vite picks whatever port is free (5173, 5174, 5183, ...), so pin to an exact
// origin only if CORS_ORIGIN is set; otherwise allow any localhost port in dev.
const allowedOrigin = process.env.CORS_ORIGIN
app.use(
  cors({
    origin: allowedOrigin || /^http:\/\/localhost:\d+$/,
  }),
)
app.use(express.json())

app.get('/health', (req, res) => res.json({ ok: true }))

app.use('/api/providers', providersRouter)
app.use('/api/bookings', bookingsRouter)
app.use('/api/applications', applicationsRouter)
app.use('/api/me', meRouter)
app.use('/api/reviews', reviewsRouter)
app.use('/api', moderationRouter) // /api/reports, /api/review-flags, /api/suspensions, ...

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

const port = Number(process.env.PORT || 4000)
app.listen(port, () => console.log(`API listening on http://localhost:${port}`))

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ClientNav from '../../components/ClientNav'
import { Button, Card, H3, Mono, P, Tabs } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { api } from '../../lib/api'
import { firstNameOf, formatDay, timeLabel } from '../../lib/format'

function toDateInputValue(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
function toTimeInputValue(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function BookingCard({ b, onChanged }) {
  const [panel, setPanel] = useState(null) // null | 'message' | 'reschedule'
  const [thread, setThread] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [dateVal, setDateVal] = useState(toDateInputValue(new Date(b.startAt)))
  const [timeVal, setTimeVal] = useState(toTimeInputValue(new Date(b.startAt)))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function openMessage() {
    if (panel === 'message') {
      setPanel(null)
      return
    }
    setPanel('message')
    setError('')
    const detail = await api.get(`/api/bookings/${b.id}`).catch(() => null)
    setThread(detail?.thread ?? [])
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!messageText.trim()) return
    setBusy(true)
    try {
      const updated = await api.post(`/api/bookings/${b.id}/messages`, { text: messageText })
      setThread(updated.thread)
      setMessageText('')
    } catch (err) {
      setError(err.message || 'Could not send message')
    } finally {
      setBusy(false)
    }
  }

  function openReschedule() {
    setPanel(panel === 'reschedule' ? null : 'reschedule')
    setError('')
  }

  async function submitReschedule(e) {
    e.preventDefault()
    if (!dateVal || !timeVal) return
    setBusy(true)
    setError('')
    try {
      const startAt = new Date(`${dateVal}T${timeVal}`).toISOString()
      await api.patch(`/api/bookings/${b.id}/reschedule`, { startAt })
      setPanel(null)
      onChanged()
    } catch (err) {
      setError(err.message || 'Could not reschedule')
    } finally {
      setBusy(false)
    }
  }

  async function cancelOrWithdraw() {
    if (!window.confirm(b.status === 'confirmed' ? 'Cancel this booking?' : 'Withdraw this request?')) return
    setBusy(true)
    try {
      await api.patch(`/api/bookings/${b.id}/status`, { status: 'cancelled' })
      onChanged()
    } catch (err) {
      setError(err.message || 'Could not cancel')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <div className="flex-row flex items-center gap-3">
        <div className="w-13 h-13 bg-box border border-border-soft rounded-md flex-none" style={{ width: 52, height: 52 }} />
        <div className="flex-1">
          <H3>
            {b.serviceName} · {b.providerName}
          </H3>
          <Mono>
            {formatDay(new Date(b.startAt))}, {timeLabel(new Date(b.startAt))} ·{' '}
            {b.status === 'confirmed' ? 'Confirmed' : `Pending — waiting on ${firstNameOf(b.providerName)}`} · ${b.price}
          </Mono>
        </div>
        <Button variant="secondary" onClick={openMessage} disabled={busy}>
          Message
        </Button>
        {b.status === 'confirmed' && (
          <Button variant="secondary" onClick={openReschedule} disabled={busy}>
            Reschedule
          </Button>
        )}
        <Button variant="ghost" onClick={cancelOrWithdraw} disabled={busy}>
          {b.status === 'confirmed' ? 'Cancel' : 'Withdraw'}
        </Button>
      </div>

      {error && <P className="text-red-600">{error}</P>}

      {panel === 'message' && (
        <div className="flex flex-col gap-2 pt-2 border-t border-border mt-1">
          {thread === null && <Mono>Loading…</Mono>}
          {thread?.length === 0 && <Mono>No messages yet.</Mono>}
          {thread?.map((m, i) => (
            <div key={i} className="flex flex-col">
              <Mono>
                {m.from} · {new Date(m.when).toLocaleString()}
              </Mono>
              <P>{m.text}</P>
            </div>
          ))}
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Reply…"
              className="flex-1 border border-border-field bg-surface-muted rounded-md px-3 py-2 text-[13px] placeholder:text-text-mono focus:outline-none focus:ring-2 focus:ring-gold"
            />
            <Button type="submit" variant="secondary" disabled={busy}>
              Send
            </Button>
          </form>
        </div>
      )}

      {panel === 'reschedule' && (
        <form onSubmit={submitReschedule} className="flex items-end gap-2 pt-2 border-t border-border mt-1">
          <label className="flex flex-col gap-1">
            <Mono>New date</Mono>
            <input
              type="date"
              required
              value={dateVal}
              onChange={(e) => setDateVal(e.target.value)}
              className="border border-border-field bg-surface-muted rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </label>
          <label className="flex flex-col gap-1">
            <Mono>New time</Mono>
            <input
              type="time"
              required
              value={timeVal}
              onChange={(e) => setTimeVal(e.target.value)}
              className="border border-border-field bg-surface-muted rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </label>
          <Button type="submit" disabled={busy}>
            Confirm new time
          </Button>
        </form>
      )}
    </Card>
  )
}

function PastCard({ b, onChanged }) {
  const [reviewing, setReviewing] = useState(false)
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submitReview(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api.post('/api/reviews', { bookingId: b.id, rating, text })
      setReviewing(false)
      onChanged()
    } catch (err) {
      setError(err.message || 'Could not submit review')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <div className="flex-row flex items-center gap-3">
        <div className="flex-1">
          <H3>
            {b.reviewed ? `${b.serviceName} · ${b.providerName}` : `Rate your ${b.serviceName} session`}
          </H3>
          <Mono>
            {formatDay(new Date(b.startAt))} · {b.reviewed ? 'Reviewed — thanks!' : 'Finished'}
          </Mono>
        </div>
        {!b.reviewed && (
          <Button onClick={() => setReviewing((v) => !v)} disabled={busy}>
            Leave a review
          </Button>
        )}
      </div>

      {reviewing && (
        <form onSubmit={submitReview} className="flex flex-col gap-2 pt-2 border-t border-border mt-1">
          <label className="flex flex-col gap-1">
            <Mono>Rating</Mono>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="border border-border-field bg-surface-muted rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-gold w-24"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {'★'.repeat(n)}
                </option>
              ))}
            </select>
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="How'd it go?"
            className="border border-border-field bg-surface-muted rounded-md px-3 py-2 text-[13px] placeholder:text-text-mono h-16 resize-none focus:outline-none focus:ring-2 focus:ring-gold"
          />
          {error && <P className="text-red-600">{error}</P>}
          <Button type="submit" disabled={busy} className="self-start">
            {busy ? 'Submitting…' : 'Submit review'}
          </Button>
        </form>
      )}
    </Card>
  )
}

export default function MyAccount() {
  const { currentUser } = useAuth()
  const [tab, setTab] = useState('upcoming')
  const [bookings, setBookings] = useState([])
  const navigate = useNavigate()

  function refetch() {
    if (!currentUser) return
    api.get('/api/bookings/mine').then(setBookings).catch(() => {})
  }

  useEffect(refetch, [currentUser])

  if (!currentUser) {
    return (
      <div className="min-h-screen">
        <ClientNav />
        <div className="p-6 flex flex-col gap-3 items-start">
          <P>Log in to see your upcoming services.</P>
          <Button onClick={() => navigate('/login')}>Log in</Button>
        </div>
      </div>
    )
  }

  // Cancelled/declined bookings just disappear — they were never a real session.
  // "Past" = the service's time has actually happened (or was explicitly marked completed).
  const isPast = (b) => new Date(b.startAt).getTime() < Date.now()
  const upcoming = bookings.filter((b) => (b.status === 'confirmed' || b.status === 'requested') && !isPast(b))
  const past = bookings.filter((b) => b.status === 'completed' || ((b.status === 'confirmed' || b.status === 'requested') && isPast(b)))

  return (
    <div className="min-h-screen">
      <ClientNav />
      <Tabs
        tabs={[
          { value: 'upcoming', label: 'Upcoming' },
          { value: 'past', label: 'Past' },
          { value: 'info', label: 'Account info' },
          { value: 'reviews', label: 'Reviews I’ve left' },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="p-5 flex flex-col gap-2.5">
        {tab === 'upcoming' && (
          <>
            {upcoming.length === 0 && <P>Nothing booked yet — browse Beauty, Education, Transportation…</P>}
            {upcoming.map((b) => (
              <BookingCard key={b.id} b={b} onChanged={refetch} />
            ))}
          </>
        )}

        {tab === 'past' && (
          <>
            {past.length === 0 && <Mono>Nothing here yet.</Mono>}
            {past.map((b) => (
              <PastCard key={b.id} b={b} onChanged={refetch} />
            ))}
          </>
        )}

        {tab === 'info' && (
          <Card className="max-w-md">
            <H3>{currentUser.name}</H3>
            <Mono>{currentUser.email}</Mono>
            <Mono>Verified</Mono>
          </Card>
        )}

        {tab === 'reviews' && <Mono>You haven't left any reviews yet.</Mono>}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import ClientNav from '../../components/ClientNav'
import { Box, Button, H2, Mono, P, Select, TextArea } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { api } from '../../lib/api'

export default function ReportIssue() {
  const { currentUser } = useAuth()
  const location = useLocation()
  const prefill = location.state ?? {}

  const [myBookings, setMyBookings] = useState([])
  useEffect(() => {
    if (!currentUser) return
    api.get('/api/bookings/mine').then(setMyBookings).catch(() => {})
  }, [currentUser])

  const prefillBooking = prefill.providerId ? myBookings.find((b) => b.providerId === prefill.providerId) : null

  const [bookingId, setBookingId] = useState('')
  useEffect(() => setBookingId(prefillBooking?.id ?? ''), [prefillBooking])

  const [kind, setKind] = useState('No-show')
  const [description, setDescription] = useState('')
  const [submittedId, setSubmittedId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const booking = myBookings.find((b) => b.id === bookingId)
    setSubmitting(true)
    setError('')
    try {
      await api.post('/api/reports', {
        kind,
        providerId: booking?.providerId ?? prefill.providerId ?? null,
        providerName: booking?.providerName ?? prefill.providerName ?? 'Unknown',
        bookingRef: booking ? booking.serviceName : '',
        description,
      })
      setSubmittedId(`1${Math.floor(Math.random() * 900 + 100)}`)
    } catch (err) {
      setError(err.message || 'Could not submit the report')
    } finally {
      setSubmitting(false)
    }
  }

  if (submittedId) {
    return (
      <div className="min-h-screen">
        <ClientNav />
        <div className="flex justify-center py-10 px-4">
          <div className="w-full max-w-[380px] border border-border-card rounded-lg bg-white p-6 flex flex-col gap-3">
            <H2>Report #{submittedId} received</H2>
            <P>We read every one — three substantiated strikes and a provider is removed. Reviewed by a human within 48 hrs.</P>
            <Mono>Emergencies: call PUPD, not us.</Mono>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <ClientNav />
      <div className="flex justify-center py-10 px-4">
        <form onSubmit={handleSubmit} className="w-full max-w-[380px] border border-border-card rounded-lg bg-white p-6 flex flex-col gap-3">
          <H2>Report an issue</H2>
          <P>Tell us what happened. We read every one — three substantiated strikes and a provider is removed.</P>
          {prefill.providerName && !prefillBooking && (
            <Box className="px-3 py-2">
              <Mono>Reporting {prefill.providerName} — pick the booking it's about below, if you have one.</Mono>
            </Box>
          )}
          <Select label="Which booking?" value={bookingId} onChange={(e) => setBookingId(e.target.value)} required>
            <option value="">Select a booking…</option>
            {myBookings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.serviceName} — {b.providerName}
              </option>
            ))}
          </Select>
          <Select label="What went wrong?" value={kind} onChange={(e) => setKind(e.target.value)}>
            <option>No-show</option>
            <option>Unsafe</option>
            <option>Not as described</option>
            <option>Payment</option>
            <option>Other</option>
          </Select>
          <TextArea
            label="Describe it"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-[70px]"
            placeholder="Describe it…"
          />
          <Box className="h-11 flex items-center px-2.5">
            <Mono>Drop screenshots / photos</Mono>
          </Box>
          {error && <P className="text-red-600">{error}</P>}
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit report'}
          </Button>
          <Mono>Reviewed by a human within 48 hrs. Emergencies: call PUPD, not us.</Mono>
        </form>
      </div>
    </div>
  )
}

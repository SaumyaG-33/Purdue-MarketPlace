import { useState } from 'react'
import ClientNav from '../../components/ClientNav'
import { Box, Button, H2, Mono, P, Select, TextArea } from '../../components/ui'
import { useStore } from '../../lib/store'

export default function ReportIssue() {
  const { state, currentUser, dispatch } = useStore()
  const [bookingId, setBookingId] = useState('')
  const [kind, setKind] = useState('No-show')
  const [description, setDescription] = useState('')
  const [submittedId, setSubmittedId] = useState(null)

  const myBookings = currentUser ? state.bookings.filter((b) => b.clientId === currentUser.id) : []

  function handleSubmit(e) {
    e.preventDefault()
    const booking = myBookings.find((b) => b.id === bookingId)
    const id = `1${Math.floor(Math.random() * 900 + 100)}`
    dispatch({
      type: 'SUBMIT_REPORT',
      payload: {
        id: `rpt-${id}`,
        kind,
        providerId: booking?.providerId ?? null,
        providerName: booking?.providerName ?? state.providers[booking?.providerId]?.name ?? 'Unknown',
        reporterName: currentUser?.name ?? 'Anonymous',
        bookingRef: booking ? `${booking.serviceName}` : '',
        description,
      },
    })
    setSubmittedId(id)
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
          <Select label="Which booking?" value={bookingId} onChange={(e) => setBookingId(e.target.value)} required>
            <option value="">Select a booking…</option>
            {myBookings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.serviceName} — {b.providerName ?? state.providers[b.providerId]?.name}
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
          <Button type="submit">Submit report</Button>
          <Mono>Reviewed by a human within 48 hrs. Emergencies: call PUPD, not us.</Mono>
        </form>
      </div>
    </div>
  )
}

import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import ClientNav from '../../components/ClientNav'
import { Box, Button, H2, Line, Mono, P } from '../../components/ui'
import { firstNameOf, formatDay, timeLabel } from '../../lib/format'
import { useAuth } from '../../lib/auth'

export default function Confirmed() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const booking = location.state?.booking

  if (!booking) return <Navigate to="/" replace />

  const start = new Date(booking.startAt)
  const providerFirstName = firstNameOf(booking.providerName) || 'your provider'

  return (
    <div className="min-h-screen">
      <ClientNav />
      <div className="flex justify-center py-10 px-4">
        <div className="w-full max-w-[380px] border border-border-card rounded-lg bg-white p-6 flex flex-col gap-3.5 shadow-sm">
          <Box className="w-10 h-10 rounded-full" />
          <H2>You're booked with {providerFirstName}</H2>
          <P>
            {formatDay(start)}, {timeLabel(start)} · {booking.serviceName} · ${booking.price}
          </P>
          <Line />
          <Mono>
            ✉ Confirmation sent to {currentUser?.email}. Reminder 24 hrs before, follow-up after to rate the service.
          </Mono>
          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate('/account')}>View upcoming services</Button>
            <Button variant="secondary">Add a comment</Button>
            <Button variant="secondary">Add to calendar</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

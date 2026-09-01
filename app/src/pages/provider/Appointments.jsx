import { Navigate, useNavigate } from 'react-router-dom'
import DashboardNav from '../../components/DashboardNav'
import { Card, H3, Mono } from '../../components/ui'
import { useMyProvider } from '../../lib/useMyProvider'
import { useStore } from '../../lib/store'
import { dateForOffset } from '../../lib/data'
import { formatDay, minutesToLabel } from '../../lib/format'

const PROVIDER_LINKS = [
  { to: '/provider/calendar', label: 'Schedule' },
  { to: '/provider/availability', label: 'Availability' },
  { to: '/provider/appointments', label: 'Requests' },
]

export default function Appointments() {
  const { provider } = useMyProvider()
  const { state } = useStore()
  const navigate = useNavigate()

  if (!provider) return <Navigate to="/provide" replace />

  const requests = state.bookings.filter((b) => b.providerId === provider.id && b.status === 'requested')
  const all = state.bookings.filter((b) => b.providerId === provider.id)

  return (
    <div className="min-h-screen">
      <DashboardNav mode="provider" tag={`${provider.name} · approved`} links={PROVIDER_LINKS} />
      <div className="p-5 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <H3>Requests ({requests.length})</H3>
          {requests.length === 0 && <Mono>No pending requests.</Mono>}
          {requests.map((b) => (
            <Card
              key={b.id}
              onClick={() => navigate(`/provider/appointments/${b.id}`)}
              className="flex-row items-center gap-3 cursor-pointer border-l-[3px] border-l-[#b4b4ae]"
            >
              <div className="flex-1">
                <H3>
                  {b.serviceName} · {b.clientName}
                </H3>
                <Mono>
                  {formatDay(dateForOffset(b.dayOffset))} · {minutesToLabel(b.start)} · ${b.price}
                </Mono>
              </div>
              <span className="text-[12px] font-semibold border border-border-card rounded-md px-3 py-1.5 bg-white">Open</span>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <H3>All appointments</H3>
          {all.map((b) => (
            <Card key={b.id} onClick={() => navigate(`/provider/appointments/${b.id}`)} className="flex-row items-center gap-3 cursor-pointer">
              <div className="flex-1">
                <H3>
                  {b.serviceName} · {b.clientName}
                </H3>
                <Mono>
                  {formatDay(dateForOffset(b.dayOffset))} · {minutesToLabel(b.start)} · {b.status}
                </Mono>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

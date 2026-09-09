import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ClientNav from '../../components/ClientNav'
import { Card, Chip, H2, H3, Mono, P, Slot } from '../../components/ui'
import { CATEGORY_MAP, findService, isProviderFreeOnDay, anyFreeProviderOnDay, dateForOffset } from '../../lib/data'
import { formatDay, formatMonthYear } from '../../lib/format'
import { api } from '../../lib/api'

const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function AvailabilityProviders() {
  const { categoryId, serviceId } = useParams()
  const navigate = useNavigate()
  const found = findService(serviceId)
  const category = CATEGORY_MAP[categoryId]

  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api
      .get(`/api/providers?serviceId=${encodeURIComponent(serviceId)}`)
      .then(setProviders)
      .finally(() => setLoading(false))
  }, [serviceId])

  const firstFreeOffset = useMemo(() => {
    for (let i = 0; i < 21; i++) if (anyFreeProviderOnDay(providers, i)) return i
    return 0
  }, [providers])

  const [selectedOffset, setSelectedOffset] = useState(0)
  useEffect(() => setSelectedOffset(firstFreeOffset), [firstFreeOffset])

  if (!found || !category) {
    return (
      <div className="min-h-screen">
        <ClientNav />
        <div className="p-6">
          <P>Unknown service.</P>
        </div>
      </div>
    )
  }

  const { service } = found
  const todayDate = dateForOffset(0)
  const startOffset = -todayDate.getDay()
  const days = Array.from({ length: 28 }, (_, i) => startOffset + i)

  const freeProviders = providers.filter((p) => isProviderFreeOnDay(p.id, selectedOffset))
  const selectedDate = dateForOffset(selectedOffset)

  return (
    <div className="min-h-screen">
      <ClientNav />
      <div className="px-5 py-4 flex flex-col gap-1.5">
        <Mono>
          <Link to="/" className="hover:text-ink">
            Home
          </Link>{' '}
          /{' '}
          <Link to={`/browse/${categoryId}`} className="hover:text-ink">
            {category.name}
          </Link>{' '}
          / {service.name}
        </Mono>
        <H2>
          {service.name} — pick a day, then a provider
        </H2>
      </div>

      <div className="px-5 pb-8 flex gap-5 items-start flex-wrap">
        <div className="w-[280px] flex-none flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-text-mono">◀</span>
            <H3 className="flex-1 text-center">{formatMonthYear(todayDate)}</H3>
            <span className="font-mono text-[11px] text-text-mono">▶</span>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {WEEKDAY_LETTERS.map((d, i) => (
              <Mono key={i} className="text-center">
                {d}
              </Mono>
            ))}
            {days.map((offset) => {
              const inPast = offset < 0
              const isFree = !inPast && anyFreeProviderOnDay(providers, offset)
              const isSelected = offset === selectedOffset
              const d = dateForOffset(offset)
              return (
                <Slot
                  key={offset}
                  state={inPast || !isFree ? 'off' : isSelected ? 'selected' : 'default'}
                  onClick={() => isFree && setSelectedOffset(offset)}
                >
                  {d.getDate()}
                </Slot>
              )
            })}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            <Chip>Price ▾</Chip>
            <Chip>Rating 4.5+ ▾</Chip>
            <Chip>Comes to you</Chip>
          </div>
          <Mono>Gold = a {service.name.toLowerCase()} provider is free. Gray = nobody.</Mono>
        </div>

        <div className="flex-1 min-w-[300px] flex flex-col gap-2.5">
          <H3>
            {formatDay(selectedDate)} — {freeProviders.length} provider{freeProviders.length === 1 ? '' : 's'} free
          </H3>
          {loading && <Mono>Loading…</Mono>}
          {!loading && freeProviders.length === 0 && (
            <Card>
              <P>No one's offering {service.name.toLowerCase()} yet — get notified when someone is.</P>
            </Card>
          )}
          {freeProviders.map((p, i) => (
            <Card key={p.id} className={`flex-row items-center gap-2.5 ${i === 0 ? 'border-l-[3px] border-l-gold' : ''}`}>
              <div className="w-10 h-10 bg-box border border-border-soft rounded-md flex-none" />
              <div className="flex-1 min-w-0">
                <H3>{p.name}</H3>
                <Mono>
                  ★{p.rating} ({p.reviewCount}) {p.services?.[0] && `· ${p.services[0].name} $${p.services[0].price}`} · {p.area}
                </Mono>
              </div>
              <span
                onClick={() => navigate(`/listing/${p.id}?service=${serviceId}&date=${selectedOffset}`)}
                className="text-[13px] font-semibold border border-border-card rounded-md px-3.5 py-2 cursor-pointer bg-white hover:bg-surface-alt"
              >
                View services
              </span>
            </Card>
          ))}
          <Mono>Only providers free that day are listed — exact times come after you choose a service.</Mono>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ClientNav from '../../components/ClientNav'
import { Button, Card, H2, H3, Line, Mono, P } from '../../components/ui'
import { api } from '../../lib/api'

export default function ServiceListing() {
  const { providerId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [provider, setProvider] = useState(null)
  const [loading, setLoading] = useState(true)
  const dateOffset = params.get('date') ?? ''

  useEffect(() => {
    setLoading(true)
    api
      .get(`/api/providers/${providerId}`)
      .then(setProvider)
      .catch(() => setProvider(null))
      .finally(() => setLoading(false))
  }, [providerId])

  if (loading) {
    return (
      <div className="min-h-screen">
        <ClientNav />
        <div className="p-6">
          <Mono>Loading…</Mono>
        </div>
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="min-h-screen">
        <ClientNav />
        <div className="p-6">
          <P>Provider not found.</P>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <ClientNav />
      <div className="px-5 py-5 flex gap-5 flex-wrap">
        <div className="w-[230px] flex-none flex flex-col gap-1.5">
          <div className="relative flex items-center gap-1.5">
            <div className="flex-1 h-[170px] bg-box border border-border-soft rounded-md flex items-end justify-between p-1.5">
              <Mono>Photo 1 of {provider.portfolioCount}</Mono>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className={`h-8 bg-box border rounded-md ${i === 0 ? 'border-gold-border' : 'border-border-soft'}`} />
            ))}
          </div>
          <Mono>Portfolio · tap a photo to enlarge</Mono>
        </div>

        <div className="flex-1 min-w-[260px] flex flex-col gap-2">
          <H2>{provider.name}</H2>
          <Mono>
            ★ {provider.rating} ({provider.reviewCount} reviews) · Beauty · Verified {provider.email} · Joined {provider.joined}
          </Mono>
          <P>{provider.bio}</P>
          <div className="flex gap-2">
            <Button>Request a booking</Button>
            <Button variant="secondary">Message</Button>
            <Button variant="ghost" onClick={() => navigate('/account/report', { state: { providerId, providerName: provider.name } })}>
              Report
            </Button>
          </div>
        </div>
      </div>

      <Line />

      <div className="px-5 py-5 flex flex-col gap-2.5">
        <H3>Services</H3>
        <div className="flex flex-col gap-2">
          {provider.services.map((svc, i) => (
            <Card key={svc.id} className="flex-row items-center gap-3">
              <div className="flex-1">
                <H3>{svc.name}</H3>
                <Mono>{svc.duration} min</Mono>
              </div>
              <H3>${svc.price}</H3>
              <Button
                variant={i === 0 ? 'primary' : 'secondary'}
                onClick={() => navigate(`/listing/${providerId}/book/${svc.id}${dateOffset ? `?date=${dateOffset}` : ''}`)}
              >
                Pick a time
              </Button>
            </Card>
          ))}
        </div>
      </div>

      <Line />

      <div className="px-5 py-5 flex flex-col gap-2.5">
        <H3>Reviews</H3>
        <div className="grid grid-cols-2 gap-3">
          {provider.reviews.length === 0 && <Mono>No reviews yet.</Mono>}
          {provider.reviews.map((r) => (
            <Card key={r.id}>
              <Mono>
                {'★'.repeat(r.rating)}
                {'☆'.repeat(5 - r.rating)} · {r.author} · {new Date(r.when).toLocaleDateString()}
              </Mono>
              <P>{r.text}</P>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

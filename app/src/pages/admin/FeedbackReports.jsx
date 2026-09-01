import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardNav from '../../components/DashboardNav'
import { Button, Card, H3, Line, Mono, P, Tabs } from '../../components/ui'
import { useStore } from '../../lib/store'

const ADMIN_LINKS = [
  { to: '/admin', label: 'Applications' },
  { to: '/admin/reports', label: 'Reports' },
  { to: '/admin/suspensions', label: 'Suspensions' },
]

export default function FeedbackReports() {
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState('reports')

  const openReports = state.reports.filter((r) => r.status === 'open')

  function resolve(id, status) {
    dispatch({ type: 'RESOLVE_REPORT', payload: { id, status } })
  }

  function flagAction(id) {
    dispatch({ type: 'REVIEW_FLAG_ACTION', payload: { id } })
  }

  return (
    <div className="min-h-screen">
      <DashboardNav mode="admin" links={ADMIN_LINKS} />
      <Tabs
        tabs={[
          { value: 'reports', label: `Reports (${openReports.length})` },
          { value: 'reviews', label: 'All reviews' },
          { value: 'strikes', label: 'Strikes' },
          { value: 'suspensions', label: 'Suspensions' },
        ]}
        active={tab}
        onChange={(v) => (v === 'suspensions' ? navigate('/admin/suspensions') : setTab(v))}
      />

      <div className="p-5 flex flex-col gap-3">
        {tab === 'reports' && (
          <>
            {openReports.length === 0 && <Mono>No open reports.</Mono>}
            {openReports.map((r, i) => (
              <Card key={r.id} className={`flex-row gap-3 items-start ${i === 0 ? 'border-l-[3px] border-l-gold' : ''}`}>
                <div className="flex-1">
                  <H3>
                    {r.kind} · {r.providerName}
                  </H3>
                  <Mono>
                    Report #{r.id.replace('rpt-', '')} · {r.reporterName} · {r.bookingRef}
                  </Mono>
                  <P>“{r.description}”</P>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Button onClick={() => resolve(r.id, 'strike')}>Add strike</Button>
                  <Button variant="secondary">Message both</Button>
                  {r.kind !== 'No-show' && <Button variant="secondary">Ask provider to refund</Button>}
                  <Button variant="ghost" onClick={() => resolve(r.id, 'dismissed')}>
                    Dismiss
                  </Button>
                </div>
              </Card>
            ))}

            <Line />
            <H3>Reviews needing a look</H3>
            <div className="grid grid-cols-2 gap-3">
              {state.reviewFlags.length === 0 && <Mono>Nothing flagged.</Mono>}
              {state.reviewFlags.map((f) => (
                <Card key={f.id}>
                  <Mono>
                    {'★'.repeat(f.rating)}
                    {'☆'.repeat(5 - f.rating)} · {f.source} {f.when && `· ${f.when}`}
                  </Mono>
                  <P>{f.text}</P>
                  <div className="flex gap-1.5">
                    <Button variant="secondary" onClick={() => flagAction(f.id)}>
                      Keep
                    </Button>
                    <Button variant="secondary" onClick={() => flagAction(f.id)}>
                      Remove
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {tab === 'reviews' && <Mono>All reviews across providers would list here.</Mono>}
        {tab === 'strikes' && <Mono>Strike counters live on each provider/client record — see Suspensions.</Mono>}

        <Mono>
          Both directions of the three-strike rule live on the Suspensions tab. We hold no money, so refunds are between the two
          students — admin can only request one and log whether it happened. Every action here writes an audit row.
        </Mono>
      </div>
    </div>
  )
}

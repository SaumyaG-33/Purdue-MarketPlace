import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import DashboardNav from '../../components/DashboardNav'
import { Box, Button, Line, Mono, P, TextArea } from '../../components/ui'
import { useStore } from '../../lib/store'

const ADMIN_LINKS = [
  { to: '/admin', label: 'Applications' },
  { to: '/admin/reports', label: 'Reports' },
  { to: '/admin/suspensions', label: 'Suspensions' },
]

export default function ReviewApplication() {
  const { applicationId } = useParams()
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const [note, setNote] = useState('')

  const application = state.applications.find((a) => a.id === applicationId)
  if (!application) return <Navigate to="/admin" replace />

  function approve() {
    dispatch({ type: 'APPROVE_APPLICATION_TO_PROVIDER', payload: { applicationId } })
    navigate('/admin')
  }
  function requestInfo() {
    dispatch({ type: 'UPDATE_APPLICATION_STATUS', payload: { id: applicationId, status: 'needs_info', internalNote: note } })
    navigate('/admin')
  }
  function reject() {
    dispatch({ type: 'UPDATE_APPLICATION_STATUS', payload: { id: applicationId, status: 'rejected', internalNote: note } })
    navigate('/admin')
  }

  return (
    <div className="min-h-screen">
      <DashboardNav mode="admin" links={ADMIN_LINKS} />
      <div className="flex justify-center py-8 px-4">
        <div className="w-full max-w-[420px] border border-border-card rounded-lg bg-white p-5 flex flex-col gap-3">
          <p className="text-[16px] font-semibold">{application.businessName}</p>
          <Mono>
            {application.category} · {application.email} · applied {application.submittedAt}
          </Mono>
          <Line />
          <P>
            <b>Services:</b> {application.servicesText}
          </P>
          {application.description && (
            <P>
              <b>Notes:</b> “{application.description}”
            </P>
          )}
          <div className="grid grid-cols-2 gap-3">
            {application.docs.length > 0 ? (
              application.docs.map((doc) => (
                <div key={doc} className="h-16 bg-box border border-border-soft rounded-md flex items-end p-1.5">
                  <Mono>{doc}</Mono>
                </div>
              ))
            ) : (
              <div className="col-span-2">
                <Mono>No documents uploaded.</Mono>
              </div>
            )}
          </div>
          <TextArea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Internal note (never shown to the applicant)…"
            className="h-12"
          />
          <div className="flex gap-2">
            <Button onClick={approve}>Approve</Button>
            <Button variant="secondary" onClick={requestInfo}>
              Request info
            </Button>
            <Button variant="ghost" onClick={reject}>
              Reject
            </Button>
          </div>
          <Mono>Approving grants {application.category} only, and emails the welcome + availability setup link.</Mono>
        </div>
      </div>
    </div>
  )
}

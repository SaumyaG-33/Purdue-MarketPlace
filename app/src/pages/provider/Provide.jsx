import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import ClientNav from '../../components/ClientNav'
import { Box, Button, Card, Checkbox, Field, H2, H3, Mono, P, Select, TextArea } from '../../components/ui'
import { useMyProvider } from '../../lib/useMyProvider'
import { useAuth } from '../../lib/auth'
import { api } from '../../lib/api'
import { CATEGORIES } from '../../lib/data'

function ApplicationForm({ currentUser, onSubmitted }) {
  const [businessName, setBusinessName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0].id)
  const [ownerName, setOwnerName] = useState(currentUser?.name ?? '')
  const [phone, setPhone] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [servicesText, setServicesText] = useState('')
  const [description, setDescription] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!agreed) {
      setError('Please accept the provider terms to submit.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await api.post('/api/applications', { businessName, category, ownerName, phone, priceRange, servicesText, description })
      await onSubmitted()
    } catch (err) {
      setError(err.message || 'Could not submit application')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 p-5 max-w-3xl">
      <H2>Want to provide a service?</H2>
      <P>Every provider is reviewed by a real person — usually 2–3 days. It keeps the marketplace worth trusting.</P>
      <Mono>* required. Proof, photos, and notes are optional.</Mono>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Business / working name *">
          <input
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Maya's Nail Studio"
            className="border border-border-field bg-surface-muted rounded-md px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </Field>
        <Select label="Category *" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Field label="Owner name *">
          <input
            required
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className="border border-border-field bg-surface-muted rounded-md px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </Field>
        <Field label="School email *">
          <input
            disabled
            value={currentUser.email}
            className="border border-border-field bg-surface-alt rounded-md px-3 py-2.5 text-[13px] text-text-faint"
          />
        </Field>
        <Field label="Phone *">
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(765) …"
            className="border border-border-field bg-surface-muted rounded-md px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </Field>
        <Field label="Price range *">
          <input
            required
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            placeholder="$20 – $60"
            className="border border-border-field bg-surface-muted rounded-md px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </Field>
      </div>

      <TextArea
        label="What services are you offering? *"
        required
        value={servicesText}
        onChange={(e) => setServicesText(e.target.value)}
        className="h-[52px]"
        placeholder="List each one with a rough price and how long it takes."
      />
      <TextArea
        label="Description of services *"
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="h-[52px]"
        placeholder="How you work, where you work, what students should bring."
      />

      <Card className="bg-surface-muted">
        <H3>
          Category-specific proof <Mono className="inline">optional</Mono>
        </H3>
        <P>Transportation → license + insurance. Beauty → certification or photos. Pet care → vaccination policy.</P>
        <Box className="h-10 flex items-center px-2.5">
          <Mono>Upload files</Mono>
        </Box>
      </Card>

      <Checkbox
        checked={agreed}
        onChange={(e) => setAgreed(e.target.checked)}
        label="I've read the provider terms: I show up, I price honestly, and I accept the three-strike policy."
      />
      {error && <P className="text-red-600">{error}</P>}

      <div className="flex gap-2">
        <Button type="submit" className="px-6" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit application'}
        </Button>
        <Button type="button" variant="secondary">
          Save draft
        </Button>
      </div>
    </form>
  )
}

function StatusCard({ application, navigate }) {
  if (application.status === 'pending') {
    return (
      <Card className="max-w-md">
        <H3>Pending</H3>
        <H2>We're reviewing your application</H2>
        <Mono>Submitted {application.submittedAt} · usually 2–3 days</Mono>
        <P>We'll email {application.email} either way. You can still browse and book as a client.</P>
      </Card>
    )
  }
  if (application.status === 'needs_info') {
    return (
      <Card className="max-w-md">
        <H3>Needs info</H3>
        <H2>One thing missing</H2>
        <P>{application.internalNote || 'A document was unreadable. Re-upload and we\'ll finish the review.'}</P>
        <Button variant="secondary" className="self-start">
          Re-upload
        </Button>
      </Card>
    )
  }
  if (application.status === 'rejected') {
    return (
      <Card className="max-w-md">
        <H3>Not approved</H3>
        <P>{application.internalNote || 'Your application was not approved this time.'} You can reapply in 30 days.</P>
      </Card>
    )
  }
  return (
    <Card className="max-w-md bg-surface-muted">
      <H3>Approved</H3>
      <H2>You're approved for {application.category}</H2>
      <P>Add your Venmo or Zelle handle, paint your available hours, and you're live.</P>
      <div className="flex gap-2">
        <Button onClick={() => navigate('/provider/availability')}>Set up payment handles</Button>
        <Button variant="secondary" onClick={() => navigate('/provider/availability')}>
          Set availability
        </Button>
      </div>
    </Card>
  )
}

export default function Provide() {
  const { currentUser } = useAuth()
  const { provider, application, loading, refetchApplication } = useMyProvider()
  const navigate = useNavigate()

  if (provider) return <Navigate to="/provider/calendar" replace />

  if (!currentUser) {
    return (
      <div className="min-h-screen">
        <ClientNav />
        <div className="p-6 flex flex-col gap-3 items-start">
          <P>Log in first to apply as a provider.</P>
          <Button onClick={() => navigate('/login', { state: { redirect: '/provide' } })}>Log in</Button>
        </div>
      </div>
    )
  }

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

  return (
    <div className="min-h-screen">
      <ClientNav />
      {application ? (
        <div className="p-5">
          <StatusCard application={application} navigate={navigate} />
        </div>
      ) : (
        <ApplicationForm currentUser={currentUser} onSubmitted={refetchApplication} />
      )}
    </div>
  )
}

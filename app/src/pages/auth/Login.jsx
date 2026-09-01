import { useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import ClientNav from '../../components/ClientNav'
import { Button, Card, Checkbox, Field, H2, H3, Line, Mono, P, Tabs } from '../../components/ui'
import { useStore } from '../../lib/store'

const SCHOOL_DOMAINS = ['purdue.edu', 'ivytech.edu']

function isSchoolEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase()
  return SCHOOL_DOMAINS.includes(domain)
}

export default function Login() {
  const [params] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { dispatch } = useStore()

  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const holding = location.state?.holding
  const redirect = location.state?.redirect ?? '/account'

  function goAfterAuth() {
    navigate(redirect)
  }

  function handleLogin(e) {
    e.preventDefault()
    if (!isSchoolEmail(email)) {
      setError('Only @purdue.edu and @ivytech.edu can sign up')
      return
    }
    dispatch({ type: 'LOGIN', payload: { email } })
    goAfterAuth()
  }

  function handleSignup(e) {
    e.preventDefault()
    if (!isSchoolEmail(email)) {
      setError('Only @purdue.edu and @ivytech.edu can sign up')
      return
    }
    if (!agreed) {
      setError('Please agree to the terms to continue')
      return
    }
    setError('')
    dispatch({ type: 'SIGNUP', payload: { name, email } })
    setMode('verify')
  }

  function handleVerify(e) {
    e.preventDefault()
    dispatch({ type: 'VERIFY_EMAIL' })
    goAfterAuth()
  }

  function quickLogin(demoEmail) {
    dispatch({ type: 'LOGIN', payload: { email: demoEmail } })
    goAfterAuth()
  }

  return (
    <div className="min-h-screen">
      <ClientNav />
      <div className="flex justify-center py-10 px-4">
        <div className="w-full max-w-[420px] border border-border-card rounded-lg bg-white overflow-hidden shadow-sm">
          {holding && (
            <div className="flex flex-col gap-1.5 px-5 py-4 bg-surface-muted border-b border-border">
              <Mono>Holding your pick</Mono>
              <H3>{holding}</H3>
            </div>
          )}

          {mode !== 'verify' ? (
            <>
              <Tabs
                tabs={[
                  { value: 'login', label: 'Log in' },
                  { value: 'signup', label: 'Create account' },
                ]}
                active={mode}
                onChange={(v) => {
                  setMode(v)
                  setError('')
                }}
              />

              {mode === 'login' ? (
                <form onSubmit={handleLogin} className="flex flex-col gap-3 p-5">
                  <H2>Log in to send this request</H2>
                  <Field label="School email">
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@purdue.edu"
                      className="border border-border-field bg-surface-muted rounded-md px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </Field>
                  <Field label="Password">
                    <input
                      required
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border border-border-field bg-surface-muted rounded-md px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </Field>
                  {error && <P className="text-red-600">{error}</P>}
                  <Button type="submit">Log in & continue</Button>
                  <Mono>Forgot password · Why do we need a school email?</Mono>

                  <Line className="my-1" />
                  <Mono>Quick demo logins</Mono>
                  <div className="flex gap-2 flex-wrap">
                    <Button type="button" variant="secondary" onClick={() => quickLogin('jdoe@purdue.edu')}>
                      Client
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => quickLogin('maya@purdue.edu')}>
                      Provider
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => quickLogin('admin@purdue.edu')}>
                      Admin
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="flex flex-col gap-3 p-5 bg-surface-muted">
                  <H3>Create account</H3>
                  <Field label="Full name">
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border border-border-field bg-white rounded-md px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </Field>
                  <Field label="School email">
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@purdue.edu"
                      className="border border-border-field bg-white rounded-md px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </Field>
                  <Field label="Password">
                    <input
                      required
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border border-border-field bg-white rounded-md px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </Field>
                  <Checkbox
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    label="I'm 18+, and I agree to the Terms, Privacy Policy, and the liability disclaimer."
                  />
                  {error && <P className="text-red-600">{error}</P>}
                  <Button type="submit">Create account & continue</Button>
                  <Mono>Next: check your inbox for a 6-digit code.</Mono>
                </form>
              )}
            </>
          ) : (
            <form onSubmit={handleVerify} className="flex flex-col gap-3 p-5">
              <H2>Check your inbox</H2>
              <P>We sent a 6-digit code to your school email.</P>
              <Field label="Verification code">
                <input
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  className="border border-border-field bg-surface-muted rounded-md px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </Field>
              <Button type="submit">Verify & continue</Button>
              <Mono>Resend code</Mono>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { signUp, confirmSignUp, resendSignUpCode, signIn, signOut } from 'aws-amplify/auth'
import ClientNav from '../../components/ClientNav'
import { Button, Checkbox, Field, H2, H3, Mono, P, Tabs } from '../../components/ui'
import { useAuth } from '../../lib/auth'

const SCHOOL_DOMAINS = ['purdue.edu', 'ivytech.edu']

const PASSWORD_HINT = 'At least 8 characters, with an uppercase letter, a lowercase letter, a number, and a special character.'

function isSchoolEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase()
  return SCHOOL_DOMAINS.includes(domain)
}

// Amplify refuses to sign in while a Cognito session already exists in the
// browser (stale login, different account, etc.) — it throws instead of just
// switching accounts. Clear the stale session and retry once.
async function signInFresh(username, password) {
  try {
    await signIn({ username, password })
  } catch (err) {
    if (err.name === 'UserAlreadyAuthenticatedException') {
      await signOut()
      await signIn({ username, password })
    } else {
      throw err
    }
  }
}

function isValidPassword(password) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  )
}

export default function Login() {
  const [params] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { refresh } = useAuth()

  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const holding = location.state?.holding
  const redirect = location.state?.redirect ?? '/account'

  async function goAfterAuth() {
    await refresh()
    navigate(redirect)
  }

  async function handleLogin(e) {
    e.preventDefault()
    if (!isSchoolEmail(email)) {
      setError('Only @purdue.edu and @ivytech.edu can sign up')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await signInFresh(email, password)
      await goAfterAuth()
    } catch (err) {
      setError(err.message || 'Could not log in')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSignup(e) {
    e.preventDefault()
    if (!isSchoolEmail(email)) {
      setError('Only @purdue.edu and @ivytech.edu can sign up')
      return
    }
    if (!agreed) {
      setError('Please agree to the terms to continue')
      return
    }
    if (!isValidPassword(password)) {
      setError(PASSWORD_HINT)
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await signUp({
        username: email,
        password,
        options: { userAttributes: { email, name } },
      })
      setMode('verify')
    } catch (err) {
      setError(err.message || 'Could not create account')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleVerify(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await confirmSignUp({ username: email, confirmationCode: code })
      await signInFresh(email, password)
      await goAfterAuth()
    } catch (err) {
      setError(err.message || 'Could not verify code')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResendCode() {
    setError('')
    try {
      await resendSignUpCode({ username: email })
    } catch (err) {
      setError(err.message || 'Could not resend code')
    }
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
                      className="border border-border-field bg-surface-muted rounded-md px-3 py-2.5 text-[13px] placeholder:text-text-mono focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </Field>
                  <Field label="Password">
                    <input
                      required
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border border-border-field bg-surface-muted rounded-md px-3 py-2.5 text-[13px] placeholder:text-text-mono focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </Field>
                  {error && <P className="text-red-600">{error}</P>}
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Logging in…' : 'Log in & continue'}
                  </Button>
                  <Mono>Forgot password · Why do we need a school email?</Mono>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="flex flex-col gap-3 p-5 bg-surface-muted">
                  <H3>Create account</H3>
                  <Field label="Full name">
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border border-border-field bg-white rounded-md px-3 py-2.5 text-[13px] placeholder:text-text-mono focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </Field>
                  <Field label="School email">
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@purdue.edu"
                      className="border border-border-field bg-white rounded-md px-3 py-2.5 text-[13px] placeholder:text-text-mono focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </Field>
                  <Field label="Password">
                    <input
                      required
                      type="password"
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border border-border-field bg-white rounded-md px-3 py-2.5 text-[13px] placeholder:text-text-mono focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </Field>
                  <Mono>{PASSWORD_HINT}</Mono>
                  <Checkbox
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    label="I'm 18+, and I agree to the Terms, Privacy Policy, and the liability disclaimer."
                  />
                  {error && <P className="text-red-600">{error}</P>}
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Creating account…' : 'Create account & continue'}
                  </Button>
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
                  className="border border-border-field bg-surface-muted rounded-md px-3 py-2.5 text-[13px] placeholder:text-text-mono focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </Field>
              {error && <P className="text-red-600">{error}</P>}
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Verifying…' : 'Verify & continue'}
              </Button>
              <button type="button" onClick={handleResendCode} className="text-left">
                <Mono>Resend code</Mono>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

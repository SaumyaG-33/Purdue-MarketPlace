import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './auth'
import { api } from './api'

export function useMyProvider() {
  const { currentUser } = useAuth()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)

  const refetchApplication = useCallback(() => {
    if (!currentUser) return Promise.resolve()
    return api.get('/api/applications/mine').then((apps) => setApplication(apps[0] ?? null))
  }, [currentUser])

  useEffect(() => {
    if (!currentUser || currentUser.provider) {
      setLoading(false)
      return
    }
    let cancelled = false
    refetchApplication().finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [currentUser, refetchApplication])

  if (!currentUser) return { provider: null, application: null, loading: false, refetchApplication }
  return { provider: currentUser.provider ?? null, application, loading, refetchApplication }
}

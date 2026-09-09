import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getCurrentUser, signOut as amplifySignOut } from 'aws-amplify/auth'
import { api } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      await getCurrentUser() // throws if nobody is signed in
      const me = await api.get('/api/me')
      setCurrentUser(me)
    } catch {
      setCurrentUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function signOut() {
    await amplifySignOut()
    setCurrentUser(null)
  }

  return <AuthContext.Provider value={{ currentUser, loading, refresh, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

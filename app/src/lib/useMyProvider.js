import { useStore } from './store'

export function useMyProvider() {
  const { state, currentUser } = useStore()
  if (!currentUser) return { provider: null, application: null }

  const provider = Object.values(state.providers).find((p) => p.email === currentUser.email) ?? null
  const application =
    [...state.applications].filter((a) => a.email === currentUser.email).sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))[0] ?? null

  return { provider, application }
}

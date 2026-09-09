import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function RequireAdmin({ children }) {
  const { currentUser, loading } = useAuth()
  const location = useLocation()

  if (loading) return null
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/login" state={{ redirect: location.pathname }} replace />
  }
  return children
}

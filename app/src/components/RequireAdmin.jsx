import { Navigate, useLocation } from 'react-router-dom'
import { useStore } from '../lib/store'

export default function RequireAdmin({ children }) {
  const { currentUser } = useStore()
  const location = useLocation()

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/login" state={{ redirect: location.pathname }} replace />
  }
  return children
}

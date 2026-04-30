import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../lib/auth'

export default function ProtectedRoute({ allowedRoles }: { allowedRoles: UserRole[] }) {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return null
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!allowedRoles.includes(session.role)) {
    const fallback = session.role === 'admin' ? '/admin' : '/dashboard'
    return <Navigate to={fallback} replace />
  }

  return <Outlet />
}
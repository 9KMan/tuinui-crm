import { useAtomValue } from 'jotai'
import { Navigate, Outlet } from 'react-router-dom'
import { isAuthenticatedAtom } from '../../stores/authStore'

export function ProtectedRoute() {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

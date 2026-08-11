import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * ProtectedRoute — Role-based route guard
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Admin trying to access regular route -> redirect to admin
  if (!adminOnly && user?.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  // User trying to access admin route -> redirect to user dashboard
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

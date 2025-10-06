import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthProvider'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useContext(AuthContext)

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles.length && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />

  return children
}

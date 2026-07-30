import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import api from '../services/api'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem('token')
  const [checking, setChecking] = useState(adminOnly)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!token || !adminOnly) return
    api.get('/api/auth/me')
      .then((res) => setIsAdmin(res.data.role === 'admin'))
      .catch(() => setIsAdmin(false))
      .finally(() => setChecking(false))
  }, [token, adminOnly])

  if (!token) {
    return <Navigate to="/login" replace />
  }
  if (adminOnly) {
    if (checking) return null
    if (!isAdmin) return <Navigate to="/dashboard" replace />
  }
  return children
}
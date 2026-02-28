import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Box, Typography, Button } from '@mui/material'
import LockIcon from '@mui/icons-material/Lock'

// ── PrivateRoute — Protects routes based on role ───────────────────────────
export default function PrivateRoute({ allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) return null

  // Not logged in → redirect to login
  if (!user) return <Navigate to="/login" replace />

  // Logged in but wrong role → show forbidden
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <ForbiddenPage />
  }

  return <Outlet />
}

function ForbiddenPage() {
  const { user, logout } = useAuth()
  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 100%)',
      gap: 2
    }}>
      <Box sx={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'linear-gradient(135deg, #f44336, #b71c1c)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        mb: 2
      }}>
        <LockIcon sx={{ fontSize: 40, color: 'white' }} />
      </Box>
      <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
        Access Denied
      </Typography>
      <Typography sx={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
        Your role <strong style={{ color: '#f87171' }}>{user?.role}</strong> does not have
        permission to access this page.
      </Typography>
      <Button
        variant="contained"
        onClick={logout}
        sx={{ mt: 2, background: 'linear-gradient(135deg, #38bdf8, #0284c7)' }}
      >
        Logout &amp; Switch Account
      </Button>
    </Box>
  )
}
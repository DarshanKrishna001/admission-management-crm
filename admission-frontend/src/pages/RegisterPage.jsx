import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box, Card, TextField, Button, Typography, Alert,
  InputAdornment, IconButton, CircularProgress,
  ToggleButton, ToggleButtonGroup, Divider
} from '@mui/material'
import PersonIcon             from '@mui/icons-material/Person'
import LockIcon               from '@mui/icons-material/Lock'
import EmailIcon              from '@mui/icons-material/Email'
import BadgeIcon              from '@mui/icons-material/Badge'
import VisibilityIcon         from '@mui/icons-material/Visibility'
import VisibilityOffIcon      from '@mui/icons-material/VisibilityOff'
import SchoolIcon             from '@mui/icons-material/School'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import SupervisorAccountIcon  from '@mui/icons-material/SupervisorAccount'
import BarChartIcon           from '@mui/icons-material/BarChart'
import CheckCircleIcon        from '@mui/icons-material/CheckCircle'
import { useAuth } from '../context/AuthContext'

const ROLES = [
  {
    value: 'ADMIN',
    label: 'Admin',
    icon: <AdminPanelSettingsIcon />,
    color: '#38bdf8',
    desc: 'Full access — master setup, seat matrix, all operations',
  },
  {
    value: 'ADMISSION_OFFICER',
    label: 'Admission Officer',
    icon: <SupervisorAccountIcon />,
    color: '#a78bfa',
    desc: 'Create applicants, verify docs, allocate seats, confirm admissions',
  },
  {
    value: 'MANAGEMENT',
    label: 'Management',
    icon: <BarChartIcon />,
    color: '#34d399',
    desc: 'View-only access to the dashboard and reports',
  },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [form, setForm] = useState({
    username: '', fullName: '', email: '',
    password: '', confirmPassword: '',
    role: 'ADMISSION_OFFICER',
  })
  const [showPass, setShowPass]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState(false)
  const [registeredUsername, setRegisteredUsername] = useState('')

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const handleRole   = (_, v) => { if (v) setForm(f => ({ ...f, role: v })) }

  const validate = () => {
    if (!form.username.trim())  return 'Username is required'
    if (!form.fullName.trim())  return 'Full name is required'
    if (!form.email.trim())     return 'Email is required'
    if (!form.password)         return 'Password is required'
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email address'
    if (form.password.length < 6) return 'Password must be at least 6 characters'
    if (form.password !== form.confirmPassword) return 'Passwords do not match'
    return null
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setError('')
    setLoading(true)
    try {
      await register({
        username: form.username.trim(),
        fullName: form.fullName.trim(),
        email:    form.email.trim(),
        password: form.password,
        role:     form.role,
      })
      // Registration successful — show success screen, do NOT login
      setRegisteredUsername(form.username.trim())
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedRole = ROLES.find(r => r.value === form.role)

  // ── Success screen — shown after registration ──────────────────────────────
  if (success) {
    return (
      <Box sx={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg,#0a0f1e 0%,#0d1b2a 50%,#111827 100%)',
        p: 3
      }}>
        <Card sx={{
          width: '100%', maxWidth: 440, textAlign: 'center',
          background: 'linear-gradient(135deg,rgba(17,24,39,0.97),rgba(15,23,42,0.97))',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, p: 5,
        }}>
          {/* Success icon */}
          <Box sx={{
            width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 3,
            background: 'linear-gradient(135deg,#34d399,#059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(52,211,153,0.3)'
          }}>
            <CheckCircleIcon sx={{ fontSize: 44, color: 'white' }} />
          </Box>

          <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
            Account Created!
          </Typography>

          <Typography sx={{ color: 'rgba(255,255,255,0.5)', mb: 3, lineHeight: 1.8 }}>
            Your account{' '}
            <Box component="span" sx={{
              color: selectedRole?.color || '#38bdf8',
              fontWeight: 700, fontFamily: 'monospace'
            }}>
              {registeredUsername}
            </Box>
            {' '}has been registered as{' '}
            <Box component="span" sx={{ color: selectedRole?.color || '#38bdf8', fontWeight: 700 }}>
              {selectedRole?.label}
            </Box>.
          </Typography>

          {/* Credentials reminder box */}
          <Box sx={{
            background: 'rgba(56,189,248,0.06)',
            border: '1px solid rgba(56,189,248,0.2)',
            borderRadius: 2, p: 2, mb: 3, textAlign: 'left'
          }}>
            <Typography sx={{ color: '#38bdf8', fontWeight: 700, fontSize: 12, mb: 1, letterSpacing: 0.8 }}>
              YOUR LOGIN CREDENTIALS
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, mb: 0.5 }}>
              Username: <Box component="span" sx={{ color: 'white', fontWeight: 600, fontFamily: 'monospace' }}>
                {registeredUsername}
              </Box>
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
              Role: <Box component="span" sx={{ color: selectedRole?.color, fontWeight: 600 }}>
                {selectedRole?.label}
              </Box>
            </Typography>
          </Box>

          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate('/login', { state: { registered: true, username: registeredUsername } })}
            sx={{
              py: 1.5, fontWeight: 700, fontSize: 15,
              background: 'linear-gradient(135deg,#38bdf8,#0284c7)',
              '&:hover': { background: 'linear-gradient(135deg,#0284c7,#0369a1)' }
            }}
          >
            Go to Login
          </Button>

          <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, mt: 2 }}>
            Use your username and password to sign in
          </Typography>
        </Card>
      </Box>
    )
  }

  // ── Registration form ──────────────────────────────────────────────────────
  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg,#0a0f1e 0%,#0d1b2a 50%,#111827 100%)',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* bg blobs */}
      {[
        { top: '-8%',  left: '-4%',  size: 380, c: 'rgba(56,189,248,0.06)'  },
        { top: '65%',  right: '-4%', size: 320, c: 'rgba(167,139,250,0.06)' },
        { top: '35%',  left: '42%',  size: 260, c: 'rgba(52,211,153,0.04)'  },
      ].map((b, i) => (
        <Box key={i} sx={{
          position:'absolute', borderRadius:'50%', pointerEvents:'none',
          width:b.size, height:b.size, background:b.c,
          top:b.top, left:b.left, right:b.right, filter:'blur(60px)'
        }}/>
      ))}

      {/* Left branding */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' }, flex: 1,
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        p: 6, gap: 3
      }}>
        <Box sx={{
          width: 80, height: 80, borderRadius: '22px',
          background: 'linear-gradient(135deg,#38bdf8,#0284c7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 40px rgba(56,189,248,0.25)'
        }}>
          <SchoolIcon sx={{ fontSize: 44, color: 'white' }} />
        </Box>
        <Typography variant="h3" sx={{ color: 'white', fontWeight: 800 }}>
          AdmissionPro
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', maxWidth: 300, lineHeight: 1.9 }}>
          Create your account and choose the role that matches your responsibilities
        </Typography>

        {/* Role cards — highlights selected */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%', maxWidth: 340 }}>
          {ROLES.map(r => (
            <Box key={r.value} sx={{
              p: 2, borderRadius: 2,
              border: form.role === r.value
                ? `1px solid ${r.color}60`
                : '1px solid rgba(255,255,255,0.06)',
              background: form.role === r.value ? `${r.color}10` : 'rgba(255,255,255,0.02)',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }} onClick={() => setForm(f => ({ ...f, role: r.value }))}>
              <Typography sx={{ color: r.color, fontWeight: 700, fontSize: 12, mb: 0.4 }}>
                {r.label}
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, lineHeight: 1.6 }}>
                {r.desc}
              </Typography>
            </Box>
          ))}
        </Box>

        <Typography sx={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, mt: 1 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
            Sign in here
          </Link>
        </Typography>
      </Box>

      {/* Right form */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Card sx={{
          width: '100%', maxWidth: 460,
          background: 'linear-gradient(135deg,rgba(17,24,39,0.97),rgba(15,23,42,0.97))',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, p: 4,
          backdropFilter: 'blur(20px)'
        }}>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 0.5 }}>
            Create Account
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.4)', mb: 3, fontSize: 13 }}>
            Fill in your details and select your role
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Role Selector */}
            <Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, mb: 1, fontWeight: 600, letterSpacing: 0.8 }}>
                SELECT YOUR ROLE
              </Typography>
              <ToggleButtonGroup
                value={form.role} exclusive onChange={handleRole}
                sx={{ width: '100%', gap: 1, display: 'flex' }}
              >
                {ROLES.map(r => (
                  <ToggleButton key={r.value} value={r.value} sx={{
                    flex: 1, py: 1.2, flexDirection: 'column', gap: 0.5,
                    borderRadius: '10px !important',
                    border: form.role === r.value
                      ? `1px solid ${r.color} !important`
                      : '1px solid rgba(255,255,255,0.1) !important',
                    background: form.role === r.value ? `${r.color}15` : 'transparent',
                    color: form.role === r.value ? r.color : 'rgba(255,255,255,0.4)',
                    '&:hover': { background: `${r.color}10` },
                    '&.Mui-selected': { background: `${r.color}15`, color: r.color },
                  }}>
                    {React.cloneElement(r.icon, { sx: { fontSize: 20 } })}
                    <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {r.value === 'ADMISSION_OFFICER' ? 'Officer' : r.label}
                    </Typography>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              {selectedRole && (
                <Typography sx={{
                  mt: 1, fontSize: 11, color: selectedRole.color,
                  background: `${selectedRole.color}10`,
                  border: `1px solid ${selectedRole.color}30`,
                  borderRadius: 1, p: '6px 10px'
                }}>
                  {selectedRole.desc}
                </Typography>
              )}
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)' }} />

            {/* Full Name */}
            <TextField
              name="fullName" label="Full Name" value={form.fullName}
              onChange={handleChange} required fullWidth
              InputProps={{ startAdornment: (
                <InputAdornment position="start">
                  <BadgeIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 20 }} />
                </InputAdornment>
              )}}
            />

            {/* Username */}
            <TextField
              name="username" label="Username" value={form.username}
              onChange={handleChange} required fullWidth autoFocus
              InputProps={{ startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 20 }} />
                </InputAdornment>
              )}}
            />

            {/* Email */}
            <TextField
              name="email" label="Email Address" type="email" value={form.email}
              onChange={handleChange} required fullWidth
              InputProps={{ startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 20 }} />
                </InputAdornment>
              )}}
            />

            {/* Password */}
            <TextField
              name="password" label="Password" type={showPass ? 'text' : 'password'}
              value={form.password} onChange={handleChange} required fullWidth
              helperText="Minimum 6 characters"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(s => !s)} size="small">
                      {showPass
                        ? <VisibilityOffIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} />
                        : <VisibilityIcon   sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            {/* Confirm Password */}
            <TextField
              name="confirmPassword" label="Confirm Password"
              type={showConfirm ? 'text' : 'password'}
              value={form.confirmPassword} onChange={handleChange} required fullWidth
              error={form.confirmPassword !== '' && form.password !== form.confirmPassword}
              helperText={
                form.confirmPassword !== '' && form.password !== form.confirmPassword
                  ? 'Passwords do not match' : ''
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm(s => !s)} size="small">
                      {showConfirm
                        ? <VisibilityOffIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} />
                        : <VisibilityIcon   sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit" variant="contained" fullWidth disabled={loading}
              sx={{
                py: 1.5, mt: 0.5, fontWeight: 700, fontSize: 15,
                background: selectedRole
                  ? `linear-gradient(135deg,${selectedRole.color},${selectedRole.color}bb)`
                  : 'linear-gradient(135deg,#38bdf8,#0284c7)',
                '&:hover': { opacity: 0.9 }
              }}
            >
              {loading
                ? <CircularProgress size={22} sx={{ color: 'white' }} />
                : `Register as ${selectedRole?.label}`}
            </Button>
          </Box>

          <Divider sx={{ my: 2.5, borderColor: 'rgba(255,255,255,0.08)' }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>OR</Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
                Sign in here
              </Link>
            </Typography>
          </Box>
        </Card>
      </Box>
    </Box>
  )
}
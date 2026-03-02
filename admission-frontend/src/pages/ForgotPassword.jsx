import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box, Card, Typography, TextField, Button, Alert,
  InputAdornment, IconButton, CircularProgress,
  Step, StepLabel, Stepper
} from '@mui/material'
import EmailRoundedIcon        from '@mui/icons-material/EmailRounded'
import LockRoundedIcon         from '@mui/icons-material/LockRounded'
import Visibility              from '@mui/icons-material/Visibility'
import VisibilityOff           from '@mui/icons-material/VisibilityOff'
import ArrowBackRoundedIcon    from '@mui/icons-material/ArrowBackRounded'
import CheckCircleRoundedIcon  from '@mui/icons-material/CheckCircleRounded'
import RefreshRoundedIcon      from '@mui/icons-material/RefreshRounded'
import SchoolIcon              from '@mui/icons-material/School'
import axios from 'axios'

const STEPS = ['Enter Email', 'Verify OTP', 'New Password']

export default function ForgotPassword() {
  const navigate = useNavigate()

  const [step,    setStep]    = useState(0)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [info,    setInfo]    = useState('')   // success/info messages for steps 0 & 1

  // Step 0
  const [email, setEmail] = useState('')

  // Step 1 — individual OTP digit boxes
  const [otp,     setOtp]     = useState(['', '', '', '', '', ''])
  const [resendCd, setResendCd] = useState(0)
  const otpRefs  = useRef([])
  const timerRef = useRef(null)

  // Step 2
  const [newPass,  setNewPass]  = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showPass, setShowPass] = useState(false)

  // ── Resend countdown ───────────────────────────────────────────────────────
  useEffect(() => {
    if (resendCd > 0) {
      timerRef.current = setTimeout(() => setResendCd(c => c - 1), 1000)
    }
    return () => clearTimeout(timerRef.current)
  }, [resendCd])

  const clearMessages = () => { setError(''); setInfo('') }

  // ── Step 0: Send OTP ───────────────────────────────────────────────────────
  const sendOtp = async () => {
    if (!email.trim()) { setError('Please enter your email address'); return }
    clearMessages()
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/forgot-password', { email: email.trim() })
      setInfo(res.data.message)
      setStep(1)
      setResendCd(60)
      // focus first OTP box after transition
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch (e) {
      setError(
        e.response?.data?.message ||
        e.response?.data?.error   ||
        'Could not send OTP. Check the email address and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ── OTP box handlers ───────────────────────────────────────────────────────
  const handleOtpChange = (i, val) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[i] = val.slice(-1)
    setOtp(next)
    if (val && i < 5) otpRefs.current[i + 1]?.focus()
  }

  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setOtp(text.split(''))
      otpRefs.current[5]?.focus()
    }
  }

  // ── Step 1: Verify OTP ─────────────────────────────────────────────────────
  const verifyOtp = async () => {
    const otpStr = otp.join('')
    if (otpStr.length < 6) { setError('Please enter all 6 digits'); return }
    clearMessages()
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/verify-otp', { email, otp: otpStr })
      setInfo(res.data.message)
      setStep(2)
    } catch (e) {
      setError(
        e.response?.data?.message ||
        e.response?.data?.error   ||
        'Invalid or expired OTP. Try again.'
      )
      setOtp(['', '', '', '', '', ''])
      setTimeout(() => otpRefs.current[0]?.focus(), 50)
    } finally {
      setLoading(false)
    }
  }

  // ── Resend OTP ─────────────────────────────────────────────────────────────
  const resendOtp = async () => {
    clearMessages()
    setOtp(['', '', '', '', '', ''])
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/forgot-password', { email })
      setInfo(res.data.message)
      setResendCd(60)
      setTimeout(() => otpRefs.current[0]?.focus(), 50)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: Reset Password ─────────────────────────────────────────────────
  const resetPassword = async () => {
    if (!newPass)            { setError('Please enter a new password');            return }
    if (newPass.length < 6)  { setError('Password must be at least 6 characters'); return }
    if (newPass !== confirm)  { setError('Passwords do not match');                 return }
    clearMessages()
    setLoading(true)
    try {
      await axios.post('/api/auth/reset-password', { email, newPassword: newPass })
      setStep(3)
    } catch (e) {
      setError(
        e.response?.data?.message ||
        e.response?.data?.error   ||
        'Reset failed. Please restart the process.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ── Shared card wrapper ────────────────────────────────────────────────────
  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg,#0a0f1e 0%,#0d1b2a 50%,#111827 100%)',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* bg blobs */}
      {[
        { top: '-8%', left: '-4%',  size: 380, c: 'rgba(56,189,248,0.06)'  },
        { top: '60%', right: '-4%', size: 320, c: 'rgba(167,139,250,0.06)' },
      ].map((b, i) => (
        <Box key={i} sx={{
          position: 'absolute', borderRadius: '50%', pointerEvents: 'none',
          width: b.size, height: b.size, background: b.c,
          top: b.top, left: b.left, right: b.right, filter: 'blur(60px)'
        }}/>
      ))}

      {/* ── Left branding panel (same as Login) ───────────────────────────── */}
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
        <Typography variant="h3" sx={{ color: 'white', fontWeight: 800, textAlign: 'center' }}>
          AdmissionPro
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.45)', textAlign: 'center', maxWidth: 300, lineHeight: 1.9 }}>
          Reset your password securely with a one-time OTP sent to your registered email.
        </Typography>

        {/* Steps description */}
        {[
          { num: '1', color: '#38bdf8', text: 'Enter your registered email address'     },
          { num: '2', color: '#a78bfa', text: 'Enter the 6-digit OTP sent to your inbox' },
          { num: '3', color: '#34d399', text: 'Set your new password and sign in'        },
        ].map(s => (
          <Box key={s.num} sx={{
            display: 'flex', gap: 2, alignItems: 'flex-start',
            width: '100%', maxWidth: 320,
          }}>
            <Box sx={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: `${s.color}20`, border: `1px solid ${s.color}50`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Typography sx={{ color: s.color, fontWeight: 800, fontSize: 12 }}>{s.num}</Typography>
            </Box>
            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.7, pt: 0.3 }}>
              {s.text}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* ── Right: form card ──────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Card sx={{
          width: '100%', maxWidth: 440,
          background: 'linear-gradient(135deg,rgba(17,24,39,0.97),rgba(15,23,42,0.97))',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, p: 4,
          backdropFilter: 'blur(20px)'
        }}>

          {/* Back button */}
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => step === 0 ? navigate('/login') : setStep(s => s - 1)}
            sx={{ color: '#64748b', mb: 2.5, p: 0, minWidth: 0, '&:hover': { color: '#38bdf8', background: 'none' } }}
          >
            {step === 0 ? 'Back to Login' : 'Back'}
          </Button>

          {/* Title */}
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 0.5 }}>
            {step === 3 ? 'Password Reset!' : 'Forgot Password'}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, mb: 3 }}>
            {step === 0 && 'Enter your registered email to receive an OTP'}
            {step === 1 && <>OTP sent to <Box component="span" sx={{ color: '#38bdf8', fontWeight: 600 }}>{maskEmail(email)}</Box></>}
            {step === 2 && 'OTP verified — set your new password below'}
            {step === 3 && 'Your password has been reset successfully'}
          </Typography>

          {/* Stepper */}
          {step < 3 && (
            <Stepper activeStep={step} alternativeLabel sx={{
              mb: 3,
              '& .MuiStepLabel-label':           { color: '#475569', fontSize: 11 },
              '& .MuiStepLabel-label.Mui-active': { color: '#38bdf8'              },
              '& .MuiStepLabel-label.Mui-completed': { color: '#34d399'           },
              '& .MuiStepIcon-root':              { color: '#1e293b'              },
              '& .MuiStepIcon-root.Mui-active':   { color: '#38bdf8'              },
              '& .MuiStepIcon-root.Mui-completed':{ color: '#34d399'              },
              '& .MuiStepConnector-line':         { borderColor: 'rgba(255,255,255,0.08)' },
            }}>
              {STEPS.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
            </Stepper>
          )}

          {/* Alerts */}
          {error && (
            <Alert severity="error"   sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {info && step < 3 && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setInfo('')}>
              {info}
            </Alert>
          )}

          {/* ── STEP 0: Email input ────────────────────────────────────────── */}
          {step === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Registered Email Address"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendOtp()}
                fullWidth autoFocus
                placeholder="e.g. darshank305@gmail.com"
                InputProps={{ startAdornment: (
                  <InputAdornment position="start">
                    <EmailRoundedIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 20 }}/>
                  </InputAdornment>
                )}}
              />
              <Button
                variant="contained" fullWidth onClick={sendOtp} disabled={loading}
                sx={{
                  py: 1.5, fontWeight: 700, fontSize: 15,
                  background: 'linear-gradient(135deg,#38bdf8,#0284c7)',
                  '&:hover': { background: 'linear-gradient(135deg,#0284c7,#0369a1)' }
                }}
              >
                {loading ? <CircularProgress size={22} sx={{ color: 'white' }}/> : 'Send OTP'}
              </Button>
              <Typography sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                Remember your password?{' '}
                <Link to="/login" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
                  Sign in
                </Link>
              </Typography>
            </Box>
          )}

          {/* ── STEP 1: OTP boxes ─────────────────────────────────────────── */}
          {step === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, mb: 1.5, textAlign: 'center' }}>
                  Enter the 6-digit code • expires in 10 minutes
                </Typography>
                {/* 6 digit boxes */}
                <Box
                  sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}
                  onPaste={handleOtpPaste}
                >
                  {otp.map((digit, i) => (
                    <TextField
                      key={i}
                      inputRef={el => otpRefs.current[i] = el}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      inputProps={{
                        maxLength: 1,
                        style: {
                          textAlign: 'center',
                          fontSize: '1.6rem',
                          fontWeight: 800,
                          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                          padding: '14px 0',
                          color: digit ? '#34d399' : 'rgba(255,255,255,0.7)',
                        }
                      }}
                      sx={{
                        width: 54,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          background: digit ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.03)',
                          transition: 'all 0.15s',
                          '& fieldset': {
                            borderColor: digit ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.1)',
                            borderWidth: digit ? 2 : 1,
                          },
                          '&:hover fieldset':  { borderColor: 'rgba(56,189,248,0.4)' },
                          '&.Mui-focused fieldset': { borderColor: '#38bdf8' },
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="contained" fullWidth onClick={verifyOtp}
                  disabled={loading || otp.join('').length < 6}
                  sx={{
                    py: 1.5, fontWeight: 700, fontSize: 15,
                    background: 'linear-gradient(135deg,#38bdf8,#0284c7)',
                    '&:hover': { background: 'linear-gradient(135deg,#0284c7,#0369a1)' },
                    '&.Mui-disabled': { opacity: 0.5 }
                  }}
                >
                  {loading ? <CircularProgress size={22} sx={{ color: 'white' }}/> : 'Verify OTP'}
                </Button>

                <Button
                  variant="text" fullWidth onClick={resendOtp}
                  disabled={resendCd > 0 || loading}
                  startIcon={<RefreshRoundedIcon />}
                  sx={{
                    color: resendCd > 0 ? '#475569' : '#38bdf8',
                    fontWeight: 500,
                    '&:hover': { background: 'rgba(56,189,248,0.05)' }
                  }}
                >
                  {resendCd > 0 ? `Resend OTP in ${resendCd}s` : 'Resend OTP'}
                </Button>
              </Box>
            </Box>
          )}

          {/* ── STEP 2: New password ───────────────────────────────────────── */}
          {step === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="New Password"
                type={showPass ? 'text' : 'password'}
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                fullWidth autoFocus
                helperText="Minimum 6 characters"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockRoundedIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 20 }}/>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPass(p => !p)}>
                        {showPass
                          ? <VisibilityOff sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }}/>
                          : <Visibility   sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }}/>}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                label="Confirm New Password"
                type={showPass ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && resetPassword()}
                fullWidth
                error={confirm.length > 0 && newPass !== confirm}
                helperText={confirm.length > 0 && newPass !== confirm ? 'Passwords do not match' : ''}
                InputProps={{ startAdornment: (
                  <InputAdornment position="start">
                    <LockRoundedIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 20 }}/>
                  </InputAdornment>
                )}}
              />
              <Button
                variant="contained" fullWidth onClick={resetPassword} disabled={loading}
                sx={{
                  py: 1.5, fontWeight: 700, fontSize: 15,
                  background: 'linear-gradient(135deg,#34d399,#059669)',
                  '&:hover': { opacity: 0.9 }
                }}
              >
                {loading
                  ? <CircularProgress size={22} sx={{ color: 'white' }}/>
                  : 'Reset Password'}
              </Button>
            </Box>
          )}

          {/* ── STEP 3: Success ────────────────────────────────────────────── */}
          {step === 3 && (
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <Box sx={{
                width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 3,
                background: 'linear-gradient(135deg,#34d399,#059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 30px rgba(52,211,153,0.3)'
              }}>
                <CheckCircleRoundedIcon sx={{ fontSize: 44, color: 'white' }} />
              </Box>

              <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', mb: 1 }}>
                Password Updated Successfully!
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, mb: 3, lineHeight: 1.8 }}>
                Your password has been reset for{' '}
                <Box component="span" sx={{ color: '#38bdf8', fontWeight: 600 }}>
                  {maskEmail(email)}
                </Box>
                .{' '}You can now sign in with your new password.
              </Typography>

              <Button
                variant="contained" fullWidth
                onClick={() => navigate('/login')}
                sx={{
                  py: 1.5, fontWeight: 700, fontSize: 15,
                  background: 'linear-gradient(135deg,#38bdf8,#0284c7)',
                  '&:hover': { background: 'linear-gradient(135deg,#0284c7,#0369a1)' }
                }}
              >
                Go to Sign In
              </Button>
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  )
}

/** da****@gmail.com */
function maskEmail(email) {
  if (!email) return ''
  const at = email.indexOf('@')
  if (at <= 2) return email
  return email.slice(0, 2) + '****' + email.slice(at)
}
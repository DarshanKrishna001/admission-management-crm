import React, { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import {
  Box, Card, TextField, Button, Typography,
  Alert, InputAdornment, IconButton, CircularProgress, Divider
} from '@mui/material'
import PersonIcon        from '@mui/icons-material/Person'
import LockIcon          from '@mui/icons-material/Lock'
import VisibilityIcon    from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import SchoolIcon        from '@mui/icons-material/School'
import CheckCircleIcon   from '@mui/icons-material/CheckCircle'
import { useAuth } from '../context/AuthContext'

const ROLES_INFO = [
  { color: '#38bdf8', label: 'Admin',            desc: 'Full system access'  },
  { color: '#a78bfa', label: 'Admission Officer', desc: 'Student workflow'   },
  { color: '#34d399', label: 'Management',        desc: 'View only'          },
]

export default function LoginPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { login } = useAuth()

  const fromRegister   = location.state?.registered === true
  const registeredUser = location.state?.username || ''

  const [form,     setForm]     = useState({ username: registeredUser, password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.username.trim(), form.password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

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

      {/* ── Left branding panel ───────────────────────────────────────────── */}
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
        <Typography sx={{
          color: 'rgba(255,255,255,0.45)', textAlign: 'center',
          maxWidth: 300, lineHeight: 1.9
        }}>
          Role-based College Admission Management System
        </Typography>

        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%', maxWidth: 320 }}>
          {ROLES_INFO.map(r => (
            <Box key={r.label} sx={{
              p: 1.5, borderRadius: 2,
              border: `1px solid ${r.color}30`,
              background: `${r.color}08`,
              display: 'flex', gap: 1.5, alignItems: 'center'
            }}>
              <Box sx={{ width: 9, height: 9, borderRadius: '50%', background: r.color, flexShrink: 0 }}/>
              <Box>
                <Typography sx={{ color: r.color, fontWeight: 700, fontSize: 11, letterSpacing: 0.8 }}>
                  {r.label}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
                  {r.desc}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        <Typography sx={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, mt: 1, textAlign: 'center' }}>
          New user?{' '}
          <Link to="/register" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
            Create an account
          </Link>
        </Typography>
      </Box>

      {/* ── Right login card ──────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Card sx={{
          width: '100%', maxWidth: 420,
          background: 'linear-gradient(135deg,rgba(17,24,39,0.97),rgba(15,23,42,0.97))',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, p: 4,
          backdropFilter: 'blur(20px)'
        }}>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 0.5 }}>
            Sign In
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.4)', mb: 3, fontSize: 13 }}>
            Enter your credentials to access the system
          </Typography>

          {fromRegister && (
            <Alert
              icon={<CheckCircleIcon fontSize="inherit" />}
              severity="success"
              sx={{ mb: 2, borderRadius: 2 }}
            >
              Account created! Sign in with your credentials below.
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

            {/* Username */}
            <TextField
              name="username" label="Username" value={form.username}
              onChange={handleChange} required fullWidth
              autoFocus={!registeredUser}
              InputProps={{ startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 20 }}/>
                </InputAdornment>
              )}}
            />

            {/* Password + Forgot Password link */}
            <Box>
              <TextField
                name="password" label="Password"
                type={showPass ? 'text' : 'password'}
                value={form.password} onChange={handleChange} required fullWidth
                autoFocus={!!registeredUser}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 20 }}/>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPass(s => !s)} size="small">
                        {showPass
                          ? <VisibilityOffIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }}/>
                          : <VisibilityIcon   sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }}/>}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              {/* ── Forgot Password link sits right below the password field ── */}
              <Box sx={{ textAlign: 'right', mt: 0.8 }}>
                <Link
                  to="/forgot-password"
                  style={{
                    color: '#38bdf8',
                    fontSize: 12,
                    textDecoration: 'none',
                    fontWeight: 500,
                    letterSpacing: 0.2,
                  }}
                >
                  Forgot Password?
                </Link>
              </Box>
            </Box>

            <Button
              type="submit" variant="contained" fullWidth disabled={loading}
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg,#38bdf8,#0284c7)',
                fontWeight: 700, fontSize: 15,
                '&:hover': { background: 'linear-gradient(135deg,#0284c7,#0369a1)' }
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: 'white' }}/> : 'Sign In'}
            </Button>
          </Box>

          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.08)' }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>OR</Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
                Register here
              </Link>
            </Typography>
          </Box>
        </Card>
      </Box>
    </Box>
  )
}









// import React, { useState } from 'react'
// import { useNavigate, Link, useLocation } from 'react-router-dom'
// import {
//   Box, Card, TextField, Button, Typography,
//   Alert, InputAdornment, IconButton, CircularProgress, Divider
// } from '@mui/material'
// import PersonIcon        from '@mui/icons-material/Person'
// import LockIcon          from '@mui/icons-material/Lock'
// import VisibilityIcon    from '@mui/icons-material/Visibility'
// import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
// import SchoolIcon        from '@mui/icons-material/School'
// import CheckCircleIcon   from '@mui/icons-material/CheckCircle'
// import { useAuth } from '../context/AuthContext'

// const ROLES_INFO = [
//   { color: '#38bdf8', label: 'Admin',            desc: 'Full system access'  },
//   { color: '#a78bfa', label: 'Admission Officer', desc: 'Student workflow'   },
//   { color: '#34d399', label: 'Management',        desc: 'View only'          },
// ]

// export default function LoginPage() {
//   const navigate  = useNavigate()
//   const location  = useLocation()
//   const { login } = useAuth()

//   // Check if redirected from register page with success state
//   const fromRegister = location.state?.registered === true
//   const registeredUser = location.state?.username || ''

//   const [form, setForm]         = useState({ username: registeredUser, password: '' })
//   const [showPass, setShowPass] = useState(false)
//   const [loading, setLoading]   = useState(false)
//   const [error, setError]       = useState('')

//   const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

//   const handleSubmit = async e => {
//     e.preventDefault()
//     setError('')
//     setLoading(true)
//     try {
//       await login(form.username.trim(), form.password)
//       navigate('/dashboard', { replace: true })
//     } catch (err) {
//       setError(err.response?.data?.message || err.message || 'Invalid username or password')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <Box sx={{
//       minHeight: '100vh', display: 'flex',
//       background: 'linear-gradient(135deg,#0a0f1e 0%,#0d1b2a 50%,#111827 100%)',
//       position: 'relative', overflow: 'hidden'
//     }}>
//       {/* bg blobs */}
//       {[
//         { top: '-8%', left: '-4%', size: 380, c: 'rgba(56,189,248,0.06)'  },
//         { top: '60%', right:'-4%', size: 320, c: 'rgba(167,139,250,0.06)' },
//       ].map((b, i) => (
//         <Box key={i} sx={{
//           position:'absolute', borderRadius:'50%', pointerEvents:'none',
//           width:b.size, height:b.size, background:b.c,
//           top:b.top, left:b.left, right:b.right, filter:'blur(60px)'
//         }}/>
//       ))}

//       {/* Left branding */}
//       <Box sx={{
//         display: { xs:'none', md:'flex' }, flex: 1,
//         flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
//         p: 6, gap: 3
//       }}>
//         <Box sx={{
//           width: 80, height: 80, borderRadius: '22px',
//           background: 'linear-gradient(135deg,#38bdf8,#0284c7)',
//           display: 'flex', alignItems: 'center', justifyContent: 'center',
//           boxShadow: '0 0 40px rgba(56,189,248,0.25)'
//         }}>
//           <SchoolIcon sx={{ fontSize: 44, color: 'white' }} />
//         </Box>

//         <Typography variant="h3" sx={{ color:'white', fontWeight:800, textAlign:'center' }}>
//           AdmissionPro
//         </Typography>
//         <Typography sx={{ color:'rgba(255,255,255,0.45)', textAlign:'center', maxWidth:300, lineHeight:1.9 }}>
//           Role-based College Admission Management System
//         </Typography>

//         {/* Role cards */}
//         <Box sx={{ mt: 2, display:'flex', flexDirection:'column', gap:1.5, width:'100%', maxWidth:320 }}>
//           {ROLES_INFO.map(r => (
//             <Box key={r.label} sx={{
//               p: 1.5, borderRadius: 2,
//               border:`1px solid ${r.color}30`,
//               background:`${r.color}08`,
//               display:'flex', gap:1.5, alignItems:'center'
//             }}>
//               <Box sx={{ width:9, height:9, borderRadius:'50%', background:r.color, flexShrink:0 }}/>
//               <Box>
//                 <Typography sx={{ color:r.color, fontWeight:700, fontSize:11, letterSpacing:0.8 }}>
//                   {r.label}
//                 </Typography>
//                 <Typography sx={{ color:'rgba(255,255,255,0.4)', fontSize:11 }}>
//                   {r.desc}
//                 </Typography>
//               </Box>
//             </Box>
//           ))}
//         </Box>

//         <Typography sx={{ color:'rgba(255,255,255,0.25)', fontSize:12, mt:1, textAlign:'center' }}>
//           New user?{' '}
//           <Link to="/register" style={{ color:'#38bdf8', textDecoration:'none', fontWeight:600 }}>
//             Create an account
//           </Link>
//         </Typography>
//       </Box>

//       {/* Right login form */}
//       <Box sx={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', p:3 }}>
//         <Card sx={{
//           width:'100%', maxWidth:420,
//           background:'linear-gradient(135deg,rgba(17,24,39,0.97),rgba(15,23,42,0.97))',
//           border:'1px solid rgba(255,255,255,0.08)', borderRadius:3, p:4,
//           backdropFilter:'blur(20px)'
//         }}>
//           <Typography variant="h5" sx={{ color:'white', fontWeight:700, mb:0.5 }}>
//             Sign In
//           </Typography>
//           <Typography sx={{ color:'rgba(255,255,255,0.4)', mb:3, fontSize:13 }}>
//             Enter your credentials to access the system
//           </Typography>

//           {/* Registration success banner */}
//           {fromRegister && (
//             <Alert
//               icon={<CheckCircleIcon fontSize="inherit" />}
//               severity="success"
//               sx={{ mb: 2, borderRadius: 2 }}
//             >
//               Account created! Sign in with your credentials below.
//             </Alert>
//           )}

//           {error && (
//             <Alert severity="error" sx={{ mb:2, borderRadius:2 }} onClose={() => setError('')}>
//               {error}
//             </Alert>
//           )}

//           <Box component="form" onSubmit={handleSubmit} sx={{ display:'flex', flexDirection:'column', gap:2.5 }}>
//             <TextField
//               name="username" label="Username" value={form.username}
//               onChange={handleChange} required fullWidth
//               autoFocus={!registeredUser}
//               InputProps={{ startAdornment:(
//                 <InputAdornment position="start">
//                   <PersonIcon sx={{ color:'rgba(255,255,255,0.3)', fontSize:20 }}/>
//                 </InputAdornment>
//               )}}
//             />

//             <TextField
//               name="password" label="Password" type={showPass?'text':'password'}
//               value={form.password} onChange={handleChange} required fullWidth
//               autoFocus={!!registeredUser}
//               InputProps={{
//                 startAdornment:(
//                   <InputAdornment position="start">
//                     <LockIcon sx={{ color:'rgba(255,255,255,0.3)', fontSize:20 }}/>
//                   </InputAdornment>
//                 ),
//                 endAdornment:(
//                   <InputAdornment position="end">
//                     <IconButton onClick={() => setShowPass(s=>!s)} size="small">
//                       {showPass
//                         ? <VisibilityOffIcon sx={{ color:'rgba(255,255,255,0.3)', fontSize:18 }}/>
//                         : <VisibilityIcon   sx={{ color:'rgba(255,255,255,0.3)', fontSize:18 }}/>}
//                     </IconButton>
//                   </InputAdornment>
//                 )
//               }}
//             />

//             <Button
//               type="submit" variant="contained" fullWidth disabled={loading}
//               sx={{
//                 py:1.5, mt:0.5,
//                 background:'linear-gradient(135deg,#38bdf8,#0284c7)',
//                 fontWeight:700, fontSize:15,
//                 '&:hover':{ background:'linear-gradient(135deg,#0284c7,#0369a1)' }
//               }}
//             >
//               {loading ? <CircularProgress size={22} sx={{ color:'white' }}/> : 'Sign In'}
//             </Button>
//           </Box>

//           <Divider sx={{ my:3, borderColor:'rgba(255,255,255,0.08)' }}>
//             <Typography sx={{ color:'rgba(255,255,255,0.25)', fontSize:12 }}>OR</Typography>
//           </Divider>

//           <Box sx={{ textAlign:'center' }}>
//             <Typography sx={{ color:'rgba(255,255,255,0.4)', fontSize:13 }}>
//               Don't have an account?{' '}
//               <Link to="/register" style={{ color:'#38bdf8', textDecoration:'none', fontWeight:600 }}>
//                 Register here
//               </Link>
//             </Typography>
//           </Box>
//         </Card>
//       </Box>
//     </Box>
//   )
// }
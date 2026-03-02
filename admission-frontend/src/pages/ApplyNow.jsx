import React, { useState, useEffect } from 'react'
import {
  Box, Card, Typography, Button, TextField, MenuItem,
  Stepper, Step, StepLabel, Alert, CircularProgress,
  Divider, Chip, InputAdornment
} from '@mui/material'
import {
  SchoolRounded, PersonRounded, AssignmentRounded,
  CheckCircleRounded, ArrowForwardRounded, ArrowBackRounded,
} from '@mui/icons-material'
import axios from 'axios'

// ── Static options ─────────────────────────────────────────────────────────
const GENDER_OPTIONS   = ['MALE', 'FEMALE', 'OTHER']
const CATEGORY_OPTIONS = ['GM', 'SC', 'ST', 'OBC', 'EWS', 'NRI', 'MANAGEMENT']
const ENTRY_OPTIONS    = ['REGULAR', 'LATERAL']
const QUOTA_OPTIONS    = ['KCET', 'COMEDK', 'MANAGEMENT']
const STEPS            = ['Personal Details', 'Academic Details', 'Review & Submit']

const empty = v => !v || (typeof v === 'string' && !v.trim())
const label = s => s.charAt(0) + s.slice(1).toLowerCase()

// Public axios — no JWT
const publicApi = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } })
publicApi.interceptors.response.use(
  r => r,
  err => {
    const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Something went wrong'
    return Promise.reject(new Error(typeof msg === 'string' ? msg : JSON.stringify(msg)))
  }
)

export default function ApplyNow() {
  const [step,       setStep]       = useState(0)
  const [programs,   setPrograms]   = useState([])
  const [progError,  setProgError]  = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(null)
  const [errors,     setErrors]     = useState({})
  const [apiError,   setApiError]   = useState('')

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    dateOfBirth: '', gender: '', category: '', address: '', aadharNumber: '',
    entryType: '', quotaType: '', programId: '', qualifyingExam: '',
    qualifyingMarks: '', allotmentNumber: '',
  })

  // Load programs — attach JWT if present in localStorage
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    publicApi.get('/master/programs', { headers })
      .then(r => { setPrograms(r.data || []); setProgError(false) })
      .catch(() => setProgError(true))
  }, [])

  const set = (field, val) => {
    setForm(p => ({ ...p, [field]: val }))
    setErrors(p => ({ ...p, [field]: '' }))
  }

  const validateStep0 = () => {
    const e = {}
    if (empty(form.firstName))    e.firstName    = 'Required'
    if (empty(form.lastName))     e.lastName     = 'Required'
    if (empty(form.email))        e.email        = 'Required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (empty(form.phone))        e.phone        = 'Required'
    else if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Enter valid 10-digit mobile'
    if (empty(form.dateOfBirth))  e.dateOfBirth  = 'Required'
    if (empty(form.gender))       e.gender       = 'Required'
    if (empty(form.category))     e.category     = 'Required'
    if (empty(form.address))      e.address      = 'Required'
    if (empty(form.aadharNumber)) e.aadharNumber = 'Required'
    else if (!/^\d{12}$/.test(form.aadharNumber)) e.aadharNumber = 'Must be 12 digits'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep1 = () => {
    const e = {}
    if (empty(form.entryType))      e.entryType      = 'Required'
    if (empty(form.quotaType))      e.quotaType      = 'Required'
    if (empty(form.programId))      e.programId      = 'Required'
    if (empty(form.qualifyingExam)) e.qualifyingExam = 'Required'
    if (empty(String(form.qualifyingMarks))) e.qualifyingMarks = 'Required'
    else if (Number(form.qualifyingMarks) < 0 || Number(form.qualifyingMarks) > 100)
      e.qualifyingMarks = 'Must be 0–100'
    if ((form.quotaType === 'KCET' || form.quotaType === 'COMEDK') && empty(form.allotmentNumber))
      e.allotmentNumber = `${form.quotaType} allotment number is required`
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => {
    if (step === 0 && !validateStep0()) return
    if (step === 1 && !validateStep1()) return
    setStep(s => s + 1)
  }
  const back = () => setStep(s => s - 1)

  const submit = async () => {
    setSubmitting(true)
    setApiError('')
    try {
      const payload = {
        ...form,
        programId:       Number(form.programId),
        qualifyingMarks: Number(form.qualifyingMarks),
      }
      const token = localStorage.getItem('auth_token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await publicApi.post('/applicants', payload, { headers })
      setSubmitted({
        applicationId: res.data.id,
        firstName:     res.data.firstName,
        lastName:      res.data.lastName,
        email:         res.data.email,
        status:        res.data.status,
        message:
          'Your application has been submitted successfully! ' +
          'Please note your Application ID: ' + res.data.id + '. ' +
          'Our team will contact you for document verification.',
      })
    } catch (e) {
      setApiError(e.message || 'Submission failed. Please try again.')
      setStep(0)
    } finally {
      setSubmitting(false)
    }
  }


  const selectedProgram = programs.find(p => p.id === Number(form.programId))

  const statusColor = s => ({
    APPLIED: '#38bdf8', DOCUMENTS_PENDING: '#fb923c',
    DOCUMENTS_SUBMITTED: '#a78bfa', DOCUMENTS_VERIFIED: '#34d399',
    SEAT_ALLOCATED: '#34d399', FEE_PENDING: '#fb923c',
    ADMITTED: '#4ade80', CANCELLED: '#f87171',
  }[s] || '#64748b')

  // ── Success screen ──────────────────────────────────────────────────────
  if (submitted) {
    return (
      <Box sx={outerBox}>
        <Box sx={innerBox}>
          <Card sx={{ ...cardSx, textAlign: 'center', py: 6, px: 4 }}>
            <Box sx={{
              width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 3,
              background: 'linear-gradient(135deg,#34d399,#059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <CheckCircleRounded sx={{ fontSize: 44, color: '#fff' }} />
            </Box>
            <Typography variant="h4" sx={{ fontFamily:"'DM Serif Display',serif", color:'#f1f5f9', mb:1 }}>
              Application Submitted!
            </Typography>
            <Typography sx={{ color:'#94a3b8', mb:3, fontSize:'0.95rem' }}>
              {submitted.message}
            </Typography>
            <Box sx={{ p:2.5, borderRadius:2, background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.25)', mb:3 }}>
              <Typography sx={{ fontSize:12, color:'#64748b', mb:0.5, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                Your Application ID
              </Typography>
              <Typography sx={{ fontSize:'2rem', fontWeight:800, color:'#34d399', fontFamily:"'JetBrains Mono',monospace" }}>
                {submitted.applicationId}
              </Typography>
              <Typography sx={{ fontSize:11, color:'#64748b', mt:0.5 }}>
                Save this — you'll need it to track your status
              </Typography>
            </Box>
            <Button variant="outlined" onClick={() => {
              setSubmitted(null); setStep(0)
              setForm({ firstName:'',lastName:'',email:'',phone:'',dateOfBirth:'',gender:'',
                category:'',address:'',aadharNumber:'',entryType:'',quotaType:'',
                programId:'',qualifyingExam:'',qualifyingMarks:'',allotmentNumber:'' })
            }}>
              Submit Another Application
            </Button>
          </Card>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={outerBox}>
      <Box sx={innerBox}>

        {/* Header */}
        <Box sx={{ textAlign:'center', mb:4 }}>
          <Box sx={{
            display:'inline-flex', alignItems:'center', gap:1.5, mb:2,
            px:2, py:0.8, borderRadius:6,
            background:'rgba(56,189,248,0.08)', border:'1px solid rgba(56,189,248,0.2)'
          }}>
            <SchoolRounded sx={{ color:'#38bdf8', fontSize:18 }} />
            <Typography sx={{ color:'#38bdf8', fontSize:13, fontWeight:600 }}>
              AdmissionPro · Student Portal
            </Typography>
          </Box>
          <Typography variant="h3" sx={{
            fontFamily:"'DM Serif Display',serif", color:'#f1f5f9',
            fontSize:{ xs:'1.8rem', md:'2.4rem' }, mb:1
          }}>
            Apply for Admission
          </Typography>
          <Typography sx={{ color:'#64748b', fontSize:'0.95rem' }}>
            Fill in the form below to submit your application. All fields marked * are required.
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={step} sx={{ mb:3 }}>
          {STEPS.map((s, i) => (
            <Step key={s}>
              <StepLabel StepIconProps={{ sx: {
                '&.Mui-active':    { color:'#38bdf8' },
                '&.Mui-completed': { color:'#34d399' },
              }}}>
                <Typography sx={{ fontSize:12, color: i === step ? '#f1f5f9' : '#475569', fontWeight: i === step ? 700 : 400 }}>
                  {s}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {apiError && (
          <Alert severity="error" onClose={() => setApiError('')} sx={{ mb:2, borderRadius:2 }}>
            {apiError}
          </Alert>
        )}

        <Card sx={cardSx}>

          {/* ── STEP 0: Personal ─────────────────────────────────────────── */}
          {step === 0 && (
            <Box>
              <SectionHead icon={<PersonRounded />} title="Personal Details" />
              <Box sx={grid2}>
                <F label="First Name *"    field="firstName"   form={form} set={set} errors={errors} />
                <F label="Last Name *"     field="lastName"    form={form} set={set} errors={errors} />
                <F label="Email Address *" field="email"       form={form} set={set} errors={errors} type="email" />
                <F label="Mobile Number *" field="phone"       form={form} set={set} errors={errors} type="tel" placeholder="10-digit mobile" />
                <F label="Date of Birth *" field="dateOfBirth" form={form} set={set} errors={errors} type="date" InputLabelProps={{ shrink:true }} />
                <S label="Gender *"        field="gender"      form={form} set={set} errors={errors} options={GENDER_OPTIONS} />
                <S label="Category *"      field="category"    form={form} set={set} errors={errors} options={CATEGORY_OPTIONS} />
              </Box>
              <Divider sx={{ borderColor:'rgba(255,255,255,0.06)', my:3 }} />
              <F label="Address *" field="address" form={form} set={set} errors={errors} multiline rows={2} />
              <Box sx={{ mt:2 }}>
                <F label="Aadhar Number *" field="aadharNumber" form={form} set={set} errors={errors}
                   placeholder="12-digit Aadhar" inputProps={{ maxLength:12 }} />
              </Box>
            </Box>
          )}

          {/* ── STEP 1: Academic ─────────────────────────────────────────── */}
          {step === 1 && (
            <Box>
              <SectionHead icon={<AssignmentRounded />} title="Academic Details" />

              {progError && (
                <Alert severity="warning" sx={{ mb:2, borderRadius:2, fontSize:12 }}>
                  Could not load programs list from server. Please enter your Program ID manually.
                </Alert>
              )}

              <Box sx={grid2}>
                <S label="Entry Type *" field="entryType" form={form} set={set} errors={errors} options={ENTRY_OPTIONS} />
                <S label="Quota Type *" field="quotaType" form={form} set={set} errors={errors} options={QUOTA_OPTIONS} />

                {/* Program — dropdown if loaded, text input if not */}
                {programs.length > 0 ? (
                  <S label="Program *" field="programId" form={form} set={set} errors={errors}
                     options={programs.map(p => p.id)}
                     labelMap={programs.reduce((a, p) => ({ ...a, [p.id]: p.name }), {})} />
                ) : (
                  <F label="Program ID *" field="programId" form={form} set={set} errors={errors}
                     type="number" placeholder="Enter program ID" />
                )}

                <F label="Qualifying Exam *"       field="qualifyingExam"   form={form} set={set} errors={errors} placeholder="e.g. SSLC, PUC, Diploma" />
                <F label="Qualifying Marks (%) *"  field="qualifyingMarks"  form={form} set={set} errors={errors} type="number" inputProps={{ min:0, max:100, step:0.01 }} />
              </Box>

              {(form.quotaType === 'KCET' || form.quotaType === 'COMEDK') && (
                <Box sx={{ mt:2 }}>
                  <Alert severity="info" sx={{ mb:2, borderRadius:2, fontSize:12 }}>
                    {form.quotaType} quota requires your allotment number from the official rank card.
                  </Alert>
                  <F label={`${form.quotaType} Allotment Number *`} field="allotmentNumber"
                     form={form} set={set} errors={errors} placeholder="e.g. KCT12345" />
                </Box>
              )}
            </Box>
          )}

          {/* ── STEP 2: Review ───────────────────────────────────────────── */}
          {step === 2 && (
            <Box>
              <SectionHead icon={<CheckCircleRounded />} title="Review Your Application" />
              <Alert severity="info" sx={{ mb:3, borderRadius:2, fontSize:12 }}>
                Please review carefully before submitting. You cannot edit after submission.
              </Alert>
              <ReviewSection title="Personal Details" rows={[
                ['Name',         `${form.firstName} ${form.lastName}`],
                ['Email',         form.email],
                ['Phone',         form.phone],
                ['Date of Birth', form.dateOfBirth],
                ['Gender',        label(form.gender)],
                ['Category',      form.category],
                ['Address',       form.address],
                ['Aadhar No.',    form.aadharNumber],
              ]} />
              <ReviewSection title="Academic Details" rows={[
                ['Entry Type',       label(form.entryType)],
                ['Quota',            form.quotaType],
                ['Program',          selectedProgram?.name || `ID: ${form.programId}`],
                ['Qualifying Exam',  form.qualifyingExam],
                ['Qualifying Marks', `${form.qualifyingMarks}%`],
                ...(form.allotmentNumber ? [['Allotment No.', form.allotmentNumber]] : []),
              ]} />
            </Box>
          )}

          {/* Navigation */}
          <Box sx={{ display:'flex', justifyContent:'space-between', mt:4, pt:3, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            <Button startIcon={<ArrowBackRounded />} onClick={back} disabled={step === 0}
              variant="outlined" sx={{ visibility: step === 0 ? 'hidden' : 'visible' }}>
              Back
            </Button>
            {step < 2 ? (
              <Button variant="contained" endIcon={<ArrowForwardRounded />} onClick={next}>
                Continue
              </Button>
            ) : (
              <Button variant="contained" onClick={submit} disabled={submitting}
                sx={{ background:'linear-gradient(135deg,#38bdf8,#818cf8)', minWidth:160 }}>
                {submitting
                  ? <><CircularProgress size={16} sx={{ mr:1, color:'#fff' }} />Submitting...</>
                  : 'Submit Application'}
              </Button>
            )}
          </Box>
        </Card>

        <Typography sx={{ textAlign:'center', mt:3, color:'#334155', fontSize:12 }}>
          Need help? Contact the admissions office · admissions@college.edu
        </Typography>
      </Box>
    </Box>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────
function SectionHead({ icon, title }) {
  return (
    <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:3 }}>
      <Box sx={{ color:'#38bdf8' }}>{icon}</Box>
      <Typography sx={{ fontFamily:"'DM Serif Display',serif", fontSize:'1.15rem', color:'#f1f5f9' }}>
        {title}
      </Typography>
    </Box>
  )
}

function F({ label, field, form, set, errors, ...rest }) {
  return (
    <TextField label={label} value={form[field]}
      onChange={e => set(field, e.target.value)}
      error={!!errors[field]} helperText={errors[field]}
      fullWidth {...rest} />
  )
}

function S({ label, field, form, set, errors, options, labelMap }) {
  return (
    <TextField select label={label} value={form[field]}
      onChange={e => set(field, e.target.value)}
      error={!!errors[field]} helperText={errors[field]} fullWidth>
      {options.map(o => (
        <MenuItem key={o} value={o}>
          {labelMap ? labelMap[o] : (typeof o === 'string' ? o.charAt(0) + o.slice(1).toLowerCase() : o)}
        </MenuItem>
      ))}
    </TextField>
  )
}

function ReviewSection({ title, rows }) {
  return (
    <Box sx={{ mb:3 }}>
      <Typography sx={{ fontSize:11, fontWeight:700, color:'#38bdf8', letterSpacing:'0.08em',
        textTransform:'uppercase', mb:1.5 }}>{title}</Typography>
      <Box sx={{ borderRadius:2, border:'1px solid rgba(255,255,255,0.07)', overflow:'hidden' }}>
        {rows.map(([k, v], i) => (
          <Box key={k} sx={{
            display:'flex', justifyContent:'space-between', px:2, py:1,
            background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
          }}>
            <Typography sx={{ fontSize:'0.77rem', color:'#64748b' }}>{k}</Typography>
            <Typography sx={{ fontSize:'0.82rem', color:'#e2e8f0', fontWeight:500, textAlign:'right', maxWidth:'60%' }}>{v}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

// ── Styles ──────────────────────────────────────────────────────────────────
const outerBox = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg,#0a0f1e 0%,#0d1526 100%)',
  py: { xs:3, md:6 }, px:2,
}
const innerBox = { maxWidth: 780, mx: 'auto' }
const cardSx = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 3, p: 3,
}
const grid2 = {
  display: 'grid',
  gridTemplateColumns: { xs:'1fr', sm:'1fr 1fr' },
  gap: 2,
}













// import React, { useState, useEffect } from 'react'
// import {
//   Box, Card, Typography, Button, TextField, MenuItem,
//   Stepper, Step, StepLabel, Alert, CircularProgress,
//   Divider, Chip, InputAdornment
// } from '@mui/material'
// import {
//   SchoolRounded, PersonRounded, AssignmentRounded,
//   CheckCircleRounded, ArrowForwardRounded, ArrowBackRounded,
//   SearchRounded
// } from '@mui/icons-material'
// import axios from 'axios'

// // ── Static options ─────────────────────────────────────────────────────────
// const GENDER_OPTIONS   = ['MALE', 'FEMALE', 'OTHER']
// const CATEGORY_OPTIONS = ['GM', 'SC', 'ST', 'OBC', 'EWS', 'NRI', 'MANAGEMENT']
// const ENTRY_OPTIONS    = ['REGULAR', 'LATERAL']
// const QUOTA_OPTIONS    = ['KCET', 'COMEDK', 'MANAGEMENT']
// const STEPS            = ['Personal Details', 'Academic Details', 'Review & Submit']

// const empty = v => !v || (typeof v === 'string' && !v.trim())
// const label = s => s.charAt(0) + s.slice(1).toLowerCase()

// // Public axios — no JWT
// const publicApi = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } })
// publicApi.interceptors.response.use(
//   r => r,
//   err => {
//     const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Something went wrong'
//     return Promise.reject(new Error(typeof msg === 'string' ? msg : JSON.stringify(msg)))
//   }
// )

// export default function ApplyNow() {
//   const [step,       setStep]       = useState(0)
//   const [programs,   setPrograms]   = useState([])
//   const [progError,  setProgError]  = useState(false)
//   const [submitting, setSubmitting] = useState(false)
//   const [submitted,  setSubmitted]  = useState(null)
//   const [errors,     setErrors]     = useState({})
//   const [apiError,   setApiError]   = useState('')

//   // Status checker
//   const [showChecker, setShowChecker] = useState(false)
//   const [checkId,     setCheckId]     = useState('')
//   const [checkResult, setCheckResult] = useState(null)
//   const [checkError,  setCheckError]  = useState('')
//   const [checkLoading,setCheckLoading]= useState(false)

//   const [form, setForm] = useState({
//     firstName: '', lastName: '', email: '', phone: '',
//     dateOfBirth: '', gender: '', category: '', address: '', aadharNumber: '',
//     entryType: '', quotaType: '', programId: '', qualifyingExam: '',
//     qualifyingMarks: '', allotmentNumber: '',
//   })

//   // Load programs — attach JWT if present in localStorage
//   useEffect(() => {
//     const token = localStorage.getItem('auth_token')
//     const headers = token ? { Authorization: `Bearer ${token}` } : {}
//     publicApi.get('/master/programs', { headers })
//       .then(r => { setPrograms(r.data || []); setProgError(false) })
//       .catch(() => setProgError(true))
//   }, [])

//   const set = (field, val) => {
//     setForm(p => ({ ...p, [field]: val }))
//     setErrors(p => ({ ...p, [field]: '' }))
//   }

//   const validateStep0 = () => {
//     const e = {}
//     if (empty(form.firstName))    e.firstName    = 'Required'
//     if (empty(form.lastName))     e.lastName     = 'Required'
//     if (empty(form.email))        e.email        = 'Required'
//     else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
//     if (empty(form.phone))        e.phone        = 'Required'
//     else if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Enter valid 10-digit mobile'
//     if (empty(form.dateOfBirth))  e.dateOfBirth  = 'Required'
//     if (empty(form.gender))       e.gender       = 'Required'
//     if (empty(form.category))     e.category     = 'Required'
//     if (empty(form.address))      e.address      = 'Required'
//     if (empty(form.aadharNumber)) e.aadharNumber = 'Required'
//     else if (!/^\d{12}$/.test(form.aadharNumber)) e.aadharNumber = 'Must be 12 digits'
//     setErrors(e)
//     return Object.keys(e).length === 0
//   }

//   const validateStep1 = () => {
//     const e = {}
//     if (empty(form.entryType))      e.entryType      = 'Required'
//     if (empty(form.quotaType))      e.quotaType      = 'Required'
//     if (empty(form.programId))      e.programId      = 'Required'
//     if (empty(form.qualifyingExam)) e.qualifyingExam = 'Required'
//     if (empty(String(form.qualifyingMarks))) e.qualifyingMarks = 'Required'
//     else if (Number(form.qualifyingMarks) < 0 || Number(form.qualifyingMarks) > 100)
//       e.qualifyingMarks = 'Must be 0–100'
//     if ((form.quotaType === 'KCET' || form.quotaType === 'COMEDK') && empty(form.allotmentNumber))
//       e.allotmentNumber = `${form.quotaType} allotment number is required`
//     setErrors(e)
//     return Object.keys(e).length === 0
//   }

//   const next = () => {
//     if (step === 0 && !validateStep0()) return
//     if (step === 1 && !validateStep1()) return
//     setStep(s => s + 1)
//   }
//   const back = () => setStep(s => s - 1)

//   const submit = async () => {
//     setSubmitting(true)
//     setApiError('')
//     try {
//       const payload = {
//         ...form,
//         programId:       Number(form.programId),
//         qualifyingMarks: Number(form.qualifyingMarks),
//       }
//       const token = localStorage.getItem('auth_token')
//       const headers = token ? { Authorization: `Bearer ${token}` } : {}
//       const res = await publicApi.post('/applicants', payload, { headers })
//       setSubmitted({
//         applicationId: res.data.id,
//         firstName:     res.data.firstName,
//         lastName:      res.data.lastName,
//         email:         res.data.email,
//         status:        res.data.status,
//         message:
//           'Your application has been submitted successfully! ' +
//           'Please note your Application ID: ' + res.data.id + '. ' +
//           'Our team will contact you for document verification.',
//       })
//     } catch (e) {
//       setApiError(e.message || 'Submission failed. Please try again.')
//       setStep(0)
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   const checkStatus = async () => {
//     if (!checkId.trim()) return
//     setCheckLoading(true)
//     setCheckError('')
//     setCheckResult(null)
//     try {
//       const res = await publicApi.get(`/portal/status/${checkId.trim()}`)
//       setCheckResult(res.data)
//     } catch {
//       setCheckError('Application not found. Please verify your Application ID.')
//     } finally {
//       setCheckLoading(false)
//     }
//   }

//   const selectedProgram = programs.find(p => p.id === Number(form.programId))

//   const statusColor = s => ({
//     APPLIED: '#38bdf8', DOCUMENTS_PENDING: '#fb923c',
//     DOCUMENTS_SUBMITTED: '#a78bfa', DOCUMENTS_VERIFIED: '#34d399',
//     SEAT_ALLOCATED: '#34d399', FEE_PENDING: '#fb923c',
//     ADMITTED: '#4ade80', CANCELLED: '#f87171',
//   }[s] || '#64748b')

//   // ── Success screen ──────────────────────────────────────────────────────
//   if (submitted) {
//     return (
//       <Box sx={outerBox}>
//         <Box sx={innerBox}>
//           <Card sx={{ ...cardSx, textAlign: 'center', py: 6, px: 4 }}>
//             <Box sx={{
//               width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 3,
//               background: 'linear-gradient(135deg,#34d399,#059669)',
//               display: 'flex', alignItems: 'center', justifyContent: 'center'
//             }}>
//               <CheckCircleRounded sx={{ fontSize: 44, color: '#fff' }} />
//             </Box>
//             <Typography variant="h4" sx={{ fontFamily:"'DM Serif Display',serif", color:'#f1f5f9', mb:1 }}>
//               Application Submitted!
//             </Typography>
//             <Typography sx={{ color:'#94a3b8', mb:3, fontSize:'0.95rem' }}>
//               {submitted.message}
//             </Typography>
//             <Box sx={{ p:2.5, borderRadius:2, background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.25)', mb:3 }}>
//               <Typography sx={{ fontSize:12, color:'#64748b', mb:0.5, textTransform:'uppercase', letterSpacing:'0.08em' }}>
//                 Your Application ID
//               </Typography>
//               <Typography sx={{ fontSize:'2rem', fontWeight:800, color:'#34d399', fontFamily:"'JetBrains Mono',monospace" }}>
//                 {submitted.applicationId}
//               </Typography>
//               <Typography sx={{ fontSize:11, color:'#64748b', mt:0.5 }}>
//                 Save this — you'll need it to track your status
//               </Typography>
//             </Box>
//             <Button variant="outlined" onClick={() => {
//               setSubmitted(null); setStep(0)
//               setForm({ firstName:'',lastName:'',email:'',phone:'',dateOfBirth:'',gender:'',
//                 category:'',address:'',aadharNumber:'',entryType:'',quotaType:'',
//                 programId:'',qualifyingExam:'',qualifyingMarks:'',allotmentNumber:'' })
//             }}>
//               Submit Another Application
//             </Button>
//           </Card>
//         </Box>
//       </Box>
//     )
//   }

//   return (
//     <Box sx={outerBox}>
//       <Box sx={innerBox}>

//         {/* Header */}
//         <Box sx={{ textAlign:'center', mb:4 }}>
//           <Box sx={{
//             display:'inline-flex', alignItems:'center', gap:1.5, mb:2,
//             px:2, py:0.8, borderRadius:6,
//             background:'rgba(56,189,248,0.08)', border:'1px solid rgba(56,189,248,0.2)'
//           }}>
//             <SchoolRounded sx={{ color:'#38bdf8', fontSize:18 }} />
//             <Typography sx={{ color:'#38bdf8', fontSize:13, fontWeight:600 }}>
//               AdmissionPro · Student Portal
//             </Typography>
//           </Box>
//           <Typography variant="h3" sx={{
//             fontFamily:"'DM Serif Display',serif", color:'#f1f5f9',
//             fontSize:{ xs:'1.8rem', md:'2.4rem' }, mb:1
//           }}>
//             Apply for Admission
//           </Typography>
//           <Typography sx={{ color:'#64748b', fontSize:'0.95rem' }}>
//             Fill in the form below to submit your application. All fields marked * are required.
//           </Typography>
//         </Box>

//         {/* Status Checker */}
//         <Card sx={{ ...cardSx, mb:3, p:2 }}>
//           <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:1 }}>
//             <Typography sx={{ color:'#94a3b8', fontSize:'0.85rem' }}>
//               Already applied? Check your application status.
//             </Typography>
//             <Button size="small" variant="text" sx={{ color:'#38bdf8' }}
//               onClick={() => { setShowChecker(s => !s); setCheckResult(null); setCheckError('') }}>
//               {showChecker ? 'Hide' : 'Check Status'}
//             </Button>
//           </Box>
//           {showChecker && (
//             <Box sx={{ mt:2, display:'flex', gap:1, flexWrap:'wrap' }}>
//               <TextField size="small" placeholder="Enter Application ID"
//                 value={checkId} onChange={e => setCheckId(e.target.value)}
//                 onKeyDown={e => e.key === 'Enter' && checkStatus()}
//                 InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded sx={{ fontSize:16, color:'#64748b' }} /></InputAdornment> }}
//                 sx={{ flex:1, minWidth:180 }} />
//               <Button variant="contained" size="small" onClick={checkStatus}
//                 disabled={checkLoading || !checkId.trim()}>
//                 {checkLoading ? <CircularProgress size={16} /> : 'Check'}
//               </Button>
//             </Box>
//           )}
//           {checkError  && <Alert severity="error"   sx={{ mt:1.5, borderRadius:2, fontSize:12 }}>{checkError}</Alert>}
//           {checkResult && (
//             <Box sx={{ mt:2, p:2, borderRadius:2, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
//               <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:1 }}>
//                 <Typography sx={{ fontWeight:700, color:'#f1f5f9' }}>
//                   {checkResult.firstName} {checkResult.lastName}
//                 </Typography>
//                 <Chip label={checkResult.status?.replace(/_/g,' ')} size="small"
//                   sx={{ background:`${statusColor(checkResult.status)}22`, color:statusColor(checkResult.status), fontWeight:700, fontSize:11 }} />
//               </Box>
//               <Typography sx={{ fontSize:12, color:'#64748b' }}>
//                 ID: {checkResult.applicationId} · {checkResult.email}
//               </Typography>
//             </Box>
//           )}
//         </Card>

//         {/* Stepper */}
//         <Stepper activeStep={step} sx={{ mb:3 }}>
//           {STEPS.map((s, i) => (
//             <Step key={s}>
//               <StepLabel StepIconProps={{ sx: {
//                 '&.Mui-active':    { color:'#38bdf8' },
//                 '&.Mui-completed': { color:'#34d399' },
//               }}}>
//                 <Typography sx={{ fontSize:12, color: i === step ? '#f1f5f9' : '#475569', fontWeight: i === step ? 700 : 400 }}>
//                   {s}
//                 </Typography>
//               </StepLabel>
//             </Step>
//           ))}
//         </Stepper>

//         {apiError && (
//           <Alert severity="error" onClose={() => setApiError('')} sx={{ mb:2, borderRadius:2 }}>
//             {apiError}
//           </Alert>
//         )}

//         <Card sx={cardSx}>

//           {/* ── STEP 0: Personal ─────────────────────────────────────────── */}
//           {step === 0 && (
//             <Box>
//               <SectionHead icon={<PersonRounded />} title="Personal Details" />
//               <Box sx={grid2}>
//                 <F label="First Name *"    field="firstName"   form={form} set={set} errors={errors} />
//                 <F label="Last Name *"     field="lastName"    form={form} set={set} errors={errors} />
//                 <F label="Email Address *" field="email"       form={form} set={set} errors={errors} type="email" />
//                 <F label="Mobile Number *" field="phone"       form={form} set={set} errors={errors} type="tel" placeholder="10-digit mobile" />
//                 <F label="Date of Birth *" field="dateOfBirth" form={form} set={set} errors={errors} type="date" InputLabelProps={{ shrink:true }} />
//                 <S label="Gender *"        field="gender"      form={form} set={set} errors={errors} options={GENDER_OPTIONS} />
//                 <S label="Category *"      field="category"    form={form} set={set} errors={errors} options={CATEGORY_OPTIONS} />
//               </Box>
//               <Divider sx={{ borderColor:'rgba(255,255,255,0.06)', my:3 }} />
//               <F label="Address *" field="address" form={form} set={set} errors={errors} multiline rows={2} />
//               <Box sx={{ mt:2 }}>
//                 <F label="Aadhar Number *" field="aadharNumber" form={form} set={set} errors={errors}
//                    placeholder="12-digit Aadhar" inputProps={{ maxLength:12 }} />
//               </Box>
//             </Box>
//           )}

//           {/* ── STEP 1: Academic ─────────────────────────────────────────── */}
//           {step === 1 && (
//             <Box>
//               <SectionHead icon={<AssignmentRounded />} title="Academic Details" />

//               {progError && (
//                 <Alert severity="warning" sx={{ mb:2, borderRadius:2, fontSize:12 }}>
//                   Could not load programs list from server. Please enter your Program ID manually.
//                 </Alert>
//               )}

//               <Box sx={grid2}>
//                 <S label="Entry Type *" field="entryType" form={form} set={set} errors={errors} options={ENTRY_OPTIONS} />
//                 <S label="Quota Type *" field="quotaType" form={form} set={set} errors={errors} options={QUOTA_OPTIONS} />

//                 {/* Program — dropdown if loaded, text input if not */}
//                 {programs.length > 0 ? (
//                   <S label="Program *" field="programId" form={form} set={set} errors={errors}
//                      options={programs.map(p => p.id)}
//                      labelMap={programs.reduce((a, p) => ({ ...a, [p.id]: p.name }), {})} />
//                 ) : (
//                   <F label="Program ID *" field="programId" form={form} set={set} errors={errors}
//                      type="number" placeholder="Enter program ID" />
//                 )}

//                 <F label="Qualifying Exam *"       field="qualifyingExam"   form={form} set={set} errors={errors} placeholder="e.g. SSLC, PUC, Diploma" />
//                 <F label="Qualifying Marks (%) *"  field="qualifyingMarks"  form={form} set={set} errors={errors} type="number" inputProps={{ min:0, max:100, step:0.01 }} />
//               </Box>

//               {(form.quotaType === 'KCET' || form.quotaType === 'COMEDK') && (
//                 <Box sx={{ mt:2 }}>
//                   <Alert severity="info" sx={{ mb:2, borderRadius:2, fontSize:12 }}>
//                     {form.quotaType} quota requires your allotment number from the official rank card.
//                   </Alert>
//                   <F label={`${form.quotaType} Allotment Number *`} field="allotmentNumber"
//                      form={form} set={set} errors={errors} placeholder="e.g. KCT12345" />
//                 </Box>
//               )}
//             </Box>
//           )}

//           {/* ── STEP 2: Review ───────────────────────────────────────────── */}
//           {step === 2 && (
//             <Box>
//               <SectionHead icon={<CheckCircleRounded />} title="Review Your Application" />
//               <Alert severity="info" sx={{ mb:3, borderRadius:2, fontSize:12 }}>
//                 Please review carefully before submitting. You cannot edit after submission.
//               </Alert>
//               <ReviewSection title="Personal Details" rows={[
//                 ['Name',         `${form.firstName} ${form.lastName}`],
//                 ['Email',         form.email],
//                 ['Phone',         form.phone],
//                 ['Date of Birth', form.dateOfBirth],
//                 ['Gender',        label(form.gender)],
//                 ['Category',      form.category],
//                 ['Address',       form.address],
//                 ['Aadhar No.',    form.aadharNumber],
//               ]} />
//               <ReviewSection title="Academic Details" rows={[
//                 ['Entry Type',       label(form.entryType)],
//                 ['Quota',            form.quotaType],
//                 ['Program',          selectedProgram?.name || `ID: ${form.programId}`],
//                 ['Qualifying Exam',  form.qualifyingExam],
//                 ['Qualifying Marks', `${form.qualifyingMarks}%`],
//                 ...(form.allotmentNumber ? [['Allotment No.', form.allotmentNumber]] : []),
//               ]} />
//             </Box>
//           )}

//           {/* Navigation */}
//           <Box sx={{ display:'flex', justifyContent:'space-between', mt:4, pt:3, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
//             <Button startIcon={<ArrowBackRounded />} onClick={back} disabled={step === 0}
//               variant="outlined" sx={{ visibility: step === 0 ? 'hidden' : 'visible' }}>
//               Back
//             </Button>
//             {step < 2 ? (
//               <Button variant="contained" endIcon={<ArrowForwardRounded />} onClick={next}>
//                 Continue
//               </Button>
//             ) : (
//               <Button variant="contained" onClick={submit} disabled={submitting}
//                 sx={{ background:'linear-gradient(135deg,#38bdf8,#818cf8)', minWidth:160 }}>
//                 {submitting
//                   ? <><CircularProgress size={16} sx={{ mr:1, color:'#fff' }} />Submitting...</>
//                   : 'Submit Application'}
//               </Button>
//             )}
//           </Box>
//         </Card>

//         <Typography sx={{ textAlign:'center', mt:3, color:'#334155', fontSize:12 }}>
//           Need help? Contact the admissions office · admissions@college.edu
//         </Typography>
//       </Box>
//     </Box>
//   )
// }

// // ── Sub-components ──────────────────────────────────────────────────────────
// function SectionHead({ icon, title }) {
//   return (
//     <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:3 }}>
//       <Box sx={{ color:'#38bdf8' }}>{icon}</Box>
//       <Typography sx={{ fontFamily:"'DM Serif Display',serif", fontSize:'1.15rem', color:'#f1f5f9' }}>
//         {title}
//       </Typography>
//     </Box>
//   )
// }

// function F({ label, field, form, set, errors, ...rest }) {
//   return (
//     <TextField label={label} value={form[field]}
//       onChange={e => set(field, e.target.value)}
//       error={!!errors[field]} helperText={errors[field]}
//       fullWidth {...rest} />
//   )
// }

// function S({ label, field, form, set, errors, options, labelMap }) {
//   return (
//     <TextField select label={label} value={form[field]}
//       onChange={e => set(field, e.target.value)}
//       error={!!errors[field]} helperText={errors[field]} fullWidth>
//       {options.map(o => (
//         <MenuItem key={o} value={o}>
//           {labelMap ? labelMap[o] : (typeof o === 'string' ? o.charAt(0) + o.slice(1).toLowerCase() : o)}
//         </MenuItem>
//       ))}
//     </TextField>
//   )
// }

// function ReviewSection({ title, rows }) {
//   return (
//     <Box sx={{ mb:3 }}>
//       <Typography sx={{ fontSize:11, fontWeight:700, color:'#38bdf8', letterSpacing:'0.08em',
//         textTransform:'uppercase', mb:1.5 }}>{title}</Typography>
//       <Box sx={{ borderRadius:2, border:'1px solid rgba(255,255,255,0.07)', overflow:'hidden' }}>
//         {rows.map(([k, v], i) => (
//           <Box key={k} sx={{
//             display:'flex', justifyContent:'space-between', px:2, py:1,
//             background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
//           }}>
//             <Typography sx={{ fontSize:'0.77rem', color:'#64748b' }}>{k}</Typography>
//             <Typography sx={{ fontSize:'0.82rem', color:'#e2e8f0', fontWeight:500, textAlign:'right', maxWidth:'60%' }}>{v}</Typography>
//           </Box>
//         ))}
//       </Box>
//     </Box>
//   )
// }

// // ── Styles ──────────────────────────────────────────────────────────────────
// const outerBox = {
//   minHeight: '100vh',
//   background: 'linear-gradient(135deg,#0a0f1e 0%,#0d1526 100%)',
//   py: { xs:3, md:6 }, px:2,
// }
// const innerBox = { maxWidth: 780, mx: 'auto' }
// const cardSx = {
//   background: 'rgba(255,255,255,0.03)',
//   border: '1px solid rgba(255,255,255,0.07)',
//   borderRadius: 3, p: 3,
// }
// const grid2 = {
//   display: 'grid',
//   gridTemplateColumns: { xs:'1fr', sm:'1fr 1fr' },
//   gap: 2,
// }
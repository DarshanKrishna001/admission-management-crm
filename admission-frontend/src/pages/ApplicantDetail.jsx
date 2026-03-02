import React, { useState, useEffect } from 'react'
import {
  Box, Card, Grid, Typography, Button, Chip, Alert, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  MenuItem, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Divider, Avatar, IconButton, Tooltip, LinearProgress
} from '@mui/material'
import {
  ArrowBackRounded, CheckCircleRounded,
  AssignmentTurnedInRounded, PaymentsRounded,
  DescriptionRounded, EditRounded, WarningRounded
} from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import { applicantApi, admissionApi, feeApi, masterApi } from '../api'
import PageHeader  from '../components/PageHeader'
import StatusChip  from '../components/StatusChip'
import { useAuth } from '../context/AuthContext'

// Who can update documents & fees
const CAN_UPDATE_ROLES = ['ADMIN', 'ADMISSION_OFFICER']

export default function ApplicantDetail() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { user }   = useAuth()
  const canUpdate  = CAN_UPDATE_ROLES.includes(user?.role)

  const [applicant,  setApplicant]  = useState(null)
  const [documents,  setDocuments]  = useState([])
  const [admission,  setAdmission]  = useState(null)
  const [fee,        setFee]        = useState(null)
  const [programs,   setPrograms]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [success,    setSuccess]    = useState('')
  const [saving,     setSaving]     = useState('')

  // ── Dialog states ──────────────────────────────────────────────────────────
  const [docDialog,   setDocDialog]   = useState({ open: false, doc: null })
  const [docForm,     setDocForm]     = useState({ status: 'PENDING', remarks: '', verifiedBy: '' })
  const [allocDialog,   setAllocDialog]   = useState(false)
  const [allocForm,     setAllocForm]     = useState({
    institutionId: '', institutionCode: '', institutionName: '',
    programCode: '', courseType: 'UG',
    academicYear: new Date().getFullYear(), processedBy: ''
  })
  const [institutions,  setInstitutions]  = useState([])
  const [filteredProgs, setFilteredProgs] = useState([])
  const [feeDialog,   setFeeDialog]   = useState(false)
  const [feeMode,     setFeeMode]     = useState('create') // 'create' | 'pay'
  const [feeForm,     setFeeForm]     = useState({ amount: '', remarks: '', updatedBy: '' })

  // ── Load all data ──────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [aRes, dRes, pRes] = await Promise.all([
        applicantApi.getById(id),
        applicantApi.getDocuments(id),
        masterApi.getPrograms(),
      ])
      setApplicant(aRes.data)
      setDocuments(dRes.data || [])
      setPrograms(pRes.data || [])

      // Admission — may not exist yet
      try {
        const admRes = await admissionApi.getByApplicant(id)
        setAdmission(admRes.data)
      } catch (_) { setAdmission(null) }

      // Fee — may not exist yet
      try {
        const feeRes = await feeApi.getByApplicant(id)
        setFee(feeRes.data)
      } catch (_) { setFee(null) }

    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  // Load institutions when alloc dialog opens and preset program code
  useEffect(() => {
    if (allocDialog) {
      masterApi.getInstitutions().then(r => setInstitutions(r.data || [])).catch(() => {})
      setFilteredProgs(programs)
      // Preset program code from applicant's program
      const prog = programs.find(p => p.id === applicant?.programId)
      if (prog) {
        setAllocForm(f => ({
          ...f,
          programCode: prog.code || '',
          courseType:  prog.courseType || 'UG',
        }))
      }
    }
  }, [allocDialog, programs])

  // ── Document update ────────────────────────────────────────────────────────
  const updateDoc = async () => {
    if (!docDialog.doc) return
    setSaving('doc')
    try {
      await applicantApi.updateDocument(id, docDialog.doc.id, {
        status:     docForm.status,
        remarks:    docForm.remarks || null,
        verifiedBy: docForm.status === 'VERIFIED' ? docForm.verifiedBy : null,
      })
      setDocDialog({ open: false, doc: null })
      setSuccess(`Document "${docDialog.doc.documentName}" updated to ${docForm.status}`)
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving('')
    }
  }

  // ── Open doc dialog ────────────────────────────────────────────────────────
  const openDocDialog = (doc) => {
    setDocDialog({ open: true, doc })
    setDocForm({
      status:     doc.status     || 'PENDING',
      remarks:    doc.remarks    || '',
      verifiedBy: doc.verifiedBy || '',
    })
  }

  // ── Create fee record ──────────────────────────────────────────────────────
  const createFee = async () => {
    setSaving('fee')
    try {
      await feeApi.create({
        applicantId: Number(id),
        programId:   applicant.programId,
        amount:      feeForm.amount ? Number(feeForm.amount) : null,
      })
      setFeeDialog(false)
      setSuccess('Fee record created!')
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving('')
    }
  }

  // ── Mark fee as PAID ───────────────────────────────────────────────────────
  const markFeePaid = async () => {
    setSaving('feePay')
    try {
      await feeApi.update(id, {
        status:    'PAID',
        remarks:   feeForm.remarks   || null,
        updatedBy: feeForm.updatedBy || null,
      })
      setFeeDialog(false)
      setSuccess('Fee marked as PAID! You can now confirm the admission.')
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving('')
    }
  }

  // ── Allocate seat ──────────────────────────────────────────────────────────
  const allocateSeat = async () => {
    if (!allocForm.institutionCode) {
      setError('Please select an Institution'); return
    }
    setSaving('alloc')
    try {
      const selectedProg = filteredProgs.find(p => p.id === applicant.programId) || programs.find(p => p.id === applicant.programId)
      await admissionApi.allocate({
        applicantId:     Number(id),
        programId:       applicant.programId,
        quotaType:       applicant.quotaType,
        allotmentNumber: applicant.allotmentNumber,
        institutionCode: allocForm.institutionCode,
        programCode:     allocForm.programCode || selectedProg?.code || 'NA',
        courseType:      allocForm.courseType,
        academicYear:    Number(allocForm.academicYear),
        processedBy:     allocForm.processedBy.trim(),
      })
      setAllocDialog(false)
      setSuccess('Seat allocated successfully!')
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving('')
    }
  }

  // ── Confirm admission ──────────────────────────────────────────────────────
  const confirmAdmission = async () => {
    setSaving('confirm')
    try {
      await admissionApi.confirm(admission.id)
      setSuccess('Admission CONFIRMED! Admission number generated.')
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving('')
    }
  }

  // ── Document completion % ──────────────────────────────────────────────────
  const verifiedCount  = documents.filter(d => d.status === 'VERIFIED').length
  const submittedCount = documents.filter(d => d.status === 'SUBMITTED').length
  const docProgress    = documents.length > 0
    ? Math.round(((verifiedCount + submittedCount * 0.5) / documents.length) * 100) : 0

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <CircularProgress sx={{ color: '#38bdf8' }} />
    </Box>
  )

  const program = programs.find(p => p.id === applicant?.programId)

  // ── Workflow step logic ────────────────────────────────────────────────────
  const step1Done = documents.length > 0
  const step2Done = documents.length > 0 && verifiedCount > 0
  const step3Done = !!admission
  const step4Done = fee?.status === 'PAID'
  const step5Done = admission?.status === 'CONFIRMED'

  return (
    <Box>
      {/* Back + Header */}
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackRounded />} onClick={() => navigate('/applicants')}
          sx={{ color: '#64748b', mb: 1.5, '&:hover': { color: '#38bdf8' } }}>
          Back to Applicants
        </Button>
        <PageHeader
          title={`${applicant?.firstName} ${applicant?.lastName}`}
          subtitle={`Applicant #${id} · ${applicant?.email}`}
          breadcrumbs={['Applicants', 'Detail']}
        />
      </Box>

      {error   && <Alert severity="error"   onClose={() => setError('')}   sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

      {/* Role notice for Management */}
      {!canUpdate && (
        <Alert severity="info" icon={<WarningRounded />} sx={{ mb: 2, borderRadius: 2 }}>
          You are viewing in <strong>read-only</strong> mode. Only Admin and Admission Officers can update documents and fees.
        </Alert>
      )}

      {/* ── Workflow progress bar ──────────────────────────────────────────── */}
      <Card sx={{ p: 2.5, mb: 3 }}>
        <Typography sx={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: 0.8, mb: 1.5 }}>
          ADMISSION WORKFLOW
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {[
            { label: '1. Applied',          done: true      },
            { label: '2. Docs Verified',    done: step2Done },
            { label: '3. Seat Allocated',   done: step3Done },
            { label: '4. Fee Paid',         done: step4Done },
            { label: '5. Confirmed',        done: step5Done },
          ].map((s, i) => (
            <Box key={i} sx={{
              display: 'flex', alignItems: 'center', gap: 0.6,
              px: 1.5, py: 0.5, borderRadius: 5,
              background: s.done ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${s.done ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.08)'}`,
            }}>
              <Box sx={{
                width: 7, height: 7, borderRadius: '50%',
                background: s.done ? '#34d399' : '#334155'
              }}/>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: s.done ? '#34d399' : '#475569' }}>
                {s.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Card>

      <Grid container spacing={3}>

        {/* ── LEFT: Applicant info card ──────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{
                width: 54, height: 54, fontWeight: 700, fontSize: '1.1rem',
                background: 'linear-gradient(135deg,#38bdf8,#818cf8)'
              }}>
                {applicant?.firstName?.[0]}{applicant?.lastName?.[0]}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 700, color: '#f1f5f9', fontSize: '1.05rem' }}>
                  {applicant?.firstName} {applicant?.lastName}
                </Typography>
                <StatusChip status={applicant?.status} />
              </Box>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 2 }} />

            {[
              ['Email',          applicant?.email],
              ['Phone',          applicant?.phone],
              ['DOB',            applicant?.dateOfBirth],
              ['Gender',         applicant?.gender],
              ['Category',       applicant?.category],
              ['Entry Type',     applicant?.entryType],
              ['Quota',          applicant?.quotaType],
              ['Program',        program?.name],
              ['Qualifying Exam',applicant?.qualifyingExam],
              ['Marks',          applicant?.qualifyingMarks],
              ['Allotment #',    applicant?.allotmentNumber],
              ['Aadhar',         applicant?.aadharNumber],
              ['Address',        applicant?.address],
            ].filter(([, v]) => v != null && v !== '').map(([k, v]) => (
              <Box key={k} sx={{ display:'flex', justifyContent:'space-between', py:0.8, borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                <Typography sx={{ fontSize:'0.77rem', color:'#64748b', fontWeight:500 }}>{k}</Typography>
                <Typography sx={{ fontSize:'0.82rem', color:'#e2e8f0', fontWeight:500, textAlign:'right', maxWidth:'58%' }}>{v}</Typography>
              </Box>
            ))}
          </Card>
        </Grid>

        {/* ── RIGHT: Documents + Fee + Admission ────────────────────────── */}
        <Grid size={{ xs: 12, md: 7 }}>

          {/* Document Checklist */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb: 1 }}>
              <Typography sx={{ fontFamily:"'DM Serif Display',serif", fontSize:'1.2rem', color:'#f1f5f9' }}>
                Document Checklist
              </Typography>
              <Typography sx={{ fontSize:12, color: verifiedCount === documents.length && documents.length > 0 ? '#34d399' : '#64748b' }}>
                {verifiedCount}/{documents.length} verified
              </Typography>
            </Box>

            {/* Doc progress bar */}
            <LinearProgress variant="determinate" value={docProgress} sx={{
              mb: 2, height: 5, borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.06)',
              '& .MuiLinearProgress-bar': {
                background: docProgress === 100 ? '#34d399' : '#38bdf8',
                borderRadius: 3
              }
            }} />

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color:'#64748b', fontSize:11, fontWeight:700, letterSpacing:0.8 }}>DOCUMENT</TableCell>
                    <TableCell sx={{ color:'#64748b', fontSize:11, fontWeight:700, letterSpacing:0.8 }}>STATUS</TableCell>
                    <TableCell sx={{ color:'#64748b', fontSize:11, fontWeight:700, letterSpacing:0.8 }}>VERIFIED BY</TableCell>
                    {canUpdate && (
                      <TableCell align="right" sx={{ color:'#64748b', fontSize:11, fontWeight:700, letterSpacing:0.8 }}>UPDATE</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map(d => (
                    <TableRow key={d.id} sx={{ '&:hover': { background:'rgba(255,255,255,0.02)' } }}>
                      <TableCell sx={{ color:'#e2e8f0', fontSize:'0.82rem' }}>
                        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                          <DescriptionRounded sx={{ fontSize:14, color:'#64748b' }} />
                          {d.documentName}
                        </Box>
                      </TableCell>
                      <TableCell><StatusChip status={d.status} /></TableCell>
                      <TableCell sx={{ fontSize:'0.77rem', color:'#64748b' }}>{d.verifiedBy || '—'}</TableCell>
                      {canUpdate && (
                        <TableCell align="right">
                          <Tooltip title="Update document status">
                            <IconButton size="small" onClick={() => openDocDialog(d)}
                              sx={{ color:'#64748b', '&:hover':{ color:'#38bdf8' } }}>
                              <EditRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {documents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py:3, color:'#475569' }}>
                        No documents found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          {/* Fee Status */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb: 2 }}>
              <Typography sx={{ fontFamily:"'DM Serif Display',serif", fontSize:'1.2rem', color:'#f1f5f9' }}>
                Fee Status
              </Typography>
              {canUpdate && !fee && (
                <Button size="small" variant="outlined" startIcon={<PaymentsRounded />}
                  onClick={() => { setFeeMode('create'); setFeeForm({ amount:'', remarks:'', updatedBy:'' }); setFeeDialog(true) }}>
                  Create Fee Record
                </Button>
              )}
            </Box>

            {fee ? (
              <Box>
                <Box sx={{
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  p: 2, borderRadius: 2,
                  background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)'
                }}>
                  <Box>
                    <Typography sx={{ fontSize:'0.72rem', color:'#64748b', mb:0.5 }}>Amount</Typography>
                    <Typography sx={{ fontSize:'1.5rem', fontWeight:800, color:'#f1f5f9', fontFamily:"'JetBrains Mono',monospace" }}>
                      ₹{(fee.amount || 0).toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                  <StatusChip status={fee.status} />
                </Box>
                {fee.remarks && (
                  <Typography sx={{ fontSize:'0.75rem', color:'#64748b', mt:1, px:0.5 }}>
                    Remarks: {fee.remarks}
                  </Typography>
                )}
                {fee.paidAt && (
                  <Typography sx={{ fontSize:'0.75rem', color:'#34d399', mt:0.5, px:0.5 }}>
                    Paid at: {new Date(fee.paidAt).toLocaleString()}
                  </Typography>
                )}
                {canUpdate && fee.status === 'PENDING' && (
                  <Button variant="contained" color="success" fullWidth sx={{ mt: 2 }}
                    startIcon={<CheckCircleRounded />}
                    onClick={() => { setFeeMode('pay'); setFeeForm({ amount:'', remarks:'', updatedBy:'' }); setFeeDialog(true) }}>
                    Mark as PAID
                  </Button>
                )}
              </Box>
            ) : (
              <Typography sx={{ color:'#64748b', fontSize:'0.85rem' }}>No fee record created yet.</Typography>
            )}
          </Card>

          {/* Admission Allocation */}
          <Card sx={{ p: 3 }}>
            <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb: 2 }}>
              <Typography sx={{ fontFamily:"'DM Serif Display',serif", fontSize:'1.2rem', color:'#f1f5f9' }}>
                Admission
              </Typography>
              {canUpdate && !admission && (
                <Button size="small" variant="outlined" startIcon={<AssignmentTurnedInRounded />}
                  onClick={() => setAllocDialog(true)}>
                  Allocate Seat
                </Button>
              )}
            </Box>

            {admission ? (
              <Box>
                {/* Admission number box */}
                {admission.admissionNumber && (
                  <Box sx={{
                    p: 2, mb: 2, borderRadius: 2,
                    background: 'linear-gradient(135deg,rgba(52,211,153,0.08),rgba(56,189,248,0.08))',
                    border: '1px solid rgba(52,211,153,0.25)'
                  }}>
                    <Typography sx={{ fontSize:'0.7rem', color:'#64748b', mb:0.5, letterSpacing:'0.1em', textTransform:'uppercase' }}>
                      Admission Number
                    </Typography>
                    <Typography sx={{ fontSize:'1.1rem', fontWeight:800, color:'#34d399', fontFamily:"'JetBrains Mono',monospace" }}>
                      {admission.admissionNumber}
                    </Typography>
                  </Box>
                )}

                {[
                  ['Status',       <StatusChip key="s" status={admission.status} />],
                  ['Quota',        <StatusChip key="q" status={admission.quotaType} />],
                  ['Allocated At', new Date(admission.allocatedAt).toLocaleString()],
                  ['Processed By', admission.processedBy],
                ].map(([k, v]) => (
                  <Box key={k} sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', py:0.8, borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <Typography sx={{ fontSize:'0.77rem', color:'#64748b' }}>{k}</Typography>
                    <Box>{typeof v === 'string'
                      ? <Typography sx={{ fontSize:'0.82rem', color:'#e2e8f0' }}>{v}</Typography>
                      : v}
                    </Box>
                  </Box>
                ))}

                {/* Confirm button — only when ALLOCATED and fee PAID */}
                {canUpdate && admission.status === 'ALLOCATED' && (
                  <Box sx={{ mt: 2 }}>
                    {fee?.status !== 'PAID' && (
                      <Alert severity="warning" sx={{ mb: 1.5, borderRadius: 2, fontSize: 12 }}>
                        Fee must be marked as PAID before confirming admission.
                      </Alert>
                    )}
                    <Button variant="contained" fullWidth
                      startIcon={<CheckCircleRounded />}
                      disabled={saving === 'confirm' || fee?.status !== 'PAID'}
                      onClick={confirmAdmission}
                      sx={{ background: 'linear-gradient(135deg,#34d399,#059669)' }}>
                      {saving === 'confirm' ? 'Confirming...' : 'Confirm Admission & Generate Number'}
                    </Button>
                  </Box>
                )}
              </Box>
            ) : (
              <Typography sx={{ color:'#64748b', fontSize:'0.85rem' }}>
                No seat allocated yet.{canUpdate ? ' Click "Allocate Seat" to begin.' : ''}
              </Typography>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* ── Document Update Dialog ─────────────────────────────────────────── */}
      <Dialog open={docDialog.open} onClose={() => setDocDialog({ open:false, doc:null })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily:"'DM Serif Display',serif" }}>Update Document Status</DialogTitle>
        <DialogContent sx={{ pt:'16px !important', display:'flex', flexDirection:'column', gap:2 }}>
          <Box sx={{ p:1.5, borderRadius:2, background:'rgba(56,189,248,0.06)', border:'1px solid rgba(56,189,248,0.15)' }}>
            <Typography sx={{ fontSize:'0.85rem', color:'#94a3b8' }}>
              <DescriptionRounded sx={{ fontSize:14, verticalAlign:'middle', mr:0.5 }} />
              {docDialog.doc?.documentName}
            </Typography>
          </Box>

          <TextField
            select label="Status" value={docForm.status}
            onChange={e => setDocForm(p => ({ ...p, status: e.target.value }))} fullWidth>
            {[
              { val:'PENDING',   label:'Pending'   },
              { val:'SUBMITTED', label:'Submitted' },
              { val:'VERIFIED',  label:'Verified'  },
            ].map(o => <MenuItem key={o.val} value={o.val}>{o.label}</MenuItem>)}
          </TextField>

          <TextField
            label="Remarks (optional)" value={docForm.remarks}
            onChange={e => setDocForm(p => ({ ...p, remarks: e.target.value }))}
            fullWidth multiline rows={2} />

          {docForm.status === 'VERIFIED' && (
            <TextField
              label="Verified By *" value={docForm.verifiedBy}
              onChange={e => setDocForm(p => ({ ...p, verifiedBy: e.target.value }))}
              fullWidth placeholder="Enter your name" />
          )}
        </DialogContent>
        <DialogActions sx={{ px:3, pb:3, gap:1 }}>
          <Button onClick={() => setDocDialog({ open:false, doc:null })} variant="outlined">Cancel</Button>
          <Button onClick={updateDoc} variant="contained" disabled={saving === 'doc'}>
            {saving === 'doc' ? 'Saving...' : 'Update Document'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Fee Dialog ────────────────────────────────────────────────────── */}
      <Dialog open={feeDialog} onClose={() => setFeeDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily:"'DM Serif Display',serif" }}>
          {feeMode === 'create' ? 'Create Fee Record' : 'Mark Fee as PAID'}
        </DialogTitle>
        <DialogContent sx={{ pt:'16px !important', display:'flex', flexDirection:'column', gap:2 }}>
          {feeMode === 'create' && (
            <TextField
              label="Amount (₹)" type="number" value={feeForm.amount}
              onChange={e => setFeeForm(p => ({ ...p, amount: e.target.value }))}
              fullWidth placeholder="e.g. 85000" />
          )}
          {feeMode === 'pay' && fee && (
            <Box sx={{ p:1.5, borderRadius:2, background:'rgba(52,211,153,0.06)', border:'1px solid rgba(52,211,153,0.2)' }}>
              <Typography sx={{ fontSize:12, color:'#64748b', mb:0.3 }}>Amount to mark paid</Typography>
              <Typography sx={{ color:'#34d399', fontWeight:800, fontSize:'1.2rem', fontFamily:'monospace' }}>
                ₹{(fee.amount || 0).toLocaleString('en-IN')}
              </Typography>
            </Box>
          )}
          <TextField
            label="Remarks (optional)" value={feeForm.remarks}
            onChange={e => setFeeForm(p => ({ ...p, remarks: e.target.value }))}
            fullWidth />
          {feeMode === 'pay' && (
            <TextField
              label="Updated By" value={feeForm.updatedBy}
              onChange={e => setFeeForm(p => ({ ...p, updatedBy: e.target.value }))}
              fullWidth placeholder="Enter your name" />
          )}
        </DialogContent>
        <DialogActions sx={{ px:3, pb:3, gap:1 }}>
          <Button onClick={() => setFeeDialog(false)} variant="outlined">Cancel</Button>
          <Button
            onClick={feeMode === 'create' ? createFee : markFeePaid}
            variant="contained" disabled={!!saving}
            color={feeMode === 'pay' ? 'success' : 'primary'}>
            {saving ? 'Saving...' : feeMode === 'create' ? 'Create Record' : 'Confirm Payment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Allocate Seat Dialog ───────────────────────────────────────────── */}
      <Dialog open={allocDialog} onClose={() => setAllocDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily:"'DM Serif Display',serif" }}>Allocate Seat</DialogTitle>
        <DialogContent sx={{ pt:'16px !important', display:'flex', flexDirection:'column', gap:2 }}>

          {/* Applicant summary */}
          <Box sx={{ p:2, borderRadius:2, background:'rgba(56,189,248,0.06)', border:'1px solid rgba(56,189,248,0.12)' }}>
            <Typography sx={{ fontSize:'0.78rem', color:'#64748b', mb:0.5 }}>Allocating seat for</Typography>
            <Typography sx={{ color:'#f1f5f9', fontWeight:600, mb:1 }}>
              {applicant?.firstName} {applicant?.lastName}
            </Typography>
            <Box sx={{ display:'flex', gap:1, flexWrap:'wrap' }}>
              <StatusChip status={applicant?.quotaType} />
              {program && <Chip label={program.name} size="small" sx={{ background:'rgba(255,255,255,0.06)', color:'#94a3b8', fontSize:11 }} />}
              <Chip label={applicant?.entryType} size="small" sx={{ background:'rgba(255,255,255,0.06)', color:'#94a3b8', fontSize:11 }} />
            </Box>
          </Box>

          {/* Institution dropdown */}
          <TextField
            select
            label="Institution *"
            value={allocForm.institutionId}
            onChange={e => {
              const inst = institutions.find(i => i.id === Number(e.target.value))
              setAllocForm(p => ({
                ...p,
                institutionId:   e.target.value,
                institutionCode: inst?.code || inst?.name || '',
                institutionName: inst?.name || '',
                courseType:      p.courseType,
              }))
            }}
            fullWidth
          >
            {institutions.length === 0
              ? <MenuItem disabled>No institutions found</MenuItem>
              : institutions.map(inst => (
                  <MenuItem key={inst.id} value={inst.id}>
                    {inst.code ? `${inst.code} — ${inst.name}` : inst.name}
                  </MenuItem>
                ))
            }
          </TextField>

          {/* Program dropdown — filtered to match applicant's program, or all */}
          <TextField
            select
            label="Program Code"
            value={allocForm.programCode}
            onChange={e => {
              const prog = filteredProgs.find(p => p.code === e.target.value)
              setAllocForm(p => ({
                ...p,
                programCode: e.target.value,
                courseType:  prog?.courseType || p.courseType,
              }))
            }}
            fullWidth
            helperText="Auto-filled from applicant's program. Change if needed."
          >
            {filteredProgs.length === 0
              ? <MenuItem disabled>No programs found</MenuItem>
              : filteredProgs.map(prog => (
                  <MenuItem key={prog.id} value={prog.code || prog.name}>
                    {prog.code ? `${prog.code} — ${prog.name}` : prog.name}
                    {' '}
                    <Typography component="span" sx={{ fontSize:11, color:'#64748b', ml:0.5 }}>
                      ({prog.courseType})
                    </Typography>
                  </MenuItem>
                ))
            }
          </TextField>

          <Box sx={{ display:'flex', gap:2 }}>
            <TextField select label="Course Type" value={allocForm.courseType}
              onChange={e => setAllocForm(p => ({ ...p, courseType: e.target.value }))} fullWidth>
              {['UG','PG'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </TextField>
            <TextField label="Academic Year" type="number" value={allocForm.academicYear}
              onChange={e => setAllocForm(p => ({ ...p, academicYear: e.target.value }))} fullWidth />
          </Box>

          <TextField
            label="Processed By"
            value={allocForm.processedBy}
            onChange={e => setAllocForm(p => ({ ...p, processedBy: e.target.value }))}
            fullWidth placeholder="Enter officer name" />
        </DialogContent>
        <DialogActions sx={{ px:3, pb:3, gap:1 }}>
          <Button onClick={() => setAllocDialog(false)} variant="outlined">Cancel</Button>
          <Button onClick={allocateSeat} variant="contained" disabled={saving === 'alloc'}>
            {saving === 'alloc' ? 'Allocating...' : 'Allocate Seat'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}





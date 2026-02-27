import React, { useState, useEffect } from 'react'
import {
  Box, Card, Grid, Typography, Button, Chip, Alert, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  MenuItem, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Divider, Avatar, IconButton, Tooltip
} from '@mui/material'
import {
  ArrowBackRounded, CheckCircleRounded, CancelRounded,
  AssignmentTurnedInRounded, PaymentsRounded, DescriptionRounded, EditRounded
} from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import { applicantApi, admissionApi, feeApi, masterApi } from '../api'
import PageHeader from '../components/PageHeader'
import StatusChip from '../components/StatusChip'

export default function ApplicantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [applicant, setApplicant] = useState(null)
  const [documents, setDocuments] = useState([])
  const [admission, setAdmission] = useState(null)
  const [fee, setFee] = useState(null)
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Dialog states
  const [docDialog, setDocDialog] = useState({ open: false, doc: null })
  const [docForm, setDocForm] = useState({ status: '', remarks: '', verifiedBy: '' })
  const [allocDialog, setAllocDialog] = useState(false)
  const [allocForm, setAllocForm] = useState({ institutionCode: '', programCode: '', courseType: 'UG', academicYear: new Date().getFullYear(), processedBy: '' })
  const [feeDialog, setFeeDialog] = useState(false)
  const [feeForm, setFeeForm] = useState({ amount: '', remarks: '', updatedBy: '' })
  const [saving, setSaving] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [a, d, p] = await Promise.all([
        applicantApi.getById(id),
        applicantApi.getDocuments(id),
        masterApi.getPrograms()
      ])
      setApplicant(a.data)
      setDocuments(d.data)
      setPrograms(p.data)
      // Try fetch admission & fee (may not exist)
      try { const adm = await admissionApi.getByApplicant(id); setAdmission(adm.data) } catch (_) {}
      try { const f = await feeApi.getByApplicant(id); setFee(f.data) } catch (_) {}
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [id])

  const updateDoc = async () => {
    setSaving('doc')
    try {
      await applicantApi.updateDocument(id, docDialog.doc.id, docForm)
      setDocDialog({ open: false, doc: null })
      setSuccess('Document updated!')
      load()
    } catch (e) { setError(e.message) } finally { setSaving('') }
  }

  const createFee = async () => {
    setSaving('fee')
    try {
      await feeApi.create({ applicantId: Number(id), programId: applicant.programId, amount: Number(feeForm.amount) || null })
      setFeeDialog(false); setSuccess('Fee record created!'); load()
    } catch (e) { setError(e.message) } finally { setSaving('') }
  }

  const markFeePaid = async () => {
    setSaving('feePay')
    try {
      await feeApi.update(id, { status: 'PAID', remarks: feeForm.remarks, updatedBy: feeForm.updatedBy })
      setFeeDialog(false); setSuccess('Fee marked as PAID!'); load()
    } catch (e) { setError(e.message) } finally { setSaving('') }
  }

  const allocateSeat = async () => {
    setSaving('alloc')
    try {
      const prog = programs.find(p => p.id === applicant.programId)
      await admissionApi.allocate({
        applicantId: Number(id),
        programId: applicant.programId,
        quotaType: applicant.quotaType,
        allotmentNumber: applicant.allotmentNumber,
        institutionCode: allocForm.institutionCode,
        programCode: allocForm.programCode || prog?.code,
        courseType: allocForm.courseType,
        academicYear: Number(allocForm.academicYear),
        processedBy: allocForm.processedBy,
      })
      setAllocDialog(false); setSuccess('Seat allocated!'); load()
    } catch (e) { setError(e.message) } finally { setSaving('') }
  }

  const confirmAdmission = async () => {
    setSaving('confirm')
    try {
      await admissionApi.confirm(admission.id)
      setSuccess('Admission confirmed! Admission number generated.'); load()
    } catch (e) { setError(e.message) } finally { setSaving('') }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress sx={{ color: '#38bdf8' }} /></Box>

  const program = programs.find(p => p.id === applicant?.programId)

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackRounded />} onClick={() => navigate('/applicants')} sx={{ color: '#64748b', mb: 2, '&:hover': { color: '#38bdf8' } }}>
          Back to Applicants
        </Button>
        <PageHeader
          title={`${applicant?.firstName} ${applicant?.lastName}`}
          subtitle={`Applicant #${id} · ${applicant?.email}`}
          breadcrumbs={['Applicants', 'Detail']}
        />
      </Box>

      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3}>
        {/* Left: Applicant info */}
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ width: 52, height: 52, background: 'linear-gradient(135deg, #38bdf8, #818cf8)', fontSize: '1.2rem', fontWeight: 700 }}>
                {applicant?.firstName?.[0]}{applicant?.lastName?.[0]}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 700, color: '#f1f5f9', fontSize: '1.1rem' }}>{applicant?.firstName} {applicant?.lastName}</Typography>
                <StatusChip status={applicant?.status} />
              </Box>
            </Box>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 2 }} />
            {[
              ['Email', applicant?.email],
              ['Phone', applicant?.phone],
              ['DOB', applicant?.dateOfBirth],
              ['Gender', applicant?.gender],
              ['Category', applicant?.category],
              ['Entry Type', applicant?.entryType],
              ['Quota', applicant?.quotaType],
              ['Program', program?.name],
              ['Qualifying Exam', applicant?.qualifyingExam],
              ['Marks', applicant?.qualifyingMarks],
              ['Allotment #', applicant?.allotmentNumber],
              ['Aadhar', applicant?.aadharNumber],
              ['Address', applicant?.address],
            ].map(([k, v]) => v && (
              <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.9, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>{k}</Typography>
                <Typography sx={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 500, textAlign: 'right', maxWidth: '55%' }}>{v}</Typography>
              </Box>
            ))}
          </Card>
        </Grid>

        {/* Right: Documents + Admission + Fee */}
        <Grid item xs={12} md={7}>
          {/* Documents */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography sx={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.2rem', color: '#f1f5f9', mb: 2 }}>
              Document Checklist
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Document</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Verified By</TableCell>
                    <TableCell align="right">Update</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map(d => (
                    <TableRow key={d.id}>
                      <TableCell sx={{ color: '#e2e8f0', fontSize: '0.83rem' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DescriptionRounded sx={{ fontSize: 14, color: '#64748b' }} />
                          {d.documentName}
                        </Box>
                      </TableCell>
                      <TableCell><StatusChip status={d.status} /></TableCell>
                      <TableCell sx={{ fontSize: '0.78rem', color: '#64748b' }}>{d.verifiedBy || '—'}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Update Status">
                          <IconButton size="small"
                            onClick={() => { setDocDialog({ open: true, doc: d }); setDocForm({ status: d.status, remarks: d.remarks || '', verifiedBy: d.verifiedBy || '' }) }}
                            sx={{ color: '#64748b', '&:hover': { color: '#38bdf8' } }}>
                            <EditRounded fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          {/* Fee */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.2rem', color: '#f1f5f9' }}>Fee Status</Typography>
              {!fee && <Button size="small" variant="outlined" startIcon={<PaymentsRounded />} onClick={() => { setFeeForm({ amount: '', remarks: '', updatedBy: '' }); setFeeDialog(true) }}>Create Fee Record</Button>}
            </Box>
            {fee ? (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderRadius: 2, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mb: 0.5 }}>Amount</Typography>
                    <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', fontFamily: "'JetBrains Mono',monospace" }}>
                      ₹{fee.amount?.toLocaleString() || 'N/A'}
                    </Typography>
                  </Box>
                  <StatusChip status={fee.status} size="medium" />
                </Box>
                {fee.status === 'PENDING' && (
                  <Button variant="contained" color="success" sx={{ mt: 2 }} fullWidth startIcon={<CheckCircleRounded />}
                    onClick={() => { setFeeForm({ amount: fee.amount || '', remarks: '', updatedBy: '' }); setFeeDialog(true) }}>
                    Mark as PAID
                  </Button>
                )}
                {fee.paidAt && <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 1 }}>Paid at: {new Date(fee.paidAt).toLocaleString()}</Typography>}
              </Box>
            ) : (
              <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>No fee record created yet.</Typography>
            )}
          </Card>

          {/* Admission */}
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.2rem', color: '#f1f5f9' }}>Admission</Typography>
              {!admission && (
                <Button size="small" variant="outlined" startIcon={<AssignmentTurnedInRounded />} onClick={() => setAllocDialog(true)}>
                  Allocate Seat
                </Button>
              )}
            </Box>
            {admission ? (
              <Box>
                {admission.admissionNumber && (
                  <Box sx={{ p: 2, mb: 2, borderRadius: 2, background: 'linear-gradient(135deg, rgba(52,211,153,0.08), rgba(56,189,248,0.08))', border: '1px solid rgba(52,211,153,0.2)' }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', mb: 0.5, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Admission Number</Typography>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', fontFamily: "'JetBrains Mono',monospace" }}>
                      {admission.admissionNumber}
                    </Typography>
                  </Box>
                )}
                {[
                  ['Status', <StatusChip key="s" status={admission.status} />],
                  ['Quota', <StatusChip key="q" status={admission.quotaType} />],
                  ['Allocated At', new Date(admission.allocatedAt).toLocaleString()],
                  ['Processed By', admission.processedBy],
                ].map(([k, v]) => (
                  <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>{k}</Typography>
                    <Box>{typeof v === 'string' ? <Typography sx={{ fontSize: '0.82rem', color: '#e2e8f0' }}>{v}</Typography> : v}</Box>
                  </Box>
                ))}
                {admission.status === 'ALLOCATED' && (
                  <Button variant="contained" fullWidth sx={{ mt: 2 }} startIcon={<CheckCircleRounded />}
                    disabled={saving === 'confirm' || fee?.status !== 'PAID'}
                    onClick={confirmAdmission}>
                    {saving === 'confirm' ? 'Confirming...' : fee?.status !== 'PAID' ? 'Fee must be PAID first' : 'Confirm Admission'}
                  </Button>
                )}
              </Box>
            ) : (
              <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>No seat allocated yet.</Typography>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Document Dialog */}
      <Dialog open={docDialog.open} onClose={() => setDocDialog({ open: false, doc: null })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: "'DM Serif Display',serif" }}>Update Document Status</DialogTitle>
        <DialogContent sx={{ pt: '16px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8' }}>{docDialog.doc?.documentName}</Typography>
          <TextField select label="Status" value={docForm.status} onChange={e => setDocForm(p => ({ ...p, status: e.target.value }))} fullWidth>
            {['PENDING', 'SUBMITTED', 'VERIFIED'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
          </TextField>
          <TextField label="Remarks" value={docForm.remarks} onChange={e => setDocForm(p => ({ ...p, remarks: e.target.value }))} fullWidth />
          {docForm.status === 'VERIFIED' && <TextField label="Verified By" value={docForm.verifiedBy} onChange={e => setDocForm(p => ({ ...p, verifiedBy: e.target.value }))} fullWidth />}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDocDialog({ open: false, doc: null })} variant="outlined">Cancel</Button>
          <Button onClick={updateDoc} variant="contained" disabled={saving === 'doc'}>{saving === 'doc' ? 'Saving...' : 'Update'}</Button>
        </DialogActions>
      </Dialog>

      {/* Fee Dialog */}
      <Dialog open={feeDialog} onClose={() => setFeeDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: "'DM Serif Display',serif" }}>{fee ? 'Mark Fee as PAID' : 'Create Fee Record'}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {!fee && <TextField label="Amount (₹)" type="number" value={feeForm.amount} onChange={e => setFeeForm(p => ({ ...p, amount: e.target.value }))} fullWidth />}
          <TextField label="Remarks" value={feeForm.remarks} onChange={e => setFeeForm(p => ({ ...p, remarks: e.target.value }))} fullWidth />
          {fee && <TextField label="Updated By" value={feeForm.updatedBy} onChange={e => setFeeForm(p => ({ ...p, updatedBy: e.target.value }))} fullWidth />}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setFeeDialog(false)} variant="outlined">Cancel</Button>
          <Button onClick={fee ? markFeePaid : createFee} variant="contained" disabled={!!saving}>
            {saving ? 'Saving...' : fee ? 'Mark PAID' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Allocate Dialog */}
      <Dialog open={allocDialog} onClose={() => setAllocDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'DM Serif Display',serif" }}>Allocate Seat</DialogTitle>
        <DialogContent sx={{ pt: '16px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.1)' }}>
            <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mb: 0.5 }}>Allocating for</Typography>
            <Typography sx={{ color: '#f1f5f9', fontWeight: 600 }}>{applicant?.firstName} {applicant?.lastName}</Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <StatusChip status={applicant?.quotaType} />
              <Chip label={program?.name} size="small" sx={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }} />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Institution Code" value={allocForm.institutionCode} onChange={e => setAllocForm(p => ({ ...p, institutionCode: e.target.value }))} fullWidth placeholder="e.g. ABC" />
            <TextField label="Program Code" value={allocForm.programCode} onChange={e => setAllocForm(p => ({ ...p, programCode: e.target.value }))} fullWidth placeholder="e.g. CSE" />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField select label="Course Type" value={allocForm.courseType} onChange={e => setAllocForm(p => ({ ...p, courseType: e.target.value }))} fullWidth>
              {['UG', 'PG'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </TextField>
            <TextField label="Academic Year" type="number" value={allocForm.academicYear} onChange={e => setAllocForm(p => ({ ...p, academicYear: e.target.value }))} fullWidth />
          </Box>
          <TextField label="Processed By" value={allocForm.processedBy} onChange={e => setAllocForm(p => ({ ...p, processedBy: e.target.value }))} fullWidth />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setAllocDialog(false)} variant="outlined">Cancel</Button>
          <Button onClick={allocateSeat} variant="contained" disabled={saving === 'alloc'}>{saving === 'alloc' ? 'Allocating...' : 'Allocate Seat'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
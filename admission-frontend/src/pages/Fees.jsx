import React, { useState, useEffect } from 'react'
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, CircularProgress, Typography, Button, Tooltip, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material'
import { CheckCircleRounded, PaymentsRounded } from '@mui/icons-material'
import { feeApi } from '../api'
import PageHeader from '../components/PageHeader'
import StatusChip from '../components/StatusChip'

export default function Fees() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [payDialog, setPayDialog] = useState({ open: false, fee: null })
  const [payForm, setPayForm] = useState({ remarks: '', updatedBy: '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    feeApi.getAll().then(r => setRows(r.data)).catch(e => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const markPaid = async () => {
    setSaving(true)
    try {
      await feeApi.update(payDialog.fee.applicantId, { status: 'PAID', ...payForm })
      setPayDialog({ open: false, fee: null })
      setSuccess('Fee marked as PAID!'); load()
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  const paid = rows.filter(r => r.status === 'PAID').length
  const pending = rows.filter(r => r.status === 'PENDING').length
  const totalAmt = rows.filter(r => r.status === 'PAID').reduce((s, r) => s + (r.amount || 0), 0)

  return (
    <Box>
      <PageHeader title="Fee Management" subtitle="Track and manage applicant fee status" breadcrumbs={['Fee Management']} />
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Records', value: rows.length, color: '#38bdf8' },
          { label: 'Fee Paid', value: paid, color: '#34d399' },
          { label: 'Pending', value: pending, color: '#fbbf24' },
          { label: 'Revenue Collected', value: `₹${totalAmt.toLocaleString()}`, color: '#a78bfa' },
        ].map(s => (
          <Box key={s.label} sx={{
            px: 3, py: 2, borderRadius: 2, minWidth: 140,
            background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.color}30`,
          }}>
            <Typography sx={{ fontSize: '0.7rem', color: '#64748b', mb: 0.3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</Typography>
            <Typography sx={{ fontSize: typeof s.value === 'string' && s.value.includes('₹') ? '1.2rem' : '1.8rem', fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1 }}>{s.value}</Typography>
          </Box>
        ))}
      </Box>

      <Card>
        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress sx={{ color: '#38bdf8' }} /></Box> : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Applicant ID</TableCell>
                  <TableCell>Program ID</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Paid At</TableCell>
                  <TableCell>Updated By</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(r => (
                  <TableRow key={r.id}>
                    <TableCell sx={{ fontFamily: "'JetBrains Mono',monospace", color: '#38bdf8', fontWeight: 700 }}>#{r.applicantId}</TableCell>
                    <TableCell sx={{ fontFamily: "'JetBrains Mono',monospace", color: '#94a3b8' }}>P-{r.programId}</TableCell>
                    <TableCell sx={{ fontFamily: "'JetBrains Mono',monospace", color: '#f1f5f9', fontWeight: 600 }}>
                      {r.amount ? `₹${r.amount.toLocaleString()}` : '—'}
                    </TableCell>
                    <TableCell><StatusChip status={r.status} /></TableCell>
                    <TableCell sx={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {r.paidAt ? new Date(r.paidAt).toLocaleString() : '—'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.82rem', color: '#94a3b8' }}>{r.updatedBy || '—'}</TableCell>
                    <TableCell align="right">
                      {r.status === 'PENDING' && (
                        <Tooltip title="Mark as Paid">
                          <IconButton size="small" onClick={() => { setPayDialog({ open: true, fee: r }); setPayForm({ remarks: '', updatedBy: '' }) }}
                            sx={{ color: '#34d399', '&:hover': { background: 'rgba(52,211,153,0.1)' } }}>
                            <CheckCircleRounded fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5, color: '#475569' }}>No fee records yet.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Dialog open={payDialog.open} onClose={() => setPayDialog({ open: false, fee: null })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: "'DM Serif Display',serif" }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PaymentsRounded sx={{ color: '#34d399' }} />
            Mark Fee as PAID
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: '16px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.1)' }}>
            <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>Applicant ID: <span style={{ color: '#38bdf8', fontFamily: 'JetBrains Mono' }}>#{payDialog.fee?.applicantId}</span></Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#64748b', mt: 0.5 }}>Amount: <span style={{ color: '#f1f5f9', fontWeight: 600 }}>₹{payDialog.fee?.amount?.toLocaleString()}</span></Typography>
          </Box>
          <TextField label="Remarks" value={payForm.remarks} onChange={e => setPayForm(p => ({ ...p, remarks: e.target.value }))} fullWidth />
          <TextField label="Processed By" value={payForm.updatedBy} onChange={e => setPayForm(p => ({ ...p, updatedBy: e.target.value }))} fullWidth />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setPayDialog({ open: false, fee: null })} variant="outlined">Cancel</Button>
          <Button onClick={markPaid} variant="contained" color="success" disabled={saving}>{saving ? 'Processing...' : 'Confirm Payment'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
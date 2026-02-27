import React, { useState, useEffect } from 'react'
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, CircularProgress, Typography, Chip, Button, Tooltip, IconButton
} from '@mui/material'
import { CheckCircleRounded, CancelRounded, VisibilityRounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { admissionApi } from '../api'
import PageHeader from '../components/PageHeader'
import StatusChip from '../components/StatusChip'

export default function Admissions() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = () => {
    setLoading(true)
    admissionApi.getAll().then(r => setRows(r.data)).catch(e => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const confirm = async (id) => {
    try {
      await admissionApi.confirm(id)
      setSuccess('Admission confirmed! Number generated.')
      load()
    } catch (e) { setError(e.message) }
  }

  const cancel = async (id) => {
    if (!confirm('Cancel this admission? Seat will be released.')) return
    try { await admissionApi.cancel(id); load() } catch (e) { setError(e.message) }
  }

  const confirmed = rows.filter(r => r.status === 'CONFIRMED').length
  const allocated = rows.filter(r => r.status === 'ALLOCATED').length

  return (
    <Box>
      <PageHeader title="Admissions" subtitle={`${confirmed} confirmed · ${allocated} pending confirmation`} breadcrumbs={['Admissions']} />
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

      {/* Stats row */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Total', value: rows.length, color: '#38bdf8' },
          { label: 'Confirmed', value: confirmed, color: '#34d399' },
          { label: 'Allocated', value: allocated, color: '#fbbf24' },
          { label: 'Cancelled', value: rows.filter(r => r.status === 'CANCELLED').length, color: '#f87171' },
        ].map(s => (
          <Box key={s.label} sx={{
            px: 3, py: 2, borderRadius: 2, minWidth: 120,
            background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.color}30`,
          }}>
            <Typography sx={{ fontSize: '0.7rem', color: '#64748b', mb: 0.3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</Typography>
            <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1 }}>{s.value}</Typography>
          </Box>
        ))}
      </Box>

      <Card>
        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress sx={{ color: '#38bdf8' }} /></Box> : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Admission #</TableCell>
                  <TableCell>Applicant ID</TableCell>
                  <TableCell>Program ID</TableCell>
                  <TableCell>Quota</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Allocated At</TableCell>
                  <TableCell>Processed By</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>
                      {r.admissionNumber ? (
                        <Typography sx={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.78rem', color: '#34d399', fontWeight: 700 }}>
                          {r.admissionNumber}
                        </Typography>
                      ) : (
                        <Typography sx={{ color: '#475569', fontSize: '0.78rem' }}>Not yet generated</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => navigate(`/applicants/${r.applicantId}`)} sx={{ color: '#38bdf8', p: 0, minWidth: 0, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, textTransform: 'none' }}>
                        #{r.applicantId}
                      </Button>
                    </TableCell>
                    <TableCell sx={{ fontFamily: "'JetBrains Mono',monospace", color: '#94a3b8' }}>P-{r.programId}</TableCell>
                    <TableCell><StatusChip status={r.quotaType} /></TableCell>
                    <TableCell><StatusChip status={r.status} /></TableCell>
                    <TableCell sx={{ fontSize: '0.78rem', color: '#64748b' }}>{new Date(r.allocatedAt).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ fontSize: '0.82rem', color: '#94a3b8' }}>{r.processedBy || '—'}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                        {r.status === 'ALLOCATED' && (
                          <Tooltip title="Confirm Admission">
                            <IconButton size="small" onClick={() => confirm(r.id)} sx={{ color: '#34d399', '&:hover': { background: 'rgba(52,211,153,0.1)' } }}>
                              <CheckCircleRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {r.status !== 'CANCELLED' && r.status !== 'CONFIRMED' && (
                          <Tooltip title="Cancel">
                            <IconButton size="small" onClick={() => cancel(r.id)} sx={{ color: '#64748b', '&:hover': { color: '#f87171' } }}>
                              <CancelRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="View Applicant">
                          <IconButton size="small" onClick={() => navigate(`/applicants/${r.applicantId}`)} sx={{ color: '#64748b', '&:hover': { color: '#38bdf8' } }}>
                            <VisibilityRounded fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && <TableRow><TableCell colSpan={8} align="center" sx={{ py: 5, color: '#475569' }}>No admissions yet.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  )
}
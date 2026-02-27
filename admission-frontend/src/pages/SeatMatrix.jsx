import React, { useState, useEffect } from 'react'
import {
  Box, Card, Button, Grid, Typography, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, IconButton, Alert, CircularProgress,
  LinearProgress, Tooltip, Divider, Chip
} from '@mui/material'
import { AddRounded, EventSeatRounded, RefreshRounded } from '@mui/icons-material'
import { seatApi, masterApi } from '../api'
import PageHeader from '../components/PageHeader'
import StatusChip from '../components/StatusChip'

const QUOTA_TYPES = ['KCET', 'COMEDK', 'MANAGEMENT']
const QUOTA_COLORS = { KCET: '#38bdf8', COMEDK: '#a78bfa', MANAGEMENT: '#fb923c' }

export default function SeatMatrix() {
  const [matrices, setMatrices] = useState([])
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    programId: '', totalIntake: '', supernumerarySeats: 0,
    quotas: [
      { quotaType: 'KCET', totalSeats: '' },
      { quotaType: 'COMEDK', totalSeats: '' },
      { quotaType: 'MANAGEMENT', totalSeats: '' },
    ]
  })

  const load = () => {
    setLoading(true)
    Promise.all([seatApi.getAllMatrices(), masterApi.getPrograms()])
      .then(([m, p]) => { setMatrices(m.data); setPrograms(p.data) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const quotaSum = form.quotas.reduce((s, q) => s + (Number(q.totalSeats) || 0), 0)
  const isValid = form.programId && form.totalIntake && quotaSum === Number(form.totalIntake)

  const updateQuota = (idx, val) => {
    setForm(p => ({ ...p, quotas: p.quotas.map((q, i) => i === idx ? { ...q, totalSeats: val } : q) }))
  }

  const save = async () => {
    setSaving(true)
    try {
      await seatApi.createMatrix({
        programId: Number(form.programId),
        totalIntake: Number(form.totalIntake),
        supernumerarySeats: Number(form.supernumerarySeats) || 0,
        quotas: form.quotas.map(q => ({ quotaType: q.quotaType, totalSeats: Number(q.totalSeats) }))
      })
      setOpen(false); load()
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  const getProgramName = (id) => programs.find(p => p.id === id)?.name || `Program ${id}`

  return (
    <Box>
      <PageHeader
        title="Seat Matrix"
        subtitle="Configure intake and quota allocations per program"
        breadcrumbs={['Seat Matrix']}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<RefreshRounded />} onClick={load}>Refresh</Button>
            <Button variant="contained" startIcon={<AddRounded />} onClick={() => setOpen(true)}>Configure Matrix</Button>
          </Box>
        }
      />
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress sx={{ color: '#38bdf8' }} /></Box>
      ) : (
        <Grid container spacing={3}>
          {matrices.map((matrix) => (
            <Grid item xs={12} md={6} xl={4} key={matrix.id}>
              <Card sx={{ p: 3, position: 'relative', overflow: 'visible' }}>
                {/* Top glow bar */}
                <Box sx={{ position: 'absolute', top: 0, left: 16, right: 16, height: 3, borderRadius: '0 0 4px 4px', background: 'linear-gradient(90deg, #38bdf8, #a78bfa)' }} />

                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', letterSpacing: '0.1em', textTransform: 'uppercase', mb: 0.5 }}>
                      Program
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem' }}>
                      {getProgramName(matrix.programId)}
                    </Typography>
                  </Box>
                  <Box sx={{
                    px: 2, py: 0.8, borderRadius: '8px',
                    background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)',
                  }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center' }}>Intake</Typography>
                    <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8', fontFamily: "'JetBrains Mono',monospace", textAlign: 'center', lineHeight: 1 }}>
                      {matrix.totalIntake}
                    </Typography>
                  </Box>
                </Box>

                {/* Overall progress */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                    <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8' }}>Overall Fill Rate</Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: '#f1f5f9', fontWeight: 600 }}>
                      {matrix.totalAdmitted}/{matrix.totalIntake}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={matrix.totalIntake > 0 ? (matrix.totalAdmitted / matrix.totalIntake) * 100 : 0}
                    sx={{
                      height: 8, borderRadius: 4,
                      '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #38bdf8, #a78bfa)' },
                    }}
                  />
                </Box>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 2 }} />

                {/* Per-quota rows */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {(matrix.quotas || []).map(q => {
                    const pct = q.totalSeats > 0 ? (q.admittedSeats / q.totalSeats) * 100 : 0
                    const color = QUOTA_COLORS[q.quotaType] || '#64748b'
                    return (
                      <Box key={q.quotaType}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.6 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>{q.quotaType}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                              <span style={{ color: color, fontWeight: 700, fontFamily: 'JetBrains Mono' }}>{q.admittedSeats}</span>
                              <span style={{ color: '#475569' }}> / {q.totalSeats}</span>
                            </Typography>
                            {q.isFull ? (
                              <Chip label="FULL" size="small" sx={{ height: 18, fontSize: '0.65rem', background: 'rgba(248,113,113,0.15)', color: '#f87171', fontWeight: 700 }} />
                            ) : (
                              <Chip label={`${q.availableSeats} left`} size="small" sx={{ height: 18, fontSize: '0.65rem', background: 'rgba(52,211,153,0.1)', color: '#34d399', fontWeight: 600 }} />
                            )}
                          </Box>
                        </Box>
                        <LinearProgress variant="determinate" value={Math.min(pct, 100)}
                          sx={{ height: 5, borderRadius: 3, '& .MuiLinearProgress-bar': { background: color, borderRadius: 3 } }}
                        />
                      </Box>
                    )
                  })}
                </Box>

                {matrix.supernumerarySeats > 0 && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>Supernumerary Seats</Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 600 }}>{matrix.supernumerarySeats}</Typography>
                  </Box>
                )}
              </Card>
            </Grid>
          ))}
          {matrices.length === 0 && (
            <Grid item xs={12}>
              <Card sx={{ p: 8, textAlign: 'center' }}>
                <EventSeatRounded sx={{ fontSize: 56, color: '#1e293b', mb: 2 }} />
                <Typography sx={{ color: '#475569', mb: 1 }}>No seat matrices configured yet.</Typography>
                <Typography sx={{ color: '#334155', fontSize: '0.85rem' }}>Create programs first, then configure their intake and quotas.</Typography>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* Create Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.4rem' }}>Configure Seat Matrix</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField select label="Program *" value={form.programId} onChange={e => setForm(p => ({ ...p, programId: e.target.value }))} fullWidth>
              {programs.map(p => <MenuItem key={p.id} value={p.id}>{p.name} ({p.code})</MenuItem>)}
            </TextField>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Total Intake *" type="number" value={form.totalIntake} onChange={e => setForm(p => ({ ...p, totalIntake: e.target.value }))} fullWidth />
              <TextField label="Supernumerary" type="number" value={form.supernumerarySeats} onChange={e => setForm(p => ({ ...p, supernumerarySeats: e.target.value }))} fullWidth />
            </Box>

            <Box sx={{ p: 2.5, borderRadius: 2, background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.1)' }}>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8', mb: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Quota Allocation
              </Typography>
              {form.quotas.map((q, i) => (
                <Box key={q.quotaType} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: QUOTA_COLORS[q.quotaType], flexShrink: 0 }} />
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', minWidth: 100 }}>{q.quotaType}</Typography>
                  <TextField type="number" value={q.totalSeats} onChange={e => updateQuota(i, e.target.value)} size="small" label="Seats" fullWidth />
                </Box>
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.06)', mt: 1 }}>
                <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>Sum of quotas</Typography>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: quotaSum === Number(form.totalIntake) && form.totalIntake ? '#34d399' : '#f87171', fontFamily: "'JetBrains Mono',monospace" }}>
                  {quotaSum} / {form.totalIntake || '?'}
                  {quotaSum === Number(form.totalIntake) && form.totalIntake ? ' ✓' : ' (must match)'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={save} variant="contained" disabled={saving || !isValid}>
            {saving ? 'Saving...' : 'Create Matrix'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
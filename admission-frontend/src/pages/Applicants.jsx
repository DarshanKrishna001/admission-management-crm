import React, { useState, useEffect } from 'react'
import {
  Box, Card, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, Alert, CircularProgress, Tooltip,
  InputAdornment, Avatar, Typography
} from '@mui/material'
import { AddRounded, SearchRounded, VisibilityRounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { applicantApi, masterApi } from '../api'
import PageHeader from '../components/PageHeader'
import StatusChip from '../components/StatusChip'

const GENDERS = ['MALE', 'FEMALE', 'OTHER']
const CATEGORIES = ['GM', 'SC', 'ST', 'OBC', 'EWS', 'NRI', 'MANAGEMENT']
const ENTRY_TYPES = ['REGULAR', 'LATERAL']
const QUOTA_TYPES = ['KCET', 'COMEDK', 'MANAGEMENT']

const initForm = {
  firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '',
  gender: '', category: '', entryType: '', quotaType: '', programId: '',
  qualifyingExam: '', qualifyingMarks: '', allotmentNumber: '', address: '', aadharNumber: ''
}

export default function Applicants() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(initForm)

  const load = () => {
    setLoading(true)
    Promise.all([applicantApi.getAll(), masterApi.getPrograms()])
      .then(([a, p]) => { setRows(a.data); setPrograms(p.data) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const save = async () => {
    setSaving(true)
    try {
      const payload = {
        ...form,
        programId: Number(form.programId),
        qualifyingMarks: form.qualifyingMarks ? Number(form.qualifyingMarks) : null,
      }
      await applicantApi.create(payload)
      setOpen(false); load()
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  const filtered = rows.filter(r =>
    `${r.firstName} ${r.lastName} ${r.email} ${r.allotmentNumber || ''}`.toLowerCase().includes(search.toLowerCase())
  )

  const avatarColor = (name) => {
    const colors = ['#38bdf8', '#a78bfa', '#34d399', '#fb923c', '#f87171', '#fbbf24']
    return colors[(name?.charCodeAt(0) || 0) % colors.length]
  }

  return (
    <Box>
      <PageHeader
        title="Applicants"
        subtitle={`${rows.length} total applicants`}
        breadcrumbs={['Applicants']}
        action={<Button variant="contained" startIcon={<AddRounded />} onClick={() => { setForm(initForm); setOpen(true) }}>Add Applicant</Button>}
      />
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 2, p: 2 }}>
        <TextField
          placeholder="Search by name, email or allotment number..."
          value={search} onChange={e => setSearch(e.target.value)}
          fullWidth size="small"
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded sx={{ color: '#64748b' }} /></InputAdornment> }}
        />
      </Card>

      <Card>
        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress sx={{ color: '#38bdf8' }} /></Box> : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Applicant</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Quota</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Marks</TableCell>
                  <TableCell>Allotment #</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 34, height: 34, background: `${avatarColor(r.firstName)}22`, color: avatarColor(r.firstName), fontSize: '0.82rem', fontWeight: 700, border: `1px solid ${avatarColor(r.firstName)}40` }}>
                          {r.firstName?.[0]}{r.lastName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.88rem' }}>{r.firstName} {r.lastName}</Typography>
                          <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>ID: {r.id}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.82rem', color: '#94a3b8' }}>{r.email}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{r.phone}</Typography>
                    </TableCell>
                    <TableCell><StatusChip status={r.quotaType} /></TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontSize: '0.82rem' }}>{r.category}</TableCell>
                    <TableCell sx={{ fontFamily: "'JetBrains Mono',monospace", color: '#fbbf24', fontWeight: 600 }}>{r.qualifyingMarks ?? '—'}</TableCell>
                    <TableCell sx={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.78rem', color: '#64748b' }}>{r.allotmentNumber || '—'}</TableCell>
                    <TableCell><StatusChip status={r.status} /></TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => navigate(`/applicants/${r.id}`)} sx={{ color: '#64748b', '&:hover': { color: '#38bdf8' } }}>
                          <VisibilityRounded fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={8} align="center" sx={{ py: 5, color: '#475569' }}>
                    {search ? 'No applicants match your search.' : 'No applicants yet.'}
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Create Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.4rem' }}>New Applicant</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="First Name *" value={form.firstName} onChange={f('firstName')} fullWidth />
              <TextField label="Last Name *" value={form.lastName} onChange={f('lastName')} fullWidth />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Email *" value={form.email} onChange={f('email')} fullWidth />
              <TextField label="Phone *" value={form.phone} onChange={f('phone')} fullWidth />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Date of Birth" type="date" value={form.dateOfBirth} onChange={f('dateOfBirth')} fullWidth InputLabelProps={{ shrink: true }} />
              <TextField select label="Gender *" value={form.gender} onChange={f('gender')} fullWidth>
                {GENDERS.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </TextField>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField select label="Category *" value={form.category} onChange={f('category')} fullWidth>
                {CATEGORIES.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </TextField>
              <TextField select label="Entry Type *" value={form.entryType} onChange={f('entryType')} fullWidth>
                {ENTRY_TYPES.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </TextField>
              <TextField select label="Quota Type *" value={form.quotaType} onChange={f('quotaType')} fullWidth>
                {QUOTA_TYPES.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </TextField>
            </Box>
            <TextField select label="Program *" value={form.programId} onChange={f('programId')} fullWidth>
              {programs.map(p => <MenuItem key={p.id} value={p.id}>{p.name} ({p.code})</MenuItem>)}
            </TextField>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Qualifying Exam" value={form.qualifyingExam} onChange={f('qualifyingExam')} fullWidth />
              <TextField label="Marks / %" type="number" value={form.qualifyingMarks} onChange={f('qualifyingMarks')} fullWidth />
            </Box>
            <TextField label="Allotment Number (KCET/COMEDK)" value={form.allotmentNumber} onChange={f('allotmentNumber')} fullWidth />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Address" value={form.address} onChange={f('address')} fullWidth />
              <TextField label="Aadhar Number" value={form.aadharNumber} onChange={f('aadharNumber')} fullWidth />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={save} variant="contained" disabled={saving}>{saving ? 'Saving...' : 'Create Applicant'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
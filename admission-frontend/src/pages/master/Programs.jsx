import React, { useState, useEffect } from 'react'
import {
  Box, Card, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, Alert, CircularProgress, Tooltip, Chip
} from '@mui/material'
import { AddRounded, EditRounded } from '@mui/icons-material'
import { masterApi } from '../../api'
import PageHeader from '../../components/PageHeader'
import StatusChip from '../../components/StatusChip'

const COURSE_TYPES = ['UG', 'PG']
const ENTRY_TYPES = ['REGULAR', 'LATERAL']
const ADMISSION_MODES = ['GOVERNMENT', 'MANAGEMENT']

const initForm = { name: '', code: '', courseType: '', entryType: '', admissionMode: '', departmentId: '', academicYearId: '', durationYears: '', description: '' }

export default function Programs() {
  const [rows, setRows] = useState([])
  const [departments, setDepartments] = useState([])
  const [academicYears, setAcademicYears] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(initForm)

  const load = () => {
    setLoading(true)
    Promise.all([masterApi.getPrograms(), masterApi.getDepartments(), masterApi.getAcademicYears()])
      .then(([p, d, a]) => { setRows(p.data); setDepartments(d.data); setAcademicYears(a.data) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
  const openCreate = () => { setEditing(null); setForm(initForm); setOpen(true) }
  const openEdit = r => {
    setEditing(r)
    setForm({ name: r.name, code: r.code || '', courseType: r.courseType, entryType: r.entryType, admissionMode: r.admissionMode, departmentId: r.departmentId, academicYearId: r.academicYearId, durationYears: r.durationYears || '', description: r.description || '' })
    setOpen(true)
  }
  const save = async () => {
    setSaving(true)
    try {
      const p = { ...form, departmentId: Number(form.departmentId), academicYearId: Number(form.academicYearId), durationYears: form.durationYears ? Number(form.durationYears) : null }
      if (editing) await masterApi.updateProgram(editing.id, p)
      else await masterApi.createProgram(p)
      setOpen(false); load()
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  return (
    <Box>
      <PageHeader title="Programs" subtitle="Configure academic programs and branches" breadcrumbs={['Master Setup', 'Programs']}
        action={<Button variant="contained" startIcon={<AddRounded />} onClick={openCreate}>Add Program</Button>} />
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      <Card>
        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress sx={{ color: '#38bdf8' }} /></Box> : (
          <TableContainer><Table>
            <TableHead><TableRow>
              <TableCell>Program</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Entry</TableCell>
              <TableCell>Mode</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Year</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell sx={{ fontWeight: 600, color: '#f1f5f9', maxWidth: 200 }}>{r.name}</TableCell>
                  <TableCell sx={{ fontFamily: "'JetBrains Mono',monospace", color: '#38bdf8', fontWeight: 700 }}>{r.code}</TableCell>
                  <TableCell>
                    <Chip label={r.courseType} size="small" sx={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)', fontWeight: 600 }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={r.entryType} size="small" sx={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)', fontWeight: 600, fontSize: '0.7rem' }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={r.admissionMode} size="small" sx={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)', fontWeight: 600, fontSize: '0.7rem' }} />
                  </TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontSize: '0.82rem' }}>{r.departmentName}</TableCell>
                  <TableCell sx={{ color: '#64748b', fontSize: '0.82rem' }}>{r.academicYearName}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(r)} sx={{ color: '#64748b', '&:hover': { color: '#38bdf8' } }}><EditRounded fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && <TableRow><TableCell colSpan={8} align="center" sx={{ py: 5, color: '#475569' }}>No programs yet. Set up Institutions → Campuses → Departments first.</TableCell></TableRow>}
            </TableBody>
          </Table></TableContainer>
        )}
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.4rem' }}>{editing ? 'Edit' : 'Create'} Program</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Program Name *" value={form.name} onChange={f('name')} fullWidth />
              <TextField label="Code (e.g. CSE)" value={form.code} onChange={f('code')} sx={{ minWidth: 140 }} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField select label="Course Type *" value={form.courseType} onChange={f('courseType')} fullWidth>
                {COURSE_TYPES.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </TextField>
              <TextField select label="Entry Type *" value={form.entryType} onChange={f('entryType')} fullWidth>
                {ENTRY_TYPES.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </TextField>
              <TextField select label="Admission Mode *" value={form.admissionMode} onChange={f('admissionMode')} fullWidth>
                {ADMISSION_MODES.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </TextField>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField select label="Department *" value={form.departmentId} onChange={f('departmentId')} fullWidth>
                {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
              </TextField>
              <TextField select label="Academic Year *" value={form.academicYearId} onChange={f('academicYearId')} fullWidth>
                {academicYears.map(a => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
              </TextField>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Duration (Years)" type="number" value={form.durationYears} onChange={f('durationYears')} sx={{ minWidth: 160 }} />
              <TextField label="Description" value={form.description} onChange={f('description')} fullWidth />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={save} variant="contained" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
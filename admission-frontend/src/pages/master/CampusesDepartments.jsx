import React, { useState, useEffect } from 'react'
import {
  Box, Card, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, Alert, CircularProgress, Tooltip
} from '@mui/material'
import { AddRounded, EditRounded } from '@mui/icons-material'
import { masterApi } from '../../api'
import PageHeader from '../../components/PageHeader'

export function Campuses() {
  const [rows, setRows] = useState([])
  const [institutions, setInstitutions] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', code: '', location: '', institutionId: '' })

  const load = () => {
    setLoading(true)
    Promise.all([masterApi.getCampuses(), masterApi.getInstitutions()])
      .then(([c, i]) => { setRows(c.data); setInstitutions(i.data) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
  const openCreate = () => { setEditing(null); setForm({ name: '', code: '', location: '', institutionId: '' }); setOpen(true) }
  const openEdit = r => { setEditing(r); setForm({ name: r.name, code: r.code || '', location: r.location || '', institutionId: r.institutionId }); setOpen(true) }
  const save = async () => {
    setSaving(true)
    try {
      const p = { ...form, institutionId: Number(form.institutionId) }
      if (editing) await masterApi.updateCampus(editing.id, p)
      else await masterApi.createCampus(p)
      setOpen(false); load()
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  return (
    <Box>
      <PageHeader title="Campuses" subtitle="Manage college campuses" breadcrumbs={['Master Setup', 'Campuses']}
        action={<Button variant="contained" startIcon={<AddRounded />} onClick={openCreate}>Add Campus</Button>} />
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      <Card>
        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress sx={{ color: '#38bdf8' }} /></Box> : (
          <TableContainer><Table>
            <TableHead><TableRow>
              <TableCell>Name</TableCell><TableCell>Code</TableCell><TableCell>Location</TableCell><TableCell>Institution</TableCell><TableCell align="right">Actions</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell sx={{ fontWeight: 600, color: '#f1f5f9' }}>{r.name}</TableCell>
                  <TableCell sx={{ fontFamily: "'JetBrains Mono',monospace", color: '#38bdf8' }}>{r.code}</TableCell>
                  <TableCell sx={{ color: '#94a3b8' }}>{r.location}</TableCell>
                  <TableCell sx={{ color: '#a78bfa' }}>{r.institutionName}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(r)} sx={{ color: '#64748b', '&:hover': { color: '#38bdf8' } }}><EditRounded fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5, color: '#475569' }}>No campuses yet.</TableCell></TableRow>}
            </TableBody>
          </Table></TableContainer>
        )}
      </Card>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.4rem' }}>{editing ? 'Edit' : 'Create'} Campus</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
          <TextField label="Campus Name *" value={form.name} onChange={f('name')} fullWidth />
          <TextField label="Code" value={form.code} onChange={f('code')} fullWidth />
          <TextField label="Location" value={form.location} onChange={f('location')} fullWidth />
          <TextField select label="Institution *" value={form.institutionId} onChange={f('institutionId')} fullWidth>
            {institutions.map(i => <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={save} variant="contained" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export function Departments() {
  const [rows, setRows] = useState([])
  const [campuses, setCampuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', code: '', campusId: '' })

  const load = () => {
    setLoading(true)
    Promise.all([masterApi.getDepartments(), masterApi.getCampuses()])
      .then(([d, c]) => { setRows(d.data); setCampuses(c.data) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
  const openCreate = () => { setEditing(null); setForm({ name: '', code: '', campusId: '' }); setOpen(true) }
  const openEdit = r => { setEditing(r); setForm({ name: r.name, code: r.code || '', campusId: r.campusId }); setOpen(true) }
  const save = async () => {
    setSaving(true)
    try {
      const p = { ...form, campusId: Number(form.campusId) }
      if (editing) await masterApi.updateDepartment(editing.id, p)
      else await masterApi.createDepartment(p)
      setOpen(false); load()
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  return (
    <Box>
      <PageHeader title="Departments" subtitle="Manage academic departments" breadcrumbs={['Master Setup', 'Departments']}
        action={<Button variant="contained" startIcon={<AddRounded />} onClick={openCreate}>Add Department</Button>} />
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      <Card>
        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress sx={{ color: '#38bdf8' }} /></Box> : (
          <TableContainer><Table>
            <TableHead><TableRow>
              <TableCell>Name</TableCell><TableCell>Code</TableCell><TableCell>Campus</TableCell><TableCell align="right">Actions</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell sx={{ fontWeight: 600, color: '#f1f5f9' }}>{r.name}</TableCell>
                  <TableCell sx={{ fontFamily: "'JetBrains Mono',monospace", color: '#38bdf8' }}>{r.code}</TableCell>
                  <TableCell sx={{ color: '#a78bfa' }}>{r.campusName}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(r)} sx={{ color: '#64748b', '&:hover': { color: '#38bdf8' } }}><EditRounded fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && <TableRow><TableCell colSpan={4} align="center" sx={{ py: 5, color: '#475569' }}>No departments yet.</TableCell></TableRow>}
            </TableBody>
          </Table></TableContainer>
        )}
      </Card>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.4rem' }}>{editing ? 'Edit' : 'Create'} Department</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
          <TextField label="Department Name *" value={form.name} onChange={f('name')} fullWidth />
          <TextField label="Code (e.g. CSE)" value={form.code} onChange={f('code')} fullWidth />
          <TextField select label="Campus *" value={form.campusId} onChange={f('campusId')} fullWidth>
            {campuses.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={save} variant="contained" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Campuses
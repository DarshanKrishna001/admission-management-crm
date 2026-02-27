import React, { useState, useEffect } from 'react'
import {
  Box, Card, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControlLabel, Switch, IconButton, CircularProgress,
  Alert, Chip, Tooltip
} from '@mui/material'
import { AddRounded, EditRounded, DeleteRounded, StarRounded, CalendarMonthRounded } from '@mui/icons-material'
import { masterApi } from '../../api'
import PageHeader from '../../components/PageHeader'

export default function AcademicYears() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', startYear: '', endYear: '', isCurrent: false })

  const load = () => {
    setLoading(true)
    masterApi.getAcademicYears()
      .then(r => setRows(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openCreate = () => { setEditing(null); setForm({ name: '', startYear: '', endYear: '', isCurrent: false }); setOpen(true) }
  const openEdit = (row) => { setEditing(row); setForm({ name: row.name, startYear: row.startYear, endYear: row.endYear, isCurrent: row.isCurrent }); setOpen(true) }

  const save = async () => {
    setSaving(true)
    try {
      const payload = { ...form, startYear: Number(form.startYear), endYear: Number(form.endYear) }
      if (editing) await masterApi.updateAcademicYear(editing.id, payload)
      else await masterApi.createAcademicYear(payload)
      setOpen(false); load()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const del = async (id) => {
    if (!confirm('Delete this academic year?')) return
    try { await masterApi.deleteAcademicYear(id); load() } catch (e) { setError(e.message) }
  }

  return (
    <Box>
      <PageHeader
        title="Academic Years"
        subtitle="Manage academic year configurations"
        breadcrumbs={['Master Setup', 'Academic Years']}
        action={
          <Button variant="contained" startIcon={<AddRounded />} onClick={openCreate}>
            Add Academic Year
          </Button>
        }
      />
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress sx={{ color: '#38bdf8' }} />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Start Year</TableCell>
                  <TableCell>End Year</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={r.id}>
                    <TableCell sx={{ color: '#475569' }}>{i + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#f1f5f9' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarMonthRounded sx={{ fontSize: 16, color: '#38bdf8' }} />
                        {r.name}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontFamily: "'JetBrains Mono',monospace" }}>{r.startYear}</TableCell>
                    <TableCell sx={{ fontFamily: "'JetBrains Mono',monospace" }}>{r.endYear}</TableCell>
                    <TableCell>
                      {r.isCurrent ? (
                        <Chip icon={<StarRounded />} label="Current" size="small"
                          sx={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)', fontWeight: 600 }} />
                      ) : (
                        <Chip label="Inactive" size="small"
                          sx={{ background: 'rgba(100,116,139,0.1)', color: '#64748b', border: '1px solid rgba(100,116,139,0.2)' }} />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(r)} sx={{ color: '#64748b', '&:hover': { color: '#38bdf8' } }}><EditRounded fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" onClick={() => del(r.id)} sx={{ color: '#64748b', '&:hover': { color: '#f87171' } }}><DeleteRounded fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5, color: '#475569' }}>No academic years yet. Click "Add" to create one.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.4rem', pb: 1 }}>
          {editing ? 'Edit Academic Year' : 'Create Academic Year'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
          <TextField label="Name (e.g. 2025-2026)" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} fullWidth />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Start Year" type="number" value={form.startYear} onChange={e => setForm(p => ({ ...p, startYear: e.target.value }))} fullWidth />
            <TextField label="End Year" type="number" value={form.endYear} onChange={e => setForm(p => ({ ...p, endYear: e.target.value }))} fullWidth />
          </Box>
          <FormControlLabel
            control={<Switch checked={form.isCurrent} onChange={e => setForm(p => ({ ...p, isCurrent: e.target.checked }))} sx={{ '& .MuiSwitch-thumb': { background: '#38bdf8' } }} />}
            label="Set as Current Year"
            sx={{ color: '#94a3b8' }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={save} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
import React, { useState, useEffect } from 'react'
import {
  Box, Card, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Alert, CircularProgress, Tooltip, Avatar
} from '@mui/material'
import { AddRounded, EditRounded, DeleteRounded, AccountBalanceRounded } from '@mui/icons-material'
import { masterApi } from '../../api'
import PageHeader from '../../components/PageHeader'

const initForm = { name: '', code: '', address: '', contactEmail: '', contactPhone: '', jkTotalLimit: '' }

export default function Institutions() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(initForm)

  const load = () => { setLoading(true); masterApi.getInstitutions().then(r => setRows(r.data)).catch(e => setError(e.message)).finally(() => setLoading(false)) }
  useEffect(load, [])
  const f = (k) => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const openCreate = () => { setEditing(null); setForm(initForm); setOpen(true) }
  const openEdit = (r) => { setEditing(r); setForm({ name: r.name, code: r.code || '', address: r.address || '', contactEmail: r.contactEmail || '', contactPhone: r.contactPhone || '', jkTotalLimit: r.jkTotalLimit || '' }); setOpen(true) }

  const save = async () => {
    setSaving(true)
    try {
      const p = { ...form, jkTotalLimit: form.jkTotalLimit ? Number(form.jkTotalLimit) : null }
      if (editing) await masterApi.updateInstitution(editing.id, p)
      else await masterApi.createInstitution(p)
      setOpen(false); load()
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  return (
    <Box>
      <PageHeader title="Institutions" subtitle="Manage college institutions" breadcrumbs={['Master Setup', 'Institutions']}
        action={<Button variant="contained" startIcon={<AddRounded />} onClick={openCreate}>Add Institution</Button>} />
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      <Card>
        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress sx={{ color: '#38bdf8' }} /></Box> : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Institution</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>J&K Limit</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 34, height: 34, background: 'rgba(56,189,248,0.15)', color: '#38bdf8', fontSize: '0.8rem' }}>
                          {r.name?.[0]}
                        </Avatar>
                        <Box>
                          <Box sx={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.88rem' }}>{r.name}</Box>
                          <Box sx={{ fontSize: '0.72rem', color: '#64748b' }}>{r.address}</Box>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontFamily: "'JetBrains Mono',monospace", color: '#38bdf8', fontWeight: 600 }}>{r.code}</TableCell>
                    <TableCell>
                      <Box sx={{ fontSize: '0.82rem', color: '#94a3b8' }}>{r.contactEmail}</Box>
                      <Box sx={{ fontSize: '0.75rem', color: '#64748b' }}>{r.contactPhone}</Box>
                    </TableCell>
                    <TableCell sx={{ fontFamily: "'JetBrains Mono',monospace", color: '#fbbf24' }}>{r.jkTotalLimit ?? '—'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(r)} sx={{ color: '#64748b', '&:hover': { color: '#38bdf8' } }}><EditRounded fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5, color: '#475569' }}>No institutions yet.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.4rem' }}>{editing ? 'Edit' : 'Create'} Institution</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
          <TextField label="Institution Name *" value={form.name} onChange={f('name')} fullWidth />
          <TextField label="Code (e.g. ABC)" value={form.code} onChange={f('code')} fullWidth />
          <TextField label="Address" value={form.address} onChange={f('address')} fullWidth multiline rows={2} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Contact Email" value={form.contactEmail} onChange={f('contactEmail')} fullWidth />
            <TextField label="Contact Phone" value={form.contactPhone} onChange={f('contactPhone')} fullWidth />
          </Box>
          <TextField label="J&K Total Limit (optional)" type="number" value={form.jkTotalLimit} onChange={f('jkTotalLimit')} fullWidth />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={save} variant="contained" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
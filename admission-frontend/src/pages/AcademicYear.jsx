import React, { useState, useEffect } from 'react'
import {
  Box, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Button, Chip, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, Tooltip, Switch,
  FormControlLabel, CircularProgress
} from '@mui/material'
import {
  AddRounded, EditRounded, DeleteRounded,
  CalendarMonthRounded, CheckCircleRounded
} from '@mui/icons-material'
import { masterApi } from '../api'
import PageHeader from '../components/PageHeader'

// ── Month options ─────────────────────────────────────────────────────────────
const MONTHS = [
  { value: 1,  label: 'January'   },
  { value: 2,  label: 'February'  },
  { value: 3,  label: 'March'     },
  { value: 4,  label: 'April'     },
  { value: 5,  label: 'May'       },
  { value: 6,  label: 'June'      },
  { value: 7,  label: 'July'      },
  { value: 8,  label: 'August'    },
  { value: 9,  label: 'September' },
  { value: 10, label: 'October'   },
  { value: 11, label: 'November'  },
  { value: 12, label: 'December'  },
]

const CURRENT_YEAR = new Date().getFullYear()

const EMPTY_FORM = {
  name:       '',
  startYear:  CURRENT_YEAR,
  startMonth: 6,          // June
  endYear:    CURRENT_YEAR + 1,
  endMonth:   5,          // May
  isCurrent:  false,
}

// Auto-generate name like "2025-2026" when years change
const buildName = (startYear, endYear) =>
  startYear && endYear ? `${startYear}-${endYear}` : ''

export default function AcademicYears() {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [saving,  setSaving]  = useState(false)

  const [dialog,  setDialog]  = useState(false)
  const [editing, setEditing] = useState(null)   // null = create mode
  const [form,    setForm]    = useState(EMPTY_FORM)
  const [delId,   setDelId]   = useState(null)

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true)
    try {
      const res = await masterApi.getAcademicYears()
      setRows(res.data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // ── Open create dialog ────────────────────────────────────────────────────
  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setDialog(true)
  }

  // ── Open edit dialog ──────────────────────────────────────────────────────
  const openEdit = (row) => {
    setEditing(row)
    setForm({
      name:       row.name,
      startYear:  row.startYear,
      startMonth: row.startMonth || 6,
      endYear:    row.endYear,
      endMonth:   row.endMonth   || 5,
      isCurrent:  row.isCurrent  || false,
    })
    setDialog(true)
  }

  // ── Field change — auto update name when years change ─────────────────────
  const handleChange = (field, value) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value }
      // Auto-generate name if it matches the pattern or is empty
      if (field === 'startYear' || field === 'endYear') {
        const autoName = buildName(updated.startYear, updated.endYear)
        const currentAuto = buildName(prev.startYear, prev.endYear)
        if (prev.name === '' || prev.name === currentAuto) {
          updated.name = autoName
        }
      }
      return updated
    })
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const save = async () => {
    if (!form.name.trim())    { setError('Name is required');        return }
    if (!form.startYear)      { setError('Start year is required');  return }
    if (!form.startMonth)     { setError('Start month is required'); return }
    if (!form.endYear)        { setError('End year is required');    return }
    if (!form.endMonth)       { setError('End month is required');   return }

    setSaving(true)
    try {
      const payload = {
        name:       form.name.trim(),
        startYear:  Number(form.startYear),
        startMonth: Number(form.startMonth),
        endYear:    Number(form.endYear),
        endMonth:   Number(form.endMonth),
        isCurrent:  form.isCurrent,
      }
      if (editing) {
        await masterApi.updateAcademicYear(editing.id, payload)
        setSuccess(`"${payload.name}" updated successfully.`)
      } else {
        await masterApi.createAcademicYear(payload)
        setSuccess(`"${payload.name}" created successfully.`)
      }
      setDialog(false)
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Delete (soft) ─────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!delId) return
    try {
      await masterApi.deleteAcademicYear(delId)
      setSuccess('Academic year deleted.')
      setDelId(null)
      load()
    } catch (e) {
      setError(e.message)
      setDelId(null)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <PageHeader
          title="Academic Years"
          subtitle="Manage academic year periods for admissions"
          breadcrumbs={['Master Setup', 'Academic Years']}
          icon={<CalendarMonthRounded />}
        />
        <Button variant="contained" startIcon={<AddRounded />} onClick={openCreate}
          sx={{ mt: 1, background: 'linear-gradient(135deg,#38bdf8,#818cf8)', whiteSpace: 'nowrap' }}>
          Add Academic Year
        </Button>
      </Box>

      {error   && <Alert severity="error"   onClose={() => setError('')}   sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: '#38bdf8' }} />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {['Name', 'Start', 'End', 'Status', 'Current', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ color: '#64748b', fontSize: 11, fontWeight: 700, letterSpacing: 0.8 }}>
                      {h.toUpperCase()}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#475569' }}>
                      No academic years found. Click "Add Academic Year" to create one.
                    </TableCell>
                  </TableRow>
                )}
                {rows.map(row => (
                  <TableRow key={row.id} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                    <TableCell sx={{ color: '#f1f5f9', fontWeight: 600 }}>{row.name}</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                      {row.startMonthName || monthLabel(row.startMonth)} {row.startYear}
                    </TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                      {row.endMonthName || monthLabel(row.endMonth)} {row.endYear}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.active ? 'Active' : 'Inactive'}
                        size="small"
                        sx={{
                          background: row.active ? 'rgba(52,211,153,0.12)' : 'rgba(100,116,139,0.15)',
                          color:      row.active ? '#34d399' : '#64748b',
                          fontWeight: 600, fontSize: 11
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {row.isCurrent && (
                        <Chip
                          icon={<CheckCircleRounded sx={{ fontSize: 13 }} />}
                          label="Current"
                          size="small"
                          sx={{ background: 'rgba(56,189,248,0.12)', color: '#38bdf8', fontWeight: 600, fontSize: 11 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(row)}
                            sx={{ color: '#64748b', '&:hover': { color: '#38bdf8' } }}>
                            <EditRounded fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => setDelId(row.id)}
                            sx={{ color: '#64748b', '&:hover': { color: '#f87171' } }}>
                            <DeleteRounded fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* ── Create / Edit Dialog ────────────────────────────────────────────── */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'DM Serif Display',serif" }}>
          {editing ? 'Edit Academic Year' : 'Add Academic Year'}
        </DialogTitle>
        <DialogContent sx={{ pt: '16px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* Name — auto-generated, but editable */}
          <TextField
            label="Academic Year Name *"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            fullWidth
            placeholder="e.g. 2025-2026"
            helperText="Auto-filled when you set the years below"
          />

          {/* Start Year + Start Month */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Start Year *"
              type="number"
              value={form.startYear}
              onChange={e => handleChange('startYear', Number(e.target.value))}
              fullWidth
              inputProps={{ min: 2000, max: 2100 }}
            />
            <TextField
              select
              label="Start Month *"
              value={form.startMonth}
              onChange={e => setForm(p => ({ ...p, startMonth: Number(e.target.value) }))}
              fullWidth
            >
              {MONTHS.map(m => (
                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
              ))}
            </TextField>
          </Box>

          {/* End Year + End Month */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="End Year *"
              type="number"
              value={form.endYear}
              onChange={e => handleChange('endYear', Number(e.target.value))}
              fullWidth
              inputProps={{ min: 2000, max: 2100 }}
            />
            <TextField
              select
              label="End Month *"
              value={form.endMonth}
              onChange={e => setForm(p => ({ ...p, endMonth: Number(e.target.value) }))}
              fullWidth
            >
              {MONTHS.map(m => (
                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Period preview */}
          {form.startYear && form.startMonth && form.endYear && form.endMonth && (
            <Box sx={{
              p: 1.5, borderRadius: 2,
              background: 'rgba(56,189,248,0.06)',
              border: '1px solid rgba(56,189,248,0.15)'
            }}>
              <Typography sx={{ fontSize: 12, color: '#64748b', mb: 0.3 }}>Period Preview</Typography>
              <Typography sx={{ color: '#38bdf8', fontWeight: 600 }}>
                {monthLabel(form.startMonth)} {form.startYear}
                {' → '}
                {monthLabel(form.endMonth)} {form.endYear}
              </Typography>
            </Box>
          )}

          {/* Mark as current */}
          <FormControlLabel
            control={
              <Switch
                checked={!!form.isCurrent}
                onChange={e => setForm(p => ({ ...p, isCurrent: e.target.checked }))}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#38bdf8' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#38bdf8' },
                }}
              />
            }
            label={
              <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Mark as Current Academic Year
              </Typography>
            }
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDialog(false)} variant="outlined">Cancel</Button>
          <Button onClick={save} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm Dialog ───────────────────────────────────────────── */}
      <Dialog open={!!delId} onClose={() => setDelId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Academic Year?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            This will deactivate the academic year. Existing programs linked to it will not be affected.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDelId(null)} variant="outlined">Cancel</Button>
          <Button onClick={confirmDelete} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

// Helper — month number to name without backend
function monthLabel(num) {
  const m = MONTHS.find(x => x.value === Number(num))
  return m ? m.label : ''
}
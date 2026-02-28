import React, { useEffect, useState, useCallback } from 'react'
import {
  Box, Grid, Card, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Alert,
  LinearProgress, Avatar, Chip, IconButton, Tooltip, Skeleton
} from '@mui/material'
import {
  PeopleRounded, AssignmentTurnedInRounded, PaymentsRounded,
  EventSeatRounded, TrendingUpRounded, CheckCircleRounded,
  RefreshRounded, ErrorOutlineRounded, WarningAmberRounded
} from '@mui/icons-material'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts'
import {
  masterApi, seatApi, applicantApi, admissionApi, feeApi
} from '../api'
import PageHeader from '../components/PageHeader'
import StatCard   from '../components/StatCard'
import StatusChip from '../components/StatusChip'
import { useAuth } from '../context/AuthContext'

const QUOTA_COLORS = { KCET: '#38bdf8', COMEDK: '#a78bfa', MANAGEMENT: '#fb923c' }

// ── Skeleton card shown while loading ─────────────────────────────────────────
function SkeletonCard() {
  return (
    <Card sx={{ p: 3 }}>
      <Skeleton variant="text" width="50%" sx={{ bgcolor: 'rgba(255,255,255,0.07)', mb: 1 }} />
      <Skeleton variant="text" width="30%" height={40} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
    </Card>
  )
}

// ── Service status badge ───────────────────────────────────────────────────────
function ServiceBadge({ label, ok }) {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 0.6,
      px: 1.2, py: 0.3, borderRadius: 5,
      background: ok ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
      border: `1px solid ${ok ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
    }}>
      <Box sx={{
        width: 6, height: 6, borderRadius: '50%',
        background: ok ? '#34d399' : '#f87171',
        boxShadow: ok ? '0 0 6px #34d399' : '0 0 6px #f87171'
      }}/>
      <Typography sx={{ fontSize: 10, color: ok ? '#34d399' : '#f87171', fontWeight: 600 }}>
        {label}
      </Typography>
    </Box>
  )
}

export default function Dashboard() {
  const { user } = useAuth()

  // ── Individual data states ─────────────────────────────────────────────────
  const [programs,    setPrograms]    = useState([])
  const [matrices,    setMatrices]    = useState([])
  const [applicants,  setApplicants]  = useState([])
  const [admissions,  setAdmissions]  = useState([])
  const [fees,        setFees]        = useState([])

  // ── Service status ─────────────────────────────────────────────────────────
  const [status, setStatus] = useState({
    master:     'loading',
    seats:      'loading',
    applicants: 'loading',
    admissions: 'loading',
    fees:       'loading',
  })

  const [refreshKey, setRefreshKey] = useState(0)

  const setServiceStatus = (name, ok) =>
    setStatus(s => ({ ...s, [name]: ok ? 'ok' : 'error' }))

  // ── Fetch each service independently — one failure won't block others ──────
  const fetchAll = useCallback(() => {
    setStatus({ master:'loading', seats:'loading', applicants:'loading', admissions:'loading', fees:'loading' })

    // Master — programs
    masterApi.getPrograms()
      .then(r => { setPrograms(r.data || []); setServiceStatus('master', true) })
      .catch(() => { setPrograms([]); setServiceStatus('master', false) })

    // Seat Matrix
    seatApi.getAllMatrices()
      .then(r => { setMatrices(r.data || []); setServiceStatus('seats', true) })
      .catch(() => { setMatrices([]); setServiceStatus('seats', false) })

    // Applicants
    applicantApi.getAll()
      .then(r => { setApplicants(r.data || []); setServiceStatus('applicants', true) })
      .catch(() => { setApplicants([]); setServiceStatus('applicants', false) })

    // Admissions
    admissionApi.getAll()
      .then(r => { setAdmissions(r.data || []); setServiceStatus('admissions', true) })
      .catch(() => { setAdmissions([]); setServiceStatus('admissions', false) })

    // Fees
    feeApi.getAll()
      .then(r => { setFees(r.data || []); setServiceStatus('fees', true) })
      .catch(() => { setFees([]); setServiceStatus('fees', false) })
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll, refreshKey])

  const isLoading = Object.values(status).some(s => s === 'loading')
  const hasAnyError = Object.values(status).some(s => s === 'error')

  // ── Computed stats from raw data ───────────────────────────────────────────
  const totalIntake    = matrices.reduce((s, m) => s + (m.totalIntake || 0), 0)
  const totalAdmitted  = matrices.reduce((s, m) => s + (m.totalAdmitted || 0), 0)
  const totalAvailable = totalIntake - totalAdmitted
  const admitRate      = totalIntake > 0 ? Math.round((totalAdmitted / totalIntake) * 100) : 0

  const confirmedAdmissions = admissions.filter(a => a.status === 'CONFIRMED').length
  const pendingConfirmation  = admissions.filter(a => a.status === 'ALLOCATED').length

  const pendingFees = fees.filter(f => f.status === 'PENDING')
  const paidFees    = fees.filter(f => f.status === 'PAID')

  const pendingDocApplicants = applicants.filter(a =>
    a.status === 'DOCUMENTS_PENDING' || a.status === 'APPLIED'
  ).length

  // ── Bar chart — per matrix ─────────────────────────────────────────────────
  const barData = matrices.map((m, i) => {
    const prog = programs.find(p => p.id === m.programId)
    return {
      name: prog?.code || `P-${m.programId}`,
      intake:   m.totalIntake    || 0,
      admitted: m.totalAdmitted  || 0,
      available:m.totalAvailable || 0,
    }
  })

  // ── Pie chart — quota distribution across all matrices ────────────────────
  const quotaMap = {}
  matrices.forEach(m => {
    (m.quotas || []).forEach(q => {
      if (!quotaMap[q.quotaType]) quotaMap[q.quotaType] = { totalSeats: 0, admittedSeats: 0 }
      quotaMap[q.quotaType].totalSeats    += q.totalSeats    || 0
      quotaMap[q.quotaType].admittedSeats += q.admittedSeats || 0
    })
  })
  const pieData = Object.entries(quotaMap).map(([name, v]) => ({
    name, value: v.admittedSeats, total: v.totalSeats
  }))

  // ── All quota rows for table ───────────────────────────────────────────────
  const quotaRows = matrices.flatMap(m => {
    const prog = programs.find(p => p.id === m.programId)
    return (m.quotas || []).map((q, qi) => ({
      programLabel: prog?.name || `Program ${m.programId}`,
      programCode:  prog?.code || `P-${m.programId}`,
      quota: q,
      firstRow: qi === 0,
    }))
  })

  return (
    <Box sx={{ animation: 'fadeInUp 0.4s ease' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <PageHeader
          title="Dashboard Overview"
          subtitle={`Welcome back, ${user?.fullName || user?.username} · ${user?.role?.replace('_', ' ')}`}
          breadcrumbs={['Home', 'Dashboard']}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
          {/* Refresh button */}
          <Tooltip title="Refresh all data">
            <IconButton
              onClick={() => setRefreshKey(k => k + 1)}
              disabled={isLoading}
              sx={{
                color: '#38bdf8',
                background: 'rgba(56,189,248,0.1)',
                border: '1px solid rgba(56,189,248,0.2)',
                '&:hover': { background: 'rgba(56,189,248,0.2)' }
              }}
            >
              <RefreshRounded sx={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }}/>
            </IconButton>
          </Tooltip>
          {/* Service status badges */}
          <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <ServiceBadge label="Master"     ok={status.master     === 'ok'} />
            <ServiceBadge label="Seats"      ok={status.seats      === 'ok'} />
            <ServiceBadge label="Applicants" ok={status.applicants === 'ok'} />
            <ServiceBadge label="Admissions" ok={status.admissions === 'ok'} />
            <ServiceBadge label="Fees"       ok={status.fees       === 'ok'} />
          </Box>
        </Box>
      </Box>

      {/* Partial error warning — doesn't block page */}
      {!isLoading && hasAnyError && (
        <Alert
          severity="warning"
          icon={<WarningAmberRounded />}
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <IconButton size="small" color="inherit" onClick={() => setRefreshKey(k => k + 1)}>
              <RefreshRounded fontSize="small"/>
            </IconButton>
          }
        >
          Some services are unavailable. Data shown may be partial.
          Check that all backend services are running and click refresh.
        </Alert>
      )}

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {isLoading
          ? Array(6).fill(0).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}><SkeletonCard /></Grid>
            ))
          : [
              {
                title: 'Total Intake',
                value: totalIntake,
                subtitle: `${matrices.length} programs configured`,
                icon: <EventSeatRounded />, color: '#38bdf8',
              },
              {
                title: 'Admitted',
                value: totalAdmitted,
                subtitle: `${admitRate}% of total intake filled`,
                icon: <AssignmentTurnedInRounded />, color: '#34d399',
                progress: admitRate,
              },
              {
                title: 'Available Seats',
                value: totalAvailable,
                subtitle: 'Remaining across all quotas',
                icon: <TrendingUpRounded />, color: '#a78bfa',
              },
              {
                title: 'Total Applicants',
                value: applicants.length,
                subtitle: `${pendingDocApplicants} with pending documents`,
                icon: <PeopleRounded />, color: '#fbbf24',
              },
              {
                title: 'Confirmed Admissions',
                value: confirmedAdmissions,
                subtitle: `${pendingConfirmation} pending confirmation`,
                icon: <CheckCircleRounded />, color: '#34d399',
              },
              {
                title: 'Fee Pending',
                value: pendingFees.length,
                subtitle: `${paidFees.length} fees collected`,
                icon: <PaymentsRounded />, color: '#f87171',
              },
            ].map((stat, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <StatCard {...stat} />
              </Grid>
            ))
        }
      </Grid>

      {/* ── Charts Row ──────────────────────────────────────────────────────── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>

        {/* Bar Chart */}
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 3 }}>
            <Typography sx={{
              fontFamily: "'DM Serif Display',serif", fontSize: '1.25rem',
              color: '#f1f5f9', mb: 0.5
            }}>
              Intake vs Admitted by Program
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.8rem', mb: 3 }}>
              Comparison of configured seats and actual admissions
            </Typography>

            {status.seats === 'loading' ? (
              <Skeleton variant="rectangular" height={220} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}/>
            ) : status.seats === 'error' ? (
              <ServiceError label="Seat Matrix Service" />
            ) : barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} barGap={4}>
                  <XAxis dataKey="name" tick={{ fill:'#64748b', fontSize:12 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill:'#64748b', fontSize:12 }} axisLine={false} tickLine={false}/>
                  <RTooltip
                    contentStyle={{ background:'#1e293b', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10 }}
                    labelStyle={{ color:'#f1f5f9' }}
                  />
                  <Bar dataKey="intake"   fill="#38bdf840" radius={[6,6,0,0]} name="Total Intake" />
                  <Bar dataKey="admitted" fill="#38bdf8"   radius={[6,6,0,0]} name="Admitted" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState label="No seat matrix configured yet" />
            )}
          </Card>
        </Grid>

        {/* Pie Chart */}
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography sx={{
              fontFamily: "'DM Serif Display',serif", fontSize: '1.25rem',
              color: '#f1f5f9', mb: 0.5
            }}>
              Quota Distribution
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.8rem', mb: 2 }}>
              Admitted students by quota type
            </Typography>

            {status.seats === 'loading' ? (
              <Skeleton variant="circular" width={160} height={160} sx={{ bgcolor:'rgba(255,255,255,0.05)', mx:'auto', mt:2 }}/>
            ) : status.seats === 'error' ? (
              <ServiceError label="Seat Matrix Service" />
            ) : pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" outerRadius={75} innerRadius={45} paddingAngle={3}>
                    {pieData.map((e, i) => (
                      <Cell key={i} fill={QUOTA_COLORS[e.name] || '#64748b'} />
                    ))}
                  </Pie>
                  <RTooltip
                    contentStyle={{ background:'#1e293b', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10 }}
                    formatter={(val, name, props) => [`${val} admitted / ${props.payload.total} total`, name]}
                  />
                  <Legend formatter={v => <span style={{ color:'#94a3b8', fontSize:13 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState label="No quota data yet" />
            )}
          </Card>
        </Grid>
      </Grid>

      {/* ── Bottom Row ──────────────────────────────────────────────────────── */}
      <Grid container spacing={3}>

        {/* Seat Matrix Table */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Typography sx={{
              fontFamily: "'DM Serif Display',serif", fontSize: '1.25rem',
              color: '#f1f5f9', mb: 0.5
            }}>
              Live Seat Matrix
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.8rem', mb: 3 }}>
              Real-time quota-wise seat counters
            </Typography>

            {status.seats === 'loading' ? (
              <Box sx={{ display:'flex', flexDirection:'column', gap:1 }}>
                {Array(4).fill(0).map((_, i) => (
                  <Skeleton key={i} variant="rectangular" height={36}
                    sx={{ bgcolor:'rgba(255,255,255,0.04)', borderRadius:1 }}/>
                ))}
              </Box>
            ) : status.seats === 'error' ? (
              <ServiceError label="Seat Matrix Service" />
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color:'#64748b', fontWeight:600, fontSize:11, letterSpacing:0.8 }}>PROGRAM</TableCell>
                      <TableCell sx={{ color:'#64748b', fontWeight:600, fontSize:11, letterSpacing:0.8 }}>QUOTA</TableCell>
                      <TableCell align="center" sx={{ color:'#64748b', fontWeight:600, fontSize:11, letterSpacing:0.8 }}>TOTAL</TableCell>
                      <TableCell align="center" sx={{ color:'#64748b', fontWeight:600, fontSize:11, letterSpacing:0.8 }}>ADMITTED</TableCell>
                      <TableCell align="center" sx={{ color:'#64748b', fontWeight:600, fontSize:11, letterSpacing:0.8 }}>AVAILABLE</TableCell>
                      <TableCell sx={{ color:'#64748b', fontWeight:600, fontSize:11, letterSpacing:0.8 }}>FILL RATE</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {quotaRows.map((row, idx) => {
                      const q = row.quota
                      const fill = q.totalSeats > 0
                        ? Math.round((q.admittedSeats / q.totalSeats) * 100) : 0
                      return (
                        <TableRow key={idx} sx={{ '&:hover': { background:'rgba(255,255,255,0.02)' } }}>
                          <TableCell sx={{ color:'#94a3b8', fontSize:12 }}>
                            {row.firstRow ? (
                              <Box>
                                <Typography sx={{ fontSize:12, color:'#f1f5f9', fontWeight:600 }}>{row.programCode}</Typography>
                                <Typography sx={{ fontSize:10, color:'#64748b' }}>{row.programLabel}</Typography>
                              </Box>
                            ) : ''}
                          </TableCell>
                          <TableCell><StatusChip status={q.quotaType} /></TableCell>
                          <TableCell align="center" sx={{ fontFamily:'monospace', color:'#f1f5f9' }}>{q.totalSeats}</TableCell>
                          <TableCell align="center" sx={{ fontFamily:'monospace', color:'#38bdf8', fontWeight:600 }}>{q.admittedSeats}</TableCell>
                          <TableCell align="center" sx={{
                            fontFamily:'monospace', fontWeight:600,
                            color: q.availableSeats === 0 ? '#f87171' : '#34d399'
                          }}>
                            {q.availableSeats ?? (q.totalSeats - q.admittedSeats)}
                          </TableCell>
                          <TableCell sx={{ minWidth:140 }}>
                            <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                              <LinearProgress
                                variant="determinate" value={fill}
                                sx={{
                                  flex:1, height:6, borderRadius:3,
                                  bgcolor:'rgba(255,255,255,0.06)',
                                  '& .MuiLinearProgress-bar': {
                                    background: fill >= 90 ? '#f87171' : fill >= 60 ? '#fbbf24' : '#34d399',
                                    borderRadius:3
                                  }
                                }}
                              />
                              <Typography sx={{ fontSize:'0.72rem', color:'#64748b', minWidth:32 }}>
                                {fill}%
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {quotaRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py:5, color:'#475569' }}>
                          No seat matrix configured yet. Go to Seat Matrix to configure.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Grid>

        {/* Right column */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display:'flex', flexDirection:'column', gap:3 }}>

            {/* Pending Fees */}
            <Card sx={{ p:3 }}>
              <Typography sx={{
                fontFamily:"'DM Serif Display',serif", fontSize:'1.1rem',
                color:'#f1f5f9', mb:0.5
              }}>
                Pending Fees
              </Typography>
              <Typography sx={{ color:'#64748b', fontSize:'0.78rem', mb:2 }}>
                Applicants awaiting payment
              </Typography>

              {status.fees === 'loading' ? (
                Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} variant="rectangular" height={52}
                    sx={{ bgcolor:'rgba(255,255,255,0.04)', borderRadius:2, mb:1 }}/>
                ))
              ) : status.fees === 'error' ? (
                <ServiceError label="Fee Service" small />
              ) : pendingFees.length > 0 ? (
                <Box sx={{ display:'flex', flexDirection:'column', gap:1 }}>
                  {pendingFees.slice(0, 5).map((fee, i) => (
                    <Box key={i} sx={{
                      display:'flex', alignItems:'center', gap:1.5, p:1.5,
                      background:'rgba(255,255,255,0.03)', borderRadius:2,
                      border:'1px solid rgba(255,255,255,0.05)'
                    }}>
                      <Avatar sx={{
                        width:32, height:32, fontSize:'0.75rem', fontWeight:700,
                        background:'rgba(251,191,36,0.15)', color:'#fbbf24'
                      }}>
                        {String(fee.applicantId || i + 1).slice(-2)}
                      </Avatar>
                      <Box sx={{ flex:1, minWidth:0 }}>
                        <Typography sx={{ fontSize:'0.82rem', color:'#f1f5f9', fontWeight:500 }} noWrap>
                          Applicant #{fee.applicantId}
                        </Typography>
                        <Typography sx={{ fontSize:'0.72rem', color:'#64748b' }}>
                          ₹{fee.amount?.toLocaleString() || 'N/A'}
                        </Typography>
                      </Box>
                      <StatusChip status="PENDING" />
                    </Box>
                  ))}
                  {pendingFees.length > 5 && (
                    <Typography sx={{ color:'#64748b', fontSize:12, textAlign:'center', mt:0.5 }}>
                      +{pendingFees.length - 5} more
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box sx={{ textAlign:'center', py:3 }}>
                  <CheckCircleRounded sx={{ color:'#34d399', fontSize:32, mb:1 }}/>
                  <Typography sx={{ color:'#64748b', fontSize:'0.85rem' }}>All fees cleared!</Typography>
                </Box>
              )}
            </Card>

            {/* Admission Stats */}
            <Card sx={{ p:3 }}>
              <Typography sx={{
                fontFamily:"'DM Serif Display',serif", fontSize:'1.1rem',
                color:'#f1f5f9', mb:2
              }}>
                Admission Status
              </Typography>
              {status.admissions === 'loading' ? (
                Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} variant="rectangular" height={36}
                    sx={{ bgcolor:'rgba(255,255,255,0.04)', borderRadius:1, mb:1 }}/>
                ))
              ) : status.admissions === 'error' ? (
                <ServiceError label="Admission Service" small />
              ) : (
                <Box sx={{ display:'flex', flexDirection:'column', gap:1.5 }}>
                  {[
                    { label:'Confirmed',  value: admissions.filter(a=>a.status==='CONFIRMED').length, color:'#34d399' },
                    { label:'Allocated',  value: admissions.filter(a=>a.status==='ALLOCATED').length, color:'#38bdf8' },
                    { label:'Cancelled',  value: admissions.filter(a=>a.status==='CANCELLED').length, color:'#f87171' },
                  ].map(item => (
                    <Box key={item.label} sx={{
                      display:'flex', justifyContent:'space-between', alignItems:'center',
                      p:1.2, borderRadius:2,
                      background:`${item.color}08`,
                      border:`1px solid ${item.color}20`
                    }}>
                      <Typography sx={{ color:'rgba(255,255,255,0.7)', fontSize:13 }}>{item.label}</Typography>
                      <Typography sx={{ color:item.color, fontWeight:700, fontSize:18, fontFamily:'monospace' }}>
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Card>

          </Box>
        </Grid>
      </Grid>

      {/* CSS for spin animation */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </Box>
  )
}

// ── Helper components ──────────────────────────────────────────────────────────
function ServiceError({ label, small }) {
  return (
    <Box sx={{
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      py: small ? 3 : 5, gap:1,
      background:'rgba(248,113,113,0.04)',
      border:'1px dashed rgba(248,113,113,0.25)',
      borderRadius:2
    }}>
      <ErrorOutlineRounded sx={{ color:'#f87171', fontSize: small ? 24 : 32 }}/>
      <Typography sx={{ color:'#f87171', fontSize: small ? 11 : 12, fontWeight:600, textAlign:'center' }}>
        {label} unavailable
      </Typography>
      <Typography sx={{ color:'#64748b', fontSize:11, textAlign:'center', px:2 }}>
        Start the service and refresh
      </Typography>
    </Box>
  )
}

function EmptyState({ label }) {
  return (
    <Box sx={{
      height:160, display:'flex', alignItems:'center', justifyContent:'center',
      flexDirection:'column', gap:1
    }}>
      <EventSeatRounded sx={{ color:'#334155', fontSize:36 }}/>
      <Typography sx={{ color:'#475569', fontSize:'0.85rem' }}>{label}</Typography>
    </Box>
  )
}
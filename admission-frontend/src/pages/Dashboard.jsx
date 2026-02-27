import React, { useEffect, useState } from 'react'
import {
  Box, Grid, Card, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Alert,
  LinearProgress, Avatar, Divider
} from '@mui/material'
import {
  PeopleRounded, AssignmentTurnedInRounded, PaymentsRounded,
  EventSeatRounded, TrendingUpRounded, CheckCircleRounded,
  WarningRounded
} from '@mui/icons-material'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts'
import { dashboardApi } from '../api'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import StatusChip from '../components/StatusChip'

const QUOTA_COLORS = { KCET: '#38bdf8', COMEDK: '#a78bfa', MANAGEMENT: '#fb923c' }

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    dashboardApi.getOverview()
      .then(r => setData(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 2 }}>
      <CircularProgress sx={{ color: '#38bdf8' }} size={48} />
      <Typography sx={{ color: '#64748b' }}>Loading dashboard...</Typography>
    </Box>
  )

  if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}. Make sure all backend services are running.</Alert>

  const programs = data?.programs || []

  // Build chart data from programs
  const barData = programs.map((p, i) => ({
    name: `Program ${p.programId}`,
    intake: p.totalIntake || 0,
    admitted: p.totalAdmitted || 0,
    available: p.totalAvailable || 0,
  }))

  // Pie chart from quotas of first program
  const firstQuotas = programs[0]?.quotas || []
  const pieData = firstQuotas.map(q => ({
    name: q.quotaType,
    value: q.admittedSeats || 0,
    total: q.totalSeats,
  }))

  const admitRate = data?.totalIntake > 0
    ? Math.round((data.totalAdmitted / data.totalIntake) * 100)
    : 0

  return (
    <Box sx={{ animation: 'fadeInUp 0.4s ease' }}>
      <PageHeader
        title="Dashboard Overview"
        subtitle="Real-time admission statistics and insights"
        breadcrumbs={['Home', 'Dashboard']}
      />

      {/* Hero Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            title: 'Total Intake', value: data?.totalIntake ?? 0,
            subtitle: 'Seats configured across all programs',
            icon: <EventSeatRounded />, color: '#38bdf8',
          },
          {
            title: 'Admitted', value: data?.totalAdmitted ?? 0,
            subtitle: `${admitRate}% of total intake filled`,
            icon: <AssignmentTurnedInRounded />, color: '#34d399',
            progress: admitRate,
          },
          {
            title: 'Available Seats', value: data?.totalAvailable ?? 0,
            subtitle: 'Remaining across all quotas',
            icon: <TrendingUpRounded />, color: '#a78bfa',
          },
          {
            title: 'Total Applicants', value: data?.totalApplicants ?? 0,
            subtitle: `${data?.applicantsWithPendingDocs ?? 0} with pending documents`,
            icon: <PeopleRounded />, color: '#fbbf24',
          },
          {
            title: 'Confirmed', value: data?.confirmedAdmissions ?? 0,
            subtitle: `${data?.pendingConfirmation ?? 0} pending confirmation`,
            icon: <CheckCircleRounded />, color: '#34d399',
          },
          {
            title: 'Fee Pending', value: data?.feePendingCount ?? 0,
            subtitle: 'Awaiting payment',
            icon: <PaymentsRounded />, color: '#f87171',
          },
        ].map((stat, i) => (
          <Grid item xs={12} sm={6} md={4} key={i} sx={{ animationDelay: `${i * 0.05}s` }}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 3 }}>
            <Typography sx={{
              fontFamily: "'DM Serif Display', serif", fontSize: '1.25rem',
              color: '#f1f5f9', mb: 0.5,
            }}>
              Intake vs Admitted by Program
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.8rem', mb: 3 }}>
              Comparison of configured seats and actual admissions
            </Typography>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} barGap={4}>
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'Outfit' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'Outfit' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontFamily: 'Outfit' }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                  <Bar dataKey="intake" fill="#38bdf840" radius={[6, 6, 0, 0]} name="Total Intake" />
                  <Bar dataKey="admitted" fill="#38bdf8" radius={[6, 6, 0, 0]} name="Admitted" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: '#475569', fontSize: '0.9rem' }}>No program data yet</Typography>
              </Box>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography sx={{
              fontFamily: "'DM Serif Display', serif", fontSize: '1.25rem',
              color: '#f1f5f9', mb: 0.5,
            }}>
              Quota Distribution
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.8rem', mb: 2 }}>
              Admitted students by quota type
            </Typography>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={45} paddingAngle={3}>
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={QUOTA_COLORS[entry.name] || '#64748b'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontFamily: 'Outfit' }}
                  />
                  <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontFamily: 'Outfit', fontSize: 13 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: '#475569', fontSize: '0.9rem' }}>No quota data yet</Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Quota Table */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Typography sx={{
              fontFamily: "'DM Serif Display', serif", fontSize: '1.25rem',
              color: '#f1f5f9', mb: 0.5,
            }}>
              Program Seat Matrix
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.8rem', mb: 3 }}>
              Live quota-wise seat counters
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Program ID</TableCell>
                    <TableCell>Quota</TableCell>
                    <TableCell align="center">Total</TableCell>
                    <TableCell align="center">Admitted</TableCell>
                    <TableCell align="center">Available</TableCell>
                    <TableCell>Fill Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {programs.flatMap(p =>
                    (p.quotas || []).map((q, qi) => (
                      <TableRow key={`${p.programId}-${qi}`}>
                        <TableCell sx={{ color: '#94a3b8' }}>{qi === 0 ? `P-${p.programId}` : ''}</TableCell>
                        <TableCell><StatusChip status={q.quotaType} /></TableCell>
                        <TableCell align="center" sx={{ fontFamily: "'JetBrains Mono',monospace", color: '#f1f5f9' }}>{q.totalSeats}</TableCell>
                        <TableCell align="center" sx={{ fontFamily: "'JetBrains Mono',monospace", color: '#38bdf8' }}>{q.admittedSeats}</TableCell>
                        <TableCell align="center" sx={{ fontFamily: "'JetBrains Mono',monospace", color: q.availableSeats === 0 ? '#f87171' : '#34d399' }}>{q.availableSeats}</TableCell>
                        <TableCell sx={{ minWidth: 120 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={q.totalSeats > 0 ? Math.round((q.admittedSeats / q.totalSeats) * 100) : 0}
                              sx={{
                                flex: 1, height: 6, borderRadius: 3,
                                '& .MuiLinearProgress-bar': {
                                  background: QUOTA_COLORS[q.quotaType] || '#38bdf8',
                                },
                              }}
                            />
                            <Typography sx={{ fontSize: '0.72rem', color: '#64748b', minWidth: 30 }}>
                              {q.totalSeats > 0 ? Math.round((q.admittedSeats / q.totalSeats) * 100) : 0}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {programs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#475569' }}>
                        No seat matrix configured yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography sx={{
              fontFamily: "'DM Serif Display', serif", fontSize: '1.25rem',
              color: '#f1f5f9', mb: 0.5,
            }}>
              Pending Fees
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.8rem', mb: 3 }}>
              Applicants awaiting payment
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {(data?.feePendingList || []).slice(0, 6).map((fee, i) => (
                <Box key={i} sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5,
                  background: 'rgba(255,255,255,0.03)', borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <Avatar sx={{ width: 32, height: 32, background: 'rgba(251,191,36,0.2)', color: '#fbbf24', fontSize: '0.75rem' }}>
                    {fee.applicantId}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.82rem', color: '#f1f5f9', fontWeight: 500 }}>
                      Applicant #{fee.applicantId}
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                      ₹{fee.amount?.toLocaleString() || 'N/A'}
                    </Typography>
                  </Box>
                  <StatusChip status="PENDING" />
                </Box>
              ))}
              {(!data?.feePendingList || data.feePendingList.length === 0) && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircleRounded sx={{ color: '#34d399', fontSize: 36, mb: 1 }} />
                  <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>All fees cleared!</Typography>
                </Box>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
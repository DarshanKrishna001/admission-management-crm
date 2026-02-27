import React from 'react'
import { Box, Typography, Breadcrumbs, Link } from '@mui/material'
import { NavigateNextRounded } from '@mui/icons-material'

export default function PageHeader({ title, subtitle, breadcrumbs = [], action }) {
  return (
    <Box sx={{ mb: 4, animation: 'fadeInUp 0.4s ease' }}>
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextRounded sx={{ fontSize: 14, color: '#475569' }} />}
          sx={{ mb: 1 }}
        >
          {breadcrumbs.map((b, i) => (
            <Typography key={i} sx={{
              fontSize: '0.75rem', color: '#475569',
              fontWeight: 500, letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              {b}
            </Typography>
          ))}
        </Breadcrumbs>
      )}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" sx={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: { xs: '1.6rem', md: '2rem' },
            fontWeight: 400,
            background: 'linear-gradient(135deg, #f1f5f9 30%, #38bdf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.2,
            mb: 0.5,
          }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && <Box>{action}</Box>}
      </Box>
    </Box>
  )
}
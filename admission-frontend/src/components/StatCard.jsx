import React from 'react'
import { Box, Card, Typography, LinearProgress } from '@mui/material'

export default function StatCard({ title, value, subtitle, icon, color = '#38bdf8', progress, trend }) {
  return (
    <Card sx={{
      p: 3, height: '100%',
      background: 'linear-gradient(135deg, #111827 0%, #0f172a 100%)',
      border: '1px solid rgba(255,255,255,0.07)',
      position: 'relative', overflow: 'hidden',
      animation: 'fadeInUp 0.5s ease',
      '&::before': {
        content: '""', position: 'absolute',
        top: 0, left: 0, right: 0, height: '3px',
        background: `linear-gradient(90deg, ${color}, transparent)`,
      },
    }}>
      {/* Background glow */}
      <Box sx={{
        position: 'absolute', top: -20, right: -20,
        width: 100, height: 100, borderRadius: '50%',
        background: color, opacity: 0.05, filter: 'blur(30px)',
        pointerEvents: 'none',
      }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography sx={{
          fontSize: '0.72rem', fontWeight: 700, color: '#64748b',
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          {title}
        </Typography>
        {icon && (
          <Box sx={{
            width: 42, height: 42, borderRadius: '10px', flexShrink: 0,
            background: `${color}18`,
            border: `1px solid ${color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: color, '& svg': { fontSize: 22 },
          }}>
            {icon}
          </Box>
        )}
      </Box>

      <Typography sx={{
        fontSize: '2.2rem', fontWeight: 800, color: '#f1f5f9',
        fontFamily: "'JetBrains Mono', monospace",
        lineHeight: 1, mb: 0.5,
      }}>
        {value ?? '—'}
      </Typography>

      {subtitle && (
        <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}

      {progress !== undefined && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(progress, 100)}
            sx={{
              '& .MuiLinearProgress-bar': {
                background: `linear-gradient(90deg, ${color}, ${color}aa)`,
                borderRadius: 4,
              },
            }}
          />
          <Typography sx={{ fontSize: '0.72rem', color: '#64748b', mt: 0.5, textAlign: 'right' }}>
            {Math.round(progress)}% filled
          </Typography>
        </Box>
      )}
    </Card>
  )
}
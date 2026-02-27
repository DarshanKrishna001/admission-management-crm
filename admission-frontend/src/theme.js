import { createTheme, alpha } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#38bdf8',
      light: '#7dd3fc',
      dark: '#0369a1',
      contrastText: '#0a0f1e',
    },
    secondary: {
      main: '#a78bfa',
      light: '#c4b5fd',
      dark: '#7c3aed',
    },
    success: {
      main: '#34d399',
      light: '#6ee7b7',
      dark: '#059669',
    },
    warning: {
      main: '#fbbf24',
      light: '#fcd34d',
      dark: '#d97706',
    },
    error: {
      main: '#f87171',
      light: '#fca5a5',
      dark: '#dc2626',
    },
    info: {
      main: '#60a5fa',
    },
    background: {
      default: '#0a0f1e',
      paper: '#111827',
    },
    divider: 'rgba(255,255,255,0.07)',
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
      disabled: '#475569',
    },
  },
  typography: {
    fontFamily: "'Outfit', sans-serif",
    h1: { fontFamily: "'DM Serif Display', serif", fontWeight: 400 },
    h2: { fontFamily: "'DM Serif Display', serif", fontWeight: 400 },
    h3: { fontFamily: "'DM Serif Display', serif", fontWeight: 400 },
    h4: { fontFamily: "'Outfit', sans-serif", fontWeight: 700 },
    h5: { fontFamily: "'Outfit', sans-serif", fontWeight: 700 },
    h6: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
    button: {
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    overline: {
      fontFamily: "'Outfit', sans-serif",
      letterSpacing: '0.12em',
      fontWeight: 600,
    },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.4)',
    '0 4px 6px rgba(0,0,0,0.4)',
    '0 10px 15px rgba(0,0,0,0.4)',
    '0 20px 25px rgba(0,0,0,0.5)',
    '0 25px 50px rgba(0,0,0,0.6)',
    ...Array(19).fill('0 25px 50px rgba(0,0,0,0.6)'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { background: '#0a0f1e' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #111827 0%, #0f172a 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.9rem',
          padding: '8px 20px',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
          boxShadow: '0 4px 15px rgba(56,189,248,0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
            boxShadow: '0 6px 20px rgba(56,189,248,0.4)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #a78bfa, #ec4899)',
          boxShadow: '0 4px 15px rgba(167,139,250,0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #8b5cf6, #db2777)',
          },
        },
        outlined: {
          borderColor: 'rgba(255,255,255,0.15)',
          '&:hover': {
            borderColor: '#38bdf8',
            background: 'rgba(56,189,248,0.08)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '10px',
            transition: 'all 0.2s ease',
            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
            '&:hover fieldset': { borderColor: 'rgba(56,189,248,0.4)' },
            '&.Mui-focused fieldset': {
              borderColor: '#38bdf8',
              borderWidth: '1.5px',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '10px',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          background: 'transparent',
          '& .MuiTable-root': { borderCollapse: 'separate', borderSpacing: '0 4px' },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover td': { background: 'rgba(56,189,248,0.05)' },
          '& td:first-of-type': { borderRadius: '10px 0 0 10px' },
          '& td:last-of-type': { borderRadius: '0 10px 10px 0' },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          padding: '14px 16px',
          color: '#cbd5e1',
          background: 'rgba(255,255,255,0.02)',
        },
        head: {
          background: 'rgba(56,189,248,0.05)',
          color: '#38bdf8',
          fontWeight: 600,
          fontSize: '0.7rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          borderBottom: '1px solid rgba(56,189,248,0.2)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: '6px', fontWeight: 500, fontSize: '0.75rem' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(135deg, #111827 0%, #0f172a 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: '10px' },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: '4px', height: '6px', background: 'rgba(255,255,255,0.1)' },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: '#1e293b',
          border: '1px solid rgba(255,255,255,0.1)',
          fontSize: '0.8rem',
        },
      },
    },
  },
})
import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Collapse, IconButton, Tooltip, Divider, Avatar, Chip
} from '@mui/material'
import {
  DashboardRounded, SchoolRounded, LocationCityRounded,
  AccountBalanceRounded, BusinessRounded, MenuBookRounded,
  CalendarMonthRounded, TableChartRounded, PeopleRounded,
  AssignmentTurnedInRounded, PaymentsRounded, ExpandLess,
  ExpandMore, MenuRounded, ChevronLeftRounded, AdminPanelSettingsRounded,
  AutoAwesomeRounded
} from '@mui/icons-material'

const DRAWER_WIDTH = 260

const navItems = [
  {
    label: 'Dashboard',
    icon: <DashboardRounded />,
    path: '/dashboard',
  },
  {
    label: 'Master Setup',
    icon: <AdminPanelSettingsRounded />,
    children: [
      { label: 'Academic Years', icon: <CalendarMonthRounded />, path: '/master/academic-years' },
      { label: 'Institutions', icon: <AccountBalanceRounded />, path: '/master/institutions' },
      { label: 'Campuses', icon: <LocationCityRounded />, path: '/master/campuses' },
      { label: 'Departments', icon: <BusinessRounded />, path: '/master/departments' },
      { label: 'Programs', icon: <MenuBookRounded />, path: '/master/programs' },
    ],
  },
  {
    label: 'Seat Matrix',
    icon: <TableChartRounded />,
    path: '/seat-matrix',
  },
  {
    label: 'Applicants',
    icon: <PeopleRounded />,
    path: '/applicants',
  },
  {
    label: 'Admissions',
    icon: <AssignmentTurnedInRounded />,
    path: '/admissions',
  },
  {
    label: 'Fee Management',
    icon: <PaymentsRounded />,
    path: '/fees',
  },
]

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [masterOpen, setMasterOpen] = useState(true)

  const isActive = (path) => location.pathname === path
  const isChildActive = (children) => children?.some(c => location.pathname === c.path)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0a0f1e' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: collapsed ? 72 : DRAWER_WIDTH,
          flexShrink: 0,
          transition: 'width 0.3s ease',
          '& .MuiDrawer-paper': {
            width: collapsed ? 72 : DRAWER_WIDTH,
            overflowX: 'hidden',
            background: 'linear-gradient(180deg, #0d1428 0%, #0a0f1e 100%)',
            borderRight: '1px solid rgba(56,189,248,0.1)',
            transition: 'width 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Logo */}
        <Box sx={{
          p: collapsed ? 1.5 : 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          minHeight: 72,
        }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(56,189,248,0.35)',
          }}>
            <SchoolRounded sx={{ color: '#0a0f1e', fontSize: 22 }} />
          </Box>
          {!collapsed && (
            <Box>
              <Typography sx={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: '1.1rem', color: '#f1f5f9', lineHeight: 1.2,
              }}>
                AdmissionPro
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', color: '#38bdf8', letterSpacing: '0.1em', fontWeight: 600 }}>
                MANAGEMENT SYSTEM
              </Typography>
            </Box>
          )}
        </Box>

        {/* Nav */}
        <List sx={{ flex: 1, px: collapsed ? 0.5 : 1.5, py: 2, overflow: 'auto' }}>
          {navItems.map((item) => {
            if (item.children) {
              const childActive = isChildActive(item.children)
              return (
                <React.Fragment key={item.label}>
                  <Tooltip title={collapsed ? item.label : ''} placement="right">
                    <ListItemButton
                      onClick={() => !collapsed && setMasterOpen(p => !p)}
                      sx={{
                        borderRadius: '10px', mb: 0.5, px: collapsed ? 1.5 : 1.5,
                        py: 1.2,
                        background: childActive ? 'rgba(56,189,248,0.08)' : 'transparent',
                        '&:hover': { background: 'rgba(56,189,248,0.1)' },
                      }}
                    >
                      <ListItemIcon sx={{
                        minWidth: collapsed ? 0 : 36,
                        color: childActive ? '#38bdf8' : '#64748b',
                      }}>
                        {item.icon}
                      </ListItemIcon>
                      {!collapsed && (
                        <>
                          <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{
                              fontSize: '0.88rem', fontWeight: childActive ? 600 : 400,
                              color: childActive ? '#f1f5f9' : '#94a3b8',
                            }}
                          />
                          {masterOpen ? <ExpandLess sx={{ color: '#64748b', fontSize: 18 }} /> : <ExpandMore sx={{ color: '#64748b', fontSize: 18 }} />}
                        </>
                      )}
                    </ListItemButton>
                  </Tooltip>
                  {!collapsed && (
                    <Collapse in={masterOpen} timeout="auto">
                      <List disablePadding sx={{ pl: 1 }}>
                        {item.children.map(child => (
                          <Tooltip key={child.path} title="" placement="right">
                            <ListItemButton
                              onClick={() => navigate(child.path)}
                              sx={{
                                borderRadius: '8px', mb: 0.3, px: 1.5, py: 0.9,
                                background: isActive(child.path) ? 'rgba(56,189,248,0.12)' : 'transparent',
                                borderLeft: isActive(child.path) ? '2px solid #38bdf8' : '2px solid transparent',
                                '&:hover': { background: 'rgba(56,189,248,0.08)' },
                              }}
                            >
                              <ListItemIcon sx={{
                                minWidth: 32,
                                color: isActive(child.path) ? '#38bdf8' : '#64748b',
                                '& svg': { fontSize: 18 },
                              }}>
                                {child.icon}
                              </ListItemIcon>
                              <ListItemText
                                primary={child.label}
                                primaryTypographyProps={{
                                  fontSize: '0.83rem',
                                  fontWeight: isActive(child.path) ? 600 : 400,
                                  color: isActive(child.path) ? '#38bdf8' : '#94a3b8',
                                }}
                              />
                            </ListItemButton>
                          </Tooltip>
                        ))}
                      </List>
                    </Collapse>
                  )}
                </React.Fragment>
              )
            }

            return (
              <Tooltip key={item.path} title={collapsed ? item.label : ''} placement="right">
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: '10px', mb: 0.5, px: collapsed ? 1.5 : 1.5, py: 1.2,
                    background: isActive(item.path)
                      ? 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(129,140,248,0.1))'
                      : 'transparent',
                    border: isActive(item.path) ? '1px solid rgba(56,189,248,0.25)' : '1px solid transparent',
                    '&:hover': { background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)' },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon sx={{
                    minWidth: collapsed ? 0 : 36,
                    color: isActive(item.path) ? '#38bdf8' : '#64748b',
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.88rem',
                        fontWeight: isActive(item.path) ? 600 : 400,
                        color: isActive(item.path) ? '#f1f5f9' : '#94a3b8',
                      }}
                    />
                  )}
                  {!collapsed && isActive(item.path) && (
                    <Box sx={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: '#38bdf8',
                      boxShadow: '0 0 8px #38bdf8',
                    }} />
                  )}
                </ListItemButton>
              </Tooltip>
            )
          })}
        </List>

        {/* Bottom user section */}
        <Box sx={{
          p: collapsed ? 1 : 2,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: 1.5,
        }}>
          <Avatar sx={{
            width: 36, height: 36, flexShrink: 0,
            background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
            fontSize: '0.8rem', fontWeight: 700,
          }}>
            AD
          </Avatar>
          {!collapsed && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.83rem', fontWeight: 600, color: '#f1f5f9' }}>Admin User</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                admin@abc.edu
              </Typography>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Main content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <Box sx={{
          height: 64, display: 'flex', alignItems: 'center',
          px: 3, gap: 2,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(10,15,30,0.8)',
          backdropFilter: 'blur(20px)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <IconButton
            onClick={() => setCollapsed(p => !p)}
            sx={{ color: '#64748b', '&:hover': { color: '#38bdf8', background: 'rgba(56,189,248,0.08)' } }}
          >
            {collapsed ? <MenuRounded /> : <ChevronLeftRounded />}
          </IconButton>

          <Box sx={{ flex: 1 }} />

          <Chip
            icon={<AutoAwesomeRounded sx={{ fontSize: '14px !important' }} />}
            label="v1.0.0"
            size="small"
            sx={{
              background: 'rgba(56,189,248,0.1)',
              border: '1px solid rgba(56,189,248,0.2)',
              color: '#38bdf8',
              fontWeight: 600,
              fontSize: '0.72rem',
            }}
          />
        </Box>

        {/* Page content */}
        <Box sx={{
          flex: 1, overflow: 'auto',
          background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1428 50%, #0a0f1e 100%)',
          p: { xs: 2, md: 3 },
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
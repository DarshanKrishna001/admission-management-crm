import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, IconButton, Collapse, Avatar,
  Chip, Divider, Tooltip, Menu, MenuItem
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import SchoolIcon from '@mui/icons-material/School'
import PeopleIcon from '@mui/icons-material/People'
import EventSeatIcon from '@mui/icons-material/EventSeat'
import PaymentIcon from '@mui/icons-material/Payment'
import SettingsIcon from '@mui/icons-material/Settings'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import BusinessIcon from '@mui/icons-material/Business'
import LocationCityIcon from '@mui/icons-material/LocationCity'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import MenuIcon from '@mui/icons-material/Menu'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import LogoutIcon from '@mui/icons-material/Logout'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { useAuth } from '../context/AuthContext'

const DRAWER_WIDTH = 260

const ROLE_COLORS = {
  ADMIN: { bg: '#38bdf8', label: 'Admin' },
  ADMISSION_OFFICER: { bg: '#a78bfa', label: 'Officer' },
  MANAGEMENT: { bg: '#34d399', label: 'Management' },
}

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [masterOpen, setMasterOpen] = useState(true)
  const [anchorEl, setAnchorEl] = useState(null)

  const roleInfo = ROLE_COLORS[user?.role] || { bg: '#38bdf8', label: user?.role }

  const navItems = [
    { label: 'Dashboard',     icon: <DashboardIcon />, path: '/dashboard',  roles: ['ADMIN','ADMISSION_OFFICER','MANAGEMENT'] },
    {
      label: 'Master Setup', icon: <SettingsIcon />,  roles: ['ADMIN'],
      children: [
        { label: 'Academic Years', icon: <CalendarTodayIcon />, path: '/master/academic-years' },
        { label: 'Institutions',   icon: <BusinessIcon />,      path: '/master/institutions' },
        { label: 'Campuses',       icon: <LocationCityIcon />,  path: '/master/campuses' },
        { label: 'Departments',    icon: <AccountTreeIcon />,   path: '/master/departments' },
        { label: 'Programs',       icon: <MenuBookIcon />,      path: '/master/programs' },
      ]
    },
    { label: 'Seat Matrix',    icon: <EventSeatIcon />, path: '/seat-matrix', roles: ['ADMIN'] },
    { label: 'Applicants',     icon: <PeopleIcon />,    path: '/applicants',  roles: ['ADMIN','ADMISSION_OFFICER'] },
    { label: 'Admissions',     icon: <SchoolIcon />,    path: '/admissions',  roles: ['ADMIN','ADMISSION_OFFICER'] },
    { label: 'Fee Management', icon: <PaymentIcon />,   path: '/fees',        roles: ['ADMIN','ADMISSION_OFFICER'] },
  ]

  const visibleItems = navItems.filter(item => !item.roles || item.roles.includes(user?.role))
  const isActive = (path) => location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path))

  const NavItem = ({ item, indent = false }) => {
    if (item.children) {
      return (
        <>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setMasterOpen(o => !o)}
              sx={{ borderRadius: 2, mx: 1, mb: 0.5, '&:hover': { background: 'rgba(56,189,248,0.08)' } }}>
              <ListItemIcon sx={{ color: 'rgba(255,255,255,0.5)', minWidth: 36 }}>{item.icon}</ListItemIcon>
              {!collapsed && (<>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }} />
                {masterOpen ? <ExpandLessIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.4)' }} />
                            : <ExpandMoreIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.4)' }} />}
              </>)}
            </ListItemButton>
          </ListItem>
          {!collapsed && (
            <Collapse in={masterOpen} timeout="auto" unmountOnExit>
              <List disablePadding>
                {item.children.map(child => <NavItem key={child.path} item={child} indent />)}
              </List>
            </Collapse>
          )}
        </>
      )
    }
    const active = isActive(item.path)
    return (
      <Tooltip title={collapsed ? item.label : ''} placement="right">
        <ListItem disablePadding sx={{ pl: indent ? 2 : 0 }}>
          <ListItemButton onClick={() => navigate(item.path)} sx={{
            borderRadius: 2, mx: 1, mb: 0.5,
            background: active ? 'linear-gradient(135deg,rgba(56,189,248,0.15),rgba(56,189,248,0.05))' : 'transparent',
            borderLeft: active ? '3px solid #38bdf8' : '3px solid transparent',
            '&:hover': { background: active ? undefined : 'rgba(56,189,248,0.06)' }
          }}>
            <ListItemIcon sx={{ color: active ? '#38bdf8' : 'rgba(255,255,255,0.4)', minWidth: 36 }}>{item.icon}</ListItemIcon>
            {!collapsed && (
              <ListItemText primary={item.label} primaryTypographyProps={{
                fontSize: 13, fontWeight: active ? 600 : 400,
                color: active ? '#38bdf8' : 'rgba(255,255,255,0.65)'
              }} />
            )}
          </ListItemButton>
        </ListItem>
      </Tooltip>
    )
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0a0f1e' }}>
      <Drawer variant="permanent" sx={{
        width: collapsed ? 72 : DRAWER_WIDTH, flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: collapsed ? 72 : DRAWER_WIDTH,
          background: 'linear-gradient(180deg,#0d1b2a 0%,#111827 100%)',
          border: 'none', borderRight: '1px solid rgba(255,255,255,0.05)',
          transition: 'width 0.25s ease', overflowX: 'hidden',
        }
      }}>
        {/* Logo */}
        <Box sx={{
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          p: collapsed ? '16px 0' : '16px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
          {!collapsed && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 34, height: 34, borderRadius: '10px', background: 'linear-gradient(135deg,#38bdf8,#0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SchoolIcon sx={{ fontSize: 20, color: 'white' }} />
              </Box>
              <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 15 }}>AdmissionPro</Typography>
            </Box>
          )}
          <IconButton onClick={() => setCollapsed(c => !c)} sx={{ color: 'rgba(255,255,255,0.4)' }}>
            {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>

        {/* Role badge */}
        {!collapsed && (
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Chip size="small" label={roleInfo.label}
              icon={<AdminPanelSettingsIcon style={{ fontSize: 14 }} />}
              sx={{ background: `${roleInfo.bg}18`, border: `1px solid ${roleInfo.bg}40`, color: roleInfo.bg, fontWeight: 700, fontSize: 11, '& .MuiChip-icon': { color: roleInfo.bg } }} />
          </Box>
        )}

        <List sx={{ flex: 1, pt: 1 }}>
          {visibleItems.map(item => <NavItem key={item.label} item={item} />)}
        </List>

        {/* User section */}
        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', p: collapsed ? 1 : 2 }}>
          <Box onClick={e => setAnchorEl(e.currentTarget)} sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer',
            borderRadius: 2, p: collapsed ? 1 : 1.5,
            justifyContent: collapsed ? 'center' : 'flex-start',
            '&:hover': { background: 'rgba(255,255,255,0.05)' }
          }}>
            <Avatar sx={{ width: 34, height: 34, fontSize: 13, fontWeight: 700, background: `linear-gradient(135deg,${roleInfo.bg},${roleInfo.bg}99)` }}>
              {user?.fullName?.charAt(0) || '?'}
            </Avatar>
            {!collapsed && (
              <Box sx={{ overflow: 'hidden' }}>
                <Typography sx={{ color: 'white', fontSize: 13, fontWeight: 600, lineHeight: 1.2 }} noWrap>{user?.fullName}</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }} noWrap>{user?.username}</Typography>
              </Box>
            )}
          </Box>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
            PaperProps={{ sx: { background: '#1a2f4a', border: '1px solid rgba(255,255,255,0.1)', minWidth: 160 } }}>
            <MenuItem onClick={() => { logout(); setAnchorEl(null) }} sx={{ color: '#f87171', gap: 1 }}>
              <LogoutIcon fontSize="small" /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  )
}






// import React, { useState } from 'react'
// import { Outlet, useNavigate, useLocation } from 'react-router-dom'
// import {
//   Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
//   Typography, Collapse, IconButton, Tooltip, Divider, Avatar, Chip
// } from '@mui/material'
// import {
//   DashboardRounded, SchoolRounded, LocationCityRounded,
//   AccountBalanceRounded, BusinessRounded, MenuBookRounded,
//   CalendarMonthRounded, TableChartRounded, PeopleRounded,
//   AssignmentTurnedInRounded, PaymentsRounded, ExpandLess,
//   ExpandMore, MenuRounded, ChevronLeftRounded, AdminPanelSettingsRounded,
//   AutoAwesomeRounded
// } from '@mui/icons-material'

// const DRAWER_WIDTH = 260

// const navItems = [
//   {
//     label: 'Dashboard',
//     icon: <DashboardRounded />,
//     path: '/dashboard',
//   },
//   {
//     label: 'Master Setup',
//     icon: <AdminPanelSettingsRounded />,
//     children: [
//       { label: 'Academic Years', icon: <CalendarMonthRounded />, path: '/master/academic-years' },
//       { label: 'Institutions', icon: <AccountBalanceRounded />, path: '/master/institutions' },
//       { label: 'Campuses', icon: <LocationCityRounded />, path: '/master/campuses' },
//       { label: 'Departments', icon: <BusinessRounded />, path: '/master/departments' },
//       { label: 'Programs', icon: <MenuBookRounded />, path: '/master/programs' },
//     ],
//   },
//   {
//     label: 'Seat Matrix',
//     icon: <TableChartRounded />,
//     path: '/seat-matrix',
//   },
//   {
//     label: 'Applicants',
//     icon: <PeopleRounded />,
//     path: '/applicants',
//   },
//   {
//     label: 'Admissions',
//     icon: <AssignmentTurnedInRounded />,
//     path: '/admissions',
//   },
//   {
//     label: 'Fee Management',
//     icon: <PaymentsRounded />,
//     path: '/fees',
//   },
// ]

// export default function Layout() {
//   const navigate = useNavigate()
//   const location = useLocation()
//   const [collapsed, setCollapsed] = useState(false)
//   const [masterOpen, setMasterOpen] = useState(true)

//   const isActive = (path) => location.pathname === path
//   const isChildActive = (children) => children?.some(c => location.pathname === c.path)

//   return (
//     <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0a0f1e' }}>
//       {/* Sidebar */}
//       <Drawer
//         variant="permanent"
//         sx={{
//           width: collapsed ? 72 : DRAWER_WIDTH,
//           flexShrink: 0,
//           transition: 'width 0.3s ease',
//           '& .MuiDrawer-paper': {
//             width: collapsed ? 72 : DRAWER_WIDTH,
//             overflowX: 'hidden',
//             background: 'linear-gradient(180deg, #0d1428 0%, #0a0f1e 100%)',
//             borderRight: '1px solid rgba(56,189,248,0.1)',
//             transition: 'width 0.3s ease',
//             display: 'flex',
//             flexDirection: 'column',
//           },
//         }}
//       >
//         {/* Logo */}
//         <Box sx={{
//           p: collapsed ? 1.5 : 2.5,
//           display: 'flex',
//           alignItems: 'center',
//           gap: 1.5,
//           borderBottom: '1px solid rgba(255,255,255,0.06)',
//           minHeight: 72,
//         }}>
//           <Box sx={{
//             width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
//             background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             boxShadow: '0 4px 15px rgba(56,189,248,0.35)',
//           }}>
//             <SchoolRounded sx={{ color: '#0a0f1e', fontSize: 22 }} />
//           </Box>
//           {!collapsed && (
//             <Box>
//               <Typography sx={{
//                 fontFamily: "'DM Serif Display', serif",
//                 fontSize: '1.1rem', color: '#f1f5f9', lineHeight: 1.2,
//               }}>
//                 AdmissionPro
//               </Typography>
//               <Typography sx={{ fontSize: '0.65rem', color: '#38bdf8', letterSpacing: '0.1em', fontWeight: 600 }}>
//                 MANAGEMENT SYSTEM
//               </Typography>
//             </Box>
//           )}
//         </Box>

//         {/* Nav */}
//         <List sx={{ flex: 1, px: collapsed ? 0.5 : 1.5, py: 2, overflow: 'auto' }}>
//           {navItems.map((item) => {
//             if (item.children) {
//               const childActive = isChildActive(item.children)
//               return (
//                 <React.Fragment key={item.label}>
//                   <Tooltip title={collapsed ? item.label : ''} placement="right">
//                     <ListItemButton
//                       onClick={() => !collapsed && setMasterOpen(p => !p)}
//                       sx={{
//                         borderRadius: '10px', mb: 0.5, px: collapsed ? 1.5 : 1.5,
//                         py: 1.2,
//                         background: childActive ? 'rgba(56,189,248,0.08)' : 'transparent',
//                         '&:hover': { background: 'rgba(56,189,248,0.1)' },
//                       }}
//                     >
//                       <ListItemIcon sx={{
//                         minWidth: collapsed ? 0 : 36,
//                         color: childActive ? '#38bdf8' : '#64748b',
//                       }}>
//                         {item.icon}
//                       </ListItemIcon>
//                       {!collapsed && (
//                         <>
//                           <ListItemText
//                             primary={item.label}
//                             primaryTypographyProps={{
//                               fontSize: '0.88rem', fontWeight: childActive ? 600 : 400,
//                               color: childActive ? '#f1f5f9' : '#94a3b8',
//                             }}
//                           />
//                           {masterOpen ? <ExpandLess sx={{ color: '#64748b', fontSize: 18 }} /> : <ExpandMore sx={{ color: '#64748b', fontSize: 18 }} />}
//                         </>
//                       )}
//                     </ListItemButton>
//                   </Tooltip>
//                   {!collapsed && (
//                     <Collapse in={masterOpen} timeout="auto">
//                       <List disablePadding sx={{ pl: 1 }}>
//                         {item.children.map(child => (
//                           <Tooltip key={child.path} title="" placement="right">
//                             <ListItemButton
//                               onClick={() => navigate(child.path)}
//                               sx={{
//                                 borderRadius: '8px', mb: 0.3, px: 1.5, py: 0.9,
//                                 background: isActive(child.path) ? 'rgba(56,189,248,0.12)' : 'transparent',
//                                 borderLeft: isActive(child.path) ? '2px solid #38bdf8' : '2px solid transparent',
//                                 '&:hover': { background: 'rgba(56,189,248,0.08)' },
//                               }}
//                             >
//                               <ListItemIcon sx={{
//                                 minWidth: 32,
//                                 color: isActive(child.path) ? '#38bdf8' : '#64748b',
//                                 '& svg': { fontSize: 18 },
//                               }}>
//                                 {child.icon}
//                               </ListItemIcon>
//                               <ListItemText
//                                 primary={child.label}
//                                 primaryTypographyProps={{
//                                   fontSize: '0.83rem',
//                                   fontWeight: isActive(child.path) ? 600 : 400,
//                                   color: isActive(child.path) ? '#38bdf8' : '#94a3b8',
//                                 }}
//                               />
//                             </ListItemButton>
//                           </Tooltip>
//                         ))}
//                       </List>
//                     </Collapse>
//                   )}
//                 </React.Fragment>
//               )
//             }

//             return (
//               <Tooltip key={item.path} title={collapsed ? item.label : ''} placement="right">
//                 <ListItemButton
//                   onClick={() => navigate(item.path)}
//                   sx={{
//                     borderRadius: '10px', mb: 0.5, px: collapsed ? 1.5 : 1.5, py: 1.2,
//                     background: isActive(item.path)
//                       ? 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(129,140,248,0.1))'
//                       : 'transparent',
//                     border: isActive(item.path) ? '1px solid rgba(56,189,248,0.25)' : '1px solid transparent',
//                     '&:hover': { background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)' },
//                     transition: 'all 0.2s ease',
//                   }}
//                 >
//                   <ListItemIcon sx={{
//                     minWidth: collapsed ? 0 : 36,
//                     color: isActive(item.path) ? '#38bdf8' : '#64748b',
//                   }}>
//                     {item.icon}
//                   </ListItemIcon>
//                   {!collapsed && (
//                     <ListItemText
//                       primary={item.label}
//                       primaryTypographyProps={{
//                         fontSize: '0.88rem',
//                         fontWeight: isActive(item.path) ? 600 : 400,
//                         color: isActive(item.path) ? '#f1f5f9' : '#94a3b8',
//                       }}
//                     />
//                   )}
//                   {!collapsed && isActive(item.path) && (
//                     <Box sx={{
//                       width: 6, height: 6, borderRadius: '50%',
//                       background: '#38bdf8',
//                       boxShadow: '0 0 8px #38bdf8',
//                     }} />
//                   )}
//                 </ListItemButton>
//               </Tooltip>
//             )
//           })}
//         </List>

//         {/* Bottom user section */}
//         <Box sx={{
//           p: collapsed ? 1 : 2,
//           borderTop: '1px solid rgba(255,255,255,0.06)',
//           display: 'flex', alignItems: 'center', gap: 1.5,
//         }}>
//           <Avatar sx={{
//             width: 36, height: 36, flexShrink: 0,
//             background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
//             fontSize: '0.8rem', fontWeight: 700,
//           }}>
//             AD
//           </Avatar>
//           {!collapsed && (
//             <Box sx={{ flex: 1, minWidth: 0 }}>
//               <Typography sx={{ fontSize: '0.83rem', fontWeight: 600, color: '#f1f5f9' }}>Admin User</Typography>
//               <Typography sx={{ fontSize: '0.72rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                 admin@abc.edu
//               </Typography>
//             </Box>
//           )}
//         </Box>
//       </Drawer>

//       {/* Main content */}
//       <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
//         {/* Topbar */}
//         <Box sx={{
//           height: 64, display: 'flex', alignItems: 'center',
//           px: 3, gap: 2,
//           borderBottom: '1px solid rgba(255,255,255,0.06)',
//           background: 'rgba(10,15,30,0.8)',
//           backdropFilter: 'blur(20px)',
//           position: 'sticky', top: 0, zIndex: 10,
//         }}>
//           <IconButton
//             onClick={() => setCollapsed(p => !p)}
//             sx={{ color: '#64748b', '&:hover': { color: '#38bdf8', background: 'rgba(56,189,248,0.08)' } }}
//           >
//             {collapsed ? <MenuRounded /> : <ChevronLeftRounded />}
//           </IconButton>

//           <Box sx={{ flex: 1 }} />

//           <Chip
//             icon={<AutoAwesomeRounded sx={{ fontSize: '14px !important' }} />}
//             label="v1.0.0"
//             size="small"
//             sx={{
//               background: 'rgba(56,189,248,0.1)',
//               border: '1px solid rgba(56,189,248,0.2)',
//               color: '#38bdf8',
//               fontWeight: 600,
//               fontSize: '0.72rem',
//             }}
//           />
//         </Box>

//         {/* Page content */}
//         <Box sx={{
//           flex: 1, overflow: 'auto',
//           background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1428 50%, #0a0f1e 100%)',
//           p: { xs: 2, md: 3 },
//         }}>
//           <Outlet />
//         </Box>
//       </Box>
//     </Box>
//   )
// }
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { theme } from './theme'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Institutions from './pages/master/Institutions'
import Campuses from './pages/master/Campuses'
import Departments from './pages/master/Departments'
import Programs from './pages/master/Programs'
import AcademicYears from './pages/master/AcademicYears'
import SeatMatrix from './pages/SeatMatrix'
import Applicants from './pages/Applicants'
import ApplicantDetail from './pages/ApplicantDetail'
import Admissions from './pages/Admissions'
import Fees from './pages/Fees'

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="master/academic-years" element={<AcademicYears />} />
            <Route path="master/institutions" element={<Institutions />} />
            <Route path="master/campuses" element={<Campuses />} />
            <Route path="master/departments" element={<Departments />} />
            <Route path="master/programs" element={<Programs />} />
            <Route path="seat-matrix" element={<SeatMatrix />} />
            <Route path="applicants" element={<Applicants />} />
            <Route path="applicants/:id" element={<ApplicantDetail />} />
            <Route path="admissions" element={<Admissions />} />
            <Route path="fees" element={<Fees />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
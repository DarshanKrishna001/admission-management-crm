import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { theme } from './theme'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'

import LoginPage     from './pages/LoginPage'
import RegisterPage  from './pages/RegisterPage'
import ForgotPassword from './pages/ForgotPassword'   // ← NEW

// Pages
import Dashboard       from './pages/Dashboard'
import SeatMatrix      from './pages/SeatMatrix'
import Applicants      from './pages/Applicants'
import ApplicantDetail from './pages/ApplicantDetail'
import Admissions      from './pages/Admissions'
import Fees            from './pages/Fees'
import AcademicYears       from './pages/master/AcademicYears'
import Institutions        from './pages/master/Institutions'
import CampusesDepartments from './pages/master/CampusesDepartments'
import Programs            from './pages/master/Programs'

// Public student portal
import ApplyNow from './pages/ApplyNow'

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>

            {/* ── Fully public routes (no login needed) ────────────────────── */}
            <Route path="/login"            element={<LoginPage />} />
            <Route path="/register"         element={<RegisterPage />} />
            <Route path="/forgot-password"  element={<ForgotPassword />} />  {/* ← NEW */}

            {/*
             * /apply — Student self-registration portal.
             * Intentionally PUBLIC — no PrivateRoute wrapper.
             * Students land here from the college website.
             */}
            <Route path="/apply" element={<ApplyNow />} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* ── Protected — all authenticated users ──────────────────────── */}
            <Route element={<PrivateRoute allowedRoles={['ADMIN', 'ADMISSION_OFFICER', 'MANAGEMENT']} />}>
              <Route element={<Layout />}>

                {/* Dashboard — all roles */}
                <Route path="/dashboard" element={<Dashboard />} />

                {/* ── Admin only ───────────────────────────────────────────── */}
                <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}>
                  <Route path="/master/academic-years" element={<AcademicYears />} />
                  <Route path="/master/institutions"   element={<Institutions />} />
                  <Route path="/master/campuses"       element={<CampusesDepartments />} />
                  <Route path="/master/departments"    element={<CampusesDepartments />} />
                  <Route path="/master/programs"       element={<Programs />} />
                  <Route path="/seat-matrix"           element={<SeatMatrix />} />
                </Route>

                {/* ── Admin + Admission Officer ─────────────────────────────── */}
                <Route element={<PrivateRoute allowedRoles={['ADMIN', 'ADMISSION_OFFICER']} />}>
                  <Route path="/applicants"     element={<Applicants />} />
                  <Route path="/applicants/:id" element={<ApplicantDetail />} />
                  <Route path="/admissions"     element={<Admissions />} />
                  <Route path="/fees"           element={<Fees />} />
                </Route>

              </Route>
            </Route>

            {/* Catch-all → dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}









// import React from 'react'
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
// import { ThemeProvider, CssBaseline } from '@mui/material'
// import { theme } from './theme'
// import { AuthProvider } from './context/AuthContext'
// import PrivateRoute from './components/PrivateRoute'
// import Layout from './components/Layout'
// import LoginPage    from './pages/LoginPage'
// import RegisterPage from './pages/RegisterPage'

// // Pages
// import Dashboard       from './pages/Dashboard'
// import SeatMatrix      from './pages/SeatMatrix'
// import Applicants      from './pages/Applicants'
// import ApplicantDetail from './pages/ApplicantDetail'
// import Admissions      from './pages/Admissions'
// import Fees            from './pages/Fees'
// import AcademicYears         from './pages/master/AcademicYears'
// import Institutions          from './pages/master/Institutions'
// import CampusesDepartments   from './pages/master/CampusesDepartments'
// import Programs              from './pages/master/Programs'

// // ── Public self-registration portal ──────────────────────────────────────────
// import ApplyNow from './pages/ApplyNow'

// export default function App() {
//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <AuthProvider>
//         <BrowserRouter>
//           <Routes>

//             {/* ── Fully public routes (no login needed) ──────────────────── */}
//             <Route path="/login"    element={<LoginPage />} />
//             <Route path="/register" element={<RegisterPage />} />

//             {/*
//              * /apply — Student self-registration portal.
//              * This is intentionally PUBLIC — no PrivateRoute wrapper.
//              * Students land here from the college website to submit their application.
//              */}
//             <Route path="/apply" element={<ApplyNow />} />

//             <Route path="/"     element={<Navigate to="/dashboard" replace />} />

//             {/* ── Protected — all authenticated users ────────────────────── */}
//             <Route element={<PrivateRoute allowedRoles={['ADMIN','ADMISSION_OFFICER','MANAGEMENT']} />}>
//               <Route element={<Layout />}>

//                 {/* Dashboard — all roles */}
//                 <Route path="/dashboard" element={<Dashboard />} />

//                 {/* ── Admin only ─────────────────────────────────────────── */}
//                 <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}>
//                   <Route path="/master/academic-years"    element={<AcademicYears />} />
//                   <Route path="/master/institutions"      element={<Institutions />} />
//                   <Route path="/master/campuses"          element={<CampusesDepartments />} />
//                   <Route path="/master/departments"       element={<CampusesDepartments />} />
//                   <Route path="/master/programs"          element={<Programs />} />
//                   <Route path="/seat-matrix"              element={<SeatMatrix />} />
//                 </Route>

//                 {/* ── Admin + Admission Officer ──────────────────────────── */}
//                 <Route element={<PrivateRoute allowedRoles={['ADMIN','ADMISSION_OFFICER']} />}>
//                   <Route path="/applicants"     element={<Applicants />} />
//                   <Route path="/applicants/:id" element={<ApplicantDetail />} />
//                   <Route path="/admissions"     element={<Admissions />} />
//                   <Route path="/fees"           element={<Fees />} />
//                 </Route>

//               </Route>
//             </Route>

//             {/* Catch all */}
//             <Route path="*" element={<Navigate to="/dashboard" replace />} />

//           </Routes>
//         </BrowserRouter>
//       </AuthProvider>
//     </ThemeProvider>
//   )
// }




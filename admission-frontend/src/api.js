import axios from 'axios'

// ── Base axios instance ───────────────────────────────────────────────────────
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor — attach JWT ──────────────────────────────────────────
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token')
    if (token) config.headers['Authorization'] = `Bearer ${token}`
    return config
  },
  error => Promise.reject(error)
)

// ── Response interceptor — handle auth errors ─────────────────────────────────
api.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status
    if (status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      delete axios.defaults.headers.common['Authorization']
      window.location.href = '/login'
      return Promise.reject(new Error('Session expired. Please login again.'))
    }
    if (status === 403) {
      return Promise.reject(new Error('Access denied. You do not have permission for this action.'))
    }
    const message =
      error.response?.data?.message ||
      error.response?.data?.error   ||
      error.response?.data          ||
      error.message                 ||
      'Something went wrong'
    return Promise.reject(new Error(typeof message === 'string' ? message : JSON.stringify(message)))
  }
)

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH API  — public routes, use plain axios (no token needed)
// ═══════════════════════════════════════════════════════════════════════════════
export const authApi = {
  login:      (data)  => axios.post('/api/auth/login',    data),
  register:   (data)  => axios.post('/api/auth/register', data),
  getUsers:   ()      => api.get('/auth/users'),
  toggleUser: (id)    => api.patch(`/auth/users/${id}/toggle`),
  validate:   (token) => axios.get(`/api/auth/validate?token=${token}`),
}

// ═══════════════════════════════════════════════════════════════════════════════
// MASTER API  — /api/master/**
// ═══════════════════════════════════════════════════════════════════════════════
export const masterApi = {
  // Academic Years
  getAcademicYears:   ()         => api.get('/master/academic-years'),
  getCurrentYear:     ()         => api.get('/master/academic-years/current'),
  createAcademicYear: (data)     => api.post('/master/academic-years', data),
  updateAcademicYear: (id, data) => api.put(`/master/academic-years/${id}`, data),
  deleteAcademicYear: (id)       => api.delete(`/master/academic-years/${id}`),

  // Institutions
  getInstitutions:   ()         => api.get('/master/institutions'),
  createInstitution: (data)     => api.post('/master/institutions', data),
  updateInstitution: (id, data) => api.put(`/master/institutions/${id}`, data),
  deleteInstitution: (id)       => api.delete(`/master/institutions/${id}`),

  // Campuses
  getCampuses:              ()         => api.get('/master/campuses'),
  getCampusesByInstitution: (id)       => api.get(`/master/campuses/institution/${id}`),
  createCampus:             (data)     => api.post('/master/campuses', data),
  updateCampus:             (id, data) => api.put(`/master/campuses/${id}`, data),
  deleteCampus:             (id)       => api.delete(`/master/campuses/${id}`),

  // Departments
  getDepartments:         ()         => api.get('/master/departments'),
  getDepartmentsByCampus: (id)       => api.get(`/master/departments/campus/${id}`),
  createDepartment:       (data)     => api.post('/master/departments', data),
  updateDepartment:       (id, data) => api.put(`/master/departments/${id}`, data),
  deleteDepartment:       (id)       => api.delete(`/master/departments/${id}`),

  // Programs
  getPrograms:    ()         => api.get('/master/programs'),
  getProgramById: (id)       => api.get(`/master/programs/${id}`),
  createProgram:  (data)     => api.post('/master/programs', data),
  updateProgram:  (id, data) => api.put(`/master/programs/${id}`, data),
  deleteProgram:  (id)       => api.delete(`/master/programs/${id}`),
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEAT MATRIX API  — /api/seats/**
// ═══════════════════════════════════════════════════════════════════════════════
export const seatApi = {
  getAllMatrices:     ()                      => api.get('/seats/matrix'),
  getMatrixByProgram: (id)                    => api.get(`/seats/matrix/program/${id}`),
  createMatrix:       (data)                  => api.post('/seats/matrix', data),
  checkAvailability:  (programId, quotaType)  => api.get('/seats/availability', { params: { programId, quotaType } }),
}

// ═══════════════════════════════════════════════════════════════════════════════
// APPLICANT API  — /api/applicants/**
// ═══════════════════════════════════════════════════════════════════════════════
export const applicantApi = {
  getAll:   ()     => api.get('/applicants'),
  getById:  (id)   => api.get(`/applicants/${id}`),
  create:   (data) => api.post('/applicants', data),

  updateStatus: (id, status) =>
    api.patch(`/applicants/${id}/status`, null, { params: { status } }),

  // Documents
  getDocuments: (applicantId) =>
    api.get(`/applicants/${applicantId}/documents`),

  addDocument: (applicantId, data) =>
    api.post(`/applicants/${applicantId}/documents`, data),

  // FIX: Backend uses @PatchMapping — must use PATCH not PUT
  updateDocument: (applicantId, documentId, data) =>
    api.patch(`/applicants/${applicantId}/documents/${documentId}`, data),
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMISSION API  — /api/admissions/**
// ═══════════════════════════════════════════════════════════════════════════════
export const admissionApi = {
  getAll:    ()     => api.get('/admissions'),
  getById:   (id)   => api.get(`/admissions/${id}`),

  // FIX: Correct endpoint is /admissions/applicant/{id}
  getByApplicant: (applicantId) =>
    api.get(`/admissions/applicant/${applicantId}`),

  allocate: (data) => api.post('/admissions/allocate', data),
  confirm:  (id)   => api.post(`/admissions/${id}/confirm`),
  cancel:   (id)   => api.post(`/admissions/${id}/cancel`),
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEE API  — /api/fees/**
// ═══════════════════════════════════════════════════════════════════════════════
export const feeApi = {
  getAll: () => api.get('/fees'),

  // FIX: Backend endpoint is /fees/applicant/{id}/status  (GET)
  getByApplicant: (applicantId) =>
    api.get(`/fees/applicant/${applicantId}/status`),

  create: (data) =>
    api.post('/fees', data),

  // PATCH /fees/applicant/{id}  — mark PAID or update status
  update: (applicantId, data) =>
    api.patch(`/fees/applicant/${applicantId}`, data),
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD API  — /api/dashboard/**
// ═══════════════════════════════════════════════════════════════════════════════
export const dashboardApi = {
  getOverview:    () => api.get('/dashboard/overview'),
  getSeats:       () => api.get('/dashboard/seats'),
  getPendingFees: () => api.get('/dashboard/fees/pending'),
  getPendingDocs: () => api.get('/dashboard/documents/pending'),
}

export default api







// import axios from 'axios'

// const api = axios.create({
//   baseURL: '/api',
//   headers: { 'Content-Type': 'application/json' },
// })

// api.interceptors.response.use(
//   res => res,
//   err => {
//     const msg = err.response?.data?.message || err.message || 'Something went wrong'
//     return Promise.reject(new Error(msg))
//   }
// )

// // ─── Master Service ────────────────────────────────────────────────────────────
// export const masterApi = {
//   // Academic Years
//   getAcademicYears: () => api.get('/master/academic-years'),
//   getCurrentAcademicYear: () => api.get('/master/academic-years/current'),
//   createAcademicYear: data => api.post('/master/academic-years', data),
//   updateAcademicYear: (id, data) => api.put(`/master/academic-years/${id}`, data),
//   deleteAcademicYear: id => api.delete(`/master/academic-years/${id}`),

//   // Institutions
//   getInstitutions: () => api.get('/master/institutions'),
//   createInstitution: data => api.post('/master/institutions', data),
//   updateInstitution: (id, data) => api.put(`/master/institutions/${id}`, data),
//   deleteInstitution: id => api.delete(`/master/institutions/${id}`),

//   // Campuses
//   getCampuses: () => api.get('/master/campuses'),
//   getCampusesByInstitution: id => api.get(`/master/campuses/institution/${id}`),
//   createCampus: data => api.post('/master/campuses', data),
//   updateCampus: (id, data) => api.put(`/master/campuses/${id}`, data),
//   deleteCampus: id => api.delete(`/master/campuses/${id}`),

//   // Departments
//   getDepartments: () => api.get('/master/departments'),
//   getDepartmentsByCampus: id => api.get(`/master/departments/campus/${id}`),
//   createDepartment: data => api.post('/master/departments', data),
//   updateDepartment: (id, data) => api.put(`/master/departments/${id}`, data),
//   deleteDepartment: id => api.delete(`/master/departments/${id}`),

//   // Programs
//   getPrograms: () => api.get('/master/programs'),
//   getProgramById: id => api.get(`/master/programs/${id}`),
//   createProgram: data => api.post('/master/programs', data),
//   updateProgram: (id, data) => api.put(`/master/programs/${id}`, data),
//   deleteProgram: id => api.delete(`/master/programs/${id}`),
// }

// // ─── Seat Matrix Service ───────────────────────────────────────────────────────
// export const seatApi = {
//   getAllMatrices: () => api.get('/seats/matrix'),
//   getMatrixByProgram: programId => api.get(`/seats/matrix/program/${programId}`),
//   createMatrix: data => api.post('/seats/matrix', data),
//   checkAvailability: (programId, quotaType) =>
//     api.get('/seats/availability', { params: { programId, quotaType } }),
// }

// // ─── Applicant Service ─────────────────────────────────────────────────────────
// export const applicantApi = {
//   getAll: (params) => api.get('/applicants', { params }),
//   getById: id => api.get(`/applicants/${id}`),
//   create: data => api.post('/applicants', data),
//   updateStatus: (id, status) =>
//     api.patch(`/applicants/${id}/status`, null, { params: { status } }),
//   getDocuments: id => api.get(`/applicants/${id}/documents`),
//   addDocument: (id, data) => api.post(`/applicants/${id}/documents`, data),
//   updateDocument: (applicantId, docId, data) =>
//     api.patch(`/applicants/${applicantId}/documents/${docId}`, data),
// }

// // ─── Admission Service ─────────────────────────────────────────────────────────
// export const admissionApi = {
//   getAll: (params) => api.get('/admissions', { params }),
//   getById: id => api.get(`/admissions/${id}`),
//   getByApplicant: applicantId => api.get(`/admissions/applicant/${applicantId}`),
//   allocate: data => api.post('/admissions/allocate', data),
//   confirm: id => api.post(`/admissions/${id}/confirm`),
//   cancel: id => api.post(`/admissions/${id}/cancel`),
// }

// // ─── Fee Service ───────────────────────────────────────────────────────────────
// export const feeApi = {
//   getAll: (params) => api.get('/fees', { params }),
//   getByApplicant: id => api.get(`/fees/applicant/${id}/status`),
//   create: data => api.post('/fees', data),
//   update: (applicantId, data) => api.patch(`/fees/applicant/${applicantId}`, data),
// }

// // ─── Dashboard Service ─────────────────────────────────────────────────────────
// export const dashboardApi = {
//   getOverview: () => api.get('/dashboard/overview'),
//   getSeats: () => api.get('/dashboard/seats'),
//   getPendingFees: () => api.get('/dashboard/fees/pending'),
//   getPendingDocs: () => api.get('/dashboard/applicants/pending-docs'),
// }
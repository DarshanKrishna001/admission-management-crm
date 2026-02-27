# 🎓 Admission Management & CRM System

A full-stack web application for managing college admissions — built with **Spring Boot Microservices** backend and **Vite React + Material UI** frontend.

> ⚙️ AI Tools Used: **Claude (Anthropic)** — used for code generation assistance. All business logic, architecture decisions, entity design, and service interactions were designed and reviewed by the developer.

---

## 🏗️ Architecture
```
┌─────────────────────────────────────────────────────┐
│                   Vite React Frontend                │
│              (Material UI · Recharts)                │
│                  localhost:5173                      │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                   API Gateway                        │
│              Spring Cloud Gateway                    │
│                  localhost:8080                      │
└──┬──────┬──────┬──────┬──────┬──────┬───────────────┘
   │      │      │      │      │      │
 :8081  :8082  :8083  :8084  :8085  :8086
Master  Seat  Appli- Admis-  Fee   Dash-
Service Matrix cant  sion   board  board
               Svc   Svc    Svc    Svc
        
        All services registered on Eureka :8761
```

---

## 🧩 Microservices

| Service | Port | Responsibility |
|---|---|---|
| `eureka-server` | 8761 | Service discovery |
| `api-gateway` | 8080 | Routing, CORS |
| `master-service` | 8081 | Institution, Campus, Department, Program, Academic Year |
| `seat-matrix-service` | 8082 | Intake config, quota allocation, real-time counters |
| `applicant-service` | 8083 | Applicant form (15 fields), document checklist |
| `admission-service` | 8084 | Seat allocation, admission number generation |
| `fee-service` | 8085 | Fee PENDING/PAID status |
| `dashboard-service` | 8086 | Aggregated stats via Feign clients |

---

## ✅ Key Features Implemented

- ✅ Master Setup — Institution → Campus → Department → Program → Academic Year
- ✅ Seat Matrix — Quota-wise intake (KCET / COMEDK / MANAGEMENT), sum validation
- ✅ No Overbooking — Pessimistic DB lock prevents race conditions
- ✅ Quota Full Block — Allocation rejected when quota is exhausted
- ✅ Applicant Management — 15-field form, auto document checklist
- ✅ Document Tracking — PENDING → SUBMITTED → VERIFIED
- ✅ Fee Gate — Confirmation only allowed when fee is PAID
- ✅ Immutable Admission Number — Generated once on confirmation
- ✅ Format: `ABC/2026/UG/CSE/KCET/0001`
- ✅ Dashboard — Live charts, quota fill rates, fee pending list
- ✅ Role-based UI — Admin, Admission Officer, Management views

---

## 🛠️ Tech Stack

**Backend**
- Java 17
- Spring Boot 3.2.5
- Spring Cloud (Eureka, Gateway, OpenFeign)
- Spring Data JPA + Hibernate
- MySQL 8.0
- Maven

**Frontend**
- Vite + React 18
- Material UI v6
- React Router v6
- Axios
- Recharts

---

## ⚙️ Setup & Run

### Prerequisites
- Java 17+
- Maven 3.8+
- MySQL 8.0+
- Node.js 18+

### Database
```sql
-- MySQL auto-creates these on first startup:
admission_master
admission_seats
admission_applicants
admission_admissions
admission_fees
```

### Backend — Start in this order
```bash
cd eureka-server && mvn spring-boot:run
cd api-gateway && mvn spring-boot:run
cd master-service && mvn spring-boot:run
cd seat-matrix-service && mvn spring-boot:run
cd applicant-service && mvn spring-boot:run
cd fee-service && mvn spring-boot:run
cd admission-service && mvn spring-boot:run
cd dashboard-service && mvn spring-boot:run
```

### Frontend
```bash
cd admission-frontend
npm install
npm run dev
```

### Verify
- Eureka Dashboard: `http://localhost:8761`
- Frontend: `http://localhost:5173`
- API Gateway: `http://localhost:8080`

---

## 📋 API Reference

### Master Service
```
POST   /api/master/academic-years
POST   /api/master/institutions
POST   /api/master/campuses
POST   /api/master/departments
POST   /api/master/programs
GET    /api/master/programs
```

### Seat Matrix
```
POST   /api/seats/matrix
GET    /api/seats/availability?programId=1&quotaType=KCET
POST   /api/seats/lock
POST   /api/seats/release
```

### Applicants
```
POST   /api/applicants
GET    /api/applicants
GET    /api/applicants/{id}
PATCH  /api/applicants/{id}/documents/{docId}
```

### Admissions
```
POST   /api/admissions/allocate
POST   /api/admissions/{id}/confirm
POST   /api/admissions/{id}/cancel
GET    /api/admissions
```

### Fees
```
POST   /api/fees
PATCH  /api/fees/applicant/{id}
GET    /api/fees/applicant/{id}/status
```

### Dashboard
```
GET    /api/dashboard/overview
GET    /api/dashboard/seats
GET    /api/dashboard/fees/pending
```

---

## 🗺️ Admission Journey
```
Setup:     Academic Year → Institution → Campus → Department → Program → Seat Matrix
Govt Flow: Create Applicant → Verify Docs → Create Fee → Mark PAID → Allocate → Confirm → 🎓 Admission Number
Mgmt Flow: Create Applicant → Verify Docs → Create Fee → Mark PAID → Allocate → Confirm → 🎓 Admission Number
Monitor:   Dashboard → Live seat counters, quota fill rates, pending fees
```
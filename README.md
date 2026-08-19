# Klinik Alwi — Enterprise Hospital Management System (HMS)

Production-ready, scalable, Clean Architecture Hospital Management System built with **Golang 1.25+ (Gin Framework)** and **React 19 (TypeScript + Vite + TailwindCSS)**.

---

## 🏗️ System Architecture

```
                  ┌──────────────────────────────────────────┐
                  │      Presentation Layer (Gin / React)    │
                  └────────────────────┬─────────────────────┘
                                       │
                  ┌────────────────────▼─────────────────────┐
                  │       Application Layer (Services)       │
                  └────────────────────┬─────────────────────┘
                                       │
                  ┌────────────────────▼─────────────────────┐
                  │        Domain Layer (Entities & Rules)   │
                  └────────────────────┬─────────────────────┘
                                       │
                  ┌────────────────────▼─────────────────────┐
                  │   Infrastructure Layer (GORM / Postgres) │
                  └──────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Backend
- **Golang 1.25+**
- **Gin Framework** (High performance HTTP router)
- **GORM** (ORM for PostgreSQL / SQLite fallback)
- **PostgreSQL 16** (Database)
- **JWT & RBAC** (Token authentication & fine-grained role control)
- **Clean Architecture & Repository Pattern**
- **Docker Compose & Makefile**

### Frontend
- **React 19 + TypeScript**
- **Vite** (Next-gen build tool)
- **Tailwind CSS v4** + Glassmorphism & Dark Mode persistence
- **Zustand** (Global state & Role switcher)
- **TanStack Query** (API caching & synchronization)
- **Lucide Icons & Framer Motion**

---

## 🔐 User Roles & Permissions (RBAC)

1. **Super Admin**: Full platform configuration, user provisioning, and immutable audit log inspection.
2. **Admin**: Patient registration, doctor scheduling, and billing cashier control.
3. **Doctor (dr. Alwi Shahab, Sp.PD / dr. Sarah Lestari, Sp.A)**: Patient queue processing, EMR entry (SOAP), ICD-10 diagnosis, e-prescriptions, and digital signatures.
4. **Pharmacist (apt. Andi Pratama, S.Farm)**: Stock inventory master, low-stock/expiry alerts, and prescription dispensing with **automatic stock deduction**.
5. **Patient (Budi Santoso)**: Online appointment booking, live queue number tracking, and personal medical history access.

---

## 🚀 Quick Start Guide

### 1. Run via Docker Compose (Recommended)
```bash
docker-compose up -d --build
```
Backend API will run at `http://localhost:8086` and PostgreSQL at port `5432`.

### 2. Manual Backend Run
```bash
cd backend
go mod download
go run cmd/api/main.go
```

### 3. Run Backend Tests
```bash
cd backend
go test -v ./...
```

### 4. Run Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3005` in your browser.

---

## 📊 Modules Included

1. **Doctor Management**: Doctor database, practice license number (SIP), specialization, room assignment, weekly schedules.
2. **Patient Management**: Registration, NIK, allergies, disease history, emergency contacts.
3. **Appointment System**: Date & slot booking, overbooking prevention quota check.
4. **Queue Management**: Real-time queue calling with audio-visual display alerts.
5. **Consultation & EMR (SOAP)**: Subjective, Objective, Assessment, Plan, ICD-10 codes, digital signatures.
6. **Pharmacy & Stock**: Stock master, expiry alerts, low stock badges, auto-deduction.
7. **Billing & Invoices**: Itemized charges (Doctor Fee + Procedure Fee + Medicine Fee + Tax - Discount), QRIS/Cash confirmation.
8. **Medical Records**: Soft-delete protected persistent clinical history (`gorm.DeletedAt`).
9. **Reports & Analytics**: Executive charts, revenue breakdown, top ICD-10 diagnoses, PDF/Excel export.
10. **Audit Logs**: Immutable action tracking.

---

## 🔑 Default Credentials (Demo Seeder)

| Role | Username | Password |
|---|---|---|
| Super Admin | `superadmin` | `password123` |
| Admin | `admin` | `password123` |
| Doctor | `doctor_alwi` | `password123` |
| Pharmacist | `pharmacist` | `password123` |
| Patient | `patient_budi` | `password123` |

---
© 2026 Klinik Alwi — All Rights Reserved.

# MediEMR — Clinic Management & EMR System

A modern Electronic Medical Records (EMR) and Clinic Management System designed for doctors and clinical staff. Built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, and **Supabase** (with built-in offline LocalStorage fallback).

---

## 🗺️ Workspace Directory Map ("What is Where")

```text
clinic-deskv2/
├── public/                     # Static public assets (favicons, SVG icon sprites)
│   ├── favicon.svg
│   └── icons.svg
├── src/                        # Main application source code
│   ├── assets/                 # Brand graphics and images
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/             # React UI components grouped by module
│   │   ├── appointments/       # Appointment scheduling & management
│   │   │   ├── AppointmentModal.tsx
│   │   │   └── AppointmentsPage.tsx
│   │   ├── auth/               # User authentication screens
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── billing/            # Billing, invoicing & payment tracking
│   │   │   ├── BillingPage.tsx
│   │   │   ├── InvoiceModal.tsx
│   │   │   └── PrintInvoiceView.tsx
│   │   ├── dashboard/          # Clinic overview & quick stats
│   │   │   └── Dashboard.tsx
│   │   ├── EMR/                # Clinical consultations & digital prescriptions
│   │   │   ├── ConsultationWorkspace.tsx
│   │   │   └── PrintPrescriptionView.tsx
│   │   ├── layout/             # Application shell & navigation frames
│   │   │   ├── Header.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── patients/           # Patient directory & medical profile management
│   │   │   ├── PatientFormModal.tsx
│   │   │   ├── PatientProfileView.tsx
│   │   │   ├── PatientsPage.tsx
│   │   │   └── QuickPatientSearchModal.tsx
│   │   ├── prescriptions/      # Prescription history & re-printing
│   │   │   └── PrescriptionsPage.tsx
│   │   ├── reports/            # Data visual analytics & clinic reports
│   │   │   └── ReportsPage.tsx
│   │   └── settings/           # Doctor profile & clinic settings
│   │       └── SettingsPage.tsx
│   ├── context/                # React Context Providers for global state
│   │   ├── AuthContext.tsx     # Auth state, login/logout, doctor profile
│   │   └── ToastContext.tsx    # Global alert/toast notification banner
│   ├── lib/                    # Library configurations
│   │   └── supabase.ts         # Supabase client setup & config checks
│   ├── services/               # Data access layer (Supabase + LocalStorage mock fallback)
│   │   └── dataService.ts      # Unified CRUD API for all application entities
│   ├── types/                  # TypeScript interface definitions
│   │   └── database.ts         # Database entity models (Patient, Doctor, Appointment, etc.)
│   ├── App.css
│   ├── App.tsx                 # Root application component & layout container
│   ├── index.css               # Global Tailwind CSS imports
│   └── main.tsx                # Application entry point
├── supabase/                   # Database migrations & schemas
│   └── schema.sql              # Supabase SQL schema definitions & RLS policies
├── .env.example                # Example environment variables template
├── .gitignore                  # Git ignored files configuration
├── .oxlintrc.json              # Oxlint linter settings
├── index.html                  # HTML template entry point
├── package.json                # Project dependencies & npm scripts
├── tsconfig.json               # Root TypeScript configuration
├── tsconfig.app.json           # Application TypeScript config
├── tsconfig.node.json          # Node / Vite TypeScript config
└── vite.config.ts              # Vite bundler & plugin configuration
```

---

## 🔍 Detailed Module Guide

### 1. 🔑 Authentication & Session Management
- **[`src/context/AuthContext.tsx`](file:///c:/Users/Pranshu%20B/OneDrive/Desktop/Projects/clinic-deskv2/src/context/AuthContext.tsx)**: Manages doctor authentication session. Uses Supabase Auth if credentials are provided in `.env`, or seamlessly falls back to local storage mock authentication.
- **[`src/components/auth/LoginPage.tsx`](file:///c:/Users/Pranshu%20B/OneDrive/Desktop/Projects/clinic-deskv2/src/components/auth/LoginPage.tsx)**: Doctor login form.
- **[`src/components/auth/RegisterPage.tsx`](file:///c:/Users/Pranshu%20B/OneDrive/Desktop/Projects/clinic-deskv2/src/components/auth/RegisterPage.tsx)**: Doctor registration form (clinic details, registration number, specialization).

### 2. 📊 Dashboard Module
- **[`src/components/dashboard/Dashboard.tsx`](file:///c:/Users/Pranshu%20B/OneDrive/Desktop/Projects/clinic-deskv2/src/components/dashboard/Dashboard.tsx)**: Home view displaying Key Performance Indicators (KPIs) like total patients, today's visits, pending consultations, monthly revenue, recent patient activity table, and quick action buttons.

### 3. 👥 Patient Management Module
- **[`src/components/patients/PatientsPage.tsx`](file:///c:/Users/Pranshu%20B/OneDrive/Desktop/Projects/clinic-deskv2/src/components/patients/PatientsPage.tsx)**: Searchable & filterable directory of all registered clinic patients.
- **[`src/components/patients/PatientProfileView.tsx`](file:///c:/Users/Pranshu%20B/OneDrive/Desktop/Projects/clinic-deskv2/src/components/patients/PatientProfileView.tsx)**: Comprehensive patient detail drawer/page showing medical history, vitals chart history, past visits, lab reports, and uploaded documents.
- **[`src/components/patients/PatientFormModal.tsx`](file:///c:/Users/Pranshu%20B/OneDrive/Desktop/Projects/clinic-deskv2/src/components/patients/PatientFormModal.tsx)**: Form modal to add a new patient or edit demographics.
- **[`src/components/patients/QuickPatientSearchModal.tsx`](file:///c:/Users/Pranshu%20B/OneDrive/Desktop/Projects/clinic-deskv2/src/components/patients/QuickPatientSearchModal.tsx)**: Global command palette modal triggered anywhere via `Ctrl + K` or `Cmd + K`.

### 4. 📅 Appointment Scheduling Module
- **[`src/components/appointments/AppointmentsPage.tsx`](file:///c:/Users/Pranshu%20B/OneDrive/Desktop/Projects/clinic-deskv2/src/components/appointments/AppointmentsPage.tsx)**: Appointment manager with status filtering (`Scheduled`, `Confirmed`, `Completed`, `Cancelled`), date picker, and inline status updaters.
- **[`src/components/appointments/AppointmentModal.tsx`](file:///c:/Users/Pranshu%20B/OneDrive/Desktop/Projects/clinic-deskv2/src/components/appointments/AppointmentModal.tsx)**: Booking dialog for scheduling appointments linked to patients.

### 5. 🩺 EMR & Consultation Workspace
- **[`src/components/EMR/ConsultationWorkspace.tsx`](file:///c:/Users/Pranshu%20B/OneDrive/Desktop/Projects/clinic-deskv2/src/components/EMR/ConsultationWorkspace.tsx)**: Active clinical consultation view for doctors to record:
  - Patient vitals (Blood pressure, pulse, temperature, BMI, SpO2)
  - Chief complaints, symptoms, diagnosis
  - Multi-drug medication prescription builder (drug name, dosage, frequency, duration, route)
  - Examination & clinical notes
- **[`src/components/EMR/PrintPrescriptionView.tsx`](file:///c:/Users/Pranshu%20B/OneDrive/Desktop/Projects/clinic-deskv2/src/components/EMR/PrintPrescriptionView.tsx)**: Print-ready formatted prescription output with clinic header, doctor details, RX section, and signature block.

### 6. 💊 Prescriptions Module
- **[`src/components/prescriptions/PrescriptionsPage.tsx`](file:///c:/Users/Pranshu%20B/OneDrive/Desktop/Projects/clinic-deskv2/src/components/prescriptions/PrescriptionsPage.tsx)**: Centralized repository of all past consultations and prescriptions generated, allowing search and re-printing.

### 7. 💳 Billing & Invoices Module
- **[`src/components/billing/BillingPage.tsx`](file:///c:/Users/Pranshu%20B/OneDrive/Desktop/Projects/clinic-deskv2/src/components/billing/BillingPage.tsx)**: Revenue dashboard, status tags (`Paid`, `Pending`), payment method filters (`Cash`, `Card`, `UPI`, `Insurance`), and invoice history.
- **[`src/components/billing/InvoiceModal.tsx`](file:///c:/Users/Pranshu%20B/OneDrive/Desktop/Projects/clinic-deskv2/src/components/billing/InvoiceModal.tsx)**: Modal to create itemized patient bills.
- **[`src/components/billing/PrintInvoiceView.tsx`](file:///c:/Users/Pranshu%20B/OneDrive/Desktop/Projects/clinic-deskv2/src/components/billing/PrintInvoiceView.tsx)**: Clean printable invoice template.

### 8. 📈 Analytics & Reports Module
- **[`src/components/reports/ReportsPage.tsx`](file:///c:/Users/Pranshu%20B/OneDrive/Desktop/Projects/clinic-deskv2/src/components/reports/ReportsPage.tsx)**: Visual analytics utilizing `Recharts` for tracking monthly patient footfall, revenue trends, top diagnoses, and appointment metrics.

### 9. ⚙️ Settings Module
- **[`src/components/settings/SettingsPage.tsx`](file:///c:/Users/Pranshu%20B/OneDrive/Desktop/Projects/clinic-deskv2/src/components/settings/SettingsPage.tsx)**: Doctor profile management (name, qualifications, MCI registration number, consultation fee, clinic address, custom print header).

### 10. 📐 Layout & Navigation Components
- **[`src/components/layout/Sidebar.tsx`](file:///c:/Users/Pranshu%20B/OneDrive/Desktop/Projects/clinic-deskv2/src/components/layout/Sidebar.tsx)**: Collapsible desktop sidebar navigation.
- **[`src/components/layout/Header.tsx`](file:///c:/Users/Pranshu%20B/OneDrive/Desktop/Projects/clinic-deskv2/src/components/layout/Header.tsx)**: Top bar with breadcrumb title, quick search button, toast/notifications indicator, and profile menu.
- **[`src/components/layout/MobileNav.tsx`](file:///c:/Users/Pranshu%20B/OneDrive/Desktop/Projects/clinic-deskv2/src/components/layout/MobileNav.tsx)**: Sticky bottom navigation bar for mobile devices.

---

## ⚡ Complete Supabase Setup Guide

Follow these steps to connect your MediEMR app to a live Supabase PostgreSQL database:

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and sign in or create a free account.
2. Click **"New Project"**, select your organization, and fill in:
   - **Name**: `MediEMR` (or your preferred project name)
   - **Database Password**: Set a strong password (and save it securely)
   - **Region**: Choose a region closest to your clinic/users
3. Click **"Create new project"** and wait ~1 minute for deployment.

### Step 2: Obtain API Credentials & Configure `.env`
1. In your Supabase project dashboard, navigate to **Project Settings** (gear icon at the bottom left) -> **API**.
2. Find your credentials:
   - **Project URL** (e.g., `https://xyzcompany.supabase.co`)
   - **`anon` `public` API Key** (e.g., `eyJhbGciOi...`)
3. In your local project root folder, create a `.env` file (or copy `.env.example`):
   ```bash
   cp .env.example .env
   ```
4. Update `.env` with your actual Supabase URL and Key:
   ```env
   VITE_SUPABASE_URL=https://xyzcompany.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key-here
   ```

### Step 3: Run Database Schema Migrations (SQL Script)
1. In the Supabase Dashboard left menu, click on **SQL Editor**.
2. Click **"+ New Query"**.
3. Open **[`supabase/schema.sql`](file:///c:/Users/Pranshu%20B/OneDrive/Desktop/Projects/clinic-deskv2/supabase/schema.sql)** from this repository, copy its entire contents, and paste it into the Supabase SQL Editor.
4. Click the **"Run"** button (or press `Ctrl + Enter`).
5. This script executes automatically and sets up:
   - **10 Core Tables**: `doctors`, `patients`, `appointments`, `consultations`, `vitals`, `prescriptions`, `medical_history`, `lab_reports`, `documents`, `invoices`.
   - **Performance Indexes**: Fast queries for patient search, doctor appointments, and prescriptions.
   - **Automatic Doctor Profile Trigger (`handle_new_user`)**: Creates a doctor record in `public.doctors` whenever a new user registers.
   - **Row Level Security (RLS) Policies**: Guarantees strict multi-tenant privacy so each logged-in doctor can only access their own clinical records.
   - **Storage Buckets**: Pre-creates storage buckets for `lab-reports`, `documents`, and `avatars`.

### Step 4: Configure Authentication Settings
1. In your Supabase Dashboard, go to **Authentication** -> **Providers**.
2. Make sure **Email** is **Enabled**.
3. Under **Authentication** -> **URL Configuration**:
   - Set **Site URL** to `http://localhost:5174` (for local development).

### Step 5: Test & Verify Setup
1. Launch the local dev server:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:5174` in your browser. You will be greeted by the Login / Register screen.
3. Click **"Register"** and create a new account with your doctor details.
4. Go back to your Supabase Dashboard:
   - Check **Authentication** -> **Users**: Your email should appear here.
   - Check **Table Editor** -> **`doctors`**: A doctor profile record will have been created automatically via SQL triggers!

---

## 💾 Data Layer & Dual-Mode Architecture

The app uses a dual data service architecture located in **[`src/services/dataService.ts`](file:///c:/Users/Pranshu%20B/OneDrive/Desktop/Projects/clinic-deskv2/src/services/dataService.ts)**:

- **Supabase Connected Mode**: When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are defined in `.env`, all CRUD operations interact directly with PostgreSQL via `@supabase/supabase-js`.
- **LocalStorage Fallback Mode**: If Supabase is not configured (or `.env` is omitted), the app automatically runs using seed mock data stored in `localStorage`, making it zero-config and completely usable offline out of the box!

All TypeScript interfaces and data models (Doctor, Patient, Appointment, Consultation, Vitals, Invoice, etc.) are defined in **[`src/types/database.ts`](file:///c:/Users/Pranshu%20B/OneDrive/Desktop/Projects/clinic-deskv2/src/types/database.ts)**.

---

## 🛠️ Setup & Development Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

### 5. Run Linter
```bash
npm run lint
```

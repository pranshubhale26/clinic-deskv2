-- MediEMR Supabase PostgreSQL Database Schema
-- Run this script in your Supabase SQL Editor to create tables, indexes, triggers, and Row Level Security (RLS) policies.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DOCTORS TABLE
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  specialization TEXT,
  qualification TEXT,
  registration_number TEXT,
  clinic_name TEXT,
  clinic_address TEXT,
  profile_image TEXT,
  consultation_fee NUMERIC DEFAULT 500,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PATIENTS TABLE
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  patient_code TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  blood_group TEXT,
  allergies TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  appointment_type TEXT DEFAULT 'General Checkup',
  status TEXT DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No Show')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CONSULTATIONS TABLE
CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  chief_complaint TEXT,
  symptoms TEXT[] DEFAULT '{}',
  diagnosis TEXT[] DEFAULT '{}',
  clinical_notes TEXT,
  examination_notes TEXT,
  treatment_plan TEXT,
  follow_up_date DATE,
  status TEXT DEFAULT 'Completed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. VITALS TABLE
CREATE TABLE IF NOT EXISTS public.vitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  height NUMERIC, -- cm
  weight NUMERIC, -- kg
  temperature NUMERIC, -- deg F
  pulse INTEGER, -- bpm
  respiratory_rate INTEGER, -- bpm
  systolic_bp INTEGER, -- mmHg
  diastolic_bp INTEGER, -- mmHg
  oxygen_saturation INTEGER, -- %
  bmi NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PRESCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  medicine_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  route TEXT DEFAULT 'Oral',
  instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MEDICAL HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.medical_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  condition TEXT NOT NULL,
  diagnosis_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. LAB REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.lab_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  test_date DATE,
  result TEXT,
  normal_range TEXT,
  notes TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_patients_doctor ON public.patients(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patients_code ON public.patients(patient_code);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON public.appointments(doctor_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_consultations_patient ON public.consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_consultation ON public.prescriptions(consultation_id);
-- HELPER FUNCTION FOR RLS: Get Doctor ID of logged in auth user
CREATE OR REPLACE FUNCTION public.get_doctor_id()
RETURNS UUID AS $$
  SELECT id FROM public.doctors WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 1. Doctors Policies
CREATE POLICY "Doctors can view own profile" ON public.doctors
  FOR SELECT USING (auth_user_id = auth.uid());
CREATE POLICY "Doctors can insert own profile" ON public.doctors
  FOR INSERT WITH CHECK (auth_user_id = auth.uid());
CREATE POLICY "Doctors can update own profile" ON public.doctors
  FOR UPDATE USING (auth_user_id = auth.uid());

-- 2. Patients Policies
CREATE POLICY "Doctors access own patients" ON public.patients
  FOR ALL USING (doctor_id = public.get_doctor_id());

-- 3. Appointments Policies
CREATE POLICY "Doctors access own appointments" ON public.appointments
  FOR ALL USING (doctor_id = public.get_doctor_id());

-- 4. Consultations Policies
CREATE POLICY "Doctors access own consultations" ON public.consultations
  FOR ALL USING (doctor_id = public.get_doctor_id());

-- 5. Vitals Policies
CREATE POLICY "Doctors access own vitals" ON public.vitals
  FOR ALL USING (
    patient_id IN (SELECT id FROM public.patients WHERE doctor_id = public.get_doctor_id())
  );

-- 6. Prescriptions Policies
CREATE POLICY "Doctors access own prescriptions" ON public.prescriptions
  FOR ALL USING (doctor_id = public.get_doctor_id());

-- 7. Medical History Policies
CREATE POLICY "Doctors access own patient medical history" ON public.medical_history
  FOR ALL USING (
    patient_id IN (SELECT id FROM public.patients WHERE doctor_id = public.get_doctor_id())
  );

-- 8. Lab Reports Policies
CREATE POLICY "Doctors access own lab reports" ON public.lab_reports
  FOR ALL USING (doctor_id = public.get_doctor_id());

-- 9. Documents Policies
CREATE POLICY "Doctors access own documents" ON public.documents
  FOR ALL USING (doctor_id = public.get_doctor_id());

-- AUTOMATIC DOCTOR CREATION TRIGGER ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.doctors (auth_user_id, name, email, specialization, qualification, clinic_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Dr. Medical Officer'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'specialization', 'General Physician'),
    COALESCE(new.raw_user_meta_data->>'qualification', 'MBBS'),
    COALESCE(new.raw_user_meta_data->>'clinic_name', 'MediEMR Care Clinic')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SUPABASE STORAGE BUCKETS SETUP (Execute in SQL Editor if storage extensions active)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lab-reports', 'lab-reports', false), 
       ('documents', 'documents', false), 
       ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

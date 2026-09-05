export type Gender = 'Male' | 'Female' | 'Other';

export type AppointmentStatus = 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled' | 'No Show';

export interface Doctor {
  id: string;
  auth_user_id: string;
  name: string;
  email: string;
  phone?: string;
  specialization?: string;
  qualification?: string;
  registration_number?: string;
  clinic_name?: string;
  clinic_address?: string;
  profile_image?: string;
  consultation_fee?: number;
  created_at: string;
}

export interface Patient {
  id: string;
  doctor_id: string;
  patient_code: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: Gender;
  phone?: string;
  email?: string;
  address?: string;
  blood_group?: string;
  allergies?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  status?: 'Active' | 'Archived';
  created_at: string;
  updated_at?: string;
}

export interface Appointment {
  id: string;
  doctor_id: string;
  patient_id: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // e.g. "10:30 AM"
  appointment_type?: string;
  status: AppointmentStatus;
  notes?: string;
  created_at: string;
  // Joined field for convenience
  patient?: Patient;
}

export interface Vitals {
  id: string;
  consultation_id?: string;
  patient_id: string;
  height?: number; // cm
  weight?: number; // kg
  temperature?: number; // deg F
  pulse?: number; // bpm
  respiratory_rate?: number; // bpm
  systolic_bp?: number; // mmHg
  diastolic_bp?: number; // mmHg
  oxygen_saturation?: number; // %
  bmi?: number;
  created_at: string;
}

export interface PrescriptionItem {
  id?: string;
  consultation_id?: string;
  patient_id?: string;
  doctor_id?: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  route?: string;
  instructions?: string;
  created_at?: string;
}

export interface Consultation {
  id: string;
  doctor_id: string;
  patient_id: string;
  appointment_id?: string;
  chief_complaint?: string;
  symptoms?: string[];
  diagnosis?: string[];
  clinical_notes?: string;
  examination_notes?: string;
  treatment_plan?: string;
  follow_up_date?: string;
  status: 'Draft' | 'Completed';
  created_at: string;
  updated_at?: string;

  // Joined records
  patient?: Patient;
  vitals?: Vitals;
  prescriptions?: PrescriptionItem[];
}

export interface MedicalHistory {
  id: string;
  patient_id: string;
  condition: string;
  diagnosis_date?: string;
  notes?: string;
  created_at: string;
}

export interface LabReport {
  id: string;
  patient_id: string;
  doctor_id: string;
  test_name: string;
  test_date?: string;
  result?: string;
  normal_range?: string;
  notes?: string;
  file_url?: string;
  created_at: string;
}

export interface DocumentRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  document_name: string;
  document_type?: string;
  file_url?: string;
  created_at: string;
}


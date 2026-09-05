import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  Doctor, Patient, Appointment, Consultation, 
  Vitals, PrescriptionItem, MedicalHistory, 
  LabReport, DocumentRecord
} from '../types/database';

// Mock Initial Doctor Profile
const INITIAL_DOCTOR: Doctor = {
  id: 'doc-101',
  auth_user_id: 'user-101',
  name: 'Dr. Rajesh Sharma',
  email: 'dr.sharma@mediemr.com',
  phone: '+91 98765 43210',
  specialization: 'Cardiologist & General Physician',
  qualification: 'MBBS, MD (General Medicine), DM (Cardiology)',
  registration_number: 'MCI-2015-884920',
  clinic_name: 'MediEMR Specialty Care & Diagnostic Center',
  clinic_address: '402, Apex Healthcare Tower, MG Road, Bengaluru, 560001',
  consultation_fee: 600,
  created_at: new Date().toISOString()
};

// Initial Seed Patients
const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    doctor_id: 'doc-101',
    patient_code: 'MED-1001',
    first_name: 'Ananya',
    last_name: 'Verma',
    date_of_birth: '1992-05-14',
    gender: 'Female',
    phone: '+91 91234 56789',
    email: 'ananya.verma@example.com',
    address: '12-B Green Glen Layout, Bellandur, Bengaluru',
    blood_group: 'O+',
    allergies: 'Penicillin, Dust Mites',
    emergency_contact: 'Suresh Verma (Husband)',
    emergency_phone: '+91 91234 56780',
    status: 'Active',
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'pat-2',
    doctor_id: 'doc-101',
    patient_code: 'MED-1002',
    first_name: 'Vikram',
    last_name: 'Rao',
    date_of_birth: '1984-11-20',
    gender: 'Male',
    phone: '+91 98220 11223',
    email: 'vikram.rao@example.com',
    address: '88, Koramangala 4th Block, Bengaluru',
    blood_group: 'B+',
    allergies: 'Sulfa drugs',
    emergency_contact: 'Priya Rao (Wife)',
    emergency_phone: '+91 98220 11224',
    status: 'Active',
    created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'pat-3',
    doctor_id: 'doc-101',
    patient_code: 'MED-1003',
    first_name: 'Meera',
    last_name: 'Patel',
    date_of_birth: '1968-02-08',
    gender: 'Female',
    phone: '+91 97411 99887',
    email: 'meera.p@example.com',
    address: '401, Indiranagar 100ft Road, Bengaluru',
    blood_group: 'A+',
    allergies: 'None',
    emergency_contact: 'Amit Patel (Son)',
    emergency_phone: '+91 97411 99888',
    status: 'Active',
    created_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'pat-4',
    doctor_id: 'doc-101',
    patient_code: 'MED-1004',
    first_name: 'Rohan',
    last_name: 'Gupta',
    date_of_birth: '1998-09-03',
    gender: 'Male',
    phone: '+91 90088 77665',
    email: 'rohan.gupta@example.com',
    address: '15, Whitefield Main Road, Bengaluru',
    blood_group: 'AB+',
    allergies: 'Peanuts',
    emergency_contact: 'Sunita Gupta (Mother)',
    emergency_phone: '+91 90088 77660',
    status: 'Active',
    created_at: new Date().toISOString()
  }
];

// Initial Appointments
const todayStr = new Date().toISOString().split('T')[0];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    doctor_id: 'doc-101',
    patient_id: 'pat-1',
    appointment_date: todayStr,
    appointment_time: '10:00 AM',
    appointment_type: 'Follow-up',
    status: 'Confirmed',
    notes: 'Routine hypertension follow-up',
    created_at: new Date().toISOString(),
    patient: INITIAL_PATIENTS[0]
  },
  {
    id: 'apt-2',
    doctor_id: 'doc-101',
    patient_id: 'pat-2',
    appointment_date: todayStr,
    appointment_time: '11:30 AM',
    appointment_type: 'General Checkup',
    status: 'Scheduled',
    notes: 'Chest discomfort evaluation',
    created_at: new Date().toISOString(),
    patient: INITIAL_PATIENTS[1]
  },
  {
    id: 'apt-3',
    doctor_id: 'doc-101',
    patient_id: 'pat-3',
    appointment_date: todayStr,
    appointment_time: '02:00 PM',
    appointment_type: 'Consultation',
    status: 'Scheduled',
    notes: 'Diabetes screening test reviews',
    created_at: new Date().toISOString(),
    patient: INITIAL_PATIENTS[2]
  },
  {
    id: 'apt-4',
    doctor_id: 'doc-101',
    patient_id: 'pat-4',
    appointment_date: todayStr,
    appointment_time: '04:30 PM',
    appointment_type: 'General Checkup',
    status: 'Scheduled',
    notes: 'Seasonal cough & fever',
    created_at: new Date().toISOString(),
    patient: INITIAL_PATIENTS[3]
  }
];

// Initial Consultations
const INITIAL_CONSULTATIONS: Consultation[] = [
  {
    id: 'con-1',
    doctor_id: 'doc-101',
    patient_id: 'pat-1',
    appointment_id: 'apt-1',
    chief_complaint: 'Mild dizziness in the morning and mild headache for 3 days',
    symptoms: ['Dizziness', 'Headache', 'Fatigue'],
    diagnosis: ['Essential Hypertension (Stage 1)'],
    clinical_notes: 'Patient reports good compliance with reduced sodium diet. Resting blood pressure remains slightly elevated.',
    examination_notes: 'CVS: S1, S2 heard normal. RS: Clear bilateral air entry. CNS: Intact.',
    treatment_plan: 'Continue anti-hypertensive medication. Salt restriction (<2g/day). 30 mins daily walking.',
    follow_up_date: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
    status: 'Completed',
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    patient: INITIAL_PATIENTS[0],
    vitals: {
      id: 'vit-1',
      patient_id: 'pat-1',
      height: 165,
      weight: 62,
      temperature: 98.6,
      pulse: 76,
      respiratory_rate: 16,
      systolic_bp: 138,
      diastolic_bp: 88,
      oxygen_saturation: 99,
      bmi: 22.8,
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    },
    prescriptions: [
      {
        id: 'rx-1',
        medicine_name: 'Telmisartan 40mg',
        dosage: '1 Tablet',
        frequency: '1-0-0 (Morning)',
        duration: '14 Days',
        route: 'Oral',
        instructions: 'Take after breakfast'
      },
      {
        id: 'rx-2',
        medicine_name: 'Paracetamol 650mg',
        dosage: '1 Tablet',
        frequency: '1-0-1 (SOS)',
        duration: '3 Days',
        route: 'Oral',
        instructions: 'Take only if headache persists'
      }
    ]
  }
];

// LocalStorage Persistence Keys
const STORAGE_KEYS = {
  DOCTOR: 'mediemr_doctor',
  PATIENTS: 'mediemr_patients',
  APPOINTMENTS: 'mediemr_appointments',
  CONSULTATIONS: 'mediemr_consultations',
};

// Helper for local state fallback
const getLocal = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const setLocal = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('LocalStorage write error', err);
  }
};

export const dataService = {
  // DOCTOR PROFILE
  getDoctorProfile: async (userId: string): Promise<Doctor> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('auth_user_id', userId)
        .maybeSingle();

      if (!error && data) return data as Doctor;
    }
    return getLocal(STORAGE_KEYS.DOCTOR, INITIAL_DOCTOR);
  },

  updateDoctorProfile: async (doctor: Partial<Doctor>): Promise<Doctor> => {
    if (isSupabaseConfigured && doctor.id) {
      const { data, error } = await supabase
        .from('doctors')
        .update(doctor)
        .eq('id', doctor.id)
        .select()
        .single();
      if (!error && data) return data as Doctor;
    }
    const current = getLocal(STORAGE_KEYS.DOCTOR, INITIAL_DOCTOR);
    const updated = { ...current, ...doctor };
    setLocal(STORAGE_KEYS.DOCTOR, updated);
    return updated;
  },

  // PATIENTS CRUD
  getPatients: async (searchQuery?: string): Promise<Patient[]> => {
    let patients: Patient[] = [];
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) patients = data as Patient[];
      else patients = getLocal(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
    } else {
      patients = getLocal(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      patients = patients.filter(
        (p) =>
          `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
          p.phone?.toLowerCase().includes(q) ||
          p.patient_code?.toLowerCase().includes(q)
      );
    }

    return patients;
  },

  getPatientById: async (patientId: string): Promise<Patient | null> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .maybeSingle();
      if (!error && data) return data as Patient;
    }
    const patients = getLocal<Patient[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
    return patients.find((p) => p.id === patientId) || null;
  },

  savePatient: async (patientData: Partial<Patient>): Promise<Patient> => {
    if (isSupabaseConfigured) {
      if (patientData.id) {
        const { data, error } = await supabase
          .from('patients')
          .update(patientData)
          .eq('id', patientData.id)
          .select()
          .single();
        if (error) throw new Error(error.message);
        if (data) return data as Patient;
      } else {
        const {
          data: { user },
          error: authError
        } = await supabase.auth.getUser();
        if (authError || !user) {
          throw new Error('Your session has expired. Please sign in again.');
        }

        const { data: doctor, error: doctorError } = await supabase
          .from('doctors')
          .select('*')
          .eq('auth_user_id', user.id)
          .single();
        if (doctorError || !doctor) {
          throw new Error('Doctor profile not found. Please complete your clinic profile first.');
        }

        const count = (await dataService.getPatients()).length + 1001;
        const newPatient = {
          ...patientData,
          doctor_id: doctor.id as string,
          patient_code: `MED-${count}`,
          created_at: new Date().toISOString()
        };
        const { data, error } = await supabase
          .from('patients')
          .insert(newPatient)
          .select()
          .single();
        if (error) throw new Error(error.message);
        if (data) return data as Patient;
      }
    }

    // Fallback Local Storage
    const list = getLocal<Patient[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
    if (patientData.id) {
      const idx = list.findIndex((p) => p.id === patientData.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...patientData, updated_at: new Date().toISOString() };
        setLocal(STORAGE_KEYS.PATIENTS, list);
        return list[idx];
      }
    }

    const newPat: Patient = {
      id: `pat-${Date.now()}`,
      doctor_id: 'doc-101',
      patient_code: `MED-${1000 + list.length + 1}`,
      first_name: patientData.first_name || '',
      last_name: patientData.last_name || '',
      date_of_birth: patientData.date_of_birth || '',
      gender: patientData.gender || 'Male',
      phone: patientData.phone || '',
      email: patientData.email || '',
      address: patientData.address || '',
      blood_group: patientData.blood_group || 'O+',
      allergies: patientData.allergies || 'None',
      emergency_contact: patientData.emergency_contact || '',
      emergency_phone: patientData.emergency_phone || '',
      status: 'Active',
      created_at: new Date().toISOString()
    };
    list.unshift(newPat);
    setLocal(STORAGE_KEYS.PATIENTS, list);
    return newPat;
  },

  deletePatient: async (patientId: string): Promise<boolean> => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('patients').delete().eq('id', patientId);
      if (!error) return true;
    }
    const list = getLocal<Patient[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
    const filtered = list.filter((p) => p.id !== patientId);
    setLocal(STORAGE_KEYS.PATIENTS, filtered);
    return true;
  },

  // APPOINTMENTS CRUD
  getAppointments: async (dateFilter?: string): Promise<Appointment[]> => {
    let appointments: Appointment[] = [];
    if (isSupabaseConfigured) {
      let query = supabase.from('appointments').select('*, patient:patients(*)');
      if (dateFilter) query = query.eq('appointment_date', dateFilter);
      const { data, error } = await query;
      if (!error && data) appointments = data as Appointment[];
      else appointments = getLocal(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    } else {
      appointments = getLocal(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    }

    if (dateFilter) {
      appointments = appointments.filter((a) => a.appointment_date === dateFilter);
    }

    return appointments;
  },

  saveAppointment: async (appointmentData: Partial<Appointment>): Promise<Appointment> => {
    const patients = await dataService.getPatients();
    const patientObj = patients.find((p) => p.id === appointmentData.patient_id);

    if (isSupabaseConfigured) {
      if (appointmentData.id) {
        const { data, error } = await supabase
          .from('appointments')
          .update(appointmentData)
          .eq('id', appointmentData.id)
          .select('*, patient:patients(*)')
          .single();
        if (!error && data) return data as Appointment;
      } else {
        const doctor = await dataService.getDoctorProfile('current');
        const newApt = {
          ...appointmentData,
          doctor_id: doctor.id,
          status: appointmentData.status || 'Scheduled',
          created_at: new Date().toISOString()
        };
        const { data, error } = await supabase
          .from('appointments')
          .insert(newApt)
          .select('*, patient:patients(*)')
          .single();
        if (!error && data) return data as Appointment;
      }
    }

    // Local Fallback
    const list = getLocal<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    if (appointmentData.id) {
      const idx = list.findIndex((a) => a.id === appointmentData.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...appointmentData, patient: patientObj || list[idx].patient };
        setLocal(STORAGE_KEYS.APPOINTMENTS, list);
        return list[idx];
      }
    }

    const created: Appointment = {
      id: `apt-${Date.now()}`,
      doctor_id: 'doc-101',
      patient_id: appointmentData.patient_id || '',
      appointment_date: appointmentData.appointment_date || new Date().toISOString().split('T')[0],
      appointment_time: appointmentData.appointment_time || '10:00 AM',
      appointment_type: appointmentData.appointment_type || 'General Checkup',
      status: (appointmentData.status as any) || 'Scheduled',
      notes: appointmentData.notes || '',
      created_at: new Date().toISOString(),
      patient: patientObj
    };
    list.unshift(created);
    setLocal(STORAGE_KEYS.APPOINTMENTS, list);
    return created;
  },

  updateAppointmentStatus: async (appointmentId: string, status: Appointment['status']): Promise<boolean> => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('appointments').update({ status }).eq('id', appointmentId);
      if (!error) return true;
    }
    const list = getLocal<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    const item = list.find((a) => a.id === appointmentId);
    if (item) {
      item.status = status;
      setLocal(STORAGE_KEYS.APPOINTMENTS, list);
    }
    return true;
  },

  // CONSULTATIONS & EMR CRUD
  getConsultations: async (patientId?: string): Promise<Consultation[]> => {
    let list: Consultation[] = [];
    if (isSupabaseConfigured) {
      let query = supabase
        .from('consultations')
        .select('*, patient:patients(*), vitals(*), prescriptions(*)');
      if (patientId) query = query.eq('patient_id', patientId);
      const { data, error } = await query;
      if (!error && data) list = data as Consultation[];
      else list = getLocal(STORAGE_KEYS.CONSULTATIONS, INITIAL_CONSULTATIONS);
    } else {
      list = getLocal(STORAGE_KEYS.CONSULTATIONS, INITIAL_CONSULTATIONS);
    }

    if (patientId) {
      list = list.filter((c) => c.patient_id === patientId);
    }

    return list;
  },

  saveConsultation: async (
    consultationData: Partial<Consultation>,
    vitalsData?: Partial<Vitals>,
    prescriptionsList?: PrescriptionItem[]
  ): Promise<Consultation> => {
    const patients = await dataService.getPatients();
    const patientObj = patients.find((p) => p.id === consultationData.patient_id);

    if (isSupabaseConfigured) {
      const doctor = await dataService.getDoctorProfile('current');
      const consultationPayload = {
        ...consultationData,
        doctor_id: doctor.id,
        status: consultationData.status || 'Completed'
      };

      const { data: conRes, error: conErr } = await supabase
        .from('consultations')
        .insert(consultationPayload)
        .select()
        .single();

      if (!conErr && conRes) {
        const consultationId = conRes.id;
        
        // Save Vitals
        if (vitalsData) {
          await supabase.from('vitals').insert({
            ...vitalsData,
            consultation_id: consultationId,
            patient_id: consultationData.patient_id
          });
        }

        // Save Prescriptions
        if (prescriptionsList && prescriptionsList.length > 0) {
          const rxPayload = prescriptionsList.map((p) => ({
            ...p,
            consultation_id: consultationId,
            patient_id: consultationData.patient_id,
            doctor_id: doctor.id
          }));
          await supabase.from('prescriptions').insert(rxPayload);
        }

        // If associated appointment exists, mark completed
        if (consultationData.appointment_id) {
          await dataService.updateAppointmentStatus(consultationData.appointment_id, 'Completed');
        }

        return (await dataService.getConsultations()).find((c) => c.id === consultationId)!;
      }
    }

    // Local Fallback
    const list = getLocal<Consultation[]>(STORAGE_KEYS.CONSULTATIONS, INITIAL_CONSULTATIONS);
    const newCon: Consultation = {
      id: `con-${Date.now()}`,
      doctor_id: 'doc-101',
      patient_id: consultationData.patient_id || '',
      appointment_id: consultationData.appointment_id,
      chief_complaint: consultationData.chief_complaint || '',
      symptoms: consultationData.symptoms || [],
      diagnosis: consultationData.diagnosis || [],
      clinical_notes: consultationData.clinical_notes || '',
      examination_notes: consultationData.examination_notes || '',
      treatment_plan: consultationData.treatment_plan || '',
      follow_up_date: consultationData.follow_up_date,
      status: consultationData.status || 'Completed',
      created_at: new Date().toISOString(),
      patient: patientObj,
      vitals: vitalsData ? { id: `vit-${Date.now()}`, patient_id: consultationData.patient_id!, ...vitalsData, created_at: new Date().toISOString() } : undefined,
      prescriptions: prescriptionsList || []
    };

    list.unshift(newCon);
    setLocal(STORAGE_KEYS.CONSULTATIONS, list);

    if (consultationData.appointment_id) {
      await dataService.updateAppointmentStatus(consultationData.appointment_id, 'Completed');
    }

    return newCon;
  },

};

import React, { useEffect, useState } from 'react';
import { 
  User, Phone, Mail, MapPin, Calendar, HeartPulse, 
  AlertTriangle, Stethoscope, FileText, Upload, Plus, 
  ArrowLeft, Edit, Trash2, Printer, CheckCircle, Clock
} from 'lucide-react';
import { Patient, Consultation, Appointment, MedicalHistory, LabReport, DocumentRecord } from '../../types/database';
import { dataService } from '../../services/dataService';
import { useToast } from '../../context/ToastContext';

interface PatientProfileViewProps {
  patientId: string;
  onBack: () => void;
  onEditPatient: (patient: Patient) => void;
  onStartConsultation: (patientId: string) => void;
  onScheduleAppointment: (patientId: string) => void;
  onPrintPrescription?: (consultation: Consultation) => void;
}

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({
  patientId,
  onBack,
  onEditPatient,
  onStartConsultation,
  onScheduleAppointment,
  onPrintPrescription
}) => {
  const { showToast } = useToast();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalHistories, setMedicalHistories] = useState<MedicalHistory[]>([]);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'history' | 'consultations' | 'prescriptions' | 'labs' | 'documents' | 'appointments'
  >('overview');

  const [loading, setLoading] = useState(true);

  // Quick form state for new condition or file upload
  const [newCondition, setNewCondition] = useState({ condition: '', diagnosis_date: '', notes: '' });
  const [showAddHistory, setShowAddHistory] = useState(false);

  const loadPatientData = async () => {
    setLoading(true);
    const pat = await dataService.getPatientById(patientId);
    if (pat) {
      setPatient(pat);
      const [cons, apts] = await Promise.all([
        dataService.getConsultations(patientId),
        dataService.getAppointments()
      ]);
      setConsultations(cons);
      setAppointments(apts.filter((a) => a.patient_id === patientId));

      // Initial medical history placeholder data if empty
      setMedicalHistories([
        {
          id: 'mh-1',
          patient_id: patientId,
          condition: 'Type 2 Diabetes Mellitus',
          diagnosis_date: '2021-04-12',
          notes: 'Managed via HbA1c screening and dietary control',
          created_at: new Date().toISOString()
        }
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm font-medium">
        Loading patient profile details...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-slate-600 font-semibold">Patient record not found.</p>
        <button onClick={onBack} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs">
          Return to List
        </button>
      </div>
    );
  }

  const age = patient.date_of_birth
    ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()
    : 'N/A';

  const handleAddCondition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCondition.condition) return;
    const added: MedicalHistory = {
      id: `mh-${Date.now()}`,
      patient_id: patientId,
      condition: newCondition.condition,
      diagnosis_date: newCondition.diagnosis_date || new Date().toISOString().split('T')[0],
      notes: newCondition.notes,
      created_at: new Date().toISOString()
    };
    setMedicalHistories([added, ...medicalHistories]);
    setNewCondition({ condition: '', diagnosis_date: '', notes: '' });
    setShowAddHistory(false);
    showToast('Medical history record added');
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs transition w-fit cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patients Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEditPatient(patient)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition cursor-pointer"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={() => onScheduleAppointment(patient.id)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs rounded-xl border border-blue-200 transition cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule Apt</span>
          </button>
          <button
            onClick={() => onStartConsultation(patient.id)}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <Stethoscope className="w-4 h-4" />
            <span>New Consultation</span>
          </button>
        </div>
      </div>

      {/* Patient Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-teal-500/20 shrink-0">
            {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">
                {patient.first_name} {patient.last_name}
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-teal-50 text-teal-700 border border-teal-200 rounded-lg">
                {patient.patient_code}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg">
                {patient.status || 'Active'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 mt-2 font-medium">
              <span>{patient.gender}, {age} yrs</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {patient.phone}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {patient.email || 'No email registered'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 divide-x divide-slate-100 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="px-3 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Blood Group</span>
            <span className="text-sm font-bold text-rose-600">{patient.blood_group || 'O+'}</span>
          </div>
          <div className="px-3 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Allergies</span>
            <span className="text-xs font-bold text-amber-700">{patient.allergies || 'None'}</span>
          </div>
          <div className="px-3 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Total Visits</span>
            <span className="text-sm font-bold text-teal-700">{consultations.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'history', label: `Medical History (${medicalHistories.length})` },
          { id: 'consultations', label: `Consultations (${consultations.length})` },
          { id: 'prescriptions', label: 'Prescriptions' },
          { id: 'labs', label: 'Lab Reports' },
          { id: 'documents', label: 'Documents' },
          { id: 'appointments', label: `Appointments (${appointments.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white border-x border-t border-slate-200 text-teal-700 shadow-2xs border-b-2 border-b-teal-600'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Panels */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        {/* 1. OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Full Name</span>
                  <span className="font-bold text-slate-800">{patient.first_name} {patient.last_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Patient ID</span>
                  <span className="font-bold text-slate-800 font-mono">{patient.patient_code}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Date of Birth</span>
                  <span className="font-bold text-slate-800">{patient.date_of_birth || 'Not recorded'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Gender</span>
                  <span className="font-bold text-slate-800">{patient.gender}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Blood Group</span>
                  <span className="font-bold text-slate-800">{patient.blood_group || 'O+'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Registration Date</span>
                  <span className="font-bold text-slate-800">
                    {new Date(patient.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                Contact & Emergency Details
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Mobile Phone</span>
                  <span className="font-bold text-slate-800">{patient.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Email Address</span>
                  <span className="font-bold text-slate-800">{patient.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Address</span>
                  <span className="font-bold text-slate-800">{patient.address || 'Not specified'}</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 mt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                    Emergency Contact
                  </span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {patient.emergency_contact || 'None specified'}
                  </p>
                  <p className="text-amber-700 font-medium">{patient.emergency_phone || 'No phone'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. MEDICAL HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Pre-existing Medical Conditions</h3>
              <button
                onClick={() => setShowAddHistory(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 font-semibold text-xs rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Condition</span>
              </button>
            </div>

            {showAddHistory && (
              <form onSubmit={handleAddCondition} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Condition name (e.g. Asthma, Hypertension)..."
                    value={newCondition.condition}
                    onChange={(e) => setNewCondition({ ...newCondition, condition: e.target.value })}
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none"
                  />
                  <input
                    type="date"
                    value={newCondition.diagnosis_date}
                    onChange={(e) => setNewCondition({ ...newCondition, diagnosis_date: e.target.value })}
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Notes or clinical treatment details..."
                  value={newCondition.notes}
                  onChange={(e) => setNewCondition({ ...newCondition, notes: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddHistory(false)}
                    className="px-3 py-1 text-xs text-slate-600"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-3 py-1 bg-teal-600 text-white font-semibold text-xs rounded-lg">
                    Save Record
                  </button>
                </div>
              </form>
            )}

            <div className="divide-y divide-slate-100">
              {medicalHistories.map((mh) => (
                <div key={mh.id} className="py-3 flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">{mh.condition}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Diagnosed on: {mh.diagnosis_date || 'N/A'}</p>
                    {mh.notes && <p className="text-xs text-slate-600 mt-1 italic">{mh.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. CONSULTATIONS */}
        {activeTab === 'consultations' && (
          <div className="space-y-4">
            {consultations.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No past consultations recorded for this patient.
              </div>
            ) : (
              consultations.map((c) => (
                <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <div>
                      <span className="text-xs font-bold text-slate-800">
                        Consultation #{c.id.substring(0, 8)}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-2">
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {onPrintPrescription && c.prescriptions && c.prescriptions.length > 0 && (
                      <button
                        onClick={() => onPrintPrescription(c)}
                        className="flex items-center gap-1 text-xs text-teal-600 font-semibold hover:underline"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Prescription</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 block">Chief Complaint</span>
                      <p className="text-slate-600 mt-0.5">{c.chief_complaint || 'None'}</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block">Diagnosis</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {c.diagnosis?.map((d, i) => (
                          <span key={i} className="px-2 py-0.5 bg-teal-100 text-teal-800 font-semibold rounded text-[10px]">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {c.treatment_plan && (
                    <div className="text-xs">
                      <span className="font-bold text-slate-700 block">Treatment Plan</span>
                      <p className="text-slate-600 mt-0.5">{c.treatment_plan}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* 4. PRESCRIPTIONS */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Prescribed Medications</h3>
            {consultations.flatMap((c) => c.prescriptions || []).length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No active or past prescriptions found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3">Medicine Name</th>
                      <th className="p-3">Dosage</th>
                      <th className="p-3">Frequency</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {consultations
                      .flatMap((c) => c.prescriptions || [])
                      .map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-800">{p.medicine_name}</td>
                          <td className="p-3 text-slate-600">{p.dosage}</td>
                          <td className="p-3 text-teal-700 font-semibold">{p.frequency}</td>
                          <td className="p-3 text-slate-600">{p.duration}</td>
                          <td className="p-3 text-slate-500">{p.instructions || '-'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 5. LAB REPORTS */}
        {activeTab === 'labs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Lab Diagnostic Reports</h3>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center space-y-2 hover:border-teal-400 transition bg-slate-50/50">
              <Upload className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">Upload Lab Report (PDF / Image)</p>
              <p className="text-[10px] text-slate-400">Drag files or click to upload to Supabase Storage</p>
              <input type="file" className="hidden" id="lab-file" />
              <label htmlFor="lab-file" className="inline-block px-3 py-1.5 bg-teal-50 text-teal-700 font-semibold text-xs rounded-lg cursor-pointer hover:bg-teal-100">
                Browse Files
              </label>
            </div>
          </div>
        )}

        {/* 6. DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Medical Documents & Identity Records</h3>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center space-y-2 hover:border-teal-400 transition bg-slate-50/50">
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">Upload Patient Document</p>
              <p className="text-[10px] text-slate-400">Insurance card, discharge summary, or IDs</p>
            </div>
          </div>
        )}

        {/* 7. APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <div className="space-y-3">
            {appointments.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">No appointments logged.</div>
            ) : (
              appointments.map((apt) => (
                <div key={apt.id} className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-800">{apt.appointment_date} at {apt.appointment_time}</span>
                    <p className="text-xs text-slate-500 mt-0.5">{apt.appointment_type} • Status: {apt.status}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                    apt.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {apt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

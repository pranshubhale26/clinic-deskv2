import React, { useEffect, useState } from 'react';
import { 
  Stethoscope, Plus, Trash2, Save, Printer, 
  Activity, Heart, Thermometer, User, CheckCircle2, 
  AlertTriangle, Clock, ArrowLeft
} from 'lucide-react';
import { Patient, Consultation, Vitals, PrescriptionItem } from '../../types/database';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PrintPrescriptionView } from './PrintPrescriptionView';

interface ConsultationWorkspaceProps {
  initialPatientId?: string | null;
  initialAppointmentId?: string | null;
  onConsultationCompleted?: () => void;
}

export const ConsultationWorkspace: React.FC<ConsultationWorkspaceProps> = ({
  initialPatientId,
  initialAppointmentId,
  onConsultationCompleted
}) => {
  const { doctor } = useAuth();
  const { showToast } = useToast();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId || '');
  const [patient, setPatient] = useState<Patient | null>(null);

  // EMR Form State
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [examinationNotes, setExaminationNotes] = useState('');
  const [diagnoses, setDiagnoses] = useState<string[]>([]);
  const [diagnosisInput, setDiagnosisInput] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  // Vitals State
  const [height, setHeight] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [sysBp, setSysBp] = useState<number | ''>('');
  const [diaBp, setDiaBp] = useState<number | ''>('');
  const [pulse, setPulse] = useState<number | ''>('');
  const [temp, setTemp] = useState<number | ''>('');
  const [spO2, setSpO2] = useState<number | ''>('');
  const [respRate, setRespRate] = useState<number | ''>('');

  // Medicines List State
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    { medicine_name: 'Paracetamol 650mg', dosage: '1 Tablet', frequency: '1-0-1 (After Food)', duration: '5 Days', route: 'Oral', instructions: 'Take with warm water' }
  ]);

  // Saved Consultation for Print
  const [printModeConsultation, setPrintModeConsultation] = useState<Consultation | null>(null);
  const [saving, setSaving] = useState(false);

  // Common quick symptom tags
  const commonSymptoms = ['Fever', 'Cough', 'Cold', 'Headache', 'Dizziness', 'Chest Discomfort', 'Nausea', 'Fatigue', 'Abdominal Pain'];
  // Common quick diagnosis tags
  const commonDiagnoses = ['Acute Upper Respiratory Tract Infection', 'Essential Hypertension', 'Type 2 Diabetes Mellitus', 'Acute Gastritis', 'Seasonal Allergic Rhinitis', 'Migraine'];

  useEffect(() => {
    dataService.getPatients().then((list) => {
      setPatients(list);
      if (initialPatientId) {
        setSelectedPatientId(initialPatientId);
      } else if (list.length > 0 && !selectedPatientId) {
        setSelectedPatientId(list[0].id);
      }
    });
  }, [initialPatientId]);

  useEffect(() => {
    if (selectedPatientId) {
      dataService.getPatientById(selectedPatientId).then((p) => setPatient(p));
    } else {
      setPatient(null);
    }
  }, [selectedPatientId]);

  // Calculate BMI dynamically
  const calculateBMI = (): { bmi: number | null; label: string; color: string } => {
    if (typeof height === 'number' && typeof weight === 'number' && height > 0 && weight > 0) {
      const heightInMeters = height / 100;
      const bmiVal = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
      let label = 'Normal';
      let color = 'bg-emerald-100 text-emerald-800 border-emerald-300';

      if (bmiVal < 18.5) {
        label = 'Underweight';
        color = 'bg-sky-100 text-sky-800 border-sky-300';
      } else if (bmiVal >= 25 && bmiVal < 30) {
        label = 'Overweight';
        color = 'bg-amber-100 text-amber-800 border-amber-300';
      } else if (bmiVal >= 30) {
        label = 'Obese';
        color = 'bg-rose-100 text-rose-800 border-rose-300';
      }
      return { bmi: bmiVal, label, color };
    }
    return { bmi: null, label: '', color: '' };
  };

  const bmiData = calculateBMI();

  // Symptom Tag Handlers
  const addSymptom = (sym: string) => {
    if (!sym || symptoms.includes(sym)) return;
    setSymptoms([...symptoms, sym]);
    setSymptomInput('');
  };

  const removeSymptom = (sym: string) => {
    setSymptoms(symptoms.filter((s) => s !== sym));
  };

  // Diagnosis Tag Handlers
  const addDiagnosis = (diag: string) => {
    if (!diag || diagnoses.includes(diag)) return;
    setDiagnoses([...diagnoses, diag]);
    setDiagnosisInput('');
  };

  const removeDiagnosis = (diag: string) => {
    setDiagnoses(diagnoses.filter((d) => d !== diag));
  };

  // Prescription Rows Handlers
  const addPrescriptionRow = () => {
    setPrescriptions([
      ...prescriptions,
      { medicine_name: '', dosage: '1 Tablet', frequency: '1-0-1 (After Food)', duration: '5 Days', route: 'Oral', instructions: '' }
    ]);
  };

  const updatePrescriptionRow = (index: number, field: keyof PrescriptionItem, val: string) => {
    const copy = [...prescriptions];
    copy[index] = { ...copy[index], [field]: val };
    setPrescriptions(copy);
  };

  const removePrescriptionRow = (index: number) => {
    if (prescriptions.length === 1) return;
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleSaveConsultation = async (status: 'Draft' | 'Completed', triggerPrint: boolean = false) => {
    if (!selectedPatientId) {
      showToast('Validation Error', 'Please select a patient to start consultation', 'error');
      return;
    }

    setSaving(true);
    try {
      const vitalsPayload: Partial<Vitals> = {
        height: typeof height === 'number' ? height : undefined,
        weight: typeof weight === 'number' ? weight : undefined,
        systolic_bp: typeof sysBp === 'number' ? sysBp : undefined,
        diastolic_bp: typeof diaBp === 'number' ? diaBp : undefined,
        pulse: typeof pulse === 'number' ? pulse : undefined,
        temperature: typeof temp === 'number' ? temp : undefined,
        oxygen_saturation: typeof spO2 === 'number' ? spO2 : undefined,
        respiratory_rate: typeof respRate === 'number' ? respRate : undefined,
        bmi: bmiData.bmi || undefined
      };

      const consultationPayload: Partial<Consultation> = {
        patient_id: selectedPatientId,
        appointment_id: initialAppointmentId || undefined,
        chief_complaint: chiefComplaint,
        symptoms: symptoms,
        diagnosis: diagnoses,
        examination_notes: examinationNotes,
        treatment_plan: treatmentPlan,
        follow_up_date: followUpDate || undefined,
        status: status
      };

      const savedCons = await dataService.saveConsultation(
        consultationPayload,
        vitalsPayload,
        prescriptions.filter((p) => p.medicine_name.trim() !== '')
      );

      showToast(`Consultation record saved as ${status}`);

      if (triggerPrint && doctor) {
        setPrintModeConsultation(savedCons);
      } else if (onConsultationCompleted) {
        onConsultationCompleted();
      }
    } catch (err) {
      showToast('Failed to save consultation', String(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (printModeConsultation && doctor) {
    return (
      <PrintPrescriptionView
        consultation={printModeConsultation}
        doctor={doctor}
        onBack={() => setPrintModeConsultation(null)}
      />
    );
  }

  const patientAge = patient?.date_of_birth
    ? `${new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} yrs`
    : 'N/A';

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-teal-600" />
            EMR Consultation Workspace
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Capture clinical notes, examine vitals, diagnose, and construct prescriptions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSaveConsultation('Draft', false)}
            disabled={saving}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSaveConsultation('Completed', true)}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Complete & Print Rx</span>
          </button>
        </div>
      </div>

      {/* Patient Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Select Patient Record
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full max-w-md px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="">-- Choose Patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name} ({p.patient_code}) - {p.phone}
                </option>
              ))}
            </select>
          </div>

          {patient && (
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Patient Code</span>
                <span className="font-bold text-slate-800 font-mono">{patient.patient_code}</span>
              </div>
              <div className="border-l border-slate-200 pl-3">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Gender / Age</span>
                <span className="font-bold text-slate-800">{patient.gender}, {patientAge}</span>
              </div>
              <div className="border-l border-slate-200 pl-3">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Allergies</span>
                <span className="font-bold text-rose-600">{patient.allergies || 'None'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Workspace Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Vitals, Complaints, Symptoms */}
        <div className="space-y-6">
          {/* Section 1: Vitals Input */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Activity className="w-4 h-4 text-teal-600" />
              Vital Signs
            </h3>

            {/* Height & Weight with Auto BMI */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Height (cm)</label>
                <input
                  type="number"
                  placeholder="170"
                  value={height}
                  onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  placeholder="70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            {/* Calculated BMI Display */}
            {bmiData.bmi && (
              <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold ${bmiData.color}`}>
                <span>BMI: {bmiData.bmi} kg/m²</span>
                <span className="px-2 py-0.5 rounded-full bg-white/70 text-[10px] uppercase font-bold">
                  {bmiData.label}
                </span>
              </div>
            )}

            {/* Blood Pressure & Pulse */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">Systolic BP</label>
                <input
                  type="number"
                  placeholder="120"
                  value={sysBp}
                  onChange={(e) => setSysBp(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">Diastolic BP</label>
                <input
                  type="number"
                  placeholder="80"
                  value={diaBp}
                  onChange={(e) => setDiaBp(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">Pulse (bpm)</label>
                <input
                  type="number"
                  placeholder="72"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            {/* Temp & SpO2 */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">Temp (°F)</label>
                <input
                  type="number"
                  placeholder="98.6"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">SpO2 (%)</label>
                <input
                  type="number"
                  placeholder="99"
                  value={spO2}
                  onChange={(e) => setSpO2(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">Resp Rate</label>
                <input
                  type="number"
                  placeholder="16"
                  value={respRate}
                  onChange={(e) => setRespRate(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Chief Complaint & Symptoms */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Chief Complaint & Symptoms
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chief Complaint *</label>
              <textarea
                rows={2}
                placeholder="Primary complaint described by patient..."
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            {/* Symptoms Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Symptoms List</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {symptoms.map((sym) => (
                  <span
                    key={sym}
                    className="px-2.5 py-1 bg-teal-100 text-teal-800 font-semibold text-xs rounded-lg flex items-center gap-1"
                  >
                    {sym}
                    <button onClick={() => removeSymptom(sym)} className="hover:text-teal-900">×</button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add symptom..."
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSymptom(symptomInput))}
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => addSymptom(symptomInput)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 font-semibold text-xs rounded-xl"
                >
                  Add
                </button>
              </div>

              {/* Quick Tags */}
              <div className="flex flex-wrap gap-1 mt-2">
                {commonSymptoms.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addSymptom(s)}
                    className="px-2 py-0.5 bg-slate-50 hover:bg-teal-50 border border-slate-200 text-slate-600 text-[10px] rounded-md transition"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center & Right Columns: Clinical Examination, Diagnosis, Prescription Builder, Treatment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 3: Clinical Examination & Diagnosis */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Clinical Findings & Diagnosis
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Examination Notes</label>
                <textarea
                  rows={3}
                  placeholder="Systemic examination findings (CVS, RS, CNS, Per Abdomen)..."
                  value={examinationNotes}
                  onChange={(e) => setExaminationNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnosis</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {diagnoses.map((d) => (
                    <span
                      key={d}
                      className="px-2.5 py-1 bg-blue-100 text-blue-800 font-semibold text-xs rounded-lg flex items-center gap-1"
                    >
                      {d}
                      <button onClick={() => removeDiagnosis(d)} className="hover:text-blue-900">×</button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add diagnosis..."
                    value={diagnosisInput}
                    onChange={(e) => setDiagnosisInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDiagnosis(diagnosisInput))}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => addDiagnosis(diagnosisInput)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 font-semibold text-xs rounded-xl"
                  >
                    Add
                  </button>
                </div>

                {/* Quick Diagnosis Pills */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {commonDiagnoses.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => addDiagnosis(d)}
                      className="px-2 py-0.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-600 text-[10px] rounded-md transition truncate max-w-[180px]"
                    >
                      + {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Dynamic Prescription Table Builder */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span className="text-xl font-serif font-black text-teal-700">Rx</span>
                Prescribed Medication Table
              </h3>

              <button
                type="button"
                onClick={addPrescriptionRow}
                className="flex items-center gap-1 px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 font-semibold text-xs rounded-xl transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medicine</span>
              </button>
            </div>

            <div className="space-y-3">
              {prescriptions.map((rx, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 relative"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-slate-400">Medicine Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Amoxicillin 500mg"
                        value={rx.medicine_name}
                        onChange={(e) => updatePrescriptionRow(idx, 'medicine_name', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400">Dosage</label>
                      <input
                        type="text"
                        placeholder="1 Tab / 5ml"
                        value={rx.dosage}
                        onChange={(e) => updatePrescriptionRow(idx, 'dosage', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400">Frequency</label>
                      <select
                        value={rx.frequency}
                        onChange={(e) => updatePrescriptionRow(idx, 'frequency', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                      >
                        <option value="1-0-1 (After Food)">1-0-1 (After Food)</option>
                        <option value="1-0-0 (Morning)">1-0-0 (Morning)</option>
                        <option value="0-0-1 (Night)">0-0-1 (Night)</option>
                        <option value="1-1-1 (Thrice Daily)">1-1-1 (Thrice Daily)</option>
                        <option value="1-0-1 (Before Food)">1-0-1 (Before Food)</option>
                        <option value="SOS (As needed)">SOS (As needed)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400">Duration</label>
                      <input
                        type="text"
                        placeholder="5 Days"
                        value={rx.duration}
                        onChange={(e) => updatePrescriptionRow(idx, 'duration', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400">Route</label>
                      <select
                        value={rx.route || 'Oral'}
                        onChange={(e) => updatePrescriptionRow(idx, 'route', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                      >
                        <option value="Oral">Oral</option>
                        <option value="Topical">Topical</option>
                        <option value="Injection">Injection</option>
                        <option value="Inhalation">Inhalation</option>
                        <option value="Drops">Drops</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400">Instructions</label>
                      <input
                        type="text"
                        placeholder="Take with food"
                        value={rx.instructions || ''}
                        onChange={(e) => updatePrescriptionRow(idx, 'instructions', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {prescriptions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePrescriptionRow(idx)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 p-1"
                      title="Remove Row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Treatment Plan & Follow up */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Treatment Advice & Follow-Up Schedule
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Treatment Plan & General Advice</label>
                <textarea
                  rows={3}
                  placeholder="Dietary instructions, daily walking, lab tests to perform before next review..."
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Follow-Up Review Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

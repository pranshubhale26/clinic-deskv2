import React from 'react';
import { Consultation, Doctor } from '../../types/database';
import { Printer, ArrowLeft, Activity } from 'lucide-react';

interface PrintPrescriptionViewProps {
  consultation: Consultation;
  doctor: Doctor;
  onBack: () => void;
}

export const PrintPrescriptionView: React.FC<PrintPrescriptionViewProps> = ({
  consultation,
  doctor,
  onBack
}) => {
  const handlePrint = () => {
    const patient = consultation.patient;
    if (patient) {
      const patientName = `${patient.first_name}_${patient.last_name}`.replace(/\s+/g, '_');
      const date = new Date(consultation.created_at).toISOString().split('T')[0];
      const filename = `${patientName}_${date}`;
      
      // Set document title for PDF filename
      const originalTitle = document.title;
      document.title = filename;
      
      // Wait for all images to load before printing
      const images = document.querySelectorAll('.print-page img');
      let loadedCount = 0;
      let totalImages = images.length;
      
      if (totalImages === 0) {
        // No images, print immediately
        setTimeout(() => {
          window.print();
          document.title = originalTitle;
        }, 100);
      } else {
        // Wait for all images to load
        const checkAndPrint = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            setTimeout(() => {
              window.print();
              document.title = originalTitle;
            }, 100);
          }
        };
        
        images.forEach((img: any) => {
          if (img.complete) {
            checkAndPrint();
          } else {
            img.onload = checkAndPrint;
            img.onerror = checkAndPrint;
          }
        });
      }
    } else {
      window.print();
    }
  };

  const patient = consultation.patient;
  const age = patient?.date_of_birth
    ? `${new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} Yrs`
    : 'N/A';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Action Controls (Hidden when printing) */}
      <div className="no-print flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl shadow-lg">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Workspace</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-300 font-medium hidden sm:inline">
            Print-ready medical prescription
          </span>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="print-page bg-white max-w-3xl mx-auto p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xl space-y-3 text-slate-900 font-sans">
        {/* Prescription Template or Default Header */}
        {doctor.prescription_template ? (
          <div className="w-full border-b-2 border-slate-200 pb-6" style={{ pageBreakInside: 'avoid' }}>
            <img 
              src={doctor.prescription_template} 
              alt="Prescription Template" 
              className="w-full"
              style={{ 
                maxHeight: '300px',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>
        ) : (
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                {doctor.clinic_name || 'MediEMR Medical Care'}
              </h1>
              <p className="text-xs text-slate-600 font-medium mt-1">
                {doctor.clinic_address || 'Clinic Address'}
              </p>
              <p className="text-xs text-slate-600">Contact: {doctor.phone || 'N/A'}</p>
            </div>

            <div className="text-right">
              <h2 className="text-sm font-bold text-teal-700">{doctor.name || 'Dr. Medical Officer'}</h2>
              <p className="text-xs text-slate-600 font-semibold">{doctor.qualification || 'MBBS'}</p>
              <p className="text-xs text-slate-500">{doctor.specialization || 'General Physician'}</p>
              <p className="text-[11px] text-slate-400 font-mono mt-1">
                Reg No: {doctor.registration_number || 'REG-100293'}
              </p>
            </div>
          </div>
        )}

        {/* Patient Info Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 font-bold uppercase block text-[10px]">Patient Name</span>
            <span className="font-bold text-slate-900">{patient?.first_name} {patient?.last_name}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block text-[10px]">Patient Code / ID</span>
            <span className="font-bold text-slate-900 font-mono">{patient?.patient_code}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block text-[10px]">Age / Gender</span>
            <span className="font-bold text-slate-900">{age} / {patient?.gender}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block text-[10px]">Date</span>
            <span className="font-bold text-slate-900">
              {new Date(consultation.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Vitals Summary Row if available */}
        {consultation.vitals && (
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-700 border-b border-slate-200 pb-2">
            {consultation.vitals.systolic_bp && (
              <span>BP: <b>{consultation.vitals.systolic_bp}/{consultation.vitals.diastolic_bp} mmHg</b></span>
            )}
            {consultation.vitals.pulse && <span>Pulse: <b>{consultation.vitals.pulse} bpm</b></span>}
            {consultation.vitals.weight && <span>Weight: <b>{consultation.vitals.weight} kg</b></span>}
            {consultation.vitals.bmi && <span>BMI: <b>{consultation.vitals.bmi}</b></span>}
            {consultation.vitals.temperature && <span>Temp: <b>{consultation.vitals.temperature} °F</b></span>}
          </div>
        )}

        {/* Chief Complaint & Diagnosis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {consultation.chief_complaint && (
            <div>
              <span className="font-bold uppercase text-slate-500 text-[10px]">Chief Complaint</span>
              <p className="font-medium text-slate-800 mt-0.5">{consultation.chief_complaint}</p>
            </div>
          )}
          {consultation.diagnosis && consultation.diagnosis.length > 0 && (
            <div>
              <span className="font-bold uppercase text-slate-500 text-[10px]">Diagnosis</span>
              <p className="font-bold text-teal-800 mt-0.5">{consultation.diagnosis.join(', ')}</p>
            </div>
          )}
        </div>

        {/* Investigations Advised */}
        {consultation.investigations && consultation.investigations.length > 0 && (
          <div className="p-2 bg-orange-50 rounded-xl border border-orange-200">
            <span className="font-bold uppercase text-orange-700 text-[10px] block mb-2">Investigations Advised</span>
            <p className="text-xs text-orange-900 font-semibold">{consultation.investigations.join(', ')}</p>
          </div>
        )}

        {/* Rx Symbol Header */}
        <div className="pt-1 flex items-center gap-2">
          <span className="text-2xl font-serif font-black text-teal-800">Rx</span>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Prescribed Medicines
          </span>
        </div>

        {/* Medicines Table */}
        <div className="overflow-hidden border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="p-1.5 text-[10px]">#</th>
                <th className="p-1.5 text-[10px]">Medicine Name</th>
                <th className="p-1.5 text-[10px]">Dosage</th>
                <th className="p-1.5 text-[10px]">Frequency</th>
                <th className="p-1.5 text-[10px]">Duration</th>
                <th className="p-1.5 text-[10px]">Instructions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {consultation.prescriptions?.map((rx, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-1.5 font-bold text-slate-400 text-[10px]">{i + 1}</td>
                  <td className="p-1.5 font-bold text-slate-900 text-[10px]">{rx.medicine_name}</td>
                  <td className="p-1.5 text-slate-700 text-[10px]">{rx.dosage}</td>
                  <td className="p-1.5 font-bold text-teal-800 text-[10px]">{rx.frequency}</td>
                  <td className="p-1.5 text-slate-700 text-[10px]">{rx.duration}</td>
                  <td className="p-1.5 text-slate-600 italic text-[10px]">{rx.instructions || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Treatment Plan & Follow-up */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
          {consultation.treatment_plan && (
            <div>
              <span className="font-bold uppercase text-slate-500 text-[10px]">Advice & Treatment Plan</span>
              <p className="text-slate-700 mt-1 whitespace-pre-line">{consultation.treatment_plan}</p>
            </div>
          )}
          {consultation.follow_up_date && (
            <div>
              <span className="font-bold uppercase text-slate-500 text-[10px]">Follow-Up Visit</span>
              <p className="font-bold text-slate-900 mt-1">
                {new Date(consultation.follow_up_date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Doctor Signature Block */}
        <div className="pt-6 flex justify-end">
          <div className="text-center w-48 border-t border-slate-800 pt-2">
            <p className="font-bold text-xs text-slate-900">{doctor.name}</p>
            <p className="text-[10px] text-slate-500">Authorized Doctor Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
};

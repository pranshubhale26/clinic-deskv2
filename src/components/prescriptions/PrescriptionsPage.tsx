import React, { useEffect, useState } from 'react';
import { FileText, Search, Printer, Calendar, User, Eye } from 'lucide-react';
import { Consultation, Doctor } from '../../types/database';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { PrintPrescriptionView } from '../EMR/PrintPrescriptionView';

export const PrescriptionsPage: React.FC = () => {
  const { doctor } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedConsultationForPrint, setSelectedConsultationForPrint] = useState<Consultation | null>(null);

  const loadPrescriptions = async () => {
    setLoading(true);
    const data = await dataService.getConsultations();
    setConsultations(data.filter((c) => c.prescriptions && c.prescriptions.length > 0));
    setLoading(false);
  };

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const filteredConsultations = consultations.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const patientName = c.patient ? `${c.patient.first_name} ${c.patient.last_name}`.toLowerCase() : '';
    const meds = c.prescriptions?.map((p) => p.medicine_name.toLowerCase()).join(' ') || '';
    return patientName.includes(q) || meds.includes(q);
  });

  if (selectedConsultationForPrint && doctor) {
    return (
      <PrintPrescriptionView
        consultation={selectedConsultationForPrint}
        doctor={doctor}
        onBack={() => setSelectedConsultationForPrint(null)}
      />
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-teal-600" />
            Prescription Records
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Archived medical prescriptions, dosage history, and print view generator
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by Patient Name or Medicine Name (e.g. Telmisartan)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-transparent focus:outline-none"
        />
      </div>

      {/* Prescriptions List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading prescription archives...</div>
      ) : filteredConsultations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">No prescriptions found</h3>
          <p className="text-xs text-slate-400">Prescriptions generated during consultations will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredConsultations.map((c) => {
            const patientName = c.patient ? `${c.patient.first_name} ${c.patient.last_name}` : 'Patient';
            return (
              <div
                key={c.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{patientName}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Code: {c.patient?.patient_code} • Issued: {new Date(c.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedConsultationForPrint(c)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Rx</span>
                  </button>
                </div>

                {/* Prescribed Items */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">
                    Prescribed Medicines ({c.prescriptions?.length || 0})
                  </span>
                  <div className="divide-y divide-slate-100">
                    {c.prescriptions?.map((p, idx) => (
                      <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{p.medicine_name}</span>
                        <span className="text-teal-700 font-semibold">{p.frequency} ({p.duration})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {c.diagnosis && c.diagnosis.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 text-xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Diagnosis: </span>
                    <span className="font-semibold text-slate-700">{c.diagnosis.join(', ')}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

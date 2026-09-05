import React, { useState, useEffect } from 'react';
import { Search, X, User, Phone, ArrowRight } from 'lucide-react';
import { Patient } from '../../types/database';
import { dataService } from '../../services/dataService';

interface QuickPatientSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient: (patient: Patient) => void;
}

export const QuickPatientSearchModal: React.FC<QuickPatientSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectPatient
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      if (query.trim().length >= 1) {
        setLoading(true);
        const data = await dataService.getPatients(query);
        setResults(data);
        setLoading(false);
      } else {
        const all = await dataService.getPatients();
        setResults(all.slice(0, 5));
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose}></div>

      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <Search className="w-5 h-5 text-teal-600 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search patient by Name, Phone, or Code (e.g. MED-1001)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-1 bg-transparent text-sm text-slate-800 focus:outline-none font-medium placeholder-slate-400"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="ml-2 text-xs font-semibold text-slate-400 hover:text-slate-600 px-2 py-1 bg-slate-200/60 rounded-md">
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-50">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">Searching patient directory...</div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">
              No matching patient records found.
            </div>
          ) : (
            results.map((patient) => (
              <div
                key={patient.id}
                onClick={() => {
                  onSelectPatient(patient);
                  onClose();
                }}
                className="flex items-center justify-between p-3 hover:bg-teal-50/60 rounded-xl transition cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                    {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-teal-700 transition">
                        {patient.first_name} {patient.last_name}
                      </h4>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 rounded">
                        {patient.patient_code}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span>{patient.gender}, {patient.date_of_birth ? `${new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} yrs` : ''}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {patient.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 transition transform group-hover:translate-x-1" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

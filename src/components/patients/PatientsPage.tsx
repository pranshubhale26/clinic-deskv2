import React, { useEffect, useState } from 'react';
import { 
  Users, Search, Filter, Plus, Phone, Mail, 
  ChevronRight, Edit, Trash2, LayoutGrid, Table, ChevronLeft
} from 'lucide-react';
import { Patient, Consultation } from '../../types/database';
import { dataService } from '../../services/dataService';
import { PatientFormModal } from './PatientFormModal';
import { PatientProfileView } from './PatientProfileView';
import { useToast } from '../../context/ToastContext';

interface PatientsPageProps {
  onStartConsultationForPatient: (patientId: string) => void;
  onScheduleAppointmentForPatient: (patientId: string) => void;
  onPrintPrescription?: (consultation: Consultation) => void;
  selectedPatientIdFromExternal?: string | null;
  onClearSelectedPatientFromExternal?: () => void;
}

export const PatientsPage: React.FC<PatientsPageProps> = ({
  onStartConsultationForPatient,
  onScheduleAppointmentForPatient,
  onPrintPrescription,
  selectedPatientIdFromExternal,
  onClearSelectedPatientFromExternal
}) => {
  const { showToast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');
  const [bloodFilter, setBloodFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [loading, setLoading] = useState(true);

  // Selected Patient for detail view
  const [activePatientId, setActivePatientId] = useState<string | null>(
    selectedPatientIdFromExternal || null
  );

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const loadPatients = async () => {
    setLoading(true);
    const data = await dataService.getPatients(search);
    setPatients(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPatients();
  }, [search]);

  useEffect(() => {
    if (selectedPatientIdFromExternal) {
      setActivePatientId(selectedPatientIdFromExternal);
    }
  }, [selectedPatientIdFromExternal]);

  const filteredPatients = patients.filter((p) => {
    if (genderFilter !== 'All' && p.gender !== genderFilter) return false;
    if (bloodFilter !== 'All' && p.blood_group !== bloodFilter) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage) || 1;
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (patientId: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove patient ${name}?`)) {
      await dataService.deletePatient(patientId);
      showToast('Patient record deleted');
      loadPatients();
    }
  };

  if (activePatientId) {
    return (
      <PatientProfileView
        patientId={activePatientId}
        onBack={() => {
          setActivePatientId(null);
          if (onClearSelectedPatientFromExternal) onClearSelectedPatientFromExternal();
        }}
        onEditPatient={(pat) => {
          setEditingPatient(pat);
          setShowModal(true);
        }}
        onStartConsultation={onStartConsultationForPatient}
        onScheduleAppointment={onScheduleAppointmentForPatient}
        onPrintPrescription={onPrintPrescription}
      />
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" />
            Patient Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage electronic medical records, histories, and registration
          </p>
        </div>

        <button
          onClick={() => {
            setEditingPatient(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-md transition cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Filter & Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Name, Mobile, or Patient Code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={bloodFilter}
            onChange={(e) => setBloodFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="All">All Blood Groups</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table' ? 'bg-white text-teal-700 shadow-2xs font-bold' : 'text-slate-500'
              }`}
              title="Table View"
            >
              <Table className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'cards' ? 'bg-white text-teal-700 shadow-2xs font-bold' : 'text-slate-500'
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Patients Display Area */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading patients list...</div>
      ) : paginatedPatients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">No matching patient records found</h3>
          <p className="text-xs text-slate-400">Try adjusting your search criteria or register a new patient.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-4">Patient Code / Name</th>
                  <th className="p-4">Gender & Age</th>
                  <th className="p-4">Phone & Email</th>
                  <th className="p-4">Blood Group</th>
                  <th className="p-4">Allergies</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedPatients.map((p) => {
                  const age = p.date_of_birth
                    ? `${new Date().getFullYear() - new Date(p.date_of_birth).getFullYear()} yrs`
                    : 'N/A';
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-teal-50/40 transition cursor-pointer group"
                      onClick={() => setActivePatientId(p.id)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                            {p.first_name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 group-hover:text-teal-700 transition">
                              {p.first_name} {p.last_name}
                            </h4>
                            <span className="font-mono text-[10px] text-slate-400">{p.patient_code}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        {p.gender}, {age}
                      </td>
                      <td className="p-4 text-slate-600">
                        <div>{p.phone}</div>
                        <div className="text-[10px] text-slate-400">{p.email || 'No email'}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 font-bold text-[10px] bg-rose-50 text-rose-700 border border-rose-200 rounded">
                          {p.blood_group || 'O+'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 font-medium">
                        {p.allergies || 'None'}
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingPatient(p);
                              setShowModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                            title="Edit Record"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, `${p.first_name} ${p.last_name}`)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedPatients.map((p) => {
            const age = p.date_of_birth
              ? `${new Date().getFullYear() - new Date(p.date_of_birth).getFullYear()} yrs`
              : 'N/A';
            return (
              <div
                key={p.id}
                onClick={() => setActivePatientId(p.id)}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-teal-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between gap-4 group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 font-bold text-sm flex items-center justify-center">
                        {p.first_name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition">
                          {p.first_name} {p.last_name}
                        </h4>
                        <span className="font-mono text-[10px] text-slate-400">{p.patient_code}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded">
                      {p.blood_group || 'O+'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{p.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{p.email || 'No email registered'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">{p.gender}, {age}</span>
                  <span className="text-teal-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
                    View Record <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-600">
          <span>
            Page {currentPage} of {totalPages} ({filteredPatients.length} total records)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Patient Form Modal */}
      <PatientFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        patientToEdit={editingPatient}
        onPatientSaved={(saved) => {
          loadPatients();
        }}
      />
    </div>
  );
};

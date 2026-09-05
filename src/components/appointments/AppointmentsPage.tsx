import React, { useEffect, useState } from 'react';
import { 
  Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, 
  Plus, CheckCircle2, XCircle, Stethoscope, User, Search
} from 'lucide-react';
import { Appointment } from '../../types/database';
import { dataService } from '../../services/dataService';
import { AppointmentModal } from './AppointmentModal';
import { useToast } from '../../context/ToastContext';

interface AppointmentsPageProps {
  onStartConsultationForPatient: (patientId: string, appointmentId?: string) => void;
  selectedDateFromExternal?: string;
}

export const AppointmentsPage: React.FC<AppointmentsPageProps> = ({
  onStartConsultationForPatient,
  selectedDateFromExternal
}) => {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(
    selectedDateFromExternal || new Date().toISOString().split('T')[0]
  );
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);

  const loadAppointments = async () => {
    setLoading(true);
    const data = await dataService.getAppointments();
    setAppointments(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleUpdateStatus = async (aptId: string, status: Appointment['status']) => {
    await dataService.updateAppointmentStatus(aptId, status);
    showToast(`Appointment status updated to ${status}`);
    loadAppointments();
  };

  // Date Navigation
  const changeDate = (days: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (viewMode === 'day' && apt.appointment_date !== currentDate) return false;
    if (statusFilter !== 'All' && apt.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const patientName = apt.patient ? `${apt.patient.first_name} ${apt.patient.last_name}`.toLowerCase() : '';
      return patientName.includes(q) || apt.appointment_type?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-teal-600" />
            Appointment Schedule
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage patient bookings, consultation queues, and doctor calendar slots
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-md transition cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Control & Date Navigation Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Date Stepper */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDate(-1)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>

          <input
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
          />

          <button
            onClick={() => changeDate(1)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>

          <button
            onClick={() => setCurrentDate(new Date().toISOString().split('T')[0])}
            className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200 transition ml-2"
          >
            Today
          </button>
        </div>

        {/* View Mode & Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg capitalize font-semibold transition ${
                  viewMode === mode ? 'bg-white text-teal-700 shadow-2xs' : 'text-slate-500'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments List / Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading appointments...</div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">No appointments found</h3>
          <p className="text-xs text-slate-400">There are no appointments scheduled for this selection.</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-teal-50 text-teal-700 font-semibold text-xs rounded-xl hover:bg-teal-100 transition"
          >
            Create New Appointment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAppointments.map((apt) => {
            const patientName = apt.patient ? `${apt.patient.first_name} ${apt.patient.last_name}` : 'Patient';
            return (
              <div
                key={apt.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-slate-100 font-bold text-slate-700 text-xs rounded-lg flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      {apt.appointment_time}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        apt.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : apt.status === 'Confirmed'
                          ? 'bg-blue-100 text-blue-700'
                          : apt.status === 'Cancelled'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h3 className="font-bold text-sm text-slate-900">{patientName}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {apt.appointment_type} • Date: {apt.appointment_date}
                    </p>
                    {apt.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-2 italic">
                        "{apt.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {apt.status !== 'Completed' && (
                    <button
                      onClick={() => onStartConsultationForPatient(apt.patient_id, apt.id)}
                      className="flex-1 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Start EMR</span>
                    </button>
                  )}

                  {apt.status === 'Scheduled' && (
                    <button
                      onClick={() => handleUpdateStatus(apt.id, 'Confirmed')}
                      className="px-2.5 py-1.5 bg-blue-50 text-blue-700 font-semibold text-xs rounded-lg hover:bg-blue-100 transition"
                    >
                      Confirm
                    </button>
                  )}

                  {apt.status !== 'Cancelled' && (
                    <button
                      onClick={() => handleUpdateStatus(apt.id, 'Cancelled')}
                      className="px-2.5 py-1.5 bg-rose-50 text-rose-700 font-semibold text-xs rounded-lg hover:bg-rose-100 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Appointment Booking Modal */}
      <AppointmentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAppointmentSaved={loadAppointments}
      />
    </div>
  );
};

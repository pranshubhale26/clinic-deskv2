import React, { useEffect, useState } from 'react';
import { 
  Users, Calendar, Stethoscope, 
  UserPlus, CalendarPlus, Clock, ArrowUpRight, 
  CheckCircle2, AlertCircle, ChevronRight, Activity, Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { Patient, Appointment, Consultation } from '../../types/database';
import { useToast } from '../../context/ToastContext';
import { ViewMode } from '../layout/Header';

interface DashboardProps {
  viewMode: ViewMode;
  setActiveTab: (tab: string) => void;
  onOpenNewPatientModal: () => void;
  onOpenNewAppointmentModal: () => void;
  onStartConsultationForPatient: (patientId: string, appointmentId?: string) => void;
  onSelectPatientDetail: (patientId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  viewMode,
  setActiveTab,
  onOpenNewPatientModal,
  onOpenNewAppointmentModal,
  onStartConsultationForPatient,
  onSelectPatientDetail
}) => {
  const { doctor } = useAuth();
  const { showToast } = useToast();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];

  const loadDashboardData = async () => {
    setLoading(true);
    const [pData, aData, cData] = await Promise.all([
      dataService.getPatients(),
      dataService.getAppointments(todayStr),
      dataService.getConsultations()
    ]);
    setPatients(pData);
    setTodayAppointments(aData);
    setConsultations(cData);
    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const pendingAppointments = todayAppointments.filter(
    (a) => a.status === 'Scheduled' || a.status === 'Confirmed'
  );

  const handleUpdateAptStatus = async (aptId: string, status: Appointment['status']) => {
    await dataService.updateAppointmentStatus(aptId, status);
    showToast(`Appointment status updated to ${status}`);
    loadDashboardData();
  };

  return (
    <div className={`dashboard-page space-y-6 pb-12 animate-in fade-in duration-200 ${viewMode === 'mobile' ? 'dashboard-mobile' : ''}`}>
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-6 text-white shadow-xl">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
          <Activity className="w-64 h-64 text-teal-400" />
        </div>

        <div className="dashboard-hero-content relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-2 border border-teal-500/30">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              Live Practice Overview
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good day, {doctor?.name || 'Doctor'}! 👋
            </h1>
            {/* <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              Here is your practice summary for today. You have{' '}
              <span className="text-teal-400 font-bold">{pendingAppointments.length} pending appointments</span> waiting for consultation.
            </p> */}
          </div>

          <div className="dashboard-actions flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={onOpenNewPatientModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-white font-semibold text-xs rounded-xl shadow-lg shadow-teal-500/25 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Patient</span>
            </button>
            <button
              onClick={onOpenNewAppointmentModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition cursor-pointer"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="dashboard-metrics grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Today's Appointments</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{todayAppointments.length}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-blue-600 font-medium">
            <span>{pendingAppointments.length} upcoming today</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Patients</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{patients.length}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-medium">
            <span>Active clinical database</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Completed Consultations</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{consultations.length}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-teal-600 font-medium">
            <span>Prescriptions & EMR saved</span>
          </div>
        </div>

      </div>

      {/* Main Content Grid: Today's Queue & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments Table / Queue */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                Today's Appointments Queue
              </h3>
              <p className="text-xs text-slate-500">Select a patient to launch consultation workspace</p>
            </div>
            <button
              onClick={() => setActiveTab('appointments')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Calendar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading appointments...</div>
          ) : todayAppointments.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No appointments scheduled for today</p>
              <button
                onClick={onOpenNewAppointmentModal}
                className="px-3.5 py-1.5 bg-teal-50 text-teal-700 font-semibold text-xs rounded-lg hover:bg-teal-100 transition"
              >
                Schedule an Appointment
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((apt) => {
                const patientName = apt.patient ? `${apt.patient.first_name} ${apt.patient.last_name}` : 'Patient';
                return (
                  <div
                    key={apt.id}
                    className="p-4 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-slate-50/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-teal-100/70 text-teal-800 flex flex-col items-center justify-center font-bold shrink-0">
                        <span className="text-xs">{apt.appointment_time}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4
                            onClick={() => apt.patient_id && onSelectPatientDetail(apt.patient_id)}
                            className="font-bold text-sm text-slate-800 hover:text-teal-600 transition cursor-pointer"
                          >
                            {patientName}
                          </h4>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
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
                        <p className="text-xs text-slate-500 mt-0.5">
                          {apt.appointment_type} • {apt.patient?.phone || 'No Phone'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {apt.status !== 'Completed' && (
                        <button
                          onClick={() => onStartConsultationForPatient(apt.patient_id, apt.id)}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>Start EMR</span>
                        </button>
                      )}

                      {apt.status === 'Scheduled' && (
                        <button
                          onClick={() => handleUpdateAptStatus(apt.id, 'Confirmed')}
                          className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs rounded-lg transition"
                        >
                          Confirm
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Panel: Quick Actions & Recent Patients */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onOpenNewPatientModal}
                className="p-3 bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 rounded-xl border border-slate-200/70 text-left transition flex flex-col gap-2 group cursor-pointer"
              >
                <UserPlus className="w-5 h-5 text-teal-600" />
                <span className="text-xs font-semibold">New Patient</span>
              </button>

              <button
                onClick={onOpenNewAppointmentModal}
                className="p-3 bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 rounded-xl border border-slate-200/70 text-left transition flex flex-col gap-2 group cursor-pointer"
              >
                <CalendarPlus className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-semibold">Book Appointment</span>
              </button>

              <button
                onClick={() => setActiveTab('consultations')}
                className="p-3 bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 rounded-xl border border-slate-200/70 text-left transition flex flex-col gap-2 group cursor-pointer"
              >
                <Stethoscope className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-semibold">New Consultation</span>
              </button>

            </div>
          </div>

          {/* Recent Patients Panel */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Recent Patients</h3>
              <button
                onClick={() => setActiveTab('patients')}
                className="text-xs text-teal-600 font-semibold hover:underline"
              >
                View All
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {patients.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectPatientDetail(p.id)}
                  className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                      {p.first_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{p.first_name} {p.last_name}</h4>
                      <p className="text-[10px] text-slate-500">{p.patient_code} • {p.blood_group || 'O+'}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

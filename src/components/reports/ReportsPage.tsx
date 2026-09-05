import React, { useEffect, useState } from 'react';
import { BarChart3, Users } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { dataService } from '../../services/dataService';
import { Appointment, Consultation, Patient } from '../../types/database';

export const ReportsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      const [patientData, appointmentData, consultationData] = await Promise.all([
        dataService.getPatients(),
        dataService.getAppointments(),
        dataService.getConsultations()
      ]);
      setPatients(patientData);
      setAppointments(appointmentData);
      setConsultations(consultationData);
      setLoading(false);
    };

    loadReports();
  }, []);

  const monthlyPatientData = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    const monthNumber = date.getMonth();
    const count = patients.filter((patient) => {
      const createdAt = new Date(patient.created_at);
      return createdAt.getFullYear() === year && createdAt.getMonth() === monthNumber;
    }).length;
    return { month, patients: count };
  });

  const appointmentStatusData = [
    { name: 'Completed', value: appointments.filter((appointment) => appointment.status === 'Completed').length, color: '#10b981' },
    { name: 'Scheduled', value: appointments.filter((appointment) => ['Scheduled', 'Confirmed'].includes(appointment.status)).length, color: '#3b82f6' },
    { name: 'Cancelled', value: appointments.filter((appointment) => appointment.status === 'Cancelled').length, color: '#f43f5e' },
    { name: 'No Show', value: appointments.filter((appointment) => appointment.status === 'No Show').length, color: '#f59e0b' }
  ].filter((item) => item.value > 0);

  const completedAppointments = appointments.filter((appointment) => appointment.status === 'Completed').length;
  const completionRate = appointments.length ? Math.round((completedAppointments / appointments.length) * 1000) / 10 : 0;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-teal-600" />
          Practice Analytics & Reports
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Live performance statistics from your patient, appointment, and consultation records
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Patients</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{loading ? '...' : patients.length}</p>
          <span className="text-xs text-slate-500 font-semibold mt-1 inline-block">Current records</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Consultation Completion Rate</span>
          <p className="text-2xl font-extrabold text-blue-700 mt-1">{loading ? '...' : `${completionRate}%`}</p>
          <span className="text-xs text-blue-600 font-semibold mt-1 inline-block">{completedAppointments} completed appointments</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Completed Consultations</span>
          <p className="text-2xl font-extrabold text-teal-700 mt-1">{loading ? '...' : consultations.length}</p>
          <span className="text-xs text-teal-600 font-semibold mt-1 inline-block">Recorded clinical sessions</span>
        </div>
      </div>

      {/* Patient Volume Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Monthly Patient Registration Volume
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyPatientData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="patients" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
      </div>

      {/* Appointment Status Pie Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
          Appointment Breakdown by Status
        </h3>

        <div className="flex flex-col md:flex-row items-center justify-around gap-6">
          <div className="h-64 w-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={appointmentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {appointmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {appointmentStatusData.map((item) => (
              <div key={item.name} className="flex items-center gap-3 text-xs font-semibold">
                <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-700 w-28">{item.name}</span>
                <span className="text-slate-900 font-extrabold">{item.value} ({appointments.length ? Math.round((item.value / appointments.length) * 100) : 0}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

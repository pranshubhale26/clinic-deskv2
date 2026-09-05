import React, { useEffect, useState } from 'react';
import { X, CalendarPlus, Save, AlertCircle } from 'lucide-react';
import { Appointment, Patient } from '../../types/database';
import { dataService } from '../../services/dataService';
import { useToast } from '../../context/ToastContext';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentSaved: () => void;
  preselectedPatientId?: string;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onAppointmentSaved,
  preselectedPatientId
}) => {
  const { showToast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [doubleBookingWarning, setDoubleBookingWarning] = useState(false);

  const [formData, setFormData] = useState({
    patient_id: preselectedPatientId || '',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '10:00 AM',
    appointment_type: 'General Checkup',
    notes: ''
  });

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'
  ];

  const appointmentTypes = [
    'General Checkup', 'Follow-up', 'Consultation', 'Emergency', 'Routine Screening', 'Vaccination'
  ];

  useEffect(() => {
    if (isOpen) {
      dataService.getPatients().then((data) => {
        setPatients(data);
        if (preselectedPatientId) {
          setFormData((prev) => ({ ...prev, patient_id: preselectedPatientId }));
        } else if (data.length > 0 && !formData.patient_id) {
          setFormData((prev) => ({ ...prev, patient_id: data[0].id }));
        }
      });
    }
  }, [isOpen, preselectedPatientId]);

  // Check double booking
  useEffect(() => {
    if (!formData.appointment_date || !formData.appointment_time) return;
    dataService.getAppointments(formData.appointment_date).then((existing) => {
      const conflict = existing.some(
        (a) => a.appointment_time === formData.appointment_time && a.status !== 'Cancelled'
      );
      setDoubleBookingWarning(conflict);
    });
  }, [formData.appointment_date, formData.appointment_time]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient_id || !formData.appointment_date || !formData.appointment_time) {
      showToast('Validation Error', 'Please fill in all required appointment details', 'error');
      return;
    }

    if (doubleBookingWarning) {
      if (!window.confirm('Warning: You already have an appointment scheduled at this time. Book anyway?')) {
        return;
      }
    }

    setLoading(true);
    try {
      await dataService.saveAppointment({
        patient_id: formData.patient_id,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        appointment_type: formData.appointment_type,
        notes: formData.notes,
        status: 'Scheduled'
      });

      showToast('Appointment Booked Successfully');
      onAppointmentSaved();
      onClose();
    } catch (err) {
      showToast('Failed to book appointment', String(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose}></div>

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center font-bold">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Schedule New Appointment</h3>
              <p className="text-xs text-slate-400">Book a slot for consultation or checkup</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Patient Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Patient *</label>
            <select
              required
              value={formData.patient_id}
              onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="">-- Choose Patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name} ({p.patient_code}) - {p.phone}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Appointment Date *</label>
              <input
                type="date"
                required
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot *</label>
              <select
                required
                value={formData.appointment_time}
                onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Double booking warning banner */}
          {doubleBookingWarning && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800 font-medium">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Double booking notice: An existing appointment is already scheduled at this time.</span>
            </div>
          )}

          {/* Appointment Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Appointment Type</label>
            <select
              value={formData.appointment_type}
              onChange={(e) => setFormData({ ...formData, appointment_type: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {appointmentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical / Reception Notes</label>
            <textarea
              rows={3}
              placeholder="e.g. Bring previous blood work reports..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Booking...' : 'Book Appointment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

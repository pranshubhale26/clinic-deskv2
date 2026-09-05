import React, { useState } from 'react';
import { Settings, User, Building2, Shield, Save, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const SettingsPage: React.FC = () => {
  const { doctor, updateDoctorState, logout, resetPassword } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'clinic' | 'account'>('profile');

  // Form state
  const [formData, setFormData] = useState({
    name: doctor?.name || '',
    phone: doctor?.phone || '',
    specialization: doctor?.specialization || '',
    qualification: doctor?.qualification || '',
    registration_number: doctor?.registration_number || '',
    clinic_name: doctor?.clinic_name || '',
    clinic_address: doctor?.clinic_address || '',
    consultation_fee: doctor?.consultation_fee || 500
  });

  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    updateDoctorState(formData);
    showToast('Clinic & Profile Settings Saved');
    setSaving(false);
  };

  const handleSendResetPassword = async () => {
    if (!doctor?.email) return;
    const { error } = await resetPassword(doctor.email);
    if (error) showToast('Password Reset Failed', error, 'error');
    else showToast('Password reset link sent to your registered email');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-teal-600" />
          Settings & Clinic Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Update doctor credentials, clinic prescription headers, and security
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition ${
            activeTab === 'profile'
              ? 'bg-white border-x border-t border-slate-200 text-teal-700 shadow-2xs border-b-2 border-b-teal-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Doctor Profile
        </button>
        <button
          onClick={() => setActiveTab('clinic')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition ${
            activeTab === 'clinic'
              ? 'bg-white border-x border-t border-slate-200 text-teal-700 shadow-2xs border-b-2 border-b-teal-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Clinic Settings
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition ${
            activeTab === 'account'
              ? 'bg-white border-x border-t border-slate-200 text-teal-700 shadow-2xs border-b-2 border-b-teal-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Account Security
        </button>
      </div>

      {/* Form Area */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 max-w-2xl">
        <form onSubmit={handleSave} className="space-y-4">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                Medical Officer Information
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Doctor Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Qualifications</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Medical Registration No.</label>
                  <input
                    type="text"
                    value={formData.registration_number}
                    onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clinic' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                Clinic & Prescription Branding
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinic Name *</label>
                <input
                  type="text"
                  required
                  value={formData.clinic_name}
                  onChange={(e) => setFormData({ ...formData, clinic_name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinic Full Address</label>
                <textarea
                  rows={3}
                  value={formData.clinic_address}
                  onChange={(e) => setFormData({ ...formData, clinic_address: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Standard Consultation Fee (₹)</label>
                <input
                  type="number"
                  value={formData.consultation_fee}
                  onChange={(e) => setFormData({ ...formData, consultation_fee: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-teal-800 focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                Account & Authentication
              </h3>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-800 block">Registered Doctor Email</span>
                <p className="text-slate-600 font-mono">{doctor?.email}</p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleSendResetPassword}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
                >
                  Send Password Reset Email
                </button>

                <button
                  type="button"
                  onClick={logout}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {activeTab !== 'account' && (
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

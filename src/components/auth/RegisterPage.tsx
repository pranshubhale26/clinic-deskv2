import React, { useState } from 'react';
import { Activity, Mail, Lock, Phone, ArrowRight, UserRound, Stethoscope } from 'lucide-react';
import { UserRole } from '../../types/database';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    qualification: 'MBBS, MD',
    specialization: 'General Physician',
    clinicName: ''
  });

  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState<UserRole>('doctor');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || (accountType === 'doctor' && !formData.clinicName)) {
      showToast('Validation Error', `Please complete all required ${accountType} details`, 'error');
      return;
    }

    setLoading(true);
    const { error } = await register({ ...formData, role: accountType });
    setLoading(false);

    if (error) {
      showToast('Registration Error', error, 'error');
    } else {
      showToast(`${accountType === 'doctor' ? 'Doctor' : 'Receptionist'} account created successfully! Welcome to MediEMR`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-slate-100 animate-in fade-in duration-200">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 text-white flex items-center justify-center font-bold mx-auto shadow-lg shadow-teal-500/30">
            <Activity className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Register Medical Practice
          </h1>
          <p className="text-xs text-slate-400">Join MediEMR for digital practice & prescription workflows</p>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800 rounded-xl">
          {(['doctor', 'receptionist'] as const).map((type) => (
            <button key={type} type="button" onClick={() => setAccountType(type)} className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg ${accountType === type ? 'bg-teal-500 text-white' : 'text-slate-400'}`}>
              {type === 'doctor' ? <Stethoscope className="w-3.5 h-3.5" /> : <UserRound className="w-3.5 h-3.5" />}
              {type === 'doctor' ? 'Doctor' : 'Receptionist'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">{accountType === 'doctor' ? 'Doctor' : 'Receptionist'} Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Vikram Singh"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="doctor@clinic.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Specialization</label>
              <input
                type="text"
                placeholder="General Physician / Cardiologist"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Qualifications</label>
              <input
                type="text"
                placeholder="MBBS, MD"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {accountType === 'doctor' && <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Clinic Name *</label>
              <input
                type="text"
                required
                placeholder="Apex Healthcare Clinic"
                value={formData.clinicName}
                onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Creating Account...' : `Complete ${accountType === 'doctor' ? 'Doctor' : 'Receptionist'} Registration`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          Already registered?{' '}
          <button onClick={onSwitchToLogin} className="font-bold text-teal-400 hover:underline cursor-pointer">
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
};

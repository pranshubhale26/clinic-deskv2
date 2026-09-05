import React from 'react';
import { 
  LayoutDashboard, Users, Calendar, Stethoscope, 
  FileText, BarChart3, Settings, 
  LogOut, Activity, UserCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import { ViewMode } from './Header';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  viewMode?: ViewMode;
}

export const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'consultations', label: 'EMR Workspace', icon: Stethoscope },
  { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
  { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Clinic Settings', icon: Settings }
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, viewMode = 'auto' }) => {
  const { doctor, logout } = useAuth();

  const visibilityClass = 
    viewMode === 'desktop' ? 'flex' : 
    viewMode === 'mobile' ? 'hidden' : 
    'hidden md:flex';

  return (
    <aside className={`${visibilityClass} flex-col w-64 bg-slate-900 text-slate-300 min-h-screen border-r border-slate-800 shrink-0 sticky top-0 h-screen select-none`}>
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white">
          <Activity className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-1">
            Medi<span className="text-teal-400">EMR</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">Clinic & Health System</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-teal-500 text-white shadow-md shadow-teal-500/25 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Doctor Card & Logout Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/50">
        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 mb-2 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center text-sm font-bold shrink-0">
            {doctor?.name ? doctor.name.replace('Dr. ', '').charAt(0) : 'D'}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-white truncate">{doctor?.name || 'Dr. Account'}</h4>
            <p className="text-[10px] text-slate-400 truncate">{doctor?.specialization || 'Physician'}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

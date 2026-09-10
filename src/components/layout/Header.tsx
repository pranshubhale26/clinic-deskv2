import React from 'react';
import {
  Search,
  Building2,
  ChevronDown,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { navItems } from './Sidebar';

export type ViewMode = 'auto' | 'desktop' | 'mobile';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickPatientSearch?: () => void;

  // Kept for compatibility with the rest of the application.
  // The View Mode switcher itself has been removed.
  viewMode?: ViewMode;
  setViewMode?: (mode: ViewMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickPatientSearch,
}) => {
  const { doctor, receptionist, role } = useAuth();
  const currentNav = navItems.find((n) => n.id === activeTab);

  const displayName =
    role === 'receptionist'
      ? receptionist?.name || 'Receptionist'
      : doctor?.name || 'Dr. Account';

  const displayInitial = displayName
    .replace('Dr. ', '')
    .charAt(0);

  const clinicName =
    doctor?.clinic_name || 'MediEMR Clinic Workspace';

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">

      {/* Page Title & Mobile Brand Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex md:hidden items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-800 capitalize tracking-tight flex items-center gap-2">
            {currentNav?.label || 'Dashboard'}
          </h2>

          <p className="text-xs text-slate-500 hidden sm:block">
            {clinicName}
          </p>
        </div>
      </div>

      {/* Global Quick Patient Search & Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Quick Search Button - Desktop */}
        <button
          onClick={onOpenQuickPatientSearch}
          className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-500 text-xs font-medium rounded-full transition cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />

          <span>Search patients...</span>

          <kbd className="hidden lg:inline-block px-1.5 py-0.5 bg-white border border-slate-300 text-[10px] rounded font-mono text-slate-400 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Quick Search Button - Mobile */}
        <button
          onClick={onOpenQuickPatientSearch}
          className="flex md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
          title="Search Patients"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Clinic Name Tag */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-200/60 rounded-lg text-xs font-semibold">
          <Building2 className="w-3.5 h-3.5 text-teal-600" />

          <span className="truncate max-w-[160px]">
            {clinicName}
          </span>
        </div>

        {/* Doctor / Receptionist Header Profile */}
        <button
          onClick={() => setActiveTab('settings')}
          className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition text-left cursor-pointer"
        >
          <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
            {displayInitial}
          </div>

          <span className="text-xs font-semibold text-slate-700 hidden md:block">
            {displayName}
          </span>

          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
        </button>

      </div>
    </header>
  );
};
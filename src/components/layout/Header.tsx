import React from 'react';
import { Search, Building2, ChevronDown, Activity, Monitor, Smartphone, Laptop } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { navItems } from './Sidebar';

export type ViewMode = 'auto' | 'desktop' | 'mobile';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickPatientSearch?: () => void;
  viewMode?: ViewMode;
  setViewMode?: (mode: ViewMode) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  setActiveTab, 
  onOpenQuickPatientSearch,
  viewMode = 'auto',
  setViewMode
}) => {
  const { doctor } = useAuth();
  const currentNav = navItems.find((n) => n.id === activeTab);

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
            {doctor?.clinic_name || 'MediEMR Clinic Workspace'}
          </p>
        </div>
      </div>

      {/* Global Quick Patient Search & Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search Button (Full on Desktop, Icon-only on Mobile) */}
        {viewMode !== 'mobile' ? (
          <>
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
            <button
              onClick={onOpenQuickPatientSearch}
              className="flex md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
              title="Search Patients"
            >
              <Search className="w-5 h-5" />
            </button>
          </>
        ) : (
          <button
            onClick={onOpenQuickPatientSearch}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
            title="Search Patients"
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        {/* View Mode Switcher (Desktop vs Mobile Toggle) */}
        {setViewMode && (
          <div className="flex items-center bg-slate-100/90 border border-slate-200/80 p-0.5 rounded-full shadow-2xs text-xs shrink-0">
            <button
              onClick={() => setViewMode('auto')}
              title="Auto / Responsive Mode"
              className={`p-1.5 sm:px-2 sm:py-1 rounded-full flex items-center gap-1 transition cursor-pointer text-[11px] font-medium ${
                viewMode === 'auto'
                  ? 'bg-white text-slate-800 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              {viewMode !== 'mobile' && <span className="hidden xl:inline">Auto</span>}
            </button>
            <button
              onClick={() => setViewMode('desktop')}
              title="Switch to Desktop Mode"
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-full flex items-center gap-1 transition cursor-pointer text-[11px] font-medium ${
                viewMode === 'desktop'
                  ? 'bg-teal-600 text-white shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              {viewMode !== 'mobile' && <span className="hidden sm:inline">Desktop</span>}
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              title="Switch to Mobile Mode"
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-full flex items-center gap-1 transition cursor-pointer text-[11px] font-medium ${
                viewMode === 'mobile'
                  ? 'bg-teal-600 text-white shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              {viewMode !== 'mobile' && <span className="hidden sm:inline">Mobile</span>}
            </button>
          </div>
        )}

        {/* Clinic Name Tag */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-200/60 rounded-lg text-xs font-semibold">
          <Building2 className="w-3.5 h-3.5 text-teal-600" />
          <span className="truncate max-w-[160px]">{doctor?.clinic_name || 'Clinic Care'}</span>
        </div>

        {/* Doctor Header Profile */}
        <button
          onClick={() => setActiveTab('settings')}
          className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition text-left cursor-pointer"
        >
          <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
            {doctor?.name ? doctor.name.replace('Dr. ', '').charAt(0) : 'D'}
          </div>
          <span className="text-xs font-semibold text-slate-700 hidden md:block">
            {doctor?.name || 'Dr. Account'}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
        </button>
      </div>
    </header>
  );
};

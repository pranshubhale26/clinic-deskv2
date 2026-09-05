import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, Calendar, Stethoscope, 
  Menu, X, 
  LogOut, Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { navItems } from './Sidebar';

import { ViewMode } from './Header';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  viewMode?: ViewMode;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab, viewMode = 'auto' }) => {
  const { doctor, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const visibilityClass = 
    viewMode === 'desktop' ? 'hidden' : 
    viewMode === 'mobile' ? 'block' : 
    'md:hidden';

  const mainTabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'appointments', label: 'Calendar', icon: Calendar },
    { id: 'consultations', label: 'EMR', icon: Stethoscope }
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* Bottom Sticky Mobile Navbar */}
      <div className={`mobile-nav ${visibilityClass} fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-2 flex items-center justify-around shadow-lg`}>
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
                isActive ? 'text-teal-600 font-bold' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-teal-600 stroke-[2.5]' : ''}`} />
              <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
            </button>
          );
        })}

        {/* Hamburger Menu Toggle */}
        <button
          onClick={() => setDrawerOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
            drawerOpen ? 'text-teal-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">More</span>
        </button>
      </div>

      {/* Slide-over Mobile Menu Drawer */}
      {drawerOpen && (
        <div className={`${visibilityClass} fixed inset-0 z-50 flex`}>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setDrawerOpen(false)}
          ></div>

          {/* Drawer Content */}
          <div className="relative ml-auto w-4/5 max-w-xs bg-slate-900 text-slate-300 h-full flex flex-col p-5 shadow-2xl z-10 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="font-bold text-white text-base">MediEMR</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-4 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? 'bg-teal-500 text-white font-semibold shadow-md'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-800">
              <div className="mb-3 p-3 rounded-xl bg-slate-800/80 text-xs">
                <p className="font-semibold text-white">{doctor?.name}</p>
                <p className="text-[10px] text-slate-400">{doctor?.clinic_name}</p>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-500/10 text-rose-400 font-semibold rounded-xl text-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

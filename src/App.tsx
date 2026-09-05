import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layout Components
import { Sidebar } from './components/layout/Sidebar';
import { Header, ViewMode } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';

// Auth Components
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';

// Module Page Components
import { Dashboard } from './components/dashboard/Dashboard';
import { PatientsPage } from './components/patients/PatientsPage';
import { AppointmentsPage } from './components/appointments/AppointmentsPage';
import { ConsultationWorkspace } from './components/EMR/ConsultationWorkspace';
import { PrescriptionsPage } from './components/prescriptions/PrescriptionsPage';
import { ReportsPage } from './components/reports/ReportsPage';
import { SettingsPage } from './components/settings/SettingsPage';

// Modals
import { PatientFormModal } from './components/patients/PatientFormModal';
import { AppointmentModal } from './components/appointments/AppointmentModal';
import { QuickPatientSearchModal } from './components/patients/QuickPatientSearchModal';
import { Patient, Consultation } from './types/database';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // View Mode state (Auto / Desktop / Mobile) with localStorage persistence
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('mediemr_view_mode');
    return (saved === 'desktop' || saved === 'mobile' || saved === 'auto') ? (saved as ViewMode) : 'auto';
  });

  useEffect(() => {
    localStorage.setItem('mediemr_view_mode', viewMode);
  }, [viewMode]);

  // Inter-module deep link parameters
  const [activeConsultationPatientId, setActiveConsultationPatientId] = useState<string | null>(null);
  const [activeConsultationAppointmentId, setActiveConsultationAppointmentId] = useState<string | null>(null);
  const [selectedPatientIdForDirectory, setSelectedPatientIdForDirectory] = useState<string | null>(null);

  // Global Modals State
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showQuickSearchModal, setShowQuickSearchModal] = useState(false);

  // Global Ctrl+K / Cmd+K listener for quick patient search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowQuickSearchModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-400">Loading MediEMR System...</p>
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <LoginPage onSwitchToRegister={() => setAuthMode('register')} />
    ) : (
      <RegisterPage onSwitchToLogin={() => setAuthMode('login')} />
    );
  }

  // Navigation handlers
  const handleStartConsultationForPatient = (patientId: string, appointmentId?: string) => {
    setActiveConsultationPatientId(patientId);
    setActiveConsultationAppointmentId(appointmentId || null);
    setActiveTab('consultations');
  };

  const handleSelectPatientDetail = (patientId: string) => {
    setSelectedPatientIdForDirectory(patientId);
    setActiveTab('patients');
  };

  const rootContainerClass = 
    viewMode === 'desktop' ? 'min-h-screen bg-slate-50 flex flex-row font-sans text-slate-900' :
    viewMode === 'mobile' ? 'mobile-shell relative min-h-screen bg-slate-900/90 flex flex-col font-sans text-slate-900 items-center py-0 md:py-6' :
    'min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900';

  const workspaceColumnClass = 
    viewMode === 'desktop' ? 'flex-1 flex flex-col min-w-0 min-h-screen pb-0' :
    viewMode === 'mobile' ? 'w-full max-w-md bg-slate-50 min-h-screen md:min-h-[820px] md:rounded-3xl md:shadow-2xl md:border md:border-slate-800 overflow-hidden flex flex-col pb-20 relative' :
    'flex-1 flex flex-col min-w-0 min-h-screen pb-16 md:pb-0';

  return (
    <div className={rootContainerClass}>
      {/* Sidebar remains available in the app but is excluded from printed documents. */}
      <div className="no-print">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} viewMode={viewMode} />
      </div>

      {/* Main Workspace Column */}
      <div className={workspaceColumnClass}>
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenQuickPatientSearch={() => setShowQuickSearchModal(true)}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Page Content Container */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              viewMode={viewMode}
              setActiveTab={setActiveTab}
              onOpenNewPatientModal={() => setShowPatientModal(true)}
              onOpenNewAppointmentModal={() => setShowAppointmentModal(true)}
              onStartConsultationForPatient={handleStartConsultationForPatient}
              onSelectPatientDetail={handleSelectPatientDetail}
            />
          )}

          {activeTab === 'patients' && (
            <PatientsPage
              onStartConsultationForPatient={handleStartConsultationForPatient}
              onScheduleAppointmentForPatient={(patientId) => setShowAppointmentModal(true)}
              selectedPatientIdFromExternal={selectedPatientIdForDirectory}
              onClearSelectedPatientFromExternal={() => setSelectedPatientIdForDirectory(null)}
            />
          )}

          {activeTab === 'appointments' && (
            <AppointmentsPage
              onStartConsultationForPatient={handleStartConsultationForPatient}
            />
          )}

          {activeTab === 'consultations' && (
            <ConsultationWorkspace
              initialPatientId={activeConsultationPatientId}
              initialAppointmentId={activeConsultationAppointmentId}
              onConsultationCompleted={() => {
                setActiveConsultationPatientId(null);
                setActiveConsultationAppointmentId(null);
                setActiveTab('dashboard');
              }}
            />
          )}

          {activeTab === 'prescriptions' && <PrescriptionsPage />}

          {activeTab === 'reports' && <ReportsPage />}

          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} viewMode={viewMode} />

      {/* Global Quick Patient Search Modal */}
      <QuickPatientSearchModal
        isOpen={showQuickSearchModal}
        onClose={() => setShowQuickSearchModal(false)}
        onSelectPatient={(patient) => handleSelectPatientDetail(patient.id)}
      />

      {/* Register Patient Modal */}
      <PatientFormModal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        onPatientSaved={(saved) => {
          // If in directory, list updates automatically
        }}
      />

      {/* Book Appointment Modal */}
      <AppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        onAppointmentSaved={() => {
          // Appointments list updates
        }}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

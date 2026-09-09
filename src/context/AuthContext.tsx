import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Doctor, Receptionist, UserRole } from '../types/database';
import { dataService } from '../services/dataService';

interface AuthContextType {
  user: any | null;
  doctor: Doctor | null;
  receptionist: Receptionist | null;
  role: UserRole;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (data: {
    role: UserRole;
    email: string;
    password: string;
    name: string;
    specialization: string;
    qualification: string;
    clinicName: string;
    phone: string;
    doctorId?: string;
  }) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateDoctorState: (updated: Partial<Doctor>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [receptionist, setReceptionist] = useState<Receptionist | null>(null);
  const [role, setRole] = useState<UserRole>('doctor');
  const [loading, setLoading] = useState(true);

  // Resolve profile after a Supabase auth session is established
  const resolveProfile = async (userId: string) => {
    const docProfile = await dataService.getDoctorProfile(userId);
    if (docProfile && docProfile.auth_user_id === userId) {
      setDoctor(docProfile);
      setReceptionist(null);
      setRole('doctor');
    } else {
      const recProfile = await dataService.getReceptionistProfile(userId);
      if (recProfile) {
        setReceptionist(recProfile);
        setDoctor(null);
        setRole('receptionist');
      }
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (isSupabaseConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await resolveProfile(session.user.id);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            setUser(session.user);
            await resolveProfile(session.user.id);
          } else {
            setUser(null);
            setDoctor(null);
            setReceptionist(null);
            setRole('doctor');
          }
          setLoading(false);
        });

        return () => subscription.unsubscribe();
      } else {
        // Demo mode: auto-login as doctor
        const defaultDoc = await dataService.getDoctorProfile('user-101');
        setUser({ id: 'user-101', email: defaultDoc.email });
        setDoctor(defaultDoc);
        setReceptionist(null);
        setRole('doctor');
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      if (data.user) {
        setUser(data.user);
        await resolveProfile(data.user.id);
      }
      return { error: null };
    }

    // Demo mode: check doctor first
    const currentDoc = await dataService.getDoctorProfile('user-101');
    if (email === currentDoc.email) {
      setUser({ id: currentDoc.auth_user_id, email });
      setDoctor(currentDoc);
      setReceptionist(null);
      setRole('doctor');
      return { error: null };
    }

    // Demo mode: check receptionists by credentials
    const rec = await dataService.getReceptionistByCredentials(email, password);
    if (rec) {
      setUser({ id: rec.auth_user_id, email });
      setReceptionist(rec);
      setDoctor(null);
      setRole('receptionist');
      return { error: null };
    }

    return { error: 'Invalid email or password. Please check your credentials.' };
  };

  const register = async (data: {
    role: UserRole;
    email: string;
    password: string;
    name: string;
    specialization: string;
    qualification: string;
    clinicName: string;
    phone: string;
    doctorId?: string;
  }) => {
    if (isSupabaseConfigured) {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            role: data.role,
            name: data.name,
            specialization: data.specialization,
            qualification: data.qualification,
            clinic_name: data.clinicName,
            phone: data.phone
          }
        }
      });
      if (error) return { error: error.message };
      if (authData.user) {
        setUser(authData.user);
      }
      return { error: null };
    }

    // Demo Mode registration simulation
    if (data.role === 'receptionist') {
      const doctorProfile = await dataService.getDoctorProfile('user-101');
      const newReceptionist = await dataService.saveReceptionist({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        doctor_id: data.doctorId || doctorProfile.id
      });
      setUser({ id: newReceptionist.auth_user_id, email: data.email });
      setReceptionist(newReceptionist);
      setDoctor(null);
      setRole('receptionist');
      return { error: null };
    }

    const newDoc: Doctor = {
      id: `doc-${Date.now()}`,
      auth_user_id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      specialization: data.specialization,
      qualification: data.qualification,
      registration_number: `REG-${Math.floor(100000 + Math.random() * 900000)}`,
      clinic_name: data.clinicName,
      clinic_address: 'City Medical Hub, Main Street',
      consultation_fee: 500,
      created_at: new Date().toISOString()
    };
    await dataService.updateDoctorProfile(newDoc);
    setUser({ id: newDoc.auth_user_id, email: data.email });
    setDoctor(newDoc);
    setRole('doctor');
    return { error: null };
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setDoctor(null);
    setReceptionist(null);
    setRole('doctor');
  };

  const resetPassword = async (email: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return { error: error.message };
    }
    return { error: null };
  };

  const updateDoctorState = (updated: Partial<Doctor>) => {
    if (doctor) {
      const newDoc = { ...doctor, ...updated };
      setDoctor(newDoc);
      dataService.updateDoctorProfile(newDoc);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        doctor,
        receptionist,
        role,
        loading,
        login,
        register,
        logout,
        resetPassword,
        updateDoctorState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Doctor } from '../types/database';
import { dataService } from '../services/dataService';

interface AuthContextType {
  user: any | null;
  doctor: Doctor | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    specialization: string;
    qualification: string;
    clinicName: string;
    phone: string;
  }) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateDoctorState: (updated: Partial<Doctor>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (isSupabaseConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const profile = await dataService.getDoctorProfile(session.user.id);
          setDoctor(profile);
        }
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            setUser(session.user);
            const profile = await dataService.getDoctorProfile(session.user.id);
            setDoctor(profile);
          } else {
            setUser(null);
            setDoctor(null);
          }
          setLoading(false);
        });

        return () => subscription.unsubscribe();
      } else {
        // Fallback default logged-in session for rapid preview mode
        const defaultDoc = await dataService.getDoctorProfile('user-101');
        setUser({ id: 'user-101', email: defaultDoc.email });
        setDoctor(defaultDoc);
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
        const profile = await dataService.getDoctorProfile(data.user.id);
        setDoctor(profile);
      }
      return { error: null };
    }

    // Demo Mode login check
    const currentDoc = await dataService.getDoctorProfile('user-101');
    setUser({ id: currentDoc.auth_user_id, email });
    setDoctor(currentDoc);
    return { error: null };
  };

  const register = async (data: {
    email: string;
    password: string;
    name: string;
    specialization: string;
    qualification: string;
    clinicName: string;
    phone: string;
  }) => {
    if (isSupabaseConfigured) {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
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
    return { error: null };
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setDoctor(null);
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

import { create } from 'zustand';
import { User, Doctor, Patient } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  doctor: Doctor | null;
  patient: Patient | null;
  isAuthenticated: boolean;
  isLoggingOut: boolean;
  setAuth: (user: User, token: string, doctor?: Doctor, patient?: Patient) => void;
  logout: () => void;
  triggerLogoutWithAnimation: (onComplete: () => void) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const savedToken = localStorage.getItem('access_token');
  const savedUser = localStorage.getItem('user_data');
  
  let initialUser: User | null = null;
  let isAuth = false;

  if (savedToken && savedUser) {
    try {
      initialUser = JSON.parse(savedUser);
      isAuth = true;
    } catch {
      initialUser = null;
      isAuth = false;
    }
  }

  return {
    user: initialUser,
    accessToken: savedToken,
    doctor: null,
    patient: null,
    isAuthenticated: isAuth,
    isLoggingOut: false,

    setAuth: (user, token, doctor, patient) => {
      localStorage.setItem('access_token', token);
      localStorage.setItem('user_data', JSON.stringify(user));
      set({
        user,
        accessToken: token,
        doctor: doctor || null,
        patient: patient || null,
        isAuthenticated: true,
        isLoggingOut: false,
      });
    },

    logout: () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      set({ user: null, accessToken: null, doctor: null, patient: null, isAuthenticated: false, isLoggingOut: false });
    },

    triggerLogoutWithAnimation: (onComplete) => {
      set({ isLoggingOut: true });
      setTimeout(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
        set({ user: null, accessToken: null, doctor: null, patient: null, isAuthenticated: false, isLoggingOut: false });
        onComplete();
      }, 2300);
    },
  };
});

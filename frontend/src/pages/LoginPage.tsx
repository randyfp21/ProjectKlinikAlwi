import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Hospital, LogIn, Lock, User, AlertCircle, ArrowLeft, Sun, Moon, Heart, Activity, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { useThemeStore } from '../store/useThemeStore';
import { useCMSStore } from '../store/useCMSStore';
import { LanguageSelector } from '../components/LanguageSelector';
import { apiClient } from '../api/client';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccessLoading, setIsSuccessLoading] = useState(false);
  const [error, setError] = useState('');
  const [loggedInUserRole, setLoggedInUserRole] = useState('');
  const [loggedInUserName, setLoggedInUserName] = useState('');

  const { setAuth } = useAuthStore();
  const { t } = useLanguageStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { clinicName, clinicTagline, clinicLogoIcon, fetchCMSFromDB } = useCMSStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCMSFromDB();
  }, [fetchCMSFromDB]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiClient.post('/auth/login', { username, password });
      if (res.data.success) {
        const { user, tokens, doctor, patient } = res.data.data;
        setAuth(user, tokens.access_token, doctor, patient);
        setLoggedInUserRole(user.role);
        setLoggedInUserName(user.full_name);
        setLoading(false);
        setIsSuccessLoading(true);

        // Wait for Medical ECG Animation sequence before navigating!
        setTimeout(() => {
          navigate('/dashboard');
        }, 2200);
        return;
      } else {
        setError(res.data.message || 'Username/Email atau Password salah.');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Gagal login. Username/Email atau Password salah!';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 relative font-sans transition-colors">
      <div className="absolute top-6 left-6 flex items-center gap-4">
        <Link
          to="/"
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" /> {t('welcome')}
        </Link>
      </div>

      <div className="absolute top-6 right-6 flex items-center gap-2">
        <LanguageSelector />
        <button
          onClick={toggleTheme}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700 shadow-xs"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 transition-colors">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-sky-500/20 overflow-hidden p-1">
            {clinicLogoIcon && (clinicLogoIcon.startsWith('/') || clinicLogoIcon.startsWith('http') || clinicLogoIcon.startsWith('data:')) ? (
              <img src={clinicLogoIcon} alt={clinicName} className="w-full h-full object-contain rounded-xl" />
            ) : (
              <Hospital className="w-7 h-7" />
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{clinicName}</h1>
          <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold">{t('loginTitle')} - {clinicTagline}</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">{t('usernameLabel')}</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Input username"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">{t('passwordLabel')}</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition"
          >
            <LogIn className="w-4 h-4" /> {loading ? 'Authenticating...' : t('btnSignIn')}
          </button>
        </form>

        {/* Quick fill demo buttons */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">{t('quickFillTitle')}</span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => quickFill('superadmin', 'password123')}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sky-600 dark:text-sky-400 font-medium text-left border border-slate-200 dark:border-slate-700"
            >
              🔑 Super Admin
            </button>
            <button
              type="button"
              onClick={() => quickFill('doctor_alwi', 'password123')}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-teal-600 dark:text-teal-400 font-medium text-left border border-slate-200 dark:border-slate-700"
            >
              🩺 Doctor (dr. Alwi)
            </button>
            <button
              type="button"
              onClick={() => quickFill('pharmacist', 'password123')}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 font-medium text-left border border-slate-200 dark:border-slate-700"
            >
              💊 Pharmacist
            </button>
            <button
              type="button"
              onClick={() => quickFill('patient_budi', 'password123')}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 font-medium text-left border border-slate-200 dark:border-slate-700"
            >
              👤 Patient (Budi)
            </button>
          </div>
        </div>

        <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
          {t('noAccountYet')}{' '}
          <Link to="/register" className="text-sky-600 dark:text-sky-400 font-bold hover:underline">
            {t('registerHere')}
          </Link>
        </div>
      </div>

      {/* COOL MEDICAL THEMED LOADING SCREEN OVERLAY ON SUCCESSFUL LOGIN (LIGHT MODE ELEGANCE) */}
      {isSuccessLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
            {/* Ambient Medical Glow Background */}
            <div className="absolute -top-20 -left-20 w-48 h-48 bg-sky-500/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-teal-500/15 rounded-full blur-3xl" />

            {/* Pulsing Heart & Medical Icon */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-sky-500/15 animate-ping" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-500 via-teal-500 to-emerald-400 text-white flex items-center justify-center shadow-xl shadow-sky-500/25 animate-heartbeat">
                <Heart className="w-10 h-10 fill-white" />
              </div>
            </div>

            {/* Medical Dynamic ECG Monitor Pulse Line */}
            <div className="py-3 px-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-inner">
              <div className="flex items-center justify-between text-[10px] font-mono font-extrabold text-sky-600 dark:text-teal-400">
                <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-teal-500 animate-pulse" /> MONITOR VITAL EKG MEDIS</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">78 BPM • NORMAL</span>
              </div>
              <svg className="w-full h-12 text-teal-500 dark:text-teal-400" viewBox="0 0 500 100" fill="none">
                <path
                  d="M0,50 L120,50 L140,20 L160,80 L180,10 L200,90 L220,50 L340,50 L360,20 L380,80 L400,10 L420,90 L440,50 L500,50"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-ecg"
                />
              </svg>
            </div>

            {/* Success Status Text */}
            <div className="space-y-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Otentikasi Medis Berhasil
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Selamat Datang, {loggedInUserName}!</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-center gap-1 font-medium">
                <ShieldCheck className="w-4 h-4 text-sky-500" /> Peran: <strong className="text-sky-600 dark:text-teal-300">{loggedInUserRole}</strong> — Menyiapkan Portal Klinik...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

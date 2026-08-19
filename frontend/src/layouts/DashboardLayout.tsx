import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useAuthStore } from '../store/useAuthStore';
import { Activity, HeartOff, Frown, LogOut, ShieldAlert } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { isLoggingOut, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      <div className={`flex-1 transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'} flex flex-col min-w-0`}>
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-8 w-full mx-auto space-y-6">
          <div key={location.pathname} className="animate-page-transition">
            <Outlet />
          </div>
        </main>
      </div>

      {/* SAD GEN-Z MEDICAL THEMED LOGOUT LOADING OVERLAY (LIGHT MODE ELEGANCE) */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
            {/* Ambient Sad Glow */}
            <div className="absolute -top-20 -left-20 w-48 h-48 bg-rose-500/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl" />

            {/* Sad Broken Heart Icon */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-rose-500/15 animate-ping" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-500 text-white flex items-center justify-center shadow-xl shadow-rose-500/25 animate-sad-heart">
                <HeartOff className="w-10 h-10 stroke-[2.2]" />
              </div>
            </div>

            {/* Sad EKG Flatline Monitor */}
            <div className="py-3 px-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-inner">
              <div className="flex items-center justify-between text-[10px] font-mono font-extrabold text-rose-600 dark:text-rose-400">
                <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-rose-500 animate-pulse" /> MONITOR EKG — PASIEN/STAFF OFFLINE</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20">0 BPM • FLATLINE 💔</span>
              </div>
              <svg className="w-full h-12 text-rose-500" viewBox="0 0 500 100" fill="none">
                <path
                  d="M0,50 L100,50 L110,48 L120,52 L130,50 L500,50"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-ecg-flatline"
                />
              </svg>
            </div>

            {/* Sad Gen Z Copy & Status */}
            <div className="space-y-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs font-black uppercase tracking-wider">
                <Frown className="w-4 h-4 text-rose-500" /> Beneran Mau Tinggalin Klinik? 🥺
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Yakin Mau Out, {user?.full_name?.split(' ')[0] || 'Bro'}? 💔</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                Detak jantung EKG-nya langsung flatline nih... Jangan lupa balik lagi ya, kesehatanmu nomor 1! ✨🩺
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

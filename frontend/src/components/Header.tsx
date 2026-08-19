import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Search, ShieldCheck, Sun, Moon, ChevronDown, Settings, Globe, LogOut, BarChart3, ShieldAlert, Database, Monitor, Gift } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { useThemeStore } from '../store/useThemeStore';
import { LanguageSelector } from './LanguageSelector';

interface HeaderProps {
  onOpenSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSidebar }) => {
  const { user, logout } = useAuthStore();
  const { t } = useLanguageStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdminOrSuper = user?.role === 'Super Admin' || user?.role === 'Admin';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative hidden md:block w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500 transition"
          />
        </div>
      </div>

      {/* Right Header Controls */}
      <div className="flex items-center gap-3">
        {/* Dark/Light Mode Switcher */}
        <button
          onClick={toggleTheme}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700/60"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Realtime API Connection Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {t('apiOnline')}
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
        </button>

        {/* User Profile Dropdown Pill */}
        <div className="relative border-l border-slate-200 dark:border-slate-800 pl-3" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-teal-400 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-sky-500/20 shrink-0">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">{user?.full_name}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3 text-sky-500" /> {user?.role}
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-2">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate">{user?.full_name}</p>
                <p className="text-[10px] text-sky-500 font-semibold">{user?.role}</p>
              </div>

              {/* Language Selector Inside Profile Dropdown */}
              <div className="px-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                <LanguageSelector />
              </div>

              {/* Admin & Super Admin Profile Menu Items */}
              {isAdminOrSuper && (
                <div className="py-1 border-b border-slate-100 dark:border-slate-800">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    SISTEM & MANAGEMENT
                  </div>
                  <Link
                    to="/dashboard/promos-articles"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800/80 hover:text-sky-600 dark:hover:text-sky-400 transition"
                  >
                    <Gift className="w-4 h-4 text-amber-500" /> Artikel & Promo Kesehatan
                  </Link>
                  <Link
                    to="/dashboard/cms"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800/80 hover:text-sky-600 dark:hover:text-sky-400 transition"
                  >
                    <Globe className="w-4 h-4 text-sky-500" /> CMS & Landing Page
                  </Link>
                  <Link
                    to="/dashboard/tariffs"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800/80 hover:text-sky-600 dark:hover:text-sky-400 transition"
                  >
                    <Settings className="w-4 h-4 text-teal-500" /> Pengaturan Tarif Klinik
                  </Link>
                  <Link
                    to="/dashboard/reports"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800/80 hover:text-sky-600 dark:hover:text-sky-400 transition"
                  >
                    <BarChart3 className="w-4 h-4 text-indigo-500" /> Laporan & Analytics
                  </Link>
                  {user?.role === 'Super Admin' && (
                    <Link
                      to="/public-queue-monitor"
                      target="_blank"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50/80 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition border-y border-sky-100 dark:border-sky-900/40 my-1"
                    >
                      <Monitor className="w-4 h-4 text-sky-500 animate-pulse" /> Layar Monitor Antrean (Public TV)
                    </Link>
                  )}
                  {user?.role === 'Super Admin' && (
                    <Link
                      to="/dashboard/master-data"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800/80 hover:text-sky-600 dark:hover:text-sky-400 transition"
                    >
                      <Database className="w-4 h-4 text-sky-500" /> Pusat Master Data
                    </Link>
                  )}
                  {user?.role === 'Super Admin' && (
                    <Link
                      to="/dashboard/audit-logs"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800/80 hover:text-sky-600 dark:hover:text-sky-400 transition"
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-500" /> System Audit Logs
                    </Link>
                  )}
                </div>
              )}

              {/* Logout Action */}
              <div className="pt-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                >
                  <LogOut className="w-4 h-4" /> Keluar Dari Akun (Logout)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

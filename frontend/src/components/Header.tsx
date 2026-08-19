import React from 'react';
import { Menu, Bell, Search, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { useThemeStore } from '../store/useThemeStore';
import { LanguageSelector } from './LanguageSelector';

interface HeaderProps {
  onOpenSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSidebar }) => {
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const { isDarkMode, toggleTheme } = useThemeStore();

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
        {/* Language Selector ID / EN */}
        <LanguageSelector />

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

        {/* User Pill */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="text-right hidden md:block">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{user?.full_name}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-end gap-1">
              <ShieldCheck className="w-3 h-3 text-sky-500" /> {user?.role}
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-teal-400 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-sky-500/20">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

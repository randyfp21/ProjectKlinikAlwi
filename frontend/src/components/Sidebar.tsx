import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  CalendarCheck,
  ListOrdered,
  FileText,
  Pill,
  CreditCard,
  History,
  BarChart3,
  ShieldAlert,
  Hospital,
  Sun,
  Moon,
  LogOut,
  Shield,
  ReceiptText,
  Settings,
  Globe
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { useCMSStore } from '../store/useCMSStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { t } = useLanguageStore();
  const { clinicName, clinicTagline, clinicLogoIcon } = useCMSStore();

  const role = user?.role || 'Patient';

  const menuItems = [
    { name: t('menuDashboard'), path: '/dashboard', icon: LayoutDashboard, roles: ['Super Admin', 'Admin', 'Doctor', 'Pharmacist', 'Patient'] },
    { name: 'Manajemen Akun User', path: '/dashboard/users', icon: Shield, roles: ['Super Admin'] },
    { name: t('menuDoctors'), path: '/dashboard/doctors', icon: Stethoscope, roles: ['Super Admin', 'Admin', 'Doctor'] },
    { name: t('menuPatients'), path: '/dashboard/patients', icon: Users, roles: ['Super Admin', 'Admin', 'Doctor', 'Pharmacist'] },
    { name: t('menuAppointments'), path: '/dashboard/appointments', icon: CalendarCheck, roles: ['Super Admin', 'Admin', 'Doctor', 'Patient'] },
    { name: t('menuQueues'), path: '/dashboard/queues', icon: ListOrdered, roles: ['Super Admin', 'Admin', 'Doctor', 'Patient'] },
    { name: t('menuConsultation'), path: '/dashboard/consultation', icon: FileText, roles: ['Super Admin', 'Doctor'] },
    { name: t('menuPharmacy'), path: '/dashboard/pharmacy', icon: Pill, roles: ['Super Admin', 'Admin', 'Pharmacist'] },
    { name: t('menuBilling'), path: '/dashboard/billing', icon: CreditCard, roles: ['Super Admin', 'Admin', 'Patient'] },
    { name: 'History Transaksi', path: '/dashboard/payment-history', icon: ReceiptText, roles: ['Super Admin', 'Admin'] },
    { name: t('menuMedicalRecords'), path: '/dashboard/medical-records', icon: History, roles: ['Super Admin', 'Admin', 'Doctor', 'Patient'] },
    { name: t('menuReports'), path: '/dashboard/reports', icon: BarChart3, roles: ['Super Admin', 'Admin'] },
    { name: t('menuAuditLogs'), path: '/dashboard/audit-logs', icon: ShieldAlert, roles: ['Super Admin'] },
  ];

  const filteredMenu = menuItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-200 dark:border-slate-800 shadow-xl`}
      >
        {/* Brand Header - Dynamically customized via CMS Logo Upload */}
        <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${
              clinicLogoIcon && (clinicLogoIcon.startsWith('/') || clinicLogoIcon.startsWith('http') || clinicLogoIcon.startsWith('data:'))
                ? 'bg-transparent'
                : 'bg-gradient-to-tr from-sky-500 to-teal-400 shadow-lg shadow-sky-500/20'
            }`}>
              {clinicLogoIcon && (clinicLogoIcon.startsWith('/') || clinicLogoIcon.startsWith('http') || clinicLogoIcon.startsWith('data:')) ? (
                <img src={clinicLogoIcon} alt={clinicName} className="w-full h-full object-contain max-w-full max-h-full" />
              ) : (
                <Hospital className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-base leading-tight tracking-wide text-slate-900 dark:text-white truncate" title={clinicName}>
                {clinicName}
              </h1>
              <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium block truncate" title={clinicTagline}>
                {clinicTagline}
              </span>
            </div>
          </div>
        </div>

        {/* Logged in User Badge */}
        <div className="p-4 mx-3 my-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-600 dark:text-sky-300 flex items-center justify-center font-bold text-sm">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.full_name || 'Guest User'}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Shield className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">{role} {t('accountRole')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <span className="flex items-center gap-2">
              {isDarkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              {isDarkMode ? t('darkMode') : t('lightMode')}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
              {isDarkMode ? 'DARK' : 'LIGHT'}
            </span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-300 transition"
          >
            <LogOut className="w-4 h-4" />
            {t('signOut')}
          </button>
        </div>
      </aside>
    </>
  );
};

import React, { useState } from 'react';
import { Database, Shield, Stethoscope, Users as UsersIcon, Settings2 } from 'lucide-react';
import { UserManagementPage } from './UserManagementPage';
import { DoctorManagementPage } from './DoctorManagementPage';
import { PatientManagementPage } from './PatientManagementPage';

export const MasterDataManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'doctors' | 'patients'>('users');

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Card */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-sky-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Pusat Pengelolaan Master Data Klinik
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Akses terpusat khusus Super Admin untuk mengelola Akun Pengguna, Data Dokter Spesialis, dan Master Pasien
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs">
          <Settings2 className="w-4 h-4 animate-spin-slow text-amber-500" /> Wewenang Khusus Super Admin
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" /> 1. Manajemen Akun User
        </button>

        <button
          onClick={() => setActiveTab('doctors')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'doctors'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Stethoscope className="w-4 h-4" /> 2. Data Dokter & Spesialis
        </button>

        <button
          onClick={() => setActiveTab('patients')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'patients'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UsersIcon className="w-4 h-4" /> 3. Master Data Pasien
        </button>
      </div>

      {/* Active Tab Content Render */}
      <div className="pt-2">
        {activeTab === 'users' && <UserManagementPage />}
        {activeTab === 'doctors' && <DoctorManagementPage />}
        {activeTab === 'patients' && <PatientManagementPage />}
      </div>
    </div>
  );
};

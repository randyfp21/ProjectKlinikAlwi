import React, { useEffect, useState } from 'react';
import { ListOrdered, Stethoscope, CheckCircle2, Volume2, Sparkles, Monitor, Sun, Moon, UserCheck, Activity, HeartPulse, ShieldCheck, Waves } from 'lucide-react';
import { useQueueStore } from '../store/useQueueStore';
import { useCMSStore } from '../store/useCMSStore';
import { Queue } from '../types';

export const PublicQueueMonitorPage: React.FC = () => {
  const { queues, fetchQueues } = useQueueStore();
  const apiQueues = queues;
  const { clinicName, clinicTagline, clinicLogoIcon } = useCMSStore();
  
  // Theme state: Default Light Mode (false for dark, true for light)
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Get current date string in YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  // Auto-refresh queues every 5 seconds for live real-time TV monitor display
  useEffect(() => {
    fetchQueues(todayStr);
    const interval = setInterval(() => {
      fetchQueues(todayStr);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchQueues, todayStr]);

  // Live clock timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateIndonesian = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const pendingQueues = apiQueues.filter((q: Queue) => q.status !== 'Completed');
  const completedQueues = apiQueues.filter((q: Queue) => q.status === 'Completed');
  const currentCallingQueue = pendingQueues.find((q: Queue) => q.status === 'In Consultation') || pendingQueues[0];

  const name = clinicName || 'Klinik Utama Alwi';
  const tagline = clinicTagline || 'Layanan Kesehatan Modern, Cepat & Terpercaya';

  return (
    <div className={`min-h-screen font-sans flex flex-col justify-between p-6 lg:p-10 transition-colors duration-300 select-none overflow-x-hidden ${
      isDarkMode 
        ? 'bg-slate-950 text-slate-100' 
        : 'bg-gradient-to-br from-slate-50 via-sky-50/40 to-slate-100 text-slate-900'
    }`}>
      {/* PROFESSIONAL TV MONITOR HEADER WITH ANIMATED ECG MONITOR BAR */}
      <header className={`flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b transition-colors relative ${
        isDarkMode ? 'border-slate-800' : 'border-slate-200'
      }`}>
        {/* Clinic Identity & Brand */}
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-teal-400 via-sky-500 to-emerald-400 opacity-75 blur-sm group-hover:opacity-100 transition animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 via-teal-500 to-sky-600 p-1 shadow-xl flex items-center justify-center shrink-0">
              <div className={`w-full h-full rounded-xl flex items-center justify-center overflow-hidden ${
                isDarkMode ? 'bg-slate-900' : 'bg-white'
              }`}>
                {clinicLogoIcon && (clinicLogoIcon.startsWith('/') || clinicLogoIcon.startsWith('http') || clinicLogoIcon.startsWith('data:')) ? (
                  <img src={clinicLogoIcon} alt="Logo" className="w-12 h-12 object-contain" />
                ) : (
                  <ListOrdered className="w-8 h-8 text-sky-600" />
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold tracking-widest uppercase flex items-center gap-1.5 border shadow-xs ${
                isDarkMode 
                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' 
                  : 'bg-sky-500/10 text-sky-700 border-sky-500/20'
              }`}>
                <Monitor className="w-3.5 h-3.5 text-sky-500 animate-bounce" /> LAYAR MONITOR ANTREAN UTAMA (LIVE TV)
              </span>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-black uppercase">
                <HeartPulse className="w-3.5 h-3.5 animate-ping text-rose-500" /> Vitals Active
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight pt-1 flex items-center gap-2">
              {name}
            </h1>
            <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {tagline}
            </p>
          </div>
        </div>

        {/* Header Right Controls: ECG Wave, Theme Toggle & Live Clock */}
        <div className="flex items-center gap-4">
          {/* Animated Medical ECG Heartbeat Waveform Visualizer */}
          <div className={`hidden xl:flex items-center gap-2 px-4 py-2 rounded-2xl border ${
            isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
            <div className="space-y-0.5">
              <div className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span>ECG Monitor 72 BPM</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
              {/* ECG Line Animation SVG */}
              <svg className="w-28 h-5 text-emerald-500 overflow-hidden" viewBox="0 0 100 20">
                <path
                  d="M0 10 L20 10 L25 3 L30 17 L35 0 L40 20 L45 10 L60 10 L65 5 L70 15 L75 10 L100 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-pulse"
                />
              </svg>
            </div>
          </div>

          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-3 rounded-2xl border font-bold text-xs flex items-center gap-2.5 shadow-sm transition cursor-pointer active:scale-95 ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="Ganti Tema Layar Monitor (Light / Dark)"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-extrabold">Mode Terang</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-extrabold">Mode Gelap</span>
              </>
            )}
          </button>

          {/* Real-time Clock Card */}
          <div className={`text-right px-6 py-3 rounded-2xl border shadow-sm ${
            isDarkMode 
              ? 'bg-slate-900/90 border-slate-800' 
              : 'bg-white border-slate-200'
          }`}>
            <div className="text-[11px] font-extrabold text-sky-600 dark:text-sky-400 uppercase tracking-widest">
              {formatDateIndonesian(todayStr)}
            </div>
            <div className="text-2xl lg:text-3xl font-black font-mono tracking-wider">
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} <span className="text-xs text-slate-400 font-sans">WIB</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN MONITOR CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 flex-1 items-stretch">
        {/* HERO CALLING DISPLAY CARD WITH ANIMATED PULSE RINGS (LEFT 5 COLS) */}
        <div className={`lg:col-span-5 p-8 rounded-3xl border shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden ${
          isDarkMode
            ? 'bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 border-slate-800 text-white'
            : 'bg-gradient-to-br from-sky-600 via-teal-600 to-sky-700 border-sky-500 text-white shadow-sky-600/20'
        }`}>
          {/* Background Animated Pulse Rings Effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/5 pointer-events-none animate-ping" />

          <div className="space-y-6 relative z-10">
            <div className="flex items-center justify-between border-b border-white/20 pb-4">
              <span className="text-sm font-black text-sky-200 uppercase tracking-wider flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-yellow-300 animate-bounce" /> {currentCallingQueue?.doctor?.practice_room || 'Ruang Periksa Dokter'}
              </span>
              <span className="px-4 py-1.5 rounded-full bg-emerald-400/20 text-emerald-100 border border-emerald-300/40 text-xs font-black font-mono uppercase tracking-wider flex items-center gap-2 backdrop-blur-md">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
                {currentCallingQueue?.status === 'In Consultation' ? 'PANGGILAN AKTIF' : 'MENUNGGU PANGGILAN'}
              </span>
            </div>

            <div className="text-center py-10 space-y-4 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl relative overflow-hidden">
              {/* Medical Watermark Heart Icon */}
              <HeartPulse className="absolute -right-6 -bottom-6 w-40 h-40 text-white/5 pointer-events-none" />

              <span className="text-slate-200 text-xs font-extrabold uppercase tracking-widest block flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" /> NOMOR ANTREAN DIPANGGIL
              </span>
              <h2 className="text-8xl lg:text-9xl font-black text-white tracking-widest font-mono drop-shadow-2xl animate-pulse">
                {currentCallingQueue ? `#00${currentCallingQueue.queue_number}` : '---'}
              </h2>
              <div className="pt-4 space-y-1">
                <span className="text-2xl font-black text-yellow-300 block">
                  {currentCallingQueue?.patient?.full_name || 'Tidak Ada Pasien Dipanggil'}
                </span>
                <span className="text-base text-slate-100 font-bold block">{currentCallingQueue?.doctor?.name}</span>
                <span className="text-xs font-mono text-slate-200 block pt-1">Est. Jam: {currentCallingQueue?.estimated_time || '-'}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-3 relative z-10">
            <Volume2 className="w-6 h-6 text-yellow-300 shrink-0 animate-bounce" />
            <p className="text-xs text-slate-100 font-medium leading-relaxed">
              Silakan menuju ruang periksa saat nomor antrean dan nama Anda disuarakan oleh sistem pemanggil suara otomatis.
            </p>
          </div>
        </div>

        {/* TABLES SECTION (RIGHT 7 COLS) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          {/* ACTIVE QUEUES TABLE */}
          <div className={`p-6 rounded-3xl border shadow-lg space-y-4 flex-1 ${
            isDarkMode 
              ? 'bg-slate-900/90 border-slate-800' 
              : 'bg-white border-slate-200/80 shadow-slate-200/50'
          }`}>
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-base font-black tracking-tight">Antrean Berjalan Hari Ini</h2>
                  <p className="text-xs text-slate-400 font-normal">Daftar pasien yang menunggu giliran panggilan dokter</p>
                </div>
              </div>
              <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono text-xs font-black flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" /> {pendingQueues.length} Pasien Belum Selesai
              </span>
            </div>

            {pendingQueues.length === 0 ? (
              <div className={`p-8 text-center text-xs font-semibold space-y-2 rounded-2xl border ${
                isDarkMode ? 'bg-slate-800/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold">Seluruh Pasien Telah Selesai Dipanggil!</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className={`uppercase text-[10px] font-black tracking-wider border-b ${
                    isDarkMode 
                      ? 'bg-slate-800/80 text-slate-400 border-slate-800' 
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    <tr>
                      <th className="py-3.5 px-4">No. Antrean</th>
                      <th className="py-3.5 px-4">Nama Pasien</th>
                      <th className="py-3.5 px-4">Dokter & Poli</th>
                      <th className="py-3.5 px-4">Est. Jam</th>
                      <th className="py-3.5 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {pendingQueues.map((q: Queue) => (
                      <tr key={q.id} className="hover:bg-sky-500/10 transition">
                        <td className="py-3.5 px-4 font-mono font-black text-sky-600 dark:text-sky-400 text-sm">
                          #00{q.queue_number}
                        </td>
                        <td className="py-3.5 px-4 font-black">
                          {q.patient?.full_name}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                          <div>{q.doctor?.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{q.doctor?.practice_room}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-500 font-bold">
                          {q.estimated_time}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-black border ${
                              q.status === 'In Consultation'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            }`}
                          >
                            {q.status === 'In Consultation' ? 'SEDANG DIPERIKSA' : 'MENUNGGU'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* DEDICATED COMPLETED PASIEN TABLE */}
          <div className={`p-6 rounded-3xl border shadow-lg space-y-4 ${
            isDarkMode 
              ? 'bg-slate-900/90 border-slate-800' 
              : 'bg-white border-slate-200/80 shadow-slate-200/50'
          }`}>
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black tracking-tight">Daftar Pasien Selesai Berobat</h2>
                  <p className="text-xs text-slate-400 font-normal">Pasien yang telah selesai berkonsultasi dengan dokter</p>
                </div>
              </div>
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-xs font-black flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {completedQueues.length} Pasien Selesai
              </span>
            </div>

            {completedQueues.length === 0 ? (
              <div className={`p-6 text-center text-xs font-semibold rounded-2xl border ${
                isDarkMode ? 'bg-slate-800/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                Belum ada pasien yang selesai diperiksa hari ini.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className={`uppercase text-[10px] font-black tracking-wider border-b sticky top-0 backdrop-blur-md ${
                    isDarkMode 
                      ? 'bg-emerald-950/40 text-emerald-400 border-slate-800' 
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    <tr>
                      <th className="py-3 px-4">No. Antrean</th>
                      <th className="py-3 px-4">Nama Pasien</th>
                      <th className="py-3 px-4">Dokter & Poli</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {completedQueues.map((q: Queue) => (
                      <tr key={q.id} className="hover:bg-emerald-500/5 transition">
                        <td className="py-3 px-4 font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                          #00{q.queue_number}
                        </td>
                        <td className="py-3 px-4 font-black">
                          {q.patient?.full_name}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">
                          {q.doctor?.name} ({q.doctor?.practice_room})
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            SELESAI
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER TICKER BANNER WITH ANIMATED MEDICAL HEARTPULSE */}
      <footer className={`pt-4 border-t flex items-center justify-between text-xs font-medium ${
        isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
      }`}>
        <div className="flex items-center gap-2 font-bold text-sky-600 dark:text-sky-400">
          <HeartPulse className="w-4 h-4 text-rose-500 animate-pulse" />
          <span>Klinik Utama Alwi • Layar Monitor Antrean Ruang Tunggu Pasien</span>
        </div>
        <div className="font-mono text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Real-time Sync Active • PostgreSQL 5432
        </div>
      </footer>
    </div>
  );
};

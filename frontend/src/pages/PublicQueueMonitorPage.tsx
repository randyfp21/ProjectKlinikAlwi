import React, { useEffect, useState } from 'react';
import { ListOrdered, Stethoscope, CheckCircle2, Clock, Volume2, Sparkles, Monitor } from 'lucide-react';
import { useQueueStore } from '../store/useQueueStore';
import { useCMSStore } from '../store/useCMSStore';

import { Queue } from '../types';

export const PublicQueueMonitorPage: React.FC = () => {
  const { queues, fetchQueues } = useQueueStore();
  const apiQueues = queues;
  const { clinicName, clinicTagline, clinicLogoIcon } = useCMSStore();
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

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between p-6 lg:p-10 select-none overflow-x-hidden">
      {/* TOP MONITOR HEADER BANNER */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 p-0.5 shadow-xl shadow-sky-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden">
              {clinicLogoIcon && (clinicLogoIcon.startsWith('/') || clinicLogoIcon.startsWith('http') || clinicLogoIcon.startsWith('data:')) ? (
                <img src={clinicLogoIcon} alt="Logo" className="w-12 h-12 object-contain" />
              ) : (
                <ListOrdered className="w-8 h-8 text-sky-400" />
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[11px] font-extrabold tracking-widest uppercase flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-sky-400 animate-pulse" /> LAYAR MONITOR ANTREAN KLINIK (LIVE TV)
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white pt-1">
              {clinicName}
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              {clinicTagline}
            </p>
          </div>
        </div>

        {/* LIVE TIME & DATE DISPLAY */}
        <div className="text-right bg-slate-900/80 px-6 py-3 rounded-3xl border border-slate-800 shadow-xl">
          <div className="text-xs font-bold text-sky-400 uppercase tracking-widest">
            {formatDateIndonesian(todayStr)}
          </div>
          <div className="text-3xl font-black font-mono tracking-wider text-white">
            {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
          </div>
        </div>
      </div>

      {/* MAIN MONITOR CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 flex-1 items-stretch">
        {/* BIG MONITOR DISPLAY CARD (LEFT 5 COLS) */}
        <div className="lg:col-span-5 glass-card p-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white shadow-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-sm font-black text-sky-400 uppercase tracking-wider flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-sky-400" /> {currentCallingQueue?.doctor?.practice_room || 'Ruang Periksa Dokter'}
              </span>
              <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black font-mono uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                {currentCallingQueue?.status === 'In Consultation' ? 'PANGGILAN AKTIF' : 'MENUNGGU PANGGILAN'}
              </span>
            </div>

            <div className="text-center py-10 space-y-4 bg-white/5 rounded-3xl border border-white/10 shadow-inner">
              <span className="text-slate-400 text-sm font-extrabold uppercase tracking-widest block">NOMOR ANTREAN DIPANGGIL</span>
              <h2 className="text-8xl lg:text-9xl font-black text-white tracking-widest font-mono drop-shadow-2xl">
                {currentCallingQueue ? `#00${currentCallingQueue.queue_number}` : '---'}
              </h2>
              <div className="pt-4 space-y-1">
                <span className="text-2xl font-black text-sky-300 block">{currentCallingQueue?.patient?.full_name || 'Tidak Ada Pasien Dipanggil'}</span>
                <span className="text-base text-slate-300 font-bold block">{currentCallingQueue?.doctor?.name}</span>
                <span className="text-sm font-mono text-slate-400 block pt-1">Est. Jam: {currentCallingQueue?.estimated_time || '-'}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center gap-3">
            <Volume2 className="w-6 h-6 text-sky-400 shrink-0 animate-pulse" />
            <p className="text-xs text-sky-200 font-medium leading-relaxed">
              Silakan perhatikan nomor antrean dan nama Anda pada layar monitor saat dipanggil menuju ruang periksa dokter.
            </p>
          </div>
        </div>

        {/* TABLES SECTION (RIGHT 7 COLS) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          {/* ACTIVE QUEUES TABLE */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4 flex-1">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-sky-400" />
                Antrean Berjalan Pasien (Hari Ini)
              </h2>
              <span className="px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-xs font-extrabold">
                {pendingQueues.length} Pasien Belum Selesai
              </span>
            </div>

            {pendingQueues.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-semibold space-y-2 bg-slate-800/40 rounded-2xl border border-slate-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-slate-200">Seluruh Pasien Telah Selesai Dipanggil!</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300 whitespace-nowrap">
                  <thead className="bg-slate-800/80 uppercase text-[10px] text-slate-400 font-black tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">No. Antrean</th>
                      <th className="py-3.5 px-4">Nama Pasien</th>
                      <th className="py-3.5 px-4">Dokter & Poli</th>
                      <th className="py-3.5 px-4">Est. Jam</th>
                      <th className="py-3.5 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {pendingQueues.map((q: Queue) => (
                      <tr key={q.id} className="hover:bg-sky-500/10 transition">
                        <td className="py-3.5 px-4 font-mono font-black text-sky-400 text-sm">
                          #00{q.queue_number}
                        </td>
                        <td className="py-3.5 px-4 font-black text-white">
                          {q.patient?.full_name}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-300">
                          <div>{q.doctor?.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{q.doctor?.practice_room}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-400 font-bold">
                          {q.estimated_time}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${
                              q.status === 'In Consultation'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
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
          <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Daftar Pasien Selesai Berobat
              </h2>
              <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-xs font-extrabold">
                {completedQueues.length} Pasien Selesai
              </span>
            </div>

            {completedQueues.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 font-semibold bg-slate-800/40 rounded-2xl border border-slate-800">
                Belum ada pasien yang selesai diperiksa hari ini.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800 max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-300 whitespace-nowrap">
                  <thead className="bg-emerald-950/40 uppercase text-[10px] text-emerald-400 font-black tracking-wider border-b border-slate-800 sticky top-0 backdrop-blur-md">
                    <tr>
                      <th className="py-3 px-4">No. Antrean</th>
                      <th className="py-3 px-4">Nama Pasien</th>
                      <th className="py-3 px-4">Dokter & Poli</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {completedQueues.map((q: Queue) => (
                      <tr key={q.id} className="hover:bg-emerald-500/5 transition">
                        <td className="py-3 px-4 font-mono font-black text-emerald-400 text-sm">
                          #00{q.queue_number}
                        </td>
                        <td className="py-3 px-4 font-extrabold text-white">
                          {q.patient?.full_name}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-300">
                          {q.doctor?.name} ({q.doctor?.practice_room})
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
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

      {/* FOOTER TICKER MARQUEE BANNER */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
        <div className="flex items-center gap-2 text-sky-400 font-bold">
          <Sparkles className="w-4 h-4" /> Klinik Utama Alwi • Sistem Informasi Papan Antrean Pasien Real-time
        </div>
        <div className="font-mono text-slate-500">
          Powered by PostgreSQL 5432 Engine
        </div>
      </div>
    </div>
  );
};

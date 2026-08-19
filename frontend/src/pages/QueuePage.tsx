import React, { useState } from 'react';
import { ListOrdered, Volume2, CheckCircle2, UserCheck, ArrowRight, Clock, Lock, RefreshCw, Calendar } from 'lucide-react';
import { Queue } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';

export const QueuePage: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useLanguageStore();

  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';

  const [currentDate, setCurrentDate] = useState('2026-08-07');

  const [queuesByDate, setQueuesByDate] = useState<Record<string, Queue[]>>({
    '2026-08-07': [
      {
        id: 1,
        appointment_id: 1,
        patient_id: 1,
        patient: { id: 1, patient_number: 'PAT-001', full_name: 'Budi Santoso', gender: 'Male', age: 36, phone: '', national_id: '', birth_date: '', address: '', email: '', blood_type: '', allergy: '', disease_history: '', current_complaint: '', emergency_contact: '' },
        doctor_id: 1,
        doctor: { id: 1, user_id: 3, doctor_code: 'DOC-001', name: 'dr. Alwi Shahab, Sp.PD', specialization: 'Internal Medicine', gender: 'Male', phone: '', email: '', practice_license_number: '', education: '', practice_room: 'Room 101', active_status: true },
        queue_number: 1,
        queue_date: '2026-08-07',
        status: 'In Consultation',
        estimated_time: '09:00',
      },
      {
        id: 2,
        appointment_id: 2,
        patient_id: 2,
        patient: { id: 2, patient_number: 'PAT-002', full_name: 'Siti Rahma', gender: 'Female', age: 31, phone: '', national_id: '', birth_date: '', address: '', email: '', blood_type: '', allergy: '', disease_history: '', current_complaint: '', emergency_contact: '' },
        doctor_id: 2,
        doctor: { id: 2, user_id: 4, doctor_code: 'DOC-002', name: 'dr. Sarah Lestari, Sp.A', specialization: 'Pediatrician', gender: 'Female', phone: '', email: '', practice_license_number: '', education: '', practice_room: 'Room 102', active_status: true },
        queue_number: 2,
        queue_date: '2026-08-07',
        status: 'Waiting',
        estimated_time: '09:20',
      },
      {
        id: 3,
        appointment_id: 3,
        patient_id: 3,
        patient: { id: 3, patient_number: 'PAT-003', full_name: 'Ahmad Hidayat', gender: 'Male', age: 41, phone: '', national_id: '', birth_date: '', address: '', email: '', blood_type: '', allergy: '', disease_history: '', current_complaint: '', emergency_contact: '' },
        doctor_id: 1,
        doctor: { id: 1, user_id: 3, doctor_code: 'DOC-001', name: 'dr. Alwi Shahab, Sp.PD', specialization: 'Internal Medicine', gender: 'Male', phone: '', email: '', practice_license_number: '', education: '', practice_room: 'Room 101', active_status: true },
        queue_number: 3,
        queue_date: '2026-08-07',
        status: 'Waiting',
        estimated_time: '09:40',
      },
    ],
    '2026-08-08': [], // Empty queue list for next day
  });

  const [announcement, setAnnouncement] = useState('');
  const activeQueues = queuesByDate[currentDate] || [];

  const callQueue = (queue: Queue) => {
    if (!isAdmin) return;
    setQueuesByDate((prev) => ({
      ...prev,
      [currentDate]: (prev[currentDate] || []).map((q) =>
        q.id === queue.id ? { ...q, status: 'In Consultation' } : q
      ),
    }));
    setAnnouncement(`Now Calling: Queue #00${queue.queue_number} - ${queue.patient?.full_name} to ${queue.doctor?.practice_room}`);
    setTimeout(() => setAnnouncement(''), 5000);
  };

  const completeQueue = (id: number) => {
    if (!isAdmin) return;
    setQueuesByDate((prev) => ({
      ...prev,
      [currentDate]: (prev[currentDate] || []).map((q) =>
        q.id === id ? { ...q, status: 'Completed' } : q
      ),
    }));
  };

  const handleSimulateNextDayReset = () => {
    setCurrentDate('2026-08-08');
    setAnnouncement('Daily Queue Reset Executed: Queue cleared for new day appointments (2026-08-08).');
    setTimeout(() => setAnnouncement(''), 5000);
  };

  const currentCallingQueue = activeQueues.find((q) => q.status === 'In Consultation') || activeQueues[0];

  return (
    <div className="space-y-6 font-sans">
      {announcement && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 text-white font-bold text-sm shadow-xl flex items-center justify-between animate-pulse">
          <span className="flex items-center gap-3">
            <Volume2 className="w-6 h-6 animate-bounce" /> {announcement}
          </span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ListOrdered className="w-7 h-7 text-sky-500" /> Queue Management & Live Display
            </h1>
            {!isAdmin && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> Queue Control Exclusive to Admin
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Real-time queue calling board, wait time estimates, and automatic daily queue reset</p>
        </div>

        {/* Date Selector & Daily Reset Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Calendar className="w-4 h-4 text-sky-500" /> Date:
            <select
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="bg-transparent focus:outline-none font-mono font-bold text-sky-600 dark:text-sky-400"
            >
              <option value="2026-08-07">2026-08-07 (Today)</option>
              <option value="2026-08-08">2026-08-08 (Tomorrow - Reset)</option>
            </select>
          </div>

          {isAdmin && (
            <button
              onClick={handleSimulateNextDayReset}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
              title="Simulate Daily Midnight Queue Reset"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-400" /> Daily Reset (Next Day)
            </button>
          )}
        </div>
      </div>

      {/* Daily Reset Notice */}
      <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-700 dark:text-sky-300 flex items-center gap-3">
        <Clock className="w-5 h-5 shrink-0 text-sky-500" />
        <span>
          <strong className="block font-bold">Automatic Midnight Queue Reset Active</strong>
          Patient queues automatically reset every day at 00:00 midnight for the new day's patient appointments.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Now Display Box */}
        <div className="glass-card p-6 rounded-2xl border bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">Poliklinik Room 101</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
              {currentCallingQueue?.status || 'No Active Queue'}
            </span>
          </div>

          <div className="text-center py-4">
            <span className="text-slate-400 text-xs uppercase font-semibold">Current Calling Queue</span>
            <h2 className="text-6xl font-black text-white mt-1 font-mono tracking-wider">
              {currentCallingQueue ? `#00${currentCallingQueue.queue_number}` : '---'}
            </h2>
            <p className="text-sm font-bold text-sky-300 mt-2">{currentCallingQueue?.patient?.full_name || 'No Patient'}</p>
            <p className="text-xs text-slate-400">{currentCallingQueue?.doctor?.name}</p>
          </div>

          {/* ADMIN ONLY NEXT QUEUE CALL BUTTON */}
          {isAdmin ? (
            <button
              onClick={() => {
                const nextWaiting = activeQueues.find((q) => q.status === 'Waiting');
                if (nextWaiting) callQueue(nextWaiting);
              }}
              disabled={!activeQueues.some((q) => q.status === 'Waiting')}
              className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-sky-500/30 transition flex items-center justify-center gap-2"
            >
              <Volume2 className="w-4 h-4" /> Call Next Queue (Admin Only)
            </button>
          ) : (
            <div className="p-3 text-center text-xs text-slate-400 bg-slate-800/60 rounded-xl font-medium border border-slate-800">
              🔒 Queue Calling Restricted to Admin
            </div>
          )}
        </div>

        {/* Live Queue Table */}
        <div className="md:col-span-2 glass-card p-6 rounded-2xl border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Queue List for {currentDate} ({activeQueues.length} Patients)
            </h2>
          </div>

          {activeQueues.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold space-y-2">
              <Clock className="w-8 h-8 text-slate-500 mx-auto" />
              <p>Queue for {currentDate} is empty. New patient appointments will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase text-[10px] text-slate-400 font-semibold">
                  <tr>
                    <th className="p-3">Queue</th>
                    <th className="p-3">Patient</th>
                    <th className="p-3">Doctor</th>
                    <th className="p-3">Est. Time</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {activeQueues.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 font-mono font-bold text-sky-600 dark:text-sky-400 text-sm">#00{q.queue_number}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{q.patient?.full_name}</td>
                      <td className="p-3">{q.doctor?.name}</td>
                      <td className="p-3 font-mono">{q.estimated_time}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          q.status === 'In Consultation'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : q.status === 'Completed'
                            ? 'bg-sky-500/10 text-sky-600 border-sky-500/20'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {isAdmin ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => callQueue(q)}
                              className="px-2.5 py-1 rounded bg-sky-500 hover:bg-sky-600 text-white font-bold text-[10px] transition"
                            >
                              Call
                            </button>
                            <button
                              onClick={() => completeQueue(q.id)}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition"
                            >
                              Complete
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Read-only monitor</span>
                        )}
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
  );
};

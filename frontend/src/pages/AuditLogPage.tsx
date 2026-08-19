import React from 'react';
import { ShieldAlert, Database, Lock } from 'lucide-react';
import { AuditLog } from '../types';
import { formatDateTimeIndonesian } from '../utils/formatDate';

export const AuditLogPage: React.FC = () => {
  const mockLogs: AuditLog[] = [
    { id: 1, user_id: 1, user_email: 'superadmin@klinikalwi.id', user_role: 'Super Admin', action: 'SYSTEM_SEED', module: 'System', description: 'Database initialized with core enterprise seed data for Klinik Alwi HMS', ip_address: '127.0.0.1', created_at: '2026-08-07T08:00:00Z' },
    { id: 2, user_id: 3, user_email: 'alwi@klinikalwi.id', user_role: 'Doctor', action: 'CREATE_CONSULTATION', module: 'Consultation', description: 'POST /api/v1/consultations (Patient Budi Santoso)', ip_address: '127.0.0.1', created_at: '2026-08-07T09:30:00Z' },
    { id: 3, user_id: 5, user_email: 'apt.andi@klinikalwi.id', user_role: 'Pharmacist', action: 'DISPENSE_MEDICINE', module: 'Pharmacy', description: 'POST /api/v1/prescriptions/1/dispense (RX-20260807-001)', ip_address: '127.0.0.1', created_at: '2026-08-07T10:00:00Z' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-sky-500" /> Enterprise Audit Logs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Complete immutable trail of user authentication, data creation, updates, and medicine dispensing</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase text-[10px] text-slate-400 font-semibold">
              <tr>
                <th className="p-3.5">Log ID</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">User & Role</th>
                <th className="p-3.5">Module</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {mockLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-mono font-bold text-sky-500">#{log.id}</td>
                  <td className="p-3.5 font-mono text-slate-400">{formatDateTimeIndonesian(log.created_at)}</td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{log.user_email}</div>
                    <div className="text-[10px] text-sky-400 font-semibold">{log.user_role}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-bold text-[10px]">
                      {log.module}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-teal-600 dark:text-teal-400">{log.action}</td>
                  <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300 text-[11px]">{log.description}</td>
                  <td className="p-3.5 font-mono text-slate-400">{log.ip_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { BarChart3, Download, FileSpreadsheet, TrendingUp, Users, Stethoscope, Pill, DollarSign } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const topDiagnoses = [
    { name: 'Essential (primary) hypertension', code: 'I10', count: 28, percentage: '32%' },
    { name: 'Acute upper respiratory infection', code: 'J06.9', count: 22, percentage: '25%' },
    { name: 'Type 2 diabetes mellitus', code: 'E11', count: 17, percentage: '19%' },
    { name: 'Gastritis, unspecified', code: 'K29.7', count: 14, percentage: '16%' },
    { name: 'Asthma, unspecified', code: 'J45.909', count: 9, percentage: '8%' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-sky-500" /> Executive Analytics & Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Revenue analysis, doctor performance, top ICD-10 diagnoses, and export to PDF/Excel</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Exporting PDF Report...')}
            className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-medium text-xs shadow-md flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
          <button
            onClick={() => alert('Exporting Excel Spreadsheet...')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-md shadow-emerald-600/30 flex items-center gap-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      {/* Top Diagnoses Table */}
      <div className="glass-card p-6 rounded-2xl border space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Top ICD-10 Clinical Diagnoses</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase text-[10px] text-slate-400 font-semibold">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Diagnosis Description</th>
                <th className="p-3">ICD-10 Code</th>
                <th className="p-3">Patient Count</th>
                <th className="p-3">Prevalence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {topDiagnoses.map((d, i) => (
                <tr key={d.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-3 font-bold text-sky-500">#{i + 1}</td>
                  <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">{d.name}</td>
                  <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">{d.code}</td>
                  <td className="p-3 font-bold">{d.count} patients</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-sky-500 h-full rounded-full" style={{ width: d.percentage }} />
                      </div>
                      <span className="font-semibold text-[11px]">{d.percentage}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

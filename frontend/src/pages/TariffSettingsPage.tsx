import React, { useState } from 'react';
import { Settings, ShieldCheck, Lock, Edit3, Save, CheckCircle2, DollarSign, Stethoscope, User, X, Check } from 'lucide-react';
import { Doctor } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';

interface GeneralTariff {
  id: number;
  category: 'Procedure Fee' | 'Prescription Fee' | 'Tax Rate';
  name: string;
  amount: number;
  unit: string;
  description: string;
}

export const TariffSettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useLanguageStore();

  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';

  const [toastMessage, setToastMessage] = useState('');
  const [editingDoctorFee, setEditingDoctorFee] = useState<Doctor | null>(null);
  const [editingGeneralTariff, setEditingGeneralTariff] = useState<GeneralTariff | null>(null);

  // Doctors list with individual custom consultation fees per Doctor ID
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([
    {
      id: 1,
      user_id: 3,
      doctor_code: 'DOC-001',
      name: 'dr. Alwi Shahab, Sp.PD',
      gender: 'Male',
      phone: '+6281234567892',
      email: 'alwi@klinikalwi.id',
      practice_license_number: 'SIP.123/KK/2024',
      specialization: 'Internal Medicine (Penyakit Dalam)',
      education: 'Universitas Indonesia',
      practice_room: 'Poliklinik A - Room 101',
      consultation_fee: 175000,
      active_status: true,
    },
    {
      id: 2,
      user_id: 4,
      doctor_code: 'DOC-002',
      name: 'dr. Sarah Lestari, Sp.A',
      gender: 'Female',
      phone: '+6281234567893',
      email: 'sarah@klinikalwi.id',
      practice_license_number: 'SIP.456/KK/2024',
      specialization: 'Pediatrician (Spesialis Anak)',
      education: 'Universitas Gadjah Mada',
      practice_room: 'Poliklinik B - Room 102',
      consultation_fee: 150000,
      active_status: true,
    },
  ]);

  // General Baseline Tariffs (Procedure Fee, Prescription Fee, Tax Rate)
  const [generalTariffs, setGeneralTariffs] = useState<GeneralTariff[]>([
    {
      id: 1,
      category: 'Procedure Fee',
      name: 'Tindakan & Pemeriksaan Medis (Procedure Fee)',
      amount: 50000,
      unit: 'Per Tindakan',
      description: 'Tarif standar baseline pemeriksaan fisik vital signs (TTV) & terapi medis',
    },
    {
      id: 2,
      category: 'Prescription Fee',
      name: 'Biaya Admin Resep & Racikan (Prescription Fee)',
      amount: 15000,
      unit: 'Per Resep',
      description: 'Tarif standar baseline jasa dispensing & admin racikan obat farmasi apotek',
    },
    {
      id: 3,
      category: 'Tax Rate',
      name: 'Pajak Pertambahan Nilai (PPN 10%)',
      amount: 10,
      unit: 'Persen (%)',
      description: 'Persentase pajak PPN standar transaksi tagihan kasir klinik',
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 5000);
  };

  const handleSaveDoctorFeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctorFee || !isAdmin) return;

    setDoctorsList(
      doctorsList.map((d) => (d.id === editingDoctorFee.id ? editingDoctorFee : d))
    );
    const docName = editingDoctorFee.name;
    const feeVal = editingDoctorFee.consultation_fee || 150000;
    setEditingDoctorFee(null);
    showToast(`Tarif Doctor Fee untuk ${docName} (ID #${editingDoctorFee.id}) berhasil diperbarui menjadi Rp ${feeVal.toLocaleString()}!`);
  };

  const handleSaveGeneralTariffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGeneralTariff || !isAdmin) return;

    setGeneralTariffs(
      generalTariffs.map((t) => (t.id === editingGeneralTariff.id ? editingGeneralTariff : t))
    );
    const updatedName = editingGeneralTariff.name;
    const formattedVal = editingGeneralTariff.unit === 'Persen (%)' ? `${editingGeneralTariff.amount}%` : `Rp ${editingGeneralTariff.amount.toLocaleString()}`;
    setEditingGeneralTariff(null);
    showToast(`Tarif global "${updatedName}" berhasil diperbarui menjadi ${formattedVal} oleh Admin!`);
  };

  return (
    <div className="space-y-6 font-sans">
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-lg flex items-center justify-between animate-bounce">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> {toastMessage}
          </span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Settings className="w-7 h-7 text-sky-500" /> Pengaturan Tarif Medis & Doctor Fee per Dokter
            </h1>
            {isAdmin ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Akses Edit Admin Aktif
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-bold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Read-only (Khusus Admin)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Setiap dokter spesialis memiliki parameter Doctor Fee individual. Saat dokter menyimpan rekam medis/SOAP, invoice kasir akan secara otomatis memanggil tarif sesuai ID dokter tersebut.
          </p>
        </div>
      </div>

      {/* SECTION 1: PER-DOCTOR CONSULTATION FEE CONFIGURATION TABLE */}
      <div className="glass-card p-6 rounded-2xl border space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-sky-500" /> 1. Tabel Tarif Doctor Fee Berdasarkan ID Dokter & Spesialisasi
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Atur besaran tarif konsultasi jasa medis spesifik untuk masing-masing dokter</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
              <tr>
                <th className="p-3.5">Doctor ID & Kode</th>
                <th className="p-3.5">Nama Dokter Spesialis</th>
                <th className="p-3.5">Spesialisasi & Ruang Praktik</th>
                <th className="p-3.5">Tarif Doctor Fee (Konsultasi)</th>
                <th className="p-3.5 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {doctorsList.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-mono font-bold text-[11px]">
                      ID #{doc.id} ({doc.doctor_code})
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 text-sm">{doc.name}</td>
                  <td className="p-3.5">
                    <div className="font-semibold text-teal-600 dark:text-teal-400">{doc.specialization}</div>
                    <div className="text-[10px] text-slate-400">{doc.practice_room}</div>
                  </td>
                  <td className="p-3.5 font-extrabold text-sky-600 dark:text-sky-400 text-sm">
                    Rp {(doc.consultation_fee || 150000).toLocaleString()} <span className="text-[10px] font-normal text-slate-400">/ konsultasi</span>
                  </td>
                  <td className="p-3.5 text-right">
                    {isAdmin ? (
                      <button
                        onClick={() => setEditingDoctorFee(doc)}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] flex items-center gap-1 ml-auto transition shadow-sm"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Set Tarif Doctor Fee
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Read-only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: GENERAL BASELINE CLINIC TARIFF TABLE (Procedure Fee, Prescription Fee, Tax) */}
      <div className="glass-card p-6 rounded-2xl border space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" /> 2. Tabel Tarif Layanan Umum (Procedure Fee, Prescription Fee, PPN)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Atur besaran tarif baseline untuk tindakan medis umum, jasa admin resep obat, & persentase pajak PPN</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
              <tr>
                <th className="p-3.5">Kategori Tarif</th>
                <th className="p-3.5">Nama Layanan / Komponen Biaya</th>
                <th className="p-3.5">Besaran Tarif Baseline</th>
                <th className="p-3.5">Satuan Layanan</th>
                <th className="p-3.5">Keterangan Fungsi</th>
                <th className="p-3.5 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {generalTariffs.map((tariff) => (
                <tr key={tariff.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold text-[11px]">
                      {tariff.category}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{tariff.name}</td>
                  <td className="p-3.5 font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                    {tariff.unit === 'Persen (%)' ? `${tariff.amount}%` : `Rp ${tariff.amount.toLocaleString()}`}
                  </td>
                  <td className="p-3.5 font-semibold text-slate-500 dark:text-slate-400">{tariff.unit}</td>
                  <td className="p-3.5 text-slate-500 dark:text-slate-400 text-[11px]">{tariff.description}</td>
                  <td className="p-3.5 text-right">
                    {isAdmin ? (
                      <button
                        onClick={() => setEditingGeneralTariff(tariff)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 ml-auto transition shadow-sm"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Ubah Tarif
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Read-only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADMIN EDIT DOCTOR FEE PER DOCTOR ID */}
      {editingDoctorFee && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal font-sans">
          <form onSubmit={handleSaveDoctorFeeSubmit} className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-sky-500" /> Set Doctor Fee per Dokter
              </h2>
              <button
                type="button"
                onClick={() => setEditingDoctorFee(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 space-y-1">
                <span className="font-bold block text-sm">{editingDoctorFee.name}</span>
                <p className="text-[11px]">Doctor ID: #{editingDoctorFee.id} | Spesialisasi: {editingDoctorFee.specialization}</p>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">
                  Tarif Doctor Fee Baru (Rp / Konsultasi):
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step={5000}
                  value={editingDoctorFee.consultation_fee}
                  onChange={(e) => setEditingDoctorFee({ ...editingDoctorFee, consultation_fee: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-extrabold text-sky-600 dark:text-sky-400 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingDoctorFee(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/30 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Simpan Tarif Doctor Fee
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: ADMIN EDIT GENERAL TARIFF */}
      {editingGeneralTariff && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal font-sans">
          <form onSubmit={handleSaveGeneralTariffSubmit} className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-500" /> Edit Tarif Layanan Umum
              </h2>
              <button
                type="button"
                onClick={() => setEditingGeneralTariff(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Nama Komponen Tarif</label>
                <input
                  type="text"
                  required
                  value={editingGeneralTariff.name}
                  onChange={(e) => setEditingGeneralTariff({ ...editingGeneralTariff, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">
                  Besaran Tarif Baru ({editingGeneralTariff.unit === 'Persen (%)' ? 'Persen %' : 'Rupiah Rp'}):
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={editingGeneralTariff.amount}
                  onChange={(e) => setEditingGeneralTariff({ ...editingGeneralTariff, amount: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-extrabold text-emerald-600 dark:text-emerald-400 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingGeneralTariff(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Simpan Tarif Layanan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

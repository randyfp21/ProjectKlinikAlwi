import React, { useState } from 'react';
import { CreditCard, CheckCircle2, Printer, QrCode, FileText, Receipt, User, Lock, Wallet, ArrowLeft, Building2, DollarSign, Eye, X, History, CalendarX, MapPin, Phone, Mail, Clock, Sparkles, ChevronRight, ShieldCheck, Hospital, Stethoscope, Activity, Search, Copy, Check } from 'lucide-react';
import { useInvoiceStore } from '../store/useInvoiceStore';
import { useAuthStore } from '../store/useAuthStore';
import { useCMSStore, CMSPaymentMethod } from '../store/useCMSStore';
import { Invoice } from '../types';
import { formatDateIndonesian, formatDateTimeIndonesian } from '../utils/formatDate';

export const BillingPage: React.FC = () => {
  const { user } = useAuthStore();
  const { invoices, fetchInvoices, payInvoice } = useInvoiceStore();
  const { clinicName, clinicAddress, contactPhone, contactEmail, clinicLogoIcon, paymentMethods, fetchCMSFromDB } = useCMSStore();

  React.useEffect(() => {
    fetchInvoices();
    fetchCMSFromDB();
  }, [fetchInvoices, fetchCMSFromDB]);

  const isPatient = user?.role === 'Patient';
  const [paymentSuccess, setPaymentSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [copiedAccount, setCopiedAccount] = useState('');

  const handleCopyAccount = (accNo: string) => {
    navigator.clipboard.writeText(accNo);
    setCopiedAccount(accNo);
    setTimeout(() => setCopiedAccount(''), 2500);
  };

  // Selected Patient Invoice for Cashier Payment Processing
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('QRIS');

  // Filter invoices strictly matching patient name or ID
  const patientName = user?.full_name || 'Budi Santoso';
  const displayInvoices = isPatient
    ? invoices.filter((i) => i.patient?.full_name?.toLowerCase().includes(patientName.toLowerCase()) || i.patient_id === 1)
    : invoices;

  // Search Filtered Invoices (by patient name, invoice number, NIK, or payment method)
  const searchFilteredInvoices = displayInvoices.filter(
    (i) =>
      i.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      i.patient?.full_name.toLowerCase().includes(search.toLowerCase()) ||
      i.patient?.national_id?.includes(search) ||
      i.payment_method?.toLowerCase().includes(search.toLowerCase())
  );

  // Unpaid invoices (Generated from doctor consultation)
  const pendingInvoices = searchFilteredInvoices.filter((i) => i.payment_status === 'Pending');

  // Paid invoices (Personal Transaction History)
  const paidInvoicesHistory = searchFilteredInvoices.filter((i) => i.payment_status === 'Paid');

  const totalPendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.grand_total, 0);
  const totalPaidAmount = paidInvoicesHistory.reduce((sum, inv) => sum + inv.grand_total, 0);

  const handleConfirmPay = () => {
    if (!selectedInvoice) return;
    payInvoice(selectedInvoice.id, selectedPaymentMethod);

    // Update local state to Paid so Print button immediately becomes active!
    setSelectedInvoice({
      ...selectedInvoice,
      payment_status: 'Paid',
      payment_method: selectedPaymentMethod,
      paid_at: new Date().toISOString(),
    });

    setPaymentSuccess(
      `Pembayaran sebesar Rp ${selectedInvoice.grand_total.toLocaleString()} via ${selectedPaymentMethod} berhasil dikonfirmasi! Kuitansi resmi dapat dicetak.`
    );
    setTimeout(() => setPaymentSuccess(''), 5000);
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {paymentSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-xl flex items-center justify-between animate-bounce">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" /> {paymentSuccess}
          </span>
        </div>
      )}

      {/* Header Bar & Quick Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 flex items-center justify-center shrink-0 overflow-hidden hidden sm:flex">
            {clinicLogoIcon && (clinicLogoIcon.startsWith('/') || clinicLogoIcon.startsWith('http') || clinicLogoIcon.startsWith('data:')) ? (
              <img src={clinicLogoIcon} alt="Logo" className="w-full h-full object-contain max-w-full max-h-full" />
            ) : (
              <Hospital className="w-8 h-8 text-sky-400" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Billing & Payment System
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-3 text-white pt-1">
              {isPatient ? <Wallet className="w-8 h-8 text-sky-400" /> : <CreditCard className="w-8 h-8 text-sky-400" />}
              {isPatient ? 'Portal Pembayaran & Tagihan Saya' : 'Kasir & Manajemen Billing Klinik'}
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {isPatient
                ? 'Pantau rincian tagihan medis, rincian obat & expired date, metode pembayaran QRIS/Transfer, dan riwayat kuitansi resmi Anda.'
                : 'Kelola antrean tagihan pasien dari ruang konsultasi, proses pembayaran kasir instan, cetak kuitansi resmi, dan riwayat transaksi.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
          <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-right min-w-[130px]">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Menunggu Bayar</span>
            <span className="text-lg font-extrabold text-amber-400 font-mono">
              Rp {totalPendingAmount.toLocaleString()}
            </span>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-right min-w-[130px]">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Lunas (Total)</span>
            <span className="text-lg font-extrabold text-emerald-400 font-mono">
              Rp {totalPaidAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-white dark:bg-slate-900/90 shadow-sm">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari tagihan berdasarkan Nama Pasien, Nomor Invoice (INV-xxx), atau NIK..."
          className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
        />
      </div>

      {/* =========================================================================
          VIEW 1: PATIENT ROLE -> UNPAID CONSULTATION INVOICES & PERSONAL PAID HISTORY
         ========================================================================= */}
      {isPatient ? (
        <div className="space-y-6">
          {/* Section 1: Active Unpaid Invoices Generated from Doctor Consultation */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm bg-white dark:bg-slate-900/90">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-amber-500" /> Tagihan Konsultasi Dokter Aktif ({pendingInvoices.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Diterbitkan otomatis oleh dokter setelah pemeriksaan rekam medis</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold font-mono">
                {pendingInvoices.length} Tagihan Belum Lunas
              </span>
            </div>

            {pendingInvoices.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 font-semibold space-y-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                <CalendarX className="w-10 h-10 text-slate-400 mx-auto" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Tidak Ada Tagihan Aktif Hari Ini</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                    Semua tagihan konsultasi Anda telah lunas atau belum ada rekam medis baru dari dokter. Tagihan baru akan otomatis tampil di sini saat pemeriksaan selesai.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {pendingInvoices.map((inv) => (
                  <div key={inv.id} className="p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-5 shadow-xs transition hover:border-sky-500/40">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-mono font-extrabold text-xs">
                            {inv.invoice_number}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Menunggu Pembayaran
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 pt-1">
                          {inv.items.find((i) => i.item_type === 'Doctor Fee')?.item_name || 'Konsultasi Dokter'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <span>Waktu: {formatDateTimeIndonesian(inv.created_at)}</span>
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-right sm:min-w-[180px]">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">TOTAL TAGIHAN</span>
                        <span className="text-xl font-black text-sky-600 dark:text-sky-400">Rp {inv.grand_total.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Medical SOAP Notes Breakdown (Subjective, Diagnosis & ICD10, Plan) */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 space-y-3">
                      <h4 className="text-xs font-extrabold text-sky-600 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <Stethoscope className="w-4 h-4 text-sky-500" /> Ringkasan Medis Hasil Konsultasi Dokter
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
                          <span className="font-extrabold text-slate-700 dark:text-slate-300 block text-[11px]">Subjective (S) - Keluhan Pasien:</span>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                            {inv.subjective || inv.patient?.current_complaint || 'Keluhan utama dicatat pada rekam medis'}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-teal-700 dark:text-teal-300 block text-[11px]">Diagnosis & ICD-10:</span>
                            {inv.icd10_code && (
                              <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-700 dark:text-teal-300 font-mono font-bold text-[10px]">
                                {inv.icd10_code}
                              </span>
                            )}
                          </div>
                          <p className="text-teal-900 dark:text-teal-200 font-bold">
                            {inv.diagnosis || 'Diagnosis belum diisi'}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
                          <span className="font-extrabold text-slate-700 dark:text-slate-300 block text-[11px]">Plan (P) - Terapi & Penanganan:</span>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                            {inv.plan || 'Rencana pengobatan dan terapi resep obat'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Itemized breakdown table for patient */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900">
                      <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                        <thead className="bg-slate-100 dark:bg-slate-800/90 uppercase text-[10px] text-slate-500 dark:text-slate-400 font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-700">
                          <tr>
                            <th className="py-3 px-4">Kategori</th>
                            <th className="py-3 px-4">Rincian Layanan / Obat</th>
                            <th className="py-3 px-4 text-center">Qty</th>
                            <th className="py-3 px-4">Expired Date</th>
                            <th className="py-3 px-4 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          {inv.items.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase border border-slate-200 dark:border-slate-700">
                                  {item.item_type}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{item.item_name}</td>
                              <td className="py-3 px-4 text-center font-bold text-sky-600 dark:text-sky-400">{item.quantity}</td>
                              <td className="py-3 px-4">
                                {item.item_type === 'Medicine' ? (
                                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono text-[10px] font-bold">
                                    {formatDateIndonesian(item.expiry_date || '2027-12-31')}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-mono text-[10px]">-</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">Rp {item.subtotal.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* QRIS & Payment Options Box */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500/10 via-teal-500/10 to-transparent border border-sky-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                          <QrCode className="w-12 h-12 text-slate-900" />
                        </div>
                        <div className="text-xs space-y-0.5">
                          <span className="font-bold text-slate-900 dark:text-slate-100 block text-sm">Scan QRIS / Transfer Bank Instant</span>
                          <span className="text-slate-600 dark:text-slate-400 block text-xs">BCA Account: <strong>888-019-2026</strong> a.n. Klinik Alwi</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Terima GoPay, OVO, ShopeePay, & Mobile Banking
                          </span>
                        </div>
                      </div>

                      {isPatient ? (
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-extrabold text-xs transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-4 h-4 text-sky-500" /> Lihat Detail Tagihan
                          </button>
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Konfirmasi Pelunasan Oleh Kasir / Admin Klinik
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-lg shadow-sky-600/30 transition flex items-center gap-2 shrink-0 cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4" /> Proses & Selesaikan Pembayaran
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Personal Paid Transaction History */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm bg-white dark:bg-slate-900/90">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <History className="w-5 h-5 text-emerald-500" /> Riwayat Transaksi Lunas Saya ({paidInvoicesHistory.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Daftar pembayaran kuitansi resmi yang telah berhasil terverifikasi</p>
              </div>
            </div>

            {paidInvoicesHistory.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-semibold">
                Belum ada riwayat transaksi pembayaran lunas.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase text-[10px] text-slate-500 dark:text-slate-400 font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Tanggal Lunas</th>
                      <th className="py-3.5 px-4">Nomor Invoice</th>
                      <th className="py-3.5 px-4">Metode Bayar</th>
                      <th className="py-3.5 px-4">Total Dibayar</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {paidInvoicesHistory.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 text-xs">
                          {formatDateTimeIndonesian(inv.paid_at || inv.created_at)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono font-extrabold">
                            {inv.invoice_number}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">{inv.payment_method}</td>
                        <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                          Rp {inv.grand_total.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> LUNAS
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 ml-auto transition shadow-sm cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Lihat Kuitansi
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : !selectedInvoice ? (
        /* =========================================================================
            VIEW 2: ADMIN / CASHIER ROLE -> UNPAID PATIENT BILLING QUEUE (ONLY PENDING)
           ========================================================================= */
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm bg-white dark:bg-slate-900/90">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-500" />
                Antrean Tagihan Belum Lunas Meja Kasir ({pendingInvoices.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Daftar invoice aktif yang belum lunas dan siap diproses pembayarannya</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold font-mono">
              {pendingInvoices.length} Pasien Belum Lunas
            </span>
          </div>

          {pendingInvoices.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 font-semibold space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p>Tidak ada antrean tagihan belum lunas di meja kasir saat ini. Semua tagihan telah diproses lunas!</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase text-[10px] text-slate-500 dark:text-slate-400 font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">No. Invoice</th>
                    <th className="py-3.5 px-4">Nama Pasien & NIK</th>
                    <th className="py-3.5 px-4">Jasa Dokter</th>
                    <th className="py-3.5 px-4">Biaya Obat</th>
                    <th className="py-3.5 px-4">Grand Total</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {pendingInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => setSelectedInvoice(inv)}
                      className="hover:bg-sky-500/10 cursor-pointer transition"
                    >
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-mono font-extrabold">
                          {inv.invoice_number}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 dark:text-slate-100">{inv.patient?.full_name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">NIK: {inv.patient?.national_id}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">Rp {inv.doctor_fee.toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">Rp {inv.medicine_fee.toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-black text-sky-600 dark:text-sky-400 text-sm">
                        Rp {inv.grand_total.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-3 py-1 rounded-full text-[11px] font-extrabold border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                          MENUNGGU BAYAR
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/30 transition flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4" /> Proses Pembayaran
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      {/* =========================================================================
          DETAILED INVOICE PAYMENT POPUP / BREAKDOWN MODAL FOR BOTH ROLES
         ========================================================================= */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Clinic Letterhead / Kop Surat Resmi Receipt Header */}
            <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-4 text-center space-y-1">
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center shrink-0 overflow-hidden">
                  {clinicLogoIcon && (clinicLogoIcon.startsWith('/') || clinicLogoIcon.startsWith('http') || clinicLogoIcon.startsWith('data:')) ? (
                    <img src={clinicLogoIcon} alt="Logo" className="w-full h-full object-contain max-w-full max-h-full" />
                  ) : (
                    <Hospital className="w-6 h-6 text-sky-500" />
                  )}
                </div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase">{clinicName}</h1>
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1 pt-1">
                <MapPin className="w-3.5 h-3.5 text-amber-500" /> {clinicAddress}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-center gap-4 pt-0.5">
                <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-sky-500" /> Telp/WA: <strong>{contactPhone}</strong></span>
                <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-teal-500" /> Email: <strong>{contactEmail}</strong></span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-mono uppercase">
                  {selectedInvoice.invoice_number}
                </span>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                  Pasien: {selectedInvoice.patient?.full_name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  NIK: {selectedInvoice.patient?.national_id} | Tanggal: {formatDateTimeIndonesian(selectedInvoice.created_at)}
                </p>
              </div>

              <div className="sm:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">STATUS PEMBAYARAN</span>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold inline-block mt-0.5 border ${
                  selectedInvoice.payment_status === 'Paid'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                }`}>
                  {selectedInvoice.payment_status === 'Paid' ? 'LUNAS (PAID)' : 'MENUNGGU KASIR'}
                </span>
              </div>
            </div>

            {/* Modal Medical SOAP Notes Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-2">
                <Activity className="w-4 h-4 text-teal-500" /> Informasi Rekam Medis (S & P)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="font-extrabold text-slate-500 dark:text-slate-400 block text-[10px] uppercase">Subjective (S) - Keluhan:</span>
                  <p className="text-slate-900 dark:text-slate-100 font-semibold leading-snug">
                    {selectedInvoice.subjective || selectedInvoice.patient?.current_complaint || 'Keluhan pasien tercatat'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-extrabold text-teal-600 dark:text-teal-400 block text-[10px] uppercase">Diagnosis & ICD-10:</span>
                  <p className="text-teal-700 dark:text-teal-300 font-bold leading-snug">
                    {selectedInvoice.diagnosis || 'Diagnosis Medis'} {selectedInvoice.icd10_code ? `(${selectedInvoice.icd10_code})` : ''}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-extrabold text-slate-500 dark:text-slate-400 block text-[10px] uppercase">Plan (P) - Pengobatan & Terapi:</span>
                  <p className="text-slate-900 dark:text-slate-100 font-semibold leading-snug">
                    {selectedInvoice.plan || 'Rencana pengobatan resep obat'}
                  </p>
                </div>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                <thead className="bg-slate-100 dark:bg-slate-800/90 uppercase text-[10px] text-slate-500 dark:text-slate-400 font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Rincian Item / Obat</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4">Harga Jual</th>
                    <th className="py-3 px-4">Expired Date</th>
                    <th className="py-3 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {selectedInvoice.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase">
                          {item.item_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{item.item_name}</td>
                      <td className="py-3 px-4 text-center font-bold text-sky-600 dark:text-sky-400">{item.quantity}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        Rp {item.unit_price.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        {item.item_type === 'Medicine' ? (
                          <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono text-[10px] font-bold">
                            {formatDateIndonesian(item.expiry_date || '2027-12-31')}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-[10px]">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">Rp {item.subtotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Subtotal Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1 text-xs text-right">
              <div className="text-slate-500 dark:text-slate-400">Jasa Konsultasi Dokter: <span className="font-semibold text-slate-800 dark:text-slate-200">Rp {selectedInvoice.doctor_fee.toLocaleString()}</span></div>
              <div className="text-slate-500 dark:text-slate-400">Biaya Tindakan Medis: <span className="font-semibold text-slate-800 dark:text-slate-200">Rp {selectedInvoice.procedure_fee.toLocaleString()}</span></div>
              <div className="text-slate-500 dark:text-slate-400">Biaya Resep Obat Farmasi: <span className="font-semibold text-slate-800 dark:text-slate-200">Rp {selectedInvoice.medicine_fee.toLocaleString()}</span></div>
              <div className="text-slate-500 dark:text-slate-400">PPN (Pajak 10%): <span className="font-semibold text-slate-800 dark:text-slate-200">Rp {selectedInvoice.tax.toLocaleString()}</span></div>
              <div className="text-lg font-black text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span>Total Pembayaran:</span>
                <span className="text-sky-600 dark:text-sky-400 font-mono">Rp {selectedInvoice.grand_total.toLocaleString()}</span>
              </div>
            </div>

            {/* Dynamic CMS Payment Method Selector */}
            {selectedInvoice.payment_status !== 'Paid' && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4 text-xs">
                <div>
                  <label className="text-slate-800 dark:text-slate-200 block font-extrabold mb-1.5">
                    Pilih Metode Transaksi Pembayaran Resmi:
                  </label>
                  <select
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs focus:outline-none text-slate-900 dark:text-slate-100 shadow-xs"
                  >
                    {paymentMethods.filter((pm) => pm.isActive).map((pm) => (
                      <option key={pm.id} value={pm.name}>
                        {pm.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Payment Method Active Dynamic Preview */}
                {(() => {
                  const activeMethod = paymentMethods.find((pm) => pm.name === selectedPaymentMethod) || paymentMethods[0];
                  if (!activeMethod) return null;

                  return (
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                      {activeMethod.type === 'qris' && (
                        <div className="text-center space-y-2">
                          {activeMethod.qrisImageUrl ? (
                            <img src={activeMethod.qrisImageUrl} alt={activeMethod.name} className="w-36 h-36 mx-auto rounded-2xl object-cover border shadow-md" />
                          ) : (
                            <QrCode className="w-20 h-20 mx-auto text-slate-900 dark:text-slate-100" />
                          )}
                          <p className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">Scan Barcode QRIS Resmi di Atas</p>
                        </div>
                      )}

                      {activeMethod.type === 'bank_transfer' && (
                        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                              NOMOR REKENING BANK TRANSFER
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-lg font-black text-slate-900 dark:text-white tracking-widest">
                                {activeMethod.accountNumber || '888-019-2026'}
                              </span>
                              <span className="text-xs text-slate-500 font-bold">a.n {activeMethod.accountHolder || 'Klinik Alwi'}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopyAccount(activeMethod.accountNumber || '888-019-2026')}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                          >
                            {copiedAccount === (activeMethod.accountNumber || '888-019-2026') ? (
                              <>
                                <Check className="w-4 h-4 text-yellow-300" /> Tersalin!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" /> Salin No. Rekening
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-medium">
                        💡 <strong>Petunjuk:</strong> {activeMethod.instructions || 'Harap konfirmasi ke petugas kasir setelah melakukan pembayaran.'}
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer transition"
              >
                Tutup Window
              </button>

              {selectedInvoice.payment_status !== 'Paid' ? (
                isPatient ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-xs">
                    <Lock className="w-4 h-4" /> Pelunasan Wajib Dikonfirmasi Petugas Kasir / Admin Klinik
                  </div>
                ) : (
                  <button
                    onClick={handleConfirmPay}
                    className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-lg shadow-sky-600/30 flex items-center gap-2 cursor-pointer transition"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Selesaikan & Konfirmasi Pembayaran Lunas
                  </button>
                )
              ) : (
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition"
                >
                  <Printer className="w-4 h-4" /> Cetak Kuitansi Resmi
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

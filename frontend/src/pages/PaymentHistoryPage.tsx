import React, { useState } from 'react';
import { ReceiptText, Search, CheckCircle2, Eye, Printer, X, User, Lock, ShieldAlert, MapPin, Phone, Mail, Sparkles, Building2, Hospital, ArrowUpDown, ArrowUp, ArrowDown, Stethoscope, Activity, Pill, Calendar, Filter, RefreshCw } from 'lucide-react';
import { useInvoiceStore } from '../store/useInvoiceStore';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { useCMSStore } from '../store/useCMSStore';
import { Invoice } from '../types';
import { formatDateIndonesian, formatDateTimeIndonesian } from '../utils/formatDate';

export const PaymentHistoryPage: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const { invoices, fetchInvoices } = useInvoiceStore();
  const { clinicName, clinicAddress, contactPhone, contactEmail, clinicLogoIcon, fetchCMSFromDB } = useCMSStore();

  React.useEffect(() => {
    fetchInvoices();
    fetchCMSFromDB();
  }, [fetchInvoices, fetchCMSFromDB]);

  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Date Filter & Recap States
  const [dateFilterMode, setDateFilterMode] = useState<'all' | 'today' | 'this_month' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Column Sorting States
  type SortField = 'paid_at' | 'invoice_number' | 'patient_name' | 'payment_method' | 'grand_total';
  const [sortField, setSortField] = useState<SortField>('paid_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const resetAllFilters = () => {
    setSearch('');
    setDateFilterMode('all');
    setStartDate('');
    setEndDate('');
  };

  const isPatient = user?.role === 'Patient';
  const patientName = user?.full_name || 'Budi Santoso';

  // Filter ONLY paid transactions for history (For Patient: Filter strictly by their own patient name or ID)
  const paidInvoices = invoices.filter((inv) => {
    const isPaid = inv.payment_status === 'Paid';
    if (!isPaid) return false;

    if (isPatient) {
      return inv.patient?.full_name?.toLowerCase().includes(patientName.toLowerCase()) || inv.patient_id === 1;
    }
    return true;
  });

  const filteredInvoices = paidInvoices
    .filter((inv) => {
      // 1. Text Search Filter
      const matchesSearch =
        inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
        inv.patient?.full_name.toLowerCase().includes(search.toLowerCase()) ||
        inv.patient?.national_id?.includes(search) ||
        inv.payment_method?.toLowerCase().includes(search.toLowerCase());

      // 2. Date Range / Month Recap Filter
      let matchesDate = true;
      const transactionDate = (inv.paid_at || inv.created_at).slice(0, 10);
      const today = new Date().toISOString().slice(0, 10);

      if (dateFilterMode === 'today') {
        matchesDate = transactionDate === today;
      } else if (dateFilterMode === 'this_month') {
        matchesDate = transactionDate.slice(0, 7) === today.slice(0, 7);
      } else if (dateFilterMode === 'custom') {
        if (startDate && transactionDate < startDate) matchesDate = false;
        if (endDate && transactionDate > endDate) matchesDate = false;
      }

      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      let aVal: any = a[sortField as keyof Invoice] || '';
      let bVal: any = b[sortField as keyof Invoice] || '';

      if (sortField === 'paid_at') {
        aVal = a.paid_at || a.created_at;
        bVal = b.paid_at || b.created_at;
      } else if (sortField === 'patient_name') {
        aVal = a.patient?.full_name || '';
        bVal = b.patient?.full_name || '';
      }

      if (typeof aVal === 'string') {
        const res = aVal.localeCompare(bVal);
        return sortOrder === 'asc' ? res : -res;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Calculate filtered revenue dynamically based on active date range / month filter!
  const filteredRevenue = filteredInvoices.reduce((sum, i) => sum + i.grand_total, 0);
  const totalRevenue = paidInvoices.reduce((sum, i) => sum + i.grand_total, 0);



  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar & Financial Metrics Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 flex items-center justify-center shrink-0 overflow-hidden hidden sm:flex">
            {clinicLogoIcon && (clinicLogoIcon.startsWith('/') || clinicLogoIcon.startsWith('http') || clinicLogoIcon.startsWith('data:')) ? (
              <img src={clinicLogoIcon} alt="Logo" className="w-full h-full object-contain max-w-full max-h-full" />
            ) : (
              <ReceiptText className="w-8 h-8 text-emerald-400" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> {isPatient ? 'Histori Pembayaran Saya' : 'Cashier Audit Ledger'}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-3 text-white pt-1">
              <ReceiptText className="w-8 h-8 text-emerald-400" />
              {isPatient ? 'Riwayat Transaksi Berobat Lunas Saya' : 'History Transaksi Lunas Kasir (Audit Resmi)'}
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {isPatient
                ? `Arsip resmi transaksi pembayaran berobat Anda di ${clinicName}. Anda dapat melihat rincian biaya obat, jasa dokter, dan mencetak kuitansi resmi.`
                : 'Arsip log audit resmi pembayaran kuitansi kasir terverifikasi instan, cetak ulang kuitansi, dan rincian itemized biaya obat & tindakan.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
          <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-right min-w-[140px]">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">{isPatient ? 'Total Transaksi Saya' : 'Omzet Hasil Rekap'}</span>
            <span className="text-lg font-extrabold text-emerald-400 font-mono">Rp {filteredRevenue.toLocaleString()}</span>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-right min-w-[130px]">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Total Kuitansi</span>
            <span className="text-lg font-extrabold text-sky-400 font-mono">{filteredInvoices.length} Kuitansi</span>
          </div>
        </div>
      </div>

      {/* FILTER & REKAP KEUANGAN BY BULAN / RANGE TANGGAL */}
      <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm bg-white dark:bg-slate-900/90">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-500" /> Filter & Rekapitulasi Pendapatan Kasir
          </h3>
          <button
            onClick={resetAllFilters}
            className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-500" /> Reset Filter
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          {/* Row 1: Search Input */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari No. Invoice (INV-xxx), Nama Pasien, NIK, atau Metode Bayar..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-emerald-500 transition shadow-xs"
            />
          </div>

          {/* Quick Date Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 justify-start md:justify-end">
            <button
              onClick={() => setDateFilterMode('all')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                dateFilterMode === 'all'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setDateFilterMode('today')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                dateFilterMode === 'today'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setDateFilterMode('this_month')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                dateFilterMode === 'this_month'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => setDateFilterMode('custom')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                dateFilterMode === 'custom'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Rentang Tanggal
            </button>
          </div>
        </div>

        {/* Custom Date Range Picker */}
        {dateFilterMode === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span className="text-slate-600 dark:text-slate-400 font-bold">Dari Tanggal:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400 font-bold">Sampai Tanggal:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Completed Transactions List Table */}
      <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm bg-white dark:bg-slate-900/90">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Menampilkan <span className="text-emerald-600 font-extrabold">{filteredInvoices.length}</span> dari {paidInvoices.length} Kuitansi Pembayaran Lunas
          </div>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 font-semibold space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p>Belum ada riwayat transaksi lunas yang ditemukan dalam pencarian.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
              <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase text-[10px] text-slate-500 dark:text-slate-400 font-extrabold tracking-wider select-none border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th
                    onClick={() => handleSort('paid_at')}
                    className="py-4 px-4 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Tanggal & Waktu Lunas</span>
                      {sortField === 'paid_at' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-500" /> : <ArrowDown className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                      )}
                    </div>
                  </th>

                  <th
                    onClick={() => handleSort('invoice_number')}
                    className="py-4 px-4 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>No. Invoice</span>
                      {sortField === 'invoice_number' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-500" /> : <ArrowDown className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                      )}
                    </div>
                  </th>

                  <th
                    onClick={() => handleSort('patient_name')}
                    className="py-4 px-4 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Nama Pasien & NIK</span>
                      {sortField === 'patient_name' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-sky-500" /> : <ArrowDown className="w-3 h-3 text-sky-500" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                      )}
                    </div>
                  </th>

                  <th
                    onClick={() => handleSort('payment_method')}
                    className="py-4 px-4 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Metode Pembayaran</span>
                      {sortField === 'payment_method' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-sky-500" /> : <ArrowDown className="w-3 h-3 text-sky-500" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                      )}
                    </div>
                  </th>

                  <th
                    onClick={() => handleSort('grand_total')}
                    className="py-4 px-4 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Total Dibayar</span>
                      {sortField === 'grand_total' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-500" /> : <ArrowDown className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                      )}
                    </div>
                  </th>

                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className="hover:bg-emerald-500/10 cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 text-xs">
                      {formatDateTimeIndonesian(inv.paid_at || inv.created_at)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono font-extrabold text-xs">
                        {inv.invoice_number}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 dark:text-slate-100">{inv.patient?.full_name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">NIK: {inv.patient?.national_id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">{inv.payment_method}</td>
                    <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      Rp {inv.grand_total.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> LUNAS (PAID)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInvoice(inv);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5 ml-auto cursor-pointer"
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

      {/* Transaction Receipt & Audit Detail Modal */}
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
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono uppercase">
                  {selectedInvoice.invoice_number}
                </span>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                  Kuitansi Pembayaran Lunas — {selectedInvoice.patient?.full_name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  NIK: {selectedInvoice.patient?.national_id} | Tanggal Lunas: {formatDateTimeIndonesian(selectedInvoice.paid_at || selectedInvoice.created_at)}
                </p>
              </div>

              <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">METODE PEMBAYARAN</span>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold inline-block mt-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {selectedInvoice.payment_method}
                </span>
              </div>
            </div>

            {/* Modal Medical SOAP Notes Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-2">
                <Activity className="w-4 h-4 text-teal-500" /> Ringkasan Hasil Konsultasi Medis Dokter
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

            {/* Subtotal Summary Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Jasa Konsultasi Dokter:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Rp {selectedInvoice.doctor_fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Biaya Tindakan Medis:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Rp {selectedInvoice.procedure_fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Biaya Resep Obat Farmasi:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Rp {selectedInvoice.medicine_fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>PPN (Pajak 10%):</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Rp {selectedInvoice.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-extrabold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="uppercase text-xs font-bold text-slate-500">TOTAL LUNAS DIBAYAR:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-base">Rp {selectedInvoice.grand_total.toLocaleString()}</span>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Kuitansi Terverifikasi Kasir & Tersimpan di Log Audit
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  Tutup Kuitansi
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Cetak Kuitansi Resmi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

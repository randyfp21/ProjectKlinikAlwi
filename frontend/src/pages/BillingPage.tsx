import React, { useState } from 'react';
import { CreditCard, CheckCircle2, Printer, QrCode, FileText, Receipt, User, Lock, Wallet, ArrowLeft, Building2, DollarSign, Eye, X, History, CalendarX, MapPin, Phone, Mail } from 'lucide-react';
import { useInvoiceStore } from '../store/useInvoiceStore';
import { useAuthStore } from '../store/useAuthStore';
import { useCMSStore } from '../store/useCMSStore';
import { Invoice } from '../types';

export const BillingPage: React.FC = () => {
  const { user } = useAuthStore();
  const { invoices, payInvoice } = useInvoiceStore();
  const { clinicName, clinicAddress, contactPhone, contactEmail } = useCMSStore();

  const isPatient = user?.role === 'Patient';
  const [paymentSuccess, setPaymentSuccess] = useState('');

  // Selected Patient Invoice for Cashier Payment Processing
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('QRIS');

  // Filter invoices strictly matching patient name or ID
  const patientName = user?.full_name || 'Budi Santoso';
  const displayInvoices = isPatient
    ? invoices.filter((i) => i.patient?.full_name?.toLowerCase().includes(patientName.toLowerCase()) || i.patient_id === 1)
    : invoices;

  // Unpaid invoices (Generated from doctor consultation)
  const pendingInvoices = displayInvoices.filter((i) => i.payment_status === 'Pending');

  // Paid invoices (Personal Transaction History)
  const paidInvoicesHistory = displayInvoices.filter((i) => i.payment_status === 'Paid');

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
    <div className="space-y-6 font-sans">
      {paymentSuccess && (
        <div className="p-4 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-lg flex items-center justify-between animate-bounce">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> {paymentSuccess}
          </span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            {isPatient ? <Wallet className="w-7 h-7 text-sky-500" /> : <CreditCard className="w-7 h-7 text-sky-500" />}
            {isPatient ? 'Portal Pembayaran & Tagihan Saya' : 'Billing & Cashier Management'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isPatient
              ? 'Lihat rincian invoice tagihan hasil konsultasi dokter hari ini, scan kode QRIS, dan riwayat pembayaran transaksi Anda'
              : 'Pilih pasien yang tiba di meja kasir untuk melihat rincian invoice, kode QRIS, info rekening, dan cetak kuitansi'}
          </p>
        </div>

        {isPatient && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-xs font-bold font-mono">
            <User className="w-4 h-4 text-sky-500" /> Patient ID: #{user?.id || 1} ({patientName})
          </div>
        )}
      </div>

      {/* =========================================================================
          VIEW 1: PATIENT ROLE -> UNPAID CONSULTATION INVOICES & PERSONAL PAID HISTORY
         ========================================================================= */}
      {isPatient ? (
        <div className="space-y-6">
          {/* Section 1: Active Unpaid Invoices Generated from Doctor Consultation */}
          <div className="glass-card p-6 rounded-2xl border space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-500" /> Tagihan Konsultasi Dokter Hari Ini ({pendingInvoices.length})
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">Otomatis terbuat setelah dokter menyimpan rekam medis</span>
            </div>

            {pendingInvoices.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 font-semibold space-y-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                <CalendarX className="w-10 h-10 text-slate-400 mx-auto" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Kamu belum ada agenda / tagihan hari ini</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                    Belum ada invoice yang diterbitkan oleh dokter untuk akun pasien Anda hari ini. Invoice tagihan akan muncul secara otomatis di sini setelah dokter selesai melakukan pemeriksaan dan menyimpan rekam medis.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingInvoices.map((inv) => (
                  <div key={inv.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
                      <div>
                        <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-600 border border-sky-500/20 font-mono font-bold text-xs">
                          {inv.invoice_number}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                          Dokter: {inv.items.find((i) => i.item_type === 'Doctor Fee')?.item_name || 'dr. Alwi Shahab, Sp.PD'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Tanggal: {new Date(inv.created_at).toLocaleDateString()}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block">TOTAL TAGIHAN</span>
                        <span className="text-xl font-extrabold text-sky-500">Rp {inv.grand_total.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Itemized breakdown table for patient */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                        <thead className="bg-slate-200/60 dark:bg-slate-900/60 uppercase text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wider">
                          <tr>
                            <th className="p-2.5">Kategori</th>
                            <th className="p-2.5">Rincian Item</th>
                            <th className="p-2.5">Qty</th>
                            <th className="p-2.5">Expired Date</th>
                            <th className="p-2.5 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                          {inv.items.map((item) => (
                            <tr key={item.id}>
                              <td className="p-2.5 font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase">{item.item_type}</td>
                              <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-100">{item.item_name}</td>
                              <td className="p-2.5 font-bold">{item.quantity}</td>
                              <td className="p-2.5">
                                {item.item_type === 'Medicine' ? (
                                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 font-mono text-[10px] font-bold">
                                    {item.expiry_date || '2027-12-31'}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-mono text-[10px]">-</span>
                                )}
                              </td>
                              <td className="p-2.5 text-right font-bold text-sky-500">Rp {item.subtotal.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* QRIS & Payment Options Box for Patient */}
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <QrCode className="w-16 h-16 text-slate-800 dark:text-slate-100 shrink-0" />
                        <div className="text-xs">
                          <span className="font-bold text-slate-900 dark:text-slate-100 block">Scan QRIS / Transfer Pembayaran</span>
                          <span className="text-slate-500 dark:text-slate-400 block text-[11px]">BCA Account: 888-019-2026 a.n. Klinik Alwi</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">Mendukung GoPay, OVO, ShopeePay, & Mobile Banking</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 shrink-0"
                      >
                        <CreditCard className="w-4 h-4" /> Bayar / Tampilkan Detail
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Personal Paid Transaction History */}
          <div className="glass-card p-6 rounded-2xl border space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-500" /> Riwayat Transaksi Pembayaran Saya ({paidInvoicesHistory.length})
              </h2>
            </div>

            {paidInvoicesHistory.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-semibold">
                Belum ada riwayat transaksi pembayaran lunas.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                    <tr>
                      <th className="p-3.5">Tanggal Pembayaran</th>
                      <th className="p-3.5">Nomor Invoice</th>
                      <th className="p-3.5">Metode Pembayaran</th>
                      <th className="p-3.5">Total Dibayar</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Kuitansi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {paidInvoicesHistory.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                          {inv.paid_at ? new Date(inv.paid_at).toLocaleString() : inv.created_at}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-mono font-bold">
                            {inv.invoice_number}
                          </span>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">{inv.payment_method}</td>
                        <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          Rp {inv.grand_total.toLocaleString()}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> LUNAS
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1 ml-auto transition shadow-sm"
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
            VIEW 2: ADMIN / CASHIER ROLE -> PATIENT BILLING QUEUE
           ========================================================================= */
        <div className="glass-card p-6 rounded-2xl border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-sky-500" />
              Patients Ready for Cashier Billing ({displayInvoices.length})
            </h2>
          </div>

          {displayInvoices.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 font-semibold space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p>No pending patient invoices at the cashier desk.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                  <tr>
                    <th className="p-3.5">Invoice No</th>
                    <th className="p-3.5">Patient Name & NIK</th>
                    <th className="p-3.5">Doctor Fee</th>
                    <th className="p-3.5">Prescription Fee</th>
                    <th className="p-3.5">Grand Total</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {displayInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => setSelectedInvoice(inv)}
                      className="hover:bg-sky-500/10 cursor-pointer transition"
                    >
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-600 border border-sky-500/20 font-mono font-bold">
                          {inv.invoice_number}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{inv.patient?.full_name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">NIK: {inv.patient?.national_id}</div>
                      </td>
                      <td className="p-3.5">Rp {inv.doctor_fee.toLocaleString()}</td>
                      <td className="p-3.5">Rp {inv.medicine_fee.toLocaleString()}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 text-sm">
                        Rp {inv.grand_total.toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          inv.payment_status === 'Paid'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}>
                          {inv.payment_status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/30 transition flex items-center gap-1.5 ml-auto"
                        >
                          <CreditCard className="w-4 h-4" /> Process Billing
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Clinic Letterhead / Kop Surat Resmi Receipt Header */}
            <div className="border-b-2 border-slate-800 dark:border-slate-200 pb-3 text-center space-y-1">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 uppercase">{clinicName}</h1>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-500" /> {clinicAddress}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-center gap-4">
                <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-sky-500" /> Telp/WA: <strong>{contactPhone}</strong></span>
                <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-teal-500" /> Email: <strong>{contactEmail}</strong></span>
              </p>
            </div>

            <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-lg font-mono">
                INV
              </div>
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-500 border border-sky-500/20 font-mono">
                  {selectedInvoice.invoice_number}
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  Invoice Konsultasi: {selectedInvoice.patient?.full_name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">NIK: {selectedInvoice.patient?.national_id} | Status: {selectedInvoice.payment_status}</p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wider">
                  <tr>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Rincian Item / Obat</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Harga Jual</th>
                    <th className="p-3">Expired Date</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {selectedInvoice.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-bold">
                          {item.item_type}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">{item.item_name}</td>
                      <td className="p-3 font-bold">{item.quantity}</td>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                        Rp {item.unit_price.toLocaleString()}
                      </td>
                      <td className="p-3">
                        {item.item_type === 'Medicine' ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 font-mono text-[10px] font-bold">
                            {item.expiry_date || '2027-12-31'}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-[10px]">-</span>
                        )}
                      </td>
                      <td className="p-3 text-right font-bold text-sky-500">Rp {item.subtotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Subtotal Summary */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1 text-xs text-right">
              <div className="text-slate-500 dark:text-slate-400">Doctor Fee: <span className="font-semibold text-slate-800 dark:text-slate-200">Rp {selectedInvoice.doctor_fee.toLocaleString()}</span></div>
              <div className="text-slate-500 dark:text-slate-400">Procedure Fee: <span className="font-semibold text-slate-800 dark:text-slate-200">Rp {selectedInvoice.procedure_fee.toLocaleString()}</span></div>
              <div className="text-slate-500 dark:text-slate-400">Prescription Medicine Fee: <span className="font-semibold text-slate-800 dark:text-slate-200">Rp {selectedInvoice.medicine_fee.toLocaleString()}</span></div>
              <div className="text-slate-500 dark:text-slate-400">PPN (10% Tax): <span className="font-semibold text-slate-800 dark:text-slate-200">Rp {selectedInvoice.tax.toLocaleString()}</span></div>
              <div className="text-base font-extrabold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-800">
                Grand Total: <span className="text-sky-500">Rp {selectedInvoice.grand_total.toLocaleString()}</span>
              </div>
            </div>

            {/* QRIS / Method Selector */}
            {selectedInvoice.payment_status !== 'Paid' && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                <label className="text-slate-700 dark:text-slate-300 block font-semibold">Pilih Metode Transaksi:</label>
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs focus:outline-none text-slate-900 dark:text-slate-100"
                >
                  <option value="QRIS">📱 QRIS (Scan Barcode Instant)</option>
                  <option value="Bank Transfer (BCA)">🏦 Bank Transfer BCA (888-019-2026)</option>
                  <option value="Cash (Tunai)">💵 Cash / Tunai di Kasir</option>
                </select>

                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                  <QrCode className="w-16 h-16 mx-auto text-slate-800 dark:text-slate-100" />
                  <p className="font-bold text-slate-900 dark:text-slate-100">Scan QRIS Instant Payment</p>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold"
              >
                Tutup
              </button>

              {selectedInvoice.payment_status !== 'Paid' ? (
                <button
                  onClick={handleConfirmPay}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Konfirmasi Pembayaran Lunas
                </button>
              ) : (
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
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

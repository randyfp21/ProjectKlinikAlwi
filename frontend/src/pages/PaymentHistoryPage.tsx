import React, { useState } from 'react';
import { ReceiptText, Search, CheckCircle2, Eye, Printer, X, User, Lock, ShieldAlert, MapPin, Phone, Mail } from 'lucide-react';
import { useInvoiceStore } from '../store/useInvoiceStore';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { useCMSStore } from '../store/useCMSStore';
import { Invoice } from '../types';
import { formatDateTimeIndonesian } from '../utils/formatDate';

export const PaymentHistoryPage: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const { invoices } = useInvoiceStore();
  const { clinicName, clinicAddress, contactPhone, contactEmail } = useCMSStore();

  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Filter ONLY paid transactions for history
  const paidInvoices = invoices.filter((inv) => inv.payment_status === 'Paid');

  const filteredInvoices = paidInvoices.filter(
    (inv) =>
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      inv.patient?.full_name.toLowerCase().includes(search.toLowerCase()) ||
      inv.payment_method?.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="p-8 text-center space-y-4 font-sans">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Access Restricted (Admin Only)</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          The Payment History Audit Archive is strictly restricted to Administrators and Super Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ReceiptText className="w-7 h-7 text-emerald-500" /> Completed Payment Transactions History (Admin Exclusive)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit log of all completed and paid clinic cashier transactions with itemized fee breakdowns
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-medium border border-slate-800">
          <Lock className="w-4 h-4 text-emerald-400" /> Administrator Exclusive Access
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4 rounded-2xl border flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter payment history by invoice number (INV-xxx), patient name, or payment method..."
          className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
        />
      </div>

      {/* Completed Transactions List Table */}
      <div className="glass-card rounded-2xl border overflow-hidden shadow-sm">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 font-semibold space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p>No completed paid transactions found in history archive.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase text-[10px] text-slate-400 font-semibold">
                <tr>
                  <th className="p-3.5">Paid Date & Time</th>
                  <th className="p-3.5">Invoice Number</th>
                  <th className="p-3.5">Patient Name & NIK</th>
                  <th className="p-3.5">Payment Method</th>
                  <th className="p-3.5">Grand Total Paid</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Receipt & Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className="hover:bg-emerald-500/10 cursor-pointer transition"
                  >
                    <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                      {formatDateTimeIndonesian(inv.paid_at || inv.created_at)}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-mono font-bold">
                        {inv.invoice_number}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{inv.patient?.full_name}</div>
                      <div className="text-[10px] text-slate-400">NIK: {inv.patient?.national_id}</div>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">{inv.payment_method}</td>
                    <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      Rp {inv.grand_total.toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> PAID / LUNAS
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1 ml-auto transition shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Receipt
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 border shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto">
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
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-lg font-mono">
                PAID
              </div>
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-mono">
                  {selectedInvoice.invoice_number}
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  Official Cashier Receipt — {selectedInvoice.patient?.full_name}
                </h2>
                <p className="text-xs text-slate-400">
                  Paid Date: {formatDateTimeIndonesian(selectedInvoice.paid_at || selectedInvoice.created_at)} | Method: {selectedInvoice.payment_method}
                </p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase text-[10px] text-slate-400 font-semibold">
                  <tr>
                    <th className="p-3">Type</th>
                    <th className="p-3">Item Description</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Unit Price</th>
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
                      <td className="p-3">Rp {item.unit_price.toLocaleString()}</td>
                      <td className="p-3 text-right font-bold text-emerald-500">Rp {item.subtotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Subtotal Summary */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1 text-xs text-right">
              <div className="text-slate-500">Doctor Fee: <span className="font-semibold text-slate-800 dark:text-slate-200">Rp {selectedInvoice.doctor_fee.toLocaleString()}</span></div>
              <div className="text-slate-500">Procedure Fee: <span className="font-semibold text-slate-800 dark:text-slate-200">Rp {selectedInvoice.procedure_fee.toLocaleString()}</span></div>
              <div className="text-slate-500">Prescription Medicine Fee: <span className="font-semibold text-slate-800 dark:text-slate-200">Rp {selectedInvoice.medicine_fee.toLocaleString()}</span></div>
              <div className="text-slate-500">PPN (10% Tax): <span className="font-semibold text-slate-800 dark:text-slate-200">Rp {selectedInvoice.tax.toLocaleString()}</span></div>
              <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                Total Paid (LUNAS): <span>Rp {selectedInvoice.grand_total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Transaction Verified & Archived in Audit Log
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
                >
                  <Printer className="w-4 h-4" /> Print Cashier Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

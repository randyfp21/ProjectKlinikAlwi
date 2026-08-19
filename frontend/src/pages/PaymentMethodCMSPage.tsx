import React, { useState } from 'react';
import { CreditCard, Plus, Edit3, Trash2, CheckCircle2, Upload, QrCode, Building2, Wallet, Lock, ShieldCheck, Save, Eye, X } from 'lucide-react';
import { useCMSStore, CMSPaymentMethod } from '../store/useCMSStore';
import { useAuthStore } from '../store/useAuthStore';

export const PaymentMethodCMSPage: React.FC = () => {
  const { user } = useAuthStore();
  const cms = useCMSStore();
  const isSuperAdmin = user?.role === 'Super Admin' || user?.role === 'Admin';

  const [toastMessage, setToastMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<CMSPaymentMethod | null>(null);
  const [uploading, setUploading] = useState(false);

  // New Payment Method Form State
  const [newMethodName, setNewMethodName] = useState('');
  const [newMethodType, setNewMethodType] = useState<'qris' | 'bank_transfer' | 'cash'>('bank_transfer');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newAccountHolder, setNewAccountHolder] = useState('');
  const [newQrisImageUrl, setNewQrisImageUrl] = useState('');
  const [newInstructions, setNewInstructions] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleQRISPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditMode: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      // Convert local file to base64 / blob URL preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultStr = reader.result as string;
        if (isEditMode && editingMethod) {
          setEditingMethod({ ...editingMethod, qrisImageUrl: resultStr });
        } else {
          setNewQrisImageUrl(resultStr);
        }
        setUploading(false);
        showToast('Foto Barcode QRIS berhasil diunggah!');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploading(false);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMethodName) return;

    cms.addPaymentMethod({
      name: newMethodName,
      type: newMethodType,
      accountNumber: newAccountNumber,
      accountHolder: newAccountHolder,
      qrisImageUrl: newQrisImageUrl || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
      instructions: newInstructions || 'Petunjuk transaksi pembayaran resmi Klinik Utama Alwi.',
      isActive: true,
    });

    setShowAddModal(false);
    setNewMethodName('');
    setNewAccountNumber('');
    setNewAccountHolder('');
    setNewQrisImageUrl('');
    setNewInstructions('');
    showToast('Metode Pembayaran Baru Berhasil Ditambahkan & Disimpan ke Database!');
  };

  const handleSaveEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMethod) return;

    cms.updatePaymentMethod(editingMethod.id, editingMethod);
    setEditingMethod(null);
    showToast(`Metode "${editingMethod.name}" Berhasil Diperbarui & Disimpan ke Database!`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus metode pembayaran ini?')) {
      cms.deletePaymentMethod(id);
      showToast('Metode Pembayaran Berhasil Dihapus Dari Database!');
    }
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-yellow-300" />
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Kustomisasi Kasir & CMS Pembayaran
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-3 text-white pt-1">
            <CreditCard className="w-8 h-8 text-emerald-400" />
            Manajemen Metode Transaksi & Rekening Klinik
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Superadmin & Admin dapat menambah opsi metode pembayaran baru, nomor rekening bank, mengunggah barcode QRIS resmi, dan mengatur petunjuk transaksi yang tampil di Kasir & Portal Pasien.
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-black text-xs shadow-xl transition flex items-center gap-2 shrink-0 cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" /> Tambah Metode / Rekening Baru
          </button>
        )}
      </div>

      {/* PAYMENT METHODS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cms.paymentMethods.map((pm) => (
          <div
            key={pm.id}
            className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-xl transition"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider font-mono border ${
                  pm.type === 'qris'
                    ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
                    : pm.type === 'bank_transfer'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                }`}>
                  {pm.type === 'qris' ? '📱 QRIS / e-Wallet' : pm.type === 'bank_transfer' ? '🏦 Bank Transfer' : '💵 Cash Tunai'}
                </span>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${pm.isActive ? 'bg-emerald-500/20 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                  {pm.isActive ? 'Aktif' : 'Non-Aktif'}
                </span>
              </div>

              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base leading-snug">
                {pm.name}
              </h3>

              {pm.type === 'bank_transfer' && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                  <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">NOMOR REKENING TRANSFER</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-black text-slate-900 dark:text-white tracking-wider">{pm.accountNumber || '888-019-2026'}</span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">a.n {pm.accountHolder || 'Klinik Utama Alwi'}</span>
                  </div>
                </div>
              )}

              {pm.type === 'qris' && pm.qrisImageUrl && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-center space-y-2">
                  <img src={pm.qrisImageUrl} alt={pm.name} className="w-32 h-32 mx-auto rounded-xl object-cover border shadow-sm" />
                  <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 block">Barcode QRIS Terverifikasi</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <span className="font-bold text-slate-700 dark:text-slate-300 block text-[10px] uppercase mb-0.5">Petunjuk Transaksi:</span>
                {pm.instructions}
              </div>
            </div>

            {isSuperAdmin && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-end gap-2">
                <button
                  onClick={() => setEditingMethod(pm)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Metode
                </button>
                <button
                  onClick={() => handleDelete(pm.id)}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ADD METHOD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <form onSubmit={handleAddSubmit} className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-500" /> Tambah Metode Pembayaran CMS Baru
              </h2>
              <button onClick={() => setShowAddModal(false)} type="button" className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Tipe Metode Pembayaran</label>
                <select
                  value={newMethodType}
                  onChange={(e) => setNewMethodType(e.target.value as any)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  <option value="bank_transfer">🏦 Transfer Bank (Nomor Rekening & Atas Nama)</option>
                  <option value="qris">📱 QRIS (Upload Foto Barcode QRIS)</option>
                  <option value="cash">💵 Cash / Tunai Langsung di Meja Kasir</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Nama Label Pembayaran (Tampil di Kasir/Dropdown)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 🏦 Bank Mandiri (No Rek: 123-000-456)"
                  value={newMethodName}
                  onChange={(e) => setNewMethodName(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              {newMethodType === 'bank_transfer' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Nomor Rekening Bank</label>
                    <input
                      type="text"
                      required
                      placeholder="888-019-2026"
                      value={newAccountNumber}
                      onChange={(e) => setNewAccountNumber(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold text-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Atas Nama (Pemilik Rekening)</label>
                    <input
                      type="text"
                      required
                      placeholder="Klinik Utama Alwi"
                      value={newAccountHolder}
                      onChange={(e) => setNewAccountHolder(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {newMethodType === 'qris' && (
                <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border">
                  <label className="text-slate-700 dark:text-slate-300 block font-semibold">Upload Gambar Barcode QRIS Resmi</label>
                  {newQrisImageUrl && (
                    <img src={newQrisImageUrl} alt="Preview QRIS" className="w-24 h-24 rounded-xl object-cover border mx-auto" />
                  )}
                  <label className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" /> Upload Foto Barcode QRIS
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleQRISPhotoUpload(e, false)}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Petunjuk Transaksi & Informasi Pembayaran</label>
                <textarea
                  rows={2}
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder="Petunjuk transfer / scan untuk ditampilkan ke pasien..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium text-slate-900 dark:text-slate-100 focus:outline-none text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Simpan Metode Ke Database
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT METHOD MODAL */}
      {editingMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <form onSubmit={handleSaveEditSubmit} className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" /> Edit Metode Pembayaran CMS
              </h2>
              <button onClick={() => setEditingMethod(null)} type="button" className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Nama Label Pembayaran</label>
                <input
                  type="text"
                  required
                  value={editingMethod.name}
                  onChange={(e) => setEditingMethod({ ...editingMethod, name: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              {editingMethod.type === 'bank_transfer' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Nomor Rekening Bank</label>
                    <input
                      type="text"
                      required
                      value={editingMethod.accountNumber || ''}
                      onChange={(e) => setEditingMethod({ ...editingMethod, accountNumber: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold text-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Atas Nama</label>
                    <input
                      type="text"
                      required
                      value={editingMethod.accountHolder || ''}
                      onChange={(e) => setEditingMethod({ ...editingMethod, accountHolder: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {editingMethod.type === 'qris' && (
                <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border">
                  <label className="text-slate-700 dark:text-slate-300 block font-semibold">Foto Barcode QRIS Resmi</label>
                  {editingMethod.qrisImageUrl && (
                    <img src={editingMethod.qrisImageUrl} alt="QRIS" className="w-28 h-28 rounded-xl object-cover border mx-auto" />
                  )}
                  <label className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" /> Unggah Foto Barcode QRIS Baru
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleQRISPhotoUpload(e, true)}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Petunjuk Transaksi</label>
                <textarea
                  rows={2}
                  value={editingMethod.instructions || ''}
                  onChange={(e) => setEditingMethod({ ...editingMethod, instructions: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium text-slate-900 dark:text-slate-100 focus:outline-none text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingMethod(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Update Metode & Simpan Ke DB
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

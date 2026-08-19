import React, { useState, useEffect } from 'react';
import { Gift, Plus, Trash2, Edit3, Tag, Upload, Save, CheckCircle2, RotateCcw } from 'lucide-react';
import { useCMSStore, CMSPromo } from '../store/useCMSStore';
import { useAuthStore } from '../store/useAuthStore';
import { apiClient } from '../api/client';

export const PromosArticlesPage: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';

  const cms = useCMSStore();

  useEffect(() => {
    cms.fetchCMSFromDB();
  }, []);

  const [toastMessage, setToastMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  // Edit and Add Promo Modal States
  const [editingPromo, setEditingPromo] = useState<CMSPromo | null>(null);
  const [showAddPromoModal, setShowAddPromoModal] = useState(false);

  const [newPromoForm, setNewPromoForm] = useState({
    title: '',
    badge: 'PROMO SPESIAL',
    discountTag: 'DISKON 20%',
    promoCode: 'PROMO-ALWI20',
    validUntil: 'Berlaku s/d Akhir Bulan',
    description: '',
    photoUrl: '',
    actionUrl: '/login',
  });

  const [promosHeaderTitle, setPromosHeaderTitle] = useState(cms.promosHeaderTitle);

  useEffect(() => {
    setPromosHeaderTitle(cms.promosHeaderTitle);
  }, [cms.promosHeaderTitle]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Upload Promo Photo Helper
  const handlePromoPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, promoId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    setUploading(true);
    try {
      const res = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && res.data.data.url) {
        const photoUrl = res.data.data.url;
        cms.updatePromo(promoId, { photoUrl });
        if (editingPromo && editingPromo.id === promoId) {
          setEditingPromo({ ...editingPromo, photoUrl });
        }
        await cms.saveCMSToDB();
        showToast('Banner promo berhasil diunggah dan disimpan!');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      showToast('Gagal mengunggah foto promo.');
    } finally {
      setUploading(false);
    }
  };

  const handleNewPromoPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    setUploading(true);
    try {
      const res = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && res.data.data.url) {
        setNewPromoForm({ ...newPromoForm, photoUrl: res.data.data.url });
        showToast('Banner promo baru berhasil diunggah!');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      showToast('Gagal mengunggah foto promo baru.');
    } finally {
      setUploading(false);
    }
  };

  const handleSavePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromo) return;
    cms.updatePromo(editingPromo.id, editingPromo);
    await cms.saveCMSToDB();
    setEditingPromo(null);
    showToast('Data promo & artikel berhasil disimpan!');
  };

  const handleAddPromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    cms.addPromo(newPromoForm);
    await cms.saveCMSToDB();
    setShowAddPromoModal(false);
    setNewPromoForm({
      title: '',
      badge: 'PROMO SPESIAL',
      discountTag: 'DISKON 20%',
      promoCode: 'PROMO-ALWI20',
      validUntil: 'Berlaku s/d Akhir Bulan',
      description: '',
      photoUrl: '',
      actionUrl: '/login',
    });
    showToast('Kartu Promo & Artikel Baru Berhasil Ditambahkan!');
  };

  const handleDeletePromo = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kartu promo ini?')) {
      cms.deletePromo(id);
      await cms.saveCMSToDB();
      showToast('Kartu Promo telah dihapus.');
    }
  };

  const handleSaveHeaderTitle = async () => {
    cms.updateHero({ promosHeaderTitle });
    await cms.saveCMSToDB();
    showToast('Judul Seksi Promo & Artikel berhasil diperbarui!');
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
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-amber-400" /> Pengelolaan Artikel & Promo Kesehatan
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-3 text-white pt-1">
            <Gift className="w-8 h-8 text-amber-400" />
            Manajemen Artikel & Kartu Promo Berlangsung
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Halaman khusus untuk menambah, mengedit narasi promo, mengunggah foto banner penawaran spesial, dan mengatur artikel promo kesehatan yang tampil di Landing Page.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddPromoModal(true)}
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs shadow-xl transition flex items-center gap-2 shrink-0 cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" /> Tambah Promo / Artikel Baru
          </button>
        )}
      </div>

      {/* Section Header Title Form */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Tag className="w-4 h-4 text-amber-500" /> Judul Header Seksi Promo di Landing Page
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={promosHeaderTitle}
            onChange={(e) => setPromosHeaderTitle(e.target.value)}
            disabled={!isAdmin}
            className="flex-1 w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-extrabold text-slate-900 dark:text-slate-100 focus:outline-none"
          />
          {isAdmin && (
            <button
              onClick={handleSaveHeaderTitle}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Save className="w-4 h-4" /> Simpan Judul
            </button>
          )}
        </div>
      </div>

      {/* PROMO CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cms.promos.map((promo) => (
          <div
            key={promo.id}
            className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-xl transition"
          >
            <div className="space-y-4">
              <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={promo.photoUrl}
                  alt={promo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase shadow-lg tracking-wider">
                  {promo.discountTag}
                </span>
                <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white font-mono text-[10px] font-bold border border-white/20">
                  {promo.badge}
                </span>

                {isAdmin && (
                  <label className="absolute bottom-3 right-3 p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer backdrop-blur-md border border-white/20 shadow-lg transition">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePromoPhotoUpload(e, promo.id)}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono text-[10px] font-extrabold border border-sky-500/20 uppercase">
                    KODE: {promo.promoCode}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    🕒 Dibuat: {promo.createdAt || '19 Agustus 2026'}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base leading-snug">
                  {promo.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {promo.description}
                </p>
              </div>
            </div>

            {isAdmin && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-end gap-2">
                <button
                  onClick={() => setEditingPromo(promo)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Promo
                </button>
                <button
                  onClick={() => handleDeletePromo(promo.id)}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* EDIT PROMO MODAL */}
      {editingPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleSavePromoSubmit} className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-500" /> Edit Kartu Promo #{editingPromo.id}
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <img src={editingPromo.photoUrl} alt={editingPromo.title} className="w-16 h-16 rounded-xl object-cover border shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block truncate">{editingPromo.title}</span>
                  <span className="text-slate-400 text-[10px] block truncate">Path: {editingPromo.photoUrl}</span>
                </div>
                <label className="px-3 py-1.5 rounded-xl bg-teal-600 text-white font-bold text-[10px] cursor-pointer shrink-0">
                  Upload Banner Baru
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePromoPhotoUpload(e, editingPromo.id)}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Judul Kartu Promo</label>
                <input
                  type="text"
                  required
                  value={editingPromo.title}
                  onChange={(e) => setEditingPromo({ ...editingPromo, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Label Diskon</label>
                  <input
                    type="text"
                    required
                    value={editingPromo.discountTag}
                    onChange={(e) => setEditingPromo({ ...editingPromo, discountTag: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-extrabold text-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Kode Promo</label>
                  <input
                    type="text"
                    required
                    value={editingPromo.promoCode}
                    onChange={(e) => setEditingPromo({ ...editingPromo, promoCode: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold text-sky-600 focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Masa Berlaku</label>
                  <input
                    type="text"
                    required
                    value={editingPromo.validUntil}
                    onChange={(e) => setEditingPromo({ ...editingPromo, validUntil: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-slate-600 dark:text-slate-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Tanggal Artikel Dibuat</label>
                  <input
                    type="text"
                    required
                    value={editingPromo.createdAt || '19 Agustus 2026'}
                    onChange={(e) => setEditingPromo({ ...editingPromo, createdAt: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Header Badge Promo</label>
                <input
                  type="text"
                  required
                  value={editingPromo.badge}
                  onChange={(e) => setEditingPromo({ ...editingPromo, badge: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold text-sky-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Deskripsi Syarat & Ketentuan Promo</label>
                <textarea
                  rows={3}
                  required
                  value={editingPromo.description}
                  onChange={(e) => setEditingPromo({ ...editingPromo, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingPromo(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-md"
              >
                Simpan Promo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD PROMO MODAL */}
      {showAddPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleAddPromoSubmit} className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-500" /> Tambah Kartu Promo / Artikel Baru
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {newPromoForm.photoUrl ? (
                    <img src={newPromoForm.photoUrl} alt="Preview" className="w-14 h-14 rounded-xl object-cover border" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <Gift className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">Upload Berkas Banner</span>
                    <span className="text-[10px] text-slate-400 block truncate max-w-[200px]">
                      {newPromoForm.photoUrl || 'Belum ada berkas terpilih'}
                    </span>
                  </div>
                </div>

                <label className="px-3.5 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs cursor-pointer shadow-sm shrink-0">
                  Upload Foto
                  <input type="file" accept="image/*" onChange={handleNewPromoPhotoUpload} disabled={uploading} className="hidden" />
                </label>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Judul Kartu Promo</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Promo Paket MCU Lansia Sehat"
                  value={newPromoForm.title}
                  onChange={(e) => setNewPromoForm({ ...newPromoForm, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Label Diskon</label>
                  <input
                    type="text"
                    required
                    placeholder="DISKON 20%"
                    value={newPromoForm.discountTag}
                    onChange={(e) => setNewPromoForm({ ...newPromoForm, discountTag: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-extrabold text-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Kode Promo</label>
                  <input
                    type="text"
                    required
                    placeholder="PROMO-ALWI20"
                    value={newPromoForm.promoCode}
                    onChange={(e) => setNewPromoForm({ ...newPromoForm, promoCode: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold text-sky-600 focus:outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Masa Berlaku</label>
                  <input
                    type="text"
                    required
                    placeholder="Berlaku s/d Akhir Bulan"
                    value={newPromoForm.validUntil}
                    onChange={(e) => setNewPromoForm({ ...newPromoForm, validUntil: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-slate-600 dark:text-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Deskripsi Syarat & Ketentuan Promo</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Deskripsikan detail promo dan ketentuan klaim..."
                  value={newPromoForm.description}
                  onChange={(e) => setNewPromoForm({ ...newPromoForm, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddPromoModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-md"
              >
                Simpan & Tampilkan Di Landing Page
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

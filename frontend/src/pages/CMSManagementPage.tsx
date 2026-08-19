import React, { useState, useEffect } from 'react';
import { Globe, Edit3, Save, CheckCircle2, RotateCcw, Hospital, Home, Pill, Syringe, Droplet, Stethoscope, Handshake, Eye, Sparkles, UserCheck, ShieldCheck, Upload, Image as ImageIcon, Plus, Trash2, Gift, Tag, Camera } from 'lucide-react';
import { useCMSStore, CMSFacility, CMSFeaturedDoctor, CMSClinicGallery, CMSPromo } from '../store/useCMSStore';
import { useAuthStore } from '../store/useAuthStore';
import { apiClient } from '../api/client';
import { Link } from 'react-router-dom';

export const CMSManagementPage: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';

  const cms = useCMSStore();

  useEffect(() => {
    cms.fetchCMSFromDB();
  }, []);

  useEffect(() => {
    setBrandingForm({
      clinicName: cms.clinicName,
      clinicTagline: cms.clinicTagline,
      contactPhone: cms.contactPhone,
      contactEmail: cms.contactEmail,
      contactInstagram: cms.contactInstagram,
      clinicAddress: cms.clinicAddress,
    });
    setHeroForm({
      heroTitle: cms.heroTitle,
      heroSubtitle: cms.heroSubtitle,
      heroBadge: cms.heroBadge,
      galleryHeaderTitle: cms.galleryHeaderTitle,
      galleryHeaderSubtitle: cms.galleryHeaderSubtitle,
      doctorsHeaderTitle: cms.doctorsHeaderTitle,
      doctorsHeaderSubtitle: cms.doctorsHeaderSubtitle,
      promosHeaderTitle: cms.promosHeaderTitle,
    });
  }, [
    cms.clinicName,
    cms.clinicTagline,
    cms.contactPhone,
    cms.contactEmail,
    cms.contactInstagram,
    cms.clinicAddress,
    cms.heroTitle,
    cms.heroSubtitle,
    cms.heroBadge,
    cms.galleryHeaderTitle,
    cms.galleryHeaderSubtitle,
    cms.doctorsHeaderTitle,
    cms.doctorsHeaderSubtitle,
    cms.promosHeaderTitle,
  ]);
  const [toastMessage, setToastMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  // Editing Modal States
  const [editingFacility, setEditingFacility] = useState<CMSFacility | null>(null);
  const [editingDoctor, setEditingDoctor] = useState<CMSFeaturedDoctor | null>(null);
  const [editingGallery, setEditingGallery] = useState<CMSClinicGallery | null>(null);
  const [editingPromo, setEditingPromo] = useState<CMSPromo | null>(null);

  // New Photo Form State
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [newPhotoForm, setNewPhotoForm] = useState({
    title: '',
    category: 'Fasilitas Gedung',
    photoUrl: '',
    description: '',
  });

  // New Promo Form State
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

  // Branding Form State
  const [brandingForm, setBrandingForm] = useState({
    clinicName: cms.clinicName,
    clinicTagline: cms.clinicTagline,
    contactPhone: cms.contactPhone,
    contactEmail: cms.contactEmail,
    contactInstagram: cms.contactInstagram,
    clinicAddress: cms.clinicAddress,
  });

  // Hero Form State (Header & Judul Section CMS)
  const [heroForm, setHeroForm] = useState({
    heroTitle: cms.heroTitle,
    heroSubtitle: cms.heroSubtitle,
    heroBadge: cms.heroBadge,
    galleryHeaderTitle: cms.galleryHeaderTitle,
    galleryHeaderSubtitle: cms.galleryHeaderSubtitle,
    doctorsHeaderTitle: cms.doctorsHeaderTitle,
    doctorsHeaderSubtitle: cms.doctorsHeaderSubtitle,
    promosHeaderTitle: cms.promosHeaderTitle,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 5000);
  };

  // 1. UPLOAD CLINIC LOGO FILE
  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await apiClient.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.data?.url) {
        cms.updateBranding({ clinicLogoIcon: res.data.data.url });
        showToast('Logo gambar klinik berhasil diupload dan tersimpan ke database!');
      }
    } catch (err) {
      // Fallback preview reader
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          cms.updateBranding({ clinicLogoIcon: reader.result });
          showToast('Logo gambar klinik berhasil diupload!');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  // 2. UPLOAD DOCTOR PHOTO FILE
  const handleDoctorPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, doctorId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await apiClient.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.data?.url) {
        if (editingDoctor && editingDoctor.id === doctorId) {
          setEditingDoctor({ ...editingDoctor, photoUrl: res.data.data.url });
        }
        cms.updateDoctor(doctorId, { photoUrl: res.data.data.url });
        showToast(`Foto dokter #${doctorId} berhasil diupload & tersimpan ke database!`);
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          if (editingDoctor && editingDoctor.id === doctorId) {
            setEditingDoctor({ ...editingDoctor, photoUrl: reader.result });
          }
          cms.updateDoctor(doctorId, { photoUrl: reader.result });
          showToast(`Foto dokter #${doctorId} berhasil diupload!`);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  // 3. UPLOAD GALLERY PHOTO FILE
  const handleGalleryPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, photoId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await apiClient.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.data?.url) {
        if (editingGallery && editingGallery.id === photoId) {
          setEditingGallery({ ...editingGallery, photoUrl: res.data.data.url });
        }
        cms.updateGalleryPhoto(photoId, { photoUrl: res.data.data.url });
        showToast(`Foto galeri slider #${photoId} berhasil diupload & tersimpan ke database!`);
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          if (editingGallery && editingGallery.id === photoId) {
            setEditingGallery({ ...editingGallery, photoUrl: reader.result });
          }
          cms.updateGalleryPhoto(photoId, { photoUrl: reader.result });
          showToast(`Foto galeri slider #${photoId} berhasil diupload!`);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleNewPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await apiClient.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.data?.url) {
        setNewPhotoForm({ ...newPhotoForm, photoUrl: res.data.data.url });
        showToast('Foto baru berhasil diupload untuk galeri!');
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setNewPhotoForm({ ...newPhotoForm, photoUrl: reader.result });
          showToast('Foto baru berhasil diupload!');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveGallerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGallery) return;
    cms.updateGalleryPhoto(editingGallery.id, editingGallery);
    setEditingGallery(null);
    showToast(`Foto galeri "${editingGallery.title}" berhasil diperbarui!`);
  };

  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoForm.title || !newPhotoForm.photoUrl) return;
    cms.addGalleryPhoto(newPhotoForm);
    setShowAddPhotoModal(false);
    setNewPhotoForm({
      title: '',
      category: 'Fasilitas Gedung',
      photoUrl: '',
      description: '',
    });
    showToast('Foto galeri baru berhasil ditambahkan ke Photo Slider Landing Page!');
  };

  // 4. UPLOAD PROMO PHOTO FILE
  const handlePromoPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, promoId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await apiClient.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.data?.url) {
        if (editingPromo && editingPromo.id === promoId) {
          setEditingPromo({ ...editingPromo, photoUrl: res.data.data.url });
        }
        cms.updatePromo(promoId, { photoUrl: res.data.data.url });
        showToast(`Foto banner promo #${promoId} berhasil diupload & tersimpan!`);
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          if (editingPromo && editingPromo.id === promoId) {
            setEditingPromo({ ...editingPromo, photoUrl: reader.result });
          }
          cms.updatePromo(promoId, { photoUrl: reader.result });
          showToast(`Foto banner promo #${promoId} berhasil diupload!`);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleNewPromoPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await apiClient.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.data?.url) {
        setNewPromoForm({ ...newPromoForm, photoUrl: res.data.data.url });
        showToast('Foto banner promo baru berhasil diupload!');
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setNewPromoForm({ ...newPromoForm, photoUrl: reader.result });
          showToast('Foto banner promo baru berhasil diupload!');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleSavePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromo) return;
    cms.updatePromo(editingPromo.id, editingPromo);
    setEditingPromo(null);
    showToast(`Promo "${editingPromo.title}" berhasil diperbarui!`);
  };

  const handleAddPromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoForm.title || !newPromoForm.photoUrl) return;
    cms.addPromo(newPromoForm);
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
    showToast('Kartu promo baru berhasil ditambahkan ke Landing Page!');
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    cms.updateBranding(brandingForm);
    showToast('Identitas & Logo nama klinik berhasil diperbarui secara global!');
  };

  const handleSaveHero = (e: React.FormEvent) => {
    e.preventDefault();
    cms.updateHero(heroForm);
    showToast('Banner Hero Landing Page berhasil diperbarui!');
  };

  const handleSaveFacilitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFacility) return;
    cms.updateFacility(editingFacility.id, editingFacility);
    setEditingFacility(null);
    showToast(`Fasilitas "${editingFacility.title}" berhasil diperbarui!`);
  };

  const handleSaveDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;
    cms.updateDoctor(editingDoctor.id, editingDoctor);
    setEditingDoctor(null);
    showToast(`Profil & foto dokter "${editingDoctor.name}" berhasil diperbarui di Landing Page!`);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Success Toast */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" /> {toastMessage}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Globe className="w-7 h-7 text-sky-500" /> CMS & Branding Landing Page Management
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Hak Akses Admin CMS
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kelola nama klinik, logo gambar (upload langsung), banner utama, 6 fasilitas utama, serta foto 2 dokter unggulan & spesialisasi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/30 flex items-center gap-1.5 transition"
          >
            <Eye className="w-4 h-4" /> Buka Live Landing Page (Tab Baru)
          </Link>
          <button
            onClick={() => {
              cms.resetToDefault();
              setBrandingForm({
                clinicName: 'Klinik Utama Alwi',
                clinicTagline: 'Layanan Kesehatan Modern, Cepat & Terpercaya',
                contactPhone: '+628-13-1100-103',
                contactEmail: 'info@klinikalwi.id',
                contactInstagram: 'https://instagram.com/klinikalwi.official',
                clinicAddress: 'Jl. Jalur 20, blok 47, No.24B Meruya Utara, Kembangan Jakarta barat',
              });
              setHeroForm({
                heroTitle: 'Solusi Kesehatan Terbaik & Terpercaya Untuk Keluarga Anda',
                heroSubtitle: 'Layanan medis profesional berstandar internasional dengan dokter spesialis berpengalaman, fasilitas Home Service, IV Drips, dan MCU modern.',
                heroBadge: '🏥 Klinik Medis Terakreditasi 2026',
                galleryHeaderTitle: 'Klinik Modern & Terpercaya Untuk Keluarga Anda',
                galleryHeaderSubtitle: 'Memberikan pelayanan medis terbaik dengan tim dokter spesialis berpengalaman dan fasilitas kesehatan modern lengkap.',
                doctorsHeaderTitle: 'TIM DOKTER SPESIALIS UNGGULAN',
                doctorsHeaderSubtitle: 'Ditangani Oleh Dokter Spesialis Berpengalaman. Setiap pasien mendapatkan perawatan medis terbaik dari dokter spesialis profesional berlisensi resmi dengan standar pelayanan ramah dan tepat.',
                promosHeaderTitle: 'PROMO & ARTIKEL KESEHATAN BERLANGSUNG',
              });
              showToast('Pengaturan CMS berhasil di-reset ke nilai default bawaan!');
            }}
            className="px-3 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Default
          </button>
        </div>
      </div>

      {/* SECTION 1: CLINIC BRANDING & LOGO IMAGE FILE UPLOAD */}
      <div className="glass-card p-6 rounded-3xl border shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Hospital className="w-5 h-5 text-sky-500" /> 1. Upload Logo Klinik & Pengaturan Nama Resmi
          </h2>
          <span className="text-xs text-slate-400">Path tersimpan ke database & tampil di seluruh halaman</span>
        </div>

        {/* Logo Image Uploader Box */}
        <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
              {cms.clinicLogoIcon && (cms.clinicLogoIcon.startsWith('/') || cms.clinicLogoIcon.startsWith('http') || cms.clinicLogoIcon.startsWith('data:')) ? (
                <img src={cms.clinicLogoIcon} alt="Preview Logo" className="w-full h-full object-contain max-w-full max-h-full" />
              ) : (
                <Hospital className="w-8 h-8 text-sky-500" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Upload Logo Gambar Klinik</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pilih berkas gambar logo (PNG, JPG, SVG, WEBP). Gambar akan tersimpan ke database dan mengubah logo di seluruh halaman.</p>
              <p className="text-[10px] font-mono text-sky-600 dark:text-sky-400 mt-1 truncate max-w-md">Path Terdaftar: {cms.clinicLogoIcon}</p>
            </div>
          </div>

          <label className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2 shrink-0">
            <Upload className="w-4 h-4" /> {uploading ? 'Mengupload...' : 'Pilih & Upload Logo Image'}
            <input type="file" accept="image/*" onChange={handleLogoFileUpload} disabled={uploading} className="hidden" />
          </label>
        </div>

        <form onSubmit={handleSaveBranding} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div>
            <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Nama Resmi Klinik</label>
            <input
              type="text"
              required
              value={brandingForm.clinicName}
              onChange={(e) => setBrandingForm({ ...brandingForm, clinicName: e.target.value })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Tagline / Subtitle Klinik</label>
            <input
              type="text"
              required
              value={brandingForm.clinicTagline}
              onChange={(e) => setBrandingForm({ ...brandingForm, clinicTagline: e.target.value })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Nomor Telepon / WhatsApp Resmi</label>
            <input
              type="text"
              required
              value={brandingForm.contactPhone}
              onChange={(e) => setBrandingForm({ ...brandingForm, contactPhone: e.target.value })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Alamat Email Resmi</label>
            <input
              type="email"
              required
              value={brandingForm.contactEmail}
              onChange={(e) => setBrandingForm({ ...brandingForm, contactEmail: e.target.value })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-rose-500" /> URL Akun Instagram Resmi Klinik
            </label>
            <input
              type="text"
              required
              placeholder="https://instagram.com/klinikalwi.official"
              value={brandingForm.contactInstagram}
              onChange={(e) => setBrandingForm({ ...brandingForm, contactInstagram: e.target.value })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-rose-600 dark:text-rose-400 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Alamat Fisik Gedung Klinik</label>
            <input
              type="text"
              required
              value={brandingForm.clinicAddress}
              onChange={(e) => setBrandingForm({ ...brandingForm, clinicAddress: e.target.value })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/30 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Simpan Branding & Nama Klinik
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: HERO BANNER & JUDUL HEADLINE SECTION LANDING PAGE */}
      <div className="glass-card p-6 rounded-3xl border shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> 2. Pengaturan Judul Header & Section Landing Page
            </h2>
            <p className="text-xs text-slate-500">Atur judul banner utama, judul photo slider background, judul tim dokter, dan judul promo kesehatan</p>
          </div>
        </div>

        <form onSubmit={handleSaveHero} className="space-y-4 text-xs">

          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 space-y-3">
            <h3 className="font-bold text-sky-600 dark:text-sky-400 text-xs uppercase tracking-wider">B. JUDUL PHOTO SLIDER HEADER BACKGROUND (No. 5)</h3>
            <div>
              <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Judul Photo Slider Header</label>
              <input
                type="text"
                required
                value={heroForm.galleryHeaderTitle}
                onChange={(e) => setHeroForm({ ...heroForm, galleryHeaderTitle: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-800 border rounded-xl font-extrabold text-sky-600 dark:text-sky-400 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Deskripsi Subtitle Photo Slider Header</label>
              <textarea
                rows={2}
                required
                value={heroForm.galleryHeaderSubtitle}
                onChange={(e) => setHeroForm({ ...heroForm, galleryHeaderSubtitle: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-3">
            <h3 className="font-bold text-teal-600 dark:text-teal-400 text-xs uppercase tracking-wider">C. JUDUL TIM DOKTER SPESIALIS UNGGULAN (No. 4)</h3>
            <div>
              <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Judul Section Tim Dokter</label>
              <input
                type="text"
                required
                value={heroForm.doctorsHeaderTitle}
                onChange={(e) => setHeroForm({ ...heroForm, doctorsHeaderTitle: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-800 border rounded-xl font-extrabold text-teal-600 dark:text-teal-400 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Deskripsi Subtitle Tim Dokter</label>
              <textarea
                rows={2}
                required
                value={heroForm.doctorsHeaderSubtitle}
                onChange={(e) => setHeroForm({ ...heroForm, doctorsHeaderSubtitle: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-3">
            <h3 className="font-bold text-indigo-600 dark:text-indigo-400 text-xs uppercase tracking-wider">D. JUDUL SECTION PROMO & ARTIKEL BERLANGSUNG</h3>
            <div>
              <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Judul Badge Section Promo</label>
              <input
                type="text"
                required
                value={heroForm.promosHeaderTitle}
                onChange={(e) => setHeroForm({ ...heroForm, promosHeaderTitle: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-800 border rounded-xl font-extrabold text-indigo-600 dark:text-indigo-400 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/30 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Simpan Seluruh Judul Section CMS
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 3: 6 CLINIC FACILITIES CMS */}
      <div className="glass-card p-6 rounded-3xl border shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Pill className="w-5 h-5 text-teal-500" /> 3. Pengaturan 6 Fasilitas Utama Klinik (Home Service, IV Drips, MCU, dll)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Atur judul, deskripsi, dan badge dari 6 fasilitas klinik yang tampil di Landing Page</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cms.facilities.map((fac) => (
            <div key={fac.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{fac.emoji}</span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 border border-sky-500/20 text-[10px] font-bold">
                    {fac.badge}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{fac.title}</h3>
                <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">{fac.subtitle}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{fac.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                <button
                  onClick={() => setEditingFacility(fac)}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] flex items-center gap-1 transition"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Fasilitas
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: 2 FEATURED DOCTORS CMS WITH DIRECT IMAGE FILE UPLOAD */}
      <div className="glass-card p-6 rounded-3xl border shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-sky-500" /> 4. Upload Foto 2 Dokter Unggulan & Spesialisasi (Database Synced)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Upload berkas gambar foto dokter resmi. Path tersimpan ke database dan langsung memperbarui foto dokter di Landing Page</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cms.featuredDoctors.map((doc) => (
            <div key={doc.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={doc.photoUrl}
                  alt={doc.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-sky-500/40 shadow-md shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-500 border border-sky-500/20 font-mono">
                    Doctor #{doc.id}
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mt-0.5 truncate">{doc.name}</h3>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold truncate">{doc.specialization}</p>
                  <p className="text-[10px] font-mono text-slate-400 truncate mt-1">Path: {doc.photoUrl}</p>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                <p className="font-semibold text-slate-400 text-[10px] uppercase">DESKRIPSI PROFIL & REPUTASI</p>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed italic">"{doc.description}"</p>
                <p className="text-sky-600 dark:text-sky-400 font-bold pt-1">Doctor Fee: Rp {doc.consultationFee.toLocaleString()} / konsultasi</p>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                <label className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] shadow-sm transition cursor-pointer flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" /> Pilih & Upload Foto Dokter #{doc.id}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleDoctorPhotoUpload(e, doc.id)}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => setEditingDoctor(doc)}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] shadow-sm transition flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Teks Bio
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5: CLINIC PHOTO SLIDER GALLERY CMS */}
      <div className="glass-card p-6 rounded-3xl border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-sky-500" /> 5. Kelola Galeri Photo Slider (Klinik Modern & Terpercaya Untuk Keluarga Anda)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tambah, upload, edit narasi, dan hapus foto slider gambaran gedung klinik & tenaga medis yang tampil di Landing Page.
            </p>
          </div>

          <button
            onClick={() => setShowAddPhotoModal(true)}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Tambah Foto Slider Baru
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cms.galleryPhotos.map((photo) => (
            <div key={photo.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 group">
                  <img src={photo.photoUrl} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-sky-600/90 text-white text-[10px] font-bold shadow-md">
                    {photo.category}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug">{photo.title}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1">{photo.description}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                <label className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] shadow-sm cursor-pointer flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" /> Upload Foto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleGalleryPhotoUpload(e, photo.id)}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingGallery(photo)}
                    className="px-2.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-[10px] shadow-sm flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus foto slider "${photo.title}"?`)) {
                        cms.deleteGalleryPhoto(photo.id);
                        showToast(`Foto "${photo.title}" dihapus!`);
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] shadow-sm flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 6: ONGOING PROMOS & ARTICLES CMS */}
      <div className="glass-card p-6 rounded-3xl border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-500" /> 6. Kelola Kartu Promo & Artikel Berlangsung (Penawaran Spesial & Paket Hemat)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tambah, upload foto banner, atur diskon, dan edit artikel promo kesehatan yang tampil di bawah photo slider Landing Page.
            </p>
          </div>

          <button
            onClick={() => setShowAddPromoModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Tambah Promo Baru
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cms.promos && cms.promos.map((promo) => (
            <div key={promo.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 group">
                  <img src={promo.photoUrl} alt={promo.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold shadow-md">
                    {promo.discountTag}
                  </span>
                  <span className="absolute bottom-2 left-2 right-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[9px] font-mono">
                    {promo.validUntil}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase font-mono block">{promo.badge}</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center gap-1">
                      <Tag className="w-3 h-3" /> {promo.promoCode || 'PROMO-ALWI'}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug">{promo.title}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1">{promo.description}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                <label className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] shadow-sm cursor-pointer flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" /> Upload Banner
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePromoPhotoUpload(e, promo.id)}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingPromo(promo)}
                    className="px-2.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-[10px] shadow-sm flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus kartu promo "${promo.title}"?`)) {
                        cms.deletePromo(promo.id);
                        showToast(`Promo "${promo.title}" dihapus!`);
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] shadow-sm flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL 1: EDIT FACILITY */}
      {editingFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal font-sans">
          <form onSubmit={handleSaveFacilitySubmit} className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-teal-500" /> Edit Fasilitas: {editingFacility.title}
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Judul Fasilitas</label>
                <input
                  type="text"
                  required
                  value={editingFacility.title}
                  onChange={(e) => setEditingFacility({ ...editingFacility, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Subtitle Fasilitas</label>
                <input
                  type="text"
                  required
                  value={editingFacility.subtitle}
                  onChange={(e) => setEditingFacility({ ...editingFacility, subtitle: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Badge Label (Pill)</label>
                <input
                  type="text"
                  required
                  value={editingFacility.badge}
                  onChange={(e) => setEditingFacility({ ...editingFacility, badge: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-sky-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Deskripsi Fasilitas</label>
                <textarea
                  rows={3}
                  required
                  value={editingFacility.description}
                  onChange={(e) => setEditingFacility({ ...editingFacility, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingFacility(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-md"
              >
                Simpan Fasilitas
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: EDIT FEATURED DOCTOR & PHOTO UPLOAD */}
      {editingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal font-sans">
          <form onSubmit={handleSaveDoctorSubmit} className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-sky-500" /> Edit Profil & Foto Dokter #{editingDoctor.id}
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <img src={editingDoctor.photoUrl} alt={editingDoctor.name} className="w-14 h-14 rounded-xl object-cover border" />
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block truncate">{editingDoctor.name}</span>
                  <span className="text-slate-400 text-[11px] block truncate">Path: {editingDoctor.photoUrl}</span>
                </div>
                <label className="px-3 py-1.5 rounded-xl bg-teal-600 text-white font-bold text-[10px] cursor-pointer shrink-0">
                  Upload Foto Baru
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleDoctorPhotoUpload(e, editingDoctor.id)}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">URL / Path Foto Dokter</label>
                <input
                  type="text"
                  required
                  value={editingDoctor.photoUrl}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, photoUrl: e.target.value })}
                  placeholder="/images/doctor_alwi.jpg"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-sky-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Nama Dokter & Gelar</label>
                <input
                  type="text"
                  required
                  value={editingDoctor.name}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Spesialisasi Dokter</label>
                <input
                  type="text"
                  required
                  value={editingDoctor.specialization}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, specialization: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Narasi Biografi & Reputasi Dokter</label>
                <textarea
                  rows={3}
                  required
                  value={editingDoctor.description}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingDoctor(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs shadow-md"
              >
                Simpan Profil & Foto Dokter
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: EDIT GALLERY PHOTO */}
      {editingGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal font-sans">
          <form onSubmit={handleSaveGallerySubmit} className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-sky-500" /> Edit Foto Galeri Slider #{editingGallery.id}
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <img src={editingGallery.photoUrl} alt={editingGallery.title} className="w-16 h-16 rounded-xl object-cover border shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block truncate">{editingGallery.title}</span>
                  <span className="text-slate-400 text-[10px] block truncate">Path: {editingGallery.photoUrl}</span>
                </div>
                <label className="px-3 py-1.5 rounded-xl bg-teal-600 text-white font-bold text-[10px] cursor-pointer shrink-0">
                  Upload Foto Baru
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleGalleryPhotoUpload(e, editingGallery.id)}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Judul Foto Slider</label>
                <input
                  type="text"
                  required
                  value={editingGallery.title}
                  onChange={(e) => setEditingGallery({ ...editingGallery, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Kategori Foto</label>
                <select
                  value={editingGallery.category}
                  onChange={(e) => setEditingGallery({ ...editingGallery, category: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-semibold text-sky-600 focus:outline-none"
                >
                  <option value="Fasilitas Gedung">Fasilitas Gedung</option>
                  <option value="Tenaga Medis">Tenaga Medis</option>
                  <option value="Fasilitas Medis">Fasilitas Medis</option>
                  <option value="Farmasi & Obat">Farmasi & Obat</option>
                  <option value="Pelayanan Pasien">Pelayanan Pasien</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">URL / Path Foto</label>
                <input
                  type="text"
                  required
                  value={editingGallery.photoUrl}
                  onChange={(e) => setEditingGallery({ ...editingGallery, photoUrl: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-sky-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Deskripsi & Narasi Slider</label>
                <textarea
                  rows={3}
                  required
                  value={editingGallery.description}
                  onChange={(e) => setEditingGallery({ ...editingGallery, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingGallery(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs shadow-md"
              >
                Simpan Foto Slider
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: ADD NEW GALLERY PHOTO */}
      {showAddPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal font-sans">
          <form onSubmit={handleAddPhotoSubmit} className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-sky-500" /> Tambah Foto Slider Galeri Baru
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {newPhotoForm.photoUrl ? (
                    <img src={newPhotoForm.photoUrl} alt="Preview" className="w-14 h-14 rounded-xl object-cover border" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">Upload Berkas Foto</span>
                    <span className="text-[10px] text-slate-400 block truncate max-w-[200px]">
                      {newPhotoForm.photoUrl || 'Belum ada berkas terpilih'}
                    </span>
                  </div>
                </div>

                <label className="px-3.5 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs cursor-pointer shadow-sm shrink-0">
                  Upload Foto
                  <input type="file" accept="image/*" onChange={handleNewPhotoUpload} disabled={uploading} className="hidden" />
                </label>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Judul Foto Slider</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ruang Rawat Inap VIP"
                  value={newPhotoForm.title}
                  onChange={(e) => setNewPhotoForm({ ...newPhotoForm, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Kategori Foto</label>
                <select
                  value={newPhotoForm.category}
                  onChange={(e) => setNewPhotoForm({ ...newPhotoForm, category: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-semibold text-sky-600 focus:outline-none"
                >
                  <option value="Fasilitas Gedung">Fasilitas Gedung</option>
                  <option value="Tenaga Medis">Tenaga Medis</option>
                  <option value="Fasilitas Medis">Fasilitas Medis</option>
                  <option value="Farmasi & Obat">Farmasi & Obat</option>
                  <option value="Pelayanan Pasien">Pelayanan Pasien</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">URL / Path Foto Gambar</label>
                <input
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/... atau /uploads/img.jpg"
                  value={newPhotoForm.photoUrl}
                  onChange={(e) => setNewPhotoForm({ ...newPhotoForm, photoUrl: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-sky-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Deskripsi Narasi Foto</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan fasilitas / suasana medis pada foto ini..."
                  value={newPhotoForm.description}
                  onChange={(e) => setNewPhotoForm({ ...newPhotoForm, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddPhotoModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs shadow-md"
              >
                Simpan & Tampilkan Di Slider
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 5: EDIT PROMO */}
      {editingPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal font-sans">
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

              <div className="grid grid-cols-3 gap-3">
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
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">URL / Path Banner Gambar</label>
                <input
                  type="text"
                  required
                  value={editingPromo.photoUrl}
                  onChange={(e) => setEditingPromo({ ...editingPromo, photoUrl: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-sky-600 focus:outline-none"
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

      {/* MODAL 6: ADD NEW PROMO */}
      {showAddPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal font-sans">
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
                    placeholder="DISKON 30%"
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
                    placeholder="MCU-30%"
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
                    placeholder="s/d 30 Sept 2026"
                    value={newPromoForm.validUntil}
                    onChange={(e) => setNewPromoForm({ ...newPromoForm, validUntil: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-slate-600 dark:text-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Header Badge Promo</label>
                <input
                  type="text"
                  required
                  placeholder="PAKET HEMAT ANGGOTA KELUARGA"
                  value={newPromoForm.badge}
                  onChange={(e) => setNewPromoForm({ ...newPromoForm, badge: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold text-sky-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">URL / Path Foto Banner</label>
                <input
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/... atau /uploads/promo.jpg"
                  value={newPromoForm.photoUrl}
                  onChange={(e) => setNewPromoForm({ ...newPromoForm, photoUrl: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-sky-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Deskripsi Syarat & Ketentuan</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan detail cakupan paket & benefit promo ini..."
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

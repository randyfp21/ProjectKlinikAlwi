import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api/client';

export interface CMSFacility {
  id: string;
  iconName: 'Home' | 'Pill' | 'Syringe' | 'Droplet' | 'Stethoscope' | 'Handshake';
  emoji: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  available: boolean;
}

export interface CMSFeaturedDoctor {
  id: number;
  name: string;
  specialization: string;
  education: string;
  consultationFee: number;
  description: string;
  photoUrl: string;
}

export interface CMSClinicGallery {
  id: number;
  title: string;
  category: string;
  photoUrl: string;
  description: string;
}

export interface CMSPromo {
  id: number;
  title: string;
  badge: string;
  discountTag: string;
  promoCode: string;
  validUntil: string;
  description: string;
  photoUrl: string;
  actionUrl: string;
}

export interface CMSState {
  // Clinic Branding & Contact Parameters
  clinicName: string;
  clinicTagline: string;
  clinicLogoIcon: string;
  contactPhone: string;
  contactEmail: string;
  clinicAddress: string;

  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;

  // Facilities
  facilities: CMSFacility[];

  // Featured Doctors
  featuredDoctors: CMSFeaturedDoctor[];

  // Photo Slider / Gallery
  galleryPhotos: CMSClinicGallery[];

  // Ongoing Promos & Articles
  promos: CMSPromo[];

  // Sync Actions
  fetchCMSFromDB: () => Promise<void>;
  saveCMSToDB: () => Promise<void>;

  // Local Actions
  updateBranding: (data: Partial<Pick<CMSState, 'clinicName' | 'clinicTagline' | 'clinicLogoIcon' | 'contactPhone' | 'contactEmail' | 'clinicAddress'>>) => void;
  updateHero: (data: Partial<Pick<CMSState, 'heroTitle' | 'heroSubtitle' | 'heroBadge'>>) => void;
  updateFacility: (id: string, updated: Partial<CMSFacility>) => void;
  updateDoctor: (id: number, updated: Partial<CMSFeaturedDoctor>) => void;
  updateGalleryPhoto: (id: number, updated: Partial<CMSClinicGallery>) => void;
  addGalleryPhoto: (photo: Omit<CMSClinicGallery, 'id'>) => void;
  deleteGalleryPhoto: (id: number) => void;
  updatePromo: (id: number, updated: Partial<CMSPromo>) => void;
  addPromo: (promo: Omit<CMSPromo, 'id'>) => void;
  deletePromo: (id: number) => void;
  resetToDefault: () => void;
}

const DEFAULT_FACILITIES: CMSFacility[] = [
  {
    id: 'home-service',
    iconName: 'Home',
    emoji: '🏠',
    title: 'Home Service Available',
    subtitle: 'Layanan Dokter & Perawat Datang Ke Rumah Pasien',
    badge: 'Populer & Praktis',
    description: 'Pemeriksaan kesehatan, sampel darah laboratorium, hingga pemasangan infus langsung dari kenyamanan rumah Anda.',
    available: true,
  },
  {
    id: 'general-treatment',
    iconName: 'Pill',
    emoji: '💊',
    title: 'General Treatment',
    subtitle: 'Pengobatan & Konsultasi Medis Spesialis',
    badge: 'Layanan Utama',
    description: 'Pemeriksaan fisik komprehensif, pengobatan penyakit akut & kronis, serta rujukan dokter spesialis berkualitas.',
    available: true,
  },
  {
    id: 'vaccination',
    iconName: 'Syringe',
    emoji: '💉',
    title: 'Vaccination',
    subtitle: 'Vaksinasi Anak, Dewasa, & International Travel',
    badge: 'Resmi & Bersertifikat',
    description: 'Layanan imunisasi lengkap untuk anak, flu/pneumonia dewasa, serta sertifikat internasional impor & haji/umrah.',
    available: true,
  },
  {
    id: 'iv-drips',
    iconName: 'Droplet',
    emoji: '💧',
    title: 'IV Drips',
    subtitle: 'Terapi Vitamin & Hydration Recovery Drips',
    badge: 'Prosedur Cepat',
    description: 'Infus multivitamin dosis tinggi untuk pemulihan stamina, daya tahan tubuh, pencerah kulit, dan dehidrasi.',
    available: true,
  },
  {
    id: 'mcu',
    iconName: 'Stethoscope',
    emoji: '🩺',
    title: 'Medical Check Up',
    subtitle: 'Skrining Kesehatan Berkala & Laboratorium',
    badge: 'Hasil Akurat',
    description: 'Paket MCU lengkap mencakup EKG jantung, cek gula darah, profil kolesterol, fungsi ginjal, hati, dan paru-paru.',
    available: true,
  },
  {
    id: 'corporate',
    iconName: 'Handshake',
    emoji: '🤝',
    title: 'Open for Corporate Partnerships',
    subtitle: 'Kerjasama Kesehatan Karyawan & On-site MCU',
    badge: 'Kemitraan Perusahaan',
    description: 'Solusi jaminan kesehatan perusahaan, klinik medis on-site kantor, dan pemeriksaan kesehatan berkala karyawan.',
    available: true,
  },
];

const DEFAULT_DOCTORS: CMSFeaturedDoctor[] = [
  {
    id: 1,
    name: 'dr. Alwi Shahab, Sp.PD',
    specialization: 'Internal Medicine (Spesialis Penyakit Dalam)',
    education: 'Universitas Indonesia - Subspesialis Metabolik Endokrin',
    consultationFee: 175000,
    description: 'Dokter spesialis senior berpengalaman lebih dari 12 tahun dalam menangani kasus diabetes, hipertensi, gangguan pencernaan kronis, dan perawatan pasien komprehensif.',
    photoUrl: '/images/doctor_alwi.jpg',
  },
  {
    id: 2,
    name: 'dr. Sarah Lestari, Sp.A',
    specialization: 'Pediatrician (Spesialis Anak & Tumbuh Kembang)',
    education: 'Universitas Gadjah Mada - Konsultan Tumbuh Kembang Anak',
    consultationFee: 150000,
    description: 'Fokus pada kesehatan anak usia dini, pemantauan tumbuh kembang balita, imunisasi rutin, serta penanganan penyakit pediatrik dengan pendekatan yang sangat ramah anak.',
    photoUrl: '/images/doctor_sarah.jpg',
  },
];

const DEFAULT_GALLERY: CMSClinicGallery[] = [
  {
    id: 1,
    title: 'Gedung Klinik & Lobby Utama',
    category: 'Fasilitas Gedung',
    photoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    description: 'Ruang tunggu ber-AC yang nyaman dengan konsep modern glassmorphism & pendaftaran bebas antre.',
  },
  {
    id: 2,
    title: 'Ruang Konsultasi Dokter Spesialis',
    category: 'Tenaga Medis',
    photoUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
    description: 'Ruang pemeriksaan dokter yang tenang dan higienis, dilengkapi rekam medis digital (EMR) terkini.',
  },
  {
    id: 3,
    title: 'Laboratorium & Pemeriksaan MCU',
    category: 'Fasilitas Medis',
    photoUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=80',
    description: 'Peralatan analisis darah & spesimen otomatis dengan standar akurasi tinggi dan hasil cepat.',
  },
  {
    id: 4,
    title: 'Farmasi & Apoteker Profesional',
    category: 'Farmasi & Obat',
    photoUrl: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=1200&q=80',
    description: 'Pengelolaan stok obat terpantau sistemik dengan konseling apoteker yang ramah dan sigap.',
  },
  {
    id: 5,
    title: 'Tim Perawat & Caregiver Senior',
    category: 'Tenaga Medis',
    photoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    description: 'Tim perawat bersertifikasi resmi yang siap melayani perawatan luka, infus vitamin, dan Home Service.',
  },
];

const DEFAULT_PROMOS: CMSPromo[] = [
  {
    id: 1,
    title: 'Paket Medical Check Up (MCU) Eksekutif Keluarga',
    badge: 'PROMO SPESIAL BULAN INI',
    discountTag: 'DISKON 35%',
    promoCode: 'MCU-ALWI-35',
    validUntil: 'Berlaku s/d 31 Agustus 2026',
    description: 'Pemeriksaan laboratorium darah lengkap, EKG Jantung, Cek Gula Darah & Kolesterol, serta konsultasi gratis Dokter Spesialis Penyakit Dalam.',
    photoUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1000&q=80',
    actionUrl: '/login',
  },
  {
    id: 2,
    title: 'Vaksinasi Influenza & Pneumonia Dewasa / Lansia',
    badge: 'CEGAH INFEKSI SALURAN NAPAS',
    discountTag: 'DISKON 20%',
    promoCode: 'VAKSIN-SEHAT20',
    validUntil: 'Berlaku s/d 15 September 2026',
    description: 'Lindungi diri dan orang tua tercinta dari risiko pneumonia & ISPA. Sudah termasuk biaya tindakan suntik perawat & sertifikat imunisasi.',
    photoUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1000&q=80',
    actionUrl: '/login',
  },
  {
    id: 3,
    title: 'Terapi IV Drips Multivitamin & Stamina Recovery',
    badge: 'BOOSTER KESEHATAN CEPAT',
    discountTag: 'BUY 2 GET 1 FREE',
    promoCode: 'IVDRIP-BOOSTER',
    validUntil: 'Berlaku s/d 20 September 2026',
    description: 'Formula infus multivitamin konsentrasi tinggi untuk pemulihan kondisi stamina pasca sakit, pencerah kulit sehat, dan pencegahan dehidrasi.',
    photoUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1000&q=80',
    actionUrl: '/login',
  },
];

export const useCMSStore = create<CMSState>()(
  persist(
    (set, get) => ({
      clinicName: 'Klinik Utama Alwi',
      clinicTagline: 'Layanan Kesehatan Modern, Cepat & Terpercaya',
      clinicLogoIcon: 'Hospital',
      contactPhone: '+628-13-1100-103',
      contactEmail: 'info@klinikalwi.id',
      clinicAddress: 'Jl. Jalur 20, blok 47, No.24B Meruya Utara, Kembangan Jakarta barat',

      heroTitle: 'Solusi Kesehatan Terbaik & Terpercaya Untuk Keluarga Anda',
      heroSubtitle: 'Layanan medis profesional berstandar internasional dengan dokter spesialis berpengalaman, fasilitas Home Service, IV Drips, dan MCU modern.',
      heroBadge: '🏥 Klinik Medis Terakreditasi 2026',

      facilities: DEFAULT_FACILITIES,
      featuredDoctors: DEFAULT_DOCTORS,
      galleryPhotos: DEFAULT_GALLERY,
      promos: DEFAULT_PROMOS,

      fetchCMSFromDB: async () => {
        try {
          const res = await apiClient.get('/cms');
          if (res.data.success && res.data.data) {
            const data = res.data.data;
            set({
              clinicName: data.clinic_name || get().clinicName,
              clinicTagline: data.clinic_tagline || get().clinicTagline,
              clinicLogoIcon: data.clinic_logo_icon || get().clinicLogoIcon,
              contactPhone: data.contact_phone || get().contactPhone,
              contactEmail: data.contact_email || get().contactEmail,
              clinicAddress: data.clinic_address || get().clinicAddress,
              heroTitle: data.hero_title || get().heroTitle,
              heroSubtitle: data.hero_subtitle || get().heroSubtitle,
              heroBadge: data.hero_badge || get().heroBadge,
              facilities: data.facilities_json ? JSON.parse(data.facilities_json) : get().facilities,
              featuredDoctors: data.doctors_json ? JSON.parse(data.doctors_json) : get().featuredDoctors,
              galleryPhotos: data.gallery_json ? JSON.parse(data.gallery_json) : get().galleryPhotos,
              promos: data.promos_json ? JSON.parse(data.promos_json) : get().promos,
            });
          }
        } catch (err) {
          // keep fallback
        }
      },

      saveCMSToDB: async () => {
        const state = get();
        const payload = {
          clinic_name: state.clinicName,
          clinic_tagline: state.clinicTagline,
          clinic_logo_icon: state.clinicLogoIcon,
          contact_phone: state.contactPhone,
          contact_email: state.contactEmail,
          clinic_address: state.clinicAddress,
          hero_title: state.heroTitle,
          hero_subtitle: state.heroSubtitle,
          hero_badge: state.heroBadge,
          facilities_json: JSON.stringify(state.facilities),
          doctors_json: JSON.stringify(state.featuredDoctors),
          gallery_json: JSON.stringify(state.galleryPhotos),
          promos_json: JSON.stringify(state.promos),
        };

        try {
          await apiClient.put('/cms', payload);
        } catch (err) {
          // fallback
        }
      },

      updateBranding: (data) => {
        set((state) => ({ ...state, ...data }));
        get().saveCMSToDB();
      },

      updateHero: (data) => {
        set((state) => ({ ...state, ...data }));
        get().saveCMSToDB();
      },

      updateFacility: (id, updated) => {
        set((state) => ({
          facilities: state.facilities.map((f) => (f.id === id ? { ...f, ...updated } : f)),
        }));
        get().saveCMSToDB();
      },

      updateDoctor: (id, updated) => {
        set((state) => ({
          featuredDoctors: state.featuredDoctors.map((d) => (d.id === id ? { ...d, ...updated } : d)),
        }));
        get().saveCMSToDB();
      },

      updateGalleryPhoto: (id, updated) => {
        set((state) => ({
          galleryPhotos: state.galleryPhotos.map((g) => (g.id === id ? { ...g, ...updated } : g)),
        }));
        get().saveCMSToDB();
      },

      addGalleryPhoto: (photo) => {
        const newPhoto: CMSClinicGallery = {
          id: Date.now(),
          ...photo,
        };
        set((state) => ({
          galleryPhotos: [...state.galleryPhotos, newPhoto],
        }));
        get().saveCMSToDB();
      },

      deleteGalleryPhoto: (id) => {
        set((state) => ({
          galleryPhotos: state.galleryPhotos.filter((g) => g.id !== id),
        }));
        get().saveCMSToDB();
      },

      updatePromo: (id, updated) => {
        set((state) => ({
          promos: state.promos.map((p) => (p.id === id ? { ...p, ...updated } : p)),
        }));
        get().saveCMSToDB();
      },

      addPromo: (promo) => {
        const newPromo: CMSPromo = {
          id: Date.now(),
          ...promo,
        };
        set((state) => ({
          promos: [...state.promos, newPromo],
        }));
        get().saveCMSToDB();
      },

      deletePromo: (id) => {
        set((state) => ({
          promos: state.promos.filter((p) => p.id !== id),
        }));
        get().saveCMSToDB();
      },

      resetToDefault: () => {
        set({
          clinicName: 'Klinik Utama Alwi',
          clinicTagline: 'Layanan Kesehatan Modern, Cepat & Terpercaya',
          clinicLogoIcon: 'Hospital',
          contactPhone: '+628-13-1100-103',
          contactEmail: 'info@klinikalwi.id',
          clinicAddress: 'Jl. Jalur 20, blok 47, No.24B Meruya Utara, Kembangan Jakarta barat',
          heroTitle: 'Solusi Kesehatan Terbaik & Terpercaya Untuk Keluarga Anda',
          heroSubtitle: 'Layanan medis profesional berstandar internasional dengan dokter spesialis berpengalaman, fasilitas Home Service, IV Drips, dan MCU modern.',
          heroBadge: '🏥 Klinik Medis Terakreditasi 2026',
          facilities: DEFAULT_FACILITIES,
          featuredDoctors: DEFAULT_DOCTORS,
          galleryPhotos: DEFAULT_GALLERY,
          promos: DEFAULT_PROMOS,
        });
        get().saveCMSToDB();
      },
    }),
    {
      name: 'klinik-alwi-cms-storage-v3',
    }
  )
);

import React, { useEffect, useState } from 'react';
import { Gift, Tag, ArrowRight, ArrowLeft, Hospital, Sparkles, X, CalendarCheck, ShieldCheck, CheckCircle2, HeartPulse, BookOpen, Share2, Copy, Check } from 'lucide-react';
import { useCMSStore, CMSPromo } from '../store/useCMSStore';
import { Link } from 'react-router-dom';

export const PublicPromosArticlesPage: React.FC = () => {
  const cms = useCMSStore();
  const [selectedPromo, setSelectedPromo] = useState<CMSPromo | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    cms.fetchCMSFromDB();
  }, []);

  const promos = cms.promos || [];
  const clinicName = cms.clinicName || 'Klinik Utama Alwi';
  const clinicTagline = cms.clinicTagline || 'Layanan Kesehatan Modern, Cepat & Terpercaya';
  const clinicLogoIcon = cms.clinicLogoIcon;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col justify-between transition-colors">
      {/* PUBLIC NAVBAR HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-400 text-white flex items-center justify-center font-bold shadow-md shrink-0 overflow-hidden">
              {clinicLogoIcon && (clinicLogoIcon.startsWith('/') || clinicLogoIcon.startsWith('http') || clinicLogoIcon.startsWith('data:')) ? (
                <img src={clinicLogoIcon} alt="Logo" className="w-full h-full object-contain max-w-full max-h-full" />
              ) : (
                <Hospital className="w-6 h-6" />
              )}
            </div>
            <div>
              <span className="font-black text-lg text-slate-900 dark:text-white leading-tight block">{clinicName}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">{clinicTagline}</span>
            </div>
          </Link>

          <Link
            to="/"
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
          </Link>
        </div>
      </header>

      {/* HERO BANNER SECTION */}
      <section className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white py-16 px-6 shadow-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <span className="px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono uppercase tracking-wider inline-flex items-center gap-1.5">
            <Gift className="w-4 h-4 text-amber-400" /> KATALOG SELURUH PENAWARAN & ARTIKEL MEDIS
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Katalog Artikel & Promo Kesehatan Lengkap
          </h1>
          <p className="text-slate-300 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
            Klik pada salah satu kartu promo untuk membaca artikel medis lengkap, syarat klaim diskon, dan cara membuat janji konsultasi di {clinicName}.
          </p>
        </div>
      </section>

      {/* PROMOS GRID SECTION */}
      <main className="py-16 px-6 max-w-7xl mx-auto w-full space-y-8 flex-1">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Menampilkan Total {promos.length} Promo & Artikel Aktif
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Klik Kartu Untuk Membaca Artikel
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promos.map((promo: CMSPromo) => (
            <div
              key={promo.id}
              onClick={() => setSelectedPromo(promo)}
              className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 overflow-hidden shadow-lg hover:shadow-2xl transition space-y-4 flex flex-col justify-between group hover:-translate-y-1 cursor-pointer"
            >
              <div className="space-y-4">
                <div className="relative aspect-video overflow-hidden bg-slate-900">
                  <img
                    src={promo.photoUrl}
                    alt={promo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs shadow-md">
                    {promo.discountTag}
                  </span>
                  <span className="absolute bottom-3 left-3 right-3 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-[10px] font-mono border border-white/20">
                    {promo.validUntil}
                  </span>
                </div>

                <div className="px-6 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 font-mono">
                    {promo.badge}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-400 transition">
                    {promo.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1 line-clamp-3">
                    {promo.description}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-4 flex items-center justify-between">
                <span className="text-xs text-sky-600 dark:text-sky-400 font-mono font-bold flex items-center gap-1 bg-sky-500/10 dark:bg-sky-500/20 px-2.5 py-1 rounded-lg border border-sky-500/20">
                  <Tag className="w-3.5 h-3.5 text-sky-500" /> {promo.promoCode || 'PROMO-ALWI'}
                </span>
                <span className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 transition">
                  <BookOpen className="w-3.5 h-3.5" /> Baca Artikel
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* INTERACTIVE ARTIKEL & PROMO DETAIL MODAL BOX */}
      {selectedPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header & Banner Image */}
            <div className="relative aspect-video sm:aspect-[21/9] overflow-hidden bg-slate-950 shrink-0">
              <img
                src={selectedPromo.photoUrl}
                alt={selectedPromo.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              
              <button
                onClick={() => setSelectedPromo(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md transition shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase shadow-md">
                    {selectedPromo.discountTag}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-sky-500/30 text-sky-200 border border-sky-400/40 font-mono text-xs font-bold backdrop-blur-md">
                    {selectedPromo.badge}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                  {selectedPromo.title}
                </h2>
                <div className="flex items-center gap-3 mt-2 text-xs font-mono text-slate-400 flex-wrap">
                  <span>🕒 Dibuat: <strong className="text-emerald-600 dark:text-emerald-400">{selectedPromo.createdAt || '19 Agustus 2026'}</strong></span>
                  <span>•</span>
                  <span>📅 Masa Berlaku: <strong className="text-sky-600 dark:text-sky-400">{selectedPromo.validUntil}</strong></span>
                  <span>•</span>
                  <span>🏥 {clinicName} Official</span>
                </div>
              </div>

              {/* Promo Voucher Box */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">KODE KLAIM DISKON SPESIAL</span>
                  <span className="font-mono text-lg font-black text-slate-900 dark:text-white tracking-widest block">
                    {selectedPromo.promoCode || 'PROMO-ALWI'}
                  </span>
                </div>

                <button
                  onClick={() => handleCopyCode(selectedPromo.promoCode || 'PROMO-ALWI')}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" /> Tersalin!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Salin Kode
                    </>
                  )}
                </button>
              </div>

              {/* Article Content / Terms & Narrative */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-500" /> Detail Artikel & Ketentuan Layanan
                </h3>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <p>{selectedPromo.description}</p>
                  <ul className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700/80 text-xs">
                    <li className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4 shrink-0" /> Sudah termasuk konsultasi dan resep gratis dengan dokter spesialis.
                    </li>
                    <li className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4 shrink-0" /> Berlaku untuk pasien konsultasi langsung di klinik maupun Home Service.
                    </li>
                    <li className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4 shrink-0" /> Tunjukkan kode voucher di atas saat melakukan reservasi antrean.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Modal Action Footer */}
            <div className="p-6 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
              <button
                onClick={() => setSelectedPromo(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition"
              >
                Tutup
              </button>

              <Link
                to="/login"
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-lg shadow-sky-600/30 transition flex items-center gap-2"
              >
                <CalendarCheck className="w-4 h-4" /> Klaim & Reservasi Antrean Sekarang <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 px-6 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 font-bold text-sky-600 dark:text-sky-400">
            <HeartPulse className="w-4 h-4 text-rose-500" /> {clinicName} • Katalog Artikel & Promo Medis Resmi
          </div>
          <div>
            © {new Date().getFullYear()} {clinicName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};


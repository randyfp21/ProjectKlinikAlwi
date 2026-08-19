import React, { useEffect } from 'react';
import { Gift, Tag, ArrowRight, ArrowLeft, Hospital, Sparkles, ChevronRight, HeartPulse } from 'lucide-react';
import { useCMSStore, CMSPromo } from '../store/useCMSStore';
import { Link } from 'react-router-dom';

export const PublicPromosArticlesPage: React.FC = () => {
  const cms = useCMSStore();

  useEffect(() => {
    cms.fetchCMSFromDB();
  }, []);

  const promos = cms.promos || [];
  const clinicName = cms.clinicName || 'Klinik Utama Alwi';
  const clinicTagline = cms.clinicTagline || 'Layanan Kesehatan Modern, Cepat & Terpercaya';
  const clinicLogoIcon = cms.clinicLogoIcon;

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
            Temukan seluruh paket hemat MCU, imunisasi anak & lansia, terapi booster vitamin, serta penawaran spesial pelayanan kesehatan terbaru dari {clinicName}.
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
            <Sparkles className="w-3.5 h-3.5" /> Terintegrasi PostgreSQL 5432
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promos.map((promo: CMSPromo) => (
            <div
              key={promo.id}
              className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 overflow-hidden shadow-lg hover:shadow-2xl transition space-y-4 flex flex-col justify-between group hover:-translate-y-1"
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
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                    {promo.description}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-4 flex items-center justify-between">
                <span className="text-xs text-sky-600 dark:text-sky-400 font-mono font-bold flex items-center gap-1 bg-sky-500/10 dark:bg-sky-500/20 px-2.5 py-1 rounded-lg border border-sky-500/20">
                  <Tag className="w-3.5 h-3.5 text-sky-500" /> {promo.promoCode || 'PROMO-ALWI'}
                </span>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition"
                >
                  Klaim Promo <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

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

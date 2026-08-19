import React from 'react';
import { useLanguageStore } from '../store/useLanguageStore';

export const LanguageSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { lang, setLang } = useLanguageStore();

  return (
    <button
      type="button"
      onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
      title={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
      className={`px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-1.5 text-xs font-bold shrink-0 cursor-pointer ${className}`}
    >
      <span>{lang === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}</span>
      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-extrabold uppercase border border-amber-500/20">
        BETA
      </span>
    </button>
  );
};

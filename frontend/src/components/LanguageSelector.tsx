import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguageStore, Language } from '../store/useLanguageStore';

export const LanguageSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { lang, setLang } = useLanguageStore();

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Globe className="w-3 h-3 text-sky-500" /> Bahasa / Language
        </span>
        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-[9px] border border-amber-500/30">
          FITUR BETA
        </span>
      </div>
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setLang('id')}
          className={`flex-1 py-1 px-2 rounded-lg transition text-center text-xs flex items-center justify-center gap-1 ${
            lang === 'id'
              ? 'bg-sky-600 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          🇮🇩 Indonesia
        </button>
        <button
          type="button"
          onClick={() => setLang('en')}
          className={`flex-1 py-1 px-2 rounded-lg transition text-center text-xs flex items-center justify-center gap-1 ${
            lang === 'en'
              ? 'bg-sky-600 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          🇬🇧 English
        </button>
      </div>
    </div>
  );
};

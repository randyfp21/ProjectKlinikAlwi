import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguageStore, Language } from '../store/useLanguageStore';

export const LanguageSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { lang, setLang } = useLanguageStore();

  return (
    <div className={`flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs font-semibold ${className}`}>
      <Globe className="w-3.5 h-3.5 text-sky-400 ml-1.5" />
      <button
        type="button"
        onClick={() => setLang('id')}
        className={`px-2 py-1 rounded-lg transition ${
          lang === 'id'
            ? 'bg-sky-600 text-white font-bold shadow-xs'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        🇮🇩 ID
      </button>
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`px-2 py-1 rounded-lg transition ${
          lang === 'en'
            ? 'bg-sky-600 text-white font-bold shadow-xs'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        🇬🇧 EN
      </button>
    </div>
  );
};

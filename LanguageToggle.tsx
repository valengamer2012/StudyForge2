import { Globe } from 'lucide-react';
import { Language } from '../lib/i18n';
export default function LanguageToggle({ lang, setLang }: { lang: Language; setLang: (l: Language) => void }) {
  return (
    <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2 py-1 border border-white/5">
      <Globe size={14} className="text-slate-500" />
      <button onClick={()=>setLang('en')} className={`text-xs font-semibold px-1.5 py-0.5 rounded transition-all ${lang==='en'?'bg-blue-500/20 text-blue-400':'text-slate-500 hover:text-white'}`}>EN</button>
      <button onClick={()=>setLang('es')} className={`text-xs font-semibold px-1.5 py-0.5 rounded transition-all ${lang==='es'?'bg-blue-500/20 text-blue-400':'text-slate-500 hover:text-white'}`}>ES</button>
    </div>
  );
}

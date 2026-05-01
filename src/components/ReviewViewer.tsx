import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, ChevronUp, GraduationCap, CheckCircle } from 'lucide-react';
import { Language, t } from '../lib/i18n';

interface Props { notes: { title: string; content: string }[]; lang: Language; }

export default function ReviewViewer({ notes, lang }: Props) {
  const [expanded, setExpanded] = useState<number | null>(0);
  const [read, setRead] = useState<Set<number>>(new Set());
  const es = lang === 'es';

  const toggle = (i: number) => {
    setExpanded(expanded === i ? null : i);
    setRead(prev => new Set(prev).add(i));
  };

  const pct = Math.round((read.size / notes.length) * 100);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><GraduationCap size={18} className="text-emerald-400" /><span className="text-sm text-slate-400">{read.size} {t(lang, 'of')} {notes.length} {es ? 'leidas' : 'read'}</span></div>
        {read.size === notes.length && <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1.5 text-emerald-400 text-sm font-semibold"><CheckCircle size={16} />{es ? 'Completo!' : 'Complete!'}</motion.div>}
      </div>
      <div className="w-full bg-white/5 rounded-full h-1.5"><motion.div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full" animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} /></div>
      <div className="space-y-3">
        {notes.map((n, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className={`rounded-2xl border overflow-hidden transition-all ${expanded === i ? 'glass-light border-emerald-500/30' : read.has(i) ? 'glass-light border-white/5' : 'glass-light border-white/10 hover:border-white/15'}`}>
            <button onClick={() => toggle(i)} className="w-full flex items-center gap-4 p-4 text-left">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold ${read.has(i) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>{read.has(i) ? <CheckCircle size={16} /> : i + 1}</div>
              <div className="flex-1 min-w-0"><h3 className={`font-semibold text-sm ${expanded === i ? 'text-emerald-300' : 'text-white'}`}>{n.title}</h3>{expanded !== i && <p className="text-xs text-slate-600 truncate mt-0.5">{n.content.slice(0, 80)}...</p>}</div>
              <div className="text-slate-600 shrink-0">{expanded === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
            </button>
            <AnimatePresence>
              {expanded === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                  <div className="px-4 pb-5 pl-16"><p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{n.content}</p></div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
      <div className="flex items-start gap-3 p-4 glass-light rounded-xl border border-white/5"><BookOpen size={16} className="text-blue-400 shrink-0 mt-0.5" /><p className="text-xs text-slate-500">{es ? 'Lee cada seccion antes de pasar a tarjetas y cuestionarios.' : 'Read each section before moving to flashcards and quizzes.'}</p></div>
    </div>
  );
}

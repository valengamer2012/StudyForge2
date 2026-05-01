import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, RotateCcw, Award } from 'lucide-react';
import { Language, t } from '../lib/i18n';

function normalize(str: string): string {
  return str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

interface Props { items: { sentence: string; answer: string }[]; lang: Language; }

export default function FillBlanksViewer({ items, lang }: Props) {
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const item = items[idx];
  const correct = submitted && normalize(answer) === normalize(item.answer);

  const submit = () => { if (!answer.trim()) return; setSubmitted(true); if (normalize(answer) === normalize(item.answer)) setScore(s => s + 1); };
  const next = () => { if (idx < items.length - 1) { setIdx(i => i + 1); setAnswer(''); setSubmitted(false); } else setDone(true); };
  const reset = () => { setIdx(0); setAnswer(''); setSubmitted(false); setScore(0); setDone(false); };

  if (done) {
    const pct = Math.round((score / items.length) * 100);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
        <Award size={56} className={`mx-auto mb-4 ${pct >= 75 ? 'text-amber-400' : pct >= 50 ? 'text-slate-400' : 'text-red-400'}`} />
        <h3 className="text-2xl font-bold text-white mb-2">{t(lang, 'completedFill')}</h3>
        <p className="text-4xl font-extrabold text-blue-400 mb-1">{pct}%</p>
        <p className="text-slate-400 mb-6">{score} / {items.length}</p>
        <button onClick={reset} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold flex items-center gap-2 mx-auto"><RotateCcw size={18} />{t(lang, 'resetFill')}</button>
      </motion.div>
    );
  }

  const parts = item.sentence.split('_____');

  return (
    <div className="space-y-6">
      <div className="flex justify-between text-sm"><span className="text-slate-500">{idx + 1} {t(lang, 'of')} {items.length}</span><span className="text-blue-400 font-medium">{t(lang, 'score')}: {score}</span></div>
      <div className="w-full bg-white/5 rounded-full h-1.5"><div className="bg-gradient-to-r from-amber-500 to-orange-500 h-1.5 rounded-full transition-all" style={{ width: `${((idx + 1) / items.length) * 100}%` }} /></div>
      <div className="glass-light rounded-2xl p-6 border border-white/10">
        <p className="text-lg text-white leading-relaxed">{parts[0]}<span className="inline-block mx-1 min-w-[100px] border-b-2 border-dashed border-blue-400 text-blue-400 font-semibold">{submitted ? item.answer : answer || '...'}</span>{parts[1]}</p>
      </div>
      {!submitted ? (
        <div className="flex gap-3">
          <input type="text" value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder={t(lang, 'yourAnswer')} className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/50" />
          <button onClick={submit} disabled={!answer.trim()} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl disabled:opacity-40 text-sm">{t(lang, 'submit')}</button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className={`flex items-center gap-2 text-lg font-semibold ${correct ? 'text-emerald-400' : 'text-red-400'}`}>{correct ? <CheckCircle size={22} /> : <XCircle size={22} />}{correct ? t(lang, 'correct') : t(lang, 'incorrect')}</div>
          {!correct && <p className="text-slate-400 text-sm">{t(lang, 'yourAnswer')}: <span className="text-red-300 line-through">{answer}</span> → <span className="text-emerald-400 font-semibold">{item.answer}</span></p>}
          <div className="flex justify-end"><button onClick={next} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm">{idx < items.length - 1 ? t(lang, 'next') : t(lang, 'score')}</button></div>
        </motion.div>
      )}
    </div>
  );
}

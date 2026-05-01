import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react';
import { Language, t } from '../lib/i18n';

interface Props { quizzes: { question: string; options: string[]; answer: number }[]; lang: Language; }

export default function QuizViewer({ quizzes, lang }: Props) {
  const [cur, setCur] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [done, setDone] = useState(false);
  const q = quizzes[cur];

  const pick = (i: number) => { if (answered) return; setSel(i); setAnswered(true); if (i === q.answer) setScore(s => s + 1); };
  const next = () => { if (cur < quizzes.length - 1) { setCur(c => c + 1); setSel(null); setAnswered(false); } else setDone(true); };
  const reset = () => { setCur(0); setSel(null); setScore(0); setAnswered(false); setDone(false); };

  if (done) {
    const pct = Math.round((score / quizzes.length) * 100);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
        <Trophy size={56} className={`mx-auto mb-4 ${pct >= 75 ? 'text-amber-400' : pct >= 50 ? 'text-slate-400' : 'text-red-400'}`} />
        <h3 className="text-2xl font-bold text-white mb-2">{t(lang, 'completedQuiz')}</h3>
        <p className="text-4xl font-extrabold text-blue-400 mb-1">{pct}%</p>
        <p className="text-slate-400 mb-6">{score} / {quizzes.length}</p>
        <button onClick={reset} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold flex items-center gap-2 mx-auto"><RotateCcw size={18} />{t(lang, 'resetQuiz')}</button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between text-sm"><span className="text-slate-500">{cur + 1} {t(lang, 'of')} {quizzes.length}</span><span className="text-blue-400 font-medium">{t(lang, 'score')}: {score}</span></div>
      <div className="w-full bg-white/5 rounded-full h-1.5"><div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${((cur + 1) / quizzes.length) * 100}%` }} /></div>
      <h3 className="text-lg font-semibold text-white">{q.question}</h3>
      <div className="space-y-3">
        {q.options.map((opt, i) => {
          let cls = 'border-white/10 bg-white/5 hover:bg-white/10 text-white';
          if (answered) {
            if (i === q.answer) cls = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300';
            else if (i === sel) cls = 'border-red-500/50 bg-red-500/10 text-red-300';
            else cls = 'border-white/5 bg-white/3 text-slate-600';
          }
          return (
            <motion.button key={i} whileHover={!answered ? { scale: 1.01 } : {}} onClick={() => pick(i)} className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${cls}`}>
              <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold shrink-0">{String.fromCharCode(65 + i)}</span>
              <span className="font-medium text-sm">{opt}</span>
              {answered && i === q.answer && <CheckCircle size={18} className="ml-auto text-emerald-400" />}
              {answered && i === sel && i !== q.answer && <XCircle size={18} className="ml-auto text-red-400" />}
            </motion.button>
          );
        })}
      </div>
      {answered && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end"><button onClick={next} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm">{cur < quizzes.length - 1 ? t(lang, 'next') : t(lang, 'score')}</button></motion.div>}
    </div>
  );
}

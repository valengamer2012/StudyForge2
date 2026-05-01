import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Sparkles, Clock, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PaywallModal from '../components/PaywallModal';
import UsageBadge from '../components/UsageBadge';
import UpgradeBanner from '../components/UpgradeBanner';
import { useSubscription } from '../lib/useSubscription';
import type { Language } from '../lib/i18n';
import type { User } from '@supabase/supabase-js';

interface SolveResult {
  id: number; problem: string; subject: string;
  steps: { step: number; title: string; content: string; hint: string }[];
  final_answer: string; explanation: string; created_at: string;
}

export default function SolverPage({ lang, setLang, user }: { lang: Language; setLang: (l: Language) => void; user: User | null; authLoading: boolean }) {
  const es = lang === 'es';
  const nav = useNavigate();
  const [problem, setProblem] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SolveResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [histLoading, setHistLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  const { plan, canUse, getRemaining, getLimit, trackUsage } = useSubscription(user);

  useEffect(() => {
    fetch('/api/solve-problem').then(r => r.json()).then(d => { if (Array.isArray(d)) setHistory(d); }).catch(() => {}).finally(() => setHistLoading(false));
  }, []);

  const handleSolve = async () => {
    if (problem.trim().length < 3 || loading) return;

    if (!user) { nav('/auth?redirect=/solver'); return; }

    if (!canUse('problem_solves')) {
      setShowPaywall(true);
      return;
    }

    setLoading(true);
    try {
      await trackUsage('problem_solves');
      const res = await fetch('/api/solve-problem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problem, language: lang }) });
      const data = await res.json();
      if (res.ok) { setResult(data); setHistory(prev => [{ id: data.id, problem: data.problem, subject: data.subject, final_answer: data.final_answer, created_at: data.created_at }, ...prev]); }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const examples = es
    ? ['2x + 5 = 15', 'x^2 - 5x + 6 = 0', '144 / 12', '25 * 37']
    : ['2x + 5 = 15', 'x^2 - 5x + 6 = 0', '144 / 12', '25 * 37'];

  const remaining = getRemaining('problem_solves');
  const limit = getLimit('problem_solves');

  return (
    <div className="min-h-screen bg-[#060b18]">
      <Navbar lang={lang} setLang={setLang} user={user} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"><Calculator size={20} className="text-white" /></div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">{es ? 'Resolutor Paso a Paso' : 'Step-by-Step Solver'}</h1>
            </div>
            {user && (
              <UsageBadge plan={plan} feature="problem_solves" remaining={remaining} limit={limit} lang={lang} onUpgrade={() => setShowPaywall(true)} />
            )}
          </div>
          <p className="text-slate-400 text-sm mb-6 ml-[52px]">{es ? 'Ingresa un problema de matematicas o ciencias y obten la solucion detallada' : 'Enter a math or science problem and get a detailed solution'}</p>
        </motion.div>

        {user && plan === 'free' && remaining <= 1 && remaining > 0 && (
          <div className="mb-6">
            <UpgradeBanner lang={lang} context="problem_solves" />
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Input */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-light rounded-2xl border border-white/10 p-5 space-y-4">
              <textarea value={problem} onChange={e => setProblem(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSolve(); } }} placeholder={es ? 'Escribe tu problema aqui... (ej: 2x + 5 = 15)' : 'Type your problem here... (e.g., 2x + 5 = 15)'} rows={4} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/50 resize-none" />
              <button onClick={handleSolve} disabled={loading || problem.trim().length < 3} className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl disabled:opacity-40 transition-all flex items-center justify-center gap-2 text-sm">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={16} />}
                {loading ? (es ? 'Resolviendo...' : 'Solving...') : (es ? 'Resolver' : 'Solve')}
              </button>
              <div className="flex flex-wrap gap-2">
                {examples.map(ex => (
                  <button key={ex} onClick={() => setProblem(ex)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-slate-400 hover:text-white transition-all font-mono">{ex}</button>
                ))}
              </div>
            </div>
            {history.length > 0 && (
              <div className="glass-light rounded-2xl border border-white/10 p-5">
                <h3 className="text-sm font-semibold text-slate-400 mb-3">{es ? 'Historial' : 'History'}</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
                  {history.map(h => (
                    <div key={h.id} className="p-3 rounded-lg bg-white/5 hover:bg-white/8 transition-all cursor-default">
                      <p className="text-sm text-white font-mono truncate">{h.problem}</p>
                      <p className="text-xs text-emerald-400 mt-1">{h.final_answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Solution */}
          <div className="lg:col-span-3">
            {!result ? (
              <div className="glass-light rounded-2xl border border-white/10 p-12 text-center">
                <Calculator size={48} className="mx-auto text-slate-700 mb-4" />
                <p className="text-slate-500">{es ? 'Tu solucion aparecera aqui' : 'Your solution will appear here'}</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="glass-light rounded-2xl border border-emerald-500/20 p-6 bg-gradient-to-r from-emerald-500/5 to-teal-500/5">
                  <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-1">{es ? 'Respuesta Final' : 'Final Answer'}</p>
                  <p className="text-2xl font-extrabold text-white font-mono">{result.final_answer}</p>
                </div>
                <div className="glass-light rounded-2xl border border-white/10 p-6">
                  <h3 className="text-sm font-semibold text-slate-300 mb-5">{es ? 'Solucion Paso a Paso' : 'Step-by-Step Solution'}</h3>
                  <div className="space-y-5">
                    {result.steps.map((s, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex gap-4">
                        <div className="shrink-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold">{s.step}</div>
                          {i < result.steps.length - 1 && <div className="w-px h-8 bg-white/10 mx-auto mt-1" />}
                        </div>
                        <div className="flex-1 pb-2">
                          <h4 className="text-sm font-semibold text-white mb-1">{s.title}</h4>
                          <p className="text-sm text-slate-300 font-mono bg-white/5 rounded-lg p-3">{s.content}</p>
                          <p className="text-xs text-slate-500 mt-2 flex items-start gap-1.5"><Lightbulb size={12} className="shrink-0 mt-0.5 text-amber-500" />{s.hint}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="glass-light rounded-2xl border border-white/10 p-5">
                  <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2"><Lightbulb size={16} className="text-amber-400" />{es ? 'Explicacion' : 'Explanation'}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{result.explanation}</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="problem_solves"
        featureLabel={es ? 'problemas resueltos' : 'problem solves'}
        used={limit - remaining}
        limit={limit}
        lang={lang}
        plan={plan}
      />
    </div>
  );
}

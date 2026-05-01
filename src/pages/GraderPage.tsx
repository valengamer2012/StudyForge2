import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles, Clock, BarChart3, CheckCircle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PaywallModal from '../components/PaywallModal';
import UsageBadge from '../components/UsageBadge';
import UpgradeBanner from '../components/UpgradeBanner';
import { useSubscription } from '../lib/useSubscription';
import type { Language } from '../lib/i18n';
import type { User } from '@supabase/supabase-js';

interface GradeResult {
  id: number; title: string; content: string; overall_score: number;
  rubric_scores: { category: string; score: number; max: number; comment: string }[];
  feedback: { type: string; text: string }[];
  strengths: string[]; improvements: string[]; created_at: string;
}

export default function GraderPage({ lang, setLang, user }: { lang: Language; setLang: (l: Language) => void; user: User | null; authLoading: boolean }) {
  const es = lang === 'es';
  const nav = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [histLoading, setHistLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  const { plan, canUse, getRemaining, getLimit, trackUsage } = useSubscription(user);

  useEffect(() => {
    fetch('/api/grade-paper').then(r => r.json()).then(d => { if (Array.isArray(d)) setHistory(d); }).catch(() => {}).finally(() => setHistLoading(false));
  }, []);

  const handleGrade = async () => {
    if (content.trim().length < 20 || loading) return;

    // Auth gate
    if (!user) { nav('/auth?redirect=/grader'); return; }

    // Usage gate
    if (!canUse('paper_grades')) {
      setShowPaywall(true);
      return;
    }

    setLoading(true);
    try {
      await trackUsage('paper_grades');
      const res = await fetch('/api/grade-paper', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: title || 'Untitled', content, language: lang }) });
      const data = await res.json();
      if (res.ok) { setResult(data); setHistory(prev => [{ id: data.id, title: data.title, overall_score: data.overall_score, created_at: data.created_at }, ...prev]); }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const scoreColor = (s: number) => s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-amber-400' : 'text-red-400';
  const scoreBg = (s: number) => s >= 80 ? 'bg-emerald-500' : s >= 60 ? 'bg-amber-500' : 'bg-red-500';
  const remaining = getRemaining('paper_grades');
  const limit = getLimit('paper_grades');

  return (
    <div className="min-h-screen bg-[#060b18]">
      <Navbar lang={lang} setLang={setLang} user={user} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"><FileText size={20} className="text-white" /></div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">{es ? 'Calificador de Ensayos IA' : 'AI Paper Grader'}</h1>
            </div>
            {user && (
              <UsageBadge plan={plan} feature="paper_grades" remaining={remaining} limit={limit} lang={lang} onUpgrade={() => setShowPaywall(true)} />
            )}
          </div>
          <p className="text-slate-400 text-sm mb-6 ml-[52px]">{es ? 'Sube tu ensayo y recibe retroalimentacion detallada con rubrica' : 'Upload your essay and receive detailed rubric-based feedback'}</p>
        </motion.div>

        {/* Upgrade banner for free users with low remaining */}
        {user && plan === 'free' && remaining <= 1 && remaining > 0 && (
          <div className="mb-6">
            <UpgradeBanner lang={lang} context="paper_grades" />
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Input */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-light rounded-2xl border border-white/10 p-5 space-y-4">
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={es ? 'Titulo del ensayo (opcional)' : 'Essay title (optional)'} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/50" />
              <textarea value={content} onChange={e => setContent(e.target.value)} placeholder={es ? 'Pega tu ensayo o trabajo aqui...' : 'Paste your essay or assignment here...'} rows={12} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/50 resize-none leading-relaxed" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">{content.split(/\s+/).filter(Boolean).length} {es ? 'palabras' : 'words'}</span>
                <button onClick={handleGrade} disabled={loading || content.trim().length < 20} className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl disabled:opacity-40 transition-all flex items-center gap-2 text-sm">
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={16} />}
                  {loading ? (es ? 'Analizando...' : 'Analyzing...') : (es ? 'Calificar' : 'Grade Paper')}
                </button>
              </div>
            </div>
            {history.length > 0 && (
              <div className="glass-light rounded-2xl border border-white/10 p-5">
                <h3 className="text-sm font-semibold text-slate-400 mb-3">{es ? 'Historial' : 'History'}</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
                  {history.map(h => (
                    <div key={h.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/8 transition-all cursor-default">
                      <div><p className="text-sm text-white font-medium truncate max-w-[180px]">{h.title}</p><p className="text-xs text-slate-500 flex items-center gap-1"><Clock size={10} />{new Date(h.created_at).toLocaleDateString()}</p></div>
                      <span className={`text-lg font-bold ${scoreColor(h.overall_score)}`}>{h.overall_score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {!result ? (
              <div className="glass-light rounded-2xl border border-white/10 p-12 text-center">
                <BarChart3 size={48} className="mx-auto text-slate-700 mb-4" />
                <p className="text-slate-500">{es ? 'Tu retroalimentacion aparecera aqui' : 'Your feedback will appear here'}</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <div className="glass-light rounded-2xl border border-white/10 p-6 text-center">
                  <p className="text-sm text-slate-400 mb-2">{es ? 'Puntuacion General' : 'Overall Score'}</p>
                  <div className={`text-6xl font-extrabold ${scoreColor(result.overall_score)}`}>{result.overall_score}<span className="text-2xl text-slate-600">/100</span></div>
                </div>
                <div className="glass-light rounded-2xl border border-white/10 p-6 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2"><BarChart3 size={16} />{es ? 'Rubrica Detallada' : 'Detailed Rubric'}</h3>
                  {result.rubric_scores.map((r, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1"><span className="text-sm text-slate-300">{r.category}</span><span className={`text-sm font-bold ${scoreColor(r.score)}`}>{r.score}/{r.max}</span></div>
                      <div className="w-full bg-white/5 rounded-full h-2"><div className={`h-2 rounded-full ${scoreBg(r.score)} transition-all`} style={{ width: `${r.score}%` }} /></div>
                      <p className="text-xs text-slate-500 mt-1">{r.comment}</p>
                    </div>
                  ))}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="glass-light rounded-2xl border border-white/10 p-5">
                    <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-3"><CheckCircle size={16} />{es ? 'Fortalezas' : 'Strengths'}</h3>
                    <ul className="space-y-2">{result.strengths.map((s, i) => <li key={i} className="text-sm text-slate-300 flex items-start gap-2"><span className="text-emerald-500 mt-1">•</span>{s}</li>)}</ul>
                  </div>
                  <div className="glass-light rounded-2xl border border-white/10 p-5">
                    <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-3"><TrendingUp size={16} />{es ? 'Areas de Mejora' : 'Areas to Improve'}</h3>
                    <ul className="space-y-2">{result.improvements.map((s, i) => <li key={i} className="text-sm text-slate-300 flex items-start gap-2"><span className="text-amber-500 mt-1">•</span>{s}</li>)}</ul>
                  </div>
                </div>
                {result.feedback.map((f, i) => (
                  <div key={i} className="glass-light rounded-2xl border border-white/10 p-5">
                    <p className="text-sm text-slate-300 leading-relaxed">{f.text}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="paper_grades"
        featureLabel={es ? 'calificaciones' : 'paper grades'}
        used={limit - remaining}
        limit={limit}
        lang={lang}
        plan={plan}
      />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calculator, Search, Lightbulb, Cog, CheckCircle, AlertCircle } from 'lucide-react';
import { Language } from '../lib/i18n';

const stepIcons: Record<string, typeof Search> = { identify: Search, formula: Lightbulb, calculation: Cog, solution: CheckCircle, verify: AlertCircle };
const stepColors: Record<string, string> = { identify: 'from-blue-500 to-indigo-500', formula: 'from-violet-500 to-purple-500', calculation: 'from-amber-500 to-orange-500', solution: 'from-emerald-500 to-teal-500', verify: 'from-cyan-500 to-blue-500' };

export default function SolveResultPage({ lang }: { lang: Language; setLang: (l: Language) => void }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isEs = lang === 'es';

  useEffect(() => {
    fetch(`/api/solve-problem?id=${id}`).then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center"><div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  if (!data) return <div className="min-h-screen bg-surface"><div className="text-center py-32 text-text-3">Not found</div></div>;

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => navigate('/solver')} className="flex items-center gap-2 text-text-3 hover:text-primary text-sm font-medium mb-6 transition-colors"><ArrowLeft size={16} />{isEs ? 'Volver' : 'Back'}</button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-2 mb-2"><Calculator size={18} className="text-primary" /><span className="text-xs font-semibold text-primary uppercase tracking-wider">{data.subject}</span></div>
            <h1 className="text-xl font-extrabold text-text">{data.problem}</h1>
          </div>
          <div className="space-y-3">
            {data.steps?.map((step: any, i: number) => {
              const Icon = stepIcons[step.type] || Cog;
              const color = stepColors[step.type] || 'from-gray-500 to-gray-600';
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-2xl border border-border p-5 flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0 shadow-md`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-text text-sm">{step.title}</h3>
                    <p className="text-text-2 text-sm mt-1 leading-relaxed">{step.content}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
            <p className="text-sm font-semibold opacity-80 mb-1">{isEs ? 'Respuesta Final' : 'Final Answer'}</p>
            <p className="text-2xl font-extrabold">{data.final_answer}</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-bold text-text mb-2 flex items-center gap-2"><Lightbulb size={16} className="text-warning" />{isEs ? 'Explicacion' : 'Explanation'}</h2>
            <p className="text-text-2 text-sm leading-relaxed">{data.explanation}</p>
          </div>
          <button onClick={() => navigate('/solver')} className="w-full py-3 bg-card border border-border rounded-xl text-text font-semibold hover:border-primary/30 transition-all text-sm">
            {isEs ? 'Resolver otro problema' : 'Solve another problem'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

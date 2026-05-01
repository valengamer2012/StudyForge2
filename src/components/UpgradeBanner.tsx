import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Zap, X } from 'lucide-react';
import { useState } from 'react';
import { getUpgradeUrl } from '../lib/useSubscription';

interface Props {
  lang: 'en' | 'es';
  context?: string;
}

export default function UpgradeBanner({ lang, context }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const es = lang === 'es';

  if (dismissed) return null;

  const messages: Record<string, { en: string; es: string }> = {
    study_sets: {
      en: 'Unlock unlimited study sets and advanced AI features',
      es: 'Desbloquea sets de estudio ilimitados y funciones IA avanzadas',
    },
    paper_grades: {
      en: 'Grade unlimited papers with detailed rubric feedback',
      es: 'Califica ensayos ilimitados con retroalimentacion detallada',
    },
    problem_solves: {
      en: 'Solve unlimited problems with step-by-step explanations',
      es: 'Resuelve problemas ilimitados con explicaciones paso a paso',
    },
    default: {
      en: 'Upgrade to Pro for unlimited access to all tools',
      es: 'Actualiza a Pro para acceso ilimitado a todas las herramientas',
    },
  };

  const msg = messages[context || 'default'] || messages.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-r from-blue-600/15 via-indigo-600/10 to-violet-600/15 border border-blue-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
    >
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1 text-slate-600 hover:text-slate-400 transition-colors"
      >
        <X size={14} />
      </button>

      <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
        <Zap size={20} className="text-blue-400" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white mb-0.5">
          {es ? 'Mejora tu experiencia' : 'Supercharge your learning'}
        </p>
        <p className="text-xs text-slate-400">
          {es ? msg.es : msg.en}
        </p>
      </div>

      <a
        href={getUpgradeUrl('pro', 'yearly')}
        target="_blank"
        rel="noopener noreferrer"
        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 hover:-translate-y-0.5 shrink-0"
      >
        <Sparkles size={13} />
        {es ? 'Obtener Pro — $8/mes' : 'Get Pro — $8/mo'}
        <ArrowRight size={13} />
      </a>
    </motion.div>
  );
}

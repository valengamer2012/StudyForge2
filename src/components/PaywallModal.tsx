import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Zap, Check, Lock, Sparkles, ArrowRight, TrendingUp, Shield, Star } from 'lucide-react';
import { getUpgradeUrl, type Plan } from '../lib/useSubscription';

interface Props {
  open: boolean;
  onClose: () => void;
  feature: string;
  featureLabel: string;
  used: number;
  limit: number;
  lang: 'en' | 'es';
  plan: Plan;
}

export default function PaywallModal({ open, onClose, feature, featureLabel, used, limit, lang, plan }: Props) {
  const es = lang === 'es';

  const proFeatures = es ? [
    'Sets de estudio ilimitados',
    'Calificador de ensayos ilimitado',
    'Resolutor de problemas ilimitado',
    'Herramientas IA avanzadas',
    'Seguimiento de progreso',
    'Exportar a PDF',
    'Soporte prioritario',
  ] : [
    'Unlimited study sets',
    'Unlimited paper grading',
    'Unlimited problem solving',
    'Advanced AI tools',
    'Progress tracking',
    'Export to PDF',
    'Priority support',
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg rounded-3xl overflow-hidden"
          >
            {/* Gradient top bar */}
            <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

            <div className="bg-[#0c1222] border border-white/10 rounded-b-3xl">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all z-10"
              >
                <X size={18} />
              </button>

              {/* Header */}
              <div className="px-8 pt-8 pb-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center mx-auto mb-5"
                >
                  <Lock size={28} className="text-blue-400" />
                </motion.div>

                <h2 className="text-2xl font-extrabold text-white mb-2">
                  {es ? 'Limite gratuito alcanzado' : 'Free limit reached'}
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                  {es
                    ? `Has usado ${used} de ${limit} ${featureLabel} gratis este mes. Actualiza para desbloquear uso ilimitado.`
                    : `You've used ${used} of ${limit} free ${featureLabel} this month. Upgrade to unlock unlimited access.`}
                </p>
              </div>

              {/* Usage bar */}
              <div className="px-8 mb-6">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {es ? 'Uso mensual' : 'Monthly usage'}
                    </span>
                    <span className="text-xs font-bold text-red-400">
                      {used}/{limit}
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="h-2.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Pro card */}
              <div className="px-8 mb-6">
                <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 rounded-2xl border border-blue-500/20 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Zap size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">StudyForge Pro</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-white">$8</span>
                        <span className="text-slate-400 text-xs">/{es ? 'mes' : 'mo'}</span>
                        <span className="ml-2 text-xs text-slate-600 line-through">$12</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {proFeatures.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check size={14} className="text-blue-400 shrink-0" />
                        <span className="text-xs text-slate-300">{f}</span>
                      </div>
                    ))}
                  </div>

                  <a
                    href={getUpgradeUrl('pro', 'yearly')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5"
                  >
                    <Sparkles size={16} />
                    {es ? 'Actualizar a Pro' : 'Upgrade to Pro'}
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>

              {/* Premium upsell */}
              <div className="px-8 mb-6">
                <a
                  href={getUpgradeUrl('premium', 'yearly')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-amber-500/20 hover:bg-amber-500/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center">
                      <Crown size={18} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {es ? 'Premium — $18/mes' : 'Premium — $18/mo'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {es ? 'Tutoria IA, analiticas, acceso anticipado' : 'AI tutoring, analytics, early access'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-slate-600 group-hover:text-amber-400 transition-colors" />
                </a>
              </div>

              {/* Trust */}
              <div className="px-8 pb-8">
                <div className="flex items-center justify-center gap-5 text-[11px] text-slate-600">
                  <span className="flex items-center gap-1"><Shield size={11} /> {es ? 'Pago seguro' : 'Secure payment'}</span>
                  <span className="flex items-center gap-1"><Star size={11} /> {es ? 'Cancela cuando quieras' : 'Cancel anytime'}</span>
                  <span className="flex items-center gap-1"><TrendingUp size={11} /> {es ? 'Garantia 30 dias' : '30-day guarantee'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

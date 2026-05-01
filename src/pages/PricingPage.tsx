import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Shield, Zap, Crown, Sparkles, Star, Clock, HeartHandshake, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import supabase from '../lib/supabase';
import type { Language } from '../lib/i18n';
import type { User } from '@supabase/supabase-js';

export default function PricingPage({ lang, setLang, user, authLoading }: { lang: Language; setLang: (l: Language) => void; user: User | null; authLoading: boolean }) {
  const [yearly, setYearly] = useState(true);
  const [currentPlan, setCurrentPlan] = useState('free');
  const nav = useNavigate();
  const es = lang === 'es';

  useEffect(() => {
    if (!user) return;
    const fetchSub = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      try {
        const res = await fetch('/api/subscriptions', {
          headers: { 'Authorization': `Bearer ${session.access_token}` },
        });
        const data = await res.json();
        if (data.plan) setCurrentPlan(data.plan);
      } catch {}
    };
    fetchSub();
  }, [user]);

  const handleSelect = (planKey: string) => {
    if (planKey === 'free') return;
    if (!user) {
      nav('/auth?redirect=/checkout?plan=' + planKey + '&cycle=' + (yearly ? 'yearly' : 'monthly'));
      return;
    }
    nav(`/checkout?plan=${planKey}&cycle=${yearly ? 'yearly' : 'monthly'}`);
  };

  const plans = [
    {
      key: 'free',
      name: 'Free',
      icon: Sparkles,
      price: { monthly: 0, yearly: 0 },
      desc: es ? 'Perfecto para empezar' : 'Perfect to get started',
      cta: currentPlan === 'free' ? (es ? 'Plan Actual' : 'Current Plan') : (es ? 'Comenzar Gratis' : 'Start Free'),
      color: 'slate',
      popular: false,
      features: [
        es ? '5 resumenes IA por mes' : '5 AI summaries per month',
        es ? 'Tarjetas basicas' : 'Basic flashcards',
        es ? 'Cuestionarios limitados' : 'Limited quizzes',
        es ? '1 calificacion de ensayo' : '1 paper grade per month',
        es ? 'Resolutor basico' : 'Basic problem solver',
        es ? 'Acceso comunitario' : 'Community access',
      ],
    },
    {
      key: 'pro',
      name: 'Pro',
      icon: Zap,
      price: { monthly: 12, yearly: 8 },
      desc: es ? 'Para estudiantes serios' : 'For serious students',
      cta: currentPlan === 'pro' ? (es ? 'Plan Actual' : 'Current Plan') : (es ? 'Obtener Pro' : 'Get Pro'),
      color: 'blue',
      popular: true,
      features: [
        es ? 'Resumenes IA ilimitados' : 'Unlimited AI summaries',
        es ? 'Tarjetas avanzadas con IA' : 'Advanced AI flashcards',
        es ? 'Generacion de cuestionarios' : 'Quiz generation',
        es ? 'Calificaciones ilimitadas' : 'Unlimited paper grades',
        es ? 'Resolutor avanzado' : 'Advanced problem solver',
        es ? 'Seguimiento de racha' : 'Streak tracking',
        es ? 'Calendario de estudio' : 'Study calendar',
        es ? 'Herramientas IA rapidas' : 'Faster AI tools',
        es ? 'Exportar a PDF' : 'Export to PDF',
      ],
    },
    {
      key: 'premium',
      name: 'Premium',
      icon: Crown,
      price: { monthly: 24, yearly: 18 },
      desc: es ? 'La experiencia completa' : 'The complete experience',
      cta: currentPlan === 'premium' ? (es ? 'Plan Actual' : 'Current Plan') : (es ? 'Obtener Premium' : 'Get Premium'),
      color: 'amber',
      popular: false,
      features: [
        es ? 'Todo lo de Pro' : 'Everything in Pro',
        es ? 'Soporte prioritario 24/7' : 'Priority support 24/7',
        es ? 'Analiticas avanzadas' : 'Advanced analytics',
        es ? 'Tutoria IA personalizada' : 'Personalized AI tutoring',
        es ? 'Funciones exclusivas beta' : 'Exclusive beta features',
        es ? 'Acceso anticipado' : 'Early access to new tools',
        es ? 'Integracion con LMS' : 'LMS integration',
        es ? 'Almacenamiento ilimitado' : 'Unlimited storage',
        es ? 'Colaboracion en equipo' : 'Team collaboration',
        es ? 'API de desarrollador' : 'Developer API access',
      ],
    },
  ];

  const trust = [
    { icon: Shield, text: es ? 'Pagos seguros con SSL' : 'Secure SSL payments' },
    { icon: Clock, text: es ? 'Cancela cuando quieras' : 'Cancel anytime' },
    { icon: Star, text: es ? 'Precios para estudiantes' : 'Student-friendly pricing' },
    { icon: HeartHandshake, text: es ? 'Garantia de 30 dias' : '30-day money-back guarantee' },
  ];

  return (
    <div className="min-h-screen bg-[#060b18]">
      <Navbar lang={lang} setLang={setLang} user={user} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-semibold mb-6">
            <Sparkles size={13} /> {es ? 'Precios simples y transparentes' : 'Simple, transparent pricing'}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            {es ? 'Elige tu plan' : 'Choose your plan'}
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            {es ? 'Desbloquea todo el potencial de StudyForge' : 'Unlock the full potential of StudyForge'}
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-sm font-medium transition-colors ${!yearly ? 'text-white' : 'text-slate-500'}`}>
              {es ? 'Mensual' : 'Monthly'}
            </span>
            <button
              onClick={() => setYearly(!yearly)}
              className={`relative w-14 h-7 rounded-full transition-all ${yearly ? 'bg-blue-600' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300 ${yearly ? 'left-[30px]' : 'left-0.5'}`} />
            </button>
            <span className={`text-sm font-medium transition-colors ${yearly ? 'text-white' : 'text-slate-500'}`}>
              {es ? 'Anual' : 'Yearly'}
            </span>
            {yearly && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 text-xs font-bold rounded-full">
                {es ? 'Ahorra 33%' : 'Save 33%'}
              </motion.span>
            )}
          </div>
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-20">
          {plans.map((plan, i) => {
            const isCurrent = currentPlan === plan.key;
            const isPopular = plan.popular;
            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl border p-6 lg:p-8 transition-all hover:scale-[1.02] hover:-translate-y-1 duration-300 ${
                  isPopular
                    ? 'bg-gradient-to-b from-blue-500/10 to-indigo-500/5 border-blue-500/30 shadow-xl shadow-blue-500/10'
                    : 'glass-light border-white/10 hover:border-white/20'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-full shadow-lg whitespace-nowrap">
                    {es ? 'Mas Popular' : 'Most Popular'} 🔥
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan.color === 'amber' ? 'bg-amber-500/20' : plan.color === 'blue' ? 'bg-blue-500/20' : 'bg-white/5'
                  }`}>
                    <plan.icon size={20} className={
                      plan.color === 'amber' ? 'text-amber-400' : plan.color === 'blue' ? 'text-blue-400' : 'text-slate-400'
                    } />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    {isCurrent && (
                      <span className="text-xs text-emerald-400 font-semibold">
                        {es ? '✓ Plan activo' : '✓ Active plan'}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-slate-400 text-sm mb-5">{plan.desc}</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">
                      ${yearly ? plan.price.yearly : plan.price.monthly}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-slate-500 text-sm">/{es ? 'mes' : 'mo'}</span>
                    )}
                  </div>
                  {yearly && plan.price.monthly > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-600 line-through">${plan.price.monthly}/{es ? 'mes' : 'mo'}</span>
                      <span className="text-xs text-emerald-400 font-semibold">
                        {es ? 'Ahorra' : 'Save'} ${(plan.price.monthly - plan.price.yearly) * 12}/{es ? 'ano' : 'yr'}
                      </span>
                    </div>
                  )}
                </div>

                {/* CTA */}
                {isCurrent ? (
                  <div className="text-center py-3 rounded-xl font-semibold text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {plan.cta}
                  </div>
                ) : plan.key === 'free' ? (
                  <Link to={user ? '/' : '/auth'} className="block text-center py-3 rounded-xl font-semibold text-sm bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all">
                    {plan.cta}
                  </Link>
                ) : (
                  <button
                    onClick={() => handleSelect(plan.key)}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                      plan.color === 'amber'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 shadow-lg shadow-amber-500/20'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20'
                    }`}
                  >
                    {plan.cta} <ArrowRight size={16} />
                  </button>
                )}

                <div className="mt-6 space-y-3">
                  {plan.features.map((f, fi) => (
                    <div key={fi} className="flex items-start gap-2.5">
                      <Check size={16} className={`shrink-0 mt-0.5 ${
                        plan.color === 'amber' ? 'text-amber-400' : plan.color === 'blue' ? 'text-blue-400' : 'text-slate-500'
                      }`} />
                      <span className="text-sm text-slate-300">{f}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl font-extrabold text-white text-center mb-8">
            {es ? 'Preguntas frecuentes' : 'Frequently asked questions'}
          </h2>
          <div className="space-y-4">
            {[
              {
                q: es ? 'Puedo cancelar en cualquier momento?' : 'Can I cancel anytime?',
                a: es ? 'Si, puedes cancelar tu suscripcion en cualquier momento. No hay contratos ni compromisos.' : 'Yes, you can cancel your subscription at any time. No contracts or commitments.',
              },
              {
                q: es ? 'Que metodos de pago aceptan?' : 'What payment methods do you accept?',
                a: es ? 'Aceptamos Visa, Mastercard, American Express y Discover. Todos los pagos son procesados de forma segura.' : 'We accept Visa, Mastercard, American Express, and Discover. All payments are processed securely.',
              },
              {
                q: es ? 'Hay una garantia de devolucion?' : 'Is there a money-back guarantee?',
                a: es ? 'Si, ofrecemos una garantia de devolucion de 30 dias. Si no estas satisfecho, te devolvemos tu dinero.' : 'Yes, we offer a 30-day money-back guarantee. If you are not satisfied, we will refund your payment.',
              },
              {
                q: es ? 'Puedo cambiar de plan?' : 'Can I switch plans?',
                a: es ? 'Si, puedes actualizar o cambiar tu plan en cualquier momento. El cambio se aplica inmediatamente.' : 'Yes, you can upgrade or switch your plan at any time. The change takes effect immediately.',
              },
            ].map((faq, i) => (
              <details key={i} className="group glass-light rounded-xl border border-white/10 overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-semibold text-white hover:text-blue-300 transition-colors">
                  {faq.q}
                  <span className="text-slate-500 group-open:rotate-45 transition-transform text-lg">+</span>
                </summary>
                <p className="px-5 pb-4 text-sm text-slate-400 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </motion.div>

        {/* Trust */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {trust.map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-slate-500 text-sm">
              <t.icon size={16} className="text-slate-600" /> {t.text}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

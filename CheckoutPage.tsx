import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Lock, Shield, Check, ChevronLeft, Zap, Crown,
  AlertCircle, Loader2, BadgeCheck, ArrowRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import supabase from '../lib/supabase';
import type { Language } from '../lib/i18n';
import type { User } from '@supabase/supabase-js';

type Step = 'payment' | 'processing' | 'success';

export default function CheckoutPage({ lang, setLang, user, authLoading }: { lang: Language; setLang: (l: Language) => void; user: User | null; authLoading: boolean }) {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const plan = params.get('plan') || 'pro';
  const cycle = params.get('cycle') || 'yearly';
  const es = lang === 'es';

  const [step, setStep] = useState<Step>('payment');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) nav('/auth?redirect=/checkout?plan=' + plan + '&cycle=' + cycle);
  }, [user, authLoading, nav, plan, cycle]);

  const prices: Record<string, Record<string, number>> = {
    pro: { monthly: 12, yearly: 8 },
    premium: { monthly: 24, yearly: 18 },
  };

  const planPrice = prices[plan] || prices.pro;
  const monthlyPrice = cycle === 'yearly' ? planPrice.yearly : planPrice.monthly;
  const totalPrice = cycle === 'yearly' ? planPrice.yearly * 12 : planPrice.monthly;
  const savings = cycle === 'yearly' ? (planPrice.monthly * 12) - (planPrice.yearly * 12) : 0;

  const planNames: Record<string, string> = { pro: 'Pro', premium: 'Premium' };
  const planIcons: Record<string, typeof Zap> = { pro: Zap, premium: Crown };
  const PlanIcon = planIcons[plan] || Zap;

  // Card formatting
  const formatCardNumber = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExp = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const detectBrand = (num: string): string => {
    const c = num.replace(/\s/g, '');
    if (/^4/.test(c)) return 'visa';
    if (/^5[1-5]/.test(c) || /^2[2-7]/.test(c)) return 'mastercard';
    if (/^3[47]/.test(c)) return 'amex';
    if (/^6(?:011|5)/.test(c)) return 'discover';
    return '';
  };

  const brand = detectBrand(cardNumber);

  const brandLogos: Record<string, string> = {
    visa: '💳 Visa',
    mastercard: '💳 Mastercard',
    amex: '💳 Amex',
    discover: '💳 Discover',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length < 13) { setError(es ? 'Numero de tarjeta invalido' : 'Invalid card number'); return; }
    if (!cardName.trim()) { setError(es ? 'Nombre requerido' : 'Name is required'); return; }
    if (!/^\d{2}\/\d{2}$/.test(cardExp)) { setError(es ? 'Formato de expiracion invalido (MM/YY)' : 'Invalid expiry format (MM/YY)'); return; }
    if (!/^\d{3,4}$/.test(cardCvc)) { setError(es ? 'CVC invalido' : 'Invalid CVC'); return; }

    setLoading(true);
    setStep('processing');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          plan,
          billing_cycle: cycle,
          card_number: cleaned,
          card_exp: cardExp,
          card_cvc: cardCvc,
          card_name: cardName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');
      // Small delay for nice animation
      await new Promise(r => setTimeout(r, 800));
      setStep('success');
    } catch (err: any) {
      setError(err.message);
      setStep('payment');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#060b18] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060b18]">
      <Navbar lang={lang} setLang={setLang} user={user} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <Link to="/pricing" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-8 transition-colors">
          <ChevronLeft size={16} /> {es ? 'Volver a precios' : 'Back to pricing'}
        </Link>

        <AnimatePresence mode="wait">
          {/* ── PAYMENT FORM ── */}
          {step === 'payment' && (
            <motion.div key="payment" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="grid lg:grid-cols-5 gap-8">
                {/* Left: Form */}
                <div className="lg:col-span-3">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
                    {es ? 'Informacion de pago' : 'Payment information'}
                  </h1>
                  <p className="text-slate-400 text-sm mb-8">
                    {es ? 'Tu pago esta protegido con encriptacion SSL de 256 bits' : 'Your payment is protected with 256-bit SSL encryption'}
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Card Number */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">
                        {es ? 'Numero de tarjeta' : 'Card number'}
                      </label>
                      <div className="relative">
                        <CreditCard size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                          placeholder="4242 4242 4242 4242"
                          maxLength={19}
                          className="w-full pl-11 pr-20 py-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all font-mono tracking-wider"
                        />
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                          {brand ? (
                            <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
                              {brandLogos[brand]}
                            </span>
                          ) : (
                            <div className="flex gap-1 opacity-30">
                              <div className="w-7 h-5 rounded bg-slate-700" />
                              <div className="w-7 h-5 rounded bg-slate-700" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">
                        {es ? 'Nombre en la tarjeta' : 'Name on card'}
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={e => setCardName(e.target.value)}
                        placeholder={es ? 'Juan Perez' : 'John Doe'}
                        className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"
                      />
                    </div>

                    {/* Exp + CVC */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                          {es ? 'Expiracion' : 'Expiry'}
                        </label>
                        <input
                          type="text"
                          value={cardExp}
                          onChange={e => setCardExp(formatExp(e.target.value))}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">CVC</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={cardCvc}
                            onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="123"
                            maxLength={4}
                            className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all font-mono"
                          />
                          <Lock size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                        </div>
                      </div>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                          <AlertCircle size={16} /> {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-[15px] shadow-lg shadow-blue-500/20"
                    >
                      <Lock size={16} />
                      {es ? `Pagar $${totalPrice}` : `Pay $${totalPrice}`}
                      {cycle === 'yearly' && <span className="text-blue-200 font-normal text-xs">/{es ? 'ano' : 'year'}</span>}
                    </button>

                    {/* Trust */}
                    <div className="flex items-center justify-center gap-4 pt-2">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs"><Shield size={13} /> SSL {es ? 'Seguro' : 'Secure'}</div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs"><Lock size={13} /> {es ? 'Encriptado' : 'Encrypted'}</div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs"><BadgeCheck size={13} /> PCI DSS</div>
                    </div>
                  </form>
                </div>

                {/* Right: Order Summary */}
                <div className="lg:col-span-2">
                  <div className="glass-light rounded-2xl border border-white/10 p-6 sticky top-24">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                      {es ? 'Resumen del pedido' : 'Order Summary'}
                    </h3>

                    <div className={`flex items-center gap-3 p-4 rounded-xl mb-5 ${
                      plan === 'premium' ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-blue-500/10 border border-blue-500/20'
                    }`}>
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                        plan === 'premium' ? 'bg-amber-500/20' : 'bg-blue-500/20'
                      }`}>
                        <PlanIcon size={22} className={plan === 'premium' ? 'text-amber-400' : 'text-blue-400'} />
                      </div>
                      <div>
                        <p className="text-white font-bold">{planNames[plan] || 'Pro'}</p>
                        <p className="text-slate-400 text-xs">
                          {cycle === 'yearly' ? (es ? 'Facturacion anual' : 'Billed annually') : (es ? 'Facturacion mensual' : 'Billed monthly')}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-5">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">{planNames[plan]} {cycle === 'yearly' ? (es ? '(anual)' : '(yearly)') : (es ? '(mensual)' : '(monthly)')}</span>
                        <span className="text-white font-medium">${monthlyPrice}/{es ? 'mes' : 'mo'}</span>
                      </div>
                      {cycle === 'yearly' && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">× 12 {es ? 'meses' : 'months'}</span>
                          <span className="text-white font-medium">${totalPrice}</span>
                        </div>
                      )}
                      {savings > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-emerald-400">{es ? 'Ahorro anual' : 'Annual savings'}</span>
                          <span className="text-emerald-400 font-semibold">-${savings}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-white/10 pt-4 flex justify-between">
                      <span className="text-white font-bold">{es ? 'Total hoy' : 'Total today'}</span>
                      <span className="text-white font-extrabold text-xl">${totalPrice}</span>
                    </div>

                    <div className="mt-5 space-y-2">
                      {[
                        es ? 'Cancela cuando quieras' : 'Cancel anytime',
                        es ? 'Sin cargos ocultos' : 'No hidden fees',
                        es ? 'Garantia de 30 dias' : '30-day money-back guarantee',
                      ].map((t, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                          <Check size={13} className="text-emerald-500 shrink-0" /> {t}
                        </div>
                      ))}
                    </div>

                    {/* Accepted cards */}
                    <div className="mt-5 pt-4 border-t border-white/10">
                      <p className="text-xs text-slate-600 mb-2">{es ? 'Aceptamos' : 'We accept'}</p>
                      <div className="flex gap-2">
                        {['Visa', 'Mastercard', 'Amex', 'Discover'].map(b => (
                          <div key={b} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] text-slate-400 font-semibold">{b}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── PROCESSING ── */}
          {step === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-32">
              <div className="relative mb-6">
                <motion.div
                  className="w-20 h-20 rounded-full border-4 border-blue-500/20 border-t-blue-500"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <CreditCard size={28} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{es ? 'Procesando pago...' : 'Processing payment...'}</h2>
              <p className="text-slate-400 text-sm">{es ? 'No cierres esta ventana' : 'Please don\'t close this window'}</p>
            </motion.div>
          )}

          {/* ── SUCCESS ── */}
          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-24">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
                  plan === 'premium' ? 'bg-amber-500/20' : 'bg-blue-500/20'
                }`}
              >
                <Check size={48} className={plan === 'premium' ? 'text-amber-400' : 'text-blue-400'} />
              </motion.div>

              <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-3xl font-extrabold text-white mb-3">
                {es ? 'Pago exitoso!' : 'Payment successful!'}
              </motion.h2>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-slate-400 text-center max-w-md mb-2">
                {es
                  ? `Tu plan ${planNames[plan]} esta activo. Disfruta de todas las funciones premium.`
                  : `Your ${planNames[plan]} plan is now active. Enjoy all premium features.`}
              </motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-slate-500 text-sm mb-8">
                {es ? 'Se envio un recibo a tu email.' : 'A receipt has been sent to your email.'}
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="flex gap-3">
                <Link to="/" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all flex items-center gap-2 text-sm shadow-lg shadow-blue-500/20">
                  {es ? 'Ir al inicio' : 'Go to dashboard'} <ArrowRight size={16} />
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, CreditCard, Shield, Clock, ChevronRight, LogOut,
  Crown, Zap, Sparkles, AlertCircle, Check, X, Calendar,
  Receipt, ArrowUpRight, ArrowDownRight, RefreshCw
} from 'lucide-react';
import Navbar from '../components/Navbar';
import supabase from '../lib/supabase';
import type { Language } from '../lib/i18n';
import type { User as SBUser } from '@supabase/supabase-js';

interface Sub {
  id: number; plan: string; billing_cycle: string; status: string;
  card_last4: string; card_brand: string; card_exp: string;
  amount_paid: number; started_at: string; expires_at: string; created_at: string;
}

export default function AccountPage({ lang, setLang, user, authLoading }: { lang: Language; setLang: (l: Language) => void; user: SBUser | null; authLoading: boolean }) {
  const nav = useNavigate();
  const es = lang === 'es';
  const [sub, setSub] = useState<Sub | null>(null);
  const [plan, setPlan] = useState('free');
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelDone, setCancelDone] = useState(false);
  const [tab, setTab] = useState<'overview' | 'billing' | 'settings'>('overview');

  useEffect(() => {
    if (!authLoading && !user) nav('/auth');
  }, [user, authLoading, nav]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch('/api/subscriptions', {
          headers: { 'Authorization': `Bearer ${session.access_token}` },
        });
        const d = await res.json();
        if (d && d.plan) { setPlan(d.plan); if (d.id) setSub(d); }
      } catch {} finally { setLoading(false); }
    };
    load();
  }, [user]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await fetch('/api/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: 'cancel' }),
      });
      setPlan('free'); setSub(null); setCancelDone(true); setShowCancel(false);
    } catch {} finally { setCancelling(false); }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    nav('/');
  };

  if (authLoading || loading) return (
    <div className="min-h-screen bg-[#060b18]"><Navbar lang={lang} setLang={setLang} user={user} />
      <div className="flex items-center justify-center py-32"><div className="w-8 h-8 border-3 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>
    </div>
  );

  if (!user) return null;

  const planIcon = plan === 'premium' ? Crown : plan === 'pro' ? Zap : Sparkles;
  const planColor = plan === 'premium' ? 'text-amber-400' : plan === 'pro' ? 'text-blue-400' : 'text-slate-400';
  const planBg = plan === 'premium' ? 'bg-amber-500/15' : plan === 'pro' ? 'bg-blue-500/15' : 'bg-white/5';
  const PIcon = planIcon;

  const tabs = [
    { key: 'overview' as const, label: es ? 'General' : 'Overview' },
    { key: 'billing' as const, label: es ? 'Facturacion' : 'Billing' },
    { key: 'settings' as const, label: es ? 'Ajustes' : 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-[#060b18]">
      <Navbar lang={lang} setLang={setLang} user={user} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">{es ? 'Mi Cuenta' : 'My Account'}</h1>
          <p className="text-slate-400 text-sm mt-1">{es ? 'Administra tu perfil, plan y facturacion' : 'Manage your profile, plan, and billing'}</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/5 rounded-xl p-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === t.key ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>{t.label}</button>
          ))}
        </div>

        {cancelDone && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
            <Check size={18} className="text-emerald-400" />
            <p className="text-emerald-300 text-sm font-medium">{es ? 'Tu suscripcion ha sido cancelada. Puedes seguir usando el plan gratuito.' : 'Your subscription has been cancelled. You can continue using the free plan.'}</p>
          </motion.div>
        )}

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* Profile card */}
            <div className="glass-light rounded-2xl border border-white/10 p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">{(user.email?.[0] || 'U').toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white truncate">{user.email}</h2>
                  <p className="text-slate-500 text-xs mt-0.5">{es ? 'Miembro desde' : 'Member since'} {new Date(user.created_at).toLocaleDateString(es ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            </div>

            {/* Current plan */}
            <div className="glass-light rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{es ? 'Plan Actual' : 'Current Plan'}</h3>
                {plan !== 'premium' && (
                  <Link to="/pricing" className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">{es ? 'Mejorar' : 'Upgrade'} <ArrowUpRight size={12} /></Link>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${planBg} flex items-center justify-center`}><PIcon size={24} className={planColor} /></div>
                <div>
                  <h4 className="text-xl font-bold text-white capitalize">{plan}</h4>
                  {sub ? (
                    <p className="text-slate-500 text-xs mt-0.5">
                      ${sub.amount_paid}/{sub.billing_cycle === 'yearly' ? (es ? 'ano' : 'year') : (es ? 'mes' : 'month')}
                      {' · '}{es ? 'Renueva' : 'Renews'} {new Date(sub.expires_at).toLocaleDateString(es ? 'es-ES' : 'en-US')}
                    </p>
                  ) : (
                    <p className="text-slate-500 text-xs mt-0.5">{es ? 'Plan gratuito activo' : 'Free plan active'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link to="/pricing" className="glass-light rounded-xl border border-white/10 p-4 hover:border-white/20 transition-all group">
                <ArrowUpRight size={18} className="text-blue-400 mb-2" />
                <p className="text-sm font-semibold text-white">{es ? 'Cambiar Plan' : 'Change Plan'}</p>
                <p className="text-xs text-slate-500 mt-0.5">{es ? 'Ver opciones' : 'View options'}</p>
              </Link>
              <button onClick={handleSignOut} className="glass-light rounded-xl border border-white/10 p-4 hover:border-red-500/30 transition-all text-left group">
                <LogOut size={18} className="text-red-400 mb-2" />
                <p className="text-sm font-semibold text-white">{es ? 'Cerrar Sesion' : 'Sign Out'}</p>
                <p className="text-xs text-slate-500 mt-0.5">{es ? 'Salir de tu cuenta' : 'Log out of account'}</p>
              </button>
            </div>
          </motion.div>
        )}

        {/* BILLING TAB */}
        {tab === 'billing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* Payment method */}
            {sub && sub.card_last4 ? (
              <div className="glass-light rounded-2xl border border-white/10 p-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">{es ? 'Metodo de Pago' : 'Payment Method'}</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center"><CreditCard size={22} className="text-slate-400" /></div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm capitalize">{sub.card_brand || 'Card'} ···· {sub.card_last4}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{es ? 'Expira' : 'Expires'} {sub.card_exp}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-light rounded-2xl border border-white/10 p-6 text-center">
                <CreditCard size={28} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">{es ? 'No hay metodo de pago registrado' : 'No payment method on file'}</p>
                <Link to="/pricing" className="text-blue-400 text-xs font-semibold hover:text-blue-300 mt-2 inline-block">{es ? 'Agregar al mejorar plan' : 'Add when upgrading plan'}</Link>
              </div>
            )}

            {/* Subscription details */}
            {sub ? (
              <div className="glass-light rounded-2xl border border-white/10 p-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">{es ? 'Detalles de Suscripcion' : 'Subscription Details'}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">{es ? 'Plan' : 'Plan'}</span>
                    <span className="text-white font-semibold text-sm capitalize">{sub.plan}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">{es ? 'Ciclo' : 'Billing Cycle'}</span>
                    <span className="text-white font-semibold text-sm capitalize">{sub.billing_cycle === 'yearly' ? (es ? 'Anual' : 'Yearly') : (es ? 'Mensual' : 'Monthly')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">{es ? 'Monto' : 'Amount'}</span>
                    <span className="text-white font-semibold text-sm">${sub.amount_paid}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">{es ? 'Estado' : 'Status'}</span>
                    <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 text-xs font-bold rounded-full">{es ? 'Activo' : 'Active'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">{es ? 'Inicio' : 'Started'}</span>
                    <span className="text-white text-sm">{new Date(sub.started_at).toLocaleDateString(es ? 'es-ES' : 'en-US')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">{es ? 'Proxima renovacion' : 'Next renewal'}</span>
                    <span className="text-white text-sm">{new Date(sub.expires_at).toLocaleDateString(es ? 'es-ES' : 'en-US')}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex gap-3">
                  <Link to={`/checkout?plan=${plan === 'pro' ? 'premium' : 'pro'}&cycle=${sub.billing_cycle}`} className="flex-1 py-2.5 text-center bg-blue-600/15 text-blue-400 text-sm font-semibold rounded-xl hover:bg-blue-600/25 transition-all">
                    {plan === 'pro' ? (es ? 'Mejorar a Premium' : 'Upgrade to Premium') : (es ? 'Cambiar a Pro' : 'Switch to Pro')}
                  </Link>
                  <button onClick={() => setShowCancel(true)} className="flex-1 py-2.5 text-center bg-red-500/10 text-red-400 text-sm font-semibold rounded-xl hover:bg-red-500/20 transition-all">
                    {es ? 'Cancelar Plan' : 'Cancel Plan'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-light rounded-2xl border border-white/10 p-6 text-center">
                <Receipt size={28} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm mb-3">{es ? 'Estas en el plan gratuito' : 'You are on the free plan'}</p>
                <Link to="/pricing" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all">
                  <Zap size={15} /> {es ? 'Mejorar Plan' : 'Upgrade Plan'}
                </Link>
              </div>
            )}

            {/* Invoice history placeholder */}
            <div className="glass-light rounded-2xl border border-white/10 p-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">{es ? 'Historial de Pagos' : 'Payment History'}</h3>
              {sub ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/3 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Receipt size={16} className="text-slate-500" />
                      <div>
                        <p className="text-white text-sm font-medium capitalize">{sub.plan} Plan — {sub.billing_cycle === 'yearly' ? (es ? 'Anual' : 'Annual') : (es ? 'Mensual' : 'Monthly')}</p>
                        <p className="text-slate-500 text-xs">{new Date(sub.started_at).toLocaleDateString(es ? 'es-ES' : 'en-US')}</p>
                      </div>
                    </div>
                    <span className="text-white font-semibold text-sm">${sub.amount_paid}</span>
                  </div>
                </div>
              ) : (
                <p className="text-slate-600 text-sm text-center py-4">{es ? 'Sin pagos registrados' : 'No payment history'}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* SETTINGS TAB */}
        {tab === 'settings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div className="glass-light rounded-2xl border border-white/10 p-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">{es ? 'Informacion de la Cuenta' : 'Account Information'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500 font-medium">{es ? 'Correo Electronico' : 'Email Address'}</label>
                  <div className="mt-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm">{user.email}</div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium">{es ? 'ID de Usuario' : 'User ID'}</label>
                  <div className="mt-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-500 text-xs font-mono">{user.id}</div>
                </div>
              </div>
            </div>

            <div className="glass-light rounded-2xl border border-white/10 p-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">{es ? 'Idioma' : 'Language'}</h3>
              <div className="flex gap-2">
                <button onClick={() => setLang('en')} className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${lang === 'en' ? 'bg-blue-600/15 text-blue-400 border border-blue-500/25' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}>English</button>
                <button onClick={() => setLang('es')} className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${lang === 'es' ? 'bg-blue-600/15 text-blue-400 border border-blue-500/25' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}>Espanol</button>
              </div>
            </div>

            <div className="glass-light rounded-2xl border border-red-500/10 p-6">
              <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-2">{es ? 'Zona de Peligro' : 'Danger Zone'}</h3>
              <p className="text-slate-500 text-xs mb-4">{es ? 'Estas acciones son permanentes e irreversibles.' : 'These actions are permanent and irreversible.'}</p>
              <button onClick={handleSignOut} className="px-5 py-2.5 bg-red-500/10 text-red-400 text-sm font-semibold rounded-xl hover:bg-red-500/20 transition-all flex items-center gap-2">
                <LogOut size={15} /> {es ? 'Cerrar Sesion' : 'Sign Out'}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Cancel confirmation modal */}
      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md glass-light rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center"><AlertCircle size={20} className="text-red-400" /></div>
              <h3 className="text-lg font-bold text-white">{es ? 'Cancelar Suscripcion?' : 'Cancel Subscription?'}</h3>
            </div>
            <p className="text-slate-400 text-sm mb-6">{es ? 'Perderas acceso a las funciones premium al final del periodo de facturacion actual. Puedes reactivar en cualquier momento.' : 'You will lose access to premium features at the end of your current billing period. You can reactivate anytime.'}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancel(false)} className="flex-1 py-2.5 bg-white/5 text-white text-sm font-semibold rounded-xl hover:bg-white/10 transition-all">{es ? 'Mantener Plan' : 'Keep Plan'}</button>
              <button onClick={handleCancel} disabled={cancelling} className="flex-1 py-2.5 bg-red-500/15 text-red-400 text-sm font-semibold rounded-xl hover:bg-red-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {cancelling ? <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" /> : <X size={15} />}
                {cancelling ? '...' : (es ? 'Si, Cancelar' : 'Yes, Cancel')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

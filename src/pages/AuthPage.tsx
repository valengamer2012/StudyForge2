import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import supabase from '../lib/supabase';
import { signInWithGoogle } from '../lib/googleAuth';
import Navbar from '../components/Navbar';
import type { Language } from '../lib/i18n';
import type { User } from '@supabase/supabase-js';

export default function AuthPage({ lang, setLang, user }: { lang: Language; setLang: (l: Language) => void; user: User | null; authLoading: boolean }) {
  const nav = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) nav('/'); }, [user, nav]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const { error: err } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#060b18]">
      <Navbar lang={lang} setLang={setLang} user={user ?? null} />
      <div className="flex items-center justify-center px-4 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4"><GraduationCap size={32} className="text-white" /></div>
            <h1 className="text-3xl font-extrabold text-white">{isSignUp ? (lang === 'es' ? 'Crear Cuenta' : 'Create Account') : (lang === 'es' ? 'Bienvenido' : 'Welcome Back')}</h1>
            <p className="text-slate-400 mt-2 text-sm">{isSignUp ? (lang === 'es' ? 'Comienza a estudiar mas inteligente' : 'Start studying smarter today') : (lang === 'es' ? 'Inicia sesion para continuar' : 'Sign in to continue learning')}</p>
          </div>
          <div className="glass-light rounded-2xl border border-white/10 p-6 space-y-5">
            <button onClick={() => signInWithGoogle('StudyForge')} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-xl transition-all text-sm">
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              {lang === 'es' ? 'Continuar con Google' : 'Continue with Google'}
            </button>
            <div className="flex items-center gap-3"><div className="flex-1 h-px bg-white/10"/><span className="text-xs text-slate-500">{lang === 'es' ? 'o con email' : 'or with email'}</span><div className="flex-1 h-px bg-white/10"/></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative"><Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" /><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20" /></div>
              <div className="relative"><Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" /><input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={lang === 'es' ? 'Contrasena' : 'Password'} required minLength={6} className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20" /><button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">{showPw ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 text-sm">{loading ? '...' : isSignUp ? (lang === 'es' ? 'Registrarse' : 'Sign Up') : (lang === 'es' ? 'Iniciar Sesion' : 'Sign In')}</button>
            </form>
            <p className="text-center text-sm text-slate-500">{isSignUp ? (lang === 'es' ? 'Ya tienes cuenta?' : 'Already have an account?') : (lang === 'es' ? 'No tienes cuenta?' : "Don't have an account?")} <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="text-blue-400 hover:text-blue-300 font-medium">{isSignUp ? (lang === 'es' ? 'Inicia sesion' : 'Sign in') : (lang === 'es' ? 'Registrate' : 'Sign up')}</button></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, User, LogOut, Menu, X, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import supabase from '../lib/supabase';
import LanguageToggle from './LanguageToggle';
import type { Language } from '../lib/i18n';
import type { User as SBUser } from '@supabase/supabase-js';

export default function Navbar({ lang, setLang, user }: { lang: Language; setLang: (l: Language) => void; user: SBUser | null }) {
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const es = lang === 'es';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const links = [
    { to: '/', label: es ? 'Inicio' : 'Home' },
    { to: '/grader', label: es ? 'Calificador' : 'Paper Grader' },
    { to: '/solver', label: es ? 'Resolver' : 'Solver' },
    { to: '/pricing', label: es ? 'Precios' : 'Pricing' },
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className="text-lg font-extrabold text-white tracking-tight">StudyForge</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link key={l.to} to={l.to} className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${loc.pathname === l.to ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>{l.label}</Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <LanguageToggle lang={lang} setLang={setLang} />
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenu(!userMenu)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold hover:ring-2 hover:ring-blue-400/30 transition-all"
              >
                {(user.email?.[0] || 'U').toUpperCase()}
              </button>
              {userMenu && (
                <div className="absolute right-0 top-12 w-56 glass rounded-xl border border-white/10 shadow-2xl shadow-black/40 py-2 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2.5 border-b border-white/5">
                    <p className="text-white text-sm font-semibold truncate">{user.email}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{es ? 'Cuenta activa' : 'Active account'}</p>
                  </div>
                  <Link to="/account" onClick={() => setUserMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-all">
                    <Settings size={15} className="text-slate-500" />
                    {es ? 'Mi Cuenta' : 'My Account'}
                  </Link>
                  <Link to="/pricing" onClick={() => setUserMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-all">
                    <User size={15} className="text-slate-500" />
                    {es ? 'Plan y Facturacion' : 'Plan & Billing'}
                  </Link>
                  <div className="border-t border-white/5 mt-1 pt-1">
                    <button onClick={() => { supabase.auth.signOut(); setUserMenu(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all">
                      <LogOut size={15} />
                      {es ? 'Cerrar Sesion' : 'Sign Out'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-all">{es ? 'Iniciar Sesion' : 'Sign In'}</Link>
          )}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-slate-400">{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-white/5 px-4 py-3 space-y-1">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${loc.pathname === l.to ? 'bg-white/10 text-white' : 'text-slate-400'}`}>{l.label}</Link>
          ))}
          {user && (
            <Link to="/account" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white">
              {es ? 'Mi Cuenta' : 'My Account'}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

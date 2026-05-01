import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, FileCheck, Calculator, MessageCircle, Globe, Zap } from 'lucide-react';
import { Language, t } from '../lib/i18n';

const navItems = [
  { path: '/', icon: LayoutDashboard, labelEn: 'Dashboard', labelEs: 'Inicio' },
  { path: '/grader', icon: FileCheck, labelEn: 'Paper Grader', labelEs: 'Calificador' },
  { path: '/solver', icon: Calculator, labelEn: 'Problem Solver', labelEs: 'Resolver' },
  { path: '/chat', icon: MessageCircle, labelEn: 'Chat with Notes', labelEs: 'Chat con Notas' },
];

export default function Shell({ children, lang, setLang }: { children: ReactNode; lang: Language; setLang: (l: Language) => void }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = (p: string) => p === '/' ? pathname === '/' : pathname.startsWith(p);

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-[240px] border-r border-border bg-surface-card shrink-0 sticky top-0 h-screen">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-lg font-extrabold text-text-primary tracking-tight">StudyForge</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(n => (
            <button
              key={n.path}
              onClick={() => navigate(n.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive(n.path)
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
              }`}
            >
              <n.icon size={19} className={isActive(n.path) ? 'text-brand-600' : 'text-text-muted'} />
              {lang === 'es' ? n.labelEs : n.labelEn}
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center gap-2 bg-surface-2 rounded-lg p-1">
            <button onClick={() => setLang('en')} className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-all ${lang === 'en' ? 'bg-white text-brand-700 shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}>EN</button>
            <button onClick={() => setLang('es')} className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-all ${lang === 'es' ? 'bg-white text-brand-700 shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}>ES</button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar — mobile */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-surface-card border-b border-border sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-base font-extrabold">StudyForge</span>
          </div>
          <div className="flex items-center gap-1 bg-surface-2 rounded-lg p-0.5">
            <button onClick={() => setLang('en')} className={`text-xs font-semibold px-2 py-1 rounded-md ${lang === 'en' ? 'bg-white text-brand-700 shadow-sm' : 'text-text-muted'}`}>EN</button>
            <button onClick={() => setLang('es')} className={`text-xs font-semibold px-2 py-1 rounded-md ${lang === 'es' ? 'bg-white text-brand-700 shadow-sm' : 'text-text-muted'}`}>ES</button>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        {/* Bottom nav — mobile */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface-card border-t border-border flex items-center justify-around py-2 z-30">
          {navItems.map(n => (
            <button key={n.path} onClick={() => navigate(n.path)} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all ${isActive(n.path) ? 'text-brand-600' : 'text-text-muted'}`}>
              <n.icon size={20} />
              <span className="text-[10px] font-semibold">{lang === 'es' ? n.labelEs.split(' ')[0] : n.labelEn.split(' ')[0]}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import supabase from './lib/supabase';
import { handleGoogleRedirect } from './lib/googleAuth';
import { Language } from './lib/i18n';
import HomePage from './pages/HomePage';
import StudyPage from './pages/StudyPage';
import AuthPage from './pages/AuthPage';
import PricingPage from './pages/PricingPage';
import CheckoutPage from './pages/CheckoutPage';
import GraderPage from './pages/GraderPage';
import SolverPage from './pages/SolverPage';
import AccountPage from './pages/AccountPage';
import GradeResultPage from './pages/GradeResultPage';
import SolveResultPage from './pages/SolveResultPage';
import type { User } from '@supabase/supabase-js';

handleGoogleRedirect();

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const shared = { lang, setLang, user, authLoading };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage {...shared} />} />
        <Route path="/study/:id" element={<StudyPage lang={lang} setLang={setLang} />} />
        <Route path="/auth" element={<AuthPage {...shared} />} />
        <Route path="/pricing" element={<PricingPage {...shared} />} />
        <Route path="/checkout" element={<CheckoutPage {...shared} />} />
        <Route path="/grader" element={<GraderPage {...shared} />} />
        <Route path="/solver" element={<SolverPage {...shared} />} />
        <Route path="/account" element={<AccountPage {...shared} />} />
        <Route path="/grade/:id" element={<GradeResultPage lang={lang} setLang={setLang} />} />
        <Route path="/solve/:id" element={<SolveResultPage lang={lang} setLang={setLang} />} />
      </Routes>
    </BrowserRouter>
  );
}

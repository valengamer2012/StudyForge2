import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Brain, Target, BookOpen, Lightbulb, GraduationCap } from 'lucide-react';
import FlashcardViewer from '../components/FlashcardViewer';
import QuizViewer from '../components/QuizViewer';
import FillBlanksViewer from '../components/FillBlanksViewer';
import KeyConceptsViewer from '../components/KeyConceptsViewer';
import ReviewViewer from '../components/ReviewViewer';
import Navbar from '../components/Navbar';
import { Language, t } from '../lib/i18n';

interface StudySet {
  id: number; topic: string; language: string;
  flashcards: { front: string; back: string }[];
  quizzes: { question: string; options: string[]; answer: number }[];
  fill_blanks: { sentence: string; answer: string }[];
  key_concepts: string[];
  study_notes: { title: string; content: string }[];
  created_at: string;
}

type Tab = 'review' | 'flashcards' | 'quiz' | 'fill' | 'concepts';

export default function StudyPage({ lang, setLang }: { lang: Language; setLang: (l: Language) => void }) {
  const { id } = useParams();
  const nav = useNavigate();
  const [set, setSet] = useState<StudySet | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('review');

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/study-sets?id=${id}`);
        const d = await r.json();
        setSet(d);
        if (!d.study_notes || d.study_notes.length === 0) setActiveTab('flashcards');
      } catch {} finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#060b18]">
      <Navbar lang={lang} setLang={setLang} user={null} />
      <div className="flex items-center justify-center py-32"><div className="w-8 h-8 border-3 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"/></div>
    </div>
  );

  if (!set) return (
    <div className="min-h-screen bg-[#060b18]">
      <Navbar lang={lang} setLang={setLang} user={null} />
      <div className="text-center py-32 text-white">
        <p className="text-xl mb-4">Study set not found</p>
        <button onClick={() => nav('/')} className="text-blue-400 hover:underline text-sm">{t(lang, 'back')}</button>
      </div>
    </div>
  );

  const hasNotes = set.study_notes && set.study_notes.length > 0;
  const tabs: { key: Tab; label: string; icon: typeof Brain; count: number }[] = [
    ...(hasNotes ? [{ key: 'review' as Tab, label: t(lang, 'review'), icon: GraduationCap, count: set.study_notes.length }] : []),
    { key: 'flashcards', label: t(lang, 'flashcards'), icon: Brain, count: set.flashcards?.length || 0 },
    { key: 'quiz', label: t(lang, 'quiz'), icon: Target, count: set.quizzes?.length || 0 },
    { key: 'fill', label: t(lang, 'fillBlanks'), icon: BookOpen, count: set.fill_blanks?.length || 0 },
    { key: 'concepts', label: t(lang, 'keyConcepts'), icon: Lightbulb, count: set.key_concepts?.length || 0 },
  ];

  return (
    <div className="min-h-screen bg-[#060b18]">
      <Navbar lang={lang} setLang={setLang} user={null} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => nav('/')} className="flex items-center gap-1 text-sm text-slate-400 hover:text-blue-400 mb-5 font-medium transition-colors">
          <ArrowLeft size={16} />{t(lang, 'back')}
        </button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{t(lang, 'studySet')}</p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1">{set.topic}</h1>
        </motion.div>

        <div className="flex gap-2 overflow-x-auto mt-6 mb-8 scrollbar-hide">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? tab.key === 'review'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                : 'glass-light text-slate-400 hover:text-white border border-white/10'
            }`}>
              <tab.icon size={16} />{tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-md ${activeTab === tab.key ? 'bg-white/20' : 'bg-white/5'}`}>{tab.count}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}>
            {activeTab === 'review' && hasNotes && <ReviewViewer notes={set.study_notes} lang={lang} />}
            {activeTab === 'flashcards' && set.flashcards?.length > 0 && <FlashcardViewer cards={set.flashcards} lang={lang} />}
            {activeTab === 'quiz' && set.quizzes?.length > 0 && <QuizViewer quizzes={set.quizzes} lang={lang} />}
            {activeTab === 'fill' && set.fill_blanks?.length > 0 && <FillBlanksViewer items={set.fill_blanks} lang={lang} />}
            {activeTab === 'concepts' && set.key_concepts?.length > 0 && <KeyConceptsViewer concepts={set.key_concepts} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

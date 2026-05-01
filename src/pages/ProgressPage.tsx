import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Flame, Trophy, Calendar } from 'lucide-react';
import StreakBanner from '../components/StreakBanner';
import XpBar from '../components/XpBar';
import StudyCalendar from '../components/StudyCalendar';
import BadgeGrid from '../components/BadgeGrid';
import Leaderboard from '../components/Leaderboard';
import { Language } from '../lib/i18n';

interface Props { lang: Language; setLang: (l: Language) => void; }

export default function ProgressPage({ lang }: Props) {
  const [progress, setProgress] = useState<any>(null);
  const [calendar, setCalendar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = 'anonymous';

  useEffect(() => {
    Promise.all([
      fetch(`/api/progress?user_id=${userId}`).then(r => r.json()),
      fetch(`/api/activity?user_id=${userId}&days=90`).then(r => r.json()),
    ]).then(([prog, act]) => {
      setProgress(prog);
      setCalendar(act.calendar || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <BarChart3 size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-text">{lang === 'es' ? 'Tu Progreso' : 'Your Progress'}</h1>
              <p className="text-sm text-text-3">{lang === 'es' ? 'Racha, logros, calendario y clasificacion' : 'Streaks, achievements, calendar & rankings'}</p>
            </div>
          </div>
        </motion.div>

        {progress && (
          <div className="space-y-6">
            {/* Streak + XP */}
            <div className="grid md:grid-cols-2 gap-4">
              <StreakBanner streak={progress.current_streak || 0} longestStreak={progress.longest_streak || 0} lang={lang} />
              <XpBar xp={progress.xp || 0} level={progress.level || 1} xpInLevel={progress.xp_in_level || 0} xpForNext={progress.xp_for_next || 100} lang={lang} />
            </div>

            {/* Calendar + Leaderboard */}
            <div className="grid md:grid-cols-2 gap-4">
              <StudyCalendar data={calendar} lang={lang} />
              <Leaderboard currentUserId={userId} lang={lang} />
            </div>

            {/* Badges */}
            <div>
              <h2 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
                <Trophy size={18} className="text-amber-500" />
                {lang === 'es' ? 'Insignias' : 'Badges'}
              </h2>
              <BadgeGrid badges={progress.badges || []} lang={lang} />
            </div>

            {/* Lifetime Stats */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 className="font-bold text-text mb-4">{lang === 'es' ? 'Estadisticas de por Vida' : 'Lifetime Stats'}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: lang === 'es' ? 'Sesiones totales' : 'Total sessions', value: progress.total_sessions || 0 },
                  { label: lang === 'es' ? 'Cuestionarios' : 'Quizzes taken', value: progress.total_quizzes || 0 },
                  { label: lang === 'es' ? 'Tarjetas revisadas' : 'Flashcards reviewed', value: progress.total_flashcards || 0 },
                  { label: lang === 'es' ? 'Mejor racha' : 'Best streak', value: `${progress.longest_streak || 0} ${lang === 'es' ? 'dias' : 'days'}` },
                ].map(s => (
                  <div key={s.label} className="text-center p-4 bg-surface rounded-xl">
                    <p className="text-2xl font-black text-text">{s.value}</p>
                    <p className="text-xs text-text-4 font-semibold mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

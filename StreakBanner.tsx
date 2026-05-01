import { motion } from 'framer-motion';
import { Flame, Trophy, Star } from 'lucide-react';
import { getStreakMessage } from '../lib/gamification';
import { Language } from '../lib/i18n';

interface Props {
  streak: number;
  longestStreak: number;
  lang: Language;
}

export default function StreakBanner({ streak, longestStreak, lang }: Props) {
  const msg = getStreakMessage(streak, lang);
  const flames = Math.min(streak, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 p-5 text-white"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex">
            {Array.from({ length: flames }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1, type: 'spring' }}
                className="-ml-1 first:ml-0"
              >
                <Flame size={28} className="text-white drop-shadow-lg animate-streak" style={{ animationDelay: `${i * 0.2}s` }} />
              </motion.div>
            ))}
          </div>
          <div>
            <p className="text-xl font-extrabold">{msg}</p>
            <p className="text-white/80 text-sm mt-0.5">
              {lang === 'es' ? 'Mejor racha' : 'Best streak'}: {longestStreak} {lang === 'es' ? 'dias' : 'days'}
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
          <span className="text-3xl font-black">{streak}</span>
          <Flame size={20} />
        </div>
      </div>

      {/* Milestones */}
      {streak > 0 && (
        <div className="relative flex items-center gap-2 mt-4 pt-3 border-t border-white/20">
          {[3, 7, 14, 30].map(m => (
            <div
              key={m}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                streak >= m ? 'bg-white/30 text-white' : 'bg-white/10 text-white/50'
              }`}
            >
              {streak >= m ? <Star size={12} className="fill-current" /> : <Star size={12} />}
              {m}d
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

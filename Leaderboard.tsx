import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Flame, ChevronUp } from 'lucide-react';
import { Language } from '../lib/i18n';

interface Entry { id: number; user_id: string; display_name: string; xp: number; level: number; streak: number; avatar_color: string; }
interface Props { currentUserId: string; lang: Language; }

export default function Leaderboard({ currentUserId, lang }: Props) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard').then(r => r.json()).then(d => { setEntries(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="bg-white rounded-2xl border border-border p-8 animate-pulse h-40" />;

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <Crown size={18} className="text-amber-500" />
        <h3 className="font-bold text-text">{lang === 'es' ? 'Clasificacion' : 'Leaderboard'}</h3>
      </div>
      <div className="divide-y divide-border">
        {entries.slice(0, 10).map((e, i) => {
          const isYou = e.user_id === currentUserId;
          return (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 px-5 py-3 ${isYou ? 'bg-primary/5' : 'hover:bg-surface'}`}
            >
              <span className={`w-7 text-center font-black text-sm ${
                i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-orange-600' : 'text-text-4'
              }`}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: e.avatar_color }}>
                {e.display_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isYou ? 'text-primary' : 'text-text'}`}>
                  {e.display_name} {isYou && '(You)'}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-text-4">
                  <span>Lv.{e.level}</span>
                  {e.streak > 0 && <span className="flex items-center gap-0.5"><Flame size={10} className="text-orange-500" />{e.streak}</span>}
                </div>
              </div>
              <span className="text-sm font-bold text-xp">{e.xp.toLocaleString()} XP</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

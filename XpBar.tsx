import { motion } from 'framer-motion';
import { getLevelInfo } from '../lib/gamification';
import { Language } from '../lib/i18n';

interface Props {
  xp: number;
  level: number;
  xpInLevel: number;
  xpForNext: number;
  lang: Language;
}

export default function XpBar({ xp, level, xpInLevel, xpForNext, lang }: Props) {
  const info = getLevelInfo(level);
  const nextInfo = getLevelInfo(level + 1);
  const pct = xpForNext > 0 ? Math.min((xpInLevel / xpForNext) * 100, 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-lg"
            style={{ background: `linear-gradient(135deg, ${info.color}, ${info.color}dd)` }}
          >
            {level}
          </div>
          <div>
            <p className="font-bold text-text">{lang === 'es' ? info.titleEs : info.title}</p>
            <p className="text-xs text-text-4">{xp.toLocaleString()} XP {lang === 'es' ? 'total' : 'total'}</p>
          </div>
        </div>
        {nextInfo && (
          <div className="text-right">
            <p className="text-xs text-text-4">{lang === 'es' ? 'Siguiente' : 'Next'}</p>
            <p className="text-sm font-bold" style={{ color: nextInfo.color }}>
              {lang === 'es' ? nextInfo.titleEs : nextInfo.title}
            </p>
          </div>
        )}
      </div>
      <div className="relative h-3 bg-surface-2 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: `linear-gradient(90deg, ${info.color}, ${info.color}cc)` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <p className="text-xs text-text-4 mt-2 text-right">
        {xpInLevel} / {xpForNext} XP
      </p>
    </div>
  );
}

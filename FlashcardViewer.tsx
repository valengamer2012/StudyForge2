import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Language, t } from '../lib/i18n';

interface Props { cards: { front: string; back: string }[]; lang: Language; }

export default function FlashcardViewer({ cards, lang }: Props) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = cards[index];

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-sm font-medium text-slate-500">{index + 1} {t(lang, 'of')} {cards.length}</div>
      <div className="relative w-full max-w-lg cursor-pointer" style={{ perspective: '1000px' }} onClick={() => setFlipped(!flipped)}>
        <motion.div className="relative w-full min-h-[240px]" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.5, ease: 'easeInOut' }} style={{ transformStyle: 'preserve-3d' }}>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 flex flex-col items-center justify-center text-center shadow-xl" style={{ backfaceVisibility: 'hidden' }}>
            <p className="text-white text-lg font-semibold leading-relaxed">{card.front}</p>
            <p className="text-blue-200/60 text-xs mt-4 flex items-center gap-1"><RotateCcw size={12} />{t(lang, 'clickToFlip')}</p>
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-8 flex flex-col items-center justify-center text-center shadow-xl" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <p className="text-white text-base leading-relaxed">{card.back}</p>
            <p className="text-emerald-100/60 text-xs mt-4 flex items-center gap-1"><RotateCcw size={12} />{t(lang, 'clickToFlip')}</p>
          </div>
        </motion.div>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => { setIndex(Math.max(0, index - 1)); setFlipped(false); }} disabled={index === 0} className="p-3 rounded-xl glass-light border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 transition-all"><ChevronLeft size={20} /></button>
        <div className="flex gap-1.5">{cards.map((_, i) => (<div key={i} className={`w-2 h-2 rounded-full transition-all ${i === index ? 'bg-blue-400 scale-125' : 'bg-slate-700'}`} />))}</div>
        <button onClick={() => { setIndex(Math.min(cards.length - 1, index + 1)); setFlipped(false); }} disabled={index === cards.length - 1} className="p-3 rounded-xl glass-light border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 transition-all"><ChevronRight size={20} /></button>
      </div>
    </div>
  );
}

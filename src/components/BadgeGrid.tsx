import { motion } from 'framer-motion';
import { Flame, Shield, Zap, Crown, Footprints, BookOpen, GraduationCap, Target, Award, Layers, Brain, Star, Sparkles, Trophy } from 'lucide-react';

const iconMap: Record<string, any> = {
  flame: Flame, shield: Shield, zap: Zap, crown: Crown, footprints: Footprints,
  book: BookOpen, graduation: GraduationCap, target: Target, award: Award,
  layers: Layers, brain: Brain, star: Star, sparkles: Sparkles, trophy: Trophy,
};

interface Badge { id: string; name: string; icon: string; desc: string; }
interface Props { badges: Badge[]; lang: 'en' | 'es'; }

export default function BadgeGrid({ badges, lang }: Props) {
  if (!badges.length) return (
    <div className="bg-white rounded-2xl border border-border p-6 text-center">
      <Trophy size={32} className="mx-auto text-text-4 mb-2" />
      <p className="text-sm text-text-4">{lang === 'es' ? 'Completa actividades para ganar insignias!' : 'Complete activities to earn badges!'}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
      {badges.map((b, i) => {
        const Icon = iconMap[b.icon] || Star;
        return (
          <motion.div
            key={b.id}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 200 }}
            className="bg-white rounded-2xl border border-border p-3 flex flex-col items-center gap-1.5 hover:shadow-md hover:border-primary/30 transition-all group cursor-default"
            title={b.desc}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Icon size={20} className="text-primary" />
            </div>
            <p className="text-[10px] font-bold text-text-2 text-center leading-tight">{b.name}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

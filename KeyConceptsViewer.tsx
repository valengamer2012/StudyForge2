import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

export default function KeyConceptsViewer({ concepts }: { concepts: string[] }) {
  return (
    <div className="grid gap-3">
      {concepts.map((c, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-4 p-4 glass-light rounded-xl border border-white/10 hover:border-blue-500/30 transition-all group">
          <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0 group-hover:bg-amber-500/25 transition-all"><Lightbulb size={20} className="text-amber-400" /></div>
          <span className="text-white font-medium text-sm">{c}</span>
          <span className="ml-auto text-slate-700 text-xs font-mono">#{i + 1}</span>
        </motion.div>
      ))}
    </div>
  );
}

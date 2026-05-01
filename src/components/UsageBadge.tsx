import { Zap, Crown, Lock } from 'lucide-react';
import { type Plan } from '../lib/useSubscription';

interface Props {
  plan: Plan;
  feature: string;
  remaining: number;
  limit: number;
  lang: 'en' | 'es';
  onUpgrade: () => void;
}

export default function UsageBadge({ plan, feature, remaining, limit, lang, onUpgrade }: Props) {
  const es = lang === 'es';
  const isPaid = plan === 'pro' || plan === 'premium';

  if (isPaid) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
        {plan === 'premium' ? <Crown size={13} className="text-amber-400" /> : <Zap size={13} className="text-blue-400" />}
        <span className="text-xs font-semibold text-blue-300 capitalize">{plan}</span>
        <span className="text-xs text-blue-400/60">•</span>
        <span className="text-xs text-blue-400/80">{es ? 'Ilimitado' : 'Unlimited'}</span>
      </div>
    );
  }

  const pct = limit > 0 ? ((limit - remaining) / limit) * 100 : 100;
  const isLow = remaining <= 1;
  const isOut = remaining <= 0;

  return (
    <button
      onClick={isOut ? onUpgrade : undefined}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
        isOut
          ? 'bg-red-500/10 border-red-500/20 cursor-pointer hover:bg-red-500/15'
          : isLow
          ? 'bg-amber-500/10 border-amber-500/20'
          : 'bg-white/5 border-white/10'
      }`}
    >
      {isOut ? (
        <Lock size={12} className="text-red-400" />
      ) : (
        <div className="w-4 h-4 rounded-full border-2 border-slate-700 relative overflow-hidden">
          <div
            className={`absolute bottom-0 left-0 right-0 transition-all ${
              isLow ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ height: `${pct}%` }}
          />
        </div>
      )}
      <span className={`text-xs font-semibold ${
        isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-slate-400'
      }`}>
        {isOut
          ? (es ? 'Limite alcanzado' : 'Limit reached')
          : `${remaining}/${limit} ${es ? 'restantes' : 'left'}`}
      </span>
      {isOut && (
        <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
          {es ? 'MEJORAR' : 'UPGRADE'}
        </span>
      )}
    </button>
  );
}

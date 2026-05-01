import { useState, useEffect, useCallback } from 'react';
import supabase from './supabase';
import type { User } from '@supabase/supabase-js';

export type Plan = 'free' | 'pro' | 'premium';

export interface UsageLimits {
  study_sets: number;
  paper_grades: number;
  problem_solves: number;
}

const FREE_LIMITS: UsageLimits = {
  study_sets: 5,
  paper_grades: 2,
  problem_solves: 3,
};

const PRO_LIMITS: UsageLimits = {
  study_sets: 999,
  paper_grades: 999,
  problem_solves: 999,
};

const PREMIUM_LIMITS: UsageLimits = {
  study_sets: 999,
  paper_grades: 999,
  problem_solves: 999,
};

export function getLimits(plan: Plan): UsageLimits {
  if (plan === 'premium') return PREMIUM_LIMITS;
  if (plan === 'pro') return PRO_LIMITS;
  return FREE_LIMITS;
}

export const EXTERNAL_PAYMENT_URL = 'https://buy.stripe.com/test_studyforge_pro';

export function getUpgradeUrl(plan: string = 'pro', cycle: string = 'yearly'): string {
  return `${EXTERNAL_PAYMENT_URL}?plan=${plan}&cycle=${cycle}`;
}

export function useSubscription(user: User | null) {
  const [plan, setPlan] = useState<Plan>('free');
  const [usage, setUsage] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    if (!user) { setPlan('free'); setUsage({}); setLoading(false); return; }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      const res = await fetch('/api/usage', {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (data.plan) setPlan(data.plan as Plan);
      if (data.usage) setUsage(data.usage);
    } catch (e) {
      console.error('Usage fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchUsage(); }, [fetchUsage]);

  const trackUsage = async (feature: string): Promise<boolean> => {
    if (!user) return false;
    const limits = getLimits(plan);
    const current = usage[feature] || 0;
    const limit = (limits as any)[feature] ?? 999;
    if (current >= limit) return false;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;
      await fetch('/api/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ feature }),
      });
      setUsage(prev => ({ ...prev, [feature]: (prev[feature] || 0) + 1 }));
      return true;
    } catch {
      return false;
    }
  };

  const canUse = (feature: string): boolean => {
    if (plan === 'pro' || plan === 'premium') return true;
    const limits = getLimits(plan);
    const current = usage[feature] || 0;
    const limit = (limits as any)[feature] ?? 999;
    return current < limit;
  };

  const getRemaining = (feature: string): number => {
    if (plan === 'pro' || plan === 'premium') return 999;
    const limits = getLimits(plan);
    const current = usage[feature] || 0;
    const limit = (limits as any)[feature] ?? 999;
    return Math.max(0, limit - current);
  };

  const getLimit = (feature: string): number => {
    const limits = getLimits(plan);
    return (limits as any)[feature] ?? 999;
  };

  return { plan, usage, loading, trackUsage, canUse, getRemaining, getLimit, refetch: fetchUsage };
}

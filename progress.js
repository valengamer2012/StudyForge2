import supabase from './_supabase.js';

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function calcLevel(xp) {
  // Each level needs more XP: level N needs N*100 XP
  let level = 1;
  let xpNeeded = 0;
  while (xpNeeded + level * 100 <= xp) {
    xpNeeded += level * 100;
    level++;
  }
  return level;
}

function checkBadges(progress) {
  const badges = [];
  if (progress.current_streak >= 3) badges.push({ id: 'streak3', name: 'On Fire', icon: 'flame', desc: '3-day streak' });
  if (progress.current_streak >= 7) badges.push({ id: 'streak7', name: 'Week Warrior', icon: 'shield', desc: '7-day streak' });
  if (progress.current_streak >= 14) badges.push({ id: 'streak14', name: 'Unstoppable', icon: 'zap', desc: '14-day streak' });
  if (progress.current_streak >= 30) badges.push({ id: 'streak30', name: 'Legend', icon: 'crown', desc: '30-day streak' });
  if (progress.total_sessions >= 1) badges.push({ id: 'first', name: 'First Steps', icon: 'footprints', desc: 'Complete first session' });
  if (progress.total_sessions >= 10) badges.push({ id: 'sessions10', name: 'Dedicated', icon: 'book', desc: '10 study sessions' });
  if (progress.total_sessions >= 50) badges.push({ id: 'sessions50', name: 'Scholar', icon: 'graduation', desc: '50 study sessions' });
  if (progress.total_quizzes >= 5) badges.push({ id: 'quiz5', name: 'Quiz Whiz', icon: 'target', desc: '5 quizzes completed' });
  if (progress.total_quizzes >= 25) badges.push({ id: 'quiz25', name: 'Quiz Master', icon: 'award', desc: '25 quizzes completed' });
  if (progress.total_flashcards >= 20) badges.push({ id: 'flash20', name: 'Card Shark', icon: 'layers', desc: '20 flashcards reviewed' });
  if (progress.total_flashcards >= 100) badges.push({ id: 'flash100', name: 'Memory Pro', icon: 'brain', desc: '100 flashcards reviewed' });
  if (progress.xp >= 500) badges.push({ id: 'xp500', name: 'Rising Star', icon: 'star', desc: '500 XP earned' });
  if (progress.xp >= 2000) badges.push({ id: 'xp2000', name: 'Superstar', icon: 'sparkles', desc: '2000 XP earned' });
  if (progress.xp >= 5000) badges.push({ id: 'xp5000', name: 'Elite', icon: 'trophy', desc: '5000 XP earned' });
  return badges;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const userId = req.query.user_id || req.body?.user_id || 'anonymous';

  try {
    if (req.method === 'GET') {
      let { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        const { data: newData, error: insertErr } = await supabase
          .from('user_progress')
          .insert({ user_id: userId, xp: 0, level: 1, current_streak: 0, longest_streak: 0, total_sessions: 0, total_quizzes: 0, total_flashcards: 0, total_fill_blanks: 0, badges: [], last_study_date: null })
          .select()
          .single();
        if (insertErr) throw insertErr;
        data = newData;
      }

      data.badges = checkBadges(data);
      const nextLevelXp = data.level * 100;
      let currentLevelXp = 0;
      for (let i = 1; i < data.level; i++) currentLevelXp += i * 100;
      data.xp_in_level = data.xp - currentLevelXp;
      data.xp_for_next = nextLevelXp;

      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { activity_type, xp_earned = 10, details = '' } = req.body;
      const today = getToday();

      let { data: progress, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !progress) {
        const { data: newData } = await supabase
          .from('user_progress')
          .insert({ user_id: userId, xp: 0, level: 1, current_streak: 0, longest_streak: 0, total_sessions: 0, total_quizzes: 0, total_flashcards: 0, total_fill_blanks: 0, badges: [], last_study_date: null })
          .select()
          .single();
        progress = newData;
      }

      let newStreak = progress.current_streak;
      const lastDate = progress.last_study_date;
      if (lastDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        if (lastDate === yesterdayStr) {
          newStreak = progress.current_streak + 1;
        } else if (!lastDate) {
          newStreak = 1;
        } else {
          newStreak = 1;
        }
      }

      const newXp = progress.xp + xp_earned;
      const newLevel = calcLevel(newXp);
      const leveledUp = newLevel > progress.level;

      const updates = {
        xp: newXp,
        level: newLevel,
        current_streak: newStreak,
        longest_streak: Math.max(progress.longest_streak, newStreak),
        last_study_date: today,
        total_sessions: progress.total_sessions + (activity_type === 'session' ? 1 : 0),
        total_quizzes: progress.total_quizzes + (activity_type === 'quiz' ? 1 : 0),
        total_flashcards: progress.total_flashcards + (activity_type === 'flashcard' ? 1 : 0),
        total_fill_blanks: progress.total_fill_blanks + (activity_type === 'fill_blank' ? 1 : 0),
      };

      const { data: updated, error: updateErr } = await supabase
        .from('user_progress')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();
      if (updateErr) throw updateErr;

      await supabase.from('study_activity').insert({
        user_id: userId,
        activity_type,
        xp_earned,
        details,
        study_date: today,
      });

      // Update leaderboard
      const { data: lb } = await supabase.from('leaderboard').select('id').eq('user_id', userId).single();
      const colors = ['#3B82F6','#8B5CF6','#EC4899','#10B981','#F59E0B','#EF4444','#06B6D4'];
      const lbData = { user_id: userId, display_name: 'You', xp: newXp, level: newLevel, streak: newStreak, avatar_color: colors[Math.floor(Math.random()*colors.length)], updated_at: new Date().toISOString() };
      if (lb) {
        await supabase.from('leaderboard').update(lbData).eq('user_id', userId);
      } else {
        await supabase.from('leaderboard').insert(lbData);
      }

      updated.badges = checkBadges(updated);
      updated.leveled_up = leveledUp;
      updated.xp_gained = xp_earned;

      return res.status(200).json(updated);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Progress API error:', err);
    res.status(500).json({ error: err.message });
  }
}

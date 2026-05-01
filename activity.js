import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const userId = req.query.user_id || 'anonymous';
  const days = parseInt(req.query.days) || 90;

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startStr = startDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('study_activity')
      .select('*')
      .eq('user_id', userId)
      .gte('study_date', startStr)
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) throw error;

    // Aggregate by date
    const byDate = {};
    (data || []).forEach(a => {
      if (!byDate[a.study_date]) byDate[a.study_date] = { date: a.study_date, sessions: 0, xp: 0, activities: [] };
      byDate[a.study_date].sessions++;
      byDate[a.study_date].xp += a.xp_earned;
      byDate[a.study_date].activities.push({ type: a.activity_type, xp: a.xp_earned, details: a.details });
    });

    return res.status(200).json({ activities: data || [], calendar: Object.values(byDate) });
  } catch (err) {
    console.error('Activity API error:', err);
    res.status(500).json({ error: err.message });
  }
}

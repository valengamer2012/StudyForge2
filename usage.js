import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

  const currentMonth = new Date().toISOString().slice(0, 7);

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth);
      if (error) throw error;

      const usage = {};
      (data || []).forEach(r => { usage[r.feature] = r.count; });

      // Get subscription
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('plan, status, expires_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      let plan = 'free';
      if (subs && subs.length > 0) {
        const sub = subs[0];
        if (new Date(sub.expires_at) > new Date()) {
          plan = sub.plan;
        }
      }

      return res.status(200).json({ plan, usage, month: currentMonth });
    }

    if (req.method === 'POST') {
      const { feature } = req.body;
      if (!feature) return res.status(400).json({ error: 'Feature is required' });

      // Check if row exists
      const { data: existing } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('feature', feature)
        .eq('month', currentMonth)
        .limit(1);

      if (existing && existing.length > 0) {
        const { data, error } = await supabase
          .from('usage_tracking')
          .update({ count: existing[0].count + 1, updated_at: new Date().toISOString() })
          .eq('id', existing[0].id)
          .select()
          .single();
        if (error) throw error;
        return res.status(200).json(data);
      } else {
        const { data, error } = await supabase
          .from('usage_tracking')
          .insert({
            user_id: user.id,
            feature,
            count: 1,
            month: currentMonth,
          })
          .select()
          .single();
        if (error) throw error;
        return res.status(201).json(data);
      }
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Usage error:', err);
    res.status(500).json({ error: err.message });
  }
}

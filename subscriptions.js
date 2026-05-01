import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);
      if (error) throw error;
      return res.status(200).json(data?.[0] || { plan: 'free', status: 'active' });
    }

    if (req.method === 'POST') {
      const { plan, billing_cycle, card_number, card_exp, card_cvc, card_name } = req.body;
      if (!plan || !card_number || !card_exp || !card_cvc) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Validate card number (basic Luhn-ish check)
      const cleaned = card_number.replace(/\s/g, '');
      if (cleaned.length < 13 || cleaned.length > 19 || !/^\d+$/.test(cleaned)) {
        return res.status(400).json({ error: 'Invalid card number' });
      }

      // Detect brand
      let brand = 'unknown';
      if (/^4/.test(cleaned)) brand = 'visa';
      else if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) brand = 'mastercard';
      else if (/^3[47]/.test(cleaned)) brand = 'amex';
      else if (/^6(?:011|5)/.test(cleaned)) brand = 'discover';

      // Validate expiry
      const expMatch = card_exp.match(/^(\d{2})\/(\d{2})$/);
      if (!expMatch) return res.status(400).json({ error: 'Invalid expiry format (MM/YY)' });
      const expMonth = parseInt(expMatch[1]);
      const expYear = parseInt('20' + expMatch[2]);
      const now = new Date();
      if (expMonth < 1 || expMonth > 12) return res.status(400).json({ error: 'Invalid expiry month' });
      if (expYear < now.getFullYear() || (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) {
        return res.status(400).json({ error: 'Card has expired' });
      }

      // CVC
      if (!/^\d{3,4}$/.test(card_cvc)) return res.status(400).json({ error: 'Invalid CVC' });

      // Pricing
      const prices = {
        pro: { monthly: 12, yearly: 8 },
        premium: { monthly: 24, yearly: 18 },
      };
      const cycle = billing_cycle === 'monthly' ? 'monthly' : 'yearly';
      const planPrices = prices[plan];
      if (!planPrices) return res.status(400).json({ error: 'Invalid plan' });
      const amount = cycle === 'yearly' ? planPrices.yearly * 12 : planPrices.monthly;

      // Simulate payment processing delay
      await new Promise(r => setTimeout(r, 1500));

      // Deactivate any existing active subscriptions
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', user.id)
        .eq('status', 'active');

      const expiresAt = new Date();
      if (cycle === 'yearly') expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      else expiresAt.setMonth(expiresAt.getMonth() + 1);

      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan,
          billing_cycle: cycle,
          status: 'active',
          card_last4: cleaned.slice(-4),
          card_brand: brand,
          card_exp,
          amount_paid: amount,
          started_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { action } = req.body;
      if (action === 'cancel') {
        const { error } = await supabase
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('user_id', user.id)
          .eq('status', 'active');
        if (error) throw error;
        return res.status(200).json({ ok: true, message: 'Subscription cancelled' });
      }
      return res.status(400).json({ error: 'Invalid action' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Subscription error:', err);
    res.status(500).json({ error: err.message });
  }
}

import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    // Add study_notes column using rpc or raw query workaround
    // We'll just try inserting with the new column - if it doesn't exist, 
    // we use the supabase client to alter the table
    const { error } = await supabase.rpc('exec_sql', {
      query: "ALTER TABLE study_sets ADD COLUMN IF NOT EXISTS study_notes jsonb DEFAULT '[]'"
    });
    
    if (error) {
      // If rpc doesn't exist, return info
      return res.status(200).json({ message: 'Migration note: study_notes column may need manual addition', error: error.message });
    }
    return res.status(200).json({ ok: true, message: 'study_notes column added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

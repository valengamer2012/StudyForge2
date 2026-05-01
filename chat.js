import supabase from './_supabase.js';

function generateReply(messages, notesContext, lang) {
  const isEs = lang === 'es';
  const lastMsg = messages[messages.length - 1];
  if (!lastMsg) return isEs ? 'Hola! Preguntame algo sobre tus apuntes.' : 'Hi! Ask me anything about your notes.';
  const q = lastMsg.content.toLowerCase().trim();
  const notes = (notesContext || '').toLowerCase();

  // Extract keywords from question
  const qWords = q.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3);
  
  // Find relevant sentences from notes
  const noteSentences = (notesContext || '').split(/[.!?\n]+/).filter(s => s.trim().length > 10);
  const relevant = noteSentences.filter(s => {
    const sLower = s.toLowerCase();
    return qWords.some(w => sLower.includes(w));
  }).slice(0, 3);

  if (relevant.length > 0) {
    const intro = isEs ? 'Segun tus apuntes:' : 'Based on your notes:';
    const summary = relevant.map(s => s.trim()).join('. ');
    const tip = isEs ? '\n\nQuieres que profundice en algun punto?' : '\n\nWould you like me to elaborate on any point?';
    return `${intro}\n\n${summary}.${tip}`;
  }

  // Check for common question types
  if (q.match(/summar|resum|overview|general/i)) {
    if (noteSentences.length > 0) {
      const summary = noteSentences.slice(0, 4).map(s => s.trim()).join('. ');
      return (isEs ? 'Aqui tienes un resumen de tus apuntes:\n\n' : 'Here\'s a summary of your notes:\n\n') + summary + '.';
    }
  }

  if (q.match(/explain|explica|what is|que es|define|defin/i)) {
    if (noteSentences.length > 0) {
      const topSentences = noteSentences.slice(0, 3).map(s => s.trim()).join('. ');
      return (isEs ? 'Basandome en tu material, puedo decirte que: ' : 'Based on your material, I can tell you that: ') + topSentences + '.';
    }
  }

  if (q.match(/quiz|test|pregunta|question/i)) {
    if (noteSentences.length >= 2) {
      const randomSent = noteSentences[Math.floor(Math.random() * noteSentences.length)].trim();
      const words = randomSent.split(/\s+/);
      if (words.length > 4) {
        const hideIdx = Math.floor(words.length / 2);
        const hidden = words[hideIdx];
        words[hideIdx] = '_____';
        return (isEs ? 'Aqui tienes una pregunta rapida:\n\n' : 'Here\'s a quick question:\n\n') + words.join(' ') + '\n\n' + (isEs ? '(Respuesta: ' : '(Answer: ') + hidden + ')';
      }
    }
  }

  if (q.match(/key|clave|important|importante|main|principal/i)) {
    const keywords = {};
    const stops = new Set(['the','and','for','that','this','with','from','have','are','was','were','been','they','their','which','about','would','there','these','could','other','into','more','some','than','them','each','make','como','para','pero','esta','este','esos','esas','donde','cuando','tiene','puede','todos','cada','otro','entre','sobre']);
    (notesContext || '').toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(w => w.length > 4 && !stops.has(w)).forEach(w => { keywords[w] = (keywords[w] || 0) + 1; });
    const topKw = Object.entries(keywords).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([w]) => w);
    if (topKw.length > 0) {
      return (isEs ? 'Los conceptos clave de tus apuntes son:\n\n' : 'The key concepts from your notes are:\n\n') + topKw.map((k, i) => `${i + 1}. ${k.charAt(0).toUpperCase() + k.slice(1)}`).join('\n');
    }
  }

  // Fallback
  if (notes.length > 50) {
    return isEs
      ? 'No encontre informacion especifica sobre eso en tus apuntes. Intenta preguntar de otra manera, o pregunta por un resumen, conceptos clave, o una pregunta de practica.'
      : 'I couldn\'t find specific information about that in your notes. Try rephrasing, or ask for a summary, key concepts, or a practice question.';
  }
  return isEs
    ? 'Pega tus apuntes arriba para que pueda ayudarte. Puedo resumir, explicar conceptos, crear preguntas de practica, y mas!'
    : 'Paste your notes above so I can help you. I can summarize, explain concepts, create practice questions, and more!';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { id } = req.query;
      if (id) {
        const { data, error } = await supabase.from('chat_sessions').select('*').eq('id', parseInt(id)).single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      const { data, error } = await supabase.from('chat_sessions').select('id,title,language,created_at').order('created_at', { ascending: false }).limit(20);
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { title, notes_context, language, message } = req.body;
      // New session
      if (!req.body.session_id) {
        const msgs = [{ role: 'user', content: message || '' }];
        const reply = generateReply(msgs, notes_context, language || 'en');
        msgs.push({ role: 'assistant', content: reply });
        const { data, error } = await supabase.from('chat_sessions').insert({ title: title || 'Chat', notes_context: notes_context || '', language: language || 'en', messages: msgs }).select().single();
        if (error) throw error;
        return res.status(201).json(data);
      }
      return res.status(400).json({ error: 'Use PUT to add messages' });
    }
    if (req.method === 'PUT') {
      const { session_id, message } = req.body;
      if (!session_id || !message) return res.status(400).json({ error: 'session_id and message required' });
      const { data: session, error: fetchErr } = await supabase.from('chat_sessions').select('*').eq('id', session_id).single();
      if (fetchErr) throw fetchErr;
      const msgs = [...(session.messages || []), { role: 'user', content: message }];
      const reply = generateReply(msgs, session.notes_context, session.language);
      msgs.push({ role: 'assistant', content: reply });
      const { data, error } = await supabase.from('chat_sessions').update({ messages: msgs }).eq('id', session_id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase.from('chat_sessions').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message });
  }
}

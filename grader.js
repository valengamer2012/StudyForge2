import supabase from './_supabase.js';

function gradeEssay(content, lang) {
  const words = content.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 3);
  const sentenceCount = sentences.length;
  const paragraphs = content.split(/\n{2,}/).filter(p => p.trim().length > 10);
  const avgSentenceLen = sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0;
  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
  const vocabRichness = wordCount > 0 ? uniqueWords / wordCount : 0;
  const isEs = lang === 'es';

  const rubric = [
    { category: isEs ? 'Estructura y Organizacion' : 'Structure & Organization', score: 0, max: 25, feedback: '' },
    { category: isEs ? 'Contenido y Argumentacion' : 'Content & Argumentation', score: 0, max: 25, feedback: '' },
    { category: isEs ? 'Vocabulario y Estilo' : 'Vocabulary & Style', score: 0, max: 25, feedback: '' },
    { category: isEs ? 'Gramatica y Mecanica' : 'Grammar & Mechanics', score: 0, max: 25, feedback: '' },
  ];

  // Structure
  let structScore = 10;
  if (paragraphs.length >= 3) structScore += 5;
  if (paragraphs.length >= 5) structScore += 5;
  if (sentenceCount >= 5) structScore += 3;
  if (wordCount >= 200) structScore += 2;
  rubric[0].score = Math.min(25, structScore);
  rubric[0].feedback = paragraphs.length >= 3
    ? (isEs ? 'Buena estructura con multiples parrafos.' : 'Good structure with multiple paragraphs.')
    : (isEs ? 'Considera agregar mas parrafos para mejor organizacion.' : 'Consider adding more paragraphs for better organization.');

  // Content
  let contentScore = 10;
  if (wordCount >= 100) contentScore += 3;
  if (wordCount >= 250) contentScore += 4;
  if (wordCount >= 500) contentScore += 4;
  if (sentenceCount >= 10) contentScore += 4;
  rubric[1].score = Math.min(25, contentScore);
  rubric[1].feedback = wordCount >= 250
    ? (isEs ? 'Contenido sustancial con desarrollo adecuado.' : 'Substantial content with adequate development.')
    : (isEs ? 'Intenta desarrollar mas tus ideas con ejemplos y evidencia.' : 'Try to develop your ideas further with examples and evidence.');

  // Vocabulary
  let vocabScore = 10;
  if (vocabRichness > 0.5) vocabScore += 4;
  if (vocabRichness > 0.6) vocabScore += 4;
  if (vocabRichness > 0.7) vocabScore += 4;
  if (avgSentenceLen >= 10 && avgSentenceLen <= 25) vocabScore += 3;
  rubric[2].score = Math.min(25, vocabScore);
  rubric[2].feedback = vocabRichness > 0.5
    ? (isEs ? 'Buen uso de vocabulario variado.' : 'Good use of varied vocabulary.')
    : (isEs ? 'Intenta usar un vocabulario mas diverso.' : 'Try to use more diverse vocabulary.');

  // Grammar
  let gramScore = 15;
  if (avgSentenceLen >= 8 && avgSentenceLen <= 30) gramScore += 5;
  if (content.match(/[A-Z]/)) gramScore += 3;
  if (content.match(/[.!?]$/)) gramScore += 2;
  rubric[3].score = Math.min(25, gramScore);
  rubric[3].feedback = isEs ? 'Revisa la puntuacion y la concordancia.' : 'Review punctuation and sentence agreement.';

  const overall = rubric.reduce((sum, r) => sum + r.score, 0);

  const strengths = [];
  const improvements = [];

  if (wordCount >= 200) strengths.push(isEs ? 'Longitud adecuada del ensayo' : 'Adequate essay length');
  if (paragraphs.length >= 3) strengths.push(isEs ? 'Buena organizacion en parrafos' : 'Good paragraph organization');
  if (vocabRichness > 0.5) strengths.push(isEs ? 'Vocabulario rico y variado' : 'Rich and varied vocabulary');
  if (sentenceCount >= 10) strengths.push(isEs ? 'Desarrollo completo de ideas' : 'Thorough idea development');
  if (strengths.length === 0) strengths.push(isEs ? 'Buen intento inicial' : 'Good initial attempt');

  if (wordCount < 200) improvements.push(isEs ? 'Ampliar el contenido con mas detalles y ejemplos' : 'Expand content with more details and examples');
  if (paragraphs.length < 3) improvements.push(isEs ? 'Dividir el texto en mas parrafos' : 'Break text into more paragraphs');
  if (vocabRichness <= 0.5) improvements.push(isEs ? 'Usar sinonimos para enriquecer el vocabulario' : 'Use synonyms to enrich vocabulary');
  if (avgSentenceLen > 30) improvements.push(isEs ? 'Acortar algunas oraciones para mayor claridad' : 'Shorten some sentences for clarity');
  if (avgSentenceLen < 8) improvements.push(isEs ? 'Desarrollar oraciones mas completas' : 'Develop more complete sentences');

  return { overall, rubric, strengths, improvements, stats: { wordCount, sentenceCount, paragraphs: paragraphs.length, avgSentenceLen, vocabRichness: Math.round(vocabRichness * 100) } };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('paper_grades')
        .select('id, title, overall_score, language, created_at')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { title, content, language } = req.body;
      if (!content || content.trim().length < 20) return res.status(400).json({ error: 'Content too short' });

      const grade = gradeEssay(content, language || 'en');

      const { data, error } = await supabase
        .from('paper_grades')
        .insert({
          title: title || 'Untitled Essay',
          content,
          language: language || 'en',
          overall_score: grade.overall,
          rubric_scores: grade.rubric,
          feedback: [grade.stats],
          strengths: grade.strengths,
          improvements: grade.improvements,
        })
        .select()
        .single();
      if (error) throw error;
      data.stats = grade.stats;
      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Grader API error:', err);
    res.status(500).json({ error: err.message });
  }
}

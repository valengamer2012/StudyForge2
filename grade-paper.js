import supabase from './_supabase.js';

function analyzePaper(text, lang) {
  const isEs = lang === 'es';
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const avgSentLen = sentences.length > 0 ? Math.round(wordCount / sentences.length) : 0;
  const paragraphs = text.split(/\n{2,}/).filter(p => p.trim().length > 10);
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const vocabRichness = Math.min(100, Math.round((uniqueWords.size / Math.max(wordCount, 1)) * 150));

  // Structure score — based on paragraph count, intro/conclusion signals
  const hasIntro = paragraphs.length >= 1;
  const hasBody = paragraphs.length >= 2;
  const hasConclusion = paragraphs.length >= 3;
  const introWords = ['introduction', 'this essay', 'in this', 'the purpose', 'introduccion', 'este ensayo', 'en este', 'el proposito'];
  const conclusionWords = ['in conclusion', 'to summarize', 'therefore', 'en conclusion', 'para resumir', 'por lo tanto', 'finally', 'finalmente'];
  const textLower = text.toLowerCase();
  const hasIntroSignal = introWords.some(w => textLower.includes(w));
  const hasConclusionSignal = conclusionWords.some(w => textLower.includes(w));
  const structureScore = Math.min(100,
    30 +
    Math.min(paragraphs.length * 8, 24) +
    (hasIntro ? 8 : 0) +
    (hasBody ? 8 : 0) +
    (hasConclusion ? 8 : 0) +
    (hasIntroSignal ? 10 : 0) +
    (hasConclusionSignal ? 12 : 0)
  );

  // Clarity — based on average sentence length (ideal 12–25 words)
  let clarityScore;
  if (avgSentLen >= 12 && avgSentLen <= 25) clarityScore = 85;
  else if (avgSentLen >= 8 && avgSentLen <= 30) clarityScore = 72;
  else if (avgSentLen > 30) clarityScore = 55;
  else clarityScore = 60;
  // Bonus for varied sentence lengths
  if (sentences.length >= 3) {
    const lengths = sentences.map(s => s.trim().split(/\s+/).length);
    const variance = lengths.reduce((s, l) => s + Math.abs(l - avgSentLen), 0) / lengths.length;
    if (variance > 3 && variance < 15) clarityScore = Math.min(100, clarityScore + 8);
  }

  // Depth — based on word count, sentence count, use of evidence words
  const evidenceWords = ['because', 'therefore', 'for example', 'such as', 'according', 'research', 'evidence', 'shows', 'demonstrates', 'porque', 'por ejemplo', 'segun', 'investigacion', 'evidencia', 'demuestra'];
  const evidenceCount = evidenceWords.filter(w => textLower.includes(w)).length;
  const depthScore = Math.min(100,
    20 +
    Math.min(Math.round(wordCount / 6), 35) +
    (sentences.length > 5 ? 12 : 0) +
    (sentences.length > 10 ? 8 : 0) +
    evidenceCount * 5
  );

  // Grammar — deterministic heuristics (no randomness)
  const commonErrors = [
    /\bi\b(?!['''])/g,           // lowercase "i" (not I'm, I'll)
    /\s{2,}/g,                   // double spaces
    /[,]{2,}/g,                  // double commas
    /\.\./g,                     // double periods (not ellipsis)
    /\s[,.:;]/g,                 // space before punctuation
  ];
  let errorCount = 0;
  for (const regex of commonErrors) {
    const matches = text.match(regex);
    if (matches) errorCount += matches.length;
  }
  // Check for repeated words
  const wordArr = text.split(/\s+/);
  for (let i = 1; i < wordArr.length; i++) {
    if (wordArr[i].toLowerCase() === wordArr[i - 1].toLowerCase() && wordArr[i].length > 2) {
      errorCount++;
    }
  }
  const grammarScore = Math.max(40, Math.min(100, 92 - errorCount * 4));

  // Overall
  const overall = Math.round(
    structureScore * 0.2 +
    clarityScore * 0.2 +
    depthScore * 0.25 +
    grammarScore * 0.2 +
    vocabRichness * 0.15
  );

  // Rubric
  const rubric_scores = [
    {
      category: isEs ? 'Estructura y Organizacion' : 'Structure & Organization',
      score: structureScore, max: 100,
      comment: structureScore >= 75
        ? (isEs ? 'Buena organizacion con parrafos claros y transiciones.' : 'Good organization with clear paragraphs and transitions.')
        : structureScore >= 55
        ? (isEs ? 'Estructura aceptable pero podria mejorar las transiciones.' : 'Acceptable structure but transitions could be improved.')
        : (isEs ? 'Necesita mejor estructura con introduccion, cuerpo y conclusion claros.' : 'Needs better structure with clear intro, body, and conclusion.')
    },
    {
      category: isEs ? 'Claridad y Coherencia' : 'Clarity & Coherence',
      score: clarityScore, max: 100,
      comment: clarityScore >= 75
        ? (isEs ? 'Ideas expresadas con claridad y buena variedad de oraciones.' : 'Ideas expressed clearly with good sentence variety.')
        : clarityScore >= 55
        ? (isEs ? 'Generalmente claro pero algunas oraciones son confusas o muy largas.' : 'Generally clear but some sentences are confusing or too long.')
        : (isEs ? 'Muchas oraciones son confusas o excesivamente largas.' : 'Many sentences are confusing or excessively long.')
    },
    {
      category: isEs ? 'Profundidad de Analisis' : 'Depth of Analysis',
      score: depthScore, max: 100,
      comment: depthScore >= 75
        ? (isEs ? 'Buen nivel de analisis con evidencia y ejemplos.' : 'Good level of analysis with evidence and examples.')
        : depthScore >= 55
        ? (isEs ? 'Analisis adecuado pero podria incluir mas evidencia.' : 'Adequate analysis but could include more evidence.')
        : (isEs ? 'Falta profundidad. Agrega mas ejemplos y evidencia.' : 'Lacks depth. Add more examples and supporting evidence.')
    },
    {
      category: isEs ? 'Gramatica y Mecanica' : 'Grammar & Mechanics',
      score: grammarScore, max: 100,
      comment: grammarScore >= 80
        ? (isEs ? 'Pocos errores gramaticales o mecanicos.' : 'Few grammatical or mechanical errors.')
        : grammarScore >= 60
        ? (isEs ? 'Algunos errores gramaticales que no impiden la comprension.' : 'Some grammatical errors that do not impede understanding.')
        : (isEs ? 'Multiples errores gramaticales que afectan la lectura.' : 'Multiple grammatical errors that affect readability.')
    },
    {
      category: isEs ? 'Vocabulario' : 'Vocabulary',
      score: vocabRichness, max: 100,
      comment: vocabRichness >= 65
        ? (isEs ? 'Buen uso de vocabulario variado y apropiado.' : 'Good use of varied and appropriate vocabulary.')
        : vocabRichness >= 45
        ? (isEs ? 'Vocabulario adecuado pero podria ser mas variado.' : 'Adequate vocabulary but could be more varied.')
        : (isEs ? 'Vocabulario limitado. Intenta usar sinonimos y terminos mas precisos.' : 'Limited vocabulary. Try using synonyms and more precise terms.')
    },
  ];

  // Strengths (only add if actually earned)
  const strengths = [];
  if (structureScore >= 70) strengths.push(isEs ? 'Buena estructura general del ensayo' : 'Good overall essay structure');
  if (clarityScore >= 70) strengths.push(isEs ? 'Ideas comunicadas de forma clara' : 'Ideas communicated clearly');
  if (depthScore >= 70) strengths.push(isEs ? 'Buen nivel de detalle y argumentacion' : 'Good level of detail and argumentation');
  if (vocabRichness >= 60) strengths.push(isEs ? 'Vocabulario rico y variado' : 'Rich and varied vocabulary');
  if (grammarScore >= 80) strengths.push(isEs ? 'Escritura gramaticalmente solida' : 'Grammatically solid writing');
  if (wordCount >= 200) strengths.push(isEs ? 'Longitud adecuada para el tema' : 'Adequate length for the topic');
  if (evidenceCount >= 2) strengths.push(isEs ? 'Buen uso de evidencia y ejemplos' : 'Good use of evidence and examples');
  if (hasIntroSignal) strengths.push(isEs ? 'Introduccion clara establecida' : 'Clear introduction established');
  if (hasConclusionSignal) strengths.push(isEs ? 'Conclusion efectiva que resume los puntos' : 'Effective conclusion summarizing key points');
  // Ensure at least one strength
  if (strengths.length === 0) strengths.push(isEs ? 'Esfuerzo visible en el trabajo' : 'Visible effort in the work');

  // Improvements (only add if actually needed)
  const improvements = [];
  if (structureScore < 70) improvements.push(isEs ? 'Mejorar la organizacion con introduccion, cuerpo y conclusion claros' : 'Improve organization with clear intro, body, and conclusion');
  if (clarityScore < 70) improvements.push(isEs ? 'Simplificar oraciones largas y mejorar transiciones entre ideas' : 'Simplify long sentences and improve transitions between ideas');
  if (depthScore < 70) improvements.push(isEs ? 'Agregar mas evidencia, ejemplos especificos y analisis' : 'Add more evidence, specific examples, and analysis');
  if (vocabRichness < 55) improvements.push(isEs ? 'Ampliar vocabulario usando sinonimos y terminos mas precisos' : 'Expand vocabulary using synonyms and more precise terms');
  if (grammarScore < 75) improvements.push(isEs ? 'Revisar errores gramaticales y de puntuacion' : 'Review grammatical and punctuation errors');
  if (wordCount < 150) improvements.push(isEs ? 'Desarrollar mas las ideas — el texto es corto' : 'Develop ideas further — the text is short');
  if (!hasIntroSignal) improvements.push(isEs ? 'Agregar una introduccion clara que presente el tema' : 'Add a clear introduction that presents the topic');
  if (!hasConclusionSignal && paragraphs.length >= 2) improvements.push(isEs ? 'Agregar una conclusion que resuma los puntos principales' : 'Add a conclusion that summarizes the main points');
  if (improvements.length === 0) improvements.push(isEs ? 'Continuar refinando el estilo de escritura' : 'Continue refining your writing style');

  // Feedback
  const feedback = [
    {
      type: 'summary',
      text: isEs
        ? `Tu ensayo tiene ${wordCount} palabras en ${paragraphs.length} parrafo(s) con ${sentences.length} oraciones. La longitud promedio de oracion es ${avgSentLen} palabras. Se detectaron ${errorCount} posible(s) error(es) mecanico(s).`
        : `Your essay has ${wordCount} words across ${paragraphs.length} paragraph(s) with ${sentences.length} sentences. Average sentence length is ${avgSentLen} words. ${errorCount} potential mechanical error(s) detected.`
    },
    {
      type: 'tip',
      text: isEs
        ? 'Consejo: Lee tu trabajo en voz alta antes de entregarlo. Esto ayuda a detectar oraciones confusas y errores que se pasan por alto al leer en silencio.'
        : 'Tip: Read your work aloud before submitting. This helps catch awkward sentences and errors that are easy to miss when reading silently.'
    },
  ];

  return { overall_score: overall, rubric_scores, feedback, strengths, improvements };
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
      if (!content || content.trim().length < 20) {
        return res.status(400).json({ error: 'Content too short (minimum 20 characters)' });
      }
      const result = analyzePaper(content, language || 'en');
      const { data, error } = await supabase
        .from('paper_grades')
        .insert({
          title: title || (language === 'es' ? 'Sin titulo' : 'Untitled'),
          content,
          language: language || 'en',
          ...result
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Grader error:', err);
    res.status(500).json({ error: err.message });
  }
}

import supabase from './_supabase.js';

function detectSubject(problem) {
  const p = problem.toLowerCase();
  if (p.match(/\d+\s*[+\-*/^]\s*\d+|equation|solve|x\s*=|factor|simplif|deriv|integr|sqrt|root|polynomial|quadratic|linear/)) return 'math';
  if (p.match(/velocity|acceleration|force|energy|mass|gravity|newton|momentum|wave|frequency|electric|magnetic|circuit|ohm|volt|ampere/)) return 'physics';
  if (p.match(/molecule|atom|element|compound|reaction|acid|base|molar|electron|bond|ion|solution|concentration|pH/)) return 'chemistry';
  if (p.match(/cell|DNA|RNA|gene|protein|enzyme|organism|species|evolution|ecosystem|photosynthesis|mitosis|meiosis/)) return 'biology';
  return 'math';
}

function solveMath(problem) {
  const steps = [];
  let finalAnswer = '';
  let explanation = '';

  // Basic arithmetic
  const arithMatch = problem.match(/(\-?[\d.]+)\s*([+\-*/^])\s*(\-?[\d.]+)/);
  if (arithMatch) {
    const a = parseFloat(arithMatch[1]);
    const op = arithMatch[2];
    const b = parseFloat(arithMatch[3]);
    steps.push({ step: 1, title: 'Identify the operation', content: `We need to calculate ${a} ${op} ${b}`, formula: `${a} ${op} ${b}` });
    let result;
    switch(op) {
      case '+': result = a + b; steps.push({ step: 2, title: 'Add the numbers', content: `${a} + ${b} = ${result}`, formula: `${a} + ${b} = ${result}` }); break;
      case '-': result = a - b; steps.push({ step: 2, title: 'Subtract the numbers', content: `${a} - ${b} = ${result}`, formula: `${a} - ${b} = ${result}` }); break;
      case '*': result = a * b; steps.push({ step: 2, title: 'Multiply the numbers', content: `${a} × ${b} = ${result}`, formula: `${a} × ${b} = ${result}` }); break;
      case '/': result = b !== 0 ? a / b : 'undefined'; steps.push({ step: 2, title: 'Divide the numbers', content: b !== 0 ? `${a} ÷ ${b} = ${result}` : 'Division by zero is undefined', formula: `${a} ÷ ${b} = ${result}` }); break;
      case '^': result = Math.pow(a, b); steps.push({ step: 2, title: 'Calculate the power', content: `${a}^${b} = ${result}`, formula: `${a}^${b} = ${result}` }); break;
    }
    steps.push({ step: 3, title: 'Final Answer', content: `The result is ${result}`, formula: `= ${result}` });
    finalAnswer = String(result);
    explanation = `This is a basic arithmetic problem. We performed the ${op === '+' ? 'addition' : op === '-' ? 'subtraction' : op === '*' ? 'multiplication' : op === '/' ? 'division' : 'exponentiation'} operation.`;
    return { steps, finalAnswer, explanation };
  }

  // Linear equation: ax + b = c or ax = b
  const linearMatch = problem.match(/(\-?[\d.]*)\s*x\s*([+\-])\s*([\d.]+)\s*=\s*(\-?[\d.]+)/);
  if (linearMatch) {
    const a = parseFloat(linearMatch[1] || '1') || 1;
    const sign = linearMatch[2];
    const b = parseFloat(linearMatch[3]);
    const c = parseFloat(linearMatch[4]);
    const bSigned = sign === '-' ? -b : b;
    steps.push({ step: 1, title: 'Write the equation', content: `${a}x ${sign} ${b} = ${c}`, formula: `${a}x ${sign} ${b} = ${c}` });
    steps.push({ step: 2, title: `${sign === '+' ? 'Subtract' : 'Add'} ${b} from both sides`, content: `${a}x = ${c} ${sign === '+' ? '-' : '+'} ${b}`, formula: `${a}x = ${c - bSigned}` });
    const rhs = c - bSigned;
    steps.push({ step: 3, title: `Divide both sides by ${a}`, content: `x = ${rhs} / ${a}`, formula: `x = ${rhs / a}` });
    finalAnswer = `x = ${rhs / a}`;
    explanation = 'To solve a linear equation, isolate x by performing inverse operations on both sides.';
    return { steps, finalAnswer, explanation };
  }

  // Quadratic: ax^2 + bx + c = 0
  const quadMatch = problem.match(/(\-?[\d.]*)\s*x\^?2\s*([+\-])\s*([\d.]*)\s*x\s*([+\-])\s*([\d.]+)\s*=\s*0/);
  if (quadMatch) {
    const a = parseFloat(quadMatch[1] || '1') || 1;
    const bSign = quadMatch[2];
    const bVal = parseFloat(quadMatch[3] || '1') || 1;
    const cSign = quadMatch[4];
    const cVal = parseFloat(quadMatch[5]);
    const bCoeff = bSign === '-' ? -bVal : bVal;
    const cCoeff = cSign === '-' ? -cVal : cVal;
    steps.push({ step: 1, title: 'Identify coefficients', content: `a = ${a}, b = ${bCoeff}, c = ${cCoeff}`, formula: `${a}x² ${bSign} ${bVal}x ${cSign} ${cVal} = 0` });
    const discriminant = bCoeff * bCoeff - 4 * a * cCoeff;
    steps.push({ step: 2, title: 'Calculate discriminant', content: `Δ = b² - 4ac = ${bCoeff}² - 4(${a})(${cCoeff}) = ${discriminant}`, formula: `Δ = ${discriminant}` });
    if (discriminant < 0) {
      steps.push({ step: 3, title: 'No real solutions', content: 'Discriminant is negative, so there are no real solutions.', formula: 'Δ < 0' });
      finalAnswer = 'No real solutions';
    } else {
      const x1 = (-bCoeff + Math.sqrt(discriminant)) / (2 * a);
      const x2 = (-bCoeff - Math.sqrt(discriminant)) / (2 * a);
      steps.push({ step: 3, title: 'Apply quadratic formula', content: `x = (-b ± √Δ) / 2a`, formula: `x = (${-bCoeff} ± √${discriminant}) / ${2*a}` });
      steps.push({ step: 4, title: 'Calculate solutions', content: `x₁ = ${x1.toFixed(3)}, x₂ = ${x2.toFixed(3)}`, formula: `x₁ = ${x1.toFixed(3)}, x₂ = ${x2.toFixed(3)}` });
      finalAnswer = `x₁ = ${x1.toFixed(3)}, x₂ = ${x2.toFixed(3)}`;
    }
    explanation = 'Quadratic equations are solved using the quadratic formula: x = (-b ± √(b²-4ac)) / 2a.';
    return { steps, finalAnswer, explanation };
  }

  // Percentage
  const pctMatch = problem.match(/what\s+is\s+([\d.]+)\s*%\s*of\s+([\d.]+)/i) || problem.match(/([\d.]+)\s*%\s*(?:de|of)\s+([\d.]+)/i);
  if (pctMatch) {
    const pct = parseFloat(pctMatch[1]);
    const num = parseFloat(pctMatch[2]);
    const result = (pct / 100) * num;
    steps.push({ step: 1, title: 'Set up the problem', content: `Find ${pct}% of ${num}`, formula: `${pct}% × ${num}` });
    steps.push({ step: 2, title: 'Convert percentage to decimal', content: `${pct}% = ${pct/100}`, formula: `${pct} ÷ 100 = ${pct/100}` });
    steps.push({ step: 3, title: 'Multiply', content: `${pct/100} × ${num} = ${result}`, formula: `= ${result}` });
    finalAnswer = String(result);
    explanation = 'To find a percentage of a number, convert the percentage to a decimal and multiply.';
    return { steps, finalAnswer, explanation };
  }

  // Generic fallback
  steps.push({ step: 1, title: 'Analyze the problem', content: `Problem: ${problem}`, formula: '' });
  steps.push({ step: 2, title: 'Identify key information', content: 'Extract the known values and what needs to be found.', formula: '' });
  steps.push({ step: 3, title: 'Apply relevant formulas', content: 'Use the appropriate mathematical or scientific formulas.', formula: '' });
  steps.push({ step: 4, title: 'Calculate step by step', content: 'Work through the calculation carefully, checking each step.', formula: '' });
  finalAnswer = 'Please provide a specific equation or numerical problem for a detailed solution.';
  explanation = 'Break complex problems into smaller steps. Identify what is given, what is asked, and which formulas apply.';
  return { steps, finalAnswer, explanation };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('solved_problems')
        .select('id, problem, subject, final_answer, created_at')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { problem, language } = req.body;
      if (!problem || problem.trim().length < 3) return res.status(400).json({ error: 'Problem too short' });

      const subject = detectSubject(problem);
      const solution = solveMath(problem);

      const { data, error } = await supabase
        .from('solved_problems')
        .insert({
          problem,
          subject,
          language: language || 'en',
          steps: solution.steps,
          final_answer: solution.finalAnswer,
          explanation: solution.explanation,
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Solver API error:', err);
    res.status(500).json({ error: err.message });
  }
}

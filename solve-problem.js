import supabase from './_supabase.js';

function solveMath(problem, lang) {
  const p = problem.trim();
  const es = lang === 'es';
  const steps = [];
  let final_answer = '';
  let explanation = '';
  let subject = 'math';

  // ── Linear equation: ax + b = c  or  ax - b = c ──
  const linearMatch = p.match(/(-?\d*\.?\d*)\s*x\s*([+\-])\s*(\d+\.?\d*)\s*=\s*(-?\d+\.?\d*)/i);
  if (linearMatch) {
    const a = parseFloat(linearMatch[1] || '1') || 1;
    const op = linearMatch[2];
    const b = parseFloat(linearMatch[3]);
    const c = parseFloat(linearMatch[4]);
    const bSigned = op === '+' ? b : -b;
    const rhs = c - bSigned;
    const x = Math.round((rhs / a) * 10000) / 10000;

    steps.push({
      step: 1,
      title: es ? 'Identificar la ecuacion' : 'Identify the equation',
      content: `${a === 1 ? '' : a}x ${op} ${b} = ${c}`,
      hint: es ? 'Esta es una ecuacion lineal con una variable.' : 'This is a linear equation in one variable.'
    });
    steps.push({
      step: 2,
      title: es ? `Mover ${b} al otro lado` : `Move ${b} to the other side`,
      content: `${a === 1 ? '' : a}x = ${c} ${op === '+' ? '-' : '+'} ${b} = ${rhs}`,
      hint: es ? `Resta o suma ${b} en ambos lados.` : `Subtract or add ${b} from both sides.`
    });
    if (a !== 1) {
      steps.push({
        step: 3,
        title: es ? 'Dividir por el coeficiente' : 'Divide by the coefficient',
        content: `x = ${rhs} / ${a} = ${x}`,
        hint: es ? 'Divide ambos lados por el coeficiente de x.' : 'Divide both sides by the coefficient of x.'
      });
    }
    const check = a * x + bSigned;
    steps.push({
      step: a !== 1 ? 4 : 3,
      title: es ? 'Verificar' : 'Verify',
      content: es
        ? `Comprobacion: ${a === 1 ? '' : a}(${x}) ${op} ${b} = ${check} = ${c} ✓`
        : `Check: ${a === 1 ? '' : a}(${x}) ${op} ${b} = ${check} = ${c} ✓`,
      hint: es ? 'Siempre verifica sustituyendo en la ecuacion original.' : 'Always verify by plugging back into the original equation.'
    });

    final_answer = `x = ${x}`;
    explanation = es
      ? `Esta es una ecuacion lineal resuelta aislando x. Movimos la constante al lado derecho y luego dividimos por el coeficiente de x.`
      : `This is a linear equation solved by isolating x. We moved the constant term to the right side, then divided by the coefficient of x.`;
    return { steps, final_answer, explanation, subject };
  }

  // ── Quadratic equation: ax^2 + bx + c = 0 ──
  const quadMatch = p.match(/(-?\d*)\s*x\s*[\^²]\s*2?\s*([+\-])\s*(\d+)\s*x\s*([+\-])\s*(\d+)\s*=\s*0/i);
  if (quadMatch) {
    const a = parseFloat(quadMatch[1] || '1') || 1;
    const bSign = quadMatch[2];
    const bAbs = parseFloat(quadMatch[3]);
    const cSign = quadMatch[4];
    const cAbs = parseFloat(quadMatch[5]);
    const b = bSign === '-' ? -bAbs : bAbs;
    const c = cSign === '-' ? -cAbs : cAbs;
    const disc = b * b - 4 * a * c;

    steps.push({
      step: 1,
      title: es ? 'Identificar la ecuacion cuadratica' : 'Identify the quadratic',
      content: `${a}x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0  →  a=${a}, b=${b}, c=${c}`,
      hint: es ? 'Forma estandar: ax² + bx + c = 0' : 'Standard form: ax² + bx + c = 0'
    });
    steps.push({
      step: 2,
      title: es ? 'Calcular el discriminante' : 'Calculate the discriminant',
      content: `Δ = b² - 4ac = (${b})² - 4(${a})(${c}) = ${b * b} - ${4 * a * c} = ${disc}`,
      hint: es ? 'El discriminante determina la naturaleza de las raices.' : 'The discriminant tells us the nature of roots.'
    });

    if (disc > 0) {
      const x1 = Math.round(((-b + Math.sqrt(disc)) / (2 * a)) * 10000) / 10000;
      const x2 = Math.round(((-b - Math.sqrt(disc)) / (2 * a)) * 10000) / 10000;
      steps.push({
        step: 3,
        title: es ? 'Aplicar la formula cuadratica' : 'Apply the quadratic formula',
        content: `x = (-b ± √Δ) / 2a = (${-b} ± √${disc}) / ${2 * a}`,
        hint: es ? 'La formula cuadratica da ambas soluciones.' : 'The quadratic formula gives both solutions.'
      });
      steps.push({
        step: 4,
        title: es ? 'Calcular soluciones' : 'Calculate solutions',
        content: `x₁ = ${x1},  x₂ = ${x2}`,
        hint: es ? 'Dos soluciones reales distintas porque Δ > 0.' : 'Two distinct real solutions because Δ > 0.'
      });
      final_answer = `x₁ = ${x1}, x₂ = ${x2}`;
    } else if (disc === 0) {
      const x1 = Math.round((-b / (2 * a)) * 10000) / 10000;
      steps.push({
        step: 3,
        title: es ? 'Solucion unica (raiz doble)' : 'Single solution (double root)',
        content: `x = -b / 2a = ${-b} / ${2 * a} = ${x1}`,
        hint: es ? 'Δ = 0 significa una raiz doble.' : 'Δ = 0 means a double root.'
      });
      final_answer = `x = ${x1}`;
    } else {
      const realPart = Math.round((-b / (2 * a)) * 10000) / 10000;
      const imagPart = Math.round((Math.sqrt(-disc) / (2 * a)) * 10000) / 10000;
      steps.push({
        step: 3,
        title: es ? 'Raices complejas' : 'Complex roots',
        content: `x = ${realPart} ± ${imagPart}i`,
        hint: es ? 'Δ < 0 significa raices complejas conjugadas.' : 'Δ < 0 means complex conjugate roots.'
      });
      final_answer = `x = ${realPart} ± ${imagPart}i`;
    }

    explanation = es
      ? 'Resuelto usando la formula cuadratica. El discriminante determina si las raices son reales o complejas.'
      : 'Solved using the quadratic formula. The discriminant determines whether roots are real or complex.';
    return { steps, final_answer, explanation, subject };
  }

  // ── Arithmetic: a op b ──
  const arithMatch = p.match(/(-?\d+\.?\d*)\s*([+\-*/×÷^])\s*(-?\d+\.?\d*)/);
  if (arithMatch) {
    const a = parseFloat(arithMatch[1]);
    const op = arithMatch[2];
    const b = parseFloat(arithMatch[3]);
    let result;
    const opNames = {
      '+': es ? 'Suma' : 'Addition',
      '-': es ? 'Resta' : 'Subtraction',
      '*': es ? 'Multiplicacion' : 'Multiplication',
      '×': es ? 'Multiplicacion' : 'Multiplication',
      '/': es ? 'Division' : 'Division',
      '÷': es ? 'Division' : 'Division',
      '^': es ? 'Potenciacion' : 'Exponentiation'
    };
    const opName = opNames[op] || 'Arithmetic';

    steps.push({
      step: 1,
      title: es ? 'Identificar la operacion' : 'Identify the operation',
      content: `${a} ${op} ${b}  →  ${opName}`,
      hint: es ? 'Descomponer el problema en sus partes.' : 'Break down the problem into its components.'
    });

    if (op === '+') result = a + b;
    else if (op === '-') result = a - b;
    else if (op === '*' || op === '×') result = a * b;
    else if (op === '/' || op === '÷') {
      if (b === 0) {
        steps.push({
          step: 2,
          title: es ? 'Division por cero' : 'Division by zero',
          content: es ? 'No se puede dividir por cero.' : 'Cannot divide by zero.',
          hint: es ? 'La division por cero no esta definida.' : 'Division by zero is undefined.'
        });
        final_answer = es ? 'Indefinido' : 'Undefined';
        explanation = es ? 'La division por cero no esta definida en matematicas.' : 'Division by zero is undefined in mathematics.';
        return { steps, final_answer, explanation, subject };
      }
      result = a / b;
    } else if (op === '^') result = Math.pow(a, b);

    result = Math.round(result * 10000) / 10000;

    // Show work for multiplication/division
    if ((op === '*' || op === '×') && a > 10 && b > 10) {
      steps.push({
        step: 2,
        title: es ? 'Descomponer' : 'Break it down',
        content: `${a} × ${b} = ${a} × ${Math.floor(b / 10) * 10} + ${a} × ${b % 10} = ${a * Math.floor(b / 10) * 10} + ${a * (b % 10)}`,
        hint: es ? 'Descomponer numeros grandes facilita el calculo.' : 'Breaking down large numbers makes calculation easier.'
      });
    }

    steps.push({
      step: (op === '*' || op === '×') && a > 10 && b > 10 ? 3 : 2,
      title: es ? 'Calcular' : 'Calculate',
      content: `${a} ${op} ${b} = ${result}`,
      hint: es ? 'Aplicar la operacion directamente.' : 'Apply the operation directly.'
    });

    final_answer = String(result);
    explanation = es
      ? `Operacion aritmetica simple: ${opName.toLowerCase()} de ${a} y ${b}.`
      : `Simple arithmetic: ${opName.toLowerCase()} of ${a} and ${b}.`;
    return { steps, final_answer, explanation, subject };
  }

  // ── Percentage: what is X% of Y ──
  const pctMatch = p.match(/(?:what\s+is\s+|cual\s+es\s+el?\s+)?(\d+\.?\d*)\s*%\s*(?:of|de)\s+(\d+\.?\d*)/i);
  if (pctMatch) {
    const pct = parseFloat(pctMatch[1]);
    const total = parseFloat(pctMatch[2]);
    const result = Math.round((pct / 100) * total * 10000) / 10000;

    steps.push({
      step: 1,
      title: es ? 'Identificar' : 'Identify',
      content: es ? `Encontrar el ${pct}% de ${total}` : `Find ${pct}% of ${total}`,
      hint: es ? 'Porcentaje significa "por cada cien".' : 'Percent means "per hundred".'
    });
    steps.push({
      step: 2,
      title: es ? 'Convertir porcentaje a decimal' : 'Convert percentage to decimal',
      content: `${pct}% = ${pct} / 100 = ${pct / 100}`,
      hint: es ? 'Dividir por 100 convierte porcentaje a decimal.' : 'Dividing by 100 converts percent to decimal.'
    });
    steps.push({
      step: 3,
      title: es ? 'Multiplicar' : 'Multiply',
      content: `${pct / 100} × ${total} = ${result}`,
      hint: es ? 'Multiplicar el decimal por el numero total.' : 'Multiply the decimal by the total number.'
    });

    final_answer = String(result);
    explanation = es
      ? `Para encontrar un porcentaje, divide el porcentaje por 100 y multiplica por el numero total.`
      : `To find a percentage, divide the percent by 100 and multiply by the total number.`;
    return { steps, final_answer, explanation, subject };
  }

  // ── Square root ──
  const sqrtMatch = p.match(/(?:sqrt|raiz|√)\s*\(?\s*(\d+\.?\d*)\s*\)?/i);
  if (sqrtMatch) {
    const n = parseFloat(sqrtMatch[1]);
    const result = Math.round(Math.sqrt(n) * 10000) / 10000;
    const isPerfect = result === Math.floor(result);

    steps.push({
      step: 1,
      title: es ? 'Identificar' : 'Identify',
      content: `√${n}`,
      hint: es ? 'Buscar un numero que multiplicado por si mismo de ' + n : 'Find a number that when multiplied by itself gives ' + n
    });
    if (isPerfect) {
      steps.push({
        step: 2,
        title: es ? 'Raiz cuadrada perfecta' : 'Perfect square',
        content: `${result} × ${result} = ${n}  →  √${n} = ${result}`,
        hint: es ? `${n} es un cuadrado perfecto.` : `${n} is a perfect square.`
      });
    } else {
      steps.push({
        step: 2,
        title: es ? 'Calcular' : 'Calculate',
        content: `√${n} ≈ ${result}`,
        hint: es ? `${n} no es un cuadrado perfecto, el resultado es irracional.` : `${n} is not a perfect square, the result is irrational.`
      });
    }

    final_answer = isPerfect ? String(result) : `≈ ${result}`;
    explanation = es
      ? `La raiz cuadrada de ${n} es el numero que multiplicado por si mismo da ${n}.`
      : `The square root of ${n} is the number that when multiplied by itself gives ${n}.`;
    return { steps, final_answer, explanation, subject };
  }

  // ── Fallback: generic problem-solving guide ──
  steps.push({
    step: 1,
    title: es ? 'Comprender el problema' : 'Understand the problem',
    content: es ? `Problema: ${p}` : `Problem: ${p}`,
    hint: es ? 'Lee con cuidado e identifica que se pide.' : 'Read carefully and identify what is being asked.'
  });
  steps.push({
    step: 2,
    title: es ? 'Identificar informacion clave' : 'Identify key information',
    content: es ? 'Extrae los valores conocidos, variables y relaciones del problema.' : 'Extract the known values, variables, and relationships from the problem.',
    hint: es ? 'Escribe lo que sabes y lo que necesitas encontrar.' : 'Write down what you know and what you need to find.'
  });
  steps.push({
    step: 3,
    title: es ? 'Elegir una estrategia' : 'Choose a strategy',
    content: es ? 'Selecciona la formula, metodo o enfoque apropiado.' : 'Select the appropriate formula, method, or approach.',
    hint: es ? 'Piensa en problemas similares que hayas resuelto antes.' : 'Think about similar problems you have solved before.'
  });
  steps.push({
    step: 4,
    title: es ? 'Resolver paso a paso' : 'Solve step by step',
    content: es ? 'Aplica tu metodo elegido mostrando cada calculo.' : 'Apply your chosen method, showing each calculation clearly.',
    hint: es ? 'Toma un paso a la vez y verifica cada calculo.' : 'Take it one step at a time and double-check each calculation.'
  });

  final_answer = es ? 'Ver solucion paso a paso arriba' : 'See step-by-step solution above';
  explanation = es
    ? 'Este problema requiere analisis cuidadoso. Sigue los pasos descritos arriba.'
    : 'This problem requires careful analysis. Follow the steps outlined above.';
  return { steps, final_answer, explanation, subject };
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
      if (!problem || problem.trim().length < 2) {
        return res.status(400).json({ error: 'Problem too short' });
      }
      const result = solveMath(problem.trim(), language || 'en');
      const { data, error } = await supabase
        .from('solved_problems')
        .insert({
          problem: problem.trim(),
          language: language || 'en',
          subject: result.subject,
          steps: result.steps,
          final_answer: result.final_answer,
          explanation: result.explanation
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Solver error:', err);
    res.status(500).json({ error: err.message });
  }
}

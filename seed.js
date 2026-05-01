import supabase from './_supabase.js';

const seedData = [
  {
    topic: 'Photosynthesis',
    language: 'en',
    flashcards: [
      { front: 'What is photosynthesis?', back: 'The process by which green plants convert sunlight, water, and CO2 into glucose and oxygen.' },
      { front: 'Where does photosynthesis occur?', back: 'In the chloroplasts of plant cells, specifically in structures containing chlorophyll.' },
      { front: 'What is chlorophyll?', back: 'A green pigment in plants that absorbs light energy from the red and blue wavelengths.' },
      { front: 'What are the two stages?', back: 'Light-dependent reactions in thylakoids and the Calvin cycle in stroma.' },
      { front: 'What is RuBisCO?', back: 'The enzyme that fixes CO2 in the Calvin cycle. It is the most abundant protein on Earth.' },
      { front: 'What is photolysis?', back: 'The splitting of water molecules by light energy during the light-dependent reactions, producing O2.' },
    ],
    quizzes: [
      { question: 'Which organelle is responsible for photosynthesis?', options: ['Mitochondria', 'Chloroplast', 'Ribosome', 'Nucleus'], answer: 1 },
      { question: 'What gas is released as a byproduct?', options: ['Carbon dioxide', 'Nitrogen', 'Oxygen', 'Hydrogen'], answer: 2 },
      { question: 'Which enzyme fixes CO2 in the Calvin cycle?', options: ['ATP synthase', 'Helicase', 'RuBisCO', 'DNA polymerase'], answer: 2 },
      { question: 'The Calvin cycle occurs where?', options: ['Thylakoid membrane', 'Outer membrane', 'Stroma', 'Inner membrane'], answer: 2 },
    ],
    fill_blanks: [
      { sentence: 'Photosynthesis converts _____ energy into chemical energy.', answer: 'light' },
      { sentence: 'The green pigment _____ absorbs light energy.', answer: 'chlorophyll' },
      { sentence: 'The enzyme _____ fixes CO2 in the Calvin cycle.', answer: 'RuBisCO' },
      { sentence: 'Plants release _____ as a byproduct.', answer: 'oxygen' },
    ],
    key_concepts: ['Light-dependent reactions', 'Calvin cycle', 'Chlorophyll absorption', 'Carbon fixation by RuBisCO', 'Photolysis of water'],
    study_notes: [
      { title: 'Overview', content: 'Photosynthesis is the process plants, algae, and some bacteria use to convert light energy into chemical energy stored in glucose. It occurs primarily in the chloroplasts and is essential for life on Earth, producing the oxygen we breathe.' },
      { title: 'Light-Dependent Reactions', content: 'These reactions occur in the thylakoid membranes. Light energy is captured by chlorophyll and used to split water molecules (photolysis), releasing oxygen. The energy is used to generate ATP and NADPH, which power the Calvin cycle.' },
      { title: 'The Calvin Cycle', content: 'Taking place in the stroma, the Calvin cycle uses ATP and NADPH from the light reactions to fix CO2 into organic molecules. The enzyme RuBisCO catalyzes the first step. The product G3P is used to build glucose.' },
      { title: 'Factors Affecting Rate', content: 'Light intensity, CO2 concentration, temperature, and water availability all influence the rate of photosynthesis. At very high temperatures, enzymes like RuBisCO denature. The concept of limiting factors means the slowest factor controls the overall rate.' },
    ],
  },
  {
    topic: 'Sistema Solar',
    language: 'es',
    flashcards: [
      { front: 'Cuantos planetas hay en nuestro sistema solar?', back: 'Ocho: Mercurio, Venus, Tierra, Marte, Jupiter, Saturno, Urano y Neptuno.' },
      { front: 'Cual es el planeta mas grande?', back: 'Jupiter, tiene una masa mas del doble que todos los demas planetas combinados.' },
      { front: 'Que es el cinturon de asteroides?', back: 'Una region entre Marte y Jupiter que contiene millones de objetos rocosos orbitando el Sol.' },
      { front: 'Que causa las estaciones en la Tierra?', back: 'La inclinacion del eje terrestre de 23.5 grados respecto al plano orbital.' },
      { front: 'Por que Venus es el planeta mas caliente?', back: 'Su gruesa atmosfera de CO2 crea un efecto invernadero extremo, elevando la temperatura a unos 465 grados C.' },
      { front: 'Que es el Cinturon de Kuiper?', back: 'Una region mas alla de Neptuno que contiene cuerpos helados y planetas enanos como Pluton.' },
    ],
    quizzes: [
      { question: 'Que planeta esta mas cerca del Sol?', options: ['Venus', 'Mercurio', 'Marte', 'Tierra'], answer: 1 },
      { question: 'Que planeta es conocido como el Planeta Rojo?', options: ['Jupiter', 'Saturno', 'Marte', 'Venus'], answer: 2 },
      { question: 'Que planeta rota de lado?', options: ['Neptuno', 'Saturno', 'Urano', 'Jupiter'], answer: 2 },
      { question: 'Que causa las estaciones en la Tierra?', options: ['Distancia al Sol', 'Inclinacion axial', 'Gravedad lunar', 'Erupciones solares'], answer: 1 },
    ],
    fill_blanks: [
      { sentence: 'El _____ es la estrella en el centro de nuestro sistema solar.', answer: 'Sol' },
      { sentence: 'Jupiter se clasifica como un gigante _____.', answer: 'gaseoso' },
      { sentence: 'El cinturon de asteroides se encuentra entre _____ y Jupiter.', answer: 'Marte' },
      { sentence: 'Pluton fue reclasificado como planeta _____ en 2006.', answer: 'enano' },
    ],
    key_concepts: ['Planetas interiores vs. exteriores', 'Gigantes gaseosos', 'Cinturon de Kuiper', 'Inclinacion axial y estaciones', 'Efecto invernadero'],
    study_notes: [
      { title: 'Formacion', content: 'El sistema solar se formo hace unos 4,600 millones de anos a partir de una nube molecular gigante (nebulosa solar). La gravedad hizo que la nube colapsara, formando el Sol en el centro. El material restante formo planetas, lunas, asteroides y cometas.' },
      { title: 'Planetas Interiores', content: 'Mercurio, Venus, Tierra y Marte son planetas pequenos y rocosos. Venus tiene una atmosfera aplastante de CO2 y es el planeta mas caliente. La Tierra es el unico con agua liquida y vida conocida. Marte tiene evidencia de agua antigua.' },
      { title: 'Planetas Exteriores', content: 'Jupiter y Saturno son gigantes gaseosos de hidrogeno y helio. Urano y Neptuno son gigantes de hielo. La Gran Mancha Roja de Jupiter es una tormenta mas grande que la Tierra. Los anillos de Saturno son los mas espectaculares.' },
      { title: 'Exploracion', content: 'Misiones roboticas han visitado cada planeta. Voyager 1 y 2 estan en el espacio interestelar. Los rovers de Marte estudian la superficie marciana. El telescopio James Webb estudia exoplanetas y objetos distantes.' },
    ],
  },
  {
    topic: 'World War 2',
    language: 'en',
    flashcards: [
      { front: 'When did WWII begin and end?', back: 'It began September 1, 1939 (Germany invaded Poland) and ended September 2, 1945 (Japan surrendered).' },
      { front: 'What were the two main alliances?', back: 'The Allies (USA, UK, Soviet Union, France, China) and the Axis Powers (Germany, Italy, Japan).' },
      { front: 'What was D-Day?', back: 'June 6, 1944 — the Allied invasion of Normandy, France. The largest seaborne invasion in history.' },
      { front: 'What was the Battle of Stalingrad?', back: 'A major battle (1942-1943) where the Soviet Union defeated Germany, marking a turning point on the Eastern Front.' },
      { front: 'What was the Manhattan Project?', back: 'A secret U.S. research program that developed the first nuclear weapons, led by J. Robert Oppenheimer.' },
      { front: 'What were the Nuremberg Trials?', back: 'Post-war tribunals (1945-1946) that prosecuted Nazi leaders for war crimes and crimes against humanity.' },
    ],
    quizzes: [
      { question: 'Which country was invaded to start WWII?', options: ['France', 'Poland', 'Austria', 'Czechoslovakia'], answer: 1 },
      { question: 'What year did the USA enter WWII?', options: ['1939', '1940', '1941', '1942'], answer: 2 },
      { question: 'What was the Manhattan Project?', options: ['A spy network', 'A nuclear weapons program', 'An invasion plan', 'A propaganda campaign'], answer: 1 },
      { question: 'Which battle was the turning point in the Pacific?', options: ['Battle of the Bulge', 'Battle of Midway', 'Battle of Britain', 'Battle of Iwo Jima'], answer: 1 },
    ],
    fill_blanks: [
      { sentence: 'WWII began in _____ when Germany invaded Poland.', answer: '1939' },
      { sentence: 'The attack on _____ brought the US into the war.', answer: 'Pearl Harbor' },
      { sentence: 'The _____ Project developed the first nuclear weapons.', answer: 'Manhattan' },
      { sentence: 'The _____ Trials prosecuted Nazi leaders for war crimes.', answer: 'Nuremberg' },
    ],
    key_concepts: ['Causes and Treaty of Versailles', 'Blitzkrieg tactics', 'The Holocaust', 'Pearl Harbor', 'D-Day', 'Manhattan Project'],
    study_notes: [
      { title: 'Causes of the War', content: 'WWII arose from unresolved tensions after WWI, the harsh Treaty of Versailles, the Great Depression, the rise of fascism in Germany and Italy, and Japanese expansionism in Asia. Appeasement policies failed to contain Hitler until the invasion of Poland triggered declarations of war.' },
      { title: 'Major Theaters', content: 'The war was fought across multiple theaters: the European Theater (Western and Eastern Fronts), the Pacific Theater, North Africa, and Southeast Asia. The Eastern Front between Germany and the Soviet Union saw the largest and deadliest battles.' },
      { title: 'Turning Points', content: 'Key turning points include the Battle of Stalingrad (1942-43), the Battle of Midway (1942), D-Day (June 1944), and the Battle of the Bulge (1944-45). Each shifted momentum decisively toward the Allies.' },
      { title: 'Aftermath and Legacy', content: 'WWII resulted in an estimated 70-85 million deaths. It led to the creation of the United Nations, the Nuremberg Trials, the beginning of the Cold War, decolonization movements, and the Marshall Plan to rebuild Europe.' },
    ],
  },
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    for (const item of seedData) {
      const { error } = await supabase
        .from('study_sets_v2')
        .insert(item);
      if (error) throw error;
    }
    return res.status(200).json({ ok: true, message: 'Seeded 3 study sets with study notes' });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ error: err.message });
  }
}

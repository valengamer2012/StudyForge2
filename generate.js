import supabase from './_supabase.js';

// ─── UTILITIES ──────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function pick(arr, n) { return shuffle(arr).slice(0, n); }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// ─── FACT DATABASE ──────────────────────────────────────────
// Each fact is an atomic piece of knowledge with:
//   term, definition, category, related[], distractors[]
// From these we dynamically build flashcards, quizzes, fill-blanks, etc.

const factsDB = {
  en: {
    'photosynthesis': [
      { term: 'photosynthesis', def: 'the process by which plants convert light energy, water, and carbon dioxide into glucose and oxygen', cat: 'process', blank: 'The process of _____ allows plants to make their own food.', distractors: ['respiration','fermentation','transpiration'] },
      { term: 'chloroplast', def: 'the organelle in plant cells where photosynthesis takes place', cat: 'structure', blank: 'Photosynthesis occurs inside the _____, an organelle found in plant cells.', distractors: ['mitochondria','nucleus','ribosome'] },
      { term: 'chlorophyll', def: 'the green pigment that captures light energy, absorbing red and blue wavelengths while reflecting green', cat: 'molecule', blank: 'The pigment _____ gives plants their green color by reflecting green light.', distractors: ['melanin','hemoglobin','carotene'] },
      { term: 'thylakoid', def: 'membrane-bound compartments inside chloroplasts where the light-dependent reactions occur', cat: 'structure', blank: 'Light-dependent reactions happen in the _____ membranes of the chloroplast.', distractors: ['stroma','cytoplasm','nucleus'] },
      { term: 'stroma', def: 'the fluid-filled space surrounding thylakoids where the Calvin cycle takes place', cat: 'structure', blank: 'The Calvin cycle takes place in the _____ of the chloroplast.', distractors: ['thylakoid','cytoplasm','vacuole'] },
      { term: 'Calvin cycle', def: 'a series of reactions in the stroma that use CO2, ATP, and NADPH to produce G3P (a sugar precursor)', cat: 'process', blank: 'The _____ uses CO2 and energy carriers to build sugar molecules.', distractors: ['Krebs cycle','electron transport chain','glycolysis'] },
      { term: 'light-dependent reactions', def: 'reactions in the thylakoid membranes that use light to split water, producing ATP, NADPH, and oxygen', cat: 'process', blank: 'The _____ use sunlight to split water and generate ATP and NADPH.', distractors: ['Calvin cycle','glycolysis','fermentation'] },
      { term: 'photolysis', def: 'the splitting of water molecules by light energy during the light-dependent reactions, releasing oxygen', cat: 'process', blank: 'The splitting of water by light energy is called _____.', distractors: ['hydrolysis','electrolysis','glycolysis'] },
      { term: 'RuBisCO', def: 'the enzyme that catalyzes carbon fixation in the Calvin cycle, the most abundant protein on Earth', cat: 'molecule', blank: 'The enzyme _____ fixes carbon dioxide during the Calvin cycle.', distractors: ['ATP synthase','helicase','amylase'] },
      { term: 'carbon fixation', def: 'the process of incorporating CO2 into organic molecules during the Calvin cycle', cat: 'process', blank: 'During _____, CO2 is converted into organic molecules in the Calvin cycle.', distractors: ['photolysis','transpiration','nitrogen fixation'] },
      { term: 'ATP', def: 'adenosine triphosphate, the primary energy currency produced during the light reactions and used in the Calvin cycle', cat: 'molecule', blank: '_____ is the energy currency molecule produced during the light reactions.', distractors: ['ADP','NADPH','glucose'] },
      { term: 'NADPH', def: 'an electron carrier produced in the light reactions that provides reducing power for the Calvin cycle', cat: 'molecule', blank: '_____ carries high-energy electrons from the light reactions to the Calvin cycle.', distractors: ['NADH','FADH2','ATP'] },
      { term: 'oxygen', def: 'a byproduct of photosynthesis released when water molecules are split during the light reactions', cat: 'molecule', blank: '_____ is released as a byproduct when water is split during photosynthesis.', distractors: ['carbon dioxide','nitrogen','hydrogen'] },
      { term: 'glucose', def: 'the simple sugar (C6H12O6) that is the primary product of photosynthesis, used for energy storage', cat: 'molecule', blank: 'The primary sugar produced by photosynthesis is _____.', distractors: ['fructose','sucrose','starch'] },
      { term: 'C4 plants', def: 'plants like corn and sugarcane that use a 4-carbon compound to concentrate CO2 and reduce photorespiration in hot climates', cat: 'organism', blank: '_____ use a special pathway to concentrate CO2 and thrive in hot environments.', distractors: ['C3 plants','CAM plants','aquatic plants'] },
      { term: 'CAM plants', def: 'plants like cacti that open stomata at night to fix CO2, conserving water in arid environments', cat: 'organism', blank: '_____ open their stomata at night to conserve water in desert conditions.', distractors: ['C3 plants','C4 plants','epiphytes'] },
      { term: 'stomata', def: 'tiny pores on leaf surfaces that open and close to regulate gas exchange and water loss', cat: 'structure', blank: 'Gas exchange in leaves occurs through tiny pores called _____.', distractors: ['lenticels','root hairs','guard cells'] },
      { term: 'electron transport chain', def: 'a series of protein complexes in the thylakoid membrane that transfer electrons and pump H+ ions to generate ATP', cat: 'process', blank: 'The _____ in the thylakoid membrane transfers electrons to generate ATP.', distractors: ['Calvin cycle','Krebs cycle','glycolysis'] },
      { term: 'photorespiration', def: 'a wasteful process where RuBisCO fixes oxygen instead of CO2, reducing photosynthetic efficiency in hot conditions', cat: 'process', blank: '_____ occurs when RuBisCO mistakenly fixes oxygen instead of CO2.', distractors: ['photolysis','carbon fixation','transpiration'] },
      { term: 'accessory pigments', def: 'pigments like carotenoids and phycobilins that absorb wavelengths chlorophyll cannot, broadening light capture', cat: 'molecule', blank: '_____ help plants capture light wavelengths that chlorophyll alone cannot absorb.', distractors: ['chlorophyll a','chlorophyll b','melanin'] },
    ],
    'world war 2': [
      { term: '1939', def: 'the year World War II began in Europe when Germany invaded Poland on September 1st', cat: 'date', blank: 'World War II began in _____ with Germany\'s invasion of Poland.', distractors: ['1938','1940','1941'] },
      { term: '1945', def: 'the year World War II ended, with Germany surrendering in May and Japan in September', cat: 'date', blank: 'World War II ended in _____ after both Germany and Japan surrendered.', distractors: ['1944','1946','1943'] },
      { term: 'Allied Powers', def: 'the coalition led by the USA, UK, Soviet Union, France, and China that fought against the Axis', cat: 'alliance', blank: 'The _____ included the USA, UK, Soviet Union, and other nations fighting the Axis.', distractors: ['Axis Powers','Central Powers','Triple Alliance'] },
      { term: 'Axis Powers', def: 'the military alliance of Germany, Italy, and Japan during World War II', cat: 'alliance', blank: 'The _____ consisted of Germany, Italy, and Japan.', distractors: ['Allied Powers','NATO','Central Powers'] },
      { term: 'Pearl Harbor', def: 'the surprise Japanese attack on the US naval base in Hawaii on December 7, 1941, bringing America into the war', cat: 'event', blank: 'The attack on _____ in December 1941 brought the United States into World War II.', distractors: ['Midway','Guam','Manila'] },
      { term: 'D-Day', def: 'June 6, 1944 — the Allied invasion of Normandy, France, the largest amphibious military operation in history', cat: 'event', blank: '_____ was the code name for the massive Allied invasion of Normandy on June 6, 1944.', distractors: ['V-E Day','Operation Barbarossa','Battle of the Bulge'] },
      { term: 'Holocaust', def: 'the systematic genocide of approximately six million Jews and millions of others by Nazi Germany', cat: 'event', blank: 'The _____ was the systematic murder of millions by the Nazi regime.', distractors: ['Blitz','Kristallnacht','Anschluss'] },
      { term: 'Blitzkrieg', def: 'a German military tactic meaning "lightning war" using fast, concentrated attacks with tanks and aircraft', cat: 'tactic', blank: 'Germany\'s _____ tactic used rapid, coordinated strikes with tanks and planes.', distractors: ['trench warfare','guerrilla warfare','attrition'] },
      { term: 'Battle of Stalingrad', def: 'a major 1942-1943 battle where the Soviet Union defeated Germany, a key turning point on the Eastern Front', cat: 'event', blank: 'The _____ was a decisive Soviet victory that turned the tide on the Eastern Front.', distractors: ['Battle of Kursk','Battle of Berlin','Siege of Leningrad'] },
      { term: 'Battle of Midway', def: 'a 1942 naval battle where the US decisively defeated Japan, turning the tide in the Pacific Theater', cat: 'event', blank: 'The _____ was a pivotal US naval victory that shifted momentum in the Pacific.', distractors: ['Battle of Coral Sea','Battle of Guadalcanal','Battle of Iwo Jima'] },
      { term: 'Manhattan Project', def: 'the secret American research program that developed the first nuclear weapons, led by J. Robert Oppenheimer', cat: 'event', blank: 'The _____ was the top-secret program that produced the first atomic bombs.', distractors: ['Operation Overlord','Lend-Lease Act','Marshall Plan'] },
      { term: 'Hiroshima', def: 'the Japanese city where the first atomic bomb was dropped on August 6, 1945', cat: 'place', blank: 'The first atomic bomb was dropped on _____ on August 6, 1945.', distractors: ['Nagasaki','Tokyo','Osaka'] },
      { term: 'Nagasaki', def: 'the Japanese city where the second atomic bomb was dropped on August 9, 1945, leading to Japan\'s surrender', cat: 'place', blank: 'A second atomic bomb was dropped on _____ on August 9, 1945.', distractors: ['Hiroshima','Kyoto','Yokohama'] },
      { term: 'Nuremberg Trials', def: 'post-war military tribunals (1945-1946) that prosecuted Nazi leaders for war crimes and crimes against humanity', cat: 'event', blank: 'The _____ held Nazi leaders accountable for war crimes after the war.', distractors: ['Geneva Convention','Potsdam Conference','Yalta Conference'] },
      { term: 'Winston Churchill', def: 'the Prime Minister of the United Kingdom during most of World War II, known for inspiring British resistance', cat: 'person', blank: '_____ served as Britain\'s Prime Minister and rallied the nation during the war.', distractors: ['Neville Chamberlain','Charles de Gaulle','Clement Attlee'] },
      { term: 'Adolf Hitler', def: 'the dictator of Nazi Germany who initiated World War II and orchestrated the Holocaust', cat: 'person', blank: '_____ was the Nazi dictator whose aggression triggered World War II.', distractors: ['Mussolini','Stalin','Hirohito'] },
      { term: 'Franklin D. Roosevelt', def: 'the US President during most of WWII who led America through the war until his death in April 1945', cat: 'person', blank: '_____ was the American president who guided the US through most of World War II.', distractors: ['Harry Truman','Dwight Eisenhower','Herbert Hoover'] },
      { term: 'Operation Overlord', def: 'the code name for the Allied invasion of Normandy (D-Day) on June 6, 1944', cat: 'event', blank: '_____ was the military code name for the D-Day invasion of Normandy.', distractors: ['Operation Barbarossa','Operation Market Garden','Operation Torch'] },
      { term: 'V-E Day', def: 'Victory in Europe Day, May 8, 1945, when Nazi Germany unconditionally surrendered to the Allies', cat: 'date', blank: '_____ on May 8, 1945 marked Germany\'s unconditional surrender.', distractors: ['V-J Day','D-Day','Armistice Day'] },
      { term: 'United Nations', def: 'the international organization founded in 1945 after WWII to promote peace and prevent future conflicts', cat: 'organization', blank: 'The _____ was established after WWII to maintain international peace and security.', distractors: ['League of Nations','NATO','Warsaw Pact'] },
    ],
    'solar system': [
      { term: 'Sun', def: 'the star at the center of our solar system, containing 99.86% of the system\'s total mass', cat: 'star', blank: 'The _____ is the star at the center of our solar system.', distractors: ['Moon','Jupiter','Polaris'] },
      { term: 'Mercury', def: 'the smallest planet and closest to the Sun, with no atmosphere and extreme temperature swings', cat: 'planet', blank: '_____ is the smallest planet and closest to the Sun.', distractors: ['Venus','Mars','Pluto'] },
      { term: 'Venus', def: 'the hottest planet due to its thick CO2 atmosphere creating a runaway greenhouse effect, with surface temps around 465°C', cat: 'planet', blank: '_____ is the hottest planet because of its extreme greenhouse effect.', distractors: ['Mercury','Mars','Jupiter'] },
      { term: 'Earth', def: 'the third planet from the Sun and the only known planet with liquid water on its surface and life', cat: 'planet', blank: '_____ is the only planet known to support life and have liquid surface water.', distractors: ['Mars','Venus','Europa'] },
      { term: 'Mars', def: 'the fourth planet, known as the Red Planet due to iron oxide on its surface, with polar ice caps and ancient riverbeds', cat: 'planet', blank: '_____ is called the Red Planet because of iron oxide on its surface.', distractors: ['Venus','Mercury','Jupiter'] },
      { term: 'Jupiter', def: 'the largest planet in the solar system, a gas giant with a mass greater than all other planets combined', cat: 'planet', blank: '_____ is the largest planet, with more mass than all other planets combined.', distractors: ['Saturn','Neptune','Uranus'] },
      { term: 'Saturn', def: 'the sixth planet, famous for its spectacular ring system made of ice and rock particles, with over 140 moons', cat: 'planet', blank: '_____ is famous for its prominent ring system and has over 140 moons.', distractors: ['Jupiter','Uranus','Neptune'] },
      { term: 'Uranus', def: 'an ice giant that rotates on its side with an axial tilt of about 98 degrees', cat: 'planet', blank: '_____ is unique because it rotates on its side with a 98-degree tilt.', distractors: ['Neptune','Saturn','Pluto'] },
      { term: 'Neptune', def: 'the eighth and farthest planet, an ice giant with the strongest winds in the solar system', cat: 'planet', blank: '_____ is the farthest planet and has the strongest winds in the solar system.', distractors: ['Uranus','Saturn','Pluto'] },
      { term: 'asteroid belt', def: 'a region between Mars and Jupiter containing millions of rocky objects left over from the solar system\'s formation', cat: 'region', blank: 'The _____ lies between Mars and Jupiter and contains millions of rocky objects.', distractors: ['Kuiper Belt','Oort Cloud','Van Allen Belt'] },
      { term: 'Kuiper Belt', def: 'a region beyond Neptune containing icy bodies and dwarf planets like Pluto, Eris, and Makemake', cat: 'region', blank: 'The _____ is a region of icy bodies beyond Neptune, home to Pluto.', distractors: ['asteroid belt','Oort Cloud','heliosphere'] },
      { term: 'Pluto', def: 'a dwarf planet in the Kuiper Belt, reclassified from planet status by the IAU in 2006', cat: 'dwarf planet', blank: '_____ was reclassified as a dwarf planet in 2006 by the IAU.', distractors: ['Ceres','Eris','Charon'] },
      { term: 'Great Red Spot', def: 'a massive persistent anticyclonic storm on Jupiter that is larger than Earth and has been observed for over 350 years', cat: 'feature', blank: 'Jupiter\'s _____ is a giant storm larger than Earth that has raged for centuries.', distractors: ['Great Dark Spot','Olympus Mons','Valles Marineris'] },
      { term: 'AU (Astronomical Unit)', def: 'the average distance from Earth to the Sun, about 150 million kilometers, used to measure distances in the solar system', cat: 'measurement', blank: 'One _____ equals the average distance from Earth to the Sun, about 150 million km.', distractors: ['light-year','parsec','kilometer'] },
      { term: '23.5 degrees', def: 'Earth\'s axial tilt relative to its orbital plane, which causes the seasons', cat: 'measurement', blank: 'Earth\'s axial tilt of _____ is responsible for the changing seasons.', distractors: ['45 degrees','10 degrees','90 degrees'] },
      { term: 'Oort Cloud', def: 'a theoretical spherical shell of icy objects at the extreme edge of the solar system, source of long-period comets', cat: 'region', blank: 'The _____ is a distant shell of icy objects thought to be the source of long-period comets.', distractors: ['Kuiper Belt','asteroid belt','heliosphere'] },
      { term: 'terrestrial planets', def: 'the four inner rocky planets: Mercury, Venus, Earth, and Mars', cat: 'category', blank: 'Mercury, Venus, Earth, and Mars are called _____ because they have solid rocky surfaces.', distractors: ['gas giants','ice giants','dwarf planets'] },
      { term: 'gas giants', def: 'Jupiter and Saturn, massive planets composed primarily of hydrogen and helium', cat: 'category', blank: 'Jupiter and Saturn are classified as _____ because they are made mostly of hydrogen and helium.', distractors: ['ice giants','terrestrial planets','dwarf planets'] },
    ],
  },
  es: {
    'fotosintesis': [
      { term: 'fotosintesis', def: 'el proceso por el cual las plantas convierten la energia luminosa, el agua y el CO2 en glucosa y oxigeno', cat: 'proceso', blank: 'El proceso de _____ permite a las plantas producir su propio alimento.', distractors: ['respiracion','fermentacion','transpiracion'] },
      { term: 'cloroplasto', def: 'el organulo en las celulas vegetales donde ocurre la fotosintesis', cat: 'estructura', blank: 'La fotosintesis ocurre dentro del _____, un organulo de las celulas vegetales.', distractors: ['mitocondria','nucleo','ribosoma'] },
      { term: 'clorofila', def: 'el pigmento verde que captura energia luminosa, absorbiendo longitudes de onda roja y azul', cat: 'molecula', blank: 'El pigmento _____ da a las plantas su color verde al reflejar la luz verde.', distractors: ['melanina','hemoglobina','caroteno'] },
      { term: 'tilacoide', def: 'compartimentos dentro del cloroplasto donde ocurren las reacciones dependientes de la luz', cat: 'estructura', blank: 'Las reacciones luminosas ocurren en las membranas de los _____.', distractors: ['estroma','citoplasma','nucleo'] },
      { term: 'estroma', def: 'el espacio lleno de fluido que rodea los tilacoides donde ocurre el ciclo de Calvin', cat: 'estructura', blank: 'El ciclo de Calvin tiene lugar en el _____ del cloroplasto.', distractors: ['tilacoide','citoplasma','vacuola'] },
      { term: 'ciclo de Calvin', def: 'reacciones en el estroma que usan CO2, ATP y NADPH para producir G3P', cat: 'proceso', blank: 'El _____ usa CO2 y portadores de energia para construir moleculas de azucar.', distractors: ['ciclo de Krebs','cadena de transporte','glucolisis'] },
      { term: 'fotolisis', def: 'la division de moleculas de agua por energia luminosa durante las reacciones dependientes de la luz', cat: 'proceso', blank: 'La division del agua por energia luminosa se llama _____.', distractors: ['hidrolisis','electrolisis','glucolisis'] },
      { term: 'RuBisCO', def: 'la enzima que cataliza la fijacion de carbono en el ciclo de Calvin, la proteina mas abundante en la Tierra', cat: 'molecula', blank: 'La enzima _____ fija el dioxido de carbono durante el ciclo de Calvin.', distractors: ['ATP sintasa','helicasa','amilasa'] },
      { term: 'oxigeno', def: 'un subproducto de la fotosintesis liberado cuando se dividen las moleculas de agua', cat: 'molecula', blank: 'El _____ se libera como subproducto cuando se divide el agua en la fotosintesis.', distractors: ['dioxido de carbono','nitrogeno','hidrogeno'] },
      { term: 'glucosa', def: 'el azucar simple (C6H12O6) que es el producto principal de la fotosintesis', cat: 'molecula', blank: 'El azucar principal producido por la fotosintesis es la _____.', distractors: ['fructosa','sacarosa','almidon'] },
      { term: 'plantas C4', def: 'plantas como el maiz que usan un compuesto de 4 carbonos para concentrar CO2 en climas calidos', cat: 'organismo', blank: 'Las _____ usan una via especial para concentrar CO2 y prosperar en ambientes calidos.', distractors: ['plantas C3','plantas CAM','plantas acuaticas'] },
      { term: 'estomas', def: 'poros diminutos en la superficie de las hojas que regulan el intercambio de gases y la perdida de agua', cat: 'estructura', blank: 'El intercambio de gases en las hojas ocurre a traves de poros llamados _____.', distractors: ['lenticelas','pelos radicales','celulas guarda'] },
    ],
    'segunda guerra mundial': [
      { term: '1939', def: 'el ano en que comenzo la Segunda Guerra Mundial cuando Alemania invadio Polonia el 1 de septiembre', cat: 'fecha', blank: 'La Segunda Guerra Mundial comenzo en _____ con la invasion de Polonia.', distractors: ['1938','1940','1941'] },
      { term: '1945', def: 'el ano en que termino la guerra, con Alemania rindiendose en mayo y Japon en septiembre', cat: 'fecha', blank: 'La Segunda Guerra Mundial termino en _____ tras la rendicion de Alemania y Japon.', distractors: ['1944','1946','1943'] },
      { term: 'Potencias Aliadas', def: 'la coalicion liderada por EE.UU., Reino Unido, Union Sovietica, Francia y China', cat: 'alianza', blank: 'Las _____ incluian a EE.UU., Reino Unido, Union Sovietica y otras naciones.', distractors: ['Potencias del Eje','Potencias Centrales','Triple Alianza'] },
      { term: 'Potencias del Eje', def: 'la alianza militar de Alemania, Italia y Japon durante la Segunda Guerra Mundial', cat: 'alianza', blank: 'Las _____ estaban formadas por Alemania, Italia y Japon.', distractors: ['Potencias Aliadas','OTAN','Potencias Centrales'] },
      { term: 'Pearl Harbor', def: 'el ataque sorpresa japones a la base naval estadounidense en Hawai el 7 de diciembre de 1941', cat: 'evento', blank: 'El ataque a _____ en diciembre de 1941 llevo a Estados Unidos a la guerra.', distractors: ['Midway','Guam','Manila'] },
      { term: 'Dia D', def: '6 de junio de 1944, la invasion aliada de Normandia, la mayor operacion anfibia de la historia', cat: 'evento', blank: 'El _____ fue la masiva invasion aliada de Normandia el 6 de junio de 1944.', distractors: ['Dia V-E','Operacion Barbarroja','Batalla de las Ardenas'] },
      { term: 'Holocausto', def: 'el genocidio sistematico de aproximadamente seis millones de judios por la Alemania nazi', cat: 'evento', blank: 'El _____ fue el asesinato sistematico de millones por el regimen nazi.', distractors: ['Blitz','Kristallnacht','Anschluss'] },
      { term: 'Blitzkrieg', def: 'tactica militar alemana de "guerra relampago" usando ataques rapidos con tanques y aviones', cat: 'tactica', blank: 'La tactica alemana de _____ usaba ataques rapidos y coordinados con tanques y aviones.', distractors: ['guerra de trincheras','guerra de guerrillas','desgaste'] },
      { term: 'Batalla de Stalingrado', def: 'batalla de 1942-1943 donde la Union Sovietica derroto a Alemania, punto de inflexion en el Frente Oriental', cat: 'evento', blank: 'La _____ fue una victoria sovietica decisiva en el Frente Oriental.', distractors: ['Batalla de Kursk','Batalla de Berlin','Sitio de Leningrado'] },
      { term: 'Proyecto Manhattan', def: 'el programa secreto estadounidense que desarrollo las primeras armas nucleares', cat: 'evento', blank: 'El _____ fue el programa secreto que produjo las primeras bombas atomicas.', distractors: ['Operacion Overlord','Ley de Prestamo','Plan Marshall'] },
      { term: 'Hiroshima', def: 'la ciudad japonesa donde se lanzo la primera bomba atomica el 6 de agosto de 1945', cat: 'lugar', blank: 'La primera bomba atomica fue lanzada sobre _____ el 6 de agosto de 1945.', distractors: ['Nagasaki','Tokio','Osaka'] },
      { term: 'Juicios de Nuremberg', def: 'tribunales militares (1945-1946) que juzgaron a lideres nazis por crimenes de guerra', cat: 'evento', blank: 'Los _____ responsabilizaron a lideres nazis por crimenes de guerra.', distractors: ['Convencion de Ginebra','Conferencia de Potsdam','Conferencia de Yalta'] },
    ],
    'sistema solar': [
      { term: 'Sol', def: 'la estrella en el centro de nuestro sistema solar, que contiene el 99.86% de la masa total', cat: 'estrella', blank: 'El _____ es la estrella en el centro de nuestro sistema solar.', distractors: ['Luna','Jupiter','Polaris'] },
      { term: 'Mercurio', def: 'el planeta mas pequeno y cercano al Sol, sin atmosfera y con cambios extremos de temperatura', cat: 'planeta', blank: '_____ es el planeta mas pequeno y cercano al Sol.', distractors: ['Venus','Marte','Pluton'] },
      { term: 'Venus', def: 'el planeta mas caliente debido a su gruesa atmosfera de CO2 que crea un efecto invernadero extremo', cat: 'planeta', blank: '_____ es el planeta mas caliente por su extremo efecto invernadero.', distractors: ['Mercurio','Marte','Jupiter'] },
      { term: 'Marte', def: 'el cuarto planeta, conocido como el Planeta Rojo por el oxido de hierro en su superficie', cat: 'planeta', blank: '_____ es llamado el Planeta Rojo por el oxido de hierro en su superficie.', distractors: ['Venus','Mercurio','Jupiter'] },
      { term: 'Jupiter', def: 'el planeta mas grande del sistema solar, un gigante gaseoso con mas masa que todos los demas planetas juntos', cat: 'planeta', blank: '_____ es el planeta mas grande, con mas masa que todos los demas planetas juntos.', distractors: ['Saturno','Neptuno','Urano'] },
      { term: 'Saturno', def: 'el sexto planeta, famoso por su sistema de anillos de hielo y roca, con mas de 140 lunas', cat: 'planeta', blank: '_____ es famoso por sus anillos y tiene mas de 140 lunas.', distractors: ['Jupiter','Urano','Neptuno'] },
      { term: 'Urano', def: 'un gigante de hielo que rota de lado con una inclinacion axial de unos 98 grados', cat: 'planeta', blank: '_____ es unico porque rota de lado con una inclinacion de 98 grados.', distractors: ['Neptuno','Saturno','Pluton'] },
      { term: 'cinturon de asteroides', def: 'una region entre Marte y Jupiter con millones de objetos rocosos', cat: 'region', blank: 'El _____ se encuentra entre Marte y Jupiter y contiene millones de rocas.', distractors: ['Cinturon de Kuiper','Nube de Oort','cinturon de Van Allen'] },
      { term: 'Cinturon de Kuiper', def: 'una region mas alla de Neptuno con cuerpos helados y planetas enanos como Pluton', cat: 'region', blank: 'El _____ es una region de cuerpos helados mas alla de Neptuno.', distractors: ['cinturon de asteroides','Nube de Oort','heliosfera'] },
      { term: 'Pluton', def: 'un planeta enano en el Cinturon de Kuiper, reclasificado por la UAI en 2006', cat: 'planeta enano', blank: '_____ fue reclasificado como planeta enano en 2006.', distractors: ['Ceres','Eris','Caron'] },
      { term: 'Gran Mancha Roja', def: 'una tormenta anticiclonica masiva en Jupiter, mas grande que la Tierra, observada por mas de 350 anos', cat: 'caracteristica', blank: 'La _____ de Jupiter es una tormenta gigante mas grande que la Tierra.', distractors: ['Gran Mancha Oscura','Olympus Mons','Valles Marineris'] },
      { term: '23.5 grados', def: 'la inclinacion axial de la Tierra respecto a su plano orbital, que causa las estaciones', cat: 'medida', blank: 'La inclinacion axial de la Tierra de _____ es responsable de las estaciones.', distractors: ['45 grados','10 grados','90 grados'] },
    ],
  },
};

// ─── DYNAMIC CONTENT BUILDER ────────────────────────────────

// Question templates that get randomly selected
const qTemplatesEn = [
  (f) => ({ front: `What is ${f.term}?`, back: f.def.charAt(0).toUpperCase() + f.def.slice(1) + '.' }),
  (f) => ({ front: `Define ${f.term}.`, back: f.def.charAt(0).toUpperCase() + f.def.slice(1) + '.' }),
  (f) => ({ front: `Explain the role of ${f.term}.`, back: f.def.charAt(0).toUpperCase() + f.def.slice(1) + '.' }),
  (f) => ({ front: `Why is ${f.term} important?`, back: f.def.charAt(0).toUpperCase() + f.def.slice(1) + '.' }),
  (f) => ({ front: `Describe ${f.term} in your own words.`, back: f.def.charAt(0).toUpperCase() + f.def.slice(1) + '.' }),
];
const qTemplatesEs = [
  (f) => ({ front: `Que es ${f.term}?`, back: f.def.charAt(0).toUpperCase() + f.def.slice(1) + '.' }),
  (f) => ({ front: `Define ${f.term}.`, back: f.def.charAt(0).toUpperCase() + f.def.slice(1) + '.' }),
  (f) => ({ front: `Explica el papel de ${f.term}.`, back: f.def.charAt(0).toUpperCase() + f.def.slice(1) + '.' }),
  (f) => ({ front: `Por que es importante ${f.term}?`, back: f.def.charAt(0).toUpperCase() + f.def.slice(1) + '.' }),
  (f) => ({ front: `Describe ${f.term} con tus propias palabras.`, back: f.def.charAt(0).toUpperCase() + f.def.slice(1) + '.' }),
];

const quizTemplatesEn = [
  (f) => `Which of the following best describes ${f.term}?`,
  (f) => `What is ${f.term}?`,
  (f) => `${f.def.charAt(0).toUpperCase() + f.def.slice(1)}. This describes:`,
  (f) => `Which term matches this description: "${f.def.slice(0, 80)}..."?`,
];
const quizTemplatesEs = [
  (f) => `Cual de las siguientes opciones describe mejor ${f.term}?`,
  (f) => `Que es ${f.term}?`,
  (f) => `${f.def.charAt(0).toUpperCase() + f.def.slice(1)}. Esto describe:`,
  (f) => `Que termino corresponde a: "${f.def.slice(0, 80)}..."?`,
];

function buildContent(facts, lang) {
  const isEs = lang === 'es';
  const templates = isEs ? qTemplatesEs : qTemplatesEn;
  const quizTpls = isEs ? quizTemplatesEs : quizTemplatesEn;

  // FLASHCARDS: pick random facts + random question style
  const fcFacts = pick(facts, Math.min(8, facts.length));
  const flashcards = fcFacts.map(f => {
    const tpl = templates[randInt(0, templates.length - 1)];
    return tpl(f);
  });

  // QUIZZES: pick different random facts + random question style
  const qzFacts = pick(facts, Math.min(6, facts.length));
  const quizzes = qzFacts.map(f => {
    const qTpl = quizTpls[randInt(0, quizTpls.length - 1)];
    // For "this describes:" style, answer is the term; for "what is X", answer is definition-based
    const isReverse = quizTpls.indexOf(qTpl) >= 2;
    const correctAnswer = isReverse ? f.term : f.def.slice(0, 60);
    const allDistractors = f.distractors || [];
    const wrongOpts = pick(allDistractors, 3);

    if (isReverse) {
      const opts = shuffle([f.term, ...wrongOpts]);
      return { question: qTpl(f), options: opts, answer: opts.indexOf(f.term) };
    } else {
      const opts = shuffle([f.term, ...wrongOpts]);
      return { question: qTpl(f), options: opts, answer: opts.indexOf(f.term) };
    }
  });

  // FILL-IN-THE-BLANKS: pick different random facts
  const fbFacts = pick(facts.filter(f => f.blank), Math.min(5, facts.length));
  const fill_blanks = fbFacts.map(f => ({
    sentence: f.blank,
    answer: f.term,
  }));

  // KEY CONCEPTS: random subset of terms
  const kcFacts = pick(facts, Math.min(7, facts.length));
  const key_concepts = kcFacts.map(f =>
    f.term.charAt(0).toUpperCase() + f.term.slice(1)
  );

  // STUDY NOTES: group by category and build sections
  const cats = {};
  facts.forEach(f => {
    if (!cats[f.cat]) cats[f.cat] = [];
    cats[f.cat].push(f);
  });
  const study_notes = Object.entries(cats).slice(0, 5).map(([cat, catFacts]) => ({
    title: cat.charAt(0).toUpperCase() + cat.slice(1),
    content: catFacts.map(f => `${f.term.charAt(0).toUpperCase() + f.term.slice(1)}: ${f.def}.`).join('\n\n'),
  }));

  return { flashcards, quizzes, fill_blanks, key_concepts, study_notes };
}

// ─── GENERIC FALLBACK ───────────────────────────────────────

function buildGeneric(topic, lang) {
  const isEs = lang === 'es';
  const flashcards = shuffle([
    isEs ? { front: `Que es ${topic}?`, back: `${topic} es un campo de estudio que abarca multiples conceptos fundamentales.` }
         : { front: `What is ${topic}?`, back: `${topic} is a field of study encompassing multiple fundamental concepts.` },
    isEs ? { front: `Por que es importante ${topic}?`, back: `Estudiar ${topic} desarrolla una comprension profunda y habilidades practicas.` }
         : { front: `Why is ${topic} important?`, back: `Studying ${topic} develops deep understanding and practical skills.` },
    isEs ? { front: `Cuales son los conceptos clave de ${topic}?`, back: `Incluyen definiciones, principios basicos, aplicaciones y conexiones interdisciplinarias.` }
         : { front: `What are the key concepts of ${topic}?`, back: `They include definitions, basic principles, applications, and interdisciplinary connections.` },
    isEs ? { front: `Como se aplica ${topic}?`, back: `${topic} tiene aplicaciones en educacion, investigacion, industria y vida cotidiana.` }
         : { front: `How is ${topic} applied?`, back: `${topic} has applications in education, research, industry, and everyday life.` },
    isEs ? { front: `Quienes contribuyeron a ${topic}?`, back: `Diversos investigadores y expertos han contribuido al desarrollo de ${topic}.` }
         : { front: `Who contributed to ${topic}?`, back: `Various researchers and experts have contributed to the development of ${topic}.` },
    isEs ? { front: `Como ha evolucionado ${topic}?`, back: `${topic} ha evolucionado significativamente con nuevos descubrimientos y tecnologias.` }
         : { front: `How has ${topic} evolved?`, back: `${topic} has evolved significantly with new discoveries and technologies.` },
  ]).slice(0, 5);

  const quizzes = shuffle([
    { question: isEs ? `Cual es el aspecto fundamental de ${topic}?` : `What is the fundamental aspect of ${topic}?`, options: isEs ? ['Sus principios basicos','Su historia','Su popularidad','Su costo'] : ['Its basic principles','Its history','Its popularity','Its cost'], answer: 0 },
    { question: isEs ? `Como se estudia mejor ${topic}?` : `How is ${topic} best studied?`, options: isEs ? ['Solo memorizando','Practica y comprension','Solo leyendo','Sin esfuerzo'] : ['Just memorizing','Practice and understanding','Just reading','Without effort'], answer: 1 },
    { question: isEs ? `En que campos se aplica ${topic}?` : `In which fields is ${topic} applied?`, options: isEs ? ['Solo ciencias','Multiples disciplinas','Solo humanidades','Ninguno'] : ['Only sciences','Multiple disciplines','Only humanities','None'], answer: 1 },
  ]).slice(0, 3);

  const fill_blanks = shuffle([
    { sentence: isEs ? `${topic} requiere _____ y dedicacion para dominarlo.` : `${topic} requires _____ and dedication to master.`, answer: isEs ? 'practica' : 'practice' },
    { sentence: isEs ? `Los fundamentos de ${topic} se basan en _____ establecidos.` : `The fundamentals of ${topic} are based on established _____.`, answer: isEs ? 'principios' : 'principles' },
    { sentence: isEs ? `El estudio de ${topic} requiere pensamiento _____.` : `Studying ${topic} requires _____ thinking.`, answer: isEs ? 'critico' : 'critical' },
  ]);

  const key_concepts = [topic, isEs ? 'Principios basicos' : 'Basic principles', isEs ? 'Aplicaciones' : 'Applications', isEs ? 'Historia' : 'History', isEs ? 'Investigacion' : 'Research'];

  const study_notes = [
    { title: isEs ? 'Introduccion' : 'Introduction', content: isEs ? `${topic} es un area fascinante que abarca multiples conceptos interconectados. Comprender sus fundamentos es esencial.` : `${topic} is a fascinating area spanning multiple interconnected concepts. Understanding its fundamentals is essential.` },
    { title: isEs ? 'Conceptos Clave' : 'Core Concepts', content: isEs ? `Los conceptos basicos de ${topic} forman la base del conocimiento avanzado. Dominar estos fundamentos es crucial.` : `The basic concepts of ${topic} form the foundation of advanced knowledge. Mastering these fundamentals is crucial.` },
    { title: isEs ? 'Consejos de Estudio' : 'Study Tips', content: isEs ? `Usa repeticion espaciada, practica activa, y conecta conceptos nuevos con conocimiento previo. Ensenar a otros refuerza la comprension.` : `Use spaced repetition, active recall, and connect new concepts with prior knowledge. Teaching others reinforces understanding.` },
  ];

  return { flashcards, quizzes, fill_blanks, key_concepts, study_notes };
}

// ─── NOTES PARSER ───────────────────────────────────────────

function extractSentences(text) {
  return text.replace(/\n+/g, '. ').split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15 && s.length < 300);
}

function extractKeywords(text) {
  const stops = new Set(['the','a','an','is','are','was','were','be','been','have','has','had','do','does','did','will','would','could','should','and','but','or','for','so','in','on','at','to','from','by','with','about','of','up','down','that','this','it','its','they','them','their','he','she','his','her','we','our','you','your','not','no','all','each','every','both','few','more','most','other','some','than','too','very','just','also','el','la','los','las','un','una','de','del','en','con','por','para','que','es','son','fue','ser','estar','como','mas','pero','sin','sobre','entre','se','lo','le','les','nos','ya','hay','muy','todo','cada','otro','no','si']);
  const words = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 3 && !stops.has(w));
  const freq = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([w]) => w);
}

function buildFromNotes(topic, notes, lang) {
  const sentences = extractSentences(notes);
  const keywords = extractKeywords(notes);
  const isEs = lang === 'es';
  const flashcards = [];
  for (const sent of pick(sentences, 6)) {
    const words = sent.split(/\s+/);
    if (words.length < 4) continue;
    const snippet = words.slice(0, Math.min(6, Math.floor(words.length / 2))).join(' ');
    flashcards.push({
      front: isEs ? `Que puedes decir sobre: "${snippet}..."?` : `What can you say about: "${snippet}..."?`,
      back: sent + '.',
    });
  }
  const quizzes = [];
  for (const sent of pick(sentences.filter(s => keywords.some(k => s.toLowerCase().includes(k))), 4)) {
    const kw = keywords.find(k => sent.toLowerCase().includes(k));
    if (!kw) continue;
    const wrong = pick(keywords.filter(k => k !== kw), 3);
    if (wrong.length < 3) continue;
    const opts = shuffle([kw, ...wrong]);
    quizzes.push({ question: isEs ? `Que termino se relaciona con: "${sent.slice(0, 70)}..."?` : `Which term relates to: "${sent.slice(0, 70)}..."?`, options: opts, answer: opts.indexOf(kw) });
  }
  const fill_blanks = [];
  for (const sent of pick(sentences.filter(s => keywords.some(k => s.toLowerCase().includes(k))), 4)) {
    const kw = keywords.find(k => sent.toLowerCase().includes(k));
    if (!kw) continue;
    const regex = new RegExp(`\\b${kw}\\w*\\b`, 'i');
    const match = sent.match(regex);
    const orig = match ? match[0] : kw;
    const blanked = sent.replace(new RegExp(orig.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '_____');
    if (blanked !== sent) fill_blanks.push({ sentence: blanked + '.', answer: orig });
  }
  const key_concepts = keywords.slice(0, 6).map(k => k.charAt(0).toUpperCase() + k.slice(1));
  const paragraphs = notes.split(/\n{2,}/).filter(p => p.trim().length > 30);
  const sectionNames = isEs ? ['Introduccion','Desarrollo','Detalles Clave','Conceptos Avanzados','Resumen'] : ['Introduction','Main Content','Key Details','Advanced Concepts','Summary'];
  const study_notes = paragraphs.slice(0, 5).map((p, i) => ({ title: sectionNames[i] || `${isEs ? 'Seccion' : 'Section'} ${i + 1}`, content: p.trim() }));
  return { flashcards, quizzes, fill_blanks, key_concepts, study_notes };
}

// ─── HANDLER ────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { topic, language, notes } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    const lang = language || 'en';
    const topicNorm = topic.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const banks = lang === 'es' ? factsDB.es : factsDB.en;
    const facts = banks[topicNorm];

    let content;
    if (facts) {
      content = buildContent(facts, lang);
    } else {
      content = buildGeneric(topic, lang);
    }

    // If user provided notes, merge in notes-based content
    if (notes && notes.trim().length > 20) {
      const nc = buildFromNotes(topic, notes.trim(), lang);
      content.flashcards = shuffle([...nc.flashcards, ...content.flashcards]).slice(0, 8);
      content.quizzes = shuffle([...nc.quizzes, ...content.quizzes]).slice(0, 6);
      content.fill_blanks = shuffle([...nc.fill_blanks, ...content.fill_blanks]).slice(0, 5);
      content.key_concepts = [...new Set([...nc.key_concepts, ...content.key_concepts])].slice(0, 8);
      content.study_notes = [...nc.study_notes, ...content.study_notes].slice(0, 6);
    }

    const { data, error } = await supabase
      .from('study_sets_v2')
      .insert({
        topic,
        language: lang,
        flashcards: content.flashcards,
        quizzes: content.quizzes,
        fill_blanks: content.fill_blanks,
        key_concepts: content.key_concepts,
        study_notes: content.study_notes,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json(data);
  } catch (err) {
    console.error('Generate error:', err);
    res.status(500).json({ error: err.message });
  }
}

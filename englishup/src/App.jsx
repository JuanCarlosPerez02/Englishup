import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────
   STORAGE — simple, sin closures complejos.
   Usamos una ref para saber si ya cargamos.
───────────────────────────────────────────── */
const STORAGE_KEY = "englishup:v5";

async function storageLoad() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v) return JSON.parse(v);
  } catch (_) {}
  return null;
}

async function storageSave(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (_) {
    return false;
  }
}

/* ─────────────────────────────────────────────
   DATOS
───────────────────────────────────────────── */
const TEST_Q = [
  { id:1,  tipo:"Gramática",   nivel:"A2", q:"She ___ to work every day by bus.",                 ops:["go","goes","going","gone"],                             ans:1 },
  { id:2,  tipo:"Gramática",   nivel:"A2", q:"I ___ seen that movie before.",                     ops:["have","has","had","am"],                                ans:0 },
  { id:3,  tipo:"Gramática",   nivel:"A2", q:"They ___ playing football when it started to rain.",ops:["was","were","are","be"],                                ans:1 },
  { id:4,  tipo:"Gramática",   nivel:"B1", q:"If I ___ more time, I would travel more.",          ops:["have","had","will have","would have"],                   ans:1 },
  { id:5,  tipo:"Gramática",   nivel:"B1", q:"The report ___ by the manager last week.",          ops:["wrote","is written","was written","has written"],        ans:2 },
  { id:6,  tipo:"Gramática",   nivel:"B1", q:"She suggested ___ a different approach.",           ops:["try","to try","trying","tried"],                        ans:2 },
  { id:7,  tipo:"Gramática",   nivel:"B2", q:"Had I known about the meeting, I ___ earlier.",     ops:["would come","would have come","will come","came"],       ans:1 },
  { id:8,  tipo:"Gramática",   nivel:"B2", q:"Despite ___ tired, she finished the project.",      ops:["be","been","being","to be"],                            ans:2 },
  { id:9,  tipo:"Vocabulario", nivel:"A2", q:"¿Qué significa 'purchase'?",                        ops:["vender","comprar","alquilar","perder"],                 ans:1 },
  { id:10, tipo:"Vocabulario", nivel:"A2", q:"¿Cuál es el opuesto de 'ancient'?",                ops:["viejo","histórico","moderno","roto"],                   ans:2 },
  { id:11, tipo:"Vocabulario", nivel:"B1", q:"Si algo es 'mandatory', significa que es:",         ops:["opcional","prohibido","obligatorio","caro"],            ans:2 },
  { id:12, tipo:"Vocabulario", nivel:"B1", q:"She was ___ to finish on time. (muy nerviosa)",     ops:["anxious","happy","bored","confused"],                   ans:0 },
  { id:13, tipo:"Vocabulario", nivel:"B2", q:"'To mitigate' un problema significa:",              ops:["ignorarlo","empeorarlo","reducir su impacto","resolverlo por completo"], ans:2 },
  { id:14, tipo:"Vocabulario", nivel:"B2", q:"His speech was very ___; everyone was inspired.",   ops:["mundane","eloquent","vague","tedious"],                 ans:1 },
  { id:15, tipo:"Comprensión", nivel:"A2", q:'"Tom usually wakes up at 7am, but today woke up at 9am." ¿Por qué llegó tarde?', ops:["Estaba cansado","Era fin de semana","El texto no lo dice","No tenía alarma"], ans:2 },
  { id:16, tipo:"Comprensión", nivel:"B1", q:'"The company, despite initial losses, managed to turn a profit by Q3." La empresa fue finalmente:', ops:["a la quiebra","exitosa","vendida","cerrada"], ans:1 },
  { id:17, tipo:"Comprensión", nivel:"B2", q:'"The policy was met with ambivalence — some praised its boldness while others criticized its scope." La reacción fue:', ops:["totalmente positiva","totalmente negativa","mixta","indiferente"], ans:2 },
  { id:18, tipo:"Gramática",   nivel:"B1", q:"Elige la oración correcta:",                        ops:["I am here since two hours","I have been here for two hours","I was here since two hours","I am here for two hours"], ans:1 },
  { id:19, tipo:"Gramática",   nivel:"B2", q:"The results were better than ___ expected.",        ops:["we","us","our","ours"],                                 ans:0 },
  { id:20, tipo:"Vocabulario", nivel:"B2", q:"'A paradigm shift' hace referencia a:",             ops:["un cambio pequeño","un cambio fundamental de enfoque","una tendencia temporal","un experimento científico"], ans:1 },
];

const LESSONS = {
  A2:[
    { id:"a2-1", title:"Present Perfect",     icon:"⏰", tag:"Gramática",    xp:20,
      desc:"El Present Perfect se forma con 'have/has + participio pasado'. Se usa para hablar de experiencias de vida o acciones recientes con resultado en el presente.",
      ejs:["I have visited Paris. → He visitado París.","She has eaten sushi before. → Ella ha comido sushi antes.","We haven't seen that film. → No hemos visto esa película."],
      tip:"Usa 'ever' (alguna vez) y 'never' (nunca) con el Present Perfect para hablar de experiencias: Have you ever been to London?",
      prac:"Completa: Have you ever ___? → Yes, I have ___ / No, I have never ___." },
    { id:"a2-2", title:"Everyday Vocabulary",  icon:"📚", tag:"Vocabulario",  xp:15,
      desc:"Palabras esenciales para el día a día. Aprenderlas en contexto (en frases) es mucho más efectivo que memorizarlas sueltas.",
      ejs:["appointment (cita) → I have a doctor's appointment at 3pm.","commute (trayecto) → My commute takes 45 minutes.","receipt (recibo) → Can I have a receipt, please?"],
      tip:"Cada vez que aprendas una palabra nueva, escríbela en una frase propia. Así la recuerdas mucho mejor.",
      prac:"Traduce y usa en una frase: schedule (horario), deadline (fecha límite), discount (descuento)." },
    { id:"a2-3", title:"Asking for Help",      icon:"🙋", tag:"Conversación", xp:25,
      desc:"Frases educadas para pedir ayuda o pedir que repitan algo. Muy útiles cuando hablas con alguien y no entiendes.",
      ejs:["Could you help me with this? → ¿Podría ayudarme con esto?","I'm sorry, could you repeat that? → Perdona, ¿podrías repetirlo?","Would you mind speaking more slowly? → ¿Te importaría hablar más despacio?"],
      tip:"'Could' es más educado que 'can'. Úsalo siempre en situaciones formales o con desconocidos.",
      prac:"Practica: Could you ___ me with ___? / I didn't quite understand, could you ___?" },
    { id:"a2-4", title:"Past Simple",          icon:"🕰️", tag:"Gramática",    xp:20,
      desc:"El Past Simple describe acciones terminadas en un momento concreto del pasado. Es el tiempo más usado para contar historias y experiencias pasadas.",
      ejs:["I went to the cinema yesterday. → Fui al cine ayer.","She didn't call me last night. → Ella no me llamó anoche.","Did you see the news? → ¿Viste las noticias?"],
      tip:"Verbos regulares añaden -ed (walk→walked). Irregulares cambian de forma (go→went, see→saw, eat→ate).",
      prac:"Yesterday I ___ (wake up) at 8am. Then I ___ (have) breakfast and ___ (go) to work." },
    { id:"a2-5", title:"Making Plans",         icon:"📅", tag:"Conversación", xp:20,
      desc:"Cómo hablar de planes futuros y quedar con alguien en inglés.",
      ejs:["I'm going to visit my family next weekend. → Voy a visitar a mi familia el finde.","Are you free on Friday? → ¿Estás libre el viernes?","Let's meet at 7pm outside the cinema."],
      tip:"Usa 'going to' para planes ya decididos. Usa 'will' para decisiones espontáneas en el momento.",
      prac:"What are you going to do this weekend? → I'm going to ___ with ___." },
  ],
  B1:[
    { id:"b1-1", title:"2nd & 3rd Conditional", icon:"🔀", tag:"Gramática",    xp:30,
      desc:"Los condicionales 2º y 3º expresan situaciones hipotéticas. El 2º habla del presente/futuro imaginario; el 3º del pasado (ya no se puede cambiar).",
      ejs:["2º: If I won the lottery, I would travel the world. → Si ganara la lotería, viajaría.","3º: If she had studied harder, she would have passed. → Si hubiera estudiado más, habría aprobado.","Mezcla: If you had called, I would know what to do now."],
      tip:"2º = situación imaginaria ahora/futuro. 3º = lamento por algo del pasado que ya no puedes cambiar.",
      prac:"If I ___ (be) richer, I would ___. / If I had ___ (know) earlier, I would have ___." },
    { id:"b1-2", title:"Linking Words",         icon:"🔗", tag:"Escritura",    xp:25,
      desc:"Los conectores unen ideas y hacen tu inglés más fluido y natural, tanto al hablar como al escribir.",
      ejs:["Contraste: However / Despite this / On the other hand → Sin embargo","Adición: Furthermore / In addition / What's more → Además","Causa-efecto: As a result / Consequently / Therefore → Por tanto"],
      tip:"Usarlos bien es lo que separa un inglés B1 de uno B2. Empieza por dominar 'however', 'therefore' y 'furthermore'.",
      prac:"Escribe 3 frases usando 'however', 'furthermore' y 'therefore'." },
    { id:"b1-3", title:"Describing Feelings",   icon:"💬", tag:"Conversación", xp:20,
      desc:"Cómo expresar emociones con precisión en lugar de usar siempre 'happy' o 'sad'.",
      ejs:["I'm overwhelmed with work. → Estoy desbordado/a de trabajo.","She seemed hesitant about the decision. → Parecía dudar.","He came across as quite confident. → Transmitía bastante confianza."],
      tip:"En vez de 'very happy': thrilled, elated, content. En vez de 'very sad': devastated, heartbroken, down.",
      prac:"Sustituye: 'I'm very happy' → I'm ___. / 'She was very nervous' → She was ___." },
    { id:"b1-4", title:"Reported Speech",       icon:"🗣️", tag:"Gramática",    xp:30,
      desc:"El estilo indirecto se usa para contar lo que alguien dijo. El verbo retrocede un tiempo verbal.",
      ejs:["'I am tired.' → He said he was tired. (am→was)","'I have finished.' → She told me she had finished. (have→had)","'I will help you.' → They said they would help me. (will→would)"],
      tip:"Regla: el tiempo verbal retrocede un paso. am/is→was · have→had · will→would · can→could.",
      prac:"'I am hungry.' → He said he ___ hungry. / 'I will call you.' → She said she ___ call me." },
    { id:"b1-5", title:"Phrasal Verbs",         icon:"🚀", tag:"Vocabulario",  xp:25,
      desc:"Verbos + partícula (up, out, off...) cuyo significado conjunto suele ser diferente al literal. Esenciales para sonar natural.",
      ejs:["look after → cuidar: Could you look after my cat this weekend?","figure out → resolver: I can't figure out this problem.","call off → cancelar: The meeting was called off at the last minute."],
      tip:"¡El significado no es literal! 'Give up' no es 'dar arriba', sino rendirse. Apréndelos como palabras nuevas.",
      prac:"Usa en una frase: give up (rendirse), put off (posponer), run out of (quedarse sin)." },
  ],
  B2:[
    { id:"b2-1", title:"Advanced Passives",     icon:"🏗️", tag:"Gramática",    xp:35,
      desc:"Las pasivas avanzadas se usan en inglés formal, académico y periodístico para distanciar al autor de lo que dice.",
      ejs:["It is believed that... → Se cree que...","He is said to have resigned. → Se dice que dimitió.","The problem is thought to be serious. → Se considera que el problema es grave."],
      tip:"Muy comunes en noticias y textos académicos: 'It is + reported/believed/said/thought + that...'",
      prac:"Transforma: 'People think she is the best candidate.' → She ___ (consider) the best candidate." },
    { id:"b2-2", title:"Nuanced Vocabulary",    icon:"✨", tag:"Vocabulario",  xp:30,
      desc:"El vocabulario matizado te permite expresar ideas con precisión. Es lo que distingue un hablante B2 de uno B1.",
      ejs:["eloquent (elocuente) vs. 'good at speaking'","meticulous (meticuloso) vs. 'very careful'","pragmatic (pragmático) vs. 'practical'"],
      tip:"Aprende sinónimos con diferentes intensidades: tired → weary → exhausted → drained.",
      prac:"Sustituye 'very important' por ___ (crucial, pivotal). / 'very tired' por ___ (exhausted, drained)." },
    { id:"b2-3", title:"Debate & Argue",        icon:"🎤", tag:"Conversación", xp:40,
      desc:"Cómo expresar, defender y matizar opiniones de forma profesional. Fundamental para entrevistas y reuniones.",
      ejs:["I'd like to put forward the idea that... → Me gustaría proponer que...","While I see your point, I'd argue that... → Entiendo tu punto, pero yo diría que...","The evidence suggests that... → La evidencia sugiere que..."],
      tip:"En un debate, reconoce primero el punto de vista del otro antes de rebatirlo. Suena más maduro.",
      prac:"Practica: 'That's a fair point. However, I believe ___ because ___. What do you think?'" },
    { id:"b2-4", title:"Inversion",             icon:"🔄", tag:"Gramática",    xp:40,
      desc:"La inversión (auxiliar antes del sujeto) se usa en inglés formal para dar énfasis. Muy común en textos escritos y discursos.",
      ejs:["Never have I seen such dedication. → Jamás he visto tanta dedicación.","Not only did she win, but she broke the record. → No solo ganó, sino que batió el récord.","Rarely do we see such commitment."],
      tip:"Aparece después de: Never, Rarely, Seldom, Not only, Hardly, No sooner. El auxiliar va antes del sujeto.",
      prac:"Reescribe: 'I have never been so surprised.' → Never ___ I been so surprised." },
    { id:"b2-5", title:"Academic Writing",      icon:"📝", tag:"Escritura",    xp:35,
      desc:"Cómo escribir de forma clara y persuasiva en inglés formal. Útil para emails profesionales e informes.",
      ejs:["This essay will argue that... → Este ensayo defenderá que...","The data clearly demonstrates that... → Los datos demuestran claramente que...","In conclusion, it can be seen that..."],
      tip:"Evita contracciones (don't→do not). Usa estructuras impersonales ('It can be argued...').",
      prac:"Reescribe formalmente: 'The thing is, lots of people don't agree.' → It can be argued that ___." },
  ],
};

const CARDS = {
  A2:[
    {f:"appointment", b:"(sustantivo) Cita o reunión a una hora concreta.\n\n'I have a doctor's appointment at 3pm.'\n→ Tengo cita con el médico a las 3."},
    {f:"commute",     b:"(sustantivo/verbo) El trayecto diario al trabajo.\n\n'My commute takes 45 minutes.'\n→ Mi trayecto dura 45 minutos."},
    {f:"anxious",     b:"(adjetivo) Nervioso/a o preocupado/a.\n\n'She felt anxious before the exam.'\n→ Estaba ansiosa antes del examen."},
    {f:"purchase",    b:"(verbo) Comprar — más formal que 'buy'.\n\n'You can purchase tickets online.'\n→ Puedes comprar entradas online."},
    {f:"schedule",    b:"(sustantivo) Horario o agenda.\n\n'Let me check my schedule.'\n→ Déjame revisar mi agenda."},
    {f:"receipt",     b:"(sustantivo) Recibo o ticket de compra.\n\n'Can I have a receipt, please?'\n→ ¿Me podría dar un recibo?"},
  ],
  B1:[
    {f:"mandatory",    b:"(adjetivo) Obligatorio, requerido por ley.\n\n'Attendance is mandatory.'\n→ La asistencia es obligatoria."},
    {f:"figure out",   b:"(phrasal verb) Entender o resolver algo.\n\n'I can't figure out this problem.'\n→ No consigo resolver este problema."},
    {f:"overwhelmed",  b:"(adjetivo) Desbordado/a, con demasiado que gestionar.\n\n'She felt overwhelmed by her workload.'\n→ Se sentía desbordada por el trabajo."},
    {f:"consequently", b:"(conector) En consecuencia, por lo tanto.\n\n'He didn't study. Consequently, he failed.'\n→ No estudió. Por tanto, suspendió."},
    {f:"hesitant",     b:"(adjetivo) Indeciso/a, que duda antes de actuar.\n\n'She was hesitant to speak in public.'\n→ Le costaba hablar en público."},
    {f:"call off",     b:"(phrasal verb) Cancelar.\n\n'The match was called off due to rain.'\n→ El partido fue cancelado por la lluvia."},
  ],
  B2:[
    {f:"resilient",      b:"(adjetivo) Resistente, que se recupera rápido de las dificultades.\n\n'Children are remarkably resilient.'\n→ Los niños son sorprendentemente resistentes."},
    {f:"meticulous",     b:"(adjetivo) Meticuloso/a, muy cuidadoso con los detalles.\n\n'Her meticulous work impressed everyone.'\n→ Su trabajo meticuloso impresionó a todos."},
    {f:"eloquent",       b:"(adjetivo) Elocuente, fluido y persuasivo al hablar o escribir.\n\n'He gave an eloquent speech.'\n→ Dio un discurso elocuente."},
    {f:"mitigate",       b:"(verbo) Mitigar, reducir la gravedad de algo.\n\n'We must mitigate the risks.'\n→ Debemos mitigar los riesgos."},
    {f:"ambiguous",      b:"(adjetivo) Ambiguo/a, puede interpretarse de más de una forma.\n\n'The instructions were ambiguous.'\n→ Las instrucciones eran ambiguas."},
    {f:"paradigm shift", b:"(locución) Cambio de paradigma, cambio fundamental de enfoque.\n\n'AI represents a paradigm shift.'\n→ La IA representa un cambio de paradigma."},
  ],
};

const BLANKS = {
  A2:[
    {s:"I ___ to the gym three times a week.", ops:["go","goes","went","going"], ans:0, exp:"Usamos 'go' (forma base) después de 'I' en presente simple. Con she/he/it añadimos -s → 'she goes'."},
    {s:"She ___ already eaten lunch.",          ops:["have","has","had","is"],    ans:1, exp:"Present Perfect: usamos 'has' con she/he/it. Con I/you/we/they usamos 'have'."},
    {s:"They ___ football yesterday.",          ops:["play","plays","played","playing"], ans:2, exp:"'Yesterday' indica pasado → Past Simple: 'played'. Palabra clave: yesterday."},
    {s:"___ you help me with this, please?",   ops:["Can","Could","Would","Should"], ans:1, exp:"'Could' es más educado que 'can'. Úsalo al pedir un favor a alguien que no conoces bien."},
  ],
  B1:[
    {s:"If I ___ you, I would apologise.",      ops:["am","was","were","be"],     ans:2, exp:"2º condicional: usamos 'were' para todas las personas en inglés formal. 'If I were you...' es la expresión fija."},
    {s:"The package ___ delivered yesterday.",  ops:["was","were","had","is"],    ans:0, exp:"Voz pasiva en pasado: was/were + participio. Sujeto singular (the package) → 'was'."},
    {s:"She suggested ___ a break.",            ops:["take","to take","taking","took"], ans:2, exp:"'Suggest' va seguido de gerundio (-ing). También: avoid, recommend, consider, enjoy + -ing."},
    {s:"I've worked here ___ 2019.",            ops:["for","since","from","during"], ans:1, exp:"'Since' + punto concreto en el tiempo (2019). 'For' + duración (for 3 years)."},
  ],
  B2:[
    {s:"___ have I seen such a problem.",       ops:["Ever","Rarely","Sometimes","Often"], ans:1, exp:"Inversión después de adverbios negativos: Never, Rarely, Seldom... El auxiliar va antes del sujeto."},
    {s:"It is widely ___ that exercise helps.", ops:["believed","believing","believe","to believe"], ans:0, exp:"Pasiva impersonal: 'It is + participio + that...'. Muy común en inglés académico y periodístico."},
    {s:"___ she finished, she went home.",      ops:["As soon as","Despite","Although","However"], ans:0, exp:"'As soon as' = en cuanto / tan pronto como. Dos acciones ocurren de forma inmediata una tras otra."},
    {s:"The findings ___ further research.",    ops:["warrant","warrants","warranting","warranted"], ans:0, exp:"'Findings' es plural → verbo plural: 'warrant'. (Si fuera singular: 'the finding warrants...')"},
  ],
};

const WORDS = [
  {w:"Resilient",  ph:"/rɪˈzɪliənt/",  es:"Resistente; que se recupera rápido de las dificultades.",      ej:"She is incredibly resilient — nothing keeps her down.", niv:"B2"},
  {w:"Meticulous", ph:"/məˈtɪkjʊləs/", es:"Meticuloso/a; muy cuidadoso/a con los detalles.",               ej:"His meticulous planning made the event a great success.", niv:"B2"},
  {w:"Ambiguous",  ph:"/æmˈbɪɡjuəs/",  es:"Ambiguo/a; puede interpretarse de más de una manera.",          ej:"The instructions were ambiguous, so people disagreed.",   niv:"B1"},
  {w:"Candid",     ph:"/ˈkændɪd/",      es:"Sincero/a y directo/a; franco.",                                ej:"I appreciate your candid feedback — it helps me improve.", niv:"B1"},
  {w:"Eloquent",   ph:"/ˈeləkwənt/",    es:"Elocuente; fluido y persuasivo al hablar o escribir.",          ej:"Her eloquent speech moved everyone in the room.",           niv:"B2"},
  {w:"Pragmatic",  ph:"/præɡˈmætɪk/",  es:"Pragmático/a; centrado en lo práctico y realista.",             ej:"We need a pragmatic approach to solve this.",               niv:"B2"},
  {w:"Hesitant",   ph:"/ˈhɛzɪtənt/",   es:"Indeciso/a; que duda antes de actuar o hablar.",                ej:"She was hesitant to share her opinion at first.",            niv:"B1"},
];

const SCEN = [
  {id:"job",       ic:"💼", t:"Entrevista de trabajo",  d:"Practica responder preguntas típicas en inglés.",    niv:"B1-B2", p:"You are an English interviewer. The user is a Spanish speaker practicing for a job interview. Ask one question at a time. When they make a significant English error, correct it gently in Spanish in parentheses like (Corrección: di «I have worked» en lugar de «I worked»). Keep responses short. Start by greeting them and asking your first question."},
  {id:"travel",    ic:"✈️", t:"En el aeropuerto",        d:"Practica el check-in y moverse por el aeropuerto.", niv:"A2-B1", p:"You are airport staff. The user is a Spanish speaker practicing English. Have a realistic airport conversation. When they make an English error, correct it gently in Spanish in parentheses. Start the scenario."},
  {id:"social",    ic:"☕", t:"Charla casual",            d:"Habla sobre el día a día, aficiones y planes.",     niv:"A2-B1", p:"You are a friendly English-speaking colleague. Have natural small talk. When the user makes a significant error, gently note it in Spanish in parentheses. Be warm and encouraging."},
  {id:"complaint", ic:"📞", t:"Hacer una reclamación",   d:"Aprende a quejarte de forma educada en inglés.",   niv:"B1-B2", p:"You are a customer service representative. The user practices making a formal complaint in English. Correct errors gently in Spanish in parentheses. Be professional and realistic."},
  {id:"doctor",    ic:"🏥", t:"Visita al médico",         d:"Describe síntomas y entiende consejos médicos.",    niv:"A2-B1", p:"You are an English-speaking doctor. The user practices medical English. Correct significant errors gently in Spanish in parentheses. Start by asking what brings them in today."},
  {id:"negotiate", ic:"🤝", t:"Negociación empresarial",  d:"Negocia condiciones en inglés formal.",             niv:"B2",    p:"You are a business partner in a negotiation. The user practices formal business English. Correct register or grammar mistakes gently in Spanish in parentheses. Start the negotiation."},
];

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const C = {
  bg:"#070d14", card:"#0f1923", c2:"#131f2e", bd:"#1e2a3a",
  tx:"#f1f5f9", mu:"#64748b", di:"#475569",
  in:"#6366f1", gr:"#10b981", am:"#f59e0b", vi:"#8b5cf6", re:"#ef4444",
};

function hoy() { return new Date().toISOString().slice(0,10); }

function calcNivel(s) {
  if (s<=6)  return {lv:"A2", et:"Básico-Elemental",  co:"#10b981", sg:"B1"};
  if (s<=12) return {lv:"B1", et:"Intermedio",         co:"#f59e0b", sg:"B2"};
  return           {lv:"B2", et:"Intermedio-Alto",     co:"#8b5cf6", sg:"C1"};
}

// En App.jsx, busca la función claude() y cambia la URL:
const r = await fetch("/.netlify/functions/claude", {
  method:"POST", headers:{"Content-Type":"application/json"},
  body:JSON.stringify({system:sys, messages:msgs}),
});

/* ─────────────────────────────────────────────
   ATOMS
───────────────────────────────────────────── */
function Pb({v,max,co=C.in,h=8}) {
  return <div style={{background:C.bd,borderRadius:h,height:h,overflow:"hidden"}}><div style={{width:`${Math.min(100,v/Math.max(max,1)*100)}%`,height:"100%",background:co,borderRadius:h,transition:"width .4s"}}/></div>;
}
function Bg({text,co=C.in}) {
  return <span style={{background:co+"22",color:co,border:`1px solid ${co}44`,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700}}>{text}</span>;
}
function Bt({ch,fn,co=C.in,dis=false,st={}}) {
  return <button onClick={fn} disabled={dis} style={{background:dis?"#1e2a3a":co,color:dis?C.di:"#fff",border:"none",borderRadius:12,padding:"13px 20px",fontSize:15,fontWeight:700,cursor:dis?"default":"pointer",opacity:dis?.6:1,...st}}>{ch}</button>;
}
function Cd({children,st={},fn}) {
  const [hv,sHv]=useState(false);
  return <div onClick={fn} onMouseEnter={()=>fn&&sHv(true)} onMouseLeave={()=>fn&&sHv(false)} style={{background:C.card,border:`1px solid ${hv?C.in:C.bd}`,borderRadius:16,padding:"22px 24px",transition:"border .15s",cursor:fn?"pointer":"default",...st}}>{children}</div>;
}

/* ─────────────────────────────────────────────
   TEST DE NIVEL
───────────────────────────────────────────── */
function Test({onDone}) {
  const [i,si]=useState(0);
  const [ans,sa]=useState({});
  const [sel,ss]=useState(null);
  const [conf,sc]=useState(false);
  const q=TEST_Q[i], last=i===TEST_Q.length-1;
  const tc={Gramática:C.in,Vocabulario:C.am,Comprensión:C.gr};

  function confirm() { if(sel===null)return; sc(true); sa(p=>({...p,[q.id]:sel})); }
  function next() {
    if(last){
      const all={...ans,[q.id]:sel};
      const score=Object.entries(all).filter(([id,a])=>{const qq=TEST_Q.find(x=>x.id===+id);return qq&&a===qq.ans;}).length;
      onDone(score);
    } else { ss(null);sc(false);si(x=>x+1); }
  }

  return (
    <div style={{maxWidth:600,margin:"0 auto"}}>
      <div style={{marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <span style={{color:C.mu,fontSize:13}}>Pregunta {i+1} de {TEST_Q.length}</span>
          <div style={{display:"flex",gap:6}}><Bg text={q.tipo} co={tc[q.tipo]||C.in}/><Bg text={q.nivel} co={q.nivel==="B2"?C.vi:q.nivel==="B1"?C.am:C.gr}/></div>
        </div>
        <Pb v={i} max={TEST_Q.length}/>
      </div>
      <Cd>
        <h2 style={{color:C.tx,fontSize:18,fontWeight:600,marginBottom:22,lineHeight:1.5}}>{q.q}</h2>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {q.ops.map((op,k)=>{
            let bg=C.c2,bd=C.bd,co=C.mu;
            if(sel===k&&!conf){bg="#1e3a5f";bd=C.in;co=C.tx;}
            if(conf&&k===q.ans){bg="#0d2e1f";bd=C.gr;co=C.gr;}
            if(conf&&sel===k&&k!==q.ans){bg="#2e0d0d";bd=C.re;co=C.re;}
            return(
              <div key={k} onClick={()=>!conf&&ss(k)} style={{background:bg,border:`2px solid ${bd}`,borderRadius:10,padding:"12px 16px",color:co,cursor:conf?"default":"pointer",display:"flex",alignItems:"center",gap:12,transition:"all .12s",fontSize:14}}>
                <span style={{width:22,height:22,borderRadius:"50%",border:`2px solid ${bd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{String.fromCharCode(65+k)}</span>
                {op}
                {conf&&k===q.ans&&<span style={{marginLeft:"auto"}}>✓</span>}
                {conf&&sel===k&&k!==q.ans&&<span style={{marginLeft:"auto"}}>✗</span>}
              </div>
            );
          })}
        </div>
        {conf&&sel!==q.ans&&<div style={{marginTop:12,background:"#0d2e1f",border:`1px solid ${C.gr}33`,borderRadius:10,padding:"10px 14px"}}><p style={{color:"#6ee7b7",fontSize:13}}>✓ Correcta: <strong>{q.ops[q.ans]}</strong></p></div>}
        <div style={{marginTop:20}}>
          {!conf?<Bt ch="Confirmar" fn={confirm} dis={sel===null} st={{width:"100%"}}/>:<Bt ch={last?"Ver resultados →":"Siguiente →"} fn={next} st={{width:"100%"}}/>}
        </div>
      </Cd>
    </div>
  );
}

/* ─────────────────────────────────────────────
   RESULTADOS
───────────────────────────────────────────── */
function Res({score,onOk}) {
  const r=calcNivel(score);
  const pct=Math.round(score/TEST_Q.length*100);
  const cons={A2:"Concéntrate en A2 y empieza con vocabulario B1. Con práctica diaria llegarás a B1 en pocos meses.",B1:"¡Buen nivel! Trabaja B1 y empieza a explorar gramática y vocabulario B2.",B2:"¡Excelente! Empuja hacia B2 avanzado y consume material auténtico en inglés."};
  return(
    <div style={{maxWidth:540,margin:"0 auto",textAlign:"center"}}>
      <div style={{fontSize:60,marginBottom:14}}>🎯</div>
      <h2 style={{color:C.tx,fontSize:26,fontWeight:800,marginBottom:6}}>Tu nivel: {r.lv}</h2>
      <p style={{color:r.co,fontSize:17,fontWeight:700,marginBottom:22}}>{r.et}</p>
      <Cd st={{marginBottom:18}}>
        <div style={{display:"flex",justifyContent:"center",gap:28,marginBottom:18}}>
          {[{v:score,l:"correctas",c:r.co},{v:TEST_Q.length,l:"total",c:C.tx},{v:pct+"%",l:"nota",c:C.in}].map(x=>(
            <div key={x.l}><div style={{color:x.c,fontSize:36,fontWeight:900}}>{x.v}</div><div style={{color:C.di,fontSize:12}}>{x.l}</div></div>
          ))}
        </div>
        {[{ic:"💡",lb:"Recomendación",tx:cons[r.lv]},{ic:"🎯",lb:"Tu objetivo",tx:`Llegar a ${r.sg}. 15–20 minutos al día son suficientes para progresar de forma sostenida.`}].map(x=>(
          <div key={x.lb} style={{background:C.c2,borderRadius:12,padding:"12px 16px",textAlign:"left",marginBottom:10}}>
            <p style={{color:C.mu,fontSize:14,lineHeight:1.6}}>{x.ic} <strong style={{color:C.tx}}>{x.lb}:</strong> {x.tx}</p>
          </div>
        ))}
      </Cd>
      <Bt ch={`Empezar en nivel ${r.lv} →`} fn={()=>onOk(r.lv)} st={{width:"100%",background:`linear-gradient(135deg,${C.in},${C.vi})`,padding:16,fontSize:16}}/>
    </div>
  );
}

/* ─────────────────────────────────────────────
   LECCIÓN
───────────────────────────────────────────── */
function Leccion({lesson,onBack,onDone}) {
  const [step,ss]=useState(0);
  const pasos=["Explicación","Ejemplos","Consejo","Práctica"];
  const tc={Gramática:C.in,Vocabulario:C.am,Conversación:C.gr,Escritura:"#06b6d4"};
  return(
    <div style={{maxWidth:600,margin:"0 auto"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:C.in,cursor:"pointer",fontSize:14,marginBottom:18,padding:0}}>← Volver</button>
      <div style={{display:"flex",gap:6,marginBottom:20}}>
        {pasos.map((p,k)=><div key={k} onClick={()=>ss(k)} style={{flex:1,padding:"7px 4px",textAlign:"center",borderRadius:8,background:step===k?C.in:C.card,border:`1px solid ${step===k?C.in:C.bd}`,color:step===k?"#fff":C.di,fontSize:11,fontWeight:600,cursor:"pointer"}}>{p}</div>)}
      </div>
      <Cd>
        <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:20}}>
          <span style={{fontSize:34}}>{lesson.icon}</span>
          <div><Bg text={lesson.tag} co={tc[lesson.tag]||C.in}/><h2 style={{color:C.tx,fontSize:21,fontWeight:800,marginTop:4}}>{lesson.title}</h2></div>
        </div>
        {step===0&&<p style={{color:"#cbd5e1",fontSize:15,lineHeight:1.8}}>{lesson.desc}</p>}
        {step===1&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
          <p style={{color:C.di,fontSize:11,fontWeight:700,letterSpacing:1}}>EJEMPLOS EN INGLÉS</p>
          {lesson.ejs.map((e,k)=><div key={k} style={{background:C.c2,borderLeft:`3px solid ${C.in}`,borderRadius:"0 8px 8px 0",padding:"11px 14px",color:"#e2e8f0",fontFamily:"Georgia,serif",fontSize:14}}>{e}</div>)}
        </div>}
        {step===2&&<div style={{background:"#1a2e1a",borderLeft:`3px solid ${C.gr}`,borderRadius:"0 10px 10px 0",padding:"16px 18px"}}>
          <p style={{color:"#34d399",fontSize:11,fontWeight:700,marginBottom:6,letterSpacing:1}}>💡 CONSEJO CLAVE</p>
          <p style={{color:"#a7f3d0",fontSize:14,lineHeight:1.8}}>{lesson.tip}</p>
        </div>}
        {step===3&&<>
          <div style={{background:"#1e1a2e",borderLeft:`3px solid ${C.vi}`,borderRadius:"0 10px 10px 0",padding:"16px 18px",marginBottom:18}}>
            <p style={{color:"#a78bfa",fontSize:11,fontWeight:700,marginBottom:6,letterSpacing:1}}>✏️ PRÁCTICA</p>
            <p style={{color:"#ddd6fe",fontSize:14,lineHeight:1.8}}>{lesson.prac}</p>
          </div>
          <Bt ch={`✓ Completada (+${lesson.xp} XP)`} fn={()=>onDone(lesson)} st={{width:"100%",background:C.gr}}/>
        </>}
        {step<3&&<Bt ch={`Siguiente: ${pasos[step+1]} →`} fn={()=>ss(s=>s+1)} st={{width:"100%",marginTop:20}}/>}
      </Cd>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FLASHCARDS
───────────────────────────────────────────── */
function Flash({lv}) {
  const deck=CARDS[lv]||[];
  const [i,si]=useState(0);
  const [fl,sf]=useState(false);
  const [kn,sk]=useState([]);
  const [un,su]=useState([]);
  const done=kn.length+un.length===deck.length;
  function mark(v){v?sk(p=>[...p,i]):su(p=>[...p,i]);sf(false);if(i<deck.length-1)si(x=>x+1);}
  const card=deck[i];
  return(
    <div style={{maxWidth:520,margin:"0 auto"}}>
      <h2 style={{color:C.tx,fontSize:20,fontWeight:800,marginBottom:6}}>Flashcards</h2>
      <p style={{color:C.mu,fontSize:14,marginBottom:18}}>Toca la tarjeta para ver la definición en español.</p>
      <div style={{display:"flex",gap:10,marginBottom:18}}>
        {[{v:kn.length,l:"Aprendidas",c:C.gr},{v:un.length,l:"Repasar",c:C.re},{v:deck.length-kn.length-un.length,l:"Quedan",c:C.mu}].map(x=>(
          <div key={x.l} style={{flex:1,background:C.card,border:`1px solid ${C.bd}`,borderRadius:12,padding:"10px",textAlign:"center"}}>
            <div style={{color:x.c,fontSize:20,fontWeight:900}}>{x.v}</div>
            <div style={{color:C.di,fontSize:11}}>{x.l}</div>
          </div>
        ))}
      </div>
      {done?(
        <Cd st={{textAlign:"center",padding:"36px"}}>
          <div style={{fontSize:44,marginBottom:14}}>🎉</div>
          <h3 style={{color:C.tx,fontSize:19,fontWeight:800,marginBottom:8}}>¡Mazo completado!</h3>
          <p style={{color:C.mu,marginBottom:18}}>Sabías {kn.length} de {deck.length} palabras.</p>
          <Bt ch="Repetir mazo" fn={()=>{si(0);sf(false);sk([]);su([]);}}/>
        </Cd>
      ):(
        <>
          <div onClick={()=>sf(x=>!x)} style={{background:fl?"#1a1a2e":C.card,border:`2px solid ${fl?C.vi:C.bd}`,borderRadius:18,minHeight:200,padding:"30px 28px",cursor:"pointer",transition:"all .25s",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",marginBottom:14}}>
            {!fl?(<><Bg text={lv} co={C.vi}/><h2 style={{color:C.tx,fontSize:30,fontWeight:900,marginTop:12}}>{card.f}</h2><p style={{color:C.di,fontSize:12,marginTop:8}}>toca para ver en español</p></>)
            :(<>{card.b.split("\n\n").map((p,k)=><p key={k} style={{color:k===0?C.tx:"#a78bfa",fontSize:k===0?15:13,lineHeight:1.7,fontStyle:k>0?"italic":"normal",marginBottom:6,textAlign:"left",width:"100%"}}>{p}</p>)}</>)}
          </div>
          {fl&&<div style={{display:"flex",gap:10}}>
            <button onClick={()=>mark(false)} style={{flex:1,padding:"12px",background:"#2e0d0d",color:C.re,border:`1px solid ${C.re}44`,borderRadius:12,fontWeight:700,cursor:"pointer",fontSize:14}}>✗ Repasar</button>
            <button onClick={()=>mark(true)}  style={{flex:1,padding:"12px",background:"#0d2e1f",color:C.gr,border:`1px solid ${C.gr}44`,borderRadius:12,fontWeight:700,cursor:"pointer",fontSize:14}}>✓ La sé</button>
          </div>}
          <div style={{display:"flex",justifyContent:"center",gap:5,marginTop:14}}>
            {deck.map((_,k)=><div key={k} style={{width:7,height:7,borderRadius:"50%",background:kn.includes(k)?C.gr:un.includes(k)?C.re:k===i?C.in:C.bd,transition:"all .2s"}}/>)}
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   RELLENA EL HUECO — ADAPTATIVO CON IA
   Tanda 1: 20 preguntas estáticas (mezcla de todos los niveles)
   Tanda 2+: 20 preguntas generadas por IA adaptadas a tus errores
───────────────────────────────────────────── */

// Pool estático ampliado de 20 preguntas base
const BLANKS_BASE = [
  // A2 Gramática
  {s:"I ___ to the gym three times a week.",        ops:["go","goes","went","going"],              ans:0, exp:"Presente simple con 'I': usamos la forma base. Con she/he/it añadimos -s → 'she goes'.", tipo:"Gramática", nivel:"A2"},
  {s:"She ___ already eaten lunch.",                 ops:["have","has","had","is"],                 ans:1, exp:"Present Perfect: 'has' con she/he/it. 'Have' con I/you/we/they.", tipo:"Gramática", nivel:"A2"},
  {s:"They ___ football yesterday.",                 ops:["play","plays","played","playing"],       ans:2, exp:"'Yesterday' indica pasado → Past Simple: 'played'. Palabra clave: yesterday.", tipo:"Gramática", nivel:"A2"},
  {s:"___ you help me with this, please?",           ops:["Can","Could","Would","Should"],          ans:1, exp:"'Could' es más educado que 'can'. Úsalo al pedir un favor a alguien que no conoces bien.", tipo:"Gramática", nivel:"A2"},
  {s:"I ___ TV when my phone rang.",                 ops:["watch","watched","was watching","am watching"], ans:2, exp:"Past Continuous: acción en progreso interrumpida por otra. 'was/were + -ing'.", tipo:"Gramática", nivel:"A2"},
  // A2 Vocabulario
  {s:"Can I have the ___ for my purchase?",          ops:["recipe","receipt","receive","record"],   ans:1, exp:"'Receipt' (recibo/ticket) no confundir con 'recipe' (receta de cocina). Sonido: /rɪˈsiːt/", tipo:"Vocabulario", nivel:"A2"},
  {s:"Let me check my ___. I'm free at 3pm.",        ops:["schedule","school","scheme","scale"],    ans:0, exp:"'Schedule' = horario/agenda. Es una de las palabras más usadas en inglés de negocios.", tipo:"Vocabulario", nivel:"A2"},
  // B1 Gramática
  {s:"If I ___ you, I would apologise.",             ops:["am","was","were","be"],                  ans:2, exp:"2º condicional: usamos 'were' para todas las personas. 'If I were you...' es la expresión fija.", tipo:"Gramática", nivel:"B1"},
  {s:"The package ___ delivered yesterday.",         ops:["was","were","had","is"],                 ans:0, exp:"Voz pasiva en pasado: was/were + participio. Sujeto singular (the package) → 'was'.", tipo:"Gramática", nivel:"B1"},
  {s:"She suggested ___ a break.",                   ops:["take","to take","taking","took"],        ans:2, exp:"'Suggest' va seguido de gerundio (-ing). También: avoid, recommend, consider, enjoy + -ing.", tipo:"Gramática", nivel:"B1"},
  {s:"I've worked here ___ 2019.",                   ops:["for","since","from","during"],           ans:1, exp:"'Since' + punto concreto (2019). 'For' + duración (for 3 years).", tipo:"Gramática", nivel:"B1"},
  {s:"He said he ___ tired and wanted to go home.",  ops:["is","was","were","be"],                  ans:1, exp:"Estilo indirecto: el verbo retrocede un tiempo. 'is' → 'was'. Regla: am/is→was, are→were.", tipo:"Gramática", nivel:"B1"},
  // B1 Vocabulario
  {s:"The meeting was ___. We'll reschedule it.",    ops:["called off","called up","called in","called on"], ans:0, exp:"'Call off' = cancelar. Phrasal verb muy común. 'Call up' = llamar por teléfono.", tipo:"Vocabulario", nivel:"B1"},
  {s:"I can't ___ why it stopped working.",          ops:["figure out","figure in","figure up","figure off"], ans:0, exp:"'Figure out' = entender/resolver algo. Muy usado en inglés coloquial y profesional.", tipo:"Vocabulario", nivel:"B1"},
  // B2 Gramática
  {s:"___ have I seen such a problem.",              ops:["Ever","Rarely","Sometimes","Often"],     ans:1, exp:"Inversión después de adverbios negativos: Never, Rarely, Seldom... El auxiliar va antes del sujeto.", tipo:"Gramática", nivel:"B2"},
  {s:"It is widely ___ that exercise helps.",        ops:["believed","believing","believe","to believe"], ans:0, exp:"Pasiva impersonal: 'It is + participio + that...'. Muy común en inglés académico y periodístico.", tipo:"Gramática", nivel:"B2"},
  {s:"___ she finished, she went home.",             ops:["As soon as","Despite","Although","However"], ans:0, exp:"'As soon as' = en cuanto / tan pronto como. Dos acciones ocurren de forma inmediata.", tipo:"Gramática", nivel:"B2"},
  {s:"The findings ___ further research.",           ops:["warrant","warrants","warranting","warranted"], ans:0, exp:"'Findings' es plural → verbo plural: 'warrant'. (Si fuera singular: 'the finding warrants...')", tipo:"Vocabulario", nivel:"B2"},
  // B2 Vocabulario
  {s:"Her ___ speech inspired the whole team.",      ops:["eloquent","elegant","elusive","elaborate"], ans:0, exp:"'Eloquent' = elocuente, fluido y persuasivo al hablar. Diferente a 'elegant' (elegante).", tipo:"Vocabulario", nivel:"B2"},
  {s:"We need to ___ the risks before proceeding.",  ops:["mitigate","migrate","motivate","mediate"], ans:0, exp:"'Mitigate' = mitigar, reducir la gravedad de algo. Muy usado en textos académicos y empresariales.", tipo:"Vocabulario", nivel:"B2"},
];

// Genera preguntas adaptativas vía IA
async function generarPreguntasIA(lv, errores, aciertos) {
  const errorDesc = errores.length > 0
    ? `El estudiante cometió errores en: ${errores.map(e=>`"${e.tipo} ${e.nivel}: ${e.frase}"`).join(", ")}.`
    : "El estudiante no tuvo errores notables en la tanda anterior.";
  const aciertosDesc = aciertos.length > 0
    ? `Acertó fácilmente: ${aciertos.slice(0,3).map(a=>`"${a.tipo} ${a.nivel}"`).join(", ")}.`
    : "";

  const prompt = `Eres un profesor de inglés experto. ${errorDesc} ${aciertosDesc}
Nivel del estudiante: ${lv}. Su idioma nativo es español.

Genera exactamente 20 preguntas de tipo "rellena el hueco" en inglés, adaptadas a sus puntos débiles.
- Si tuvo errores en Gramática A2, genera más preguntas de ese tipo con dificultad similar.
- Si acertó todo en B2, genera preguntas más difíciles B2/C1.
- Mezcla: Gramática y Vocabulario del nivel ${lv} y adyacentes.
- Cada pregunta debe tener 4 opciones, solo una correcta.
- La explicación SIEMPRE en español, clara y con el porqué.

Responde SOLO con un array JSON válido, sin texto adicional, sin bloques de código:
[
  {
    "s": "frase con ___ en el hueco",
    "ops": ["opción1","opción2","opción3","opción4"],
    "ans": 0,
    "exp": "Explicación en español de por qué es correcta.",
    "tipo": "Gramática|Vocabulario",
    "nivel": "A2|B1|B2"
  }
]`;

  try {
    const r = await fetch("/api/claude", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        max_tokens: 3000,
        system: "Eres un generador de ejercicios de inglés. Responde ÚNICAMENTE con JSON válido, sin texto adicional ni bloques de código.",
        messages: [{role:"user", content: prompt}]
      })
    });
    const d = await r.json();
    const text = d.content?.map(b=>b.text||"").join("") || "";
    // Limpiar posibles bloques de código
    const clean = text.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim();
    const parsed = JSON.parse(clean);
    if (Array.isArray(parsed) && parsed.length >= 10) return parsed.slice(0,20);
    return null;
  } catch(e) {
    return null;
  }
}

function Blanks({lv, onXP}) {
  const BATCH = 20;
  // Estado de la tanda actual
  const [preguntas, setPreguntas] = useState(BLANKS_BASE);
  const [tanda, setTanda] = useState(1); // qué tanda estamos
  const [cargandoIA, setCargandoIA] = useState(false);
  const [errorIA, setErrorIA] = useState(false);

  // Estado de la sesión de preguntas
  const [i, si] = useState(0);
  const [sel, ss] = useState(null);
  const [conf, sc] = useState(false);
  const [score, sk] = useState(0);
  const [fin, sf] = useState(false);
  const [historial, setHistorial] = useState([]); // {frase, tipo, nivel, correcto}

  const ex = preguntas;
  const e = ex[i];
  const last = i === ex.length - 1;

  function confirm() {
    if (sel === null) return;
    sc(true);
    const ok = sel === e.ans;
    if (ok) sk(s => s + 1);
    setHistorial(h => [...h, {frase: e.s, tipo: e.tipo, nivel: e.nivel, correcto: ok}]);
  }

  function next() {
    if (last) {
      const finalScore = score + (sel === e.ans ? 1 : 0);
      onXP(finalScore);
      sf(true);
    } else {
      ss(null); sc(false); si(x => x + 1);
    }
  }

  async function siguienteTanda() {
    setCargandoIA(true);
    setErrorIA(false);
    sf(false); si(0); ss(null); sc(false); sk(0);

    const errores = historial.filter(h => !h.correcto);
    const aciertos = historial.filter(h => h.correcto);
    const nuevas = await generarPreguntasIA(lv, errores, aciertos);

    if (nuevas) {
      setPreguntas(nuevas);
      setTanda(t => t + 1);
      setHistorial([]);
    } else {
      setErrorIA(true);
      // Fallback: mezcla aleatoria de las base
      setPreguntas([...BLANKS_BASE].sort(() => Math.random() - 0.5));
      setTanda(t => t + 1);
      setHistorial([]);
    }
    setCargandoIA(false);
  }

  function repetirTanda() {
    si(0); ss(null); sc(false); sk(0); sf(false); setHistorial([]);
  }

  // Pantalla de carga IA
  if (cargandoIA) return (
    <div style={{textAlign:"center", padding:"60px 20px"}}>
      <div style={{fontSize:48, marginBottom:20}}>🤖</div>
      <h3 style={{color:C.tx, fontSize:18, fontWeight:800, marginBottom:10}}>La IA está preparando tu siguiente tanda…</h3>
      <p style={{color:C.mu, fontSize:14, marginBottom:24}}>Analizando tus respuestas para crear ejercicios personalizados.</p>
      <div style={{display:"flex", justifyContent:"center", gap:8}}>
        {[0,1,2].map(k => (
          <div key={k} style={{
            width:10, height:10, borderRadius:"50%", background:C.in,
            animation:`pulse 1.2s ease-in-out ${k*0.3}s infinite`,
          }}/>
        ))}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}`}</style>
    </div>
  );

  // Pantalla de fin de tanda
  if (fin) {
    const total = ex.length;
    const pct = Math.round(score / total * 100);
    const errores = historial.filter(h => !h.correcto);
    const tiposError = [...new Set(errores.map(e => `${e.tipo} ${e.nivel}`))];

    return (
      <div style={{maxWidth:540, margin:"0 auto", textAlign:"center"}}>
        <div style={{fontSize:50, marginBottom:14}}>
          {pct===100?"🏆":pct>=70?"🎉":pct>=50?"💪":"📚"}
        </div>
        <h3 style={{color:C.tx, fontSize:22, fontWeight:800, marginBottom:6}}>
          Tanda {tanda} completada
        </h3>
        <p style={{color:C.mu, fontSize:14, marginBottom:24}}>
          Resultado: <strong style={{color:C.in}}>{score}/{total}</strong> ({pct}%)
        </p>

        {/* Resumen de errores */}
        {errores.length > 0 && (
          <Cd st={{marginBottom:16, textAlign:"left"}}>
            <p style={{color:C.re, fontSize:13, fontWeight:700, marginBottom:8}}>
              ❌ Errores ({errores.length})
            </p>
            {errores.slice(0,5).map((err, k) => (
              <div key={k} style={{background:C.c2, borderRadius:8, padding:"8px 12px", marginBottom:6}}>
                <p style={{color:"#94a3b8", fontSize:12}}>{err.frase.replace("___","___")}</p>
                <span style={{background:C.re+"22", color:C.re, fontSize:10, fontWeight:700, borderRadius:10, padding:"1px 7px"}}>{err.tipo} · {err.nivel}</span>
              </div>
            ))}
            {errores.length > 5 && <p style={{color:C.di, fontSize:12, marginTop:4}}>…y {errores.length-5} más</p>}
          </Cd>
        )}

        {tiposError.length > 0 && (
          <div style={{background:"#1a1a2e", border:`1px solid ${C.vi}33`, borderRadius:12, padding:"12px 16px", marginBottom:20, textAlign:"left"}}>
            <p style={{color:"#a78bfa", fontSize:13}}>
              🎯 La siguiente tanda se enfocará en: <strong>{tiposError.join(", ")}</strong>
            </p>
          </div>
        )}

        <div style={{display:"flex", flexDirection:"column", gap:10}}>
          <Bt
            ch={`🤖 Siguiente tanda adaptada por IA (Tanda ${tanda+1})`}
            fn={siguienteTanda}
            st={{width:"100%", background:`linear-gradient(135deg,${C.in},${C.vi})`, padding:16, fontSize:15}}
          />
          <Bt
            ch="🔄 Repetir esta tanda"
            fn={repetirTanda}
            st={{width:"100%", background:C.card, color:C.mu, border:`1px solid ${C.bd}`}}
          />
        </div>

        {errorIA && (
          <p style={{color:C.am, fontSize:12, marginTop:12}}>
            ⚠️ No se pudo conectar con la IA — se usaron preguntas del banco local.
          </p>
        )}

        <p style={{color:C.di, fontSize:11, marginTop:14}}>
          Tanda {tanda} · {BATCH} preguntas por tanda · La IA aprende de tus errores
        </p>
      </div>
    );
  }

  if (!e) return null;
  const pts = e.s.split("___");
  const corrects = historial.filter(h=>h.correcto).length;
  const wrongs = historial.filter(h=>!h.correcto).length;

  return (
    <div style={{maxWidth:560, margin:"0 auto"}}>
      <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:6}}>
        <h2 style={{color:C.tx, fontSize:18, fontWeight:800}}>Rellena el hueco</h2>
        {tanda > 1 && (
          <span style={{background:C.vi+"22", color:C.vi, border:`1px solid ${C.vi}44`, borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700}}>
            🤖 IA · Tanda {tanda}
          </span>
        )}
      </div>
      <p style={{color:C.mu, fontSize:13, marginBottom:14}}>
        Elige la opción correcta. Explicación en español.
      </p>

      {/* Progreso y marcador */}
      <div style={{display:"flex", justifyContent:"space-between", marginBottom:6}}>
        <span style={{color:C.mu, fontSize:12}}>Pregunta {i+1}/{ex.length}</span>
        <div style={{display:"flex", gap:10}}>
          <span style={{color:C.gr, fontSize:12, fontWeight:700}}>✓ {corrects}</span>
          {wrongs > 0 && <span style={{color:C.re, fontSize:12, fontWeight:700}}>✗ {wrongs}</span>}
        </div>
      </div>
      <Pb v={i} max={ex.length}/>

      {/* Badges de tipo */}
      <div style={{display:"flex", gap:6, marginTop:8, marginBottom:12}}>
        <Bg text={e.tipo} co={e.tipo==="Gramática"?C.in:C.am}/>
        <Bg text={e.nivel} co={e.nivel==="B2"?C.vi:e.nivel==="B1"?C.am:C.gr}/>
      </div>

      {/* Pregunta */}
      <Cd st={{marginBottom:12}}>
        <p style={{color:C.tx, fontSize:18, lineHeight:1.8, fontFamily:"Georgia,serif", textAlign:"center"}}>
          {pts[0]}
          <span style={{
            display:"inline-block", minWidth:80,
            borderBottom:`2px solid ${conf?(sel===e.ans?C.gr:C.re):C.in}`,
            textAlign:"center",
            color:conf?(sel===e.ans?C.gr:C.re):C.in,
            fontWeight:700, padding:"0 8px"
          }}>
            {sel !== null ? e.ops[sel] : "___"}
          </span>
          {pts[1]}
        </p>
      </Cd>

      {/* Opciones */}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12}}>
        {e.ops.map((op,k) => {
          let bg=C.card, bd=C.bd, co=C.mu;
          if (sel===k && !conf) { bg="#1e3a5f"; bd=C.in; co=C.tx; }
          if (conf && k===e.ans) { bg="#0d2e1f"; bd=C.gr; co=C.gr; }
          if (conf && sel===k && k!==e.ans) { bg="#2e0d0d"; bd=C.re; co=C.re; }
          return (
            <div key={k} onClick={()=>!conf&&ss(k)}
              style={{background:bg, border:`2px solid ${bd}`, borderRadius:10,
                padding:"13px 14px", color:co, cursor:conf?"default":"pointer",
                textAlign:"center", fontWeight:600, fontSize:14, transition:"all .12s"
              }}
            >{op}</div>
          );
        })}
      </div>

      {/* Explicación */}
      {conf && (
        <div style={{background:C.c2, border:`1px solid ${C.bd}`, borderRadius:12, padding:"12px 16px", marginBottom:12}}>
          <p style={{color:C.mu, fontSize:13, lineHeight:1.7}}>
            {sel===e.ans?"✅":"❌"} <strong style={{color:C.tx}}>Explicación:</strong>{" "}
            <span style={{color:"#94a3b8"}}>{e.exp}</span>
          </p>
        </div>
      )}

      {!conf
        ? <Bt ch="Confirmar" fn={confirm} dis={sel===null} st={{width:"100%"}}/>
        : <Bt ch={last?"Ver resultado →":"Siguiente →"} fn={next} st={{width:"100%"}}/>
      }
    </div>
  );
}

/* ─────────────────────────────────────────────
   CONVERSACIÓN
───────────────────────────────────────────── */
function Conv() {
  const [sc,setSc]=useState(null);
  const [msgs,sm]=useState([]);
  const [inp,si]=useState("");
  const [load,sl]=useState(false);
  const bot=useRef(null);
  useEffect(()=>{bot.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  async function start(s){setSc(s);sl(true);const r=await claude([{role:"user",content:"Start the scenario now."}],s.p);sm([{role:"assistant",content:r}]);sl(false);}
  async function send(){
    if(!inp.trim()||load)return;
    const um={role:"user",content:inp};
    sm(p=>[...p,um]);si("");sl(true);
    const r=await claude([...msgs,um],sc.p);
    sm(p=>[...p,{role:"assistant",content:r}]);sl(false);
  }

  if(!sc)return(
    <div>
      <h2 style={{color:C.tx,fontSize:20,fontWeight:800,marginBottom:6}}>Conversación con IA</h2>
      <p style={{color:C.mu,fontSize:14,marginBottom:6}}>La IA habla en inglés y corrige tus errores en español entre paréntesis.</p>
      <div style={{background:"#1a1a2e",border:`1px solid ${C.vi}33`,borderRadius:12,padding:"11px 14px",marginBottom:20}}>
        <p style={{color:"#a78bfa",fontSize:13}}>💡 Habla en inglés todo lo que puedas. Los errores se corrigen en español para que entiendas.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {SCEN.map(s=><Cd key={s.id} fn={()=>start(s)}>
          <div style={{fontSize:26,marginBottom:8}}>{s.ic}</div>
          <h3 style={{color:C.tx,fontSize:14,fontWeight:700,marginBottom:4}}>{s.t}</h3>
          <p style={{color:C.mu,fontSize:12,lineHeight:1.5,marginBottom:10}}>{s.d}</p>
          <Bg text={s.niv} co={C.in}/>
        </Cd>)}
      </div>
    </div>
  );

  return(
    <div style={{maxWidth:660,margin:"0 auto",display:"flex",flexDirection:"column",height:"66vh"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        <button onClick={()=>{setSc(null);sm([]);}} style={{background:"none",border:"none",color:C.in,cursor:"pointer",fontSize:13,padding:0}}>← Escenarios</button>
        <span style={{color:C.bd}}>|</span>
        <span>{sc.ic}</span>
        <h3 style={{color:C.tx,fontSize:14,fontWeight:700}}>{sc.t}</h3>
      </div>
      <div style={{background:"#0a1520",border:`1px solid ${C.bd}`,borderRadius:10,padding:"8px 12px",marginBottom:8}}>
        <p style={{color:C.di,fontSize:11}}>🇬🇧 La IA habla en inglés · Las correcciones aparecen en español entre paréntesis</p>
      </div>
      <div style={{flex:1,overflow:"auto",background:"#0a1520",border:`1px solid ${C.bd}`,borderRadius:14,padding:16,display:"flex",flexDirection:"column",gap:12}}>
        {msgs.map((m,k)=>(
          <div key={k} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{maxWidth:"78%",background:m.role==="user"?C.in:C.c2,border:m.role!=="user"?`1px solid ${C.bd}`:"none",borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",padding:"11px 14px",color:m.role==="user"?"#fff":"#cbd5e1",fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{m.content}</div>
          </div>
        ))}
        {load&&<div style={{display:"flex"}}><div style={{background:C.c2,border:`1px solid ${C.bd}`,borderRadius:"16px 16px 16px 4px",padding:"11px 14px",color:C.di,fontSize:13}}>Escribiendo…</div></div>}
        <div ref={bot}/>
      </div>
      <div style={{marginTop:8,display:"flex",gap:8}}>
        <input value={inp} onChange={e=>si(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Escribe en inglés…" style={{flex:1,background:C.card,border:`1px solid ${C.bd}`,borderRadius:10,padding:"12px 14px",color:C.tx,fontSize:13,outline:"none",fontFamily:"inherit"}}/>
        <Bt ch="Enviar" fn={send} dis={load}/>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PALABRA DEL DÍA
───────────────────────────────────────────── */
function Palabra() {
  const w=WORDS[new Date().getDay()%WORDS.length];
  return(
    <div style={{background:"linear-gradient(135deg,#0f1923,#1a1a2e)",border:`1px solid #2d1f5e`,borderRadius:18,padding:"22px 26px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div>
          <p style={{color:C.vi,fontSize:11,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>PALABRA DEL DÍA</p>
          <h2 style={{color:C.tx,fontSize:26,fontWeight:900,letterSpacing:-0.5}}>{w.w}</h2>
          <p style={{color:C.di,fontSize:12,fontFamily:"monospace"}}>{w.ph}</p>
        </div>
        <Bg text={w.niv} co={C.vi}/>
      </div>
      <p style={{color:"#94a3b8",fontSize:14,marginBottom:10,lineHeight:1.5}}>{w.es}</p>
      <div style={{background:C.c2,borderLeft:`3px solid ${C.vi}`,borderRadius:"0 8px 8px 0",padding:"10px 14px"}}>
        <p style={{color:"#c4b5fd",fontSize:13,fontStyle:"italic",lineHeight:1.6}}>"{w.ej}"</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CALENDARIO RACHA
───────────────────────────────────────────── */
function Racha({dias}) {
  const d=[];
  for(let i=6;i>=0;i--){const dd=new Date();dd.setDate(dd.getDate()-i);const s=dd.toISOString().slice(0,10);d.push({s,lb:dd.toLocaleDateString("es",{weekday:"short"}),on:dias.includes(s)});}
  return(
    <div>
      <p style={{color:C.di,fontSize:11,fontWeight:700,letterSpacing:1,marginBottom:8}}>ÚLTIMOS 7 DÍAS</p>
      <div style={{display:"flex",gap:6,justifyContent:"space-between"}}>
        {d.map(x=>(
          <div key={x.s} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <div style={{width:34,height:34,borderRadius:8,background:x.on?C.in:C.c2,border:`1px solid ${x.on?C.in:C.bd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{x.on?"🔥":"·"}</div>
            <span style={{color:x.on?C.tx:C.di,fontSize:10,fontWeight:600,textTransform:"capitalize"}}>{x.lb}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   APP PRINCIPAL
───────────────────────────────────────────── */
const DEF = {screen:"welcome",lv:"A2",xp:0,streak:0,dias:[],done:[],testScore:0};

export default function App() {
  const [st, setSt]   = useState(DEF);
  const [rdy, setRdy] = useState(false);
  const [saving, setSaving] = useState(false);
  const firstRun = useRef(true);
  const saveTimer = useRef(null);

  // ── Cargar al montar ──────────────────────
  useEffect(()=>{
    storageLoad().then(data=>{
      if(data) setSt(data);
      setRdy(true);
    });
  },[]);

  // ── Guardar cuando cambia st (después de cargar) ──
  useEffect(()=>{
    if(!rdy) return;
    if(firstRun.current){ firstRun.current=false; return; }
    clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current=setTimeout(()=>{
      storageSave(st).then(()=>setSaving(false));
    },400);
  },[st, rdy]);

  // ── Marcar hoy como activo ────────────────
  useEffect(()=>{
    if(!rdy) return;
    const today=hoy();
    if(st.dias.includes(today)) return;
    const yest=new Date(); yest.setDate(yest.getDate()-1);
    const hadYest=st.dias.includes(yest.toISOString().slice(0,10));
    setSt(p=>({...p,dias:[...p.dias,today].slice(-30),streak:hadYest?p.streak+1:1}));
  },[rdy]);

  const [tab,setTab]=useState("home");
  const [lesson,setLesson]=useState(null);
  const [sub,setSub]=useState(null);

  function up(patch){ setSt(p=>({...p,...patch})); }

  if(!rdy) return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <p style={{color:C.mu,fontFamily:"sans-serif"}}>Cargando tu progreso…</p>
    </div>
  );

  const {screen,lv,xp,streak,dias,done,testScore}=st;
  const all=LESSONS[lv]||[];
  const ndone=all.filter(l=>done.includes(l.id)).length;
  const nr=calcNivel(testScore);

  // ── Bienvenida ────────────────────────────
  if(screen==="welcome") return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif",padding:24}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{maxWidth:480,textAlign:"center"}}>
        <div style={{fontSize:68,marginBottom:20}}>🇬🇧</div>
        <h1 style={{color:C.tx,fontSize:38,fontWeight:900,letterSpacing:-1,marginBottom:14,lineHeight:1.1}}>
          Tu camino al inglés<br/>
          <span style={{background:`linear-gradient(135deg,${C.in},${C.vi})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>empieza aquí</span>
        </h1>
        <p style={{color:C.mu,fontSize:15,lineHeight:1.7,marginBottom:36}}>
          De A2 a B2 con lecciones diarias, conversación con IA y ejercicios. <strong style={{color:C.tx}}>Todo explicado en español.</strong><br/>Tu progreso se guarda automáticamente.
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <Bt ch="🎯 Hacer el test de nivel (recomendado)" fn={()=>up({screen:"test"})} st={{padding:16,fontSize:16,background:`linear-gradient(135deg,${C.in},${C.vi})`}}/>
          <Bt ch="Saltar — empezar en A2" fn={()=>up({screen:"app"})} st={{background:C.card,color:C.mu,border:`1px solid ${C.bd}`,fontSize:14}}/>
        </div>
        <p style={{color:"#334155",fontSize:12,marginTop:16}}>20 preguntas · ~5 min · Progreso guardado automáticamente 💾</p>
      </div>
    </div>
  );

  if(screen==="test") return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif",padding:"36px 22px"}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{textAlign:"center",marginBottom:30}}>
        <h1 style={{color:C.tx,fontSize:24,fontWeight:800,marginBottom:4}}>Test de nivel</h1>
        <p style={{color:C.mu,fontSize:13}}>Gramática · Vocabulario · Comprensión lectora</p>
      </div>
      <Test onDone={score=>up({testScore:score,screen:"results"})}/>
    </div>
  );

  if(screen==="results") return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif",padding:"36px 22px"}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <Res score={testScore} onOk={nlv=>up({lv:nlv,screen:"app"})}/>
    </div>
  );

  // ── App principal ─────────────────────────
  const tabs=[{id:"home",ic:"🏠",lb:"Inicio"},{id:"lessons",ic:"📖",lb:"Lecciones"},{id:"practice",ic:"✏️",lb:"Ejercicios"},{id:"speak",ic:"🎤",lb:"Hablar"}];

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif",display:"flex",flexDirection:"column"}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0a1520}::-webkit-scrollbar-thumb{background:#1e2a3a;border-radius:4px}`}</style>

      {/* Header */}
      <header style={{padding:"13px 20px",borderBottom:`1px solid ${C.card}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:"#050b12"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:20}}>🇬🇧</span>
          <span style={{color:C.tx,fontWeight:900,fontSize:17,letterSpacing:-0.5}}>EnglishUp</span>
          <span style={{background:saving?"#f59e0b22":"#10b98122",color:saving?C.am:C.gr,border:`1px solid ${saving?C.am+"44":C.gr+"44"}`,borderRadius:20,padding:"1px 7px",fontSize:10,fontWeight:700}}>
            {saving?"GUARDANDO…":"✓ GUARDADO"}
          </span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span>🔥 <strong style={{color:"#f97316"}}>{streak}</strong></span>
          <span>⚡ <strong style={{color:C.am}}>{xp} XP</strong></span>
          <Bg text={lv} co={C.in}/>
        </div>
      </header>

      {/* Main */}
      <main style={{flex:1,padding:"20px",overflowY:"auto"}}>
        {lesson?(
          <Leccion lesson={lesson} onBack={()=>setLesson(null)} onDone={l=>{up({done:[...new Set([...done,l.id])],xp:xp+l.xp});setLesson(null);}}/>

        ):tab==="home"?(
          <div style={{maxWidth:700,margin:"0 auto"}}>
            <h1 style={{color:C.tx,fontSize:22,fontWeight:800,marginBottom:4}}>¡Buenas! 👋</h1>
            <p style={{color:C.mu,fontSize:14,marginBottom:20}}>Mantén tu racha — aprendamos algo hoy.</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
              {[{l:"Días seguidos",v:streak,i:"🔥",c:"#f97316"},{l:"XP total",v:xp,i:"⚡",c:C.am},{l:"Lecciones",v:ndone,i:"✅",c:C.gr}].map(x=>(
                <Cd key={x.l} st={{padding:"14px 16px"}}>
                  <div style={{fontSize:18,marginBottom:4}}>{x.i}</div>
                  <div style={{color:x.c,fontSize:22,fontWeight:900}}>{x.v}</div>
                  <div style={{color:C.di,fontSize:11,marginTop:2}}>{x.l}</div>
                </Cd>
              ))}
            </div>
            <Cd st={{marginBottom:16}}><Racha dias={dias}/></Cd>
            <Cd st={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{color:"#94a3b8",fontSize:13,fontWeight:600}}>Progreso ({lv} → {nr.sg})</span>
                <span style={{color:C.in,fontSize:13,fontWeight:700}}>{ndone}/{all.length}</span>
              </div>
              <Pb v={ndone} max={all.length}/>
            </Cd>
            <div style={{marginBottom:16}}><Palabra/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[
                {ic:"📖",tt:"Lecciones de hoy",  ds:"Track "+lv,      tb:"lessons",  co:C.in},
                {ic:"✏️",tt:"Ejercicios",          ds:"Flashcards y huecos", tb:"practice", co:C.am},
                {ic:"🎤",tt:"Hablar con la IA",   ds:"Conversación real",   tb:"speak",    co:C.gr},
                {ic:"🔄",tt:"Repetir el test",    ds:"Actualiza tu nivel",  tb:null,       co:C.vi,fn:()=>up({screen:"test"})},
              ].map(x=>(
                <Cd key={x.tt} fn={x.fn||(()=>{setTab(x.tb);setSub(null);})} st={{padding:"16px"}}>
                  <div style={{fontSize:24,marginBottom:6}}>{x.ic}</div>
                  <h3 style={{color:C.tx,fontSize:13,fontWeight:700,marginBottom:2}}>{x.tt}</h3>
                  <p style={{color:C.di,fontSize:11}}>{x.ds}</p>
                </Cd>
              ))}
            </div>
          </div>

        ):tab==="lessons"?(
          <div style={{maxWidth:660,margin:"0 auto"}}>
            <h2 style={{color:C.tx,fontSize:20,fontWeight:800,marginBottom:4}}>Lecciones — {lv}</h2>
            <p style={{color:C.mu,fontSize:13,marginBottom:18}}>Explicaciones en español · Práctica en inglés · Se guarda automáticamente 💾</p>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {all.map(l=>{
                const dn=done.includes(l.id);
                const tc={Gramática:C.in,Vocabulario:C.am,Conversación:C.gr,Escritura:"#06b6d4"};
                return(
                  <div key={l.id} onClick={()=>setLesson(l)} style={{background:C.card,border:`1px solid ${dn?C.gr+"44":C.bd}`,borderRadius:14,padding:"18px 20px",cursor:"pointer",display:"flex",alignItems:"flex-start",gap:12,transition:"border .15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=dn?C.gr:C.in} onMouseLeave={e=>e.currentTarget.style.borderColor=dn?C.gr+"44":C.bd}>
                    <span style={{fontSize:26,lineHeight:1}}>{l.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                        <Bg text={l.tag} co={tc[l.tag]||C.in}/>
                        <span style={{color:C.di,fontSize:11}}>+{l.xp} XP</span>
                        {dn&&<span style={{color:C.gr,fontSize:11,fontWeight:700}}>✓ Completada</span>}
                      </div>
                      <h3 style={{color:C.tx,fontSize:15,fontWeight:700,marginBottom:2}}>{l.title}</h3>
                      <p style={{color:C.di,fontSize:12,lineHeight:1.5}}>{l.desc.slice(0,85)}…</p>
                    </div>
                    <span style={{color:C.di,fontSize:18,alignSelf:"center"}}>›</span>
                  </div>
                );
              })}
            </div>
            <div style={{marginTop:24,borderTop:`1px solid ${C.bd}`,paddingTop:18}}>
              <p style={{color:C.di,fontSize:11,fontWeight:700,letterSpacing:1,marginBottom:10}}>OTROS NIVELES</p>
              <div style={{display:"flex",gap:8}}>
                {Object.keys(LESSONS).filter(x=>x!==lv).map(x=>(
                  <button key={x} onClick={()=>up({lv:x})} style={{padding:"8px 18px",background:C.card,border:`1px solid ${C.bd}`,borderRadius:10,color:C.mu,fontSize:12,fontWeight:700,cursor:"pointer"}}>Nivel {x}</button>
                ))}
              </div>
            </div>
          </div>

        ):tab==="practice"?(
          <div style={{maxWidth:660,margin:"0 auto"}}>
            {!sub&&<>
              <h2 style={{color:C.tx,fontSize:20,fontWeight:800,marginBottom:4}}>Ejercicios</h2>
              <p style={{color:C.mu,fontSize:13,marginBottom:20}}>Refuerza lo aprendido. Explicaciones siempre en español.</p>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {[
                  {m:"flash",ic:"🃏",tt:"Flashcards",     ds:`Repasa ${(CARDS[lv]||[]).length} palabras clave del nivel ${lv}. Definición en español.`,co:C.vi},
                  {m:"blank",ic:"✏️",tt:"Rellena el hueco",ds:`20 ejercicios adaptativos. La IA aprende de tus errores para el siguiente bloque.`,         co:C.am},
                ].map(x=>(
                  <Cd key={x.m} fn={()=>setSub(x.m)} st={{display:"flex",gap:14,alignItems:"center"}}>
                    <span style={{fontSize:32}}>{x.ic}</span>
                    <div style={{flex:1}}>
                      <h3 style={{color:C.tx,fontSize:15,fontWeight:700,marginBottom:3}}>{x.tt}</h3>
                      <p style={{color:C.mu,fontSize:12,lineHeight:1.5}}>{x.ds}</p>
                    </div>
                    <Bg text={lv} co={x.co}/>
                  </Cd>
                ))}
              </div>
            </>}
            {sub==="flash"&&<><button onClick={()=>setSub(null)} style={{background:"none",border:"none",color:C.in,cursor:"pointer",fontSize:13,marginBottom:18,padding:0}}>← Volver</button><Flash lv={lv}/></>}
            {sub==="blank"&&<><button onClick={()=>setSub(null)} style={{background:"none",border:"none",color:C.in,cursor:"pointer",fontSize:13,marginBottom:18,padding:0}}>← Volver</button><Blanks lv={lv} onXP={n=>up({xp:xp+n*5})}/></>}
          </div>

        ):tab==="speak"?<Conv/>:null}
      </main>

      {/* Nav */}
      <nav style={{borderTop:`1px solid ${C.card}`,display:"flex",background:"#050b12"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>{setTab(t.id);setLesson(null);setSub(null);}} style={{flex:1,padding:"11px 8px 9px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
            <span style={{fontSize:17}}>{t.ic}</span>
            <span style={{fontSize:10,fontWeight:700,color:tab===t.id?C.in:"#334155"}}>{t.lb}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

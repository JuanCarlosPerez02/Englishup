import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────
   SUPABASE
───────────────────────────────────────────── */
const SUPA_URL = "https://ilcdiukubzujgfdaoacm.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsY2RpdWt1Ynp1amdmZGFvYWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzIzMjUsImV4cCI6MjA4ODgwODMyNX0.DSvIQcmrH4cDDuL8naxlFAG-4m8ImA5iulopOsiZcI4";
const supa = {
  h: { "Content-Type":"application/json", "apikey":SUPA_KEY, "Authorization":`Bearer ${SUPA_KEY}` },
  async signUp(e,p){const r=await fetch(`${SUPA_URL}/auth/v1/signup`,{method:"POST",headers:this.h,body:JSON.stringify({email:e,password:p})});return r.json();},
  async signIn(e,p){const r=await fetch(`${SUPA_URL}/auth/v1/token?grant_type=password`,{method:"POST",headers:this.h,body:JSON.stringify({email:e,password:p})});return r.json();},
  async signOut(t){await fetch(`${SUPA_URL}/auth/v1/logout`,{method:"POST",headers:{...this.h,"Authorization":`Bearer ${t}`}});},
  async load(t,id){const r=await fetch(`${SUPA_URL}/rest/v1/progress?id=eq.${id}&select=data`,{headers:{...this.h,"Authorization":`Bearer ${t}`}});const rows=await r.json();return rows?.[0]?.data||null;},
  async save(t,id,data){await fetch(`${SUPA_URL}/rest/v1/progress`,{method:"POST",headers:{...this.h,"Authorization":`Bearer ${t}`,"Prefer":"resolution=merge-duplicates"},body:JSON.stringify({id,data,updated_at:new Date().toISOString()})});}
};

/* ─────────────────────────────────────────────
   DATOS
───────────────────────────────────────────── */
const TEST_Q=[
  {id:1, tipo:"Gramática",   nivel:"A2",q:"She ___ to work every day by bus.",                ops:["go","goes","going","gone"],ans:1},
  {id:2, tipo:"Gramática",   nivel:"A2",q:"I ___ seen that movie before.",                    ops:["have","has","had","am"],ans:0},
  {id:3, tipo:"Gramática",   nivel:"A2",q:"They ___ playing football when it started to rain.",ops:["was","were","are","be"],ans:1},
  {id:4, tipo:"Gramática",   nivel:"B1",q:"If I ___ more time, I would travel more.",         ops:["have","had","will have","would have"],ans:1},
  {id:5, tipo:"Gramática",   nivel:"B1",q:"The report ___ by the manager last week.",         ops:["wrote","is written","was written","has written"],ans:2},
  {id:6, tipo:"Gramática",   nivel:"B1",q:"She suggested ___ a different approach.",          ops:["try","to try","trying","tried"],ans:2},
  {id:7, tipo:"Gramática",   nivel:"B2",q:"Had I known about the meeting, I ___ earlier.",    ops:["would come","would have come","will come","came"],ans:1},
  {id:8, tipo:"Gramática",   nivel:"B2",q:"Despite ___ tired, she finished the project.",     ops:["be","been","being","to be"],ans:2},
  {id:9, tipo:"Vocabulario", nivel:"A2",q:"¿Qué significa 'purchase'?",                       ops:["vender","comprar","alquilar","perder"],ans:1},
  {id:10,tipo:"Vocabulario", nivel:"A2",q:"¿Cuál es el opuesto de 'ancient'?",               ops:["viejo","histórico","moderno","roto"],ans:2},
  {id:11,tipo:"Vocabulario", nivel:"B1",q:"Si algo es 'mandatory', significa que es:",        ops:["opcional","prohibido","obligatorio","caro"],ans:2},
  {id:12,tipo:"Vocabulario", nivel:"B1",q:"She was ___ to finish on time. (muy nerviosa)",    ops:["anxious","happy","bored","confused"],ans:0},
  {id:13,tipo:"Vocabulario", nivel:"B2",q:"'To mitigate' un problema significa:",             ops:["ignorarlo","empeorarlo","reducir su impacto","resolverlo por completo"],ans:2},
  {id:14,tipo:"Vocabulario", nivel:"B2",q:"His speech was very ___; everyone was inspired.",  ops:["mundane","eloquent","vague","tedious"],ans:1},
  {id:15,tipo:"Comprensión", nivel:"A2",q:'"Tom usually wakes up at 7am, but today woke up at 9am." ¿Por qué llegó tarde?',ops:["Estaba cansado","Era fin de semana","El texto no lo dice","No tenía alarma"],ans:2},
  {id:16,tipo:"Comprensión", nivel:"B1",q:'"The company, despite initial losses, managed to turn a profit by Q3." La empresa fue finalmente:',ops:["a la quiebra","exitosa","vendida","cerrada"],ans:1},
  {id:17,tipo:"Comprensión", nivel:"B2",q:'"The policy was met with ambivalence." La reacción fue:',ops:["totalmente positiva","totalmente negativa","mixta","indiferente"],ans:2},
  {id:18,tipo:"Gramática",   nivel:"B1",q:"Elige la oración correcta:",                       ops:["I am here since two hours","I have been here for two hours","I was here since two hours","I am here for two hours"],ans:1},
  {id:19,tipo:"Gramática",   nivel:"B2",q:"The results were better than ___ expected.",       ops:["we","us","our","ours"],ans:0},
  {id:20,tipo:"Vocabulario", nivel:"B2",q:"'A paradigm shift' hace referencia a:",            ops:["un cambio pequeño","un cambio fundamental de enfoque","una tendencia temporal","un experimento científico"],ans:1},
];

const LESSONS={
  A2:[
    {id:"a2-1",title:"Present Perfect",    icon:"⏰",tag:"Gramática",   xp:20,desc:"El Present Perfect se forma con 'have/has + participio pasado'. Se usa para hablar de experiencias de vida o acciones recientes con resultado en el presente.",ejs:["I have visited Paris. → He visitado París.","She has eaten sushi before. → Ella ha comido sushi antes.","We haven't seen that film. → No hemos visto esa película."],tip:"Usa 'ever' y 'never' con el Present Perfect: Have you ever been to London?",prac:"Completa: Have you ever ___? → Yes, I have ___ / No, I have never ___."},
    {id:"a2-2",title:"Everyday Vocabulary", icon:"📚",tag:"Vocabulario", xp:15,desc:"Palabras esenciales para el día a día. Aprenderlas en contexto es mucho más efectivo que memorizarlas sueltas.",ejs:["appointment (cita) → I have a doctor's appointment at 3pm.","commute (trayecto) → My commute takes 45 minutes.","receipt (recibo) → Can I have a receipt, please?"],tip:"Cada vez que aprendas una palabra nueva, escríbela en una frase propia.",prac:"Traduce y usa en una frase: schedule, deadline, discount."},
    {id:"a2-3",title:"Asking for Help",     icon:"🙋",tag:"Conversación",xp:25,desc:"Frases educadas para pedir ayuda o pedir que repitan algo. Muy útiles cuando hablas con alguien y no entiendes.",ejs:["Could you help me with this? → ¿Podría ayudarme?","I'm sorry, could you repeat that? → Perdona, ¿podrías repetirlo?","Would you mind speaking more slowly?"],tip:"'Could' es más educado que 'can'. Úsalo siempre en situaciones formales.",prac:"Practica: Could you ___ me with ___? / I didn't quite understand, could you ___?"},
    {id:"a2-4",title:"Past Simple",         icon:"🕰️",tag:"Gramática",   xp:20,desc:"El Past Simple describe acciones terminadas en un momento concreto del pasado.",ejs:["I went to the cinema yesterday. → Fui al cine ayer.","She didn't call me last night.","Did you see the news?"],tip:"Verbos regulares añaden -ed (walk→walked). Irregulares cambian de forma (go→went).",prac:"Yesterday I ___ (wake up) at 8am. Then I ___ (have) breakfast and ___ (go) to work."},
    {id:"a2-5",title:"Making Plans",        icon:"📅",tag:"Conversación",xp:20,desc:"Cómo hablar de planes futuros y quedar con alguien en inglés.",ejs:["I'm going to visit my family next weekend.","Are you free on Friday?","Let's meet at 7pm outside the cinema."],tip:"Usa 'going to' para planes ya decididos. 'Will' para decisiones espontáneas.",prac:"What are you going to do this weekend? → I'm going to ___ with ___."},
  ],
  B1:[
    {id:"b1-1",title:"2nd & 3rd Conditional",icon:"🔀",tag:"Gramática",  xp:30,desc:"Los condicionales 2º y 3º expresan situaciones hipotéticas.",ejs:["2º: If I won the lottery, I would travel the world.","3º: If she had studied harder, she would have passed.","Mezcla: If you had called, I would know what to do now."],tip:"2º = imaginario ahora/futuro. 3º = lamento del pasado.",prac:"If I ___ (be) richer, I would ___. / If I had ___ (know) earlier, I would have ___."},
    {id:"b1-2",title:"Linking Words",        icon:"🔗",tag:"Escritura",   xp:25,desc:"Los conectores unen ideas y hacen tu inglés más fluido.",ejs:["Contraste: However / Despite this","Adición: Furthermore / In addition","Causa-efecto: As a result / Therefore"],tip:"Dominar 'however', 'therefore' y 'furthermore' separa B1 de B2.",prac:"Escribe 3 frases usando 'however', 'furthermore' y 'therefore'."},
    {id:"b1-3",title:"Describing Feelings",  icon:"💬",tag:"Conversación",xp:20,desc:"Cómo expresar emociones con precisión.",ejs:["I'm overwhelmed with work.","She seemed hesitant about the decision.","He came across as quite confident."],tip:"En vez de 'very happy': thrilled, elated, content. En vez de 'very sad': devastated.",prac:"Sustituye: 'I'm very happy' → I'm ___. / 'She was very nervous' → She was ___."},
    {id:"b1-4",title:"Reported Speech",      icon:"🗣️",tag:"Gramática",   xp:30,desc:"El estilo indirecto se usa para contar lo que alguien dijo. El verbo retrocede un tiempo.",ejs:["'I am tired.' → He said he was tired.","'I have finished.' → She told me she had finished.","'I will help you.' → They said they would help me."],tip:"Regla: am/is→was · have→had · will→would · can→could.",prac:"'I am hungry.' → He said he ___ hungry. / 'I will call you.' → She said she ___ call me."},
    {id:"b1-5",title:"Phrasal Verbs",        icon:"🚀",tag:"Vocabulario", xp:25,desc:"Verbos + partícula cuyo significado conjunto suele ser diferente al literal.",ejs:["look after → cuidar","figure out → resolver","call off → cancelar"],tip:"¡El significado no es literal! Apréndelos como palabras nuevas.",prac:"Usa en una frase: give up, put off, run out of."},
  ],
  B2:[
    {id:"b2-1",title:"Advanced Passives",   icon:"🏗️",tag:"Gramática",   xp:35,desc:"Las pasivas avanzadas se usan en inglés formal, académico y periodístico.",ejs:["It is believed that...","He is said to have resigned.","The problem is thought to be serious."],tip:"'It is + reported/believed/said/thought + that...' es muy común en noticias.",prac:"Transforma: 'People think she is the best candidate.' → She ___ (consider) the best candidate."},
    {id:"b2-2",title:"Nuanced Vocabulary",  icon:"✨",tag:"Vocabulario",  xp:30,desc:"El vocabulario matizado te permite expresar ideas con precisión.",ejs:["eloquent vs. 'good at speaking'","meticulous vs. 'very careful'","pragmatic vs. 'practical'"],tip:"Aprende sinónimos con intensidades: tired → weary → exhausted → drained.",prac:"Sustituye 'very important' → crucial/pivotal. 'very tired' → exhausted/drained."},
    {id:"b2-3",title:"Debate & Argue",      icon:"🎤",tag:"Conversación",xp:40,desc:"Cómo expresar, defender y matizar opiniones de forma profesional.",ejs:["I'd like to put forward the idea that...","While I see your point, I'd argue that...","The evidence suggests that..."],tip:"Reconoce primero el punto de vista del otro antes de rebatirlo.",prac:"Practica: 'That's a fair point. However, I believe ___ because ___."},
    {id:"b2-4",title:"Inversion",           icon:"🔄",tag:"Gramática",   xp:40,desc:"La inversión se usa en inglés formal para dar énfasis.",ejs:["Never have I seen such dedication.","Not only did she win, but she broke the record.","Rarely do we see such commitment."],tip:"Aparece después de: Never, Rarely, Seldom, Not only, Hardly, No sooner.",prac:"Reescribe: 'I have never been so surprised.' → Never ___ I been so surprised."},
    {id:"b2-5",title:"Academic Writing",    icon:"📝",tag:"Escritura",   xp:35,desc:"Cómo escribir de forma clara y persuasiva en inglés formal.",ejs:["This essay will argue that...","The data clearly demonstrates that...","In conclusion, it can be seen that..."],tip:"Evita contracciones. Usa estructuras impersonales.",prac:"Reescribe formalmente: 'The thing is, lots of people don't agree.'"},
  ],
};

const CARDS={
  A2:[
    {f:"appointment",b:"(sustantivo) Cita o reunión a una hora concreta.\n\n'I have a doctor's appointment at 3pm.'\n→ Tengo cita con el médico a las 3."},
    {f:"commute",    b:"(sustantivo/verbo) El trayecto diario al trabajo.\n\n'My commute takes 45 minutes.'\n→ Mi trayecto dura 45 minutos."},
    {f:"anxious",    b:"(adjetivo) Nervioso/a o preocupado/a.\n\n'She felt anxious before the exam.'\n→ Estaba ansiosa antes del examen."},
    {f:"purchase",   b:"(verbo) Comprar — más formal que 'buy'.\n\n'You can purchase tickets online.'\n→ Puedes comprar entradas online."},
    {f:"schedule",   b:"(sustantivo) Horario o agenda.\n\n'Let me check my schedule.'\n→ Déjame revisar mi agenda."},
    {f:"receipt",    b:"(sustantivo) Recibo o ticket de compra.\n\n'Can I have a receipt, please?'\n→ ¿Me podría dar un recibo?"},
  ],
  B1:[
    {f:"mandatory",   b:"(adjetivo) Obligatorio, requerido por ley.\n\n'Attendance is mandatory.'\n→ La asistencia es obligatoria."},
    {f:"figure out",  b:"(phrasal verb) Entender o resolver algo.\n\n'I can't figure out this problem.'\n→ No consigo resolver este problema."},
    {f:"overwhelmed", b:"(adjetivo) Desbordado/a, con demasiado que gestionar.\n\n'She felt overwhelmed by her workload.'\n→ Se sentía desbordada por el trabajo."},
    {f:"consequently",b:"(conector) En consecuencia, por lo tanto.\n\n'He didn't study. Consequently, he failed.'\n→ No estudió. Por tanto, suspendió."},
    {f:"hesitant",    b:"(adjetivo) Indeciso/a, que duda antes de actuar.\n\n'She was hesitant to speak in public.'\n→ Le costaba hablar en público."},
    {f:"call off",    b:"(phrasal verb) Cancelar.\n\n'The match was called off due to rain.'\n→ El partido fue cancelado por la lluvia."},
  ],
  B2:[
    {f:"resilient",     b:"(adjetivo) Resistente, que se recupera rápido.\n\n'Children are remarkably resilient.'\n→ Los niños son sorprendentemente resistentes."},
    {f:"meticulous",    b:"(adjetivo) Meticuloso/a, muy cuidadoso con los detalles.\n\n'Her meticulous work impressed everyone.'\n→ Su trabajo meticuloso impresionó a todos."},
    {f:"eloquent",      b:"(adjetivo) Elocuente, fluido y persuasivo.\n\n'He gave an eloquent speech.'\n→ Dio un discurso elocuente."},
    {f:"mitigate",      b:"(verbo) Mitigar, reducir la gravedad de algo.\n\n'We must mitigate the risks.'\n→ Debemos mitigar los riesgos."},
    {f:"ambiguous",     b:"(adjetivo) Ambiguo/a, puede interpretarse de más de una forma.\n\n'The instructions were ambiguous.'\n→ Las instrucciones eran ambiguas."},
    {f:"paradigm shift",b:"(locución) Cambio de paradigma, cambio fundamental de enfoque.\n\n'AI represents a paradigm shift.'\n→ La IA representa un cambio de paradigma."},
  ],
};

const BLANKS_BASE=[
  {s:"I ___ to the gym three times a week.",       ops:["go","goes","went","going"],             ans:0,exp:"Presente simple con 'I': forma base. Con she/he/it → 'she goes'.",tipo:"Gramática",nivel:"A2"},
  {s:"She ___ already eaten lunch.",               ops:["have","has","had","is"],                ans:1,exp:"Present Perfect: 'has' con she/he/it. 'Have' con I/you/we/they.",tipo:"Gramática",nivel:"A2"},
  {s:"They ___ football yesterday.",               ops:["play","plays","played","playing"],      ans:2,exp:"'Yesterday' indica pasado → Past Simple: 'played'.",tipo:"Gramática",nivel:"A2"},
  {s:"___ you help me with this, please?",         ops:["Can","Could","Would","Should"],         ans:1,exp:"'Could' es más educado que 'can'. Úsalo al pedir un favor.",tipo:"Gramática",nivel:"A2"},
  {s:"I ___ TV when my phone rang.",               ops:["watch","watched","was watching","am watching"],ans:2,exp:"Past Continuous: acción en progreso interrumpida. 'was/were + -ing'.",tipo:"Gramática",nivel:"A2"},
  {s:"Can I have the ___ for my purchase?",        ops:["recipe","receipt","receive","record"],  ans:1,exp:"'Receipt' = recibo/ticket. No confundir con 'recipe' (receta).",tipo:"Vocabulario",nivel:"A2"},
  {s:"Let me check my ___. I'm free at 3pm.",      ops:["schedule","school","scheme","scale"],   ans:0,exp:"'Schedule' = horario/agenda. Muy usado en inglés de negocios.",tipo:"Vocabulario",nivel:"A2"},
  {s:"If I ___ you, I would apologise.",           ops:["am","was","were","be"],                 ans:2,exp:"2º condicional: usamos 'were' para todas las personas.",tipo:"Gramática",nivel:"B1"},
  {s:"The package ___ delivered yesterday.",       ops:["was","were","had","is"],                ans:0,exp:"Voz pasiva en pasado: was/were + participio. Singular → 'was'.",tipo:"Gramática",nivel:"B1"},
  {s:"She suggested ___ a break.",                 ops:["take","to take","taking","took"],       ans:2,exp:"'Suggest' va seguido de gerundio (-ing).",tipo:"Gramática",nivel:"B1"},
  {s:"I've worked here ___ 2019.",                 ops:["for","since","from","during"],          ans:1,exp:"'Since' + punto concreto. 'For' + duración (for 3 years).",tipo:"Gramática",nivel:"B1"},
  {s:"He said he ___ tired.",                      ops:["is","was","were","be"],                 ans:1,exp:"Estilo indirecto: el verbo retrocede. 'is' → 'was'.",tipo:"Gramática",nivel:"B1"},
  {s:"The meeting was ___.",                       ops:["called off","called up","called in","called on"],ans:0,exp:"'Call off' = cancelar.",tipo:"Vocabulario",nivel:"B1"},
  {s:"I can't ___ why it stopped working.",        ops:["figure out","figure in","figure up","figure off"],ans:0,exp:"'Figure out' = entender/resolver algo.",tipo:"Vocabulario",nivel:"B1"},
  {s:"___ have I seen such a problem.",            ops:["Ever","Rarely","Sometimes","Often"],    ans:1,exp:"Inversión después de adverbios negativos: Rarely, Never...",tipo:"Gramática",nivel:"B2"},
  {s:"It is widely ___ that exercise helps.",      ops:["believed","believing","believe","to believe"],ans:0,exp:"Pasiva impersonal: 'It is + participio + that...'.",tipo:"Gramática",nivel:"B2"},
  {s:"___ she finished, she went home.",           ops:["As soon as","Despite","Although","However"],ans:0,exp:"'As soon as' = en cuanto / tan pronto como.",tipo:"Gramática",nivel:"B2"},
  {s:"The findings ___ further research.",         ops:["warrant","warrants","warranting","warranted"],ans:0,exp:"'Findings' es plural → verbo plural: 'warrant'.",tipo:"Vocabulario",nivel:"B2"},
  {s:"Her ___ speech inspired the whole team.",    ops:["eloquent","elegant","elusive","elaborate"],ans:0,exp:"'Eloquent' = elocuente, fluido y persuasivo.",tipo:"Vocabulario",nivel:"B2"},
  {s:"We need to ___ the risks before proceeding.",ops:["mitigate","migrate","motivate","mediate"],ans:0,exp:"'Mitigate' = mitigar, reducir la gravedad de algo.",tipo:"Vocabulario",nivel:"B2"},
];

const FRASES_ESCRITURA={
  A2:[
    {es:"Fui al supermercado ayer por la tarde.",hint:"Past Simple de 'go'. Recuerda que 'yesterday afternoon' va al final."},
    {es:"¿Puedes hablar más despacio, por favor?",hint:"Usa 'Could you...' para ser educado."},
    {es:"Ella ya ha comido, no tiene hambre.",hint:"Present Perfect: she has already..."},
    {es:"Normalmente me despierto a las 7, pero hoy me desperté a las 9.",hint:"Present Simple vs Past Simple."},
    {es:"¿Tienes planes para el fin de semana?",hint:"'Do you have plans for...' o 'Are you free...?'"},
  ],
  B1:[
    {es:"Si tuviera más dinero, viajaría por todo el mundo.",hint:"2º condicional: If I had... I would..."},
    {es:"Le dije que llegaría tarde a la reunión.",hint:"Reported speech: I told him I would..."},
    {es:"El partido fue cancelado debido a la lluvia.",hint:"Pasiva + phrasal verb: The match was called off..."},
    {es:"Llevo trabajando aquí desde 2020.",hint:"Present Perfect Continuous: I have been working here since..."},
    {es:"Sugirió tomar un descanso de 10 minutos.",hint:"suggest + -ing"},
  ],
  B2:[
    {es:"Jamás había visto tanta dedicación en mi vida.",hint:"Inversion: Never had I..."},
    {es:"Se cree ampliamente que el ejercicio mejora la salud mental.",hint:"Impersonal passive: It is widely believed that..."},
    {es:"A pesar de estar agotada, terminó el proyecto a tiempo.",hint:"Despite + -ing / Despite being..."},
    {es:"Los resultados justifican una investigación más exhaustiva.",hint:"'warrant' = justificar. Subjects agree with verb."},
    {es:"Su discurso elocuente inspiró a todo el equipo.",hint:"Vocabulary: eloquent, inspire. Word order."},
  ],
};

const WORDS=[
  {w:"Resilient", ph:"/rɪˈzɪliənt/", es:"Resistente; que se recupera rápido de las dificultades.",ej:"She is incredibly resilient — nothing keeps her down.",niv:"B2"},
  {w:"Meticulous",ph:"/məˈtɪkjʊləs/",es:"Meticuloso/a; muy cuidadoso/a con los detalles.",ej:"His meticulous planning made the event a great success.",niv:"B2"},
  {w:"Ambiguous", ph:"/æmˈbɪɡjuəs/", es:"Ambiguo/a; puede interpretarse de más de una manera.",ej:"The instructions were ambiguous, so people disagreed.",niv:"B1"},
  {w:"Candid",    ph:"/ˈkændɪd/",     es:"Sincero/a y directo/a; franco.",ej:"I appreciate your candid feedback — it helps me improve.",niv:"B1"},
  {w:"Eloquent",  ph:"/ˈeləkwənt/",   es:"Elocuente; fluido y persuasivo al hablar o escribir.",ej:"Her eloquent speech moved everyone in the room.",niv:"B2"},
  {w:"Pragmatic", ph:"/præɡˈmætɪk/",  es:"Pragmático/a; centrado en lo práctico y realista.",ej:"We need a pragmatic approach to solve this.",niv:"B2"},
  {w:"Hesitant",  ph:"/ˈhɛzɪtənt/",   es:"Indeciso/a; que duda antes de actuar o hablar.",ej:"She was hesitant to share her opinion at first.",niv:"B1"},
];

/* ─────────────────────────────────────────────
   HELPERS / ATOMS
───────────────────────────────────────────── */
const C={bg:"#070d14",card:"#0f1923",c2:"#131f2e",bd:"#1e2a3a",tx:"#f1f5f9",mu:"#64748b",di:"#475569",in:"#6366f1",gr:"#10b981",am:"#f59e0b",vi:"#8b5cf6",re:"#ef4444"};
function hoy(){return new Date().toISOString().slice(0,10);}
function calcNivel(s){if(s<=6)return{lv:"A2",et:"Básico-Elemental",co:"#10b981",sg:"B1"};if(s<=12)return{lv:"B1",et:"Intermedio",co:"#f59e0b",sg:"B2"};return{lv:"B2",et:"Intermedio-Alto",co:"#8b5cf6",sg:"C1"};}
function Pb({v,max,co=C.in,h=8}){return <div style={{background:C.bd,borderRadius:h,height:h,overflow:"hidden"}}><div style={{width:`${Math.min(100,v/Math.max(max,1)*100)}%`,height:"100%",background:co,borderRadius:h,transition:"width .4s"}}/></div>;}
function Bg({text,co=C.in}){return <span style={{background:co+"22",color:co,border:`1px solid ${co}44`,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700}}>{text}</span>;}
function Bt({ch,fn,co=C.in,dis=false,st={}}){return <button onClick={fn} disabled={dis} style={{background:dis?"#1e2a3a":co,color:dis?C.di:"#fff",border:"none",borderRadius:12,padding:"13px 20px",fontSize:15,fontWeight:700,cursor:dis?"default":"pointer",opacity:dis?.6:1,...st}}>{ch}</button>;}
function Cd({children,st={},fn}){const[hv,sHv]=useState(false);return <div onClick={fn} onMouseEnter={()=>fn&&sHv(true)} onMouseLeave={()=>fn&&sHv(false)} style={{background:C.card,border:`1px solid ${hv?C.in:C.bd}`,borderRadius:16,padding:"22px 24px",transition:"border .15s",cursor:fn?"pointer":"default",...st}}>{children}</div>;}
function Inp({label,type="text",value,onChange,placeholder,error}){return(<div style={{marginBottom:16}}>{label&&<label style={{display:"block",color:C.mu,fontSize:12,fontWeight:700,marginBottom:6,letterSpacing:.5}}>{label}</label>}<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:"100%",background:C.c2,border:`1px solid ${error?C.re:C.bd}`,borderRadius:10,padding:"12px 14px",color:C.tx,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>{error&&<p style={{color:C.re,fontSize:12,marginTop:4}}>{error}</p>}</div>);}

/* ─────────────────────────────────────────────
   LLAMADA IA
───────────────────────────────────────────── */
async function callIA(system,userMsg,maxTokens=1200){
  try{
    const r=await fetch("/.netlify/functions/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({system,messages:[{role:"user",content:userMsg}],max_tokens:maxTokens})});
    const d=await r.json();
    return d.content?.map(b=>b.text||"").join("")||"";
  }catch(e){return "";}
}

/* ─────────────────────────────────────────────
   AUTH SCREEN
───────────────────────────────────────────── */
function AuthScreen({onAuth}){
  const[mode,setMode]=useState("login");
  const[email,setEmail]=useState("");
  const[pass,setPass]=useState("");
  const[pass2,setPass2]=useState("");
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState("");
  const[ok,setOk]=useState("");

  async function submit(){
    setError("");setOk("");
    if(!email||!pass){setError("Rellena todos los campos.");return;}
    if(mode==="register"&&pass!==pass2){setError("Las contraseñas no coinciden.");return;}
    if(pass.length<6){setError("La contraseña debe tener al menos 6 caracteres.");return;}
    setLoading(true);
    try{
      if(mode==="register"){
        const res=await supa.signUp(email,pass);
        if(res.error)setError(res.error.message);
        else{setOk("¡Cuenta creada! Revisa tu email para confirmarla, luego inicia sesión.");setMode("login");}
      }else{
        const res=await supa.signIn(email,pass);
        if(res.error)setError("Email o contraseña incorrectos.");
        else onAuth({token:res.access_token,userId:res.user.id,email:res.user.email});
      }
    }catch(e){setError("Error de conexión.");}
    setLoading(false);
  }

  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif",padding:24}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{width:"100%",maxWidth:420}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:52,marginBottom:12}}>🇬🇧</div>
          <h1 style={{color:C.tx,fontSize:28,fontWeight:900,letterSpacing:-1,marginBottom:6}}>EnglishUp</h1>
          <p style={{color:C.mu,fontSize:14}}>De A2 a B2 · Tu progreso guardado en la nube</p>
        </div>
        <Cd>
          <div style={{display:"flex",gap:0,marginBottom:24,background:C.c2,borderRadius:10,padding:4}}>
            {["login","register"].map(m=>(
              <button key={m} onClick={()=>{setMode(m);setError("");setOk("");}}
                style={{flex:1,padding:"9px",background:mode===m?C.in:"transparent",color:mode===m?"#fff":C.mu,border:"none",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer",transition:"all .15s"}}>
                {m==="login"?"Iniciar sesión":"Crear cuenta"}
              </button>
            ))}
          </div>
          <Inp label="EMAIL" type="email" value={email} onChange={setEmail} placeholder="tu@email.com"/>
          <Inp label="CONTRASEÑA" type="password" value={pass} onChange={setPass} placeholder="Mínimo 6 caracteres"/>
          {mode==="register"&&<Inp label="REPITE LA CONTRASEÑA" type="password" value={pass2} onChange={setPass2} placeholder="Repite la contraseña" error={pass2&&pass!==pass2?"No coinciden":""}/>}
          {error&&<div style={{background:C.re+"15",border:`1px solid ${C.re}44`,borderRadius:10,padding:"10px 14px",marginBottom:14}}><p style={{color:C.re,fontSize:13}}>{error}</p></div>}
          {ok&&<div style={{background:C.gr+"15",border:`1px solid ${C.gr}44`,borderRadius:10,padding:"10px 14px",marginBottom:14}}><p style={{color:C.gr,fontSize:13}}>{ok}</p></div>}
          <Bt ch={loading?"…":mode==="login"?"Entrar →":"Crear cuenta →"} fn={submit} dis={loading} st={{width:"100%",background:`linear-gradient(135deg,${C.in},${C.vi})`,padding:14,fontSize:15}}/>
        </Cd>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TEST
───────────────────────────────────────────── */
function Test({onDone}){
  const[i,si]=useState(0);
  const[ans,sa]=useState({});
  const[sel,ss]=useState(null);
  const[conf,sc]=useState(false);
  const q=TEST_Q[i],last=i===TEST_Q.length-1;
  const tc={Gramática:C.in,Vocabulario:C.am,Comprensión:C.gr};
  function confirm(){if(sel===null)return;sc(true);sa(p=>({...p,[q.id]:sel}));}
  function next(){
    if(last){const all={...ans,[q.id]:sel};const score=Object.entries(all).filter(([id,a])=>{const qq=TEST_Q.find(x=>x.id===+id);return qq&&a===qq.ans;}).length;onDone(score);}
    else{ss(null);sc(false);si(x=>x+1);}
  }
  return(
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
            return(<div key={k} onClick={()=>!conf&&ss(k)} style={{background:bg,border:`2px solid ${bd}`,borderRadius:10,padding:"12px 16px",color:co,cursor:conf?"default":"pointer",display:"flex",alignItems:"center",gap:12,transition:"all .12s",fontSize:14}}>
              <span style={{width:22,height:22,borderRadius:"50%",border:`2px solid ${bd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{String.fromCharCode(65+k)}</span>{op}
              {conf&&k===q.ans&&<span style={{marginLeft:"auto"}}>✓</span>}
              {conf&&sel===k&&k!==q.ans&&<span style={{marginLeft:"auto"}}>✗</span>}
            </div>);
          })}
        </div>
        {conf&&sel!==q.ans&&<div style={{marginTop:12,background:"#0d2e1f",border:`1px solid ${C.gr}33`,borderRadius:10,padding:"10px 14px"}}><p style={{color:"#6ee7b7",fontSize:13}}>✓ Correcta: <strong>{q.ops[q.ans]}</strong></p></div>}
        <div style={{marginTop:20}}>{!conf?<Bt ch="Confirmar" fn={confirm} dis={sel===null} st={{width:"100%"}}/>:<Bt ch={last?"Ver resultados →":"Siguiente →"} fn={next} st={{width:"100%"}}/>}</div>
      </Cd>
    </div>
  );
}

/* ─────────────────────────────────────────────
   RESULTADOS
───────────────────────────────────────────── */
function Res({score,onOk}){
  const r=calcNivel(score);const pct=Math.round(score/TEST_Q.length*100);
  const cons={A2:"Concéntrate en A2 y empieza con vocabulario B1.",B1:"¡Buen nivel! Trabaja B1 y empieza a explorar B2.",B2:"¡Excelente! Empuja hacia B2 avanzado."};
  return(
    <div style={{maxWidth:540,margin:"0 auto",textAlign:"center"}}>
      <div style={{fontSize:60,marginBottom:14}}>🎯</div>
      <h2 style={{color:C.tx,fontSize:26,fontWeight:800,marginBottom:6}}>Tu nivel: {r.lv}</h2>
      <p style={{color:r.co,fontSize:17,fontWeight:700,marginBottom:22}}>{r.et}</p>
      <Cd st={{marginBottom:18}}>
        <div style={{display:"flex",justifyContent:"center",gap:28,marginBottom:18}}>
          {[{v:score,l:"correctas",c:r.co},{v:TEST_Q.length,l:"total",c:C.tx},{v:pct+"%",l:"nota",c:C.in}].map(x=>(<div key={x.l}><div style={{color:x.c,fontSize:36,fontWeight:900}}>{x.v}</div><div style={{color:C.di,fontSize:12}}>{x.l}</div></div>))}
        </div>
        {[{ic:"💡",lb:"Recomendación",tx:cons[r.lv]},{ic:"🎯",lb:"Tu objetivo",tx:`Llegar a ${r.sg}. 15–20 min al día son suficientes.`}].map(x=>(
          <div key={x.lb} style={{background:C.c2,borderRadius:12,padding:"12px 16px",textAlign:"left",marginBottom:10}}><p style={{color:C.mu,fontSize:14,lineHeight:1.6}}>{x.ic} <strong style={{color:C.tx}}>{x.lb}:</strong> {x.tx}</p></div>
        ))}
      </Cd>
      <Bt ch={`Empezar en nivel ${r.lv} →`} fn={()=>onOk(r.lv)} st={{width:"100%",background:`linear-gradient(135deg,${C.in},${C.vi})`,padding:16,fontSize:16}}/>
    </div>
  );
}

/* ─────────────────────────────────────────────
   LECCIÓN
───────────────────────────────────────────── */
function Leccion({lesson,onBack,onDone}){
  const[step,ss]=useState(0);
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
        {step===1&&<div style={{display:"flex",flexDirection:"column",gap:10}}><p style={{color:C.di,fontSize:11,fontWeight:700,letterSpacing:1}}>EJEMPLOS EN INGLÉS</p>{lesson.ejs.map((e,k)=><div key={k} style={{background:C.c2,borderLeft:`3px solid ${C.in}`,borderRadius:"0 8px 8px 0",padding:"11px 14px",color:"#e2e8f0",fontFamily:"Georgia,serif",fontSize:14}}>{e}</div>)}</div>}
        {step===2&&<div style={{background:"#1a2e1a",borderLeft:`3px solid ${C.gr}`,borderRadius:"0 10px 10px 0",padding:"16px 18px"}}><p style={{color:"#34d399",fontSize:11,fontWeight:700,marginBottom:6,letterSpacing:1}}>💡 CONSEJO CLAVE</p><p style={{color:"#a7f3d0",fontSize:14,lineHeight:1.8}}>{lesson.tip}</p></div>}
        {step===3&&<><div style={{background:"#1e1a2e",borderLeft:`3px solid ${C.vi}`,borderRadius:"0 10px 10px 0",padding:"16px 18px",marginBottom:18}}><p style={{color:"#a78bfa",fontSize:11,fontWeight:700,marginBottom:6,letterSpacing:1}}>✏️ PRÁCTICA</p><p style={{color:"#ddd6fe",fontSize:14,lineHeight:1.8}}>{lesson.prac}</p></div><Bt ch={`✓ Completada (+${lesson.xp} XP)`} fn={()=>onDone(lesson)} st={{width:"100%",background:C.gr}}/></>}
        {step<3&&<Bt ch={`Siguiente: ${pasos[step+1]} →`} fn={()=>ss(s=>s+1)} st={{width:"100%",marginTop:20}}/>}
      </Cd>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FLASHCARDS
   El estado vive en el padre (flashSt) para que
   sobreviva al cambiar de pestaña.
   Al completar el mazo se generan 6 nuevas con IA
   automáticamente sin necesidad de pulsar nada.
───────────────────────────────────────────── */
function Flash({lv, flashSt, setFlashSt, onXP}){
  const{deck,i,fl,kn,un,fase,repasoQ,riIdx,riKn,riUn,generando}=flashSt;

  function upFlash(patch){setFlashSt(p=>({...p,...patch}));}

  function mark(v){
    const newKn=v?[...kn,i]:kn;
    const newUn=v?un:[...un,i];
    const newI=i<deck.length-1?i+1:i;
    const allDone=(newKn.length+newUn.length)===deck.length;
    upFlash({kn:newKn,un:newUn,i:newI,fl:false});
    // Al completar, auto-generar nuevas
    if(allDone) setTimeout(()=>generarNuevas(deck,newUn,lv,upFlash,onXP),300);
  }

  function markRepaso(v){
    const newRiKn=v?[...riKn,riIdx]:riKn;
    const newRiUn=v?riUn:[...riUn,riIdx];
    const isDone=riIdx+1>=repasoQ.length;
    upFlash({riKn:newRiKn,riUn:newRiUn,fl:false,...(isDone?{fase:"fin_repaso"}:{riIdx:riIdx+1})});
  }

  if(generando)return(
    <div style={{textAlign:"center",padding:"60px 20px"}}>
      <div style={{fontSize:48,marginBottom:16}}>🤖</div>
      <h3 style={{color:C.tx,fontSize:18,fontWeight:800,marginBottom:8}}>Generando palabras nuevas…</h3>
      <p style={{color:C.mu,fontSize:14}}>La IA crea vocabulario adaptado a tu nivel {lv}.</p>
    </div>
  );

  if(fase==="fin_repaso")return(
    <div style={{maxWidth:520,margin:"0 auto",textAlign:"center"}}>
      <div style={{fontSize:44,marginBottom:14}}>{riUn.length===0?"🏆":"💪"}</div>
      <h3 style={{color:C.tx,fontSize:20,fontWeight:800,marginBottom:8}}>¡Repaso completado!</h3>
      <p style={{color:C.mu,marginBottom:6}}>Dominadas: <strong style={{color:C.gr}}>{riKn.length}</strong> · Por aprender: <strong style={{color:C.re}}>{riUn.length}</strong></p>
      <p style={{color:C.mu,fontSize:13,marginBottom:24}}>Generando palabras nuevas automáticamente…</p>
    </div>
  );

  if(fase==="repaso"){
    const cr=repasoQ[riIdx]||repasoQ[0];
    return(
      <div style={{maxWidth:520,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <h2 style={{color:C.tx,fontSize:20,fontWeight:800}}>Repaso inteligente</h2>
          <Bg text={`${riIdx+1}/${repasoQ.length}`} co={C.am}/>
        </div>
        <p style={{color:C.mu,fontSize:13,marginBottom:16}}>Estas son las palabras que fallaste.</p>
        <div onClick={()=>upFlash({fl:!fl})} style={{background:fl?"#1a1a2e":C.card,border:`2px solid ${fl?C.am:C.bd}`,borderRadius:18,minHeight:180,padding:"28px",cursor:"pointer",transition:"all .25s",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",marginBottom:14}}>
          {!fl?(<><Bg text="REPASAR" co={C.am}/><h2 style={{color:C.tx,fontSize:28,fontWeight:900,marginTop:12}}>{cr.f}</h2><p style={{color:C.di,fontSize:12,marginTop:8}}>toca para ver en español</p></>)
          :(<>{cr.b.split("\n\n").map((p,k)=><p key={k} style={{color:k===0?C.tx:"#a78bfa",fontSize:k===0?15:13,lineHeight:1.7,fontStyle:k>0?"italic":"normal",marginBottom:6,textAlign:"left",width:"100%"}}>{p}</p>)}</>)}
        </div>
        {fl&&<div style={{display:"flex",gap:10}}>
          <button onClick={()=>markRepaso(false)} style={{flex:1,padding:"12px",background:"#2e0d0d",color:C.re,border:`1px solid ${C.re}44`,borderRadius:12,fontWeight:700,cursor:"pointer",fontSize:14}}>✗ Todavía no</button>
          <button onClick={()=>markRepaso(true)}  style={{flex:1,padding:"12px",background:"#0d2e1f",color:C.gr,border:`1px solid ${C.gr}44`,borderRadius:12,fontWeight:700,cursor:"pointer",fontSize:14}}>✓ ¡La sé!</button>
        </div>}
      </div>
    );
  }

  const done=(kn.length+un.length)===deck.length;
  if(done)return(
    <div style={{maxWidth:520,margin:"0 auto",textAlign:"center",padding:"40px 20px"}}>
      <div style={{fontSize:48,marginBottom:16}}>🤖</div>
      <h3 style={{color:C.tx,fontSize:18,fontWeight:800,marginBottom:8}}>Preparando palabras nuevas…</h3>
      <p style={{color:C.mu,fontSize:14}}>La IA genera vocabulario fresco adaptado a tu nivel.</p>
    </div>
  );

  const card=deck[i]||deck[0];
  return(
    <div style={{maxWidth:520,margin:"0 auto"}}>
      <h2 style={{color:C.tx,fontSize:20,fontWeight:800,marginBottom:6}}>Flashcards</h2>
      <p style={{color:C.mu,fontSize:13,marginBottom:14}}>Toca la tarjeta para ver la definición en español.</p>
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        {[{v:kn.length,l:"Aprendidas",c:C.gr},{v:un.length,l:"Repasar",c:C.re},{v:deck.length-kn.length-un.length,l:"Quedan",c:C.mu}].map(x=>(
          <div key={x.l} style={{flex:1,background:C.card,border:`1px solid ${C.bd}`,borderRadius:12,padding:"10px",textAlign:"center"}}>
            <div style={{color:x.c,fontSize:20,fontWeight:900}}>{x.v}</div>
            <div style={{color:C.di,fontSize:11}}>{x.l}</div>
          </div>
        ))}
      </div>
      <div onClick={()=>upFlash({fl:!fl})} style={{background:fl?"#1a1a2e":C.card,border:`2px solid ${fl?C.vi:C.bd}`,borderRadius:18,minHeight:200,padding:"30px 28px",cursor:"pointer",transition:"all .25s",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",marginBottom:14}}>
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
    </div>
  );
}

// Función externa para generar nuevas tarjetas con IA
async function generarNuevas(currentDeck, unIndices, lv, upFlash, onXP){
  upFlash({generando:true});
  const yaVistas=currentDeck.map(c=>c.f).join(", ");
  const resp=await callIA(
    "Eres un generador de flashcards de inglés. Responde SOLO con JSON válido, sin texto adicional ni backticks.",
    `Genera 6 flashcards de vocabulario en inglés para nivel ${lv}, distintas a estas ya vistas: ${yaVistas}.
Responde ONLY con este array JSON (sin \`\`\`):
[{"f":"palabra","b":"(tipo gramatical) Definición clara en español.\\n\\n'Ejemplo en inglés.'\\n→ Traducción al español."}]`,
    900
  );
  let newDeck=null;
  try{
    const clean=resp.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim();
    const parsed=JSON.parse(clean);
    if(Array.isArray(parsed)&&parsed.length>0) newDeck=parsed;
  }catch(e){}

  if(!newDeck){
    // Si la IA falla, mezclar el mazo original
    newDeck=[...(CARDS[lv]||[])].sort(()=>Math.random()-.5);
  }

  upFlash({deck:newDeck,i:0,fl:false,kn:[],un:[],fase:"normal",repasoQ:[],riIdx:0,riKn:[],riUn:[],generando:false});
  if(onXP) onXP(10);
}

/* ─────────────────────────────────────────────
   RELLENA EL HUECO — ADAPTATIVO
───────────────────────────────────────────── */
async function generarPreguntasIA(lv,errores){
  const errorDesc=errores.length>0
    ?`El estudiante cometió errores en: ${errores.map(e=>`"${e.tipo} ${e.nivel}: ${e.frase}"`).join(", ")}.`
    :"El estudiante no tuvo errores notables.";
  const resp=await callIA(
    "Eres un generador de ejercicios de inglés. Responde SOLO con JSON válido.",
    `${errorDesc} Nivel: ${lv}. Genera exactamente 20 preguntas "rellena el hueco".
Responde SOLO con array JSON:
[{"s":"frase con ___","ops":["a","b","c","d"],"ans":0,"exp":"Explicación en español.","tipo":"Gramática","nivel":"A2"}]`,
    3000
  );
  try{const clean=resp.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim();const p=JSON.parse(clean);if(Array.isArray(p)&&p.length>=10)return p.slice(0,20);}catch(e){}
  return null;
}

function Blanks({lv,onXP,onStats}){
  const[preguntas,setPreguntas]=useState(BLANKS_BASE);
  const[tanda,setTanda]=useState(1);
  const[cargando,setCargando]=useState(false);
  const[i,si]=useState(0);
  const[sel,ss]=useState(null);
  const[conf,sc]=useState(false);
  const[score,sk]=useState(0);
  const[fin,sf]=useState(false);
  const[hist,setHist]=useState([]);
  const e=preguntas[i];const last=i===preguntas.length-1;
  function confirm(){if(sel===null)return;sc(true);const ok=sel===e.ans;if(ok)sk(s=>s+1);const entry={frase:e.s,tipo:e.tipo,nivel:e.nivel,correcto:ok};setHist(h=>[...h,entry]);if(onStats)onStats(entry);}
  function next(){if(last){onXP(score+(sel===e.ans?1:0));sf(true);}else{ss(null);sc(false);si(x=>x+1);}}
  async function siguienteTanda(){
    setCargando(true);sf(false);si(0);ss(null);sc(false);sk(0);
    const errores=hist.filter(h=>!h.correcto);
    const nuevas=await generarPreguntasIA(lv,errores);
    setPreguntas(nuevas||[...BLANKS_BASE].sort(()=>Math.random()-.5));
    setTanda(t=>t+1);setHist([]);setCargando(false);
  }
  if(cargando)return(<div style={{textAlign:"center",padding:"60px 20px"}}><div style={{fontSize:48,marginBottom:16}}>🤖</div><h3 style={{color:C.tx,fontSize:18,fontWeight:800,marginBottom:8}}>Preparando siguiente tanda…</h3><p style={{color:C.mu,fontSize:14}}>La IA analiza tus respuestas.</p></div>);
  if(fin){
    const total=preguntas.length,pct=Math.round(score/total*100);
    const errores=hist.filter(h=>!h.correcto);
    const tiposError=[...new Set(errores.map(e=>`${e.tipo} ${e.nivel}`))];
    return(
      <div style={{maxWidth:540,margin:"0 auto",textAlign:"center"}}>
        <div style={{fontSize:50,marginBottom:14}}>{pct===100?"🏆":pct>=70?"🎉":pct>=50?"💪":"📚"}</div>
        <h3 style={{color:C.tx,fontSize:22,fontWeight:800,marginBottom:6}}>Tanda {tanda} completada</h3>
        <p style={{color:C.mu,fontSize:14,marginBottom:20}}>Resultado: <strong style={{color:C.in}}>{score}/{total}</strong> ({pct}%)</p>
        {errores.length>0&&<Cd st={{marginBottom:16,textAlign:"left"}}><p style={{color:C.re,fontSize:13,fontWeight:700,marginBottom:8}}>❌ Errores ({errores.length})</p>{errores.slice(0,4).map((err,k)=>(<div key={k} style={{background:C.c2,borderRadius:8,padding:"8px 12px",marginBottom:6}}><p style={{color:"#94a3b8",fontSize:12}}>{err.frase}</p><Bg text={`${err.tipo} · ${err.nivel}`} co={C.re}/></div>))}</Cd>}
        {tiposError.length>0&&<div style={{background:"#1a1a2e",border:`1px solid ${C.vi}33`,borderRadius:12,padding:"12px 16px",marginBottom:20,textAlign:"left"}}><p style={{color:"#a78bfa",fontSize:13}}>🎯 Siguiente tanda enfocada en: <strong>{tiposError.join(", ")}</strong></p></div>}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <Bt ch={`🤖 Siguiente tanda adaptada (Tanda ${tanda+1})`} fn={siguienteTanda} st={{width:"100%",background:`linear-gradient(135deg,${C.in},${C.vi})`,padding:16}}/>
          <Bt ch="🔄 Repetir esta tanda" fn={()=>{si(0);ss(null);sc(false);sk(0);sf(false);setHist([]);}} st={{width:"100%",background:C.card,color:C.mu,border:`1px solid ${C.bd}`}}/>
        </div>
      </div>
    );
  }
  if(!e)return null;
  const pts=e.s.split("___");
  return(
    <div style={{maxWidth:560,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
        <h2 style={{color:C.tx,fontSize:18,fontWeight:800}}>Rellena el hueco</h2>
        {tanda>1&&<Bg text={`🤖 Tanda ${tanda}`} co={C.vi}/>}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
        <span style={{color:C.mu,fontSize:12}}>Pregunta {i+1}/{preguntas.length}</span>
        <div style={{display:"flex",gap:6}}><Bg text={e.tipo} co={e.tipo==="Gramática"?C.in:C.am}/><Bg text={e.nivel} co={e.nivel==="B2"?C.vi:e.nivel==="B1"?C.am:C.gr}/></div>
      </div>
      <Pb v={i} max={preguntas.length}/>
      <Cd st={{marginTop:14,marginBottom:12}}>
        <p style={{color:C.tx,fontSize:18,lineHeight:1.8,fontFamily:"Georgia,serif",textAlign:"center"}}>
          {pts[0]}<span style={{display:"inline-block",minWidth:80,borderBottom:`2px solid ${conf?(sel===e.ans?C.gr:C.re):C.in}`,textAlign:"center",color:conf?(sel===e.ans?C.gr:C.re):C.in,fontWeight:700,padding:"0 8px"}}>{sel!==null?e.ops[sel]:"___"}</span>{pts[1]}
        </p>
      </Cd>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        {e.ops.map((op,k)=>{
          let bg=C.card,bd=C.bd,co=C.mu;
          if(sel===k&&!conf){bg="#1e3a5f";bd=C.in;co=C.tx;}
          if(conf&&k===e.ans){bg="#0d2e1f";bd=C.gr;co=C.gr;}
          if(conf&&sel===k&&k!==e.ans){bg="#2e0d0d";bd=C.re;co=C.re;}
          return <div key={k} onClick={()=>!conf&&ss(k)} style={{background:bg,border:`2px solid ${bd}`,borderRadius:10,padding:"13px 14px",color:co,cursor:conf?"default":"pointer",textAlign:"center",fontWeight:600,fontSize:14,transition:"all .12s"}}>{op}</div>;
        })}
      </div>
      {conf&&<div style={{background:C.c2,border:`1px solid ${C.bd}`,borderRadius:12,padding:"12px 16px",marginBottom:12}}><p style={{color:C.mu,fontSize:13,lineHeight:1.7}}>{sel===e.ans?"✅":"❌"} <strong style={{color:C.tx}}>Explicación:</strong> <span style={{color:"#94a3b8"}}>{e.exp}</span></p></div>}
      {!conf?<Bt ch="Confirmar" fn={confirm} dis={sel===null} st={{width:"100%"}}/>:<Bt ch={last?"Ver resultado →":"Siguiente →"} fn={next} st={{width:"100%"}}/>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   ESCRITURA
───────────────────────────────────────────── */
function Escritura({lv,onXP,onStats}){
  const frases=FRASES_ESCRITURA[lv]||FRASES_ESCRITURA.A2;
  const[i,si]=useState(0);const[input,setInput]=useState("");const[resultado,setResultado]=useState(null);const[loading,setLoading]=useState(false);const[done,setDone]=useState(false);const[puntos,setPuntos]=useState(0);
  const frase=frases[i];const last=i===frases.length-1;
  async function corregir(){
    if(!input.trim())return;setLoading(true);
    const resp=await callIA("Eres un profesor de inglés. Corrige la traducción. Responde SOLO con JSON: {\"correcto\":true/false,\"nota\":1-10,\"correccion\":\"Versión correcta\",\"explicacion\":\"Explicación en español\",\"alternativas\":[\"Otra forma correcta\"]}",`Frase en español: "${frase.es}"\nTraducción del estudiante: "${input}"\nNivel: ${lv}\nPista: "${frase.hint}"`,600);
    try{const clean=resp.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim();const parsed=JSON.parse(clean);setResultado(parsed);const pts=parsed.correcto?3:parsed.nota>=6?1:0;setPuntos(p=>p+pts);if(onStats)onStats({tipo:"Escritura",nivel:lv,correcto:parsed.correcto});}
    catch(e){setResultado({correcto:false,nota:0,correccion:"",explicacion:"No se pudo conectar con la IA. Inténtalo de nuevo.",alternativas:[]});}
    setLoading(false);
  }
  function siguiente(){if(last){setDone(true);if(onXP)onXP(puntos);}else{si(x=>x+1);setInput("");setResultado(null);}}
  if(done)return(<div style={{textAlign:"center",maxWidth:500,margin:"0 auto"}}><div style={{fontSize:50,marginBottom:14}}>{puntos>=frases.length*2?"🏆":puntos>=frases.length?"🎉":"💪"}</div><h3 style={{color:C.tx,fontSize:22,fontWeight:800,marginBottom:8}}>¡Ejercicio completado!</h3><p style={{color:C.mu,marginBottom:20}}>Puntos: <strong style={{color:C.in}}>{puntos}/{frases.length*3}</strong></p><Bt ch="Repetir" fn={()=>{si(0);setInput("");setResultado(null);setDone(false);setPuntos(0);}} st={{width:"100%"}}/></div>);
  return(
    <div style={{maxWidth:580,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><h2 style={{color:C.tx,fontSize:18,fontWeight:800}}>Ejercicio de escritura</h2><Bg text="✍️ IA" co={C.vi}/></div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{color:C.mu,fontSize:12}}>Frase {i+1}/{frases.length}</span><span style={{color:C.gr,fontSize:12,fontWeight:700}}>+{puntos} pts</span></div>
      <Pb v={i} max={frases.length}/>
      <Cd st={{marginTop:14,marginBottom:14}}><p style={{color:C.di,fontSize:11,fontWeight:700,letterSpacing:1,marginBottom:10}}>TRADUCE AL INGLÉS</p><p style={{color:C.tx,fontSize:20,fontWeight:700,lineHeight:1.5,marginBottom:12}}>"{frase.es}"</p><div style={{background:C.c2,borderLeft:`3px solid ${C.am}`,borderRadius:"0 8px 8px 0",padding:"8px 12px"}}><p style={{color:C.am,fontSize:12}}>💡 Pista: {frase.hint}</p></div></Cd>
      {!resultado?(<><textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Escribe tu traducción aquí…" style={{width:"100%",background:C.c2,border:`1px solid ${C.bd}`,borderRadius:12,padding:"14px",color:C.tx,fontSize:14,outline:"none",fontFamily:"inherit",resize:"vertical",minHeight:90,marginBottom:12,boxSizing:"border-box"}}/><Bt ch={loading?"Corrigiendo…":"✓ Corregir con IA"} fn={corregir} dis={loading||!input.trim()} st={{width:"100%",background:`linear-gradient(135deg,${C.in},${C.vi})`}}/></>)
      :(<div><div style={{background:resultado.correcto?"#0d2e1f":resultado.nota>=6?"#1a1a0d":"#2e0d0d",border:`1px solid ${resultado.correcto?C.gr:resultado.nota>=6?C.am:C.re}44`,borderRadius:12,padding:"16px",marginBottom:12}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{fontSize:20}}>{resultado.correcto?"✅":resultado.nota>=6?"⚠️":"❌"}</span><strong style={{color:resultado.correcto?C.gr:resultado.nota>=6?C.am:C.re,fontSize:15}}>{resultado.correcto?"¡Perfecto!":resultado.nota>=6?"Casi — pequeños errores":"Hay que mejorar"}</strong><span style={{marginLeft:"auto",background:C.c2,borderRadius:8,padding:"2px 10px",color:C.tx,fontSize:13,fontWeight:700}}>{resultado.nota}/10</span></div>{resultado.correccion&&<div style={{background:C.c2+"88",borderRadius:8,padding:"10px 12px",marginBottom:8}}><p style={{color:C.di,fontSize:11,fontWeight:700,marginBottom:4}}>VERSIÓN CORRECTA</p><p style={{color:"#e2e8f0",fontSize:14,fontFamily:"Georgia,serif"}}>{resultado.correccion}</p></div>}<p style={{color:"#94a3b8",fontSize:13,lineHeight:1.7}}>{resultado.explicacion}</p>{resultado.alternativas?.length>0&&<div style={{marginTop:10}}><p style={{color:C.di,fontSize:11,fontWeight:700,marginBottom:4}}>TAMBIÉN SE PUEDE DECIR</p>{resultado.alternativas.map((a,k)=><p key={k} style={{color:C.vi,fontSize:13,fontStyle:"italic"}}>• {a}</p>)}</div>}</div><Bt ch={last?"Ver resultado final →":"Siguiente frase →"} fn={siguiente} st={{width:"100%"}}/></div>)}
    </div>
  );
}

/* ─────────────────────────────────────────────
   ESTADÍSTICAS
───────────────────────────────────────────── */
function Stats({statsData}){
  const{gramatica=0,gramaticaTotal=0,vocabulario=0,vocabularioTotal=0,escritura=0,escrituraTotal=0,sesiones=0}=statsData||{};
  const pct=(v,t)=>t>0?Math.round(v/t*100):0;
  const total=gramaticaTotal+vocabularioTotal+escrituraTotal;
  const items=[{label:"Gramática",ok:gramatica,total:gramaticaTotal,co:C.in,ic:"📐"},{label:"Vocabulario",ok:vocabulario,total:vocabularioTotal,co:C.am,ic:"📖"},{label:"Escritura",ok:escritura,total:escrituraTotal,co:C.vi,ic:"✍️"}];
  return(
    <div style={{maxWidth:600,margin:"0 auto"}}>
      <h2 style={{color:C.tx,fontSize:20,fontWeight:800,marginBottom:4}}>Tus estadísticas</h2>
      <p style={{color:C.mu,fontSize:13,marginBottom:20}}>Basadas en todos tus ejercicios completados.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:20}}>
        {[{l:"Sesiones activas",v:sesiones,i:"🔥",c:"#f97316"},{l:"Ejercicios hechos",v:total,i:"⚡",c:C.am}].map(x=>(
          <Cd key={x.l} st={{padding:"16px",textAlign:"center"}}><div style={{fontSize:24,marginBottom:4}}>{x.i}</div><div style={{color:x.c,fontSize:28,fontWeight:900}}>{x.v}</div><div style={{color:C.di,fontSize:11,marginTop:2}}>{x.l}</div></Cd>
        ))}
      </div>
      {total===0?(<div style={{textAlign:"center",padding:"40px 20px",color:C.mu}}><div style={{fontSize:40,marginBottom:12}}>📊</div><p>Completa ejercicios para ver tus estadísticas aquí.</p></div>):(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {items.map(x=>{const p=pct(x.ok,x.total);return(
            <Cd key={x.label} st={{padding:"18px 20px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20}}>{x.ic}</span><strong style={{color:C.tx,fontSize:15}}>{x.label}</strong></div><div style={{textAlign:"right"}}><span style={{color:x.co,fontWeight:900,fontSize:22}}>{p}%</span><p style={{color:C.di,fontSize:11}}>{x.ok}/{x.total} correctas</p></div></div>
              <Pb v={x.ok} max={Math.max(x.total,1)} co={x.co}/>
              <p style={{color:C.mu,fontSize:12,marginTop:8}}>{p>=80?"¡Excelente dominio! 🌟":p>=60?"Buen nivel, sigue practicando 💪":p>=40?"Va bien, hay margen de mejora 📈":"Necesita más práctica aquí 📚"}</p>
            </Cd>
          );})}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PALABRA DEL DÍA + RACHA
───────────────────────────────────────────── */
function Palabra(){
  const w=WORDS[new Date().getDay()%WORDS.length];
  return(
    <div style={{background:"linear-gradient(135deg,#0f1923,#1a1a2e)",border:"1px solid #2d1f5e",borderRadius:18,padding:"22px 26px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div><p style={{color:C.vi,fontSize:11,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>PALABRA DEL DÍA</p><h2 style={{color:C.tx,fontSize:26,fontWeight:900,letterSpacing:-0.5}}>{w.w}</h2><p style={{color:C.di,fontSize:12,fontFamily:"monospace"}}>{w.ph}</p></div>
        <Bg text={w.niv} co={C.vi}/>
      </div>
      <p style={{color:"#94a3b8",fontSize:14,marginBottom:10,lineHeight:1.5}}>{w.es}</p>
      <div style={{background:C.c2,borderLeft:`3px solid ${C.vi}`,borderRadius:"0 8px 8px 0",padding:"10px 14px"}}><p style={{color:"#c4b5fd",fontSize:13,fontStyle:"italic",lineHeight:1.6}}>"{w.ej}"</p></div>
    </div>
  );
}

function Racha({dias}){
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
   ESTADO INICIAL DE FLASHCARDS
───────────────────────────────────────────── */
function initFlashSt(lv){
  return {deck:CARDS[lv]||[],i:0,fl:false,kn:[],un:[],fase:"normal",repasoQ:[],riIdx:0,riKn:[],riUn:[],generando:false};
}

/* ─────────────────────────────────────────────
   APP PRINCIPAL
───────────────────────────────────────────── */
const DEF={screen:"welcome",lv:"A2",xp:0,streak:0,dias:[],done:[],testScore:0,
  stats:{gramatica:0,gramaticaTotal:0,vocabulario:0,vocabularioTotal:0,escritura:0,escrituraTotal:0,sesiones:0}};

export default function App(){
  const[auth,setAuth]=useState(null);
  const[st,setSt]=useState(DEF);
  const[rdy,setRdy]=useState(false);
  const[saving,setSaving]=useState(false);
  const[restoringSession,setRestoringSession]=useState(true);
  const firstRun=useRef(true);
  const saveTimer=useRef(null);
  const[flashSt,setFlashSt]=useState(()=>initFlashSt("A2"));

  // ── Restaurar sesión al arrancar ──────────────
  useEffect(()=>{
    const saved=localStorage.getItem("eu_auth");
    if(!saved){setRestoringSession(false);return;}
    try{
      const parsed=JSON.parse(saved);
      fetch(`${SUPA_URL}/auth/v1/user`,{headers:{...supa.h,"Authorization":`Bearer ${parsed.token}`}})
        .then(r=>r.json())
        .then(u=>{
          if(u.id) setAuth(parsed);
          else localStorage.removeItem("eu_auth");
          setRestoringSession(false);
        }).catch(()=>{localStorage.removeItem("eu_auth");setRestoringSession(false);});
    }catch(e){localStorage.removeItem("eu_auth");setRestoringSession(false);}
  },[]);

  function handleAuth(authData){
    localStorage.setItem("eu_auth",JSON.stringify(authData));
    setAuth(authData);
  }

  // ── Cargar progreso al autenticarse ───────────
  useEffect(()=>{
    if(!auth)return;
    setRdy(false);
    supa.load(auth.token,auth.userId).then(data=>{
      const loaded=data?{...DEF,...data,stats:{...DEF.stats,...(data.stats||{})}}:DEF;
      setSt(loaded);
      generarNuevas(CARDS[loaded.lv]||[], [], loaded.lv, setFlashSt, null);
      setRdy(true);firstRun.current=true;
    });
  },[auth]);

  // ── Reiniciar flashcards al cambiar nivel ─────
  const prevLv=useRef(null);
  useEffect(()=>{
    if(prevLv.current&&prevLv.current!==st.lv){
      generarNuevas(CARDS[st.lv]||[], [], st.lv, setFlashSt, null);
    }
    prevLv.current=st.lv;
  },[st.lv]);

  useEffect(()=>{
    if(!rdy||!auth)return;
    if(firstRun.current){firstRun.current=false;return;}
    clearTimeout(saveTimer.current);setSaving(true);
    saveTimer.current=setTimeout(()=>{supa.save(auth.token,auth.userId,st).then(()=>setSaving(false));},800);
  },[st,rdy]);

  useEffect(()=>{
    if(!rdy)return;
    const today=hoy();
    if(st.dias.includes(today))return;
    const yest=new Date();yest.setDate(yest.getDate()-1);
    const hadYest=st.dias.includes(yest.toISOString().slice(0,10));
    setSt(p=>({...p,dias:[...p.dias,today].slice(-30),streak:hadYest?p.streak+1:1,stats:{...p.stats,sesiones:(p.stats?.sesiones||0)+1}}));
  },[rdy]);

  const[tab,setTab]=useState("home");
  const[lesson,setLesson]=useState(null);
  const[sub,setSub]=useState(null);

  function up(patch){setSt(p=>({...p,...patch}));}
  function addStat(entry){
    setSt(p=>{
      const s={...DEF.stats,...(p.stats||{})};
      if(entry.tipo==="Gramática"){s.gramaticaTotal++;if(entry.correcto)s.gramatica++;}
      else if(entry.tipo==="Vocabulario"){s.vocabularioTotal++;if(entry.correcto)s.vocabulario++;}
      else if(entry.tipo==="Escritura"){s.escrituraTotal++;if(entry.correcto)s.escritura++;}
      return{...p,stats:s};
    });
  }
  async function logout(){
    await supa.signOut(auth.token);
    localStorage.removeItem("eu_auth");
    setAuth(null);setSt(DEF);setRdy(false);setTab("home");
  }

  if(!auth)return <AuthScreen onAuth={handleAuth}/>;
  if(!rdy)return(<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><style>{`*{box-sizing:border-box;margin:0;padding:0}`}</style><p style={{color:C.mu,fontFamily:"sans-serif"}}>Cargando tu progreso…</p></div>);

  const{screen,lv,xp,streak,dias,done,testScore,stats}=st;
  const all=LESSONS[lv]||[];
  const ndone=all.filter(l=>done.includes(l.id)).length;
  const nr=calcNivel(testScore);

  if(screen==="welcome")return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif",padding:24}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{maxWidth:480,textAlign:"center"}}>
        <div style={{fontSize:68,marginBottom:20}}>🇬🇧</div>
        <h1 style={{color:C.tx,fontSize:38,fontWeight:900,letterSpacing:-1,marginBottom:14,lineHeight:1.1}}>Tu camino al inglés<br/><span style={{background:`linear-gradient(135deg,${C.in},${C.vi})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>empieza aquí</span></h1>
        <p style={{color:C.mu,fontSize:15,lineHeight:1.7,marginBottom:36}}>De A2 a B2. Todo explicado en español.<br/>Bienvenido/a, <strong style={{color:C.in}}>{auth.email}</strong> 👋</p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <Bt ch="🎯 Hacer el test de nivel (recomendado)" fn={()=>up({screen:"test"})} st={{padding:16,fontSize:16,background:`linear-gradient(135deg,${C.in},${C.vi})`}}/>
          <Bt ch="Saltar — empezar en A2" fn={()=>up({screen:"app"})} st={{background:C.card,color:C.mu,border:`1px solid ${C.bd}`,fontSize:14}}/>
        </div>
      </div>
    </div>
  );

  if(screen==="test")return(<div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif",padding:"36px 22px"}}><style>{`*{box-sizing:border-box;margin:0;padding:0}`}</style><div style={{textAlign:"center",marginBottom:30}}><h1 style={{color:C.tx,fontSize:24,fontWeight:800,marginBottom:4}}>Test de nivel</h1><p style={{color:C.mu,fontSize:13}}>Gramática · Vocabulario · Comprensión lectora</p></div><Test onDone={score=>up({testScore:score,screen:"results"})}/></div>);
  if(screen==="results")return(<div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif",padding:"36px 22px"}}><style>{`*{box-sizing:border-box;margin:0;padding:0}`}</style><Res score={testScore} onOk={nlv=>up({lv:nlv,screen:"app"})}/></div>);

  const tabs=[{id:"home",ic:"🏠",lb:"Inicio"},{id:"lessons",ic:"📖",lb:"Lecciones"},{id:"practice",ic:"✏️",lb:"Ejercicios"},{id:"stats",ic:"📊",lb:"Stats"}];

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif",display:"flex",flexDirection:"column"}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0a1520}::-webkit-scrollbar-thumb{background:#1e2a3a;border-radius:4px}`}</style>
      <header style={{padding:"13px 20px",borderBottom:`1px solid ${C.card}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:"#050b12"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:20}}>🇬🇧</span>
          <span style={{color:C.tx,fontWeight:900,fontSize:17,letterSpacing:-0.5}}>EnglishUp</span>
          <span style={{background:saving?"#f59e0b22":"#10b98122",color:saving?C.am:C.gr,border:`1px solid ${saving?C.am+"44":C.gr+"44"}`,borderRadius:20,padding:"1px 7px",fontSize:10,fontWeight:700}}>{saving?"GUARDANDO…":"☁️ GUARDADO"}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span>🔥 <strong style={{color:"#f97316"}}>{streak}</strong></span>
          <span>⚡ <strong style={{color:C.am}}>{xp} XP</strong></span>
          <Bg text={lv} co={C.in}/>
          <button onClick={logout} style={{background:"none",border:`1px solid ${C.bd}`,borderRadius:8,color:C.di,fontSize:11,padding:"4px 10px",cursor:"pointer"}}>Salir</button>
        </div>
      </header>

      <main style={{flex:1,padding:"20px",overflowY:"auto"}}>
        {lesson?(
          <Leccion lesson={lesson} onBack={()=>setLesson(null)} onDone={l=>{up({done:[...new Set([...done,l.id])],xp:xp+l.xp});setLesson(null);}}/>
        ):tab==="home"?(
          <div style={{maxWidth:700,margin:"0 auto"}}>
            <h1 style={{color:C.tx,fontSize:22,fontWeight:800,marginBottom:4}}>¡Buenas! 👋</h1>
            <p style={{color:C.mu,fontSize:14,marginBottom:20}}>Mantén tu racha — aprendamos algo hoy.</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
              {[{l:"Días seguidos",v:streak,i:"🔥",c:"#f97316"},{l:"XP total",v:xp,i:"⚡",c:C.am},{l:"Lecciones",v:ndone,i:"✅",c:C.gr}].map(x=>(
                <Cd key={x.l} st={{padding:"14px 16px"}}><div style={{fontSize:18,marginBottom:4}}>{x.i}</div><div style={{color:x.c,fontSize:22,fontWeight:900}}>{x.v}</div><div style={{color:C.di,fontSize:11,marginTop:2}}>{x.l}</div></Cd>
              ))}
            </div>
            <Cd st={{marginBottom:16}}><Racha dias={dias}/></Cd>
            <Cd st={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{color:"#94a3b8",fontSize:13,fontWeight:600}}>Progreso ({lv} → {nr.sg})</span><span style={{color:C.in,fontSize:13,fontWeight:700}}>{ndone}/{all.length}</span></div>
              <Pb v={ndone} max={all.length}/>
            </Cd>
            <div style={{marginBottom:16}}><Palabra/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[
                {ic:"📖",tt:"Lecciones",      ds:"Track "+lv,                      tb:"lessons"},
                {ic:"✏️",tt:"Ejercicios",      ds:"Flashcards · Huecos · Escritura", tb:"practice"},
                {ic:"📊",tt:"Estadísticas",   ds:"Gramática vs Vocabulario",        tb:"stats"},
                {ic:"🔄",tt:"Repetir test",   ds:"Actualiza tu nivel",              tb:null,fn:()=>up({screen:"test"})},
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
            <p style={{color:C.mu,fontSize:13,marginBottom:18}}>Explicaciones en español · Guardado en la nube ☁️</p>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {all.map(l=>{
                const dn=done.includes(l.id);
                const tc={Gramática:C.in,Vocabulario:C.am,Conversación:C.gr,Escritura:"#06b6d4"};
                return(
                  <div key={l.id} onClick={()=>setLesson(l)} style={{background:C.card,border:`1px solid ${dn?C.gr+"44":C.bd}`,borderRadius:14,padding:"18px 20px",cursor:"pointer",display:"flex",alignItems:"flex-start",gap:12,transition:"border .15s"}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=dn?C.gr:C.in}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=dn?C.gr+"44":C.bd}>
                    <span style={{fontSize:26,lineHeight:1}}>{l.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}><Bg text={l.tag} co={tc[l.tag]||C.in}/><span style={{color:C.di,fontSize:11}}>+{l.xp} XP</span>{dn&&<span style={{color:C.gr,fontSize:11,fontWeight:700}}>✓ Completada</span>}</div>
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
                {Object.keys(LESSONS).filter(x=>x!==lv).map(x=>(<button key={x} onClick={()=>up({lv:x})} style={{padding:"8px 18px",background:C.card,border:`1px solid ${C.bd}`,borderRadius:10,color:C.mu,fontSize:12,fontWeight:700,cursor:"pointer"}}>Nivel {x}</button>))}
              </div>
            </div>
          </div>
        ):tab==="practice"?(
          <div style={{maxWidth:660,margin:"0 auto"}}>
            {!sub&&<>
              <h2 style={{color:C.tx,fontSize:20,fontWeight:800,marginBottom:4}}>Ejercicios</h2>
              <p style={{color:C.mu,fontSize:13,marginBottom:20}}>Refuerza lo aprendido. Explicaciones en español.</p>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {[
                  {m:"flash",ic:"🃏",tt:"Flashcards",           ds:`${flashSt.deck.length} palabras · Progreso guardado · Nuevas palabras automáticas con IA`,co:C.vi},
                  {m:"blank",ic:"✏️",tt:"Rellena el hueco",      ds:"20 ejercicios adaptativos · La IA aprende de tus errores",co:C.am},
                  {m:"write",ic:"✍️",tt:"Ejercicio de escritura", ds:"Traduce frases al inglés · Feedback con IA",co:C.gr},
                ].map(x=>(
                  <Cd key={x.m} fn={()=>setSub(x.m)} st={{display:"flex",gap:14,alignItems:"center"}}>
                    <span style={{fontSize:32}}>{x.ic}</span>
                    <div style={{flex:1}}><h3 style={{color:C.tx,fontSize:15,fontWeight:700,marginBottom:3}}>{x.tt}</h3><p style={{color:C.mu,fontSize:12,lineHeight:1.5}}>{x.ds}</p></div>
                    <Bg text={lv} co={x.co}/>
                  </Cd>
                ))}
              </div>
            </>}
            {sub&&<button onClick={()=>setSub(null)} style={{background:"none",border:"none",color:C.in,cursor:"pointer",fontSize:13,marginBottom:18,padding:0}}>← Volver</button>}
            {sub==="flash"&&<Flash lv={lv} flashSt={flashSt} setFlashSt={setFlashSt} onXP={n=>up({xp:xp+n})}/>}
            {sub==="blank"&&<Blanks lv={lv} onXP={n=>up({xp:xp+n*5})} onStats={addStat}/>}
            {sub==="write"&&<Escritura lv={lv} onXP={n=>up({xp:xp+n*8})} onStats={addStat}/>}
          </div>
        ):tab==="stats"?(
          <Stats statsData={stats}/>
        ):null}
      </main>

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

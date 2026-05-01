import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, FileCheck, Calculator, MessageCircle, Clock, Trash2, ChevronRight, Type, ClipboardPaste, Upload, Mic, MicOff, X, Check, FileText, ArrowRight } from 'lucide-react';
import Shell from '../components/Shell';
import { Language, t } from '../lib/i18n';

type InputMode = 'type' | 'paste' | 'upload' | 'record';
interface StudySet { id: number; topic: string; language: string; created_at: string; }
interface Props { lang: Language; setLang: (l: Language) => void; }

export default function DashboardPage({ lang, setLang }: Props) {
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [sets, setSets] = useState<StudySet[]>([]);
  const [loadingSets, setLoadingSets] = useState(true);
  const [mode, setMode] = useState<InputMode>('type');
  const [fileName, setFileName] = useState('');
  const [isRec, setIsRec] = useState(false);
  const [recTime, setRecTime] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const recRef = useRef<any>(null);
  const timerRef = useRef<number|null>(null);
  const nav = useNavigate();
  const isEs = lang === 'es';

  const fetchSets = async () => { try { const r = await fetch('/api/study-sets'); setSets(await r.json()); } catch {} finally { setLoadingSets(false); } };
  useEffect(() => { fetchSets(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  const hasContent = topic.trim().length > 0 || notes.trim().length > 0;
  const generate = async () => {
    if (!hasContent || loading) return;
    setLoading(true);
    try {
      const body: any = { language: lang };
      body.topic = topic.trim() || notes.trim().split(/[.\n]/)[0]?.slice(0,60) || 'My Notes';
      if (notes.trim()) body.notes = notes.trim();
      const r = await fetch('/api/generate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
      const d = await r.json(); if (r.ok) nav(`/study/${d.id}`);
    } catch {} finally { setLoading(false); }
  };
  const del = async (id: number) => { await fetch('/api/study-sets',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})}); fetchSets(); };
  const handleFile = (f: File) => { if (!f || f.size > 5*1024*1024) return; setFileName(f.name); const r = new FileReader(); r.onload = e => { const txt = e.target?.result as string; setNotes(txt); if (!topic.trim()) setTopic(txt.split(/[.\n]/)[0]?.trim().slice(0,60)||''); }; r.readAsText(f); };
  const startRec = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert(isEs?'Navegador no soporta grabacion':'Browser does not support recording'); return; }
    const rc = new SR(); rc.continuous = true; rc.interimResults = true; rc.lang = isEs?'es-ES':'en-US';
    let ft = notes;
    rc.onresult = (e:any) => { for (let i=e.resultIndex;i<e.results.length;i++) { if(e.results[i].isFinal){ft+=(ft?' ':'')+e.results[i][0].transcript; setNotes(ft);} } };
    rc.onerror = () => stopRec(); rc.onend = () => { if(isRec) try{rc.start();}catch{} };
    recRef.current = rc; rc.start(); setIsRec(true); setRecTime(0);
    timerRef.current = window.setInterval(()=>setRecTime(p=>p+1),1000);
  };
  const stopRec = () => { setIsRec(false); if(timerRef.current){clearInterval(timerRef.current);timerRef.current=null;} if(recRef.current){try{recRef.current.stop();}catch{} recRef.current=null;} if(notes.trim()&&!topic.trim()) setTopic(notes.split(/[.\n]/)[0]?.trim().slice(0,60)||''); };
  const fmtTime = (s:number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  const clearAll = () => { setTopic(''); setNotes(''); setFileName(''); if(isRec) stopRec(); };

  const tools = [
    { icon: FileCheck, title: isEs?'Calificador de Ensayos':'AI Paper Grader', desc: isEs?'Sube tu ensayo y recibe retroalimentacion con rubrica':'Upload your essay and get rubric-based feedback', color: 'from-emerald-500 to-teal-600', path: '/grader' },
    { icon: Calculator, title: isEs?'Resolver Problemas':'Problem Solver', desc: isEs?'Soluciones paso a paso para matematicas y ciencias':'Step-by-step solutions for math & science', color: 'from-violet-500 to-purple-600', path: '/solver' },
    { icon: MessageCircle, title: isEs?'Chat con Apuntes':'Chat with Notes', desc: isEs?'Conversa con IA sobre tus apuntes de estudio':'Chat with AI about your study notes', color: 'from-blue-500 to-cyan-600', path: '/chat' },
  ];

  const modes: {key:InputMode;icon:any;label:string}[] = [
    {key:'type',icon:Type,label:isEs?'Escribir':'Type'},
    {key:'paste',icon:ClipboardPaste,label:isEs?'Pegar':'Paste'},
    {key:'upload',icon:Upload,label:isEs?'Subir':'Upload'},
    {key:'record',icon:Mic,label:isEs?'Grabar':'Record'},
  ];

  const GenBtn = ({cls=''}:{cls?:string}) => (
    <button onClick={generate} disabled={loading||!hasContent} className={`px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md shadow-brand-500/20 ${cls}`}>
      {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Sparkles size={17}/>}
      {loading ? (isEs?'Generando...':'Generating...') : (isEs?'Generar Set':'Generate Set')}
    </button>
  );

  return (
    <Shell lang={lang} setLang={setLang}>
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 pb-24 lg:pb-8">
        {/* Hero */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary leading-tight">
            {isEs?'De tema a set de estudio':'From topic to study set'}{' '}
            <span className="text-brand-600">{isEs?'en segundos':'in seconds'}</span>
          </h1>
          <p className="text-text-secondary mt-2 text-base max-w-xl">{isEs?'Escribe un tema, pega tus apuntes, sube un archivo o graba tu voz.':'Type a topic, paste your notes, upload a file, or record your voice.'}</p>
        </motion.div>

        {/* Input Card */}
        <motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="bg-surface-card rounded-2xl border border-border shadow-sm mb-10">
          {/* Mode tabs */}
          <div className="flex items-center gap-1 px-4 pt-4">
            {modes.map(m=>(
              <button key={m.key} onClick={()=>{setMode(m.key);if(isRec)stopRec();}} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${mode===m.key?'bg-brand-50 text-brand-700 border border-brand-200':'text-text-muted hover:text-text-secondary hover:bg-surface-2 border border-transparent'}`}>
                <m.icon size={14}/>{m.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {mode==='type' && (
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="text" value={topic} onChange={e=>setTopic(e.target.value)} onKeyDown={e=>e.key==='Enter'&&generate()} placeholder={isEs?'Ingresa un tema (ej. Fotosintesis, Sistema Solar...)':'Enter a topic (e.g. Photosynthesis, Solar System...)'} className="flex-1 px-4 py-3.5 bg-surface-2 border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"/>
                <GenBtn/>
              </div>
            )}
            {mode==='paste' && (
              <div className="space-y-3">
                <input type="text" value={topic} onChange={e=>setTopic(e.target.value)} placeholder={isEs?'Titulo o tema (opcional)':'Title or topic (optional)'} className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"/>
                <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder={isEs?'Pega tus apuntes aqui...':'Paste your notes here...'} rows={5} className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 resize-none transition-all text-sm leading-relaxed"/>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">{notes.length>0&&`${notes.split(/\s+/).filter(Boolean).length} ${isEs?'palabras':'words'}`}</span>
                  <div className="flex gap-2">{hasContent&&<button onClick={clearAll} className="p-2 text-text-muted hover:text-danger"><X size={16}/></button>}<GenBtn/></div>
                </div>
              </div>
            )}
            {mode==='upload' && (
              <div className="space-y-3">
                <input type="text" value={topic} onChange={e=>setTopic(e.target.value)} placeholder={isEs?'Titulo o tema (opcional)':'Title or topic (optional)'} className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"/>
                <input ref={fileRef} type="file" accept=".txt,.md,.csv" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f);}}/>
                <div onClick={()=>fileRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)handleFile(f);}} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${fileName?'border-success/50 bg-success/5':'border-border hover:border-brand-300 hover:bg-brand-50/30'}`}>
                  {fileName ? (
                    <div className="flex flex-col items-center gap-2"><div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center"><Check size={24} className="text-success"/></div><p className="text-success font-semibold text-sm">{fileName}</p><p className="text-text-muted text-xs">{notes.split(/\s+/).filter(Boolean).length} {isEs?'palabras':'words'}</p><button onClick={e=>{e.stopPropagation();setFileName('');setNotes('');}} className="text-xs text-text-muted hover:text-danger">{isEs?'Quitar':'Remove'}</button></div>
                  ) : (
                    <div className="flex flex-col items-center gap-2"><Upload size={28} className="text-text-muted"/><p className="text-text-secondary text-sm font-medium">{isEs?'Arrastra un archivo o haz clic':'Drop a file or click to browse'}</p><p className="text-text-muted text-xs">.txt, .md, .csv — max 5MB</p></div>
                  )}
                </div>
                <div className="flex justify-end"><GenBtn/></div>
              </div>
            )}
            {mode==='record' && (
              <div className="space-y-4">
                <input type="text" value={topic} onChange={e=>setTopic(e.target.value)} placeholder={isEs?'Titulo o tema (opcional)':'Title or topic (optional)'} className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"/>
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="relative">
                    {isRec&&<motion.div className="absolute inset-0 rounded-full bg-danger/20" animate={{scale:[1,1.6,1],opacity:[.4,0,.4]}} transition={{duration:1.5,repeat:Infinity}}/>}
                    <button onClick={isRec?stopRec:startRec} className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${isRec?'bg-danger hover:bg-red-400 shadow-lg shadow-danger/30':'bg-surface-2 hover:bg-brand-50 border-2 border-border'}`}>
                      {isRec?<MicOff size={26} className="text-white"/>:<Mic size={26} className="text-text-muted"/>}
                    </button>
                  </div>
                  {isRec ? <div className="flex items-center gap-2"><div className="w-2 h-2 bg-danger rounded-full animate-pulse"/><span className="text-danger font-semibold text-sm">{isEs?'Grabando':'Recording'}</span><span className="text-text-muted text-xs font-mono">{fmtTime(recTime)}</span></div> : <p className="text-text-muted text-xs">{isEs?'Clic para grabar':'Click to record'}</p>}
                </div>
                {notes.trim()&&<div className="bg-surface-2 rounded-xl p-3 max-h-32 overflow-y-auto"><p className="text-sm text-text-secondary leading-relaxed">{notes}</p></div>}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">{notes.length>0&&`${notes.split(/\s+/).filter(Boolean).length} ${isEs?'palabras':'words'}`}</span>
                  <div className="flex gap-2">{notes.trim()&&<button onClick={clearAll} className="p-2 text-text-muted hover:text-danger"><X size={16}/></button>}<GenBtn/></div>
                </div>
              </div>
            )}
          </div>
          {/* Quick topics */}
          {mode==='type'&&<div className="flex flex-wrap gap-2 px-4 pb-4">{(isEs?['Fotosintesis','Segunda Guerra Mundial','Sistema Solar']:['Photosynthesis','World War 2','Solar System']).map(tp=>(<button key={tp} onClick={()=>setTopic(tp)} className="px-3 py-1.5 bg-surface-2 hover:bg-brand-50 border border-border hover:border-brand-200 rounded-lg text-xs font-medium text-text-secondary hover:text-brand-700 transition-all">{tp}</button>))}</div>}
        </motion.div>

        {/* Tool Cards */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">{isEs?'Herramientas de Estudio':'Study Tools'}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tl,i)=>(
              <motion.button key={i} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.15+i*0.08}} onClick={()=>nav(tl.path)} className="bg-surface-card border border-border rounded-2xl p-5 text-left hover:shadow-lg hover:border-brand-200 hover:-translate-y-0.5 transition-all group">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tl.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}><tl.icon size={22} className="text-white"/></div>
                <h3 className="font-bold text-text-primary mb-1">{tl.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{tl.desc}</p>
                <div className="flex items-center gap-1 mt-3 text-brand-600 text-xs font-semibold"><span>{isEs?'Abrir':'Open'}</span><ArrowRight size={13}/></div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Recent Sets */}
        <div>
          <h2 className="text-xl font-bold text-text-primary mb-4">{isEs?'Sets Recientes':'Recent Study Sets'}</h2>
          {loadingSets ? <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-16 bg-surface-2 rounded-xl animate-pulse"/>)}</div>
          : sets.length===0 ? <div className="text-center py-12 text-text-muted"><BookOpen size={40} className="mx-auto mb-3 opacity-40"/><p>{isEs?'Aun no hay sets. Genera el primero!':'No sets yet. Generate your first one!'}</p></div>
          : <div className="space-y-2">{sets.map(s=>(
            <div key={s.id} className="bg-surface-card border border-border rounded-xl px-4 py-3 flex items-center justify-between hover:border-brand-200 transition-all group cursor-pointer" onClick={()=>nav(`/study/${s.id}`)}>
              <div><h3 className="font-semibold text-text-primary group-hover:text-brand-600 transition-colors text-sm">{s.topic}</h3><div className="flex items-center gap-2 mt-0.5"><span className="text-[11px] text-text-muted flex items-center gap-1"><Clock size={11}/>{new Date(s.created_at).toLocaleDateString(s.language==='es'?'es-ES':'en-US')}</span><span className="text-[10px] px-1.5 py-0.5 bg-surface-2 rounded text-text-muted uppercase">{s.language}</span></div></div>
              <div className="flex items-center gap-1"><button onClick={e=>{e.stopPropagation();del(s.id);}} className="p-1.5 text-text-muted hover:text-danger transition-colors"><Trash2 size={15}/></button><ChevronRight size={16} className="text-text-muted"/></div>
            </div>
          ))}</div>}
        </div>
      </div>
    </Shell>
  );
}

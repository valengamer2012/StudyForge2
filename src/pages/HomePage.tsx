import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Brain, BookOpen, Target, Lightbulb, GraduationCap, Type, ClipboardPaste, Upload, Mic, MicOff, FileText, X, Check, Trash2, Clock, ChevronRight, FileCheck, Calculator, ArrowRight, Zap, Crown, Lock } from 'lucide-react';
import Navbar from '../components/Navbar';
import PaywallModal from '../components/PaywallModal';
import UsageBadge from '../components/UsageBadge';
import UpgradeBanner from '../components/UpgradeBanner';
import { useSubscription } from '../lib/useSubscription';
import { Language, t } from '../lib/i18n';
import type { User } from '@supabase/supabase-js';

type InputMode = 'type' | 'paste' | 'upload' | 'record';

export default function HomePage({ lang, setLang, user, authLoading }: { lang: Language; setLang: (l: Language) => void; user: User | null; authLoading: boolean }) {
  const es = lang === 'es';
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentSets, setRecentSets] = useState<any[]>([]);
  const [loadingSets, setLoadingSets] = useState(true);
  const [inputMode, setInputMode] = useState<InputMode>('type');
  const [fileName, setFileName] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);
  const nav = useNavigate();
  const [showPaywall, setShowPaywall] = useState(false);
  const { plan, canUse, getRemaining, getLimit, trackUsage } = useSubscription(user);

  useEffect(() => { fetch('/api/study-sets').then(r=>r.json()).then(d=>{ if(Array.isArray(d)) setRecentSets(d); }).catch(()=>{}).finally(()=>setLoadingSets(false)); }, []);
  useEffect(() => { return () => { if(timerRef.current) clearInterval(timerRef.current); if(recognitionRef.current) try{recognitionRef.current.stop();}catch{}; }; }, []);

  const hasContent = topic.trim().length > 0 || notes.trim().length > 0;
  const handleGenerate = async () => {
    if(!hasContent||loading) return;
    // Auth gate
    if (!user) { nav('/auth?redirect=/'); return; }
    // Usage gate
    if (!canUse('study_sets')) { setShowPaywall(true); return; }
    setLoading(true);
    try {
      await trackUsage('study_sets');
      const body: any = { language: lang };
      body.topic = topic.trim() || notes.trim().split(/[.\n]/)[0]?.slice(0,60) || 'My Notes';
      if(notes.trim()) body.notes = notes.trim();
      const res = await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const data = await res.json(); if(res.ok) nav(`/study/${data.id}`);
    } catch(err){console.error(err);} finally{setLoading(false);}
  };
  const handleDelete = async (id:number) => { await fetch('/api/study-sets',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})}); setRecentSets(prev=>prev.filter(s=>s.id!==id)); };
  const handleFile = (file:File) => { if(!file||file.size>5*1024*1024) return; setFileName(file.name); const r=new FileReader(); r.onload=e=>{const t=e.target?.result as string; setNotes(t); if(!topic.trim()){const fl=t.split(/[\n.]/)[0]?.trim().slice(0,60); if(fl) setTopic(fl);}}; r.readAsText(file); };
  const startRecording = () => { const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition; if(!SR){alert('Browser not supported');return;} const rec=new SR(); rec.continuous=true; rec.interimResults=true; rec.lang=es?'es-ES':'en-US'; let ft=notes; rec.onresult=(e:any)=>{for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal){ft+=(ft?' ':'')+e.results[i][0].transcript;setNotes(ft);}}}; rec.onerror=()=>stopRecording(); rec.onend=()=>{if(isRecording)try{rec.start();}catch{}}; recognitionRef.current=rec; rec.start(); setIsRecording(true); setRecordingTime(0); timerRef.current=window.setInterval(()=>setRecordingTime(p=>p+1),1000); };
  const stopRecording = () => { setIsRecording(false); if(timerRef.current){clearInterval(timerRef.current);timerRef.current=null;} if(recognitionRef.current)try{recognitionRef.current.stop();}catch{}; recognitionRef.current=null; if(notes.trim()&&!topic.trim()){const fl=notes.split(/[.\n]/)[0]?.trim().slice(0,60); if(fl) setTopic(fl);} };
  const clearAll = () => { setTopic(''); setNotes(''); setFileName(''); if(isRecording) stopRecording(); };
  const fmt = (s:number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  const modes: {key:InputMode;label:string;icon:typeof Type}[] = [{key:'type',label:es?'Escribir':'Type',icon:Type},{key:'paste',label:es?'Pegar':'Paste',icon:ClipboardPaste},{key:'upload',label:es?'Subir':'Upload',icon:Upload},{key:'record',label:es?'Grabar':'Record',icon:Mic}];

  const tools = [
    { icon: FileCheck, title: es?'Calificador de Ensayos':'AI Paper Grader', desc: es?'Sube tu ensayo y recibe retroalimentacion con rubrica detallada':'Upload essays and get rubric-based feedback with detailed scoring', to: '/grader', color: 'from-violet-500 to-purple-600', badge: 'NEW' },
    { icon: Calculator, title: es?'Resolutor Paso a Paso':'Step-by-Step Solver', desc: es?'Resuelve problemas de matematicas y ciencias con explicaciones claras':'Solve math & science problems with clear step-by-step explanations', to: '/solver', color: 'from-emerald-500 to-teal-600', badge: 'NEW' },
    { icon: Brain, title: es?'Tarjetas Inteligentes':'Smart Flashcards', desc: es?'Tarjetas generadas por IA para memorizacion efectiva':'AI-generated flashcards for effective memorization', to: '/', color: 'from-blue-500 to-indigo-600', badge: '' },
    { icon: Target, title: es?'Cuestionarios':'Interactive Quizzes', desc: es?'Preguntas de opcion multiple para evaluar tu conocimiento':'Multiple choice questions to test your knowledge', to: '/', color: 'from-amber-500 to-orange-600', badge: '' },
    { icon: BookOpen, title: es?'Completar Espacios':'Fill in the Blanks', desc: es?'Ejercicios de recuerdo activo':'Active recall exercises for deeper learning', to: '/', color: 'from-rose-500 to-pink-600', badge: '' },
    { icon: GraduationCap, title: es?'Estudio y Repaso':'Study & Review', desc: es?'Notas estructuradas para repasar antes de evaluarte':'Structured study notes to review before testing', to: '/', color: 'from-cyan-500 to-sky-600', badge: '' },
  ];

  return (
    <div className="min-h-screen bg-[#060b18]">
      <Navbar lang={lang} setLang={setLang} user={user} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[-30%] left-[-10%] w-[600px] h-[600px] bg-blue-600/6 rounded-full blur-[120px]"/><div className="absolute bottom-[-30%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/6 rounded-full blur-[120px]"/></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-16 md:pt-24 pb-12 text-center">
          <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.6}}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-6"><Sparkles size={14} />{es?'Herramientas de Estudio con IA':'AI-Powered Study Tools'}</div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.1] mb-5">{es?'De tema a set de estudio':'From topic to study set'} <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{es?'en segundos':'in seconds'}</span></h1>
            <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">{es?'Escribe, pega, sube o graba. Nuestra IA genera tarjetas, cuestionarios, califica ensayos y resuelve problemas.':'Type, paste, upload, or record. Our AI generates flashcards, quizzes, grades essays, and solves problems.'}</p>
          </motion.div>

          {/* Input */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.15}} className="max-w-2xl mx-auto">
            {/* Usage badge */}
            {user && plan === 'free' && (
              <div className="flex justify-center mb-3">
                <UsageBadge plan={plan} feature="study_sets" remaining={getRemaining('study_sets')} limit={getLimit('study_sets')} lang={lang} onUpgrade={() => setShowPaywall(true)} />
              </div>
            )}
            <div className="flex items-center justify-center gap-1 mb-3">{modes.map(m=>(<button key={m.key} onClick={()=>{setInputMode(m.key);if(isRecording)stopRecording();}} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${inputMode===m.key?'bg-blue-500/15 text-blue-400 border border-blue-500/25':'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}><m.icon size={15}/><span className="hidden sm:inline">{m.label}</span></button>))}</div>

            <div className="glass-light rounded-2xl border border-white/10 overflow-hidden">
              {inputMode==='type'&&(<div className="p-2 flex flex-col sm:flex-row gap-2"><input type="text" value={topic} onChange={e=>setTopic(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleGenerate()} placeholder={es?'Ingresa un tema...':'Enter a topic...'} className="flex-1 px-5 py-4 bg-transparent text-white placeholder-slate-500 focus:outline-none text-lg"/><button onClick={handleGenerate} disabled={loading||!hasContent} className="px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl disabled:opacity-40 transition-all flex items-center justify-center gap-2 shrink-0">{loading?<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<Sparkles size={18}/>}{loading?(es?'Generando...':'Generating...'):(es?'Generar':'Generate')}</button></div>)}
              {inputMode==='paste'&&(<div className="p-4 space-y-3"><input type="text" value={topic} onChange={e=>setTopic(e.target.value)} placeholder={es?'Titulo (opcional)':'Title (optional)'} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/50"/><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder={es?'Pega tus apuntes aqui...':'Paste your notes here...'} rows={5} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/50 resize-none"/><div className="flex justify-between items-center"><span className="text-xs text-slate-600">{notes.length>0&&`${notes.split(/\s+/).filter(Boolean).length} ${es?'palabras':'words'}`}</span><div className="flex gap-2">{hasContent&&<button onClick={clearAll} className="p-2 text-slate-500 hover:text-white"><X size={16}/></button>}<button onClick={handleGenerate} disabled={loading||!hasContent} className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl disabled:opacity-40 flex items-center gap-2 text-sm">{loading?<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<Sparkles size={15}/>}{loading?(es?'Generando...':'Generating...'):(es?'Generar':'Generate')}</button></div></div></div>)}
              {inputMode==='upload'&&(<div className="p-4 space-y-3"><input type="text" value={topic} onChange={e=>setTopic(e.target.value)} placeholder={es?'Titulo (opcional)':'Title (optional)'} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/50"/><input ref={fileInputRef} type="file" accept=".txt,.md,.csv" className="hidden" onChange={e=>{const f=e.target.files?.[0]; if(f)handleFile(f);}}/><div onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={e=>{e.preventDefault();setDragOver(false);const f=e.dataTransfer.files[0];if(f)handleFile(f);}} onClick={()=>fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragOver?'border-blue-400 bg-blue-500/10':fileName?'border-emerald-500/40 bg-emerald-500/5':'border-white/10 hover:border-white/20'}`}>{fileName?(<div className="flex flex-col items-center gap-2"><Check size={28} className="text-emerald-400"/><p className="text-emerald-400 font-semibold text-sm">{fileName}</p><p className="text-xs text-slate-600">{notes.split(/\s+/).filter(Boolean).length} {es?'palabras':'words'}</p><button onClick={e=>{e.stopPropagation();setFileName('');setNotes('');}} className="text-xs text-slate-500 hover:text-red-400">{es?'Quitar':'Remove'}</button></div>):(<div className="flex flex-col items-center gap-2"><Upload size={28} className="text-slate-500"/><p className="text-slate-400 text-sm">{es?'Arrastra un archivo aqui':'Drop a file here or click'}</p><p className="text-xs text-slate-600">.txt, .md, .csv</p></div>)}</div><div className="flex justify-end"><button onClick={handleGenerate} disabled={loading||!hasContent} className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl disabled:opacity-40 flex items-center gap-2 text-sm">{loading?<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<Sparkles size={15}/>}{loading?(es?'Generando...':'Generating...'):(es?'Generar':'Generate')}</button></div></div>)}
              {inputMode==='record'&&(<div className="p-4 space-y-4"><input type="text" value={topic} onChange={e=>setTopic(e.target.value)} placeholder={es?'Titulo (opcional)':'Title (optional)'} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/50"/><div className="flex flex-col items-center gap-3 py-4"><div className="relative">{isRecording&&<motion.div className="absolute inset-0 rounded-full bg-red-500/30" animate={{scale:[1,1.5,1],opacity:[.5,0,.5]}} transition={{duration:1.5,repeat:Infinity}}/>}<button onClick={isRecording?stopRecording:startRecording} className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${isRecording?'bg-red-500 shadow-lg shadow-red-500/30':'bg-white/10 border border-white/10 hover:bg-white/15'}`}>{isRecording?<MicOff size={28} className="text-white"/>:<Mic size={28} className="text-slate-400"/>}</button></div>{isRecording?<div className="flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/><span className="text-red-400 text-sm font-semibold">{es?'Grabando...':'Recording...'}</span><span className="text-slate-500 text-xs font-mono">{fmt(recordingTime)}</span></div>:<p className="text-slate-500 text-xs">{es?'Toca el microfono para grabar':'Tap the mic to start recording'}</p>}</div>{notes.trim()&&<div className="bg-white/5 rounded-xl p-3 max-h-32 overflow-y-auto"><p className="text-sm text-slate-400">{notes}</p></div>}<div className="flex justify-between items-center"><span className="text-xs text-slate-600">{notes.length>0&&`${notes.split(/\s+/).filter(Boolean).length} ${es?'palabras':'words'}`}</span><div className="flex gap-2">{notes.trim()&&<button onClick={clearAll} className="p-2 text-slate-500 hover:text-white"><X size={16}/></button>}<button onClick={handleGenerate} disabled={loading||!hasContent} className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl disabled:opacity-40 flex items-center gap-2 text-sm">{loading?<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<Sparkles size={15}/>}{loading?(es?'Generando...':'Generating...'):(es?'Generar':'Generate')}</button></div></div></div>)}
            </div>
            {inputMode==='type'&&<div className="flex flex-wrap justify-center gap-2 mt-5">{(es?['Fotosintesis','Segunda Guerra Mundial','Sistema Solar']:['Photosynthesis','World War 2','Solar System']).map(tp=>(<button key={tp} onClick={()=>setTopic(tp)} className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/8 rounded-lg text-xs text-slate-400 hover:text-white transition-all">{tp}</button>))}</div>}
          </motion.div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white text-center mb-10">{es?'Herramientas de Estudio':'Study Tools'}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tl,i)=>(
            <motion.div key={i} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.06}}>
              <Link to={tl.to} className="block glass-light rounded-2xl border border-white/10 p-5 hover:border-white/20 transition-all group h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tl.color} flex items-center justify-center group-hover:scale-110 transition-transform`}><tl.icon size={20} className="text-white"/></div>
                  <h3 className="text-base font-bold text-white">{tl.title}</h3>
                  {tl.badge&&<span className="px-2 py-0.5 bg-blue-500/15 text-blue-400 text-[10px] font-bold rounded-full">{tl.badge}</span>}
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{tl.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">{es?'Planes para cada estudiante':'Plans for every student'}</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">{es?'Comienza gratis y desbloquea herramientas avanzadas cuando las necesites':'Start free and unlock advanced tools when you need them'}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {/* Free */}
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0}} className="glass-light rounded-2xl border border-white/10 p-6 hover:border-white/15 transition-all">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center"><Sparkles size={18} className="text-slate-400"/></div>
              <h3 className="text-lg font-bold text-white">Free</h3>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-3xl font-extrabold text-white">$0</span>
              <span className="text-slate-500 text-sm">/{es?'mes':'mo'}</span>
            </div>
            <p className="text-slate-400 text-xs mb-5">{es?'Perfecto para empezar':'Perfect to get started'}</p>
            <ul className="space-y-2 mb-5">
              {(es?['5 resumenes IA por mes','Tarjetas basicas','1 calificacion de ensayo','Resolutor basico']:['5 AI summaries per month','Basic flashcards','1 paper grade per month','Basic problem solver']).map((f,i)=>(
                <li key={i} className="flex items-center gap-2 text-xs text-slate-400"><Check size={13} className="text-slate-600 shrink-0"/>{f}</li>
              ))}
            </ul>
            <Link to={user?'/':'/auth'} className="block text-center py-2.5 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all">{es?'Comenzar Gratis':'Start Free'}</Link>
          </motion.div>

          {/* Pro — Popular */}
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.08}} className="relative rounded-2xl border p-6 bg-gradient-to-b from-blue-500/10 to-indigo-500/5 border-blue-500/30 shadow-xl shadow-blue-500/10 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold rounded-full shadow-lg whitespace-nowrap">{es?'Mas Popular':'Most Popular'} 🔥</div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center"><Zap size={18} className="text-blue-400"/></div>
              <h3 className="text-lg font-bold text-white">Pro</h3>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-extrabold text-white">$8</span>
              <span className="text-slate-500 text-sm">/{es?'mes':'mo'}</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] text-slate-600 line-through">$12/{es?'mes':'mo'}</span>
              <span className="text-[11px] text-emerald-400 font-semibold">{es?'Ahorra 33%':'Save 33%'}</span>
            </div>
            <p className="text-slate-400 text-xs mb-5">{es?'Para estudiantes serios':'For serious students'}</p>
            <ul className="space-y-2 mb-5">
              {(es?['Resumenes IA ilimitados','Calificaciones ilimitadas','Resolutor avanzado','Exportar a PDF','Seguimiento de racha']:['Unlimited AI summaries','Unlimited paper grades','Advanced problem solver','Export to PDF','Streak tracking']).map((f,i)=>(
                <li key={i} className="flex items-center gap-2 text-xs text-slate-300"><Check size={13} className="text-blue-400 shrink-0"/>{f}</li>
              ))}
            </ul>
            <Link to="/pricing" className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 transition-all">{es?'Obtener Pro':'Get Pro'} <ArrowRight size={14}/></Link>
          </motion.div>

          {/* Premium */}
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.16}} className="glass-light rounded-2xl border border-white/10 p-6 hover:border-white/15 transition-all">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center"><Crown size={18} className="text-amber-400"/></div>
              <h3 className="text-lg font-bold text-white">Premium</h3>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-extrabold text-white">$18</span>
              <span className="text-slate-500 text-sm">/{es?'mes':'mo'}</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] text-slate-600 line-through">$24/{es?'mes':'mo'}</span>
              <span className="text-[11px] text-emerald-400 font-semibold">{es?'Ahorra 25%':'Save 25%'}</span>
            </div>
            <p className="text-slate-400 text-xs mb-5">{es?'La experiencia completa':'The complete experience'}</p>
            <ul className="space-y-2 mb-5">
              {(es?['Todo lo de Pro','Tutoria IA personalizada','Soporte prioritario 24/7','Integracion con LMS','Colaboracion en equipo']:['Everything in Pro','Personalized AI tutoring','Priority support 24/7','LMS integration','Team collaboration']).map((f,i)=>(
                <li key={i} className="flex items-center gap-2 text-xs text-slate-300"><Check size={13} className="text-amber-400 shrink-0"/>{f}</li>
              ))}
            </ul>
            <Link to="/pricing" className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 shadow-lg shadow-amber-500/20 transition-all">{es?'Obtener Premium':'Get Premium'} <ArrowRight size={14}/></Link>
          </motion.div>
        </div>

        <div className="text-center">
          <Link to="/pricing" className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
            {es?'Ver todos los detalles y preguntas frecuentes':'View all details and FAQ'} <ArrowRight size={14}/>
          </Link>
        </div>
      </section>

      {/* Recent Sets */}
      {recentSets.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 pb-20">
          <h2 className="text-xl font-bold text-white mb-5">{es?'Sets Recientes':'Recent Study Sets'}</h2>
          <div className="space-y-2">
            {recentSets.map(set=>(
              <div key={set.id} className="glass-light rounded-xl border border-white/10 p-4 flex items-center justify-between hover:border-white/20 transition-all group">
                <div className="flex-1 cursor-pointer" onClick={()=>nav(`/study/${set.id}`)}>
                  <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">{set.topic}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Clock size={10}/>{new Date(set.created_at).toLocaleDateString()}<span className="ml-1 uppercase">{set.language}</span></p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={()=>handleDelete(set.id)} className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={15}/></button>
                  <button onClick={()=>nav(`/study/${set.id}`)} className="p-1.5 text-slate-600 hover:text-blue-400 transition-colors"><ChevronRight size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t border-white/5 py-8 text-center text-slate-600 text-xs">StudyForge — AI-Powered Study Tools</footer>

      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="study_sets"
        featureLabel={es ? 'sets de estudio' : 'study sets'}
        used={getLimit('study_sets') - getRemaining('study_sets')}
        limit={getLimit('study_sets')}
        lang={lang}
        plan={plan}
      />
    </div>
  );
}

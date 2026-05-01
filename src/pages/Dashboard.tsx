import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, FileCheck, Calculator, Brain, Target, Upload, ClipboardPaste, Mic, MicOff, Type, X, Check, FileText, Clock, Trash2, ChevronRight, Lightbulb, GraduationCap, ArrowRight } from 'lucide-react';
import { Language, t } from '../lib/i18n';

type InputMode = 'type' | 'paste' | 'upload' | 'record';

export default function Dashboard({ lang, setLang }: { lang: Language; setLang: (l: Language) => void }) {
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
  const navigate = useNavigate();

  const fetchSets = async () => {
    try { const r = await fetch('/api/study-sets'); setRecentSets(await r.json()); } catch {} finally { setLoadingSets(false); }
  };
  useEffect(() => { fetchSets(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  const hasContent = topic.trim().length > 0 || notes.trim().length > 0;

  const handleGenerate = async () => {
    if (!hasContent || loading) return;
    setLoading(true);
    try {
      const body: any = { language: lang };
      body.topic = topic.trim() || (notes.trim().split(/[.\n]/)[0]?.slice(0, 60) || 'My Notes');
      if (notes.trim()) body.notes = notes.trim();
      const res = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.ok) navigate(`/study/${data.id}`);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    await fetch('/api/study-sets', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchSets();
  };

  const handleFile = (file: File) => {
    if (!file || file.size > 5 * 1024 * 1024) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => { const txt = e.target?.result as string; setNotes(txt); if (!topic.trim()) { const fl = txt.split(/[\n.]/)[0]?.trim().slice(0, 60); if (fl) setTopic(fl); } };
    reader.readAsText(file);
  };

  const startRecording = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Voice not supported'); return; }
    const rec = new SR(); rec.continuous = true; rec.interimResults = true; rec.lang = lang === 'es' ? 'es-ES' : 'en-US';
    let ft = notes;
    rec.onresult = (e: any) => { for (let i = e.resultIndex; i < e.results.length; i++) { if (e.results[i].isFinal) { ft += (ft ? ' ' : '') + e.results[i][0].transcript; setNotes(ft); } } };
    rec.onerror = () => stopRecording();
    rec.onend = () => { if (isRecording) try { rec.start(); } catch {} };
    recognitionRef.current = rec; rec.start(); setIsRecording(true); setRecordingTime(0);
    timerRef.current = window.setInterval(() => setRecordingTime(p => p + 1), 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} recognitionRef.current = null; }
    if (notes.trim() && !topic.trim()) { const fl = notes.split(/[.\n]/)[0]?.trim().slice(0, 60); if (fl) setTopic(fl); }
  };

  const clearAll = () => { setTopic(''); setNotes(''); setFileName(''); if (isRecording) stopRecording(); };
  const fmt = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  const modes: { key: InputMode; icon: typeof Type; label: string }[] = [
    { key: 'type', icon: Type, label: lang === 'es' ? 'Escribir' : 'Type' },
    { key: 'paste', icon: ClipboardPaste, label: lang === 'es' ? 'Pegar' : 'Paste' },
    { key: 'upload', icon: Upload, label: lang === 'es' ? 'Subir' : 'Upload' },
    { key: 'record', icon: Mic, label: lang === 'es' ? 'Grabar' : 'Record' },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-6">
              <Sparkles size={12} />{lang === 'es' ? 'Herramientas de Estudio con IA' : 'AI-Powered Study Tools'}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-text leading-tight mb-4">
              {lang === 'es' ? 'De tema a set de estudio' : 'From topic to study set'}{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{lang === 'es' ? 'en segundos' : 'in seconds'}</span>
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-8">
              {lang === 'es' ? 'Escribe, pega, sube o graba. Nuestra IA genera tarjetas, cuestionarios y mas.' : 'Type, paste, upload, or record. Our AI generates flashcards, quizzes, and more.'}
            </p>
          </motion.div>

          {/* Input Card */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="max-w-2xl mx-auto">
            <div className="flex justify-center gap-1 mb-3">
              {modes.map(m => (
                <button key={m.key} onClick={() => { setInputMode(m.key); if (isRecording) stopRecording(); }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${inputMode === m.key ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-text-muted hover:bg-surface-alt'}`}>
                  <m.icon size={15} /><span className="hidden sm:inline">{m.label}</span>
                </button>
              ))}
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-lg shadow-black/5 overflow-hidden">
              {inputMode === 'type' && (
                <div className="p-2 flex flex-col sm:flex-row gap-2">
                  <input type="text" value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                    placeholder={lang === 'es' ? 'Ingresa un tema (ej., Fotosintesis, Sistema Solar...)' : 'Enter a topic (e.g., Photosynthesis, Solar System...)'}
                    className="flex-1 px-4 py-3.5 bg-transparent text-text placeholder-text-muted focus:outline-none text-base" />
                  <button onClick={handleGenerate} disabled={loading || !hasContent}
                    className="px-6 py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl disabled:opacity-40 transition-all flex items-center justify-center gap-2 shrink-0 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30">
                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={18} />}
                    {loading ? (lang === 'es' ? 'Generando...' : 'Generating...') : (lang === 'es' ? 'Generar' : 'Generate')}
                  </button>
                </div>
              )}
              {inputMode === 'paste' && (
                <div className="p-4 space-y-3">
                  <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder={lang === 'es' ? 'Titulo o tema (opcional)' : 'Title or topic (optional)'}
                    className="w-full px-3.5 py-2.5 bg-surface-alt border border-border rounded-xl text-text placeholder-text-muted focus:outline-none focus:border-primary/50 text-sm" />
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder={lang === 'es' ? 'Pega tus apuntes aqui...' : 'Paste your notes here...'} rows={5}
                    className="w-full px-3.5 py-2.5 bg-surface-alt border border-border rounded-xl text-text placeholder-text-muted focus:outline-none focus:border-primary/50 resize-none text-sm leading-relaxed" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-muted">{notes.length > 0 && `${notes.split(/\s+/).filter(Boolean).length} ${lang === 'es' ? 'palabras' : 'words'}`}</span>
                    <div className="flex gap-2">{hasContent && <button onClick={clearAll} className="p-2 text-text-muted hover:text-danger"><X size={16} /></button>}
                      <button onClick={handleGenerate} disabled={loading || !hasContent} className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl disabled:opacity-40 flex items-center gap-2 shadow-md shadow-primary/20 text-sm">
                        {loading ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={15} />}{loading ? '...' : (lang === 'es' ? 'Generar' : 'Generate')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {inputMode === 'upload' && (
                <div className="p-4 space-y-3">
                  <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder={lang === 'es' ? 'Titulo o tema (opcional)' : 'Title or topic (optional)'}
                    className="w-full px-3.5 py-2.5 bg-surface-alt border border-border rounded-xl text-text placeholder-text-muted focus:outline-none focus:border-primary/50 text-sm" />
                  <input ref={fileInputRef} type="file" accept=".txt,.md,.csv" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
                  <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragOver ? 'border-primary bg-primary/5' : fileName ? 'border-success/40 bg-success/5' : 'border-border hover:border-primary/40 hover:bg-primary/5'}`}>
                    {fileName ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center"><Check size={24} className="text-success" /></div>
                        <p className="text-success font-semibold text-sm">{lang === 'es' ? 'Archivo cargado' : 'File loaded'}</p>
                        <p className="text-text-muted text-xs flex items-center gap-1"><FileText size={12} />{fileName}</p>
                        <button onClick={e => { e.stopPropagation(); setFileName(''); setNotes(''); }} className="text-xs text-text-muted hover:text-danger mt-1">{lang === 'es' ? 'Quitar' : 'Remove'}</button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${dragOver ? 'bg-primary/10 scale-110' : 'bg-surface-alt'}`}><Upload size={24} className={dragOver ? 'text-primary' : 'text-text-muted'} /></div>
                        <p className="text-text-secondary text-sm font-medium">{lang === 'es' ? 'Arrastra un archivo .txt aqui' : 'Drop a .txt file here, or click'}</p>
                        <p className="text-text-muted text-xs">.txt, .md, .csv — max 5MB</p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end"><button onClick={handleGenerate} disabled={loading || !hasContent} className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl disabled:opacity-40 flex items-center gap-2 shadow-md shadow-primary/20 text-sm">
                    {loading ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={15} />}{loading ? '...' : (lang === 'es' ? 'Generar' : 'Generate')}
                  </button></div>
                </div>
              )}
              {inputMode === 'record' && (
                <div className="p-4 space-y-4">
                  <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder={lang === 'es' ? 'Titulo o tema (opcional)' : 'Title or topic (optional)'}
                    className="w-full px-3.5 py-2.5 bg-surface-alt border border-border rounded-xl text-text placeholder-text-muted focus:outline-none focus:border-primary/50 text-sm" />
                  <div className="flex flex-col items-center gap-3 py-4">
                    <div className="relative">
                      {isRecording && <motion.div className="absolute inset-0 rounded-full bg-danger/20" animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} />}
                      <button onClick={isRecording ? stopRecording : startRecording}
                        className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-danger shadow-lg shadow-danger/30' : 'bg-surface-alt border-2 border-border hover:border-primary/40'}`}>
                        {isRecording ? <MicOff size={26} className="text-white" /> : <Mic size={26} className="text-text-muted" />}
                      </button>
                    </div>
                    {isRecording ? <div className="flex items-center gap-2"><div className="w-2 h-2 bg-danger rounded-full animate-pulse" /><span className="text-danger font-semibold text-sm">{lang === 'es' ? 'Grabando...' : 'Recording...'}</span><span className="text-text-muted font-mono text-xs">{fmt(recordingTime)}</span></div>
                    : <p className="text-text-muted text-sm">{lang === 'es' ? 'Toca el microfono para grabar' : 'Tap the mic to start recording'}</p>}
                  </div>
                  {notes.trim() && <div className="bg-surface-alt border border-border rounded-xl p-3 max-h-32 overflow-y-auto"><p className="text-sm text-text-secondary leading-relaxed">{notes}</p></div>}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-muted">{notes.length > 0 && `${notes.split(/\s+/).filter(Boolean).length} ${lang === 'es' ? 'palabras' : 'words'}`}</span>
                    <div className="flex gap-2">{notes.trim() && <button onClick={clearAll} className="p-2 text-text-muted hover:text-danger"><X size={16} /></button>}
                      <button onClick={handleGenerate} disabled={loading || !hasContent} className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl disabled:opacity-40 flex items-center gap-2 shadow-md shadow-primary/20 text-sm">
                        {loading ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={15} />}{loading ? '...' : (lang === 'es' ? 'Generar' : 'Generate')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {inputMode === 'type' && (
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {(lang === 'es' ? ['Fotosintesis', 'Segunda Guerra Mundial', 'Sistema Solar'] : ['Photosynthesis', 'World War 2', 'Solar System']).map(tp => (
                  <button key={tp} onClick={() => setTopic(tp)} className="px-3.5 py-1.5 bg-card border border-border hover:border-primary/30 rounded-lg text-sm text-text-secondary hover:text-primary transition-all">{tp}</button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Tool Cards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-2xl font-extrabold text-text mb-6">{lang === 'es' ? 'Herramientas Destacadas' : 'Featured Tools'}</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {/* Paper Grader */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            onClick={() => navigate('/grader')}
            className="bg-card rounded-2xl border border-border p-6 cursor-pointer group hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0 group-hover:scale-105 transition-transform">
                <FileCheck size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-text">{lang === 'es' ? 'Calificador de Ensayos' : 'AI Paper Grader'}</h3>
                  <ArrowRight size={18} className="text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-text-secondary text-sm mt-1 leading-relaxed">{lang === 'es' ? 'Sube tu ensayo y recibe calificacion con rubrica, fortalezas y areas de mejora.' : 'Upload your essay and receive rubric-based grading, strengths, and areas for improvement.'}</p>
                <div className="flex gap-2 mt-3">
                  {(lang === 'es' ? ['Rubrica', 'Retroalimentacion', 'Puntuacion'] : ['Rubric', 'Feedback', 'Scoring']).map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md font-medium">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Problem Solver */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            onClick={() => navigate('/solver')}
            className="bg-card rounded-2xl border border-border p-6 cursor-pointer group hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0 group-hover:scale-105 transition-transform">
                <Calculator size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-text">{lang === 'es' ? 'Resolutor Paso a Paso' : 'Step-by-Step Solver'}</h3>
                  <ArrowRight size={18} className="text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-text-secondary text-sm mt-1 leading-relaxed">{lang === 'es' ? 'Ingresa un problema de matematicas o ciencias y obtén una solucion detallada paso a paso.' : 'Enter a math or science problem and get a detailed step-by-step solution with explanations.'}</p>
                <div className="flex gap-2 mt-3">
                  {(lang === 'es' ? ['Matematicas', 'Fisica', 'Quimica'] : ['Math', 'Physics', 'Chemistry']).map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-medium">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Study Tools Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="text-2xl font-extrabold text-text mb-6">{lang === 'es' ? 'Herramientas de Estudio' : 'Study Tools'}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Brain, title: lang === 'es' ? 'Tarjetas' : 'Flashcards', desc: lang === 'es' ? 'Memorizacion efectiva' : 'Effective memorization', color: 'from-blue-500 to-indigo-600' },
            { icon: Target, title: lang === 'es' ? 'Cuestionarios' : 'Quizzes', desc: lang === 'es' ? 'Evalua tu conocimiento' : 'Test your knowledge', color: 'from-violet-500 to-purple-600' },
            { icon: BookOpen, title: lang === 'es' ? 'Completar' : 'Fill Blanks', desc: lang === 'es' ? 'Recuerdo activo' : 'Active recall', color: 'from-pink-500 to-rose-600' },
            { icon: GraduationCap, title: lang === 'es' ? 'Repaso' : 'Review', desc: lang === 'es' ? 'Notas estructuradas' : 'Structured notes', color: 'from-cyan-500 to-blue-600' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center mb-3`}><f.icon size={20} className="text-white" /></div>
              <h3 className="font-bold text-text text-sm">{f.title}</h3>
              <p className="text-text-muted text-xs mt-1">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Sets */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-20">
        <h2 className="text-2xl font-extrabold text-text mb-6">{lang === 'es' ? 'Sets Recientes' : 'Recent Study Sets'}</h2>
        {loadingSets ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-card border border-border rounded-xl animate-pulse" />)}</div>
        : recentSets.length === 0 ? <div className="text-center py-12 text-text-muted"><BookOpen size={40} className="mx-auto mb-3 opacity-40" /><p>{lang === 'es' ? 'Aun no hay sets. Genera el primero!' : 'No study sets yet. Generate your first one!'}</p></div>
        : <div className="space-y-2.5">{recentSets.map(set => (
          <div key={set.id} className="bg-card border border-border rounded-xl px-5 py-4 flex items-center justify-between hover:border-primary/20 transition-all group">
            <div className="flex-1 cursor-pointer" onClick={() => navigate(`/study/${set.id}`)}>
              <h3 className="font-bold text-text group-hover:text-primary transition-colors">{set.topic}</h3>
              <div className="flex items-center gap-2 mt-0.5"><Clock size={11} className="text-text-muted" /><span className="text-xs text-text-muted">{new Date(set.created_at).toLocaleDateString()}</span><span className="text-xs px-1.5 py-0.5 bg-surface-alt rounded text-text-muted uppercase font-medium">{set.language}</span></div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => handleDelete(set.id)} className="p-2 text-text-muted hover:text-danger transition-colors"><Trash2 size={16} /></button>
              <button onClick={() => navigate(`/study/${set.id}`)} className="p-2 text-text-muted hover:text-primary transition-colors"><ChevronRight size={18} /></button>
            </div>
          </div>
        ))}</div>}
      </section>
    </div>
  );
}

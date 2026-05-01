import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Type, ClipboardPaste, Upload, Mic, MicOff, FileText, X, Check, Clock, Trash2, ChevronRight } from 'lucide-react';
import { Language, t } from '../lib/i18n';

type InputMode = 'type' | 'paste' | 'upload' | 'record';
interface StudySet { id: number; topic: string; language: string; created_at: string; }
interface Props { lang: Language; setLang: (l: Language) => void; }

export default function StudyHubPage({ lang }: Props) {
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentSets, setRecentSets] = useState<StudySet[]>([]);
  const [loadingSets, setLoadingSets] = useState(true);
  const [inputMode, setInputMode] = useState<InputMode>('type');
  const [fileName, setFileName] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const fetchSets = async () => {
    try { const res = await fetch('/api/study-sets'); const data = await res.json(); setRecentSets(data); } catch {} finally { setLoadingSets(false); }
  };
  useEffect(() => { fetchSets(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  const hasContent = topic.trim().length > 0 || notes.trim().length > 0;

  const handleGenerate = async () => {
    if (!hasContent || loading) return;
    setLoading(true);
    try {
      const body: any = { language: lang };
      body.topic = topic.trim() || notes.trim().split(/[.\n]/)[0]?.slice(0, 60) || 'My Notes';
      if (notes.trim()) body.notes = notes.trim();
      const res = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.ok) {
        fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: 'anonymous', activity_type: 'session', xp_earned: 25, details: `Generated: ${body.topic}` }) });
        navigate(`/study/${data.id}`);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    try { await fetch('/api/study-sets', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); fetchSets(); } catch {}
  };

  const handleFile = (file: File) => {
    if (!file || file.size > 5 * 1024 * 1024) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => { const text = e.target?.result as string; setNotes(text); if (!topic.trim()) setTopic(text.split(/[\n.]/)[0]?.trim().slice(0, 60) || ''); };
    reader.readAsText(file);
  };

  const startRecording = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Voice recording not supported'); return; }
    const recognition = new SR(); recognition.continuous = true; recognition.interimResults = true; recognition.lang = lang === 'es' ? 'es-ES' : 'en-US';
    let finalT = notes;
    recognition.onresult = (e: any) => { for (let i = e.resultIndex; i < e.results.length; i++) { if (e.results[i].isFinal) { finalT += (finalT ? ' ' : '') + e.results[i][0].transcript; setNotes(finalT); } } };
    recognition.onerror = () => stopRecording();
    recognitionRef.current = recognition; recognition.start(); setIsRecording(true); setRecordingTime(0);
    timerRef.current = window.setInterval(() => setRecordingTime(p => p + 1), 1000);
  };

  const stopRecording = () => {
    setIsRecording(false); if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} recognitionRef.current = null; }
    if (notes.trim() && !topic.trim()) setTopic(notes.split(/[.\n]/)[0]?.trim().slice(0, 60) || '');
  };

  const formatTime = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  const clearAll = () => { setTopic(''); setNotes(''); setFileName(''); if (isRecording) stopRecording(); };

  const modes: { key: InputMode; label: string; icon: typeof Type }[] = [
    { key: 'type', label: lang === 'es' ? 'Escribir' : 'Type', icon: Type },
    { key: 'paste', label: lang === 'es' ? 'Pegar' : 'Paste', icon: ClipboardPaste },
    { key: 'upload', label: lang === 'es' ? 'Subir' : 'Upload', icon: Upload },
    { key: 'record', label: lang === 'es' ? 'Grabar' : 'Record', icon: Mic },
  ];

  const GenerateBtn = ({ className = '' }: { className?: string }) => (
    <button onClick={handleGenerate} disabled={loading || !hasContent}
      className={`px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold rounded-xl disabled:opacity-40 transition-all flex items-center gap-2 ${className}`}>
      {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={16} />}
      {loading ? (lang === 'es' ? 'Generando...' : 'Generating...') : (lang === 'es' ? 'Generar' : 'Generate')}
    </button>
  );

  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center"><BookOpen size={22} className="text-white" /></div>
            <div>
              <h1 className="text-2xl font-extrabold text-text">{lang === 'es' ? 'Generador de Estudio' : 'Study Set Generator'}</h1>
              <p className="text-sm text-text-3">{lang === 'es' ? 'Escribe, pega, sube o graba para crear tu set' : 'Type, paste, upload or record to create your set'}</p>
            </div>
          </div>
        </motion.div>

        {/* Mode tabs */}
        <div className="flex gap-1 mb-4 bg-white rounded-xl border border-border p-1">
          {modes.map(m => (
            <button key={m.key} onClick={() => { setInputMode(m.key); if (isRecording) stopRecording(); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${inputMode === m.key ? 'bg-primary text-white shadow-sm' : 'text-text-3 hover:bg-surface-2'}`}>
              <m.icon size={15} /><span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Input card */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden mb-6">
          {inputMode === 'type' && (
            <div className="p-4 flex flex-col sm:flex-row gap-3">
              <input type="text" value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                placeholder={lang === 'es' ? 'Ingresa un tema (ej. Fotosintesis, Algebra...)' : 'Enter a topic (e.g. Photosynthesis, Algebra...)'}
                className="flex-1 px-4 py-3 bg-surface rounded-xl text-text placeholder-text-4 focus:outline-none focus:ring-2 focus:ring-primary/20 text-lg" />
              <GenerateBtn />
            </div>
          )}
          {inputMode === 'paste' && (
            <div className="p-4 space-y-3">
              <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder={lang === 'es' ? 'Titulo (opcional)' : 'Title (optional)'}
                className="w-full px-4 py-2.5 bg-surface rounded-xl text-text placeholder-text-4 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder={lang === 'es' ? 'Pega tus apuntes aqui...' : 'Paste your notes here...'} rows={8}
                className="w-full px-4 py-3 bg-surface rounded-xl text-text placeholder-text-4 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-[15px] leading-relaxed" />
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-4">{notes.split(/\s+/).filter(Boolean).length} {lang === 'es' ? 'palabras' : 'words'}</span>
                <div className="flex gap-2">{hasContent && <button onClick={clearAll} className="p-2 text-text-4 hover:text-danger"><X size={16} /></button>}<GenerateBtn /></div>
              </div>
            </div>
          )}
          {inputMode === 'upload' && (
            <div className="p-4 space-y-3">
              <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder={lang === 'es' ? 'Titulo (opcional)' : 'Title (optional)'}
                className="w-full px-4 py-2.5 bg-surface rounded-xl text-text placeholder-text-4 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <input ref={fileInputRef} type="file" accept=".txt,.md,.csv" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
              <div onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${fileName ? 'border-success/50 bg-emerald-50' : 'border-border hover:border-primary/40 hover:bg-blue-50/50'}`}>
                {fileName ? (
                  <div className="flex flex-col items-center gap-2">
                    <Check size={28} className="text-success" />
                    <p className="font-semibold text-success">{lang === 'es' ? 'Archivo cargado' : 'File loaded'}</p>
                    <p className="text-sm text-text-3 flex items-center gap-1"><FileText size={14} />{fileName}</p>
                    <button onClick={e => { e.stopPropagation(); setFileName(''); setNotes(''); }} className="text-xs text-text-4 hover:text-danger">{lang === 'es' ? 'Quitar' : 'Remove'}</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={28} className="text-text-4" />
                    <p className="text-text-3 font-medium">{lang === 'es' ? 'Haz clic para subir un archivo' : 'Click to upload a file'}</p>
                    <p className="text-xs text-text-4">.txt, .md, .csv</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end"><GenerateBtn /></div>
            </div>
          )}
          {inputMode === 'record' && (
            <div className="p-4 space-y-4">
              <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder={lang === 'es' ? 'Titulo (opcional)' : 'Title (optional)'}
                className="w-full px-4 py-2.5 bg-surface rounded-xl text-text placeholder-text-4 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="relative">
                  {isRecording && <motion.div className="absolute inset-0 rounded-full bg-red-500/20" animate={{ scale: [1,1.6,1], opacity: [0.5,0,0.5] }} transition={{ duration: 1.5, repeat: Infinity }} />}
                  <button onClick={isRecording ? stopRecording : startRecording}
                    className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 shadow-lg shadow-red-500/30' : 'bg-surface-2 hover:bg-surface-3 border-2 border-border'}`}>
                    {isRecording ? <MicOff size={26} className="text-white" /> : <Mic size={26} className="text-text-3" />}
                  </button>
                </div>
                {isRecording ? <div className="flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /><span className="text-red-500 font-semibold text-sm">{lang === 'es' ? 'Grabando' : 'Recording'}... {formatTime(recordingTime)}</span></div>
                : <p className="text-sm text-text-4">{lang === 'es' ? 'Toca para grabar' : 'Tap to record'}</p>}
              </div>
              {notes.trim() && <div className="bg-surface rounded-xl p-3 max-h-32 overflow-y-auto"><p className="text-sm text-text-3">{notes}</p></div>}
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-4">{notes.split(/\s+/).filter(Boolean).length} {lang === 'es' ? 'palabras' : 'words'}</span>
                <div className="flex gap-2">{notes.trim() && <button onClick={clearAll} className="p-2 text-text-4 hover:text-danger"><X size={16} /></button>}<GenerateBtn /></div>
              </div>
            </div>
          )}
        </div>

        {/* Quick topics */}
        {inputMode === 'type' && (
          <div className="flex flex-wrap gap-2 mb-8">
            {(lang === 'es' ? ['Fotosintesis', 'Segunda Guerra Mundial', 'Sistema Solar', 'Algebra Lineal'] : ['Photosynthesis', 'World War 2', 'Solar System', 'Linear Algebra']).map(tp => (
              <button key={tp} onClick={() => setTopic(tp)} className="px-4 py-2 bg-white border border-border hover:border-primary/40 rounded-xl text-sm text-text-3 hover:text-primary font-medium transition-all">{tp}</button>
            ))}
          </div>
        )}

        {/* Recent sets */}
        <h2 className="text-lg font-bold text-text mb-3">{lang === 'es' ? 'Sets Recientes' : 'Recent Sets'}</h2>
        {loadingSets ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />)}</div>
        : recentSets.length === 0 ? <div className="bg-white rounded-xl border border-border p-8 text-center text-text-4"><BookOpen size={32} className="mx-auto mb-2 opacity-40" />{lang === 'es' ? 'Aun no hay sets' : 'No sets yet'}</div>
        : <div className="space-y-2">{recentSets.map(set => (
          <div key={set.id} className="bg-white rounded-xl border border-border p-4 flex items-center justify-between hover:border-primary/30 transition-all group">
            <div className="flex-1 cursor-pointer" onClick={() => navigate(`/study/${set.id}`)}>
              <p className="font-semibold text-text group-hover:text-primary transition-colors">{set.topic}</p>
              <span className="text-xs text-text-4 flex items-center gap-1 mt-0.5"><Clock size={11} />{new Date(set.created_at).toLocaleDateString(set.language === 'es' ? 'es-ES' : 'en-US')}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => handleDelete(set.id)} className="p-2 text-text-4 hover:text-danger transition-colors"><Trash2 size={16} /></button>
              <button onClick={() => navigate(`/study/${set.id}`)} className="p-2 text-text-4 hover:text-primary transition-colors"><ChevronRight size={18} /></button>
            </div>
          </div>
        ))}</div>}
      </div>
    </div>
  );
}

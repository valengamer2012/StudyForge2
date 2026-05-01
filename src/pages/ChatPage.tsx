import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Trash2, Plus, User, Bot, FileText } from 'lucide-react';
import Shell from '../components/Shell';
import { Language } from '../lib/i18n';

interface Message { role: 'user'|'assistant'; content: string; }
interface Session { id:number; title:string; messages:Message[]; notes_context:string; }
interface SessionItem { id:number; title:string; created_at:string; }

export default function ChatPage({ lang, setLang }: { lang: Language; setLang: (l: Language) => void }) {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [active, setActive] = useState<Session|null>(null);
  const [notesInput, setNotesInput] = useState('');
  const [msgInput, setMsgInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isEs = lang === 'es';

  const fetchSessions = async () => { try { const r = await fetch('/api/chat'); setSessions(await r.json()); } catch{} };
  useEffect(()=>{fetchSessions();},[]);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'});},[active?.messages]);

  const startNew = async () => {
    if (!msgInput.trim()) return;
    setSending(true);
    try {
      const r = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title: msgInput.slice(0,50), notes_context: notesInput, language: lang, message: msgInput }) });
      const d = await r.json();
      if (r.ok) { setActive(d); setMsgInput(''); setShowNotes(false); fetchSessions(); }
    } catch{} finally { setSending(false); }
  };

  const sendMsg = async () => {
    if (!msgInput.trim() || !active || sending) return;
    setSending(true);
    // Optimistic update
    const optimistic = { ...active, messages: [...active.messages, { role: 'user' as const, content: msgInput }] };
    setActive(optimistic); setMsgInput('');
    try {
      const r = await fetch('/api/chat', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ session_id: active.id, message: msgInput }) });
      const d = await r.json(); if (r.ok) setActive(d);
    } catch{} finally { setSending(false); }
  };

  const loadSession = async (id:number) => {
    try { const r = await fetch(`/api/chat?id=${id}`); const d = await r.json(); setActive(d); setShowNotes(false); setNotesInput(d.notes_context||''); } catch{}
  };

  const delSession = async (id:number) => {
    await fetch('/api/chat',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});
    fetchSessions(); if(active?.id===id) setActive(null);
  };

  const newChat = () => { setActive(null); setMsgInput(''); setShowNotes(true); };

  return (
    <Shell lang={lang} setLang={setLang}>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 pb-24 lg:pb-8">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center"><MessageCircle size={22} className="text-white"/></div>
              <div><h1 className="text-2xl font-extrabold text-text-primary">{isEs?'Chat con Apuntes':'Chat with Notes'}</h1><p className="text-sm text-text-secondary">{isEs?'Conversa con IA sobre tus apuntes':'Chat with AI about your study notes'}</p></div>
            </div>
            <button onClick={newChat} className="flex items-center gap-1.5 px-3 py-2 bg-brand-50 text-brand-700 rounded-lg text-sm font-semibold hover:bg-brand-100 transition-all"><Plus size={16}/>{isEs?'Nuevo':'New'}</button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-4">
          {/* Sidebar — sessions */}
          <div className="hidden lg:block space-y-1">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">{isEs?'Conversaciones':'Conversations'}</p>
            {sessions.length === 0 && <p className="text-xs text-text-muted">{isEs?'Ninguna aun':'None yet'}</p>}
            {sessions.map(s=>(
              <div key={s.id} className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all text-sm ${active?.id===s.id?'bg-brand-50 text-brand-700 font-semibold':'text-text-secondary hover:bg-surface-2'}`}>
                <span className="truncate flex-1" onClick={()=>loadSession(s.id)}>{s.title}</span>
                <button onClick={()=>delSession(s.id)} className="p-1 text-text-muted hover:text-danger shrink-0"><Trash2 size={13}/></button>
              </div>
            ))}
          </div>

          {/* Chat area */}
          <div className="bg-surface-card border border-border rounded-2xl flex flex-col" style={{minHeight:'500px'}}>
            {/* Notes input area */}
            {showNotes && !active && (
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2 mb-2"><FileText size={15} className="text-brand-500"/><span className="text-xs font-semibold text-text-secondary">{isEs?'Pega tus apuntes (opcional)':'Paste your notes (optional)'}</span></div>
                <textarea value={notesInput} onChange={e=>setNotesInput(e.target.value)} placeholder={isEs?'Pega tus apuntes de estudio aqui para que la IA pueda responder sobre ellos...':'Paste your study notes here so the AI can answer questions about them...'} rows={4} className="w-full px-3 py-2 bg-surface-2 border border-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-400 resize-none transition-all"/>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{maxHeight:'400px'}}>
              {!active && !sending && (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <MessageCircle size={40} className="text-text-muted/30 mb-3"/>
                  <p className="text-text-muted text-sm">{isEs?'Escribe un mensaje para empezar':'Type a message to get started'}</p>
                </div>
              )}
              {active?.messages.map((m,i)=>(
                <motion.div key={i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className={`flex gap-3 ${m.role==='user'?'justify-end':''}`}>
                  {m.role==='assistant' && <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shrink-0"><Bot size={14} className="text-white"/></div>}
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${m.role==='user'?'bg-brand-600 text-white rounded-br-md':'bg-surface-2 text-text-primary rounded-bl-md'}`}>{m.content}</div>
                  {m.role==='user' && <div className="w-7 h-7 rounded-lg bg-surface-2 flex items-center justify-center shrink-0"><User size={14} className="text-text-muted"/></div>}
                </motion.div>
              ))}
              {sending && active && <div className="flex gap-3"><div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shrink-0"><Bot size={14} className="text-white"/></div><div className="px-4 py-3 bg-surface-2 rounded-2xl rounded-bl-md"><div className="flex gap-1"><div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{animationDelay:'0ms'}}/><div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{animationDelay:'150ms'}}/><div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{animationDelay:'300ms'}}/></div></div></div>}
              <div ref={bottomRef}/>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input type="text" value={msgInput} onChange={e=>setMsgInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();active?sendMsg():startNew();}}} placeholder={isEs?'Escribe tu pregunta...':'Type your question...'} className="flex-1 px-4 py-3 bg-surface-2 border border-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"/>
                <button onClick={active?sendMsg:startNew} disabled={sending||!msgInput.trim()} className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/20"><Send size={18}/></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

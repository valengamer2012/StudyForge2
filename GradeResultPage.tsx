import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, AlertTriangle, TrendingUp, TrendingDown, Award } from 'lucide-react';
import Shell from '../components/Shell';
import { Language } from '../lib/i18n';

interface GradeResult {
  id: number; title: string; overall_score: number;
  rubric_scores: {category:string;score:number;max:number;weight:number}[];
  feedback: {type:string;text:string}[];
  strengths: string[]; improvements: string[];
}

export default function GradeResultPage({ lang, setLang }: { lang: Language; setLang: (l: Language) => void }) {
  const { id } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState<GradeResult|null>(null);
  const [loading, setLoading] = useState(true);
  const isEs = lang === 'es';

  useEffect(() => { (async()=>{ try { const r = await fetch(`/api/grade-paper?id=${id}`); setData(await r.json()); } catch{} finally{setLoading(false);} })(); }, [id]);

  if (loading) return <Shell lang={lang} setLang={setLang}><div className="flex items-center justify-center py-32"><div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin"/></div></Shell>;
  if (!data) return <Shell lang={lang} setLang={setLang}><div className="text-center py-32"><p className="text-text-secondary">Not found</p><button onClick={()=>nav('/grader')} className="text-brand-600 text-sm font-semibold mt-2">{isEs?'Volver':'Go back'}</button></div></Shell>;

  const scoreColor = data.overall_score >= 80 ? 'text-success' : data.overall_score >= 60 ? 'text-warning' : 'text-danger';
  const scoreBg = data.overall_score >= 80 ? 'from-emerald-500 to-teal-500' : data.overall_score >= 60 ? 'from-amber-500 to-orange-500' : 'from-red-500 to-rose-500';

  return (
    <Shell lang={lang} setLang={setLang}>
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 pb-24 lg:pb-8">
        <button onClick={()=>nav('/grader')} className="flex items-center gap-1 text-sm text-text-muted hover:text-brand-600 mb-6 font-medium"><ArrowLeft size={16}/>{isEs?'Volver al calificador':'Back to grader'}</button>

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
          <h1 className="text-2xl font-extrabold text-text-primary mb-1">{data.title}</h1>

          {/* Overall Score */}
          <div className="bg-surface-card border border-border rounded-2xl p-6 mt-4 flex items-center gap-6">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${scoreBg} flex items-center justify-center shadow-lg`}>
              <span className="text-3xl font-black text-white">{data.overall_score}</span>
            </div>
            <div>
              <p className="text-sm text-text-muted font-medium">{isEs?'Puntuacion General':'Overall Score'}</p>
              <p className={`text-2xl font-extrabold ${scoreColor}`}>{data.overall_score}/100</p>
              <p className="text-xs text-text-muted mt-0.5">{data.overall_score>=80?(isEs?'Excelente trabajo!':'Excellent work!'):data.overall_score>=60?(isEs?'Buen esfuerzo, hay areas de mejora':'Good effort, room for improvement'):(isEs?'Necesita mas trabajo':'Needs more work')}</p>
            </div>
          </div>

          {/* Rubric */}
          <div className="bg-surface-card border border-border rounded-2xl p-6 mt-4">
            <h2 className="font-bold text-text-primary mb-4">{isEs?'Rubrica Detallada':'Detailed Rubric'}</h2>
            <div className="space-y-3">
              {data.rubric_scores.map((r,i)=>(
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-text-primary">{r.category}</span>
                    <span className={`text-sm font-bold ${r.score>=75?'text-success':r.score>=55?'text-warning':'text-danger'}`}>{r.score}/{r.max}</span>
                  </div>
                  <div className="w-full bg-surface-2 rounded-full h-2"><motion.div initial={{width:0}} animate={{width:`${r.score}%`}} transition={{duration:0.8,delay:i*0.1}} className={`h-2 rounded-full ${r.score>=75?'bg-success':r.score>=55?'bg-warning':'bg-danger'}`}/></div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback */}
          {data.feedback.length>0 && <div className="bg-surface-card border border-border rounded-2xl p-6 mt-4 space-y-3">
            <h2 className="font-bold text-text-primary mb-2">{isEs?'Retroalimentacion':'Feedback'}</h2>
            {data.feedback.map((f,i)=>(<div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${f.type==='warning'?'bg-warning/5 border border-warning/20':'bg-brand-50 border border-brand-100'}`}><AlertTriangle size={16} className={f.type==='warning'?'text-warning mt-0.5':'text-brand-500 mt-0.5'}/><p className="text-sm text-text-secondary">{f.text}</p></div>))}
          </div>}

          {/* Strengths & Improvements */}
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="bg-surface-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3"><TrendingUp size={18} className="text-success"/><h3 className="font-bold text-text-primary text-sm">{isEs?'Fortalezas':'Strengths'}</h3></div>
              <ul className="space-y-2">{data.strengths.map((s,i)=>(<li key={i} className="flex items-start gap-2 text-sm text-text-secondary"><CheckCircle size={15} className="text-success mt-0.5 shrink-0"/>{s}</li>))}</ul>
            </div>
            <div className="bg-surface-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3"><TrendingDown size={18} className="text-warning"/><h3 className="font-bold text-text-primary text-sm">{isEs?'Areas de Mejora':'Areas to Improve'}</h3></div>
              <ul className="space-y-2">{data.improvements.map((s,i)=>(<li key={i} className="flex items-start gap-2 text-sm text-text-secondary"><AlertTriangle size={15} className="text-warning mt-0.5 shrink-0"/>{s}</li>))}</ul>
            </div>
          </div>
        </motion.div>
      </div>
    </Shell>
  );
}

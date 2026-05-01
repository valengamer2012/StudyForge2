import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { Language } from '../lib/i18n';

interface CalendarDay { date: string; sessions: number; xp: number; }
interface Props { data: CalendarDay[]; lang: Language; }

export default function StudyCalendar({ data, lang }: Props) {
  const [monthOffset, setMonthOffset] = useState(0);
  const today = new Date();
  const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthName = viewDate.toLocaleString(lang === 'es' ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' });
  const dayNames = lang === 'es'
    ? ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const dataMap = useMemo(() => {
    const m: Record<string, CalendarDay> = {};
    data.forEach(d => { m[d.date] = d; });
    return m;
  }, [data]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;
  const todayStr = today.toISOString().split('T')[0];

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const totalXp = data.reduce((s, d) => s + d.xp, 0);
  const activeDays = data.filter(d => d.sessions > 0).length;

  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => setMonthOffset(monthOffset - 1)} className="p-2 rounded-lg hover:bg-surface-2 text-text-3"><ChevronLeft size={18} /></button>
        <h3 className="font-bold text-text capitalize">{monthName}</h3>
        <button onClick={() => monthOffset < 0 && setMonthOffset(monthOffset + 1)} disabled={monthOffset >= 0} className="p-2 rounded-lg hover:bg-surface-2 text-text-3 disabled:opacity-30"><ChevronRight size={18} /></button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map(d => <div key={d} className="text-center text-[10px] font-bold text-text-4 py-1">{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const entry = dataMap[dateStr];
          const isToday = dateStr === todayStr;
          const hasActivity = entry && entry.sessions > 0;
          const intensity = entry ? Math.min(entry.sessions, 4) : 0;
          const bg = hasActivity
            ? intensity >= 3 ? 'bg-primary text-white' : intensity >= 2 ? 'bg-primary/60 text-white' : 'bg-primary/25 text-primary'
            : 'bg-surface-2 text-text-4';

          return (
            <motion.div
              key={dateStr}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.008 }}
              className={`relative aspect-square rounded-lg flex items-center justify-center text-xs font-semibold ${bg} ${isToday ? 'ring-2 ring-primary ring-offset-1' : ''}`}
              title={entry ? `${entry.sessions} sessions, ${entry.xp} XP` : ''}
            >
              {day}
              {hasActivity && intensity >= 3 && (
                <Flame size={8} className="absolute -top-0.5 -right-0.5 text-orange-500" />
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <div className="text-center">
          <p className="text-lg font-black text-primary">{activeDays}</p>
          <p className="text-[10px] text-text-4 font-semibold">{lang === 'es' ? 'Dias activos' : 'Active days'}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-black text-xp">{totalXp.toLocaleString()}</p>
          <p className="text-[10px] text-text-4 font-semibold">XP {lang === 'es' ? 'ganado' : 'earned'}</p>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-surface-2" />
          <div className="w-3 h-3 rounded bg-primary/25" />
          <div className="w-3 h-3 rounded bg-primary/60" />
          <div className="w-3 h-3 rounded bg-primary" />
        </div>
      </div>
    </div>
  );
}

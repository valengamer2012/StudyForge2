export const LEVELS = [
  { level: 1, title: 'Beginner', titleEs: 'Principiante', minXp: 0, color: '#94A3B8' },
  { level: 2, title: 'Learner', titleEs: 'Aprendiz', minXp: 100, color: '#3B82F6' },
  { level: 3, title: 'Student', titleEs: 'Estudiante', minXp: 300, color: '#3B82F6' },
  { level: 4, title: 'Scholar', titleEs: 'Erudito', minXp: 600, color: '#8B5CF6' },
  { level: 5, title: 'Expert', titleEs: 'Experto', minXp: 1000, color: '#8B5CF6' },
  { level: 6, title: 'Master', titleEs: 'Maestro', minXp: 1500, color: '#F59E0B' },
  { level: 7, title: 'Sage', titleEs: 'Sabio', minXp: 2100, color: '#F59E0B' },
  { level: 8, title: 'Genius', titleEs: 'Genio', minXp: 2800, color: '#EF4444' },
  { level: 9, title: 'Prodigy', titleEs: 'Prodigio', minXp: 3600, color: '#EF4444' },
  { level: 10, title: 'Legend', titleEs: 'Leyenda', minXp: 4500, color: '#EC4899' },
  { level: 11, title: 'Mythic', titleEs: 'Mitico', minXp: 5500, color: '#EC4899' },
  { level: 12, title: 'Transcendent', titleEs: 'Trascendente', minXp: 6600, color: '#6366F1' },
];

export function getLevelInfo(level: number) {
  return LEVELS.find(l => l.level === level) || LEVELS[0];
}

export function getStreakMessage(streak: number, lang: 'en' | 'es'): string {
  if (lang === 'es') {
    if (streak >= 30) return `${streak} dias seguidos! Eres una leyenda! 🏆`;
    if (streak >= 14) return `${streak} dias seguidos! Imparable! ⚡`;
    if (streak >= 7) return `${streak} dias seguidos! Guerrero semanal! 🛡️`;
    if (streak >= 3) return `${streak} dias seguidos! En llamas! 🔥`;
    if (streak >= 1) return `${streak} dia${streak > 1 ? 's' : ''} de racha! Sigue asi! ✨`;
    return 'Comienza tu racha hoy! 💪';
  }
  if (streak >= 30) return `${streak} days in a row! You're a legend! 🏆`;
  if (streak >= 14) return `${streak} days in a row! Unstoppable! ⚡`;
  if (streak >= 7) return `${streak} days in a row! Week warrior! 🛡️`;
  if (streak >= 3) return `${streak} days in a row! On fire! 🔥`;
  if (streak >= 1) return `${streak}-day streak! Keep it up! ✨`;
  return 'Start your streak today! 💪';
}

export const XP_VALUES = {
  session: 25,
  quiz: 15,
  flashcard: 5,
  fill_blank: 10,
  grade_paper: 30,
  solve_problem: 20,
};

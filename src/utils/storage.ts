import { UserStats, Achievement, DiaryEntry, AccentColor } from '../types';

const STATS_KEY = 'max_teamlead_user_stats';
const THEME_KEY = 'max_teamlead_theme';
const ACCENT_KEY = 'max_teamlead_accent';
const DIARY_KEY = 'max_teamlead_diary';

export const INITIAL_STATS: UserStats = {
  xp: 0,
  level: 1,
  title: 'Начинающий инженер',
  reviewsDone: 0,
  circuitsChecked: 0,
  questionsAsked: 0,
  circuitsSaved: 0,
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_question',
    title: 'Любознательный ум',
    description: 'Задай первый вопрос AI-Тимлиду в чате',
    icon: '💬',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    rewardXp: 20,
  },
  {
    id: 'first_review',
    title: 'Первое ревью',
    description: 'Проверь свой первый фрагмент кода',
    icon: '🔍',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    rewardXp: 30,
  },
  {
    id: 'safe_circuit',
    title: 'Спасатель плат',
    description: 'Предотврати короткое замыкание или 5V перегрузку',
    icon: '⚡',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    rewardXp: 40,
  },
  {
    id: 'clean_code_master',
    title: 'Мастер чистого кода',
    description: 'Проведи 3 проверки кода',
    icon: '📐',
    unlocked: false,
    progress: 0,
    maxProgress: 3,
    rewardXp: 50,
  },
  {
    id: 'circuit_expert',
    title: 'Схемотехник',
    description: 'Проверь 3 электрические схемы',
    icon: '🛡️',
    unlocked: false,
    progress: 0,
    maxProgress: 3,
    rewardXp: 60,
  },
  {
    id: 'senior_student',
    title: 'Архитектор будущего',
    description: 'Набери 200 очков опыта (XP)',
    icon: '🏆',
    unlocked: false,
    progress: 0,
    maxProgress: 200,
    rewardXp: 100,
  },
];

export function getStoredTheme(): 'dark' | 'light' {
  try {
    const val = localStorage.getItem(THEME_KEY);
    return val === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function setStoredTheme(theme: 'dark' | 'light'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}

export function getStoredAccentColor(): AccentColor {
  try {
    const val = localStorage.getItem(ACCENT_KEY) as AccentColor;
    if (['blue', 'purple', 'emerald', 'amber', 'rose'].includes(val)) {
      return val;
    }
  } catch {}
  return 'blue';
}

export function setStoredAccentColor(color: AccentColor): void {
  try {
    localStorage.setItem(ACCENT_KEY, color);
  } catch {}
}

export function getStoredStats(): UserStats {
  try {
    const data = localStorage.getItem(STATS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch {}
  return { ...INITIAL_STATS };
}

export function saveStoredStats(stats: UserStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}
}

export function getStoredDiary(): DiaryEntry[] {
  try {
    const data = localStorage.getItem(DIARY_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch {}
  return [];
}

export function saveStoredDiary(entries: DiaryEntry[]): void {
  try {
    localStorage.setItem(DIARY_KEY, JSON.stringify(entries));
  } catch {}
}

export function calculateLevel(xp: number): { level: number; title: string; currentLevelXp: number } {
  const level = Math.floor(xp / 100) + 1;
  const currentLevelXp = xp % 100;
  
  let title = 'Начинающий разработчик';
  if (level === 2) title = 'Юный схемотехник';
  if (level === 3) title = 'Веб-мастер';
  if (level === 4) title = 'Senior Студент';
  if (level >= 5) title = 'AI-Архитектор';

  return { level, title, currentLevelXp };
}

export function resetAllUserData(): { stats: UserStats; diary: DiaryEntry[] } {
  const resetStats = { ...INITIAL_STATS };
  saveStoredStats(resetStats);
  saveStoredDiary([]);
  return { stats: resetStats, diary: [] };
}

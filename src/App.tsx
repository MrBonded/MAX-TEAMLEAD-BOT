/**
 * AI-Тимлид «Макс» для IT-лаборатории
 * Web App & Mini App для мессенджера МАКС (dev.max.ru)
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatTab } from './components/ChatTab';
import { CodeReviewTab } from './components/CodeReviewTab';
import { IoTLabTab } from './components/IoTLabTab';
import { ProgressDiaryTab } from './components/ProgressDiaryTab';
import { MyProgressTab } from './components/MyProgressTab';
import { FloatingBackground } from './components/FloatingBackground';
import { AppTheme, UserStats, Achievement, DiaryEntry, AccentColor } from './types';
import { 
  getStoredTheme, 
  setStoredTheme, 
  getStoredAccentColor,
  setStoredAccentColor,
  getStoredStats, 
  saveStoredStats, 
  getStoredDiary,
  saveStoredDiary,
  calculateLevel, 
  resetAllUserData, 
  INITIAL_ACHIEVEMENTS 
} from './utils/storage';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'review' | 'iot' | 'diary' | 'stats'>('chat');
  const [theme, setTheme] = useState<AppTheme>(getStoredTheme);
  const [accentColor, setAccentColor] = useState<AccentColor>(getStoredAccentColor);
  const [stats, setStats] = useState<UserStats>(getStoredStats);
  const [diary, setDiary] = useState<DiaryEntry[]>(getStoredDiary);
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    try {
      const saved = localStorage.getItem('max_achievements');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ACHIEVEMENTS;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync dark class on document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setStoredTheme(theme);
  }, [theme]);

  // Persist accent color
  useEffect(() => {
    setStoredAccentColor(accentColor);
  }, [accentColor]);

  // Интеграция с официальным мостом MAX WebApp (dev.max.ru) и Telegram WebApp
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const win = window as any;
      // MAX WebApp Bridge (https://dev.max.ru/docs/webapps/bridge/)
      if (win.WebApp && typeof win.WebApp.ready === 'function') {
        try {
          win.WebApp.ready();
          win.WebApp.expand?.();
        } catch {}
      }
      // Telegram WebApp
      if (win.Telegram?.WebApp && typeof win.Telegram.WebApp.ready === 'function') {
        try {
          win.Telegram.WebApp.ready();
          win.Telegram.WebApp.expand?.();
        } catch {}
      }
    }
  }, []);

  // Persist diary
  useEffect(() => {
    saveStoredDiary(diary);
  }, [diary]);

  // Persist achievements
  useEffect(() => {
    try {
      localStorage.setItem('max_achievements', JSON.stringify(achievements));
    } catch {}
  }, [achievements]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addDiaryRecord = (
    category: DiaryEntry['category'],
    title: string,
    details: string,
    xpEarned: number,
    icon: string
  ) => {
    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dateStr: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      category,
      title,
      details,
      xpEarned,
      icon,
    };
    setDiary((prev) => [newEntry, ...prev]);
  };

  const handleEarnXp = (amount: number, reason: string) => {
    setStats((prev) => {
      const newXp = prev.xp + amount;
      const { level, title } = calculateLevel(newXp);
      const updated: UserStats = {
        ...prev,
        xp: newXp,
        level,
        title,
      };
      saveStoredStats(updated);

      if (level > prev.level) {
        showToast(`🎉 Новый уровень! Ты теперь ${title} (Уровень ${level})`);
      } else {
        showToast(`+${amount} XP: ${reason}`);
      }
      return updated;
    });

    // Check 200 XP achievement
    setAchievements((prev) =>
      prev.map((ach) => {
        if (ach.id === 'senior_student') {
          const currentTotalXp = stats.xp + amount;
          const unlocked = currentTotalXp >= ach.maxProgress;
          if (unlocked && !ach.unlocked) {
            addDiaryRecord('achievement', 'Получено достижение!', 'Открыта награда «Архитектор будущего» (200 XP)', ach.rewardXp, '🏆');
          }
          return {
            ...ach,
            progress: Math.min(ach.maxProgress, currentTotalXp),
            unlocked,
          };
        }
        return ach;
      })
    );
  };

  const handleIncrementQuestion = () => {
    setStats((prev) => {
      const updated = { ...prev, questionsAsked: prev.questionsAsked + 1 };
      saveStoredStats(updated);
      return updated;
    });

    addDiaryRecord(
      'chat',
      'Вопрос AI-Тимлиду',
      'Разобран сложный случай и получена Сократовская подсказка',
      10,
      '💬'
    );

    setAchievements((prev) =>
      prev.map((ach) => {
        if (ach.id === 'first_question' && !ach.unlocked) {
          addDiaryRecord('achievement', 'Новое достижение!', 'Получена награда «Любознательный ум»', ach.rewardXp, '🌟');
          return { ...ach, progress: 1, unlocked: true };
        }
        return ach;
      })
    );
  };

  const handleIncrementReview = () => {
    setStats((prev) => {
      const updated = { ...prev, reviewsDone: prev.reviewsDone + 1 };
      saveStoredStats(updated);
      return updated;
    });

    addDiaryRecord(
      'code',
      'Проверка кода',
      'Выполнен автоматический Code Review, выявлены ошибки и точки роста',
      25,
      '🔍'
    );

    setAchievements((prev) =>
      prev.map((ach) => {
        if (ach.id === 'first_review' && !ach.unlocked) {
          addDiaryRecord('achievement', 'Новое достижение!', 'Получена награда «Первое ревью»', ach.rewardXp, '🥇');
          return { ...ach, progress: 1, unlocked: true };
        }
        if (ach.id === 'clean_code_master') {
          const newProgress = Math.min(ach.maxProgress, ach.progress + 1);
          const unlocked = newProgress >= ach.maxProgress;
          if (unlocked && !ach.unlocked) {
            addDiaryRecord('achievement', 'Новое достижение!', 'Получена награда «Мастер чистого кода»', ach.rewardXp, '📐');
          }
          return { ...ach, progress: newProgress, unlocked };
        }
        return ach;
      })
    );
  };

  const handleIncrementCircuit = (wasDangerous: boolean) => {
    setStats((prev) => {
      const updated = {
        ...prev,
        circuitsChecked: prev.circuitsChecked + 1,
        circuitsSaved: wasDangerous ? prev.circuitsSaved + 1 : prev.circuitsSaved,
      };
      saveStoredStats(updated);
      return updated;
    });

    addDiaryRecord(
      'iot',
      wasDangerous ? 'Предотвращено повреждение платы!' : 'Проверка схемы успешна',
      wasDangerous 
        ? 'Обнаружен опасный уровень 5V или отсутствие балластного резистора. Оборудование спасено!'
        : 'Электрическая схема безопасна для включения питания.',
      30,
      '⚡'
    );

    setAchievements((prev) =>
      prev.map((ach) => {
        if (ach.id === 'safe_circuit' && wasDangerous && !ach.unlocked) {
          addDiaryRecord('achievement', 'Новое достижение!', 'Получена награда «Спасатель плат»', ach.rewardXp, '🛡️');
          return { ...ach, progress: 1, unlocked: true };
        }
        if (ach.id === 'circuit_expert') {
          const newProgress = Math.min(ach.maxProgress, ach.progress + 1);
          const unlocked = newProgress >= ach.maxProgress;
          if (unlocked && !ach.unlocked) {
            addDiaryRecord('achievement', 'Новое достижение!', 'Получена награда «Схемотехник»', ach.rewardXp, '⚡');
          }
          return { ...ach, progress: newProgress, unlocked };
        }
        return ach;
      })
    );
  };

  const handleAddCustomNote = (noteText: string) => {
    addDiaryRecord('note', 'Инженерная заметка', noteText, 15, '📝');
    handleEarnXp(15, 'Заметка в дневник');
  };

  const handleClearDiary = () => {
    setDiary([]);
    saveStoredDiary([]);
    showToast('История дневника очищена');
  };

  const handleResetStats = () => {
    const { stats: clearedStats, diary: clearedDiary } = resetAllUserData();
    setStats(clearedStats);
    setDiary(clearedDiary);
    setAchievements(INITIAL_ACHIEVEMENTS);
    try {
      localStorage.removeItem('max_achievements');
    } catch {}
    showToast('Все данные сброшены до нуля');
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300 antialiased selection:bg-blue-500/20 selection:text-blue-600">
      {/* Floating Levitation Stickers and glowing orbs in background */}
      <FloatingBackground />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top duration-200">
          <div className="backdrop-blur-2xl bg-white/95 dark:bg-slate-800/95 border border-black/5 dark:border-white/10 px-4 py-2.5 rounded-2xl shadow-xl shadow-black/10 text-xs sm:text-sm font-medium text-slate-900 dark:text-white flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header with Theme, Palette, and Russian Tabs */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        accentColor={accentColor}
        setAccentColor={setAccentColor}
        stats={stats}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto p-3 sm:p-5">
        {activeTab === 'chat' && (
          <ChatTab
            onEarnXp={handleEarnXp}
            onIncrementQuestion={handleIncrementQuestion}
          />
        )}
        {activeTab === 'review' && (
          <CodeReviewTab
            onEarnXp={handleEarnXp}
            onIncrementReview={handleIncrementReview}
          />
        )}
        {activeTab === 'iot' && (
          <IoTLabTab
            onEarnXp={handleEarnXp}
            onIncrementCircuit={handleIncrementCircuit}
          />
        )}
        {activeTab === 'diary' && (
          <ProgressDiaryTab
            diary={diary}
            onAddNote={handleAddCustomNote}
            onClearDiary={handleClearDiary}
          />
        )}
        {activeTab === 'stats' && (
          <MyProgressTab
            stats={stats}
            achievements={achievements}
            onResetStats={handleResetStats}
          />
        )}
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="relative z-10 border-t border-black/5 dark:border-white/5 py-3 text-center text-xs text-slate-400 dark:text-slate-500">
        AI-Тимлид «Макс» • Мини-приложение для мессенджера МАКС
      </footer>
    </div>
  );
}

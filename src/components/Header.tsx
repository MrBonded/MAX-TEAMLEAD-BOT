import React, { useState } from 'react';
import { 
  Bot, 
  Code2, 
  Cpu, 
  Trophy, 
  Sun, 
  Moon, 
  Sparkles,
  BookOpen,
  Palette
} from 'lucide-react';
import { AppTheme, UserStats, AccentColor } from '../types';

interface HeaderProps {
  activeTab: 'chat' | 'review' | 'iot' | 'diary' | 'stats';
  setActiveTab: (tab: 'chat' | 'review' | 'iot' | 'diary' | 'stats') => void;
  theme: AppTheme;
  toggleTheme: () => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  stats: UserStats;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  accentColor,
  setAccentColor,
  stats,
}) => {
  const [showPalette, setShowPalette] = useState(false);
  const currentLevelXp = stats.xp % 100;

  const colorOptions: { id: AccentColor; name: string; bgClass: string }[] = [
    { id: 'blue', name: 'Сапфир', bgClass: 'bg-blue-500' },
    { id: 'purple', name: 'Аметист', bgClass: 'bg-purple-500' },
    { id: 'emerald', name: 'Изумруд', bgClass: 'bg-emerald-500' },
    { id: 'amber', name: 'Янтарь', bgClass: 'bg-amber-500' },
    { id: 'rose', name: 'Кварц', bgClass: 'bg-rose-500' },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-2xl bg-white/75 dark:bg-slate-900/80 border-b border-black/5 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Level Status */}
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg text-white ring-1 ring-white/20 transition-all ${
              accentColor === 'purple'
                ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-purple-500/25'
                : accentColor === 'emerald'
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 shadow-emerald-500/25'
                : accentColor === 'amber'
                ? 'bg-gradient-to-tr from-amber-600 to-orange-600 shadow-amber-500/25'
                : accentColor === 'rose'
                ? 'bg-gradient-to-tr from-rose-600 to-pink-600 shadow-rose-500/25'
                : 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/25'
            }`}>
              <Bot className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  AI-Тимлид <span className={`text-transparent bg-clip-text ${
                    accentColor === 'purple'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-500 dark:from-purple-400 dark:to-indigo-300'
                      : accentColor === 'emerald'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300'
                      : accentColor === 'amber'
                      ? 'bg-gradient-to-r from-amber-600 to-orange-500 dark:from-amber-400 dark:to-orange-300'
                      : accentColor === 'rose'
                      ? 'bg-gradient-to-r from-rose-600 to-pink-500 dark:from-rose-400 dark:to-pink-300'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-cyan-400 dark:to-indigo-300'
                  }`}>«Макс»</span>
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-black/5 dark:bg-white/10 text-slate-700 dark:text-slate-200 border border-black/5 dark:border-white/10">
                  <Sparkles className="w-3 h-3 mr-1 text-amber-500" />
                  Ур. {stats.level}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px] sm:max-w-none">
                {stats.title} • {currentLevelXp}/100 XP
              </p>
            </div>
          </div>

          {/* Right Actions: Live Gemini badge, Palette Selector & Theme Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live AI Status Badge */}
            <div 
              className="flex items-center space-x-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold"
              title="Цифровой AI-наставник подключен и готов к диалогу"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden xs:inline sm:inline">Наставник онлайн</span>
            </div>

            {/* Color Palette Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setShowPalette(!showPalette)}
                className="p-2 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 transition active:scale-95 shadow-sm flex items-center gap-1.5 text-xs"
                title="Выбрать акцентный цвет темы"
              >
                <Palette className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                <span className={`w-2.5 h-2.5 rounded-full ${colorOptions.find((c) => c.id === accentColor)?.bgClass}`} />
              </button>

              {showPalette && (
                <div className="absolute right-0 mt-2 p-2 rounded-2xl backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-black/10 dark:border-white/15 shadow-xl flex items-center space-x-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {colorOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setAccentColor(opt.id);
                        setShowPalette(false);
                      }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${opt.bgClass} ${
                        accentColor === opt.id ? 'ring-2 ring-offset-2 ring-black dark:ring-white scale-110' : 'hover:scale-105'
                      }`}
                      title={opt.name}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 transition active:scale-95 shadow-sm"
              title={theme === 'dark' ? 'Включить светлую тему' : 'Включить темную тему'}
              aria-label="Смена темы"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>
          </div>
        </div>

        {/* Liquid Glass Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === 'chat'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Чат-наставник</span>
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === 'review'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Проверка кода</span>
          </button>

          <button
            onClick={() => setActiveTab('iot')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === 'iot'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Электроника и схемы</span>
          </button>

          <button
            onClick={() => setActiveTab('diary')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === 'diary'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Дневник</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === 'stats'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Мой прогресс</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

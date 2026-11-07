import React, { useState } from 'react';
import { 
  Trophy, 
  Sparkles, 
  Award, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Code2, 
  Cpu, 
  MessageSquare, 
  ShieldCheck 
} from 'lucide-react';
import { UserStats, Achievement } from '../types';

interface MyProgressTabProps {
  stats: UserStats;
  achievements: Achievement[];
  onResetStats: () => void;
}

export const MyProgressTab: React.FC<MyProgressTabProps> = ({
  stats,
  achievements,
  onResetStats,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const currentLevelXp = stats.xp % 100;
  const progressPercent = Math.min(100, Math.round((currentLevelXp / 100) * 100));

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Level & Rank Hero Card with Liquid Glass effect */}
      <div className="relative overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-purple-600/10 dark:from-blue-950/40 dark:via-slate-900/60 dark:to-purple-950/30 border border-black/5 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-lg shadow-black/5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-2 ring-white/20">
              <Trophy className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-cyan-400 uppercase tracking-wider block">
                Личный профиль инженера
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {stats.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Уровень {stats.level} • Всего набрано {stats.xp} XP
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-cyan-300 font-mono">
              {currentLevelXp}
              <span className="text-xs text-slate-400 font-sans font-normal"> / 100 XP</span>
            </span>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Прогресс до {stats.level + 1} уровня</span>
            <span className="font-semibold">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4 Personal Metric Cards (All start from 0) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/60 border border-black/5 dark:border-white/10 rounded-2xl p-3.5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <Code2 className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] font-medium">+25 XP</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white block font-mono">
            {stats.reviewsDone}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight">
            Проверок кода
          </span>
        </div>

        <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/60 border border-black/5 dark:border-white/10 rounded-2xl p-3.5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <Cpu className="w-4 h-4 text-cyan-500" />
            <span className="text-[10px] font-medium">+30 XP</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white block font-mono">
            {stats.circuitsChecked}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight">
            Проверок схем
          </span>
        </div>

        <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/60 border border-black/5 dark:border-white/10 rounded-2xl p-3.5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            <span className="text-[10px] font-medium">+10 XP</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white block font-mono">
            {stats.questionsAsked}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight">
            Вопросов наставнику
          </span>
        </div>

        <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/60 border border-black/5 dark:border-white/10 rounded-2xl p-3.5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-medium">+40 XP</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white block font-mono">
            {stats.circuitsSaved}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight">
            Спасенных датчиков
          </span>
        </div>
      </div>

      {/* Gamification & Achievements Section */}
      <div className="backdrop-blur-2xl bg-white/80 dark:bg-slate-900/80 border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Награды и достижения
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Открыто {achievements.filter((a) => a.unlocked).length} из {achievements.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3 rounded-xl border transition-all flex items-start space-x-3 ${
                ach.unlocked
                  ? 'bg-amber-500/10 border-amber-500/30 text-slate-900 dark:text-white shadow-sm'
                  : 'bg-black/5 dark:bg-white/5 border-transparent opacity-60'
              }`}
            >
              <div className="text-2xl w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-black/5 dark:border-white/10 flex items-center justify-center shrink-0">
                {ach.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold truncate">{ach.title}</h4>
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                    +{ach.rewardXp} XP
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {ach.description}
                </p>
                <div className="mt-2 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">
                    Прогресс: {ach.progress}/{ach.maxProgress}
                  </span>
                  {ach.unlocked && (
                    <span className="text-emerald-500 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Получено
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reset Stats Control */}
      <div className="pt-2 flex justify-end">
        {showResetConfirm ? (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-rose-500 font-medium">Сбросить все счетчики до нуля?</span>
            <button
              onClick={() => {
                onResetStats();
                setShowResetConfirm(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition"
            >
              Да, сбросить
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs transition"
            >
              Отмена
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сбросить данные прогресса</span>
          </button>
        )}
      </div>
    </div>
  );
};

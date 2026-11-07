import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Sparkles, 
  Code2, 
  Cpu, 
  MessageSquare, 
  Award, 
  StickyNote, 
  Clock, 
  PartyPopper,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { DiaryEntry } from '../types';

interface ProgressDiaryTabProps {
  diary: DiaryEntry[];
  onAddNote: (noteText: string) => void;
  onClearDiary: () => void;
}

export const ProgressDiaryTab: React.FC<ProgressDiaryTabProps> = ({
  diary,
  onAddNote,
  onClearDiary,
}) => {
  const [newNote, setNewNote] = useState('');
  const [filter, setFilter] = useState<'all' | 'code' | 'iot' | 'chat' | 'achievement' | 'note'>('all');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddNote(newNote.trim());
    setNewNote('');
    setIsAdding(false);
  };

  const filteredEntries = filter === 'all' 
    ? diary 
    : diary.filter((entry) => entry.category === filter);

  const getCategoryBadge = (cat: DiaryEntry['category']) => {
    switch (cat) {
      case 'code':
        return { label: 'Код', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
      case 'iot':
        return { label: 'Схема', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' };
      case 'chat':
        return { label: 'Диалог', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' };
      case 'achievement':
        return { label: 'Награда', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
      case 'note':
        return { label: 'Заметка', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Top Banner with Celebration Button */}
      <div className="backdrop-blur-2xl bg-white/70 dark:bg-slate-900/60 border border-black/5 dark:border-white/10 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 ring-1 ring-white/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Дневник прогресса
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                {diary.length} записей
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Хроника твоих инженерных побед, проверок и открытий
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Новая запись</span>
          </button>
        </div>
      </div>

      {/* Add Custom Note Drawer */}
      {isAdding && (
        <form
          onSubmit={handleSubmitNote}
          className="backdrop-blur-2xl bg-white/90 dark:bg-slate-900/90 border border-blue-500/30 rounded-2xl p-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 space-y-3"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <StickyNote className="w-4 h-4 text-emerald-500" />
              Добавить запись в дневник (+15 XP)
            </span>
            <span className="text-slate-400 text-[11px]">Чему ты научился сегодня?</span>
          </div>

          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Например: Сегодня разобрался с событием DOMContentLoaded и понял, почему DHT11 нельзя включать в 5V..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
            rows={3}
            autoFocus
          />

          <div className="flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!newNote.trim()}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold shadow-sm transition active:scale-95"
            >
              Сохранить в дневник 🚀
            </button>
          </div>
        </form>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        {[
          { id: 'all', label: 'Все события' },
          { id: 'code', label: 'Проверки кода' },
          { id: 'iot', label: 'Электросхемы' },
          { id: 'chat', label: 'Вопросы' },
          { id: 'achievement', label: 'Награды' },
          { id: 'note', label: 'Мои заметки' },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id as any)}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition ${
              filter === btn.id
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'backdrop-blur-xl bg-white/60 dark:bg-slate-800/60 border border-black/5 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Timeline Entries List */}
      {filteredEntries.length > 0 ? (
        <div className="space-y-2.5">
          {filteredEntries.map((entry) => {
            const badge = getCategoryBadge(entry.category);
            return (
              <div
                key={entry.id}
                className="backdrop-blur-2xl bg-white/80 dark:bg-slate-900/80 border border-black/5 dark:border-white/10 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-start space-x-3.5 group"
              >
                {/* Emoji Icon */}
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-black/5 dark:border-white/10 flex items-center justify-center text-xl shrink-0">
                  {entry.icon}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {entry.title}
                      </h4>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {entry.xpEarned > 0 && (
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                          +{entry.xpEarned} XP
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        {entry.timestamp}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {entry.details}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="backdrop-blur-2xl bg-white/50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-2xl">
            📝
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Дневник пока пуст
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Каждая проверка кода, тест электросхемы или заметка автоматически сохраняются здесь с датой и полученным опытом!
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Написать первую заметку</span>
          </button>
        </div>
      )}

      {/* Clear Diary Button */}
      {diary.length > 0 && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClearDiary}
            className="text-[11px] text-slate-400 hover:text-rose-500 transition flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Очистить историю дневника</span>
          </button>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Code2, 
  Copy, 
  Check, 
  ThumbsUp, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { CodeReviewResult } from '../types';

interface CodeReviewTabProps {
  onEarnXp: (amount: number, reason: string) => void;
  onIncrementReview: () => void;
}

export const CodeReviewTab: React.FC<CodeReviewTabProps> = ({ onEarnXp, onIncrementReview }) => {
  const presets = [
    {
      title: 'Опечатка в addEventListener',
      lang: 'javascript',
      fileName: 'script.js',
      code: `// Обработчик клика по кнопке
const submitBtn = document.querySelector('.checkout-btn');

submitBtn.addEventListner('click', (event) => {
  event.preventDefault();
  console.log('Кнопка нажата!');
});`,
    },
    {
      title: 'Незакрытый тег <div>',
      lang: 'html',
      fileName: 'index.html',
      code: `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Мой сайт</title>
</head>
<body>
  <div class="card-container">
    <div class="card-header">
      <h2>Заголовок</h2>
    <!-- забыли закрыть header -->
    <div class="card-body">
      <p>Текст карточки</p>
    </div>
  </div>
</body>
</html>`,
    },
    {
      title: 'Python: Ошибка отступов',
      lang: 'python',
      fileName: 'tracker.py',
      code: `# Подсчет среднего значения
sensors = [23.5, 24.1, 23.9]

def get_average(data):
total = 0
for i in range(len(data) + 1):  # Внимание на диапазон
    total += data[i]
return total / len(data)

print(get_average(sensors))`,
    },
    {
      title: 'Скрипт до загрузки DOM',
      lang: 'javascript',
      fileName: 'app.js',
      code: `// Вызов элемента без ожидания DOMContentLoaded
const profileTitle = document.getElementById('user-profile-title');

// Ошибка: Cannot read properties of null
profileTitle.textContent = 'Привет, разработчик!';`,
    },
  ];

  const [language, setLanguage] = useState('javascript');
  const [fileName, setFileName] = useState('script.js');
  const [code, setCode] = useState(presets[0].code);
  const [loading, setLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState<CodeReviewResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleApplyPreset = (idx: number) => {
    setLanguage(presets[idx].lang);
    setFileName(presets[idx].fileName);
    setCode(presets[idx].code);
    setReviewResult(null);
    setErrorMessage(null);
  };

  const handleRunReview = async () => {
    if (!code.trim() || loading) return;
    setLoading(true);
    setErrorMessage(null);

    // Increment personal review counter & award XP
    onIncrementReview();
    onEarnXp(25, 'Проверка кода');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const response = await fetch('/api/code-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          fileName,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      if (!response.ok && data.error) {
        setErrorMessage(data.error);
        setReviewResult(null);
      } else {
        setReviewResult(data);
        setErrorMessage(null);
      }
    } catch {
      setErrorMessage('⚠️ Произошла ошибка при отправке кода на проверку. Пожалуйста, проверь подключение и попробуй ещё раз.');
      setReviewResult(null);
    } finally {
      setLoading(false);
    }
  };

  const copyReport = () => {
    if (!reviewResult) return;
    const text = `📋 Отчет проверки кода (${fileName}):
Балл: ${reviewResult.score}/100
Итог: ${reviewResult.summary}
${reviewResult.criticalIssues.map((c) => `• [Строка ${c.line ?? '?'}] ${c.type}: ${c.description} (Подсказка: ${c.socraticHint})`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Top Banner: Presets */}
      <div className="backdrop-blur-2xl bg-white/70 dark:bg-slate-900/60 border border-black/5 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-300 border border-blue-200/60 dark:border-cyan-500/30">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Проверка кода
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Находит баги, указывает на строку и подсказывает решение (+25 XP)
            </p>
          </div>
        </div>

        {/* Quick error presets */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-slate-400 dark:text-slate-500 text-[11px] hidden md:inline">Примеры:</span>
          {presets.map((p, i) => (
            <button
              key={i}
              onClick={() => handleApplyPreset(i)}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition active:scale-95"
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Code Editor */}
        <div className="lg:col-span-7 space-y-3">
          <div className="backdrop-blur-2xl bg-white/80 dark:bg-slate-900/80 border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
            {/* Toolbar */}
            <div className="bg-slate-50/80 dark:bg-slate-800/80 px-4 py-2 border-b border-black/5 dark:border-white/10 flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                {fileName}
              </span>

              <div className="flex items-center space-x-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-xl px-2.5 py-1 focus:outline-none"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="html">HTML</option>
                  <option value="python">Python</option>
                </select>

                <button
                  onClick={handleRunReview}
                  disabled={loading || !code.trim()}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center space-x-1.5 shadow-sm disabled:opacity-40 transition active:scale-95"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Анализ...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>Проверить код</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Input */}
            <div className="p-3 bg-slate-50/40 dark:bg-slate-950/60 font-mono text-xs">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={14}
                placeholder="Вставь сюда код программы..."
                className="w-full bg-transparent text-slate-800 dark:text-slate-200 resize-none focus:outline-none leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Review Result */}
        <div className="lg:col-span-5 space-y-3">
          {errorMessage && (
            <div className="backdrop-blur-2xl bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-xs text-rose-600 dark:text-rose-400 flex items-start space-x-2.5 shadow-sm">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
              <div>
                <strong className="block font-semibold mb-0.5">Ошибка проверки:</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {reviewResult ? (
            <div className="backdrop-blur-2xl bg-white/80 dark:bg-slate-900/80 border border-black/5 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-4">
              {/* Score header */}
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Оценка кода
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {reviewResult.score === 100 ? (
                      <span className="text-emerald-500">Идеальный код! ✨</span>
                    ) : reviewResult.score >= 80 ? (
                      <span className="text-emerald-500">Хороший результат</span>
                    ) : (
                      <span className="text-amber-500">Есть замечания</span>
                    )}
                  </h3>
                </div>

                <div
                  className={`text-xl font-black px-3.5 py-1.5 rounded-xl border ${
                    reviewResult.score >= 80
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
                  }`}
                >
                  {reviewResult.score}/100
                </div>
              </div>

              {/* Summary */}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-black/5 dark:bg-white/5 p-2.5 rounded-xl">
                {reviewResult.summary}
              </p>

              {/* Critical issues */}
              {reviewResult.criticalIssues.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Замечания:
                  </span>

                  {reviewResult.criticalIssues.map((issue, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-500/30 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-semibold text-rose-600 dark:text-rose-400">
                        <span>{issue.line ? `Строка ${issue.line}: ` : ''}{issue.type}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">{issue.description}</p>
                      <div className="pt-1 border-t border-rose-200/40 dark:border-rose-500/20 text-blue-700 dark:text-cyan-300 flex items-start gap-1">
                        <HelpCircle className="w-3 h-3 shrink-0 mt-0.5" />
                        <div>
                          <strong>Подсказка: </strong>
                          {issue.socraticHint}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Praise */}
              {reviewResult.praise && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Похвала: </span>
                    {reviewResult.praise}
                  </div>
                </div>
              )}

              <button
                onClick={copyReport}
                className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 flex items-center justify-center space-x-1.5 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Отчет скопирован</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Скопировать замечания</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="h-full min-h-[280px] backdrop-blur-2xl bg-white/50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-2 text-slate-400">
              <Code2 className="w-10 h-10 text-blue-500 opacity-50" />
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Код еще не проверен
              </h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Вставь фрагмент кода слева или выбери пример и нажми «Проверить код».
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

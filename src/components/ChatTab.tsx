import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Copy, 
  Check, 
  Lightbulb,
  ArrowRight,
  Zap
} from 'lucide-react';
import { ChatMessage, MentorTone, TechDirection } from '../types';
import { generateSocraticResponse } from '../utils/socraticEngine';

interface ChatTabProps {
  onEarnXp: (amount: number, reason: string) => void;
  onIncrementQuestion: () => void;
}

export const ChatTab: React.FC<ChatTabProps> = ({ onEarnXp, onIncrementQuestion }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `👋 Привет! Я твой персональный AI-Тимлид **«Макс»**.\n\nЯ помогаю писать чистый код на Вебе и Python, безопасно собирать электросхемы и разбираться в багах.\n\nЯ работаю по **Сократовскому методу**: вместо того чтобы просто списать за тебя домашку, я помогу тебе разобраться в причине ошибки и стать сильным инженером! С чем возникла сложность?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      socraticHint: 'Напиши текст ошибки из консоли или прикрепи строчку кода, которая ведет себя неожиданно.',
      isLiveAi: false,
      usedModel: 'socratic-engine',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState<MentorTone>('socrates');
  const [direction, setDirection] = useState<TechDirection>('web');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const quickPrompts = [
    { text: 'Ошибка addEventListener is not a function на кнопке', dir: 'web' as TechDirection },
    { text: 'Подключил датчик DHT11 к 5V, он сильно греется. Это опасно?', dir: 'iot' as TechDirection },
    { text: 'IndexError: list index out of range при переборе списка в Python', dir: 'python' as TechDirection },
    { text: 'Как легко отцентрировать div по центру экрана без костылей?', dir: 'web' as TechDirection },
    { text: 'Зачем ставить резистор 220 Ом перед светодиодом в схеме?', dir: 'iot' as TechDirection },
  ];

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      direction,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customText) setInput('');
    setLoading(true);

    // Increment personal stats and award XP
    onIncrementQuestion();
    onEarnXp(10, 'Вопрос наставнику');

    try {
      // Abort controller with 20-second client timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-4),
          tone,
          direction,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok && !data.reply) {
        throw new Error(data.error || 'Ошибка сервера при получении ответа');
      }

      const botReply = data.reply || '⚠️ Не удалось получить ответ. Пожалуйста, попробуй еще раз.';

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isLiveAi: Boolean(data.isLiveAi),
          usedModel: data.usedModel,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: '⚠️ Произошла ошибка при обращении к серверу. Пожалуйста, проверь подключение и отправь сообщение еще раз.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isLiveAi: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] sm:h-[calc(100vh-160px)] max-w-4xl mx-auto w-full">
      {/* Top Filter Bar: Tone & Discipline */}
      <div className="backdrop-blur-2xl bg-white/60 dark:bg-slate-900/60 border border-black/5 dark:border-white/10 rounded-2xl p-2.5 mb-3 shadow-sm flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Style */}
        <div className="flex items-center space-x-1">
          <span className="text-slate-400 dark:text-slate-500 font-medium px-1 hidden sm:inline">Стиль:</span>
          <button
            onClick={() => setTone('socrates')}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              tone === 'socrates'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            🏛️ Наставник
          </button>
          <button
            onClick={() => setTone('buddy')}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              tone === 'buddy'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            🤝 Бадди
          </button>
          <button
            onClick={() => setTone('lead')}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              tone === 'lead'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            👔 Тимлид
          </button>
        </div>

        {/* Direction */}
        <div className="flex items-center space-x-1">
          {(['web', 'python', 'iot', 'git'] as TechDirection[]).map((d) => {
            const labels: Record<TechDirection, string> = {
              web: 'Веб',
              python: 'Python',
              iot: 'Схемы',
              git: 'Git',
            };
            return (
              <button
                key={d}
                onClick={() => setDirection(d)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition ${
                  direction === d
                    ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-cyan-300 border border-blue-200/80 dark:border-cyan-500/30'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {labels[d]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Scroll Area with Liquid Glass aesthetics */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white ring-1 ring-white/20'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`group relative max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 shadow-sm transition-all ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border border-black/5 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-tl-none shadow-md shadow-black/5'
              }`}
            >
              <div className="flex items-center justify-between gap-3 text-[10px] mb-1">
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {msg.sender === 'user' ? 'Вы' : 'AI-Тимлид «Макс»'}
                  </span>
                  {msg.sender === 'bot' && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-cyan-400 font-medium text-[9px] border border-blue-500/20">
                      <Sparkles className="w-2.5 h-2.5 mr-0.5 text-blue-500 dark:text-cyan-400" />
                      Наставник
                    </span>
                  )}
                </div>
                <span className="opacity-60 text-slate-500 dark:text-slate-400">{msg.timestamp}</span>
              </div>

              <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {msg.text}
              </div>

              {msg.socraticHint && (
                <div className="mt-2.5 p-2 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-500/30 text-blue-900 dark:text-blue-200 text-xs flex items-start space-x-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-600 dark:text-amber-300">Подсказка: </span>
                    {msg.socraticHint}
                  </div>
                </div>
              )}

              <button
                onClick={() => handleCopy(msg.id, msg.text)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition p-1 rounded-lg bg-black/5 dark:bg-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                title="Копировать"
              >
                {copiedId === msg.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border border-black/5 dark:border-white/10 rounded-2xl rounded-tl-none px-4 py-2.5 text-slate-500 dark:text-slate-300 text-xs flex items-center space-x-2 shadow-sm">
              <span className="flex space-x-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
              </span>
              <span>Макс формулирует ответ...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="mt-2 py-1 flex space-x-1.5 overflow-x-auto scrollbar-none text-xs">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p.text)}
            className="shrink-0 px-3 py-1.5 rounded-full backdrop-blur-xl bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 border border-black/5 dark:border-white/10 text-slate-700 dark:text-slate-300 transition flex items-center space-x-1.5 text-left shadow-sm active:scale-95"
          >
            <Sparkles className="w-3 h-3 text-blue-500" />
            <span className="max-w-[240px] truncate">{p.text}</span>
          </button>
        ))}
      </div>

      {/* Input Field with Liquid Glass glow */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="mt-2"
      >
        <div className="flex items-center backdrop-blur-2xl bg-white/80 dark:bg-slate-900/80 border border-black/10 dark:border-white/15 rounded-2xl overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition shadow-lg">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Задай вопрос по коду или ошибке..."
            className="flex-1 bg-transparent px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="mr-2 p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white transition active:scale-95 shadow-sm"
            aria-label="Отправить"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

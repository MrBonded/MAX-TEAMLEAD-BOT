/**
 * AI-Тимлид «Макс» для IT-лаборатории
 * Команда: «Галактические боты» (МБОУДО ДЮЦКО «Галактика» г. Калуги)
 * Поддерживает:
 *  1. Отечественный мессенджер МАКС (платформа dev.max.ru) через @maxhub/max-bot-api
 *  2. Мессенджер Telegram через Bot API (с поддержкой WebApp)
 */

import 'dotenv/config';
import { Bot as MaxBot, Keyboard as MaxKeyboard } from '@maxhub/max-bot-api';
import { GoogleGenAI } from '@google/genai';

const RAW_BOT_TOKEN = process.env.BOT_TOKEN || process.env.MAX_BOT_TOKEN || '';
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || (RAW_BOT_TOKEN.includes(':') ? RAW_BOT_TOKEN : '');
const MAX_TOKEN = process.env.MAX_BOT_TOKEN || (!RAW_BOT_TOKEN.includes(':') ? RAW_BOT_TOKEN : '');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || '';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://ais-dev-uh6zjs2xamoeuueivmctfd-89586925952.europe-west1.run.app';

console.log('🤖 Инициализация сервиса AI-Тимлид Бот...');
console.log(`🌐 WebApp URL: ${WEBAPP_URL}`);
console.log(`🔑 Gemini API: ${GEMINI_API_KEY ? 'ПОДКЛЮЧЕН (Онлайн)' : 'НЕ ЗАДАН (Автономный режим)'}`);

// Инициализация Google Gemini AI
let ai = null;
if (GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
      httpOptions: {
        headers: { 'User-Agent': 'max-teamlead-bot' },
      },
    });
  } catch (err) {
    console.warn('⚠️ Ошибка инициализации Gemini клиента:', err.message || err);
  }
}

import { generateSocraticResponse } from './socraticEngine.mjs';

// Отказоустойчивый вызов Gemini с каскадом моделей
async function askGemini(promptText, systemInstruction) {
  if (!ai) return null;
  const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: promptText,
        config: {
          systemInstruction: systemInstruction || 'Ты — AI-Тимлид Макс. Образовательный наставник по программированию и электронике.',
        },
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (e) {
      const status = e?.status || e?.code;
      const errStr = e?.message || String(e);
      const isQuotaOrLimit = status === 429 || errStr.includes('429') || errStr.includes('quota') || errStr.includes('RESOURCE_EXHAUSTED');
      const isDemandSpike = status === 503 || errStr.includes('503') || errStr.includes('high demand') || errStr.includes('UNAVAILABLE');

      if (isQuotaOrLimit || isDemandSpike) {
        // При перегрузке (503) или лимите (429) сразу передаем управление автономному Сократовскому движку
        break;
      }
    }
  }
  return null;
}

// Общие тексты ответов
const WELCOME_TEXT = `👋 Привет, будущий Senior-разработчик!

Я — **AI-Тимлид «Макс»**, твой цифровой наставник от команды «Галактические боты» (МБОУДО ДЮЦКО «Галактика» г. Калуги).

Я помогаю ученикам IT-лабораторий и кванториумов:
• 🧠 **Code Review 24/7**: нахожу баги и опечатки в Web и Python коде
• ⚡ **IoT-Ассистент**: предостерегаю от подачи 5V вместо 3.3V и спасения датчиков
• 🎯 **Сократовский метод**: я не списываю за тебя домашку, а учу ДУМАТЬ, как настоящий инженер!
• 📊 **Дайджест наставника**: экономлю до 80% времени твоих преподавателей

Нажми кнопку ниже, чтобы открыть интерактивную лабораторию:`;

const HELP_TEXT = `📖 **Справка по командам AI-Тимлида «Макс»**:

• \`/start\` — Главное меню и запуск
• \`/review\` — Отправить код на умный Code Review (JS, Python, HTML/CSS, C++)
• \`/iot\` — Инструкция по проверке схем и датчиков (DHT11, светодиоды, GND)
• \`/app\` — Запустить интерактивное Mini App прямо в мессенджере
• \`/help\` — Эта справка

💡 **Фишка проекта**:
Пришли мне любой фрагмент кода или ошибку из консоли, и я задам наводящий Сократовский вопрос!`;

const IOT_TEXT = `⚡ **IoT и безопасность электронных компонентов**:

Самые частые причины сгорания датчиков в детских лабораториях:
1. 🔴 **5V вместо 3.3V**: многие датчики (например, DHT11 ревизий 3V, ESP8266, NRF24L01) не переносят 5 Вольт!
2. ⚫ **Забытая общая земля (GND)**: если плата и внешнее питание не соединены по GND, логика глючит.
3. 💡 **Светодиод без резистора**: прямое подключение к пину Arduino/ESP32 сжигает порт контроллера (нужен резистор 220–330 Ом).

📸 В нашем WebApp ты можешь загрузить фото макетной платы для автоматической проверки!`;

// Функция анализа сообщений (Gemini или умный Сократовский движок)
async function handleUserMessage(text) {
  const looksLikeCode = text.includes('function') || text.includes('const ') || 
                        text.includes('let ') || text.includes('def ') || 
                        text.includes('import ') || text.includes('<div>') || 
                        text.includes('console.') || text.includes('print(') ||
                        text.includes('addEventListener') || text.includes('addEventListner');

  if (ai) {
    const prompt = `Ты — AI-Тимлид «Макс» для юных IT-разработчиков.
Ученик прислал сообщение:
"""
${text}
"""

${looksLikeCode 
  ? 'Это фрагмент кода. Проведи краткий Сократовский Code Review: укажи на возможные ошибки/опечатки (например, addEventListner, отсутствие проверки null, синтаксис), НЕ давай готовое решение целиком, а задай наводящий вопрос и похвали за старание.'
  : 'Ответь доброжелательно, по-наставнически, объясни суть явления и направь мысль ученика в правильное русло.'
}
Отвечай емко, на понятном русском языке, с красивым форматированием в Markdown.`;

    const geminiReply = await askGemini(prompt);
    if (geminiReply) return { reply: geminiReply, isCode: looksLikeCode };
  }

  // Умный Сократовский диалоговый движок (высокая готовность / офлайн / квота)
  const socratic = generateSocraticResponse({
    message: text,
    history: [],
    tone: 'socrates',
    direction: 'web'
  });

  return {
    reply: socratic.reply,
    isCode: socratic.isCode || looksLikeCode,
  };
}

// =====================================================================
// 1. ПОДДЕРЖКА ОТЕЧЕСТВЕННОГО МЕССЕНДЖЕРА МАКС (@maxhub/max-bot-api)
// =====================================================================
let maxBotInstance = null;

function getMainMenuKeyboardMAX() {
  const rows = [];
  // В МАКС кнопка перехода в WebApp создается через button.link (работает на всех клиентах)
  if (WEBAPP_URL) {
    rows.push([MaxKeyboard.button.link('🚀 Открыть AI-Тимлид WebApp', WEBAPP_URL)]);
  }
  rows.push([
    MaxKeyboard.button.callback('🔍 Code Review', 'action_review'),
    MaxKeyboard.button.callback('⚡ IoT & Схемы', 'action_iot'),
  ]);
  rows.push([
    MaxKeyboard.button.callback('🎓 Сократовский вопрос', 'action_socrates'),
    MaxKeyboard.button.callback('ℹ️ Справка', 'action_help'),
  ]);
  return MaxKeyboard.inlineKeyboard(rows);
}

function getReviewFollowupKeyboardMAX() {
  const rows = [
    [
      MaxKeyboard.button.callback('💡 Дай наводящую подсказку', 'hint_more'),
      MaxKeyboard.button.callback('📚 Правило Clean Code', 'hint_cleancode'),
    ],
  ];
  if (WEBAPP_URL) {
    rows.push([MaxKeyboard.button.link('📱 Открыть подробный отчет в WebApp', WEBAPP_URL)]);
  }
  return MaxKeyboard.inlineKeyboard(rows);
}

async function safeReplyMAX(ctx, text, keyboard = null) {
  // 1-я попытка: отправка с полной клавиатурой (ссылка на WebApp + кнопки)
  if (keyboard) {
    try {
      await ctx.reply(text, { attachments: [keyboard] });
      return;
    } catch (err) {
      console.warn('[MAX API] Клавиатура со ссылкой отклонена сервером, применяем резервную клавиатуру');
    }
  }

  // 2-я попытка (Резерв): отправка клавиатуры ТОЛЬКО с callback-кнопками (гарантированно принимаются сервером МАКС)
  try {
    const fallbackKeyboard = MaxKeyboard.inlineKeyboard([
      [
        MaxKeyboard.button.callback('🔍 Code Review', 'action_review'),
        MaxKeyboard.button.callback('⚡ IoT & Схемы', 'action_iot'),
      ],
      [
        MaxKeyboard.button.callback('🎓 Сократовский вопрос', 'action_socrates'),
        MaxKeyboard.button.callback('ℹ️ Справка', 'action_help'),
      ],
    ]);
    await ctx.reply(text, { attachments: [fallbackKeyboard] });
    return;
  } catch (err2) {
    console.warn('[MAX API] Резервная клавиатура отклонена');
  }

  // 3-я попытка: гарантированная доставка текста
  try {
    await ctx.reply(text);
  } catch (err3) {
    console.error('[MAX API] Фатальный сбой отправки ответа:', err3?.message || err3);
  }
}

if (MAX_TOKEN && MAX_TOKEN !== 'DUMMY_TOKEN_FOR_SETUP' && !MAX_TOKEN.includes(':')) {
  try {
    console.log('🤖 Запуск бота для отечественного мессенджера МАКС...');
    maxBotInstance = new MaxBot(MAX_TOKEN);

    maxBotInstance.command('start', async (ctx) => {
      await safeReplyMAX(ctx, WELCOME_TEXT, getMainMenuKeyboardMAX());
    });

    maxBotInstance.command('help', async (ctx) => {
      await safeReplyMAX(ctx, HELP_TEXT, getMainMenuKeyboardMAX());
    });

    maxBotInstance.command('app', async (ctx) => {
      if (WEBAPP_URL) {
        await safeReplyMAX(ctx, '🚀 Нажми кнопку ниже, чтобы открыть лабораторию AI-Тимлида:', MaxKeyboard.inlineKeyboard([
          [MaxKeyboard.button.link('🌟 Запустить WebApp AI-Тимлид', WEBAPP_URL)],
        ]));
      } else {
        await safeReplyMAX(ctx, '🚀 Адрес WebApp пока не задан в настройках.');
      }
    });

    maxBotInstance.command('review', async (ctx) => {
      await safeReplyMAX(ctx, '📝 Отправь мне фрагмент кода (.js / .py / .html) для Сократовского аудита!');
    });

    maxBotInstance.command('iot', async (ctx) => {
      if (WEBAPP_URL) {
        await safeReplyMAX(ctx, IOT_TEXT, MaxKeyboard.inlineKeyboard([
          [MaxKeyboard.button.link('🔬 Открыть IoT-сканер в WebApp', WEBAPP_URL)],
        ]));
      } else {
        await safeReplyMAX(ctx, IOT_TEXT);
      }
    });

    maxBotInstance.action('action_review', async (ctx) => {
      try { await ctx.answerOnCallback?.(); } catch (e) {}
      await safeReplyMAX(ctx, '👉 Пришли мне код сообщением, например:\n\n```javascript\nconst btn = document.querySelector(".btn");\nbtn.addEventListner("click", () => console.log("клик"));\n```');
    });

    maxBotInstance.action('action_iot', async (ctx) => {
      try { await ctx.answerOnCallback?.(); } catch (e) {}
      await safeReplyMAX(ctx, '🔌 Подключаешь датчик? Открой WebApp для сканирования схемы или задай вопрос о питании!');
    });

    maxBotInstance.action('action_socrates', async (ctx) => {
      try { await ctx.answerOnCallback?.(); } catch (e) {}
      await safeReplyMAX(ctx, '🤔 **Сократовский метод**:\n\nКогда падает ошибка, задай себе вопрос:\n*«А существовал ли этот объект в памяти в момент вызова функции?»*\n\nНапиши мне ошибку, и мы найдем причину!');
    });

    maxBotInstance.action('action_help', async (ctx) => {
      try { await ctx.answerOnCallback?.(); } catch (e) {}
      await safeReplyMAX(ctx, '💡 Набери /help для списка всех команд или нажми кнопку запуска WebApp.');
    });

    maxBotInstance.action('hint_more', async (ctx) => {
      try { await ctx.answerOnCallback?.(); } catch (e) {}
      await safeReplyMAX(ctx, '🔍 **Подсказка**: Проверь регистр символов и правописание методов: Listener vs Listner!');
    });

    maxBotInstance.action('hint_cleancode', async (ctx) => {
      try { await ctx.answerOnCallback?.(); } catch (e) {}
      await safeReplyMAX(ctx, '✨ **Clean Code**: Всегда проверяй элементы перед вызовом методов: `if (!btn) return;`!');
    });

    maxBotInstance.on('message', async (ctx) => {
      const text = ctx.message?.text || '';
      if (!text || text.startsWith('/')) return;
      const result = await handleUserMessage(text);
      await safeReplyMAX(
        ctx,
        result.reply,
        result.isCode ? getReviewFollowupKeyboardMAX() : getMainMenuKeyboardMAX()
      );
    });

    maxBotInstance.start();
    console.log('✅ Бот для МАКС успешно запущен (платформа dev.max.ru)!');
  } catch (err) {
    console.warn('⚠️ Ошибка запуска бота для МАКС:', err.message || err);
  }
} else {
  console.log('ℹ️ Токен МАКС не обнаружен или указан токен другого формата. Ожидание команд...');
}

// =====================================================================
// 2. ПОДДЕРЖКА МЕССЕНДЖЕРА TELEGRAM (Long Polling без внешних библиотек)
// =====================================================================
if (TELEGRAM_TOKEN && TELEGRAM_TOKEN.includes(':')) {
  console.log('🤖 Запуск бота для Telegram (Telegram Bot API)...');

  const TG_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

  function getTelegramInlineKeyboard() {
    return {
      inline_keyboard: [
        [{ text: '🚀 Открыть AI-Тимлид WebApp', web_app: { url: WEBAPP_URL } }],
        [
          { text: '🔍 Code Review', callback_data: 'action_review' },
          { text: '⚡ IoT & Схемы', callback_data: 'action_iot' },
        ],
        [
          { text: '🎓 Сократовский вопрос', callback_data: 'action_socrates' },
          { text: 'ℹ️ Справка', callback_data: 'action_help' },
        ],
      ],
    };
  }

  async function tgSendMessage(chatId, text, replyMarkup = null) {
    try {
      const body = {
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      };
      if (replyMarkup) body.reply_markup = replyMarkup;

      const res = await fetch(`${TG_API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return await res.json();
    } catch (e) {
      console.warn('⚠️ Ошибка отправки Telegram сообщения:', e.message || e);
    }
  }

  async function tgAnswerCallback(callbackQueryId, text = '') {
    try {
      await fetch(`${TG_API}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
      });
    } catch (e) {
      // Игнорируем ошибки квитирования
    }
  }

  // Цикл Long Polling для Telegram
  let tgOffset = 0;
  let isTgRunning = true;

  async function runTelegramPolling() {
    console.log('✅ Telegram Bot активен и ожидает сообщений!');
    while (isTgRunning) {
      try {
        const response = await fetch(`${TG_API}/getUpdates?offset=${tgOffset}&timeout=25`, {
          signal: AbortSignal.timeout(30000),
        });
        if (!response.ok) {
          await new Promise((r) => setTimeout(r, 4000));
          continue;
        }
        const data = await response.json();
        if (data && data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            tgOffset = update.update_id + 1;

            if (update.callback_query) {
              const cb = update.callback_query;
              const chatId = cb.message?.chat?.id;
              await tgAnswerCallback(cb.id);
              if (cb.data === 'action_review') {
                await tgSendMessage(chatId, '👉 Пришли мне код сообщением, например:\n\n```javascript\nconst btn = document.querySelector(".btn");\nbtn.addEventListner("click", () => console.log("клик"));\n```');
              } else if (cb.data === 'action_iot') {
                await tgSendMessage(chatId, IOT_TEXT, getTelegramInlineKeyboard());
              } else if (cb.data === 'action_socrates') {
                await tgSendMessage(chatId, '🤔 **Сократовский метод**:\n\nКогда падает ошибка, задай себе вопрос:\n*«А существовал ли этот объект в памяти в момент вызова функции?»*\n\nНапиши мне ошибку, и мы найдем причину!');
              } else if (cb.data === 'action_help') {
                await tgSendMessage(chatId, HELP_TEXT, getTelegramInlineKeyboard());
              }
              continue;
            }

            if (update.message) {
              const msg = update.message;
              const chatId = msg.chat?.id;
              const text = msg.text || '';

              if (text.startsWith('/start')) {
                await tgSendMessage(chatId, WELCOME_TEXT, getTelegramInlineKeyboard());
              } else if (text.startsWith('/help')) {
                await tgSendMessage(chatId, HELP_TEXT, getTelegramInlineKeyboard());
              } else if (text.startsWith('/app')) {
                await tgSendMessage(chatId, '🚀 Нажми кнопку ниже, чтобы открыть лабораторию AI-Тимлида:', getTelegramInlineKeyboard());
              } else if (text.startsWith('/review')) {
                await tgSendMessage(chatId, '📝 Отправь мне код на JS/Python/HTML для Сократовского ревью!');
              } else if (text.startsWith('/iot')) {
                await tgSendMessage(chatId, IOT_TEXT, getTelegramInlineKeyboard());
              } else if (text) {
                const res = await handleUserMessage(text);
                await tgSendMessage(chatId, res.reply, getTelegramInlineKeyboard());
              }
            }
          }
        }
      } catch (err) {
        // Ошибка сети или таймаут long polling - повторяем через 3 сек
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }

  runTelegramPolling().catch((e) => console.error('Telegram polling error:', e));
} else {
  console.log('ℹ️ Telegram токен не задан. Если хотите подключить Telegram, укажите TELEGRAM_BOT_TOKEN в .env');
}

export { maxBotInstance };

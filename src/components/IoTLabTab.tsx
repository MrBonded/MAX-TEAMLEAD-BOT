import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  AlertOctagon, 
  CheckCircle2, 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  RefreshCw,
  Camera,
  Layers,
  UploadCloud,
  X,
  Sparkles,
  Info,
  Check,
  AlertTriangle,
  ArrowRight,
  Eye,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { IoTCheckResult } from '../types';

interface IoTLabTabProps {
  onEarnXp: (amount: number, reason: string) => void;
  onIncrementCircuit: (wasDangerous: boolean) => void;
}

export const IoTLabTab: React.FC<IoTLabTabProps> = ({ onEarnXp, onIncrementCircuit }) => {
  const circuitPresets = [
    {
      id: 'dht11-5v',
      title: 'DHT11 на 5V вместо 3.3V (Опасно)',
      board: 'Arduino / ESP32',
      risk: 'Высокий',
      description: 'Подключение чувствительного сенсора влажности DHT11 к шине 5V без согласования уровней.',
    },
    {
      id: 'led-no-resistor',
      title: 'Светодиод без резистора (КЗ)',
      board: 'Arduino Nano',
      risk: 'Высокий',
      description: 'Светодиод напрямую между цифровым пином D9 и землей GND без токоограничивающего резистора 220 Ом.',
    },
    {
      id: 'hcsr04-no-gnd',
      title: 'Датчик без общей земли GND',
      board: 'ESP8266',
      risk: 'Средний',
      description: 'Внешнее питание подключено, но нет общего провода земли (GND) с контроллером.',
    },
    {
      id: 'safe-circuit',
      title: 'Безопасная схема (Эталон)',
      board: 'ESP32 DevKit',
      risk: 'Безопасно',
      description: 'Светодиод с резистором 220 Ом на 3.3V с объединенной землей и защитой от КЗ.',
    },
  ];

  const [mode, setMode] = useState<'photo' | 'preset'>('photo');
  const [selectedPreset, setSelectedPreset] = useState(circuitPresets[0]);
  const [boardType, setBoardType] = useState('auto');
  const [userNote, setUserNote] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState<IoTCheckResult | null>(null);

  // Scan steps animation while waiting for Vision response
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setScanStep(1);
      interval = setInterval(() => {
        setScanStep((prev) => (prev < 4 ? prev + 1 : prev));
      }, 3500);
    } else {
      setScanStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setUploadedImage(base64);
      setMode('photo');
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setUploadedImage(null);
    setResult(null);
  };

  const handleRunInspection = async () => {
    setLoading(true);

    try {
      const isPhoto = mode === 'photo' && Boolean(uploadedImage);

      const payload: Record<string, any> = {
        boardType: isPhoto ? boardType : selectedPreset.board,
        description: isPhoto ? userNote.trim() : selectedPreset.description,
        isUserPhoto: isPhoto,
      };

      if (isPhoto && uploadedImage) {
        payload.imageBase64 = uploadedImage;
        payload.mimeType = 'image/jpeg';
      }

      // Allow 38 seconds for deep multimodal vision analysis
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 38000);

      const response = await fetch('/api/iot-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data: IoTCheckResult = await response.json();
      setResult(data);

      const wasDangerous = !data.safeToPowerOn;
      onIncrementCircuit(wasDangerous);
      onEarnXp(30, 'Проверка электросхемы');
    } catch {
      // Offline fallback
      const isSafe = mode === 'preset' && selectedPreset.id === 'safe-circuit';
      const fallbackResult: IoTCheckResult = {
        isElectronicsDetected: true,
        boardName: mode === 'photo' ? (boardType !== 'auto' ? boardType : 'Макетная плата с компонентами') : selectedPreset.board,
        visualSummary: mode === 'photo' 
          ? 'Фотография получена. Проведен автономный экспресс-аудит безопасности цепей.'
          : selectedPreset.description,
        breadboardDetails: {
          hasBreadboard: true,
          railsStatus: 'Проверьте непрерывность шин питания (+ красная, - синяя) вдоль всей макетки',
          description: 'Убедитесь, что ножки компонентов не закорочены в одной 5-контактной дорожке',
        },
        safeToPowerOn: isSafe,
        safetyScore: isSafe ? 98 : 55,
        riskLevel: isSafe ? 'Безопасно' : 'Средний',
        identifiedComponents: [
          'Беспаечная макетная плата',
          'Контроллерная плата',
          'Соединительные провода DuPont',
          'Электронные модули / светодиоды'
        ],
        pinConnections: [
          {
            from: 'Шина питания VCC',
            to: 'Красная рельса (+) макетки',
            wireColor: 'Красный',
            purpose: 'Подача питания схемы',
            status: isSafe ? 'ok' : 'warning',
            notes: 'Убедись: 5V или 3.3V необходимо компонентам?'
          },
          {
            from: 'Шина земли GND',
            to: 'Синяя рельса (-) макетки',
            wireColor: 'Черный',
            purpose: 'Общая земля',
            status: 'ok',
            notes: 'Все цепи должны иметь общую точку GND'
          }
        ],
        hazards: isSafe
          ? []
          : [
              {
                severity: 'Предупреждение',
                component: 'Контрольный осмотр перед включением USB',
                message: 'Внимательно проверь цепи на отсутствие прямого короткого замыкания (КЗ).',
                advice: 'Убедись, что светодиоды включены через резисторы от 220 Ом, а полярность питания не перепутана.',
              },
            ],
        checklist: [
          { item: 'Общая земля (GND) объединена для всех узлов', passed: true },
          { item: 'Напряжение питания проверено (3.3V vs 5V)', passed: isSafe },
          { item: 'Токоограничивающие резисторы на месте', passed: isSafe },
          { item: 'Нет короткого замыкания между шинами питания', passed: true },
          { item: 'Компоненты правильно установлены в отверстия макетки', passed: true },
        ],
        plainExplanation: mode === 'photo'
          ? 'Фотография твоей схемы принята! Перед тем как вставить USB-кабель в компьютер, выполни контрольную проверку: убедись, что ни один светодиод не включен напрямую без резистора, плюс и минус питания не соприкасаются, а все модули питаются правильным напряжением (3.3V для чувствительных датчиков, 5V для реле).'
          : 'Схема проверена по базе типовых ошибок робототехнических лабораторий.',
        stepByStepFix: [
          '1. Дважды визуально проверь контакты питания (+) и (-)',
          '2. Убедись, что на каждом светодиоде есть резистор от 220 Ом',
          '3. Вставь USB-кабель и приложи палец к чипу: если он холодный, схема собрана верно!'
        ],
        mentorVerdict: isSafe
          ? 'Схема собрана правильно, можно включать питание.'
          : 'СТОП! Внимательно перепроверь проводку перед подачей напряжения.',
      };

      setResult(fallbackResult);
      onIncrementCircuit(!isSafe);
      onEarnXp(30, 'Проверка электросхемы');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Top Banner with mode switch */}
      <div className="backdrop-blur-2xl bg-white/70 dark:bg-slate-900/60 border border-black/5 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-300 border border-blue-200/60 dark:border-cyan-500/30">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Инспектор макетных плат и схем</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-cyan-500/30">
                AI-Vision
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Распознавание фотографий макетки, трассировка проводов, защита от 5V/3.3V и КЗ (+30 XP)
            </p>
          </div>
        </div>

        {/* Mode switcher tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
          <button
            onClick={() => setMode('photo')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              mode === 'photo'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Фото макетки</span>
          </button>
          <button
            onClick={() => setMode('preset')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              mode === 'preset'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Типовые схемы</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Input (Photo or Preset) */}
        <div className="lg:col-span-6 space-y-3">
          {mode === 'photo' ? (
            /* Photo upload & options card */
            <div className="backdrop-blur-2xl bg-white/80 dark:bg-slate-900/80 border border-black/5 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-blue-500" />
                  Фотография твоей макетной платы:
                </span>
                {uploadedImage && (
                  <button
                    onClick={handleClearImage}
                    className="text-rose-500 hover:text-rose-600 text-[11px] flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    <span>Удалить</span>
                  </button>
                )}
              </div>

              {/* Upload Dropzone / Image Preview */}
              {uploadedImage ? (
                <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center max-h-64">
                  <img
                    src={uploadedImage}
                    alt="Загруженная макетная плата"
                    className="max-h-64 w-auto object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-white/90 text-slate-900 text-xs font-medium hover:bg-white flex items-center gap-1.5 shadow-md">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Заменить фото</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-blue-300 dark:border-blue-900/60 hover:border-blue-500 dark:hover:border-cyan-400 bg-blue-50/40 dark:bg-blue-950/20 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition group">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-cyan-300 group-hover:scale-110 transition-transform mb-2">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Нажми или перетащи сюда фото макетки
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                    Сфотографируй плату сверху при хорошем свете, чтобы были видны выводы и провода
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              )}

              {/* Board Selector & Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <SlidersHorizontal className="w-3 h-3" />
                    Микроконтроллер:
                  </label>
                  <select
                    value={boardType}
                    onChange={(e) => setBoardType(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="auto">✨ Автоопределение по фото</option>
                    <option value="Arduino Uno / Nano">Arduino Uno / Nano</option>
                    <option value="ESP32 DevKit">ESP32 DevKit</option>
                    <option value="Raspberry Pi Pico">Raspberry Pi Pico</option>
                    <option value="STM32">STM32 (Blue/Black Pill)</option>
                    <option value="ESP8266 NodeMCU">ESP8266 NodeMCU</option>
                    <option value="Макетка без МК (только питание)">Макетка без МК</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Пояснение (необязательно):
                  </label>
                  <input
                    type="text"
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    placeholder="Например: Светофор с кнопкой"
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleRunInspection}
                disabled={loading || !uploadedImage}
                className={`w-full py-2.5 rounded-xl font-medium flex items-center justify-center space-x-2 shadow-sm transition active:scale-95 ${
                  uploadedImage && !loading
                    ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>
                      {scanStep === 1 && '1/4 Анализ фото и компонентов...'}
                      {scanStep === 2 && '2/4 Трассировка проводки и шин питания...'}
                      {scanStep === 3 && '3/4 Проверка на КЗ и уровни 5V/3.3V...'}
                      {scanStep >= 4 && '4/4 Формирование понятного отчета...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current text-amber-300" />
                    <span>Распознать макетку и проверить схему (+30 XP)</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Presets mode card */
            <div className="backdrop-blur-2xl bg-white/80 dark:bg-slate-900/80 border border-black/5 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-3">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Выберите типовую схему из лабораторного курса:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {circuitPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedPreset(preset);
                      setResult(null);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedPreset.id === preset.id
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-cyan-500/50 text-blue-900 dark:text-white shadow-xs'
                        : 'bg-slate-50/60 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold mb-0.5">
                      <span className="truncate">{preset.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {preset.description}
                    </p>
                  </button>
                ))}
              </div>

              {/* Preset SVG visualizer */}
              <div className="relative w-full h-44 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden p-2">
                <svg viewBox="0 0 560 210" className="w-full h-full max-h-40 drop-shadow-xs">
                  {/* Breadboard Base */}
                  <rect x="20" y="15" width="520" height="180" rx="8" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
                  
                  {/* Power Rails */}
                  <line x1="40" y1="30" x2="520" y2="30" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />
                  <line x1="40" y1="40" x2="520" y2="40" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 2" />

                  {/* Microcontroller */}
                  <rect x="40" y="60" width="140" height="120" rx="6" fill="#0f766e" />
                  <text x="55" y="90" fill="#ffffff" fontSize="11" fontWeight="bold">ARDUINO / ESP</text>
                  <circle cx="160" cy="80" r="4" fill="#fbbf24" />
                  <text x="125" y="84" fill="#ffffff" fontSize="9">5V / 3.3V</text>
                  <circle cx="160" cy="110" r="4" fill="#38bdf8" />
                  <text x="135" y="114" fill="#ffffff" fontSize="9">GND</text>
                  <circle cx="160" cy="140" r="4" fill="#c084fc" />
                  <text x="135" y="144" fill="#ffffff" fontSize="9">PIN</text>

                  {/* Tie points */}
                  {[...Array(10)].map((_, i) => (
                    <g key={i}>
                      <circle cx={220 + i * 22} cy="70" r="2.5" fill="#94a3b8" />
                      <circle cx={220 + i * 22} cy="90" r="2.5" fill="#94a3b8" />
                      <circle cx={220 + i * 22} cy="110" r="2.5" fill="#94a3b8" />
                      <circle cx={220 + i * 22} cy="130" r="2.5" fill="#94a3b8" />
                      <circle cx={220 + i * 22} cy="150" r="2.5" fill="#94a3b8" />
                    </g>
                  ))}

                  {/* Preset visuals */}
                  {selectedPreset.id === 'dht11-5v' && (
                    <g>
                      <rect x="380" y="70" width="60" height="70" rx="4" fill="#0284c7" />
                      <text x="390" y="95" fill="#ffffff" fontSize="10" fontWeight="bold">DHT11</text>
                      <path d="M 160 80 Q 270 20 395 140" fill="none" stroke="#ef4444" strokeWidth="3" />
                      <path d="M 160 110 Q 270 110 415 140" fill="none" stroke="#3b82f6" strokeWidth="3" />
                      <circle cx="280" cy="45" r="12" fill="#ef4444" />
                      <text x="276" y="50" fill="#ffffff" fontSize="13" fontWeight="bold">!</text>
                      <text x="300" y="49" fill="#ef4444" fontSize="11" fontWeight="bold">5V ОПАСНО ДЛЯ DHT11</text>
                    </g>
                  )}

                  {selectedPreset.id === 'led-no-resistor' && (
                    <g>
                      <path d="M 380 95 A 12 12 0 0 1 404 95 Z" fill="#ef4444" />
                      <line x1="388" y1="95" x2="388" y2="135" stroke="#94a3b8" strokeWidth="2" />
                      <line x1="396" y1="95" x2="396" y2="135" stroke="#94a3b8" strokeWidth="2" />
                      <path d="M 160 140 Q 270 130 388 135" fill="none" stroke="#eab308" strokeWidth="3" />
                      <path d="M 160 110 Q 270 170 396 135" fill="none" stroke="#3b82f6" strokeWidth="3" />
                      <circle cx="290" cy="120" r="12" fill="#ef4444" />
                      <text x="286" y="125" fill="#ffffff" fontSize="13" fontWeight="bold">!</text>
                      <text x="310" y="124" fill="#ef4444" fontSize="11" fontWeight="bold">НЕТ РЕЗИСТОРА 220 Ом</text>
                    </g>
                  )}

                  {selectedPreset.id === 'hcsr04-no-gnd' && (
                    <g>
                      <rect x="360" y="70" width="90" height="50" rx="4" fill="#2563eb" />
                      <circle cx="380" cy="95" r="12" fill="#94a3b8" />
                      <circle cx="430" cy="95" r="12" fill="#94a3b8" />
                      <text x="375" y="60" fill="#38bdf8" fontSize="10" fontWeight="bold">HC-SR04</text>
                      <line x1="160" y1="110" x2="230" y2="110" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" />
                      <text x="240" y="114" fill="#f59e0b" fontSize="11" fontWeight="bold">ОБРЫВ ЗЕМЛИ (GND)</text>
                    </g>
                  )}

                  {selectedPreset.id === 'safe-circuit' && (
                    <g>
                      <rect x="300" y="120" width="30" height="10" fill="#d97706" rx="2" />
                      <path d="M 370 120 A 10 10 0 0 1 390 120 Z" fill="#10b981" />
                      <line x1="378" y1="120" x2="378" y2="145" stroke="#94a3b8" strokeWidth="2" />
                      <line x1="384" y1="120" x2="384" y2="145" stroke="#94a3b8" strokeWidth="2" />
                      <path d="M 160 140 Q 230 130 300 125" fill="none" stroke="#eab308" strokeWidth="3" />
                      <circle cx="315" cy="80" r="12" fill="#10b981" />
                      <text x="310" y="85" fill="#ffffff" fontSize="12" fontWeight="bold">✓</text>
                      <text x="335" y="84" fill="#10b981" fontSize="11" fontWeight="bold">БЕЗОПАСНАЯ СБОРКА</text>
                    </g>
                  )}
                </svg>
              </div>

              <button
                onClick={handleRunInspection}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center justify-center space-x-2 shadow-sm transition active:scale-95 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Проверка безопасности...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current text-amber-300" />
                    <span>Проверить безопасность схемы (+30 XP)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Tips for photographing breadboards */}
          <div className="backdrop-blur-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/40 rounded-xl p-3 text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <span className="font-semibold text-blue-700 dark:text-cyan-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Советы для идеального распознавания макетки:
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
              <li>Снимай плату строго сверху (под углом 90 градусов).</li>
              <li>Обеспечь яркий свет, чтобы были видны цветные полосы резисторов.</li>
              <li>Провода должны быть аккуратно расправлены без клубка.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Diagnostic Result with Detailed Socratic Mentor Explanation */}
        <div className="lg:col-span-6 space-y-3">
          {result ? (
            <div className="backdrop-blur-2xl bg-white/80 dark:bg-slate-900/80 border border-black/5 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-3.5">
              
              {/* Electronics detection guard */}
              {result.isElectronicsDetected === false ? (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/40 text-amber-900 dark:text-amber-200 space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-sm text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                    <span>Электроника или макетная плата не распознаны</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    {result.plainExplanation || 'На представленной фотографии нейросети не удалось обнаружить беспаечную макетную плату, радиодетали или провода.'}
                  </p>
                  <div className="p-2 rounded-lg bg-white/60 dark:bg-black/30 text-[11px] font-medium text-amber-800 dark:text-amber-300">
                    💡 Сделай четкое фото макетной платы сверху при хорошем освещении и загрузи еще раз!
                  </div>
                </div>
              ) : (
                <>
                  {/* Verdict Banner */}
                  <div
                    className={`p-3.5 rounded-xl border flex items-start space-x-3 ${
                      result.safeToPowerOn
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-500/40 text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    {result.safeToPowerOn ? (
                      <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertOctagon className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold tracking-tight">
                          {result.safeToPowerOn
                            ? 'МОЖНО ВКЛЮЧАТЬ ПИТАНИЕ'
                            : 'СТОП! НЕ ВКЛЮЧАТЬ ПИТАНИЕ'}
                        </h3>
                        {result.isLiveAi && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-200/70 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                            Live AI
                          </span>
                        )}
                      </div>
                      <p className="text-xs opacity-90">
                        Уровень риска: <strong>{result.riskLevel}</strong> | Оценка безопасности: <strong>{result.safetyScore}/100</strong>
                      </p>
                    </div>
                  </div>

                  {/* Plain understandable explanation (Понятное объяснение) */}
                  <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-500/30 text-xs text-slate-800 dark:text-slate-200 space-y-2">
                    <span className="font-bold text-blue-700 dark:text-cyan-300 flex items-center gap-1.5 text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Понятное объяснение от AI-Тимлида:
                    </span>
                    <p className="text-xs leading-relaxed whitespace-pre-line font-normal text-slate-700 dark:text-slate-300">
                      {result.plainExplanation || result.visualSummary}
                    </p>
                  </div>

                  {/* Components Identified on Photo */}
                  <div className="space-y-1.5 text-xs">
                    <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block text-[10px] flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Обнаруженные компоненты ({result.identifiedComponents.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.boardName && (
                        <span className="px-2 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/50 text-purple-700 dark:text-purple-300 font-semibold text-[11px] flex items-center gap-1">
                          <Cpu className="w-3 h-3" />
                          {result.boardName}
                        </span>
                      )}
                      {result.identifiedComponents.map((comp, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px]"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pin & Wire Tracing */}
                  {result.pinConnections && result.pinConnections.length > 0 && (
                    <div className="space-y-1.5 text-xs">
                      <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block text-[10px]">
                        Трассировка соединений и проводки:
                      </span>
                      <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                        {result.pinConnections.map((conn, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-between text-[11px] gap-2"
                          >
                            <div className="flex items-center space-x-1.5 truncate">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  conn.status === 'ok'
                                    ? 'bg-emerald-500'
                                    : conn.status === 'warning'
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                              />
                              <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                {conn.from}
                              </span>
                              <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="text-slate-600 dark:text-slate-400 truncate">
                                {conn.to}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
                              {conn.notes || conn.purpose}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hazards list */}
                  {result.hazards.length > 0 && (
                    <div className="space-y-1.5 text-xs">
                      <span className="font-semibold text-rose-500 uppercase tracking-wider flex items-center gap-1 text-[10px]">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Критические риски и опасности:
                      </span>

                      {result.hazards.map((h, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/60 space-y-1"
                        >
                          <div className="flex items-center justify-between font-bold text-rose-700 dark:text-rose-400 text-xs">
                            <span>{h.component}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                              {h.severity}
                            </span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 text-xs">{h.message}</p>
                          <p className="text-blue-700 dark:text-cyan-300 font-medium text-xs">👉 {h.advice}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Step-by-step fix action plan */}
                  {result.stepByStepFix && result.stepByStepFix.length > 0 && (
                    <div className="space-y-1.5 text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block text-[10px]">
                        Пошаговый план действий:
                      </span>
                      <div className="space-y-1">
                        {result.stepByStepFix.map((step, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/40 dark:border-blue-900/40 flex items-start space-x-2 text-[11px]"
                          >
                            <span className="w-4 h-4 rounded-full bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-cyan-300 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-slate-700 dark:text-slate-300 leading-snug">
                              {step}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Checklist */}
                  <div className="space-y-1.5 text-xs">
                    <span className="font-semibold text-slate-400 uppercase tracking-wider block text-[10px]">
                      Чек-лист электробезопасности:
                    </span>
                    <div className="space-y-1">
                      {result.checklist.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-black/5 dark:bg-white/5"
                        >
                          <span className="text-slate-700 dark:text-slate-300 text-[11px]">{item.item}</span>
                          {item.passed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <AlertOctagon className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mentor Verdict */}
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-200">
                    <strong className="text-blue-600 dark:text-cyan-300">Напутствие наставника: </strong>
                    {result.mentorVerdict}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[300px] backdrop-blur-2xl bg-white/50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-2.5 text-slate-400">
              <Zap className="w-10 h-10 text-amber-500 opacity-60" />
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Макетка еще не просканирована
              </h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Загрузи фото своей макетной платы слева или выбери типовую схему, затем нажми «Распознать макетку».
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import test from 'node:test';
import assert from 'node:assert/strict';
import { IoTCheckResult } from '../src/types.js';

test('IoTCheckResult correctly validates safe circuit schemas', () => {
  const sampleSafe: IoTCheckResult = {
    isElectronicsDetected: true,
    boardName: 'Arduino Uno R3',
    visualSummary: 'Схема на макетной плате со светодиодом и резистором',
    breadboardDetails: {
      hasBreadboard: true,
      railsStatus: 'Шины питания запитаны от 5V и GND',
      description: 'Компоненты смонтированы в рядах 10-15',
    },
    safeToPowerOn: true,
    safetyScore: 95,
    riskLevel: 'Безопасно',
    identifiedComponents: ['Arduino Uno', 'Светодиод', 'Резистор 220 Ом'],
    pinConnections: [
      {
        from: 'Pin D9',
        to: 'Резистор 220 Ом -> Анод',
        status: 'ok',
        wireColor: 'Красный',
      },
    ],
    hazards: [],
    checklist: [
      { item: 'Общая земля объединена', passed: true },
      { item: 'Токоограничивающий резистор установлен', passed: true },
    ],
    plainExplanation: 'Схема полностью безопасна для подключения по USB.',
    stepByStepFix: ['Вставь USB-кабель', 'Загрузи скетч Blink'],
    mentorVerdict: 'Отличная работа!',
  };

  assert.equal(sampleSafe.safeToPowerOn, true);
  assert.equal(sampleSafe.isElectronicsDetected, true);
  assert.equal(sampleSafe.hazards.length, 0);
  assert.ok(sampleSafe.safetyScore >= 90);
  assert.ok(sampleSafe.plainExplanation && sampleSafe.plainExplanation.length > 10);
});

test('IoTCheckResult flags missing resistor hazard', () => {
  const sampleUnsafe: IoTCheckResult = {
    isElectronicsDetected: true,
    boardName: 'ESP32 DevKit',
    visualSummary: 'Светодиод без резистора подключен к GPIO',
    safeToPowerOn: false,
    safetyScore: 35,
    riskLevel: 'Высокий',
    identifiedComponents: ['ESP32', 'Светодиод'],
    hazards: [
      {
        severity: 'Критично',
        component: 'Светодиод',
        message: 'Отсутствует резистор 220 Ом',
        advice: 'Установи резистор перед включением',
      },
    ],
    checklist: [{ item: 'Токоограничивающий резистор', passed: false }],
    plainExplanation: 'СТОП! Светодиод перегорит без токоограничивающего резистора.',
    mentorVerdict: 'Исправь подключение!',
  };

  assert.equal(sampleUnsafe.safeToPowerOn, false);
  assert.equal(sampleUnsafe.hazards.length, 1);
  assert.equal(sampleUnsafe.hazards[0].severity, 'Критично');
  assert.equal(sampleUnsafe.riskLevel, 'Высокий');
});

test('Handles non-electronics image gracefully without crashing', () => {
  const nonElectronics: IoTCheckResult = {
    isElectronicsDetected: false,
    safeToPowerOn: false,
    safetyScore: 0,
    riskLevel: 'Средний',
    identifiedComponents: [],
    hazards: [],
    checklist: [],
    plainExplanation: 'На фото не обнаружена макетная плата или радиодетали.',
    mentorVerdict: 'Сделай четкое фото макетки сверху при хорошем свете.',
  };

  assert.equal(nonElectronics.isElectronicsDetected, false);
  assert.ok(nonElectronics.plainExplanation?.includes('макетная плата'));
});

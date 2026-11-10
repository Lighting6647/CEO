import { test } from 'node:test';
import assert from 'node:assert';

import {
  getRoutineSchedule,
  saveRoutineSchedule,
  evaluateRoutineScheduleTrigger,
  markRoutineRunDate,
} from '../src/services/routineAutomationService.js';

import {
  getWebhookConfig,
  saveWebhookConfig,
  sendTelegramBriefing,
  sendLineBriefing,
  sendCustomWebhook,
  dispatchExecutiveBriefing,
} from '../src/services/webhookDeliveryService.js';

test('Morning Routine Schedule: returns default configuration with 08:00 AM enabled', () => {
  const sched = getRoutineSchedule();
  assert.strictEqual(sched.enabled, true);
  assert.strictEqual(sched.time, '08:00');
  assert.strictEqual(sched.autoPlayVideo, true);
  assert.strictEqual(sched.autoSpeak, true);
});

test('Morning Routine Schedule: saves and merges custom configuration', () => {
  const updated = saveRoutineSchedule({ time: '07:30', autoSendWebhook: false });
  assert.strictEqual(updated.time, '07:30');
  assert.strictEqual(updated.autoSendWebhook, false);
  assert.strictEqual(updated.autoPlayVideo, true); // preserved
});

test('Morning Routine Schedule: evaluateRoutineScheduleTrigger triggers at or after scheduled time', () => {
  // Reset run date
  const mockNowEarly = new Date('2026-11-09T07:15:00');
  const triggerEarly = evaluateRoutineScheduleTrigger(mockNowEarly, { enabled: true, time: '08:00' });
  assert.strictEqual(triggerEarly, false, 'Should not trigger before 08:00');

  const mockNowAtTime = new Date('2026-11-09T08:00:00');
  const triggerAtTime = evaluateRoutineScheduleTrigger(mockNowAtTime, { enabled: true, time: '08:00' });
  assert.strictEqual(triggerAtTime, true, 'Should trigger at 08:00');

  const mockNowPastTime = new Date('2026-11-09T08:15:00');
  const triggerPast = evaluateRoutineScheduleTrigger(mockNowPastTime, { enabled: true, time: '08:00' });
  assert.strictEqual(triggerPast, true, 'Should trigger past 08:00');

  // Mark as run
  markRoutineRunDate(mockNowPastTime);
  const triggerAgain = evaluateRoutineScheduleTrigger(mockNowPastTime, { enabled: true, time: '08:00' });
  assert.strictEqual(triggerAgain, false, 'Should not re-trigger once marked as run on the same day');
});

test('Webhook Delivery Service: returns default configuration with Telegram enabled', () => {
  const config = getWebhookConfig();
  assert.strictEqual(config.telegramEnabled, true);
  assert.strictEqual(typeof config.telegramBotToken, 'string');
});

test('Webhook Delivery Service: saves and merges configuration', () => {
  const saved = saveWebhookConfig({
    telegramBotToken: 'mock_token_123',
    telegramChatId: 'chat_456',
    lineEnabled: true,
  });
  assert.strictEqual(saved.telegramBotToken, 'mock_token_123');
  assert.strictEqual(saved.telegramChatId, 'chat_456');
  assert.strictEqual(saved.lineEnabled, true);
});

test('Webhook Delivery Service: sendTelegramBriefing handles simulation gracefully', async () => {
  const res = await sendTelegramBriefing({
    text: 'Test Briefing Text',
    botToken: '',
    chatId: '',
    mockDeliver: true,
  });
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.channel, 'telegram');
  assert.strictEqual(res.simulated, true);
});

test('Webhook Delivery Service: sendLineBriefing handles simulation gracefully', async () => {
  const res = await sendLineBriefing({
    text: 'Test LINE Text',
    accessToken: '',
    userId: '',
    mockDeliver: true,
  });
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.channel, 'line');
  assert.strictEqual(res.simulated, true);
});

test('Webhook Delivery Service: sendCustomWebhook handles simulation gracefully', async () => {
  const res = await sendCustomWebhook({
    url: 'https://example.com/webhook',
    payload: { test: 1 },
    mockDeliver: true,
  });
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.channel, 'custom_webhook');
  assert.strictEqual(res.simulated, true);
});

test('Webhook Delivery Service: dispatchExecutiveBriefing sends across enabled channels in simulation', async () => {
  const res = await dispatchExecutiveBriefing({
    notificationText: 'J.A.R.V.I.S. Morning Briefing to sir ไลท์',
    overrideConfig: {
      telegramEnabled: true,
      telegramBotToken: '',
      telegramChatId: '',
      lineEnabled: true,
      lineChannelAccessToken: '',
      lineUserId: '',
      customWebhookEnabled: false,
    },
    forceMock: true,
  });

  assert.strictEqual(res.success, true);
  assert.strictEqual(res.deliveredCount, 2);
  assert.strictEqual(res.results.length, 2);
  assert.strictEqual(res.results[0].channel, 'telegram');
  assert.strictEqual(res.results[1].channel, 'line');
});

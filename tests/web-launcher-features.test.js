import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectWorkModePreset,
  launchWorkModePreset,
  isSplitScreenWebCommand,
  extractWebTarget,
} from '../src/services/browserLauncherService.js';
import {
  isAutoSummaryCommand,
  generateAutoSummaryReader,
} from '../src/services/externalWebService.js';

test('Feature 3: One-Voice Multi-Tab Launcher - detects and launches work mode presets', () => {
  // 1. Detect presets
  const morning = detectWorkModePreset('เปิดโหมดทำงานยามเช้าหน่อย');
  assert.ok(morning, 'Morning preset not detected');
  assert.equal(morning.id, 'morning');
  assert.equal(morning.tabs.length, 3);
  assert.ok(morning.tabs.some((t) => t.url.includes('mail.google.com')));

  const dev = detectWorkModePreset('เปิดโหมดเขียนโค้ด');
  assert.ok(dev, 'Dev preset not detected');
  assert.equal(dev.id, 'dev');
  assert.ok(dev.tabs.some((t) => t.url.includes('chatgpt.com')));

  const sales = detectWorkModePreset('เปิดโหมดการตลาด');
  assert.ok(sales, 'Sales preset not detected');
  assert.equal(sales.id, 'sales');

  const relax = detectWorkModePreset('เปิดโหมดพักผ่อน');
  assert.ok(relax, 'Relax preset not detected');
  assert.equal(relax.id, 'relax');

  // 2. Launch simulation
  const launched = launchWorkModePreset(morning);
  assert.equal(launched.length, 3);
});

test('Feature 2: Auto-Summary Web Reader - detects command and formats 3 executive bullet points', async () => {
  assert.ok(isAutoSummaryCommand('ช่วยสรุปเนื้อหาเว็บนี้ให้หน่อย'));
  assert.ok(isAutoSummaryCommand('เปิดและสรุป ราคาน้ำมัน'));
  assert.ok(isAutoSummaryCommand('อ่านสรุป 3บรรทัด'));
  assert.ok(!isAutoSummaryCommand('สวัสดีครับ'));

  const summary = await generateAutoSummaryReader('สรุปข่าว ราคาทองคำวันนี้', 'คุณไลท์');
  assert.ok(summary.success);
  assert.equal(summary.bullets.length, 3, 'Must produce exactly 3 bullet points');
  assert.ok(summary.speech.includes('สรุปประเด็นสำคัญ 3 ข้อ'));
  assert.ok(summary.reply.includes('Auto-Summary Web Reader'));
});

test('Feature 1: Split-Screen Web HUD - detects in-HUD embedded viewing commands', () => {
  assert.ok(isSplitScreenWebCommand('เปิดเว็บในจอ หน่อย'));
  assert.ok(isSplitScreenWebCommand('ดูเว็บในจอ'));
  assert.ok(isSplitScreenWebCommand('พรีวิวเว็บ google.com ในจอ'));
  assert.ok(isSplitScreenWebCommand('เปิดแบบ split-screen'));
  assert.ok(!isSplitScreenWebCommand('เปิดยูทูป'));

  const target = extractWebTarget('เปิดเว็บในจอ bbc.com');
  assert.ok(target);
  assert.ok(target.url.includes('bbc.com'));
});

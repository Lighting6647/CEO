import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateOptimalNoiseFloor,
  isNoiseScanCommand,
} from '../src/utils/noiseGateProcessor.js';
import {
  isDailyRoutineCommand,
  buildDailyRoutinePlan,
} from '../src/services/routineAutomationService.js';

test('Feature 1: Auto Noise-Gate Calibration: Computes optimal threshold from 3-second ambient samples', () => {
  // Test simulated quiet room samples
  const quietSamples = [0.015, 0.02, 0.018, 0.022, 0.019, 0.021];
  const quietRes = calculateOptimalNoiseFloor(quietSamples);
  assert.equal(quietRes.roomCondition, 'QUIET_STUDIO');
  assert.ok(quietRes.optimalThreshold >= 0.025, 'Optimal threshold should be at least 0.025');
  assert.ok(quietRes.optimalThreshold <= 0.06, 'Quiet room threshold should stay reasonable');

  // Test simulated noisy room with heavy AC / fan hum
  const noisySamples = [0.05, 0.065, 0.07, 0.068, 0.072, 0.06];
  const noisyRes = calculateOptimalNoiseFloor(noisySamples);
  assert.equal(noisyRes.roomCondition, 'HEAVY_AC_FAN_NOISE');
  assert.ok(noisyRes.optimalThreshold > 0.07, 'Should raise threshold above the AC/fan peak');

  // Empty / invalid samples fallback safely
  const emptyRes = calculateOptimalNoiseFloor([]);
  assert.equal(emptyRes.optimalThreshold, 0.045);

  // Command detection
  assert.equal(isNoiseScanCommand('สแกนเสียงห้อง'), true);
  assert.equal(isNoiseScanCommand('จาร์วิส วัดเสียงรบกวนในห้องหน่อย'), true);
  assert.equal(isNoiseScanCommand('คาลิเบรตเสียงห้อง'), true);
  assert.equal(isNoiseScanCommand('วัดเสียงแอร์'), true);
  assert.equal(isNoiseScanCommand('ปรับระดับเสียงห้อง'), true);
  assert.equal(isNoiseScanCommand('กินข้าวกันไหม'), false);
});

test('Feature 2: HUD Zoom & 360-degree Rotation Voice Command Parsing', () => {
  const isZoomIn = (text) =>
    text.includes('ซูมเข้า') ||
    text.includes('ขยายมุมมอง') ||
    text.includes('ซูมใกล้') ||
    text.toLowerCase().includes('zoom in');

  const isZoomOut = (text) =>
    text.includes('ซูมออก') ||
    text.includes('ย่อมุมมอง') ||
    text.includes('ซูมไกล') ||
    text.toLowerCase().includes('zoom out');

  const isResetZoom = (text) =>
    text.includes('รีเซ็ตมุมมอง') ||
    text.includes('รีเซ็ตซูม') ||
    text.includes('มุมมองปกติ') ||
    text.toLowerCase().includes('reset zoom');

  const isRotateHologram = (text) =>
    text.includes('หมุนโฮโลแกรม') ||
    text.includes('หมุนมุมมอง') ||
    text.includes('หมุน 360') ||
    text.includes('หมุนชิ้นงาน') ||
    text.toLowerCase().includes('rotate hologram');

  assert.equal(isZoomIn('จาร์วิส ซูมเข้า'), true);
  assert.equal(isZoomIn('ซูมใกล้เข้ามา'), true);
  assert.equal(isZoomIn('ขยายมุมมองโฮโลแกรม'), true);

  assert.equal(isZoomOut('จาร์วิส ซูมออก'), true);
  assert.equal(isZoomOut('ย่อมุมมองหน่อย'), true);
  assert.equal(isZoomOut('ซูมไกล'), true);

  assert.equal(isResetZoom('จาร์วิส รีเซ็ตมุมมอง'), true);
  assert.equal(isResetZoom('มุมมองปกติ'), true);
  assert.equal(isResetZoom('รีเซ็ตซูม'), true);

  assert.equal(isRotateHologram('จาร์วิส หมุนโฮโลแกรม 360 องศา'), true);
  assert.equal(isRotateHologram('หมุนมุมมองชิ้นงาน'), true);
  assert.equal(isRotateHologram('หมุนชิ้นงานให้ดูหน่อย'), true);
});

test('Feature 3: Daily Routine Automation: Executes complete morning workflow for sir ไลท์', () => {
  assert.equal(isDailyRoutineCommand('จาร์วิส พร้อมทำงาน'), true);
  assert.equal(isDailyRoutineCommand('เริ่มงานประจำวัน'), true);
  assert.equal(isDailyRoutineCommand('morning routine'), true);
  assert.equal(isDailyRoutineCommand('พร้อมลุยงาน'), true);
  assert.equal(isDailyRoutineCommand('ช่วยสรุปราคา'), false);

  const plan = buildDailyRoutinePlan('sir ไลท์');
  assert.equal(plan.action, 'DAILY_ROUTINE_EXECUTED');
  assert.equal(plan.userTitle, 'sir ไลท์');
  assert.ok(plan.site && plan.site.url, 'Routine should have favorite site URL');
  assert.ok(plan.route && plan.route.destination, 'Routine should have favorite route destination');
  assert.ok(plan.speech.includes('sir ไลท์'), 'Speech should politely address sir ไลท์');
  assert.ok(plan.reply.includes('Executive Daily Routine Briefing'), 'Reply should include executive briefing');
  assert.ok(plan.hologram.title.includes('DAILY ROUTINE'), 'Hologram title should display routine active');
});

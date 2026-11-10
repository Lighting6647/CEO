import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectWorkModePreset,
  launchWorkModePreset,
  isSplitScreenWebCommand,
  extractWebTarget,
  parseWebNavigationVoiceCommand,
  isWebReaderModeCommand,
  isDualPaneWebCommand,
  parseDualPaneTargets,
} from '../src/services/browserLauncherService.js';
import {
  isAutoSummaryCommand,
  generateAutoSummaryReader,
  isWebTranslateCommand,
  buildGoogleTranslateUrl,
  isWebSnapshotCommand,
  recordWebSnapshotToMem0,
  isSmartFormAutoFillCommand,
  getExecutiveFormProfile,
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

test('Feature 4: Voice Web Scroll & Navigation - detects scroll, zoom, and reload actions', () => {
  assert.equal(parseWebNavigationVoiceCommand('ช่วยเลื่อนลง หน่อย')?.action, 'scroll-down');
  assert.equal(parseWebNavigationVoiceCommand('เลื่อนจอขึ้น')?.action, 'scroll-up');
  assert.equal(parseWebNavigationVoiceCommand('เลื่อนไปบนสุด')?.action, 'scroll-top');
  assert.equal(parseWebNavigationVoiceCommand('เลื่อนไปล่างสุด')?.action, 'scroll-bottom');
  assert.equal(parseWebNavigationVoiceCommand('ขยายเต็มจอ')?.action, 'maximize');
  assert.equal(parseWebNavigationVoiceCommand('ย่อเว็บ')?.action, 'minimize');
  assert.equal(parseWebNavigationVoiceCommand('รีเฟรชเว็บ')?.action, 'reload');
  assert.equal(parseWebNavigationVoiceCommand('สวัสดีจาร์วิส'), null);
});

test('Feature 5: AdBlock & Reader Mode Injection - detects distraction-free reading commands', () => {
  assert.ok(isWebReaderModeCommand('เปิดโหมดอ่านสบายตา'));
  assert.ok(isWebReaderModeCommand('ตัดโฆษณา'));
  assert.ok(isWebReaderModeCommand('เปิดแอดบล็อก'));
  assert.ok(isWebReaderModeCommand('reader mode'));
  assert.ok(!isWebReaderModeCommand('เปิดยูทูป'));
});

test('Feature 6: Multi-Split Dual HUD - detects dual screen view & extracts dual targets', () => {
  assert.ok(isDualPaneWebCommand('เปิดจอคู่'));
  assert.ok(isDualPaneWebCommand('โหมดจอคู่'));
  assert.ok(isDualPaneWebCommand('แบ่งสองจอ'));
  assert.ok(!isDualPaneWebCommand('เปิดจอเดี่ยว'));

  const targets = parseDualPaneTargets('เปิดจอคู่ กราฟหุ้น กับ ข่าวเศรษฐกิจ');
  assert.ok(targets);
  assert.ok(targets.target1.url.includes('tradingview'));
  assert.ok(targets.target2.url.includes('thairath'));
});

test('Feature 7: Auto-Translate Web Page - generates valid Google Translate URLs and detects commands', () => {
  assert.ok(isWebTranslateCommand('แปลหน้าเว็บนี้เป็นไทย'));
  assert.ok(isWebTranslateCommand('แปลภาษา'));
  assert.ok(isWebTranslateCommand('แปลเว็บ'));
  assert.ok(!isWebTranslateCommand('เปิดยูทูป'));

  const translateUrl = buildGoogleTranslateUrl('https://www.bbc.com/news');
  assert.ok(translateUrl.includes('translate.google.com'));
  assert.ok(translateUrl.includes('tl=th'));
});

test('Feature 8: Web Snapshot & Mem0 Visual Bookmark - creates and persists structured snapshots', () => {
  assert.ok(isWebSnapshotCommand('แคปหน้าจอเว็บนี้'));
  assert.ok(isWebSnapshotCommand('บันทึกภาพเว็บ'));
  assert.ok(isWebSnapshotCommand('ถ่ายรูปเว็บ'));
  assert.ok(!isWebSnapshotCommand('สวัสดี'));

  const snap = recordWebSnapshotToMem0({ url: 'https://news.ycombinator.com', title: 'Hacker News' });
  assert.ok(snap.id.startsWith('snap_'));
  assert.equal(snap.category, 'web_snapshots');
  assert.ok(snap.tags.includes('visual_bookmark'));
});

test('Feature 9: Smart Form Auto-Filler - generates verified executive profile and parses commands', () => {
  assert.ok(isSmartFormAutoFillCommand('กรอกฟอร์มอัตโนมัติ'));
  assert.ok(isSmartFormAutoFillCommand('กรอกข้อมูล'));
  assert.ok(isSmartFormAutoFillCommand('auto fill'));
  assert.ok(!isSmartFormAutoFillCommand('ปิดหน้าต่าง'));

  const profile = getExecutiveFormProfile('คุณไลท์');
  assert.equal(profile.fullName, 'วิศวกร ไลท์ สตาร์ค');
  assert.equal(profile.email, 'lighting6647@gmail.com');
  assert.ok(profile.company.includes('CEO Master Platform'));
  assert.ok(profile.taxId);
});

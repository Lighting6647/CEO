import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateBriefingScript,
  drawBriefingCanvasFrame,
  exportRemotionBriefingCode,
  exportHyperFramesConfig,
  BRIEFING_THEMES,
  generateBriefingNotificationText,
  speakBriefingText,
} from '../src/services/videoBriefingService.js';

test('Video Briefing: generateBriefingScript produces 30-second timeline with 4 structured scenes', () => {
  const briefing = generateBriefingScript({
    userTitle: 'sir ไลท์',
    goldPrice: '44,250',
    btcPrice: '69,100',
    newsHeadlines: ['เปิดตัวเทคโนโลยี Quantum Computing ล่าสุด'],
    weather: '29°C / AQI 32',
  });

  assert.equal(briefing.durationSec, 30);
  assert.equal(briefing.userTitle, 'sir ไลท์');
  assert.equal(briefing.scenes.length, 4);

  // Scene 1: Intro & Founder Clearance (0-7s)
  const s1 = briefing.scenes[0];
  assert.equal(s1.startSec, 0);
  assert.equal(s1.endSec, 7);
  assert.ok(s1.subtitle.includes('sir ไลท์'));
  assert.ok(s1.speech.includes('sir ไลท์'));

  // Scene 2: Top News & Global Intelligence (7-15s)
  const s2 = briefing.scenes[1];
  assert.equal(s2.startSec, 7);
  assert.equal(s2.endSec, 15);
  assert.ok(s2.details.some((d) => d.val.includes('Quantum Computing')));

  // Scene 3: Market Telemetry & Commodities (15-23s)
  const s3 = briefing.scenes[2];
  assert.equal(s3.startSec, 15);
  assert.equal(s3.endSec, 23);
  assert.ok(s3.details.some((d) => d.val.includes('44,250')));
  assert.ok(s3.details.some((d) => d.val.includes('69,100')));

  // Scene 4: Executive Readiness (23-30s)
  const s4 = briefing.scenes[3];
  assert.equal(s4.startSec, 23);
  assert.equal(s4.endSec, 30);
  assert.ok(s4.details.some((d) => d.val.includes('D:\\Light')));
});

test('Video Briefing: drawBriefingCanvasFrame renders safely with mock canvas context', () => {
  const briefing = generateBriefingScript({ userTitle: 'sir ไลท์' });

  // Minimal mock canvas 2D context
  const mockCtx = {
    createRadialGradient: () => ({ addColorStop: () => {} }),
    createLinearGradient: () => ({ addColorStop: () => {} }),
    fillRect: () => {},
    strokeRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arc: () => {},
    stroke: () => {},
    fill: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    setLineDash: () => {},
    roundRect: () => {},
    fillText: () => {},
    measureText: (text) => ({ width: text.length * 7 }),
  };

  // Test across all 4 scene keyframes: 0s, 10s, 20s, 29.5s
  assert.doesNotThrow(() => {
    drawBriefingCanvasFrame(mockCtx, 1280, 720, 0, briefing);
    drawBriefingCanvasFrame(mockCtx, 1280, 720, 10, briefing);
    drawBriefingCanvasFrame(mockCtx, 1280, 720, 20, briefing);
    drawBriefingCanvasFrame(mockCtx, 1280, 720, 29.5, briefing);
  });
});

test('Video Briefing: exportRemotionBriefingCode produces valid Remotion React TypeScript component', () => {
  const briefing = generateBriefingScript({ userTitle: 'sir ไลท์' });
  const tsxCode = exportRemotionBriefingCode(briefing);

  assert.ok(typeof tsxCode === 'string');
  assert.ok(tsxCode.includes('import { Composition, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from \'remotion\';'));
  assert.ok(tsxCode.includes('export const Jarvis30sBriefingVideo'));
  assert.ok(tsxCode.includes('export const RemotionRoot'));
  assert.ok(tsxCode.includes('durationInFrames={900}'));
  assert.ok(tsxCode.includes('fps={30}'));
  assert.ok(tsxCode.includes('sir ไลท์'));
});

test('Video Briefing: exportHyperFramesConfig generates valid HeyGen HyperFrames timeline JSON', () => {
  const briefing = generateBriefingScript({ userTitle: 'sir ไลท์' });
  const jsonStr = exportHyperFramesConfig(briefing);
  const parsed = JSON.parse(jsonStr);

  assert.equal(parsed.name, 'JARVIS-30s-Daily-Briefing');
  assert.equal(parsed.fps, 30);
  assert.equal(parsed.durationSec, 30);
  assert.equal(parsed.totalFrames, 900);
  assert.equal(parsed.scenes.length, 4);
  assert.equal(parsed.engine.framework, 'HTML5_CANVAS_WEB_ANIMATION');
  assert.ok(parsed.engine.hook.includes('onHyperFramesTimeUpdate'));
});

test('Video Briefing: BRIEFING_THEMES has cyan, crimson, gold presets and renders safely on canvas', () => {
  assert.ok(BRIEFING_THEMES.cyan);
  assert.ok(BRIEFING_THEMES.crimson);
  assert.ok(BRIEFING_THEMES.gold);

  assert.equal(BRIEFING_THEMES.cyan.primary, '#00f0ff');
  assert.equal(BRIEFING_THEMES.crimson.primary, '#ef4444');
  assert.equal(BRIEFING_THEMES.gold.primary, '#f59e0b');

  const briefing = generateBriefingScript({ userTitle: 'sir ไลท์' });
  const mockCtx = {
    createRadialGradient: () => ({ addColorStop: () => {} }),
    createLinearGradient: () => ({ addColorStop: () => {} }),
    fillRect: () => {},
    strokeRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arc: () => {},
    stroke: () => {},
    fill: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    setLineDash: () => {},
    roundRect: () => {},
    fillText: () => {},
    measureText: (text) => ({ width: text.length * 7 }),
  };

  assert.doesNotThrow(() => {
    drawBriefingCanvasFrame(mockCtx, 1280, 720, 5, briefing, 'cyan');
    drawBriefingCanvasFrame(mockCtx, 1280, 720, 12, briefing, 'crimson');
    drawBriefingCanvasFrame(mockCtx, 1280, 720, 20, briefing, 'gold');
  });
});

test('Video Briefing: generateBriefingNotificationText formats executive Telegram/LINE message', () => {
  const briefing = generateBriefingScript({
    userTitle: 'sir ไลท์',
    goldPrice: '44,200',
    btcPrice: '68,450',
  });

  const notification = generateBriefingNotificationText(briefing);

  assert.ok(notification.includes('J.A.R.V.I.S. 30-SEC EXECUTIVE BRIEFING'));
  assert.ok(notification.includes('sir ไลท์'));
  assert.ok(notification.includes('44,200'));
  assert.ok(notification.includes('68,450'));
  assert.ok(notification.includes('Butler Summary'));
});

test('Video Briefing: speakBriefingText safely handles execution without throwing in non-browser env', () => {
  assert.doesNotThrow(() => {
    const res = speakBriefingText('สวัสดีครับ sir ไลท์ กำลังเริ่มต้นระบบ');
    assert.equal(res, null); // returns null in Node environment without window.speechSynthesis
  });
});



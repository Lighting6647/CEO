/**
 * J.A.R.V.I.S. 30-Second Daily Video Briefing Generator Service
 * Assembles live market intelligence, top news, and telemetry into an animated
 * motion graphic video with HUD aesthetics, kinetic typography, and synchronized Butler speech.
 */

export const BRIEFING_THEMES = {
  cyan: {
    id: 'cyan',
    name: 'Stark Cyan HUD',
    primary: '#00f0ff',
    secondary: '#06b6d4',
    accent: '#10b981',
    bgStart: '#091522',
    bgMid: '#030811',
    bgEnd: '#010408',
    gridColor: 'rgba(6, 182, 212, 0.06)',
    cardBg: 'rgba(8, 20, 36, 0.8)',
    cardBorder: 'rgba(6, 182, 212, 0.4)',
    headerTitle: 'J.A.R.V.I.S. MARK 3 // EXECUTIVE INTELLIGENCE',
    headerBadge: '#38bdf8',
    timeColor: '#34d399',
    waveGradient: ['rgba(0, 240, 255, 0.85)', 'rgba(52, 211, 153, 0.85)'],
  },
  crimson: {
    id: 'crimson',
    name: 'Ultron Crimson Red',
    primary: '#ef4444',
    secondary: '#dc2626',
    accent: '#f97316',
    bgStart: '#1e080b',
    bgMid: '#0e0305',
    bgEnd: '#050102',
    gridColor: 'rgba(239, 68, 68, 0.08)',
    cardBg: 'rgba(30, 8, 12, 0.85)',
    cardBorder: 'rgba(239, 68, 68, 0.45)',
    headerTitle: 'ULTRON PROTOCOL // AUTONOMOUS OVERRIDE',
    headerBadge: '#f87171',
    timeColor: '#fb923c',
    waveGradient: ['rgba(239, 68, 68, 0.85)', 'rgba(249, 115, 22, 0.85)'],
  },
  gold: {
    id: 'gold',
    name: 'Gold Luxury Investor',
    primary: '#f59e0b',
    secondary: '#d97706',
    accent: '#10b981',
    bgStart: '#1f1807',
    bgMid: '#0f0a02',
    bgEnd: '#060401',
    gridColor: 'rgba(245, 158, 11, 0.07)',
    cardBg: 'rgba(28, 20, 6, 0.85)',
    cardBorder: 'rgba(245, 158, 11, 0.4)',
    headerTitle: 'STARK INDUSTRIES // LUXURY PORTFOLIO INTELLIGENCE',
    headerBadge: '#fbbf24',
    timeColor: '#34d399',
    waveGradient: ['rgba(245, 158, 11, 0.85)', 'rgba(16, 185, 129, 0.85)'],
  },
};

/**
 * Generate structured 30-second briefing timeline and script
 */
export function generateBriefingScript({
  userTitle = 'sir ไลท์',
  goldPrice = '44,200',
  btcPrice = '68,450',
  newsHeadlines = [],
  weather = '28°C / PM2.5 AQI 36',
} = {}) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  const headlines = newsHeadlines.length > 0
    ? newsHeadlines.slice(0, 2)
    : [
        'เทคโนโลยีปัญญาประดิษฐ์ Multi-Agent และ Autonomous Cloud เติบโตต่อเนื่อง',
        'ตลาดการเงินโลกจับตาความเคลื่อนไหวราคาสินทรัพย์ปลอดภัยและพลังงาน',
      ];

  const scenes = [
    {
      id: 1,
      name: 'INTRO & FOUNDER AUTHENTICATION',
      startSec: 0,
      endSec: 7,
      badge: 'LEVEL 5 CLEARANCE // GRANTED',
      title: 'J.A.R.V.I.S. MORNING INTELLIGENCE',
      subtitle: `${userTitle} // FOUNDER & CEO`,
      details: [
        { label: 'วันที่และเวลา', val: `${dateStr} • ${timeStr}` },
        { label: 'ความปลอดภัยระบบ', val: 'Voice Biometrics Verified (99.8%)' },
        { label: 'ศูนย์บัญชาการ', val: '6 แผนก AI Synchronized' },
      ],
      speech: `สวัสดีครับ ${userTitle} รายงานสรุปสถานการณ์และดัชนีสำคัญประจำวันพร้อมแล้วครับ`,
    },
    {
      id: 2,
      name: 'GLOBAL NEWS & INTELLIGENCE',
      startSec: 7,
      endSec: 15,
      badge: 'TOP STORIES // VERIFIED SOURCES',
      title: 'ประเด็นข่าวเด่นและเทคโนโลยี',
      subtitle: 'DAILY EXTERNAL WEB TELEMETRY',
      details: headlines.map((h, i) => ({
        label: `ประเด็นที่ ${i + 1}`,
        val: h,
      })),
      speech: `ประเด็นข่าวเด่นวันนี้ มีความเคลื่อนไหวทางเทคโนโลยีและเศรษฐกิจที่น่าจับตามองครับ`,
    },
    {
      id: 3,
      name: 'MARKET TELEMETRY & COMMODITIES',
      startSec: 15,
      endSec: 23,
      badge: 'COMMODITIES & CRYPTO',
      title: 'ดัชนีราคาตลาดและสภาพแวดล้อม',
      subtitle: 'REAL-TIME SPOT TELEMETRY',
      details: [
        { label: 'ราคาทองคำแท่ง 96.5%', val: `฿${goldPrice} บาท/บาททอง` },
        { label: 'Bitcoin (Spot)', val: `$${btcPrice} USD` },
        { label: 'สภาพอากาศ & มลพิษ', val: weather },
      ],
      speech: `ราคาทองคำแท่งอยู่ที่ประมาณ ${goldPrice} บาท และบิทคอยน์เคลื่อนไหวที่ ${btcPrice} ดอลลาร์ครับ`,
    },
    {
      id: 4,
      name: 'EXECUTIVE DISPATCH & READINESS',
      startSec: 23,
      endSec: 30,
      badge: 'MISSION READY // 100%',
      title: 'ศูนย์บัญชาการพร้อมปฏิบัติหน้าที่',
      subtitle: 'STANDING BY FOR ORDERS',
      details: [
        { label: '15 โครงการในเครื่อง', val: 'D:\\Light พร้อมดีพลอย' },
        { label: 'ระบบป้องกันอัตโนมัติ', val: 'Shield Posture: Cyan Optimal' },
        { label: 'สถานะ Butler', val: 'Standby for Voice/Text Dispatch' },
      ],
      speech: `ทุกระบบออนไลน์พร้อมปฏิบัติหน้าที่ตามคำสั่งของ ${userTitle} เต็มพิกัดครับ`,
    },
  ];

  return {
    userTitle,
    dateStr,
    timeStr,
    durationSec: 30,
    scenes,
  };
}

/**
 * Draw a single frame of the 30-second motion graphic video onto an HTML5 Canvas
 */
export function drawBriefingCanvasFrame(ctx, width, height, currentSec, briefingData, themeKey = 'cyan') {
  const theme = BRIEFING_THEMES[themeKey] || BRIEFING_THEMES.cyan;
  const duration = briefingData.durationSec || 30;
  const progress = Math.min(Math.max(currentSec / duration, 0), 1);

  // Find active scene
  const activeScene =
    briefingData.scenes.find((s) => currentSec >= s.startSec && currentSec < s.endSec) ||
    briefingData.scenes[briefingData.scenes.length - 1];

  const sceneProgress = (currentSec - activeScene.startSec) / (activeScene.endSec - activeScene.startSec || 1);

  // 1. Dark Space / Sci-Fi Radial Background
  const grad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    50,
    width / 2,
    height / 2,
    width * 0.75
  );
  grad.addColorStop(0, theme.bgStart);
  grad.addColorStop(0.6, theme.bgMid);
  grad.addColorStop(1, theme.bgEnd);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle Cybernetic Grid Pattern
  ctx.strokeStyle = theme.gridColor;
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 3. Rotating Central Cybernetic Arc Reactor Ring (Motion Graphic)
  const centerX = width * 0.82;
  const centerY = height * 0.45;
  const rotAngle = currentSec * 0.8;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotAngle);

  // Outer segmented ring
  ctx.strokeStyle = `${theme.secondary}55`;
  ctx.lineWidth = 2;
  ctx.setLineDash([15, 8]);
  ctx.beginPath();
  ctx.arc(0, 0, 95, 0, Math.PI * 2);
  ctx.stroke();

  // Inner counter-rotating ring
  ctx.rotate(-rotAngle * 2);
  ctx.strokeStyle = `${theme.accent}66`;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([25, 12]);
  ctx.beginPath();
  ctx.arc(0, 0, 68, 0, Math.PI * 2);
  ctx.stroke();

  // Core glow
  ctx.setLineDash([]);
  const coreGlow = ctx.createRadialGradient(0, 0, 5, 0, 0, 45);
  coreGlow.addColorStop(0, theme.primary);
  coreGlow.addColorStop(0.5, `${theme.secondary}33`);
  coreGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = coreGlow;
  ctx.beginPath();
  ctx.arc(0, 0, 45, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // 4. Header Status Bar
  ctx.fillStyle = `${theme.secondary}22`;
  ctx.fillRect(0, 0, width, 45);
  ctx.strokeStyle = `${theme.secondary}44`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 45);
  ctx.lineTo(width, 45);
  ctx.stroke();

  // Header Title & REC Indicator
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(35, 22, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = '#f87171';
  ctx.fillText('REC ● 30-SEC BRIEFING', 50, 26);

  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = theme.headerBadge;
  ctx.fillText(theme.headerTitle, 240, 26);

  // Time & Clearance tag
  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = theme.timeColor;
  const timeLabel = `CLEARANCE: LEVEL 5 SUPREME • ${briefingData.timeStr}`;
  ctx.fillText(timeLabel, width - ctx.measureText(timeLabel).width - 30, 26);

  // 5. Active Scene Card Presentation (Kinetic Animation)
  const cardX = 40;
  const cardY = 75;
  const cardW = width * 0.62;
  const cardH = height - 190;

  // Fade-in slide effect per scene
  const sceneAlpha = Math.min(sceneProgress * 3, 1);
  ctx.save();
  ctx.globalAlpha = sceneAlpha;

  // Glass card backdrop
  ctx.fillStyle = theme.cardBg;
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 12);
  ctx.fill();
  ctx.stroke();

  // Corner tech ticks
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cardX, cardY + 15);
  ctx.lineTo(cardX, cardY);
  ctx.lineTo(cardX + 15, cardY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cardX + cardW - 15, cardY);
  ctx.lineTo(cardX + cardW, cardY);
  ctx.lineTo(cardX + cardW, cardY + 15);
  ctx.stroke();

  // Scene Badge & Step
  ctx.fillStyle = `${theme.secondary}26`;
  ctx.strokeStyle = `${theme.secondary}66`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(cardX + 20, cardY + 18, 260, 24, 6);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 11px monospace';
  ctx.fillStyle = theme.primary;
  ctx.fillText(`SCENE ${activeScene.id}/4: ${activeScene.badge}`, cardX + 30, cardY + 34);

  // Main Scene Title
  ctx.font = 'bold 24px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(activeScene.title, cardX + 20, cardY + 75);

  ctx.font = '13px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(activeScene.subtitle, cardX + 22, cardY + 98);

  // Details Items List
  let itemY = cardY + 130;
  for (let i = 0; i < activeScene.details.length; i++) {
    const item = activeScene.details[i];

    ctx.fillStyle = 'rgba(15, 28, 48, 0.7)';
    ctx.strokeStyle = `${theme.secondary}33`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cardX + 20, itemY, cardW - 40, 48, 8);
    ctx.fill();
    ctx.stroke();

    // Primary Colored Bullet
    ctx.fillStyle = theme.primary;
    ctx.beginPath();
    ctx.arc(cardX + 36, itemY + 24, 4, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.font = '11px monospace';
    ctx.fillStyle = theme.headerBadge;
    ctx.fillText(item.label, cardX + 50, itemY + 20);

    // Value
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#f1f5f9';
    ctx.fillText(item.val, cardX + 50, itemY + 38);

    itemY += 58;
  }

  // Voice Narration Subtitle at bottom of card
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.beginPath();
  ctx.roundRect(cardX + 20, cardY + cardH - 50, cardW - 40, 36, 6);
  ctx.fill();

  ctx.font = 'italic 12px sans-serif';
  ctx.fillStyle = theme.timeColor;
  ctx.fillText(`🎙️ J.A.R.V.I.S.: "${activeScene.speech}"`, cardX + 32, cardY + cardH - 28);

  ctx.restore();

  // 6. Kinetic Audio Waveform Bars (Bottom Right)
  const waveX = width * 0.72;
  const waveY = height - 120;
  const numBars = 16;
  for (let i = 0; i < numBars; i++) {
    const barHeight = 10 + Math.sin(currentSec * 6 + i * 0.8) * 25 + Math.cos(currentSec * 4 + i) * 15;
    const barX = waveX + i * 11;
    ctx.fillStyle = i % 2 === 0 ? theme.waveGradient[0] : theme.waveGradient[1];
    ctx.fillRect(barX, waveY - barHeight / 2, 6, barHeight);
  }

  // 7. Bottom Progress Timeline (30 Seconds Scrubber)
  const barY = height - 35;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(0, barY - 15, width, 50);

  // Track
  ctx.fillStyle = 'rgba(51, 65, 85, 0.6)';
  ctx.fillRect(40, barY, width - 80, 8);

  // Active Progress Glow Bar
  const fillWidth = (width - 80) * progress;
  const barGrad = ctx.createLinearGradient(40, barY, 40 + fillWidth, barY);
  barGrad.addColorStop(0, theme.secondary);
  barGrad.addColorStop(0.5, theme.primary);
  barGrad.addColorStop(1, theme.accent);
  ctx.fillStyle = barGrad;
  ctx.fillRect(40, barY, fillWidth, 8);

  // Progress Scrubber Head
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(40 + fillWidth, barY + 4, 7, 0, Math.PI * 2);
  ctx.fill();

  // Time labels
  ctx.font = 'bold 11px monospace';
  ctx.fillStyle = theme.headerBadge;
  const curMins = Math.floor(currentSec / 60);
  const curSecs = Math.floor(currentSec % 60);
  const timeFormatted = `${String(curMins).padStart(2, '0')}:${String(curSecs).padStart(2, '0')} / 00:30`;
  ctx.fillText(timeFormatted, 40, barY - 5);

  ctx.fillStyle = '#64748b';
  ctx.fillText('DISPATCHED BY J.A.R.V.I.S. AUTONOMOUS MEDIA CORE', width - 360, barY - 5);
}

/**
 * Record a full 30-second WebM/MP4 video from the briefing canvas in real-time
 */
export async function recordBriefingVideo(canvas, briefingData, { onProgress = null, fps = 30, theme = 'cyan' } = {}) {
  if (typeof window === 'undefined' || !canvas) {
    throw new Error('Canvas recording requires a browser environment');
  }

  const durationSec = briefingData.durationSec || 30;
  const totalFrames = durationSec * fps;
  const stream = canvas.captureStream(fps);

  // Set up Web Audio ambient tone generator for high-tech soundtrack
  let audioContext = null;
  let audioDest = null;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioContext = new AudioContextClass();
      audioDest = audioContext.createMediaStreamDestination();

      // Subtle ambient carrier frequency (55Hz drone + 432Hz harmonic)
      const osc1 = audioContext.createOscillator();
      const osc2 = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(55, audioContext.currentTime);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(110, audioContext.currentTime);

      gain.gain.setValueAtTime(0.04, audioContext.currentTime);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioDest);

      osc1.start();
      osc2.start();

      const audioTrack = audioDest.stream.getAudioTracks()[0];
      if (audioTrack) {
        stream.addTrack(audioTrack);
      }
    }
  } catch (err) {
    console.warn('[Audio Stream Synthesizer]:', err.message);
  }

  // Pick supported MIME type
  let mimeType = 'video/webm;codecs=vp9';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm;codecs=vp8';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }
  }

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 2500000,
  });

  const chunks = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  const recordingPromise = new Promise((resolve, reject) => {
    recorder.onstop = () => {
      try {
        const blob = new Blob(chunks, { type: mimeType });
        const videoUrl = URL.createObjectURL(blob);
        if (audioContext) {
          audioContext.close().catch(() => {});
        }
        resolve({
          blob,
          url: videoUrl,
          durationSec,
          filename: `JARVIS-30s-Daily-Briefing-${new Date().toISOString().slice(0, 10)}.webm`,
        });
      } catch (err) {
        reject(err);
      }
    };
    recorder.onerror = (err) => reject(err);
  });

  recorder.start();

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // Render loop for 30 seconds
  const frameIntervalMs = 1000 / fps;
  let frameCount = 0;

  await new Promise((resolve) => {
    const interval = setInterval(() => {
      const currentSec = frameCount / fps;
      drawBriefingCanvasFrame(ctx, width, height, currentSec, briefingData, theme);

      frameCount++;
      const percent = Math.min(Math.round((frameCount / totalFrames) * 100), 100);
      if (onProgress) {
        onProgress({ frame: frameCount, totalFrames, percent, currentSec });
      }

      if (frameCount >= totalFrames) {
        clearInterval(interval);
        setTimeout(() => {
          if (recorder.state === 'recording') {
            recorder.stop();
          }
          resolve();
        }, 100);
      }
    }, frameIntervalMs);
  });

  return recordingPromise;
}

/**
 * Trigger immediate browser download of the recorded briefing video
 */
export function downloadBriefingVideo(blob, filename = 'JARVIS-30s-Daily-Briefing.webm') {
  if (typeof window === 'undefined' || !blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download arbitrary text/code file (Remotion TSX, HyperFrames JSON)
 */
export function downloadTextAsset(content, filename, mimeType = 'text/plain') {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate production-ready Remotion React + TypeScript Video Composition Component
 * Supports Remotion CLI (npx remotion render) and @remotion/player
 */
export function exportRemotionBriefingCode(briefingData) {
  const scenesJson = JSON.stringify(briefingData.scenes, null, 2);
  return `import React from 'react';
import { Composition, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// J.A.R.V.I.S. Mark 3 // 30-Second Executive Video Briefing for ${briefingData.userTitle}
// Generated for Remotion Engine (1920x1080 @ 30 FPS, 900 Frames)

export const BRIEFING_DATA = ${scenesJson};

export const BriefingScene: React.FC<{
  scene: (typeof BRIEFING_DATA)[0];
  index: number;
}> = ({ scene, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 100 },
  });

  const cardOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const cardScale = interpolate(entrance, [0, 1], [0.94, 1]);
  const ringRotation = frame * 1.5;

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: 'radial-gradient(circle at 50% 50%, #091522 0%, #030811 60%, #010408 100%)',
        color: '#f8fafc',
        fontFamily: 'monospace',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '60px 80px',
        boxSizing: 'border-box',
      }}
    >
      {/* Central Rotating Arc Reactor Hologram */}
      <div
        style={{
          position: 'absolute',
          right: 180,
          top: '50%',
          transform: \`translateY(-50%) rotate(\${ringRotation}deg)\`,
          width: 320,
          height: 320,
          borderRadius: '50%',
          border: '3px dashed rgba(6, 182, 212, 0.4)',
          boxShadow: '0 0 60px rgba(6, 182, 212, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 180,
            height: 180,
            borderRadius: '50%',
            border: '2px solid rgba(16, 185, 129, 0.5)',
            boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)',
          }}
        />
      </div>

      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(6, 182, 212, 0.3)',
          paddingBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#ef4444' }} />
          <span style={{ color: '#38bdf8', fontSize: 24, fontWeight: 'bold' }}>
            J.A.R.V.I.S. INTELLIGENCE // 30-SEC BRIEFING
          </span>
        </div>
        <span style={{ color: '#34d399', fontSize: 20 }}>
          {scene.badge} • SCENE {index + 1}/4
        </span>
      </div>

      {/* Main Glass Card */}
      <div
        style={{
          opacity: cardOpacity,
          transform: \`scale(\${cardScale})\`,
          background: 'rgba(8, 20, 36, 0.85)',
          border: '2px solid rgba(6, 182, 212, 0.5)',
          borderRadius: 24,
          padding: 48,
          maxWidth: 1100,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(6, 182, 212, 0.2)',
        }}
      >
        <div style={{ color: '#38bdf8', fontSize: 20, textTransform: 'uppercase', marginBottom: 8 }}>
          {scene.subtitle}
        </div>
        <h1 style={{ color: '#ffffff', fontSize: 44, margin: '0 0 32px 0', fontWeight: 900 }}>
          {scene.title}
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {scene.details.map((item: any, i: number) => (
            <div
              key={i}
              style={{
                background: 'rgba(2, 6, 23, 0.7)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                borderRadius: 16,
                padding: '16px 24px',
              }}
            >
              <div style={{ color: '#94a3b8', fontSize: 16, marginBottom: 6 }}>{item.label}</div>
              <div style={{ color: '#38bdf8', fontSize: 22, fontWeight: 'bold' }}>{item.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Subtitle / Speech */}
      <div
        style={{
          background: 'rgba(2, 6, 23, 0.9)',
          borderTop: '2px solid rgba(6, 182, 212, 0.4)',
          borderRadius: 16,
          padding: '20px 32px',
          color: '#e2e8f0',
          fontSize: 22,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <span style={{ color: '#34d399', fontWeight: 'bold' }}>🎙️ BUTLER:</span>
        <span>{scene.speech}</span>
      </div>
    </div>
  );
};

export const Jarvis30sBriefingVideo: React.FC = () => {
  const fps = 30;

  return (
    <div>
      {BRIEFING_DATA.map((scene, i) => {
        const fromFrame = scene.startSec * fps;
        const durationInFrames = (scene.endSec - scene.startSec) * fps;
        return (
          <Sequence key={scene.id} from={fromFrame} durationInFrames={durationInFrames}>
            <BriefingScene scene={scene} index={i} />
          </Sequence>
        );
      })}
    </div>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Jarvis30sBriefing"
      component={Jarvis30sBriefingVideo}
      durationInFrames={900}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};

export default RemotionRoot;
`;
}

/**
 * Generate HeyGen HyperFrames Programmatic Video Spec
 * Deterministic HTML/CSS/JS Composition with onHyperFramesTimeUpdate
 */
export function exportHyperFramesConfig(briefingData) {
  const hyperConfig = {
    $schema: 'https://hyperframes.dev/schema/v1.json',
    name: 'JARVIS-30s-Daily-Briefing',
    version: '1.0.0',
    dimensions: {
      width: 1920,
      height: 1080,
    },
    fps: 30,
    durationSec: 30,
    totalFrames: 900,
    userTitle: briefingData.userTitle,
    scenes: briefingData.scenes.map((s) => ({
      id: s.id,
      name: s.name,
      startSec: s.startSec,
      endSec: s.endSec,
      badge: s.badge,
      title: s.title,
      subtitle: s.subtitle,
      details: s.details,
      speech: s.speech,
    })),
    engine: {
      framework: 'HTML5_CANVAS_WEB_ANIMATION',
      hook: 'window.onHyperFramesTimeUpdate(timeInSeconds)',
      renderCommand: 'npx hyperframes render --input hyperframes.config.json --output briefing.mp4',
    },
  };

  return JSON.stringify(hyperConfig, null, 2);
}

/**
 * Synthesize and speak Butler speech for real-time briefing preview
 */
export function speakBriefingText(text, { userTitle: _userTitle = 'คุณไลท์', onStart = null, onEnd = null } = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  try {
    window.speechSynthesis.cancel();
  } catch {}

  const naturalSpeech = (text || '')
    .replace(/[*#•_`~[\]\\/]/g, ' ')
    .replace(/\bsir\s*ไลท์\b/gi, 'เซอร์ไลท์')
    .replace(/\bsirlike\b/gi, 'เซอร์ไลท์')
    .replace(/\bJ\.?A\.?R\.?V\.?I\.?S\.?\b/gi, 'จาร์วิส')
    .replace(/\bAI\b/g, 'เอไอ')
    .replace(/\bAPI\b/g, 'เอพีไอ')
    .trim();

  if (!naturalSpeech) return null;

  const utterance = new SpeechSynthesisUtterance(naturalSpeech);
  utterance.lang = 'th-TH';
  utterance.pitch = 0.86;
  utterance.rate = 0.94;

  const voices = window.speechSynthesis.getVoices() || [];
  const thaiVoice =
    voices.find((v) => v.lang === 'th-TH' || v.lang === 'th_TH' || v.name.toLowerCase().includes('thai')) ||
    voices.find((v) => v.lang.startsWith('th')) ||
    null;

  if (thaiVoice) {
    utterance.voice = thaiVoice;
  }

  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;
  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);

  return {
    stop: () => {
      try {
        window.speechSynthesis.cancel();
      } catch {}
      if (onEnd) onEnd();
    },
  };
}

/**
 * Format executive daily summary message ready for Telegram / LINE webhook or copy
 */
export function generateBriefingNotificationText(briefingData) {
  const scenes = briefingData.scenes || [];
  const scene1 = scenes[0] || {};
  const scene2 = scenes[1] || {};
  const scene3 = scenes[2] || {};
  const scene4 = scenes[3] || {};

  return `⚡ *J.A.R.V.I.S. 30-SEC EXECUTIVE BRIEFING* ⚡
📅 *วันและเวลา:* ${briefingData.dateStr || ''} • ${briefingData.timeStr || ''}
👑 *ผู้รับรายงาน:* ${briefingData.userTitle || 'sir ไลท์'} (Level 5 Clearance)

📰 *1. ประเด็นข่าวเด่นและเทคโนโลยี:*
${(scene2.details || []).map((d) => `• *${d.label}:* ${d.val}`).join('\n')}

📈 *2. ดัชนีราคาตลาดและสภาพแวดล้อม:*
${(scene3.details || []).map((d) => `• *${d.label}:* ${d.val}`).join('\n')}

🛡️ *3. ความพร้อมของศูนย์บัญชาการ:*
${(scene4.details || []).map((d) => `• *${d.label}:* ${d.val}`).join('\n')}

🎙️ *Butler Summary:*
"${scene1.speech || ''} ${scene4.speech || ''}"

_Generated automatically by J.A.R.V.I.S. MARK 3 Autonomous Media Core_`;
}



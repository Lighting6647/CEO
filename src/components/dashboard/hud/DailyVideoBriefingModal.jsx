import { useState, useRef, useEffect, useCallback } from 'react';
import {
  generateBriefingScript,
  drawBriefingCanvasFrame,
  recordBriefingVideo,
  downloadBriefingVideo,
  exportRemotionBriefingCode,
  exportHyperFramesConfig,
  downloadTextAsset,
  BRIEFING_THEMES,
  speakBriefingText,
  generateBriefingNotificationText,
} from '../../../services/videoBriefingService.js';
import { saveExternalWebToMem0 } from '../../../services/externalWebService.js';
import {
  getWebhookConfig,
  saveWebhookConfig,
  dispatchExecutiveBriefing,
} from '../../../services/webhookDeliveryService.js';
import {
  getRoutineSchedule,
  saveRoutineSchedule,
} from '../../../services/routineAutomationService.js';
import {
  X,
  Play,
  Pause,
  Download,
  Pin,
  Film,
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle,
  Clock,
  RotateCcw,
  Edit3,
  Sliders,
  Layers,
  Mic,
  Activity,
  Undo2,
  MessageSquare,
  Smartphone,
  Send,
} from 'lucide-react';
import { playClickSound, playSciFiBeep } from '../../../utils/soundEffects.js';

export function DailyVideoBriefingModal({
  isOpen,
  onClose,
  userTitle = 'sir ไลท์',
  goldPrice = '44,200',
  btcPrice = '68,450',
  newsHeadlines = [],
  weather = '28°C / PM2.5 AQI 36',
  onPinMemory = null,
}) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const timelineBarRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSec, setCurrentSec] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderedVideo, setRenderedVideo] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isMem0Saved, setIsMem0Saved] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Tab mode: 'multitrack' | 'editor' | 'grid'
  const [activeTab, setActiveTab] = useState('multitrack');
  const [selectedSceneId, setSelectedSceneId] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState('cyan');
  const [isAuditioningVoice, setIsAuditioningVoice] = useState(false);
  const voiceAuditionRef = useRef(null);

  // Webhook Delivery & Routine Schedule State
  const [webhookConfig, setWebhookConfig] = useState(() => getWebhookConfig());
  const [routineSchedule, setRoutineSchedule] = useState(() => getRoutineSchedule());
  const [isDispatchingWebhook, setIsDispatchingWebhook] = useState(false);
  const [webhookResults, setWebhookResults] = useState(null);

  // Dynamic editable briefing dataset
  const [briefingData, setBriefingData] = useState(() =>
    generateBriefingScript({
      userTitle,
      goldPrice,
      btcPrice,
      newsHeadlines,
      weather,
    })
  );

  // Render canvas frame on playback or seek
  const renderCurrentFrame = useCallback(
    (sec, dataOverride = null, themeOverride = null) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const data = dataOverride || briefingData;
      const theme = themeOverride || selectedTheme;
      drawBriefingCanvasFrame(ctx, canvas.width, canvas.height, sec, data, theme);
    },
    [briefingData, selectedTheme]
  );

  // Initial draw & reset when modal opens or primary props change
  useEffect(() => {
    if (isOpen) {
      setCurrentSec(0);
      setIsPlaying(false);
      const initial = generateBriefingScript({
        userTitle,
        goldPrice,
        btcPrice,
        newsHeadlines,
        weather,
      });
      setBriefingData(initial);
      setTimeout(() => renderCurrentFrame(0, initial), 60);
    }
  }, [isOpen, userTitle, goldPrice, btcPrice, newsHeadlines, weather, renderCurrentFrame]);

  // Playback timer loop
  useEffect(() => {
    if (!isOpen) return;

    if (isPlaying) {
      const startTime = performance.now() - currentSec * 1000;
      const loop = (now) => {
        const elapsed = (now - startTime) / 1000;
        if (elapsed >= 30) {
          setCurrentSec(30);
          setIsPlaying(false);
          renderCurrentFrame(30);
          return;
        }
        setCurrentSec(elapsed);
        renderCurrentFrame(elapsed);
        animFrameRef.current = requestAnimationFrame(loop);
      };
      animFrameRef.current = requestAnimationFrame(loop);
    } else {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, isOpen, currentSec, renderCurrentFrame]);

  // Handle Play / Pause Toggle
  const togglePlay = () => {
    playClickSound();
    if (currentSec >= 30) {
      setCurrentSec(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Handle Reset to 00:00
  const handleReset = () => {
    playClickSound();
    setIsPlaying(false);
    setCurrentSec(0);
    renderCurrentFrame(0);
  };

  // Handle timeline scrub by clicking
  const handleTimelineScrub = (e) => {
    if (!timelineBarRef.current) return;
    const rect = timelineBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    const newSec = percent * 30;
    playClickSound();
    setCurrentSec(newSec);
    renderCurrentFrame(newSec);
  };

  // Jump directly to a scene start
  const handleJumpToScene = (scene) => {
    playClickSound();
    setIsPlaying(false);
    setCurrentSec(scene.startSec);
    setSelectedSceneId(scene.id);
    renderCurrentFrame(scene.startSec);
  };

  // Handle Real-time Scene Content Editing
  const handleUpdateSceneField = (sceneId, field, value) => {
    setBriefingData((prev) => {
      const updatedScenes = prev.scenes.map((s) => {
        if (s.id === sceneId) {
          return { ...s, [field]: value };
        }
        return s;
      });
      const next = { ...prev, scenes: updatedScenes };
      // Instant canvas redraw
      requestAnimationFrame(() => {
        renderCurrentFrame(currentSec, next);
      });
      return next;
    });
  };

  // Restore a scene to default text
  const handleResetScene = (sceneId) => {
    playClickSound();
    const defaultData = generateBriefingScript({
      userTitle,
      goldPrice,
      btcPrice,
      newsHeadlines,
      weather,
    });
    const defaultScene = defaultData.scenes.find((s) => s.id === sceneId);
    if (!defaultScene) return;

    setBriefingData((prev) => {
      const updatedScenes = prev.scenes.map((s) => (s.id === sceneId ? defaultScene : s));
      const next = { ...prev, scenes: updatedScenes };
      requestAnimationFrame(() => {
        renderCurrentFrame(currentSec, next);
      });
      return next;
    });
    setToastMessage(`คืนค่าฉากที่ ${sceneId} เป็นข้อความมาตรฐานเรียบร้อย!`);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Handle Render Video Recording (Real MediaRecorder)
  const handleStartRender = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    playSciFiBeep();
    setIsPlaying(false);
    setIsRendering(true);
    setRenderProgress(0);

    try {
      const videoResult = await recordBriefingVideo(canvas, briefingData, {
        fps: 30,
        theme: selectedTheme,
        onProgress: ({ percent, currentSec: sec }) => {
          setRenderProgress(percent);
          setCurrentSec(sec);
        },
      });

      setRenderedVideo(videoResult);
      setIsRendering(false);
      setToastMessage('เรนเดอร์วิดีโอ 30 วินาทีสำเร็จเรียบร้อยครับ!');
      setTimeout(() => setToastMessage(''), 4000);
      playSciFiBeep();
    } catch (err) {
      console.error('[Render Briefing Video Error]:', err);
      setIsRendering(false);
      setToastMessage('เกิดข้อผิดพลาดในการบันทึกวิดีโอ');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  // Handle Video Download
  const handleDownload = () => {
    playClickSound();
    if (renderedVideo?.blob) {
      downloadBriefingVideo(renderedVideo.blob, renderedVideo.filename);
      setToastMessage(`ดาวน์โหลด ${renderedVideo.filename} เรียบร้อย!`);
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  // Handle Save to Mem0
  const handleSaveToMem0 = () => {
    playSciFiBeep();
    const saveRes = saveExternalWebToMem0({
      query: 'J.A.R.V.I.S. 30-Sec Daily Video Briefing',
      title: `30-Sec Daily Video Briefing (${briefingData.dateStr})`,
      url: renderedVideo?.url || 'jarvis://briefing/video',
      summary: `สรุปข่าวสาร ราคาทอง (฿${goldPrice}) Bitcoin ($${btcPrice}) และความพร้อมของระบบสำหรับ ${userTitle}`,
      domain: 'jarvis-video-core',
    });

    if (saveRes.success) {
      setIsMem0Saved(true);
      if (onPinMemory) {
        onPinMemory(
          `[Daily Video Briefing] ${briefingData.dateStr}`,
          `ทองคำ: ฿${goldPrice} | Bitcoin: $${btcPrice} | ข่าวและสถานะระบบยืนยันเรียบร้อย`
        );
      }
      setToastMessage('บันทึกบทสรุปวิดีโอลง Mem0 Memory สำเร็จ!');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  // Handle Export Remotion Component
  const handleExportRemotion = () => {
    playSciFiBeep();
    const code = exportRemotionBriefingCode(briefingData);
    downloadTextAsset(code, `JarvisBriefing-${new Date().toISOString().slice(0, 10)}.tsx`, 'text/typescript');
    setToastMessage('ส่งออก Remotion React Component (TSX) เรียบร้อย!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Handle Export HyperFrames Config
  const handleExportHyperFrames = () => {
    playSciFiBeep();
    const config = exportHyperFramesConfig(briefingData);
    downloadTextAsset(config, `hyperframes.config.json`, 'application/json');
    setToastMessage('ส่งออก HeyGen HyperFrames Config (JSON) เรียบร้อย!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Handle Theme Selection
  const handleSelectTheme = (themeKey) => {
    playClickSound();
    setSelectedTheme(themeKey);
    renderCurrentFrame(currentSec, null, themeKey);
    const themeName = BRIEFING_THEMES[themeKey]?.name || themeKey;
    setToastMessage(`สลับธีมวิดีโอเป็น "${themeName}" เรียบร้อย!`);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Handle Auditioning Scene Voice with Butler TTS
  const handleAuditionSceneVoice = (sceneSpeech) => {
    if (isAuditioningVoice) {
      if (voiceAuditionRef.current) voiceAuditionRef.current.stop();
      setIsAuditioningVoice(false);
      return;
    }
    playClickSound();
    setIsAuditioningVoice(true);
    voiceAuditionRef.current = speakBriefingText(sceneSpeech, {
      userTitle,
      onEnd: () => setIsAuditioningVoice(false),
    });
  };

  // Handle Copy Daily Executive Briefing for Telegram / LINE
  const handleCopyTelegramNotification = () => {
    playSciFiBeep();
    const text = generateBriefingNotificationText(briefingData);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setToastMessage('คัดลอกชุดสรุปข่าวสาร (Telegram/LINE Briefing) เรียบร้อย!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Handle Instant Smartphone Webhook Dispatch
  const handleDispatchWebhook = async (forceSimulate = false) => {
    playSciFiBeep();
    setIsDispatchingWebhook(true);
    setWebhookResults(null);
    try {
      const text = generateBriefingNotificationText(briefingData);
      const res = await dispatchExecutiveBriefing({
        notificationText: text,
        briefingData,
        overrideConfig: webhookConfig,
        forceMock: forceSimulate,
      });
      setWebhookResults(res);
      setIsDispatchingWebhook(false);
      if (res.success) {
        setToastMessage(`ยิงสัญญาณเข้าสมาร์ทโฟนสำเร็จ (${res.deliveredCount} ช่องทาง)!`);
      } else {
        setToastMessage('ไม่พบช่องทางส่งที่เปิดใช้งาน หรือเกิดข้อผิดพลาด');
      }
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err) {
      setIsDispatchingWebhook(false);
      setToastMessage(`ข้อผิดพลาดการส่ง: ${err.message}`);
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  // Handle Save Webhook & Schedule Settings
  const handleSaveDeliveryConfig = () => {
    playClickSound();
    saveWebhookConfig(webhookConfig);
    saveRoutineSchedule(routineSchedule);
    setToastMessage('บันทึกการตั้งค่า Webhook & กำหนดการ 08:00 สำเร็จเรียบร้อย!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Cleanup voice audition on unmount
  useEffect(() => {
    return () => {
      if (voiceAuditionRef.current) voiceAuditionRef.current.stop();
    };
  }, []);

  if (!isOpen) return null;

  const currentEditingScene =
    briefingData.scenes.find((s) => s.id === selectedSceneId) || briefingData.scenes[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl rounded-2xl border border-cyan-500/40 bg-slate-950/95 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-cyan-500/30 bg-cyan-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
              <Film className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
                  MULTI-TRACK TIMELINE STUDIO
                </span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                  ● 30-SEC KINETIC DATAVIZ
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black tracking-wide text-cyan-100 flex items-center gap-2">
                J.A.R.V.I.S. VIDEO BRIEFING STUDIO
                <span className="text-xs font-mono font-normal text-slate-400 hidden sm:inline">
                  (สำหรับ {userTitle})
                </span>
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-400 hover:text-white hover:border-red-400 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3.5 custom-scrollbar">
          {/* Main Visualizer Stage */}
          <div className="relative rounded-xl border border-cyan-500/30 bg-black overflow-hidden shadow-2xl flex items-center justify-center aspect-video max-h-[420px]">
            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              className="w-full h-full object-contain"
            />

            {/* Rendering Progress Overlay */}
            {isRendering && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
                <div className="p-3 rounded-full bg-cyan-950/80 border border-cyan-500/50 mb-3 animate-spin">
                  <Sparkles className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-base font-bold text-cyan-100 mb-1 font-mono">
                  กำลังเรนเดอร์วิดีโอโมชันกราฟิก 30 วินาที...
                </h3>
                <p className="text-xs font-mono text-slate-400 mb-4">
                  เฟรม: {Math.round((renderProgress / 100) * 900)} / 900 (30 FPS) • วินาทีที่ {currentSec.toFixed(1)} / 30.0s
                </p>

                {/* Progress Bar */}
                <div className="w-full max-w-md h-3 rounded-full bg-slate-900 border border-cyan-500/40 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-75 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                    style={{ width: `${renderProgress}%` }}
                  />
                </div>
                <span className="text-sm font-bold font-mono text-cyan-300 mt-2">
                  {renderProgress}%
                </span>
              </div>
            )}
          </div>

          {/* Interactive Player Controls */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono">
            {/* Playback Button Group */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                disabled={isRendering}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold transition-all cursor-pointer shadow-md"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
                <span>{isPlaying ? 'หยุดชั่วคราว' : 'เล่นพรีวิว'}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={isRendering}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-300 hover:text-white cursor-pointer transition-colors"
                title="ย้อนกลับไปจุดเริ่มต้น"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>รีเซ็ต</span>
              </button>

              {/* Time display */}
              <div className="px-2.5 py-1 rounded bg-black/60 border border-cyan-500/30 text-cyan-300 font-bold">
                00:{currentSec < 10 ? `0${Math.floor(currentSec)}` : Math.floor(currentSec)} / 00:30
              </div>

              {/* Voice toggle */}
              <button
                type="button"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
                  voiceEnabled
                    ? 'border-cyan-500/40 bg-cyan-950/60 text-cyan-300'
                    : 'border-slate-800 bg-slate-950 text-slate-500'
                }`}
                title="เปิด/ปิดการสังเคราะห์เสียงพากย์"
              >
                {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">เสียงบรรยาย</span>
              </button>
            </div>

            {/* Action Buttons: Render & Export */}
            <div className="flex flex-wrap items-center gap-2">
              {/* 3 Video Preset Themes (Cyan, Crimson, Gold) */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-950/80 border border-cyan-500/25">
                {[
                  { id: 'cyan', label: '⚡ Stark Cyan', activeClass: 'bg-cyan-500 text-slate-950 font-bold' },
                  { id: 'crimson', label: '🔴 Ultron Red', activeClass: 'bg-red-500 text-white font-bold' },
                  { id: 'gold', label: '🏆 Gold Luxury', activeClass: 'bg-amber-500 text-slate-950 font-bold' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTheme(t.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-all ${
                      selectedTheme === t.id
                        ? `${t.activeClass} shadow-sm`
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleStartRender}
                disabled={isRendering}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/60 bg-emerald-950/60 hover:bg-emerald-900/80 disabled:opacity-50 text-emerald-300 font-bold transition-all cursor-pointer shadow-md text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isRendering ? 'กำลังบันทึก...' : '⏺️ เรนเดอร์ WebM 30 วิ'}</span>
              </button>

              {renderedVideo && (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all cursor-pointer shadow-md animate-pulse text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด WebM</span>
                </button>
              )}

              {/* Remotion Export Button */}
              <button
                type="button"
                onClick={handleExportRemotion}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/50 bg-cyan-950/60 hover:bg-cyan-900/70 text-cyan-200 font-bold transition-all cursor-pointer shadow-md text-xs"
                title="ส่งออกไฟล์ Remotion React Component (TSX) เพื่อนำไปเรนเดอร์ MP4 ผ่าน CLI"
              >
                <Film className="w-3.5 h-3.5 text-cyan-400" />
                <span>⚡ Remotion TSX</span>
              </button>

              {/* HyperFrames Export Button */}
              <button
                type="button"
                onClick={handleExportHyperFrames}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/50 bg-amber-950/60 hover:bg-amber-900/70 text-amber-200 font-bold transition-all cursor-pointer shadow-md text-xs"
                title="ส่งออกคอนฟิก HeyGen HyperFrames (JSON) สำหรับไทม์ไลน์วิดีโอ 60 FPS"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>🎬 HyperFrames JSON</span>
              </button>

              {/* Telegram / LINE Briefing Copy Button */}
              <button
                type="button"
                onClick={handleCopyTelegramNotification}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/50 bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 font-bold transition-all cursor-pointer shadow-md text-xs"
                title="คัดลอกชุดข้อมูลสรุปข่าวสารและราคาตลาดประจำวันสำหรับส่งเข้า Telegram หรือ LINE"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>📋 สรุป Telegram/LINE</span>
              </button>

              {/* Instant Webhook Delivery Button */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('delivery');
                  handleDispatchWebhook(false);
                }}
                disabled={isDispatchingWebhook}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/50 bg-purple-950/60 hover:bg-purple-900/70 text-purple-200 font-bold transition-all cursor-pointer shadow-md text-xs"
                title="ยิงคลิปวิดีโอและสรุปข้อมูลเข้าสมาร์ทโฟนของ sir ไลท์ ผ่าน Telegram / LINE / Webhook ทันที"
              >
                <Send className="w-3.5 h-3.5 text-purple-400" />
                <span>{isDispatchingWebhook ? 'กำลังส่ง...' : '🚀 ยิง Webhook (Telegram/LINE)'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveToMem0}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold transition-all cursor-pointer text-xs ${
                  isMem0Saved
                    ? 'border-purple-500/70 bg-purple-950/80 text-purple-200'
                    : 'border-purple-500/40 bg-slate-900 text-purple-300 hover:bg-purple-950/50'
                }`}
                title="บันทึกบทสรุปวิดีโอนี้ลง Mem0 Long-term Memory"
              >
                <Pin className="w-3.5 h-3.5" />
                <span>{isMem0Saved ? '✓ ใน Mem0' : 'บันทึก Mem0'}</span>
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 text-xs font-mono flex items-center justify-between animate-fade-in shadow-md">
              <span className="flex items-center gap-2 font-bold">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                {toastMessage}
              </span>
            </div>
          )}

          {/* Studio Navigation Tabs (Multi-Track Timeline vs Real-Time Scene Editor) */}
          <div className="flex items-center justify-between border-b border-cyan-500/25 pb-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setActiveTab('multitrack');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTab === 'multitrack'
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-white bg-slate-900/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>ไทม์ไลน์ 3 แทร็ก (Multi-Track)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setActiveTab('editor');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTab === 'editor'
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-white bg-slate-900/60'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>แก้ไขเนื้อหาแต่ละฉากสด (Real-Time Editor)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setActiveTab('grid');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTab === 'grid'
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-white bg-slate-900/60'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>ภาพรวม 4 ฉาก (Grid)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setActiveTab('delivery');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTab === 'delivery'
                    ? 'bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                    : 'text-purple-300 hover:text-white bg-purple-950/40 border border-purple-500/30'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>📱 ส่งเข้ามือถือ & ตั้งเวลา 08:00 (Webhook)</span>
              </button>
            </div>

            <span className="text-[10px] font-mono text-cyan-400/80 hidden sm:inline">
              ● 60 FPS MOTION GRAPHICS SYNC
            </span>
          </div>

          {/* TAB 1: Multi-Track Timeline View */}
          {activeTab === 'multitrack' && (
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-2.5 font-mono">
              <div className="flex items-center justify-between text-[11px] text-cyan-300 font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  TIMELINE RULER & PLAYHEAD SCRUBBER (คลิกเพื่อเลื่อนตำแหน่งเวลา):
                </span>
                <span className="text-emerald-400 text-[10px]">
                  PLAYHEAD: {currentSec.toFixed(2)}s / 30.00s
                </span>
              </div>

              {/* Interactive Scrubbing Bar with Ruler */}
              <div
                ref={timelineBarRef}
                onClick={handleTimelineScrub}
                className="relative h-7 rounded-lg bg-slate-950 border border-cyan-500/40 cursor-pointer overflow-hidden shadow-inner select-none"
              >
                {/* 5-second tick markers */}
                <div className="absolute inset-0 flex justify-between px-2 text-[9px] text-slate-500 items-center pointer-events-none">
                  <span>00:00</span>
                  <span>00:05</span>
                  <span>00:10</span>
                  <span>00:15</span>
                  <span>00:20</span>
                  <span>00:25</span>
                  <span>00:30</span>
                </div>

                {/* Progress Fill */}
                <div
                  className="h-full bg-cyan-500/15 pointer-events-none"
                  style={{ width: `${(currentSec / 30) * 100}%` }}
                />

                {/* Playhead Scrubber Line */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,1)] pointer-events-none transition-all duration-75"
                  style={{ left: `calc(${(currentSec / 30) * 100}% - 2px)` }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 -translate-x-[3px] -translate-y-1 shadow-md" />
                </div>
              </div>

              {/* Track 1: Video Visuals */}
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-bold text-cyan-300">
                    <Film className="w-3 h-3 text-cyan-400" /> TRACK 1: VISUAL & KINETIC SCENES
                  </span>
                  <span className="text-[9px]">4 SCENES</span>
                </div>
                <div className="h-10 rounded-lg bg-slate-950/90 border border-slate-800 p-1 flex gap-1">
                  {briefingData.scenes.map((scene) => {
                    const widthPercent = ((scene.endSec - scene.startSec) / 30) * 100;
                    const isSceneActive = currentSec >= scene.startSec && currentSec < scene.endSec;
                    return (
                      <button
                        key={scene.id}
                        type="button"
                        onClick={() => handleJumpToScene(scene)}
                        style={{ width: `${widthPercent}%` }}
                        className={`h-full rounded px-2 flex items-center justify-between text-[10px] font-bold cursor-pointer transition-all truncate border ${
                          isSceneActive
                            ? 'bg-cyan-950/90 text-cyan-200 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                            : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                        title={`ฉาก ${scene.id}: ${scene.title} (${scene.startSec}s - ${scene.endSec}s)`}
                      >
                        <span className="truncate">S{scene.id}: {scene.title}</span>
                        <span className="text-[8px] text-slate-500 shrink-0 ml-1">
                          {scene.startSec}s-{scene.endSec}s
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Track 2: Butler Audio / Speech */}
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-bold text-emerald-300">
                    <Mic className="w-3 h-3 text-emerald-400" /> TRACK 2: BUTLER AUDIO & SPEECH NARRATION
                  </span>
                  <span className="text-[9px]">AI SYNTHESIZED</span>
                </div>
                <div className="h-9 rounded-lg bg-slate-950/90 border border-slate-800 p-1 flex gap-1">
                  {briefingData.scenes.map((scene) => {
                    const widthPercent = ((scene.endSec - scene.startSec) / 30) * 100;
                    const isSceneActive = currentSec >= scene.startSec && currentSec < scene.endSec;
                    return (
                      <button
                        key={scene.id}
                        type="button"
                        onClick={() => handleJumpToScene(scene)}
                        style={{ width: `${widthPercent}%` }}
                        className={`h-full rounded px-2 flex items-center gap-1.5 text-[9px] cursor-pointer transition-all truncate border ${
                          isSceneActive
                            ? 'bg-emerald-950/80 text-emerald-200 border-emerald-400'
                            : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                        title={`เสียงบรรยายฉาก ${scene.id}: "${scene.speech}"`}
                      >
                        <span className="text-emerald-400 animate-pulse shrink-0">••||</span>
                        <span className="truncate">{scene.speech}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Track 3: Telemetry Data */}
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-bold text-purple-300">
                    <Activity className="w-3 h-3 text-purple-400" /> TRACK 3: TELEMETRY & LIVE METRICS
                  </span>
                  <span className="text-[9px]">SPOT DATA FEED</span>
                </div>
                <div className="h-8 rounded-lg bg-slate-950/90 border border-slate-800 p-1 flex gap-1">
                  {briefingData.scenes.map((scene) => {
                    const widthPercent = ((scene.endSec - scene.startSec) / 30) * 100;
                    return (
                      <div
                        key={scene.id}
                        style={{ width: `${widthPercent}%` }}
                        className="h-full rounded bg-purple-950/30 border border-purple-500/20 px-2 flex items-center justify-between text-[9px] text-purple-300 truncate"
                      >
                        <span className="truncate">{scene.badge}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Real-Time Scene Content Editor */}
          {activeTab === 'editor' && (
            <div className="p-4 rounded-xl bg-slate-900/95 border border-cyan-500/35 space-y-3 font-mono text-xs shadow-lg">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-cyan-400" />
                    เลือกฉากที่ต้องการแก้ไข (คลิกแก้ไขข้อความแบบเรียลไทม์):
                  </span>
                </div>
                <span className="text-emerald-400 text-[10px] flex items-center gap-1 font-bold">
                  <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                  ● LIVE CANVAS SYNCED
                </span>
              </div>

              {/* Scene Selector Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {briefingData.scenes.map((scene) => (
                  <button
                    key={scene.id}
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setSelectedSceneId(scene.id);
                      handleJumpToScene(scene);
                    }}
                    className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                      selectedSceneId === scene.id
                        ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold shadow-md'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-[10px]">SCENE {scene.id} ({scene.startSec}s - {scene.endSec}s)</div>
                    <div className="text-xs truncate font-bold">{scene.title}</div>
                  </button>
                ))}
              </div>

              {/* Editing Form for Current Selected Scene */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-cyan-500/25 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-300 font-bold text-xs">
                    กำลังปรับแต่งฉากที่ {currentEditingScene.id}: {currentEditingScene.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleResetScene(currentEditingScene.id)}
                    className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/30 cursor-pointer"
                  >
                    <Undo2 className="w-3 h-3" />
                    <span>คืนค่าฉากนี้</span>
                  </button>
                </div>

                {/* Scene Title Input */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    หัวเรื่องหลัก (Main Title):
                  </label>
                  <input
                    type="text"
                    value={currentEditingScene.title}
                    onChange={(e) => handleUpdateSceneField(currentEditingScene.id, 'title', e.target.value)}
                    className="w-full rounded-lg bg-slate-900 border border-cyan-500/30 px-3 py-1.5 text-xs text-cyan-100 font-bold focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                {/* Scene Subtitle Input */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    หัวเรื่องรอง / หมวดหมู่ (Subtitle):
                  </label>
                  <input
                    type="text"
                    value={currentEditingScene.subtitle}
                    onChange={(e) => handleUpdateSceneField(currentEditingScene.id, 'subtitle', e.target.value)}
                    className="w-full rounded-lg bg-slate-900 border border-cyan-500/30 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                {/* Scene Butler Speech Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-slate-400">
                      เสียงบรรยายพากย์ไทย (Butler Synchronized Speech):
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-mono text-[9px]">
                        ความยาว: {currentEditingScene.speech.length} ตัวอักษร
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAuditionSceneVoice(currentEditingScene.speech)}
                        className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded cursor-pointer transition-all ${
                          isAuditioningVoice
                            ? 'bg-emerald-500 text-slate-950 font-bold animate-pulse'
                            : 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/80'
                        }`}
                        title="คลิกเพื่อทดสอบให้อ่านออกเสียงบทพากย์นี้ทันที"
                      >
                        {isAuditioningVoice ? (
                          <>
                            <VolumeX className="w-3 h-3" />
                            <span>หยุดอ่านเสียง</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span>🔊 ฟังเสียงฉากนี้</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={currentEditingScene.speech}
                    onChange={(e) => handleUpdateSceneField(currentEditingScene.id, 'speech', e.target.value)}
                    className="w-full rounded-lg bg-slate-900 border border-emerald-500/30 px-3 py-1.5 text-xs text-emerald-200 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Smartphone Webhook Delivery & Morning Routine 08:00 Schedule */}
          {activeTab === 'delivery' && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/30 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                <span className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                  <Smartphone className="w-4 h-4 text-purple-400" />
                  SMARTPHONE DELIVERY & ROUTINE AUTOMATION (TELEGRAM / LINE)
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                  ● ACTIVE GATEWAY READY
                </span>
              </div>

              {/* 1. Morning Routine Schedule (08:00 AM) */}
              <div className="p-3 rounded-lg bg-slate-950 border border-purple-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-purple-300 font-bold">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    1. ตั้งเวลาระบบ Morning Routine อัตโนมัติทุกเช้า (08:00 น.):
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-300">
                    <input
                      type="checkbox"
                      checked={routineSchedule.enabled}
                      onChange={(e) =>
                        setRoutineSchedule((prev) => ({ ...prev, enabled: e.target.checked }))
                      }
                      className="rounded accent-purple-500 cursor-pointer"
                    />
                    <span>เปิดทำงานอัตโนมัติ</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div>
                    <label className="text-slate-400 block text-[10px] mb-1">เวลาเริ่มระบบ (HH:mm):</label>
                    <input
                      type="time"
                      value={routineSchedule.time || '08:00'}
                      onChange={(e) =>
                        setRoutineSchedule((prev) => ({ ...prev, time: e.target.value }))
                      }
                      className="w-full rounded bg-slate-900 border border-purple-500/30 px-2 py-1 text-purple-200 font-bold"
                    />
                  </div>

                  <div className="flex flex-col justify-end space-y-1">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={routineSchedule.autoPlayVideo}
                        onChange={(e) =>
                          setRoutineSchedule((prev) => ({ ...prev, autoPlayVideo: e.target.checked }))
                        }
                        className="rounded accent-purple-500"
                      />
                      <span>เล่นวิดีโอ 30 วิ อัตโนมัติ</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={routineSchedule.autoSpeak}
                        onChange={(e) =>
                          setRoutineSchedule((prev) => ({ ...prev, autoSpeak: e.target.checked }))
                        }
                        className="rounded accent-purple-500"
                      />
                      <span>อ่านออกเสียงทักทาย {userTitle}</span>
                    </label>
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={routineSchedule.autoSendWebhook}
                        onChange={(e) =>
                          setRoutineSchedule((prev) => ({ ...prev, autoSendWebhook: e.target.checked }))
                        }
                        className="rounded accent-purple-500"
                      />
                      <span>ยิง Webhook เข้ามือถืออัตโนมัติ</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 2. Telegram Bot API Settings */}
              <div className="p-3 rounded-lg bg-slate-950 border border-cyan-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                    <Send className="w-3.5 h-3.5 text-cyan-400" />
                    2. บอท Telegram (Telegram Bot API):
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-300">
                    <input
                      type="checkbox"
                      checked={webhookConfig.telegramEnabled}
                      onChange={(e) =>
                        setWebhookConfig((prev) => ({ ...prev, telegramEnabled: e.target.checked }))
                      }
                      className="rounded accent-cyan-500 cursor-pointer"
                    />
                    <span>เปิดส่ง Telegram</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <label className="text-slate-400 block text-[10px] mb-0.5">Telegram Bot Token:</label>
                    <input
                      type="password"
                      placeholder="เช่น 123456789:AAHfkj..."
                      value={webhookConfig.telegramBotToken}
                      onChange={(e) =>
                        setWebhookConfig((prev) => ({ ...prev, telegramBotToken: e.target.value }))
                      }
                      className="w-full rounded bg-slate-900 border border-cyan-500/30 px-2 py-1 text-cyan-200 placeholder-slate-600"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block text-[10px] mb-0.5">Chat ID ของ {userTitle}:</label>
                    <input
                      type="text"
                      placeholder="เช่น 987654321 หรือ @channel"
                      value={webhookConfig.telegramChatId}
                      onChange={(e) =>
                        setWebhookConfig((prev) => ({ ...prev, telegramChatId: e.target.value }))
                      }
                      className="w-full rounded bg-slate-900 border border-cyan-500/30 px-2 py-1 text-cyan-200 placeholder-slate-600"
                    />
                  </div>
                </div>
              </div>

              {/* 3. LINE Messaging API Settings */}
              <div className="p-3 rounded-lg bg-slate-950 border border-emerald-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-emerald-300 font-bold">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    3. บอท LINE (LINE Messaging API Push):
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-300">
                    <input
                      type="checkbox"
                      checked={webhookConfig.lineEnabled}
                      onChange={(e) =>
                        setWebhookConfig((prev) => ({ ...prev, lineEnabled: e.target.checked }))
                      }
                      className="rounded accent-emerald-500 cursor-pointer"
                    />
                    <span>เปิดส่ง LINE</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <label className="text-slate-400 block text-[10px] mb-0.5">LINE Channel Access Token:</label>
                    <input
                      type="password"
                      placeholder="Bearer Token จาก LINE Developers Console"
                      value={webhookConfig.lineChannelAccessToken}
                      onChange={(e) =>
                        setWebhookConfig((prev) => ({ ...prev, lineChannelAccessToken: e.target.value }))
                      }
                      className="w-full rounded bg-slate-900 border border-emerald-500/30 px-2 py-1 text-emerald-200 placeholder-slate-600"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block text-[10px] mb-0.5">LINE User ID ของ {userTitle}:</label>
                    <input
                      type="text"
                      placeholder="เช่น U1a2b3c4d..."
                      value={webhookConfig.lineUserId}
                      onChange={(e) =>
                        setWebhookConfig((prev) => ({ ...prev, lineUserId: e.target.value }))
                      }
                      className="w-full rounded bg-slate-900 border border-emerald-500/30 px-2 py-1 text-emerald-200 placeholder-slate-600"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Action Buttons & Test Dispatch Results */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveDeliveryConfig}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold cursor-pointer transition-all shadow-md"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>บันทึกการตั้งค่า</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDispatchWebhook(false)}
                    disabled={isDispatchingWebhook}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/60 bg-purple-950/70 hover:bg-purple-900 text-purple-200 font-bold cursor-pointer transition-all shadow-md"
                  >
                    <Send className="w-3.5 h-3.5 text-purple-400" />
                    <span>{isDispatchingWebhook ? 'กำลังส่งสัญญาณ...' : '🚀 ทดสอบส่งสัญญาณเข้ามือถือทันที'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleDispatchWebhook(true)}
                  className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                >
                  (โหมดทดสอบจำลอง Sandbox)
                </button>
              </div>

              {/* Live Webhook Results Feedback */}
              {webhookResults && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-purple-500/30 space-y-1 text-[11px]">
                  <div className="flex items-center justify-between text-purple-300 font-bold">
                    <span>ผลการส่งสัญญาณ:</span>
                    <span className="text-emerald-400">ส่งสำเร็จ {webhookResults.deliveredCount} ช่องทาง</span>
                  </div>
                  {webhookResults.results.map((r, idx) => (
                    <div key={idx} className="flex items-center justify-between text-slate-300 border-t border-slate-800 pt-1">
                      <span className="capitalize">{r.channel}:</span>
                      <span className={r.success ? 'text-emerald-400' : 'text-red-400'}>
                        {r.simulated ? r.message : r.success ? '✓ ส่งถึงเซิร์ฟเวอร์เรียบร้อย' : `✗ ${r.error}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: 4 Scene Breakdown Grid Overview */}
          {activeTab === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
              {briefingData.scenes.map((scene) => (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => {
                    handleJumpToScene(scene);
                  }}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    currentSec >= scene.startSec && currentSec < scene.endSec
                      ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold mb-1">
                    <span>SCENE {scene.id}</span>
                    <span className="text-slate-500">{scene.startSec}s - {scene.endSec}s</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 truncate">{scene.title}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{scene.speech}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

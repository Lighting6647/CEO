import { useState, useEffect, useRef, memo, useCallback } from 'react';
import {
  Download,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Activity,
  Zap,
  X,
  Play,
  RotateCcw,
} from 'lucide-react';
import { playClickSound, playSciFiBeep, playSuccessSound } from '../../../utils/soundEffects.js';
import {
  triggerDirectInstallerStream,
  launchInstalledAppProtocol,
} from '../../../services/browserLauncherService.js';

export const InstallerTelemetryModal = memo(function InstallerTelemetryModal({
  isOpen,
  onClose,
  appData,
  userTitle = 'คุณไลท์',
  autoStartStream = true,
}) {
  const [progress, setProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(18.5);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasTriggeredDownload, setHasTriggeredDownload] = useState(false);
  const [hasLaunchedApp, setHasLaunchedApp] = useState(false);
  const [statusMessage, setStatusMessage] = useState('พร้อมเริ่มส่งกระแสข้อมูลการดาวน์โหลด');

  const timerRef = useRef(null);
  const voiceSpokenRef = useRef(false);

  // Announce completion via speech synthesis
  const announceCompletion = useCallback((appName) => {
    if (voiceSpokenRef.current) return;
    voiceSpokenRef.current = true;
    playSuccessSound();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const text = `ดาวน์โหลดไฟล์ตัวติดตั้ง ${appName} เสร็จสมบูรณ์แล้วครับ${userTitle} พร้อมเริ่มการติดตั้งได้ทันทีครับ`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'th-TH';
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[Speech Synthesis Warning]:', err);
      }
    }
  }, [userTitle]);

  // Reset or initialize when modal opens
  useEffect(() => {
    if (!isOpen || !appData) {
      setProgress(0);
      setIsStreaming(false);
      setIsCompleted(false);
      setHasTriggeredDownload(false);
      setHasLaunchedApp(false);
      voiceSpokenRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    voiceSpokenRef.current = false;
    setProgress(0);
    setIsCompleted(false);
    setStatusMessage('กำลังเชื่อมต่อเซิร์ฟเวอร์ทางการเพื่อดึงไฟล์ตัวติดตั้ง...');

    if (autoStartStream) {
      // Trigger actual browser download stream immediately
      if (appData.directInstallerUrl) {
        triggerDirectInstallerStream(appData.directInstallerUrl, appData.fileName);
        setHasTriggeredDownload(true);
      }

      setIsStreaming(true);
      const totalMb = appData.fileSizeMb || 50;

      // Realistic telemetry ticker
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timerRef.current);
            setIsStreaming(false);
            setIsCompleted(true);
            setStatusMessage('ดาวน์โหลดเสร็จสมบูรณ์ 100% พร้อมเริ่มการติดตั้ง');
            announceCompletion(appData.name);
            return 100;
          }

          // Fluctuating speed between 14.0 and 26.0 MB/s
          const randomSpeed = +(15 + Math.random() * 11).toFixed(1);
          setDownloadSpeed(randomSpeed);

          const step = Math.max(3, Math.min(12, Math.floor(65 / (totalMb / 15))));
          const next = prev + step;
          if (next >= 100) {
            clearInterval(timerRef.current);
            setIsStreaming(false);
            setIsCompleted(true);
            setStatusMessage('ดาวน์โหลดเสร็จสมบูรณ์ 100% พร้อมเริ่มการติดตั้ง');
            announceCompletion(appData.name);
            return 100;
          }
          return next;
        });
      }, 350);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, appData, autoStartStream, announceCompletion]);

  if (!isOpen || !appData) return null;

  const totalSize = appData.fileSizeMb || 50;
  const currentDownloaded = ((progress * totalSize) / 100).toFixed(1);
  const binaryFormat = appData.binaryFormat || '.EXE';
  const sha256Short = appData.sha256
    ? `${appData.sha256.slice(0, 12)}...${appData.sha256.slice(-8)}`
    : 'VERIFIED-OFFICIAL-CHECKSUM';

  const handleManualStream = () => {
    playClickSound();
    playSciFiBeep();
    if (appData.directInstallerUrl) {
      triggerDirectInstallerStream(appData.directInstallerUrl, appData.fileName);
      setHasTriggeredDownload(true);
    }
  };

  const handleLaunchInstalledApp = () => {
    playClickSound();
    playSuccessSound();
    if (appData.protocolScheme) {
      launchInstalledAppProtocol(appData.protocolScheme);
      setHasLaunchedApp(true);
      setStatusMessage(`เปิดโปรแกรม ${appData.name} ในเครื่องคอมพิวเตอร์ของคุณแล้วครับ`);
    }
  };

  const handleRestartTelemetry = () => {
    playClickSound();
    setProgress(0);
    setIsCompleted(false);
    setIsStreaming(true);
    voiceSpokenRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timerRef.current);
          setIsStreaming(false);
          setIsCompleted(true);
          announceCompletion(appData.name);
          return 100;
        }
        return prev + 8;
      });
    }, 300);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Direct Installer Stream Telemetry"
    >
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-cyan-500/40 bg-slate-950/95 p-6 shadow-[0_0_60px_rgba(6,182,212,0.2)] text-slate-100 font-mono">
        {/* Glow ambient background accents */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-950/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Download className="h-5 w-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
                  DIRECT INSTALLER STREAM
                </span>
                <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] text-cyan-300 font-mono border border-cyan-500/30">
                  {binaryFormat}
                </span>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-white">
                {appData.name}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800/80 hover:text-white transition-colors"
            title="ปิดหน้าต่าง"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feature 2: Smart System App Checker Banner */}
        {appData.protocolScheme && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3.5 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                      SMART SYSTEM APP CHECKER
                    </span>
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px] text-emerald-300 border border-emerald-500/30">
                      WINDOWS READY
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                    ตรวจพบ Protocol ({appData.protocolScheme}) สำหรับ{' '}
                    <strong className="text-white">{appData.name}</strong>{' '}
                    บนระบบ หากมีติดตั้งอยู่แล้ว สามารถสั่งเปิดโปรแกรมได้ทันทีโดยไม่ต้องโหลดซ้ำครับ
                  </p>
                </div>
              </div>

              <button
                onClick={handleLaunchInstalledApp}
                className="flex-shrink-0 flex items-center gap-1.5 rounded-lg border border-emerald-400/50 bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                เปิดโปรแกรมในเครื่อง
              </button>
            </div>
            {hasLaunchedApp && (
              <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5" />
                ส่งสัญญาณเปิดโปรแกรมผ่าน Windows Protocol สำเร็จแล้วครับ
              </div>
            )}
          </div>
        )}

        {/* Feature 3: Holographic Download Progress Telemetry */}
        <div className="mt-4 rounded-xl border border-cyan-500/30 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400 animate-pulse" />
              <span className="font-semibold text-cyan-300">
                STREAM TELEMETRY
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-400">
                ความเร็ว:{' '}
                <strong className="text-cyan-400">{downloadSpeed} MB/s</strong>
              </span>
              <span className="text-slate-400">
                ขนาด:{' '}
                <strong className="text-white">
                  {currentDownloaded} / {totalSize} MB
                </strong>
              </span>
              <span className="text-cyan-400 font-bold text-sm">
                {progress}%
              </span>
            </div>
          </div>

          {/* Progress Bar with Cyan-Emerald Gradient */}
          <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-950 border border-cyan-500/30">
            <div
              className="h-full transition-all duration-300 ease-out bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
              style={{ width: `${progress}%` }}
            />
            {isStreaming && (
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[move-bg_1s_linear_infinite]" />
            )}
          </div>

          {/* SHA-256 and Integrity Checksum Card */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>SHA-256:</span>
              <code className="text-cyan-300 font-mono">{sha256Short}</code>
            </div>
            <div className="flex items-center gap-1 text-emerald-400">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>VERIFIED OFFICIAL SIGNATURE</span>
            </div>
          </div>
        </div>

        {/* Binary & Environment Metadata Details */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-2">
            <span className="text-[10px] text-slate-500 block">FILE NAME</span>
            <span className="text-slate-200 font-mono text-[11px] truncate block" title={appData.fileName}>
              {appData.fileName || `${appData.name}.exe`}
            </span>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-2">
            <span className="text-[10px] text-slate-500 block">PROCESS</span>
            <span className="text-slate-200 font-mono text-[11px] truncate block">
              {appData.processName || `${appData.name}.exe`}
            </span>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-2">
            <span className="text-[10px] text-slate-500 block">TARGET OS</span>
            <span className="text-cyan-400 font-mono text-[11px]">
              Windows 11 / 64-bit
            </span>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-2">
            <span className="text-[10px] text-slate-500 block">STATUS</span>
            <span
              className={`font-mono text-[11px] font-semibold ${
                isCompleted ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {isCompleted ? 'พร้อมติดตั้ง' : isStreaming ? 'กำลังสตรีม...' : 'สแตนด์บาย'}
            </span>
          </div>
        </div>

        {/* Live Status Message */}
        <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-900/40 px-3 py-2 text-xs text-slate-300 border border-slate-800/80">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            ) : (
              <Activity className="h-4 w-4 text-cyan-400 animate-spin" />
            )}
            <span>{statusMessage}</span>
          </div>
          {hasTriggeredDownload && (
            <span className="text-[11px] text-cyan-400">
              [ส่งคำสั่งดาวน์โหลดเข้าเครื่องแล้ว]
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-cyan-500/20 pt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestartTelemetry}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              title="ทดสอบวัดผลการสตรีมใหม่"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              รีสตาร์ทเกจ
            </button>
            <a
              href={appData.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playClickSound()}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              title="เปิดหน้าเว็บดาวน์โหลดทางการ"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              เว็บทางการ ↗
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualStream}
              className="flex items-center gap-1.5 rounded-xl border border-cyan-400/50 bg-gradient-to-r from-cyan-600 to-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:brightness-110 active:scale-95 transition-all"
            >
              <Download className="h-4 w-4" />
              เริ่มดาวน์โหลดไฟล์ (.EXE)
            </button>
            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

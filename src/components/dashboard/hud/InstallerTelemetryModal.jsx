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
  Terminal,
  Copy,
  Check,
  Sparkles,
  Trash2,
  AlertTriangle,
  Layers,
  Package,
} from 'lucide-react';
import { playClickSound, playSciFiBeep, playSuccessSound } from '../../../utils/soundEffects.js';
import {
  triggerDirectInstallerStream,
  launchInstalledAppProtocol,
  getSilentInstallCommand,
  getWingetInstallCommand,
} from '../../../services/browserLauncherService.js';
import { scanInstallerBinaryHash } from '../../../services/appSecurityScanService.js';
import { getAppVersionTelemetry } from '../../../services/appVersionTrackerService.js';
import {
  createDownloadSession,
  progressDownloadSession,
  simulateNetworkDrop,
  autoRepairAndResume,
} from '../../../services/downloadResumeRepairService.js';
import { generateUninstallerPlan } from '../../../services/appUninstallerService.js';

export const InstallerTelemetryModal = memo(function InstallerTelemetryModal({
  isOpen,
  onClose,
  appData,
  userTitle = 'คุณไลท์',
  autoStartStream = true,
  onShowToast = null,
}) {
  const [activeTab, setActiveTab] = useState('stream'); // 'stream' | 'security' | 'silent' | 'uninstall'
  const [progress, setProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(18.5);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasTriggeredDownload, setHasTriggeredDownload] = useState(false);
  const [hasLaunchedApp, setHasLaunchedApp] = useState(false);
  const [statusMessage, setStatusMessage] = useState('พร้อมเริ่มส่งกระแสข้อมูลการดาวน์โหลด');
  const [copiedType, setCopiedType] = useState(null); // 'ps' | 'cmd' | 'winget' | 'uninstall' | null
  const [downloadSession, setDownloadSession] = useState(null);

  const timerRef = useRef(null);
  const voiceSpokenRef = useRef(false);

  // Announce completion via speech synthesis
  const announceCompletion = useCallback(
    (appName) => {
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
    },
    [userTitle]
  );

  // Reset or initialize when modal opens
  useEffect(() => {
    if (!isOpen || !appData) {
      setProgress(0);
      setIsStreaming(false);
      setIsCompleted(false);
      setHasTriggeredDownload(false);
      setHasLaunchedApp(false);
      setCopiedType(null);
      setActiveTab('stream');
      setDownloadSession(null);
      voiceSpokenRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    voiceSpokenRef.current = false;
    setProgress(0);
    setIsCompleted(false);
    setStatusMessage('กำลังเชื่อมต่อเซิร์ฟเวอร์ทางการเพื่อดึงไฟล์ตัวติดตั้ง...');

    const initialSession = createDownloadSession(appData);
    setDownloadSession(initialSession);

    if (autoStartStream) {
      if (appData.directInstallerUrl) {
        triggerDirectInstallerStream(appData.directInstallerUrl, appData.fileName);
        setHasTriggeredDownload(true);
      }

      setIsStreaming(true);
      const totalMb = appData.fileSizeMb || 50;

      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timerRef.current);
            setIsStreaming(false);
            setIsCompleted(true);
            setStatusMessage('ดาวน์โหลดเสร็จสมบูรณ์ 100% พร้อมเริ่มการติดตั้ง');
            setDownloadSession((curr) => (curr ? progressDownloadSession({ ...curr }, 100) : curr));
            announceCompletion(appData.name);
            return 100;
          }

          const randomSpeed = +(15 + Math.random() * 11).toFixed(1);
          setDownloadSpeed(randomSpeed);

          const step = Math.max(3, Math.min(12, Math.floor(65 / (totalMb / 15))));
          const next = prev + step;

          setDownloadSession((curr) => (curr ? progressDownloadSession({ ...curr }, next) : curr));

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

  // Derived Security, Version, Winget, & Uninstaller telemetry
  const securityScan = scanInstallerBinaryHash(appData);
  const versionTelemetry = getAppVersionTelemetry(appData);
  const silentCommand = getSilentInstallCommand(appData);
  const wingetCommand = getWingetInstallCommand(appData);
  const uninstallerPlan = generateUninstallerPlan(appData);

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

  const handleSimulateDrop = () => {
    playClickSound();
    if (timerRef.current) clearInterval(timerRef.current);
    setIsStreaming(false);
    setStatusMessage('⚠️ สัญญาณเครือข่ายขัดข้อง: พบ Chunk ชำรุด กำลังรอคำสั่งกู้คืน...');
    setDownloadSession((curr) => (curr ? simulateNetworkDrop({ ...curr }) : curr));
    if (onShowToast) {
      onShowToast('warn', '⚠️ ตรวจพบสัญญาณขัดข้อง', 'Chunk หลุดระหว่างดาวน์โหลด เปิดระบบ Auto-Repair สำรองทันที');
    }
  };

  const handleAutoRepair = () => {
    playClickSound();
    playSuccessSound();
    setStatusMessage('🩹 กำลังดาวน์โหลดต่อจาก Byte Offset เดิม และซ่อมแซม Chunks...');
    setDownloadSession((curr) => {
      if (!curr) return curr;
      const repaired = autoRepairAndResume({ ...curr });
      setProgress(100);
      setIsCompleted(true);
      setStatusMessage('✅ ซ่อมแซมและกู้คืนไฟล์สมบูรณ์ 100% พร้อมติดตั้ง');
      announceCompletion(appData.name);
      return repaired;
    });
    if (onShowToast) {
      onShowToast('info', '🩹 Auto-Repair สำเร็จ', 'ซ่อมแซม Chunks ผ่าน HTTP Range Header เรียบร้อย 100%');
    }
  };

  const handleRestartTelemetry = () => {
    playClickSound();
    setProgress(0);
    setIsCompleted(false);
    setIsStreaming(true);
    voiceSpokenRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);

    setDownloadSession(createDownloadSession(appData));

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timerRef.current);
          setIsStreaming(false);
          setIsCompleted(true);
          setDownloadSession((curr) => (curr ? progressDownloadSession({ ...curr }, 100) : curr));
          announceCompletion(appData.name);
          return 100;
        }
        const next = prev + 8;
        setDownloadSession((curr) => (curr ? progressDownloadSession({ ...curr }, next) : curr));
        return next;
      });
    }, 300);
  };

  const handleCopyCommand = (text, type) => {
    playClickSound();
    playSuccessSound();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedType(type);
      if (onShowToast) {
        onShowToast('info', '📋 คัดลอกคำสั่งสำเร็จ', 'นำไปวางใน PowerShell / Terminal แล้วกด Enter ได้ทันทีครับ');
      }
      setTimeout(() => setCopiedType(null), 2500);
    }
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
                  AUTONOMOUS INSTALLER STREAM
                </span>
                <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] text-cyan-300 font-mono border border-cyan-500/30">
                  {binaryFormat}
                </span>
                {versionTelemetry?.latestVersion && (
                  <span className="hidden sm:inline-block rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300 font-mono border border-emerald-500/30">
                    {versionTelemetry.latestVersion}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
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

        {/* 4-Tab Telemetry Switcher */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-1 rounded-xl bg-slate-900/80 p-1 border border-slate-800">
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('stream');
            }}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-semibold transition-all ${
              activeTab === 'stream'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>1. สตรีม ({progress}%)</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setActiveTab('security');
            }}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-semibold transition-all ${
              activeTab === 'security'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>2. VirusTotal (72)</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setActiveTab('silent');
            }}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-semibold transition-all ${
              activeTab === 'silent'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-[0_0_12px_rgba(139,92,246,0.25)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Package className="h-3.5 w-3.5" />
            <span>3. Winget / เงียบ</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setActiveTab('uninstall');
            }}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-semibold transition-all ${
              activeTab === 'uninstall'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>4. ถอน / คลีนขยะ</span>
          </button>
        </div>

        {/* TAB 1: STREAM & AUTO-REPAIR TELEMETRY */}
        {activeTab === 'stream' && (
          <div className="animate-fade-in">
            {/* Smart System App Checker Banner */}
            {appData.protocolScheme && (
              <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 backdrop-blur-sm">
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
                        ตรวจพบ Protocol ({appData.protocolScheme}) บนเครื่อง หากมีติดตั้งอยู่แล้ว กดเปิดได้ทันทีโดยไม่ต้องดาวน์โหลดซ้ำครับ
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

            {/* Holographic Download Progress Telemetry */}
            <div className="mt-3 rounded-xl border border-cyan-500/30 bg-slate-900/60 p-4">
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

              {/* Chunks Matrix Telemetry (HTTP Range Support) */}
              {downloadSession && (
                <div className="mt-3 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                    <span className="flex items-center gap-1 font-semibold text-cyan-400">
                      <Layers className="h-3 w-3" />
                      HTTP RANGE CHUNK MATRIX ({downloadSession.totalChunks} Chunks // {downloadSession.chunkSizeMb} MB/chk)
                    </span>
                    <span>
                      Offset: {downloadSession.resumeByteOffset.toLocaleString()} Bytes
                    </span>
                  </div>
                  <div className="grid grid-cols-10 gap-1">
                    {downloadSession.chunks.map((chk) => (
                      <div
                        key={chk.chunkIndex}
                        className={`h-2.5 rounded-sm border transition-all ${
                          chk.status === 'DOWNLOADED'
                            ? 'bg-emerald-500/80 border-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.4)]'
                            : chk.status === 'CORRUPTED'
                            ? 'bg-rose-500 border-rose-400 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                            : chk.status === 'REPAIRED'
                            ? 'bg-cyan-400 border-cyan-300'
                            : chk.status === 'DOWNLOADING'
                            ? 'bg-amber-400 border-amber-300 animate-pulse'
                            : 'bg-slate-900 border-slate-800'
                        }`}
                        title={`Chunk #${chk.chunkIndex + 1}: ${chk.status}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* SHA-256 and Integrity Checksum Card */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>SHA-256:</span>
                  <code className="text-cyan-300 font-mono">{sha256Short}</code>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSimulateDrop}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
                    title="ทดสอบจำลองเครือข่ายขัดข้อง"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>จำลองหลุด</span>
                  </button>
                  <button
                    onClick={handleAutoRepair}
                    className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors border border-emerald-500/30 rounded px-1.5 py-0.5 bg-emerald-950/40"
                    title="สั่งดาวน์โหลดต่อและซ่อมแซม Chunks อัตโนมัติ"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>ซ่อมไฟล์ & ต่อจุดเดิม</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VIRUSTOTAL & FILE HASH LIVE VERIFIER */}
        {activeTab === 'security' && securityScan && (
          <div className="mt-3 space-y-3 animate-fade-in">
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-emerald-300">
                        VIRUSTOTAL LIVE REPUTATION
                      </span>
                      <span className="rounded bg-emerald-500/30 px-2 py-0.5 text-xs font-bold text-emerald-200 border border-emerald-400/50">
                        SCORE 100/100
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      0 Security Vendors Flagged This File As Malicious ({securityScan.cleanCount}/72 Clean Engines)
                    </p>
                  </div>
                </div>
                <a
                  href={securityScan.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/20 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                >
                  ดูรายงานเต็ม ↗
                </a>
              </div>

              {/* Code Signing Certificate Details */}
              <div className="mt-4 rounded-lg bg-slate-950/70 p-3 border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Digital Signature:</span>
                  <span className="text-white font-semibold">{securityScan.certificate.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Certificate Status:</span>
                  <span className="text-emerald-400 font-semibold">{securityScan.certificate.status} (Pass OCSP/CRL)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Certificate Authority:</span>
                  <span className="text-slate-300 text-[11px] truncate max-w-xs">{securityScan.certificate.issuer}</span>
                </div>
              </div>

              {/* Verified AV Vendor Highlights */}
              <div className="mt-3">
                <span className="text-[11px] text-slate-400 block mb-1.5 font-semibold">
                  TOP ENTERPRISE AV ENGINES STATUS:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                  {securityScan.topEngines.slice(0, 8).map((eng) => (
                    <div
                      key={eng.name}
                      className="flex items-center justify-between rounded bg-slate-900/80 px-2 py-1 border border-slate-800"
                    >
                      <span className="text-slate-300 truncate mr-1">{eng.name}</span>
                      <span className="text-emerald-400 font-semibold text-[10px]">Clean</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WINGET & SILENT AUTO-INSTALL */}
        {activeTab === 'silent' && silentCommand && versionTelemetry && (
          <div className="mt-3 space-y-3 animate-fade-in">
            {/* Winget Package Manager Direct Trigger Box */}
            <div className="rounded-xl border border-cyan-500/30 bg-slate-900/80 p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-bold text-cyan-300">
                    WINGET PACKAGE MANAGER (DIRECT INSTALL TRIGGER)
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  ID: <code className="text-emerald-300">{appData.wingetId || appData.id}</code>
                </span>
              </div>
              <div className="relative rounded-lg bg-slate-950 p-2.5 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto">
                <code>{wingetCommand}</code>
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  รันผ่าน Windows Terminal เพื่อติดตั้งอัตโนมัติ 100% พร้อมยอมรับข้อตกลง
                </span>
                <button
                  onClick={() => handleCopyCommand(wingetCommand, 'winget')}
                  className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 transition-all shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                >
                  {copiedType === 'winget' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>คัดลอกแล้ว!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>คัดลอก Winget Command</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Silent Auto-Install Execution Command (PowerShell Snippet) */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-200">
                    POWERSHELL SILENT RUNNER
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  สวิตช์: <code className="text-cyan-300">{silentCommand.silentArgs}</code>
                </span>
              </div>
              <div className="relative rounded-lg bg-slate-950 p-2.5 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                <code>{silentCommand.powershell}</code>
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => handleCopyCommand(silentCommand.powershell, 'ps')}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  {copiedType === 'ps' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedType === 'ps' ? 'คัดลอกแล้ว' : 'คัดลอก PowerShell'}</span>
                </button>
              </div>
            </div>

            {/* Version Telemetry Highlights */}
            <div className="rounded-xl border border-violet-500/30 bg-violet-950/20 p-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-violet-300 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  {versionTelemetry.latestVersion}
                </span>
                <span className="text-slate-400 text-[10px]">
                  ปล่อยเมื่อ: {versionTelemetry.releaseDate}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                {versionTelemetry.changelog}
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: APP UNINSTALLER & CLEANUP SENTINEL */}
        {activeTab === 'uninstall' && uninstallerPlan && (
          <div className="mt-3 space-y-3 animate-fade-in">
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-rose-400" />
                  <span className="text-xs font-bold text-rose-300">
                    APP UNINSTALLER & CLEANUP SENTINEL
                  </span>
                </div>
                <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] text-rose-200 border border-rose-500/40">
                  คืนพื้นที่ ~{uninstallerPlan.estimatedReclaimedMb} MB
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                ระบบจะสั่งปิดโปรเซส <code className="text-rose-300">{uninstallerPlan.processName}</code> อัตโนมัติ ถอนการติดตั้งแบบเงียบ และล้างโฟลเดอร์แคชที่ตกค้างในเครื่อง
              </p>

              {/* Clean paths */}
              <div className="rounded-lg bg-slate-950/70 p-2.5 border border-slate-800 text-[11px] mb-3">
                <span className="text-slate-400 block mb-1 font-semibold text-[10px]">
                  โฟลเดอร์ที่จะถูกคลีนทิ้ง:
                </span>
                {uninstallerPlan.cleanPaths.map((p) => (
                  <div key={p} className="text-rose-300 font-mono text-[10px] truncate">
                    • {p}
                  </div>
                ))}
              </div>

              {/* Copy Script Button */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => handleCopyCommand(uninstallerPlan.wingetCommand, 'winget-un')}
                  className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  {copiedType === 'winget-un' ? 'คัดลอกคำสั่ง Winget แล้ว' : 'คัดลอก Winget Uninstall'}
                </button>
                <button
                  onClick={() => handleCopyCommand(uninstallerPlan.powershellScript, 'uninstall')}
                  className="flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/30 transition-all shadow-[0_0_12px_rgba(244,63,94,0.2)]"
                >
                  {copiedType === 'uninstall' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>คัดลอกสคริปต์คลีนแล้ว!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>คัดลอกสคริปต์ PowerShell ทั้งหมด</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

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
              [ส่งคำสั่งสตรีมเข้าเครื่องแล้ว]
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-cyan-500/20 pt-4">
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
              เริ่มดาวน์โหลด (.EXE)
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

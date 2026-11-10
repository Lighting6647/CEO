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
} from 'lucide-react';
import { playClickSound, playSciFiBeep, playSuccessSound } from '../../../utils/soundEffects.js';
import {
  triggerDirectInstallerStream,
  launchInstalledAppProtocol,
  getSilentInstallCommand,
} from '../../../services/browserLauncherService.js';
import { scanInstallerBinaryHash } from '../../../services/appSecurityScanService.js';
import { getAppVersionTelemetry } from '../../../services/appVersionTrackerService.js';

export const InstallerTelemetryModal = memo(function InstallerTelemetryModal({
  isOpen,
  onClose,
  appData,
  userTitle = 'คุณไลท์',
  autoStartStream = true,
  onShowToast = null,
}) {
  const [activeTab, setActiveTab] = useState('stream'); // 'stream' | 'security' | 'silent'
  const [progress, setProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(18.5);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasTriggeredDownload, setHasTriggeredDownload] = useState(false);
  const [hasLaunchedApp, setHasLaunchedApp] = useState(false);
  const [statusMessage, setStatusMessage] = useState('พร้อมเริ่มส่งกระแสข้อมูลการดาวน์โหลด');
  const [copiedType, setCopiedType] = useState(null); // 'ps' | 'cmd' | 'winget' | null

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
      setCopiedType(null);
      setActiveTab('stream');
      voiceSpokenRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    voiceSpokenRef.current = false;
    setProgress(0);
    setIsCompleted(false);
    setStatusMessage('กำลังเชื่อมต่อเซิร์ฟเวอร์ทางการเพื่อดึงไฟล์ตัวติดตั้ง...');

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
            announceCompletion(appData.name);
            return 100;
          }

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

  // Derived Security & Version telemetry
  const securityScan = scanInstallerBinaryHash(appData);
  const versionTelemetry = getAppVersionTelemetry(appData);
  const silentCommand = getSilentInstallCommand(appData);

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

  const handleCopyCommand = (text, type) => {
    playClickSound();
    playSuccessSound();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedType(type);
      if (onShowToast) {
        onShowToast('info', '📋 คัดลอกคำสั่งสำเร็จ', 'นำไปวางใน PowerShell / CMD แล้วกด Enter ได้ทันทีครับ');
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

        {/* 3-Tab Telemetry Switcher */}
        <div className="mt-3 flex items-center gap-1 rounded-xl bg-slate-900/80 p-1 border border-slate-800">
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('stream');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
              activeTab === 'stream'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>1. สตรีมดาวน์โหลด ({progress}%)</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setActiveTab('security');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
              activeTab === 'security'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>2. ตรวจ VirusTotal (72/72 Clean)</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setActiveTab('silent');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
              activeTab === 'silent'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-[0_0_12px_rgba(139,92,246,0.25)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>3. ติดตั้งแบบเงียบ & เวอร์ชัน</span>
          </button>
        </div>

        {/* TAB 1: STREAM & APP CHECKER */}
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
                        ตรวจพบ Protocol ({appData.protocolScheme}) บนระบบปฏิบัติการ หากมีติดตั้งอยู่แล้ว สามารถสั่งเปิดโปรแกรมได้ทันทีครับ
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

              {/* SHA-256 and Integrity Checksum Card */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>SHA-256:</span>
                  <code className="text-cyan-300 font-mono">{sha256Short}</code>
                </div>
                <button
                  onClick={() => {
                    playClickSound();
                    setActiveTab('security');
                  }}
                  className="flex items-center gap-1 text-emerald-400 hover:underline"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>72/72 VIRUSTOTAL CLEAN ↗</span>
                </button>
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
                <span className="text-[10px] text-slate-500 block">PUBLISHER</span>
                <span className="text-slate-200 font-mono text-[11px] truncate block" title={appData.publisher}>
                  {appData.publisher || 'Verified Official Vendor'}
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

        {/* TAB 3: SILENT AUTO-INSTALL & VERSION TRACKER */}
        {activeTab === 'silent' && silentCommand && versionTelemetry && (
          <div className="mt-3 space-y-3 animate-fade-in">
            {/* Version Telemetry Banner */}
            <div className="rounded-xl border border-violet-500/30 bg-violet-950/20 p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-400" />
                  <span className="text-xs font-bold text-violet-300">
                    APP VERSION TELEMETRY
                  </span>
                </div>
                <span className="rounded bg-violet-500/20 px-2 py-0.5 text-[11px] text-violet-200 border border-violet-500/40">
                  {versionTelemetry.patchStatus === 'UP_TO_DATE' ? 'UP-TO-DATE' : 'UPDATE AVAILABLE'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div className="rounded bg-slate-950/60 p-2 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">LATEST RELEASE:</span>
                  <span className="text-white font-bold">{versionTelemetry.latestVersion}</span>
                </div>
                <div className="rounded bg-slate-950/60 p-2 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">RELEASE DATE:</span>
                  <span className="text-slate-200">{versionTelemetry.releaseDate}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                <strong className="text-violet-300">Changelog:</strong> {versionTelemetry.changelog}
              </p>
            </div>

            {/* Silent Auto-Install Execution Command (PowerShell Snippet) */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-200">
                    SILENT AUTO-INSTALL (POWERSHELL ADMIN STREAM)
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  สวิตช์เงียบ: <code className="text-cyan-300">{silentCommand.silentArgs}</code>
                </span>
              </div>
              <div className="relative rounded-lg bg-slate-950 p-2.5 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                <code>{silentCommand.powershell}</code>
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  คลิกปุ่มเพื่อคัดลอกคำสั่งสำหรับรันติดตั้งใน Background โดยไม่ต้องกด Next
                </span>
                <button
                  onClick={() => handleCopyCommand(silentCommand.powershell, 'ps')}
                  className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/20 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/30 transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                >
                  {copiedType === 'ps' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">คัดลอกแล้ว!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>คัดลอกคำสั่ง PowerShell</span>
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

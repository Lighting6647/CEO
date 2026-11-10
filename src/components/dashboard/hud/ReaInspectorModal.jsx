import { useState, useEffect, useCallback } from 'react';
import {
  X,
  Search,
  Sparkles,
  Layers,
  ShieldAlert,
  Code2,
  FileText,
  Copy,
  Check,
  Download,
  Pin,
  Volume2,
  RefreshCw,
  Cpu,
  ExternalLink,
} from 'lucide-react';
import { playClickSound, playSuccessSound, playSciFiBeep } from '../../../utils/soundEffects';
import { analyzeTargetWebapp, formatSpeechSummary } from '../../../services/reaAuditService';
import { openSystemBrowser } from '../../../services/browserLauncherService';

const TARGET_PRESETS = [
  { label: '🛒 E-Commerce & POS', url: 'https://store.example.com' },
  { label: '🎫 Concert Ticketing', url: 'https://ticket.example.com' },
  { label: '⚡ SaaS Dashboard', url: 'https://dashboard.example.com' },
  { label: '🔐 Auth & Security Vault', url: 'https://vault.example.com' },
];

export function ReaInspectorModal({
  isOpen,
  onClose,
  initialTarget = '',
  userTitle = 'sir ไลท์',
  onPinMemory,
  onSpeak,
  onShowToast,
}) {
  const [targetInput, setTargetInput] = useState(initialTarget || 'https://example.com');
  const [inspectMode, setInspectMode] = useState('DEEP_DOM_STATE');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [auditResult, setAuditResult] = useState(null);
  const [activeTab, setActiveTab] = useState('stack');
  const [copied, setCopied] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const runAudit = useCallback(
    async (targetToScan) => {
      const raw = (targetToScan || targetInput || '').trim();
      if (!raw) return;

      playSciFiBeep();
      setIsScanning(true);
      setScanStep(1);
      setAuditResult(null);
      setIsPinned(false);

      const timer1 = setTimeout(() => setScanStep(2), 220);
      const timer2 = setTimeout(() => setScanStep(3), 450);
      const timer3 = setTimeout(() => setScanStep(4), 700);

      try {
        const result = await analyzeTargetWebapp(raw, { mode: inspectMode });
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        setScanStep(4);
        setTimeout(() => {
          setAuditResult(result);
          setIsScanning(false);
          playSuccessSound();
        }, 300);
      } catch {
        setIsScanning(false);
      }
    },
    [targetInput, inspectMode]
  );

  useEffect(() => {
    if (isOpen && initialTarget) {
      setTargetInput(initialTarget);
      runAudit(initialTarget);
    }
  }, [isOpen, initialTarget, runAudit]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopySpec = () => {
    if (!auditResult?.markdownSpec) return;
    playClickSound();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(auditResult.markdownSpec);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
      onShowToast?.('📋 คัดลอก Architecture Spec ลง Clipboard เรียบร้อยครับ');
    }
  };

  const handleDownloadSpec = () => {
    if (!auditResult?.markdownSpec) return;
    playClickSound();
    const blob = new Blob([auditResult.markdownSpec], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rea-spec-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast?.('📥 ดาวน์โหลดไฟล์ rea-spec.md เรียบร้อยครับ');
  };

  const handlePinToMem0 = () => {
    if (!auditResult) return;
    playClickSound();
    if (onPinMemory) {
      const summary = `[REA Reverse Audit] Target: ${auditResult.target} | Stack: ${auditResult.stack.map((s) => s.name).join(', ')}`;
      const ok = onPinMemory(`REA Reverse Engineer ${auditResult.target}`, auditResult.markdownSpec || summary);
      if (ok) {
        setIsPinned(true);
        onShowToast?.('📌 ปักหมุด Architecture Spec เข้าสู่คลังความจำ Mem0 แล้ว');
      }
    }
  };

  const handleSpeakSummary = () => {
    if (!auditResult || !onSpeak) return;
    playClickSound();
    const speech = formatSpeechSummary(auditResult, userTitle);
    onSpeak(speech);
  };

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rea-inspector-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-2xl border-2 border-cyan-400/80 bg-[#020b22] p-4 sm:p-6 shadow-[0_0_60px_rgba(0,240,255,0.35)] flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <Cpu className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 id="rea-inspector-title" className="text-sm sm:text-base font-black tracking-wider text-cyan-100 font-mono flex items-center gap-2">
                REA REVERSE ENGINEER INSPECTOR
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300">
                  v6.8.0 ACTIVE
                </span>
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                ตรวจจับโครงสร้าง สกัดสถาปัตยกรรม State & API Surface ด้วย REA Agents
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className="rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-slate-400 hover:text-white hover:border-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Input & Target Bar */}
        <div className="space-y-2 mb-3 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runAudit(targetInput);
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400/70" />
              <input
                type="text"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                placeholder="ป้อน URL หรือ Package Path เช่น https://example.com"
                className="w-full rounded-xl border border-cyan-500/40 bg-slate-900/90 pl-9 pr-3 py-2 text-xs text-cyan-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isScanning}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 active:scale-95 disabled:opacity-50 transition cursor-pointer shadow-md"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>กำลังสแกน...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>สแกน REA</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                if (targetInput) openSystemBrowser(targetInput);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-cyan-500/50 bg-slate-900 px-3 py-2 text-xs font-bold text-cyan-300 hover:bg-slate-800 hover:text-white active:scale-95 transition cursor-pointer shadow-sm"
              title="เปิดดูเว็บไซต์จริงในเบราว์เซอร์ของระบบปฏิบัติการ"
            >
              <ExternalLink className="h-3.5 w-3.5 text-cyan-400" />
              <span>เปิดเว็บจริง</span>
            </button>
          </form>

          {/* Quick Presets & Mode Selector */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] font-mono">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-500 mr-1">เป้าหมายจำลอง:</span>
              {TARGET_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTargetInput(preset.url);
                    runAudit(preset.url);
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-cyan-500/30">
              <button
                type="button"
                onClick={() => setInspectMode('FAST_SURFACE')}
                className={`px-2 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${
                  inspectMode === 'FAST_SURFACE' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-cyan-300'
                }`}
              >
                Fast Surface
              </button>
              <button
                type="button"
                onClick={() => setInspectMode('DEEP_DOM_STATE')}
                className={`px-2 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${
                  inspectMode === 'DEEP_DOM_STATE' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-cyan-300'
                }`}
              >
                Deep Reverse
              </button>
            </div>
          </div>
        </div>

        {/* Live Scanning Step Progress Bar */}
        {isScanning && (
          <div className="rounded-xl border border-cyan-500/50 bg-slate-900/90 p-4 mb-3 text-center space-y-2 animate-fade-in shrink-0">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
              <span className="font-bold">REA REVERSE PIPELINE ACTIVE</span>
              <span className="text-emerald-400 font-bold">{scanStep * 25}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-cyan-500/30">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 rounded-full transition-all duration-200"
                style={{ width: `${scanStep * 25}%` }}
              />
            </div>
            <p className="text-[11px] font-mono text-slate-300 animate-pulse">
              {scanStep === 1 && '1/4 เชื่อมต่อ Target URL & Tap Network Headers...'}
              {scanStep === 2 && '2/4 Decompiling DOM, Asset Bundles & Layout Hierarchy...'}
              {scanStep === 3 && '3/4 Tracing API Routes, Inferred State & Auth Surfaces...'}
              {scanStep === 4 && '4/4 สร้าง Reconstruction Obligation Ledger สำเร็จ!'}
            </p>
          </div>
        )}

        {/* Results Body */}
        {auditResult && !isScanning && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Tabs Header */}
            <div className="flex items-center gap-1.5 border-b border-cyan-500/20 pb-2 mb-2.5 text-xs font-mono shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('stack')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  activeTab === 'stack'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-cyan-200 hover:bg-slate-900'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Tech Stack ({auditResult.stack.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('apis')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  activeTab === 'apis'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-cyan-200 hover:bg-slate-900'
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>API Surface ({auditResult.apis.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('spec')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  activeTab === 'spec'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-cyan-200 hover:bg-slate-900'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Architecture Spec</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  activeTab === 'security'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-cyan-200 hover:bg-slate-900'
                }`}
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Security Posture</span>
              </button>
            </div>

            {/* Tab 1: Tech Stack */}
            {activeTab === 'stack' && (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {auditResult.stack.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono block">{item.category}</span>
                        <span className="text-xs sm:text-sm font-bold text-cyan-200">{item.name}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] border border-emerald-500/30">
                        {item.confidence}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-bold font-mono">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>คำแนะนำการ Reconstruction (โคลนระบบโดยปราศจาก AI Slop):</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    ระบบสถาปัตยกรรมของเป้าหมายมีความเหมาะสมในการจำลองด้วย Next.js / Vite ควบคู่กับ Tailwind CSS โดยสามารถนำ Token สีและขนาด Layout มาใช้ใน D:\Light ได้อย่างสมบูรณ์แบบ
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: APIs */}
            {activeTab === 'apis' && (
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {auditResult.apis.map((api, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          api.method === 'GET'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {api.method}
                      </span>
                      <span className="text-cyan-200 font-semibold truncate">{api.endpoint}</span>
                    </div>
                    <span className="text-slate-400 text-[10px] shrink-0">{api.purpose}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Spec Markdown Preview */}
            {activeTab === 'spec' && (
              <div className="flex-1 overflow-y-auto p-3 rounded-xl bg-slate-950 border border-cyan-500/30 text-xs font-mono text-slate-200 whitespace-pre-wrap select-text custom-scrollbar leading-relaxed">
                {auditResult.markdownSpec}
              </div>
            )}

            {/* Tab 4: Security */}
            {activeTab === 'security' && (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {auditResult.security.map((sec, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono block">{sec.gate}</span>
                        <span className="text-xs font-semibold text-slate-200">{sec.status}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold font-mono text-xs border border-cyan-500/30">
                        {sec.grade}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Action Toolbar */}
            <div className="mt-3 pt-2.5 border-t border-cyan-500/30 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSpeakSummary}
                  className="flex items-center gap-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 px-3 py-1.5 font-bold text-cyan-300 border border-cyan-500/40 transition cursor-pointer"
                  title="ให้ J.A.R.V.I.S. รายงานสรุปทางเสียง"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>รายงานสรุป</span>
                </button>

                <button
                  type="button"
                  onClick={handlePinToMem0}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold border transition cursor-pointer ${
                    isPinned
                      ? 'border-purple-400 bg-purple-950/80 text-purple-200'
                      : 'border-purple-500/40 bg-slate-900 text-purple-300 hover:bg-slate-800'
                  }`}
                  title="ปักหมุด Architecture Spec ลง Mem0 Long-term Memory"
                >
                  <Pin className={`h-3.5 w-3.5 ${isPinned ? 'fill-purple-400 text-purple-300' : 'text-purple-400'}`} />
                  <span>{isPinned ? '✓ ปักหมุด Mem0 แล้ว' : 'ปักหมุดเข้า Mem0'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySpec}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-bold text-slate-300 hover:text-white hover:border-cyan-400 transition cursor-pointer"
                  title="คัดลอก Architecture Spec ทั้งหมด"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอก Spec'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSpec}
                  className="flex items-center gap-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 px-3 py-1.5 font-bold text-slate-950 transition cursor-pointer shadow-md"
                  title="ดาวน์โหลดเป็นไฟล์ markdown (.md)"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>ดาวน์โหลด Spec</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

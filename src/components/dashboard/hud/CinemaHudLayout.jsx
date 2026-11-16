import { useState } from 'react';
import {
  Mic,
  MicOff,
  FileText,
  Activity,
  Globe,
  Building2,
  LayoutDashboard,
  Sliders,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { JarvisNeuralSphere } from './JarvisNeuralSphere';
import { INITIAL_PROJECTS } from '../../../data/projectsData';

/**
 * Cinema-Grade J.A.R.V.I.S. Hologram Matrix + Electric Arc Fullscreen HUD (Design Option 1).
 * Connects directly to live voice recognition, Meeting Notes, AI Monitor, and all 16 projects.
 */
export function CinemaHudLayout({
  userTitle = 'คุณไลท์',
  isListening = false,
  isSpeaking = false,
  isRedAlert = false,
  audioLevel = 0,
  liveTranscript = '',
  messages = [],
  onToggleMic,
  onDispatchCommand,
  onOpenMeetingModal,
  onOpenAiMonitorModal,
  onOpenAdmin,
  onOpenCompany,
  onOpenVoiceModal,
  onOpenShortcutsModal,
  onOpenWebFill,
  onSwitchClassic,
}) {
  const [commandInput, setCommandInput] = useState('');

  const latestJarvis =
    [...messages].reverse().find((m) => m.sender === 'JARVIS')?.text ||
    `เชื่อมต่อพลังงานแกนกลางสมบูรณ์แล้วครับ${userTitle} พร้อมสั่งการทั้ง ${INITIAL_PROJECTS.length} โปรเจกต์`;

  const featuredProjects = [
    INITIAL_PROJECTS.find((p) => p.id === 'tamsang'),
    INITIAL_PROJECTS.find((p) => p.id === 'concert-ticket'),
    INITIAL_PROJECTS.find((p) => p.id === 'inventory-ai'),
    INITIAL_PROJECTS.find((p) => p.id === 'pass-app'),
  ].filter(Boolean);

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = commandInput.trim();
    if (!clean) return;
    onDispatchCommand?.(clean);
    setCommandInput('');
  };

  return (
    <div
      className={`relative w-full min-h-screen overflow-hidden font-mono flex flex-col justify-between p-4 sm:p-6 ${
        isRedAlert ? 'bg-[#0b0205] text-rose-50' : 'bg-[#03040a] text-amber-50'
      }`}
    >
      {/* Volumetric Cinema Backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isRedAlert
            ? 'radial-gradient(circle at 50% 50%, rgba(244,63,94,0.18), rgba(14,165,233,0.06) 44%, transparent 74%)'
            : 'radial-gradient(circle at 50% 50%, rgba(249,115,22,0.16), rgba(14,165,233,0.07) 44%, transparent 74%)',
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#f59e0b18_1px,transparent_1px),linear-gradient(to_bottom,#38bdf818_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Top Helmet Telemetry Bar */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/25 pb-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isRedAlert
                ? 'bg-rose-500 shadow-[0_0_12px_#f43f5e]'
                : 'bg-amber-400 shadow-[0_0_12px_#fbbf24]'
            }`}
          />
          <span className="font-bold tracking-wider text-amber-300">
            J.A.R.V.I.S. NEURAL MATRIX // STARK LAB HOLOGRAM
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sky-300">VOICEPRINT: {userTitle}</span>
          <span className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-emerald-300">
            {INITIAL_PROJECTS.length} APPS · 100%
          </span>
          {onOpenCompany && (
            <button
              type="button"
              onClick={onOpenCompany}
              className="inline-flex items-center gap-1 rounded-md border border-cyan-500/40 bg-cyan-950/50 px-2.5 py-1 text-cyan-200 hover:bg-cyan-900/60 cursor-pointer"
            >
              <Building2 className="h-3.5 w-3.5" /> Company Hub
            </button>
          )}
          {onOpenAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-slate-200 hover:border-amber-400/50 cursor-pointer"
            >
              <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
            </button>
          )}
          {onSwitchClassic && (
            <button
              type="button"
              onClick={onSwitchClassic}
              className="inline-flex items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-amber-200 hover:bg-amber-500/20 cursor-pointer"
              title="สลับกลับหน้า Classic Cockpit HUD"
            >
              <Sliders className="h-3.5 w-3.5" /> Classic HUD
            </button>
          )}
        </div>
      </header>

      {/* Main Cinema Stage: Left Glass Wing + 3D Sphere + Right Glass Wing */}
      <main className="relative z-10 my-4 grid grid-cols-1 lg:grid-cols-12 items-center gap-5 max-w-7xl w-full mx-auto">
        {/* Left Translucent Glass Wing */}
        <section className="lg:col-span-3 rounded-2xl border-l-2 border-y border-sky-400/40 bg-slate-950/45 p-4 space-y-3 text-xs backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-sky-500/20 pb-1.5 font-bold text-sky-300">
            <span>FLEET TELEMETRY</span>
            <span className="text-amber-300">{INITIAL_PROJECTS.length} / {INITIAL_PROJECTS.length}</span>
          </div>
          <div className="space-y-2 text-slate-200">
            {featuredProjects.map((proj) => (
              <div key={proj.id} className="flex items-center justify-between gap-2">
                <span className="truncate">{proj.name}</span>
                <span className="shrink-0 text-emerald-400">{proj.score}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-sky-500/20 pt-2 flex items-center justify-between text-sky-300/80">
            <span>ENERGY ARC</span>
            <span className={isListening ? 'text-emerald-400 font-bold' : 'text-amber-300'}>
              {isListening ? 'LISTENING' : isSpeaking ? 'SPEAKING' : 'ACTIVE'}
            </span>
          </div>
        </section>

        {/* Center 3D Cinema Hologram Sphere */}
        <section className="lg:col-span-6 flex flex-col items-center justify-center relative py-2">
          <div className="relative flex items-center justify-center">
            <JarvisNeuralSphere
              isAlarm={isRedAlert}
              audioLevel={audioLevel}
              className="w-[300px] h-[300px] sm:w-[380px] sm:h-[380px]"
            />
          </div>
          {liveTranscript && (
            <div className="mt-2 rounded-full border border-sky-400/40 bg-slate-950/80 px-4 py-1 text-xs text-sky-200">
              🎤 {liveTranscript}
            </div>
          )}
        </section>

        {/* Right Translucent Glass Wing */}
        <section className="lg:col-span-3 rounded-2xl border-r-2 border-y border-amber-400/40 bg-slate-950/45 p-4 space-y-3 text-xs backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-1.5 font-bold text-amber-300">
            <span className="text-sky-300">MK-III</span>
            <span>ACTIVE MODULES</span>
          </div>
          <div className="space-y-2 text-slate-200">
            <button
              type="button"
              onClick={onOpenMeetingModal}
              className="w-full flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/50 px-2.5 py-1.5 hover:border-cyan-400/50 cursor-pointer"
            >
              <span>🎙️ Meeting Notes</span>
              <span className="text-cyan-300">th-TH</span>
            </button>
            <button
              type="button"
              onClick={onOpenAiMonitorModal}
              className="w-full flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/50 px-2.5 py-1.5 hover:border-emerald-400/50 cursor-pointer"
            >
              <span>📊 AI Providers</span>
              <span className="text-emerald-400">4 Ready</span>
            </button>
            <button
              type="button"
              onClick={onOpenWebFill}
              className="w-full flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/50 px-2.5 py-1.5 hover:border-amber-400/50 cursor-pointer"
            >
              <span>🛡️ Smart Fill</span>
              <span className="text-amber-300">6 Fields</span>
            </button>
            <button
              type="button"
              onClick={onOpenShortcutsModal}
              className="w-full flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/50 px-2.5 py-1.5 hover:border-sky-400/50 cursor-pointer"
            >
              <span>⚡ Voice Shortcuts</span>
              <span className="text-sky-300">Armed</span>
            </button>
          </div>
          <div className="border-t border-amber-500/20 pt-2 flex items-center justify-between text-emerald-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> 5 IRONCLAD RULES
            </span>
            <span>ARMED</span>
          </div>
        </section>
      </main>

      {/* Bottom Movie Subtitle + Command Input + Action Dock */}
      <footer className="relative z-10 space-y-3 border-t border-amber-500/25 pt-3 text-xs max-w-6xl w-full mx-auto">
        <div className="rounded-xl border border-amber-500/35 bg-slate-950/75 backdrop-blur-md px-4 py-2.5 text-center text-amber-100 leading-relaxed">
          <span className="text-amber-400 font-bold">[J.A.R.V.I.S.]:</span> {latestJarvis}
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onToggleMic}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 font-bold cursor-pointer transition-all ${
                isListening
                  ? 'border-rose-400 bg-rose-500/25 text-rose-200 animate-pulse'
                  : 'border-amber-400/70 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30'
              }`}
            >
              {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              {isListening ? 'หยุดฟังเสียง' : 'พูดสั่งจาวิส'}
            </button>
            <button
              type="button"
              onClick={onOpenMeetingModal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-slate-900/80 px-3 py-2 text-sky-200 hover:border-sky-400 cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5" /> อัดประชุม
            </button>
            <button
              type="button"
              onClick={onOpenAiMonitorModal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-slate-900/80 px-3 py-2 text-emerald-200 hover:border-emerald-400 cursor-pointer"
            >
              <Activity className="h-3.5 w-3.5" /> AI Status
            </button>
            <button
              type="button"
              onClick={onOpenWebFill}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-200 hover:border-amber-400/50 cursor-pointer"
            >
              <Globe className="h-3.5 w-3.5" /> Web Fill
            </button>
            {onOpenVoiceModal && (
              <button
                type="button"
                onClick={onOpenVoiceModal}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-300 hover:border-cyan-400/50 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" /> เสียง
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-1 md:max-w-sm">
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder='พิมพ์คำสั่ง เช่น "เปิดอัดประชุม", "เช็ค AI Status"...'
              className="w-full rounded-lg border border-amber-500/30 bg-slate-950/90 px-3 py-2 text-xs text-amber-50 placeholder-slate-500 focus:border-amber-400 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-2 font-bold text-slate-950 hover:bg-amber-400 cursor-pointer shrink-0"
              aria-label="ส่งคำสั่ง"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}

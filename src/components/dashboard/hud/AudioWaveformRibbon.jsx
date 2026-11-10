import { useState, useEffect, useMemo } from 'react';
import { Brain, Fingerprint, Mic } from 'lucide-react';
import { getStoredMemories } from '../../../services/mem0Service';

export function AudioWaveformRibbon({
  isListening,
  isSpeaking,
  isAlert,
  audioLevel = 0,
  continuousVoice,
  onToggleContinuous,
  onOpenMem0,
  onOpenVoiceprint,
  voiceprintOwner = 'sir ไลท์',
  liveTranscript = '',
  micGain = 2.0,
  onCycleMicGain,
}) {
  const bars = useMemo(() => Array.from({ length: 32 }, (_, i) => i), []);
  const [memoryCount, setMemoryCount] = useState(4);

  useEffect(() => {
    try {
      const mems = getStoredMemories();
      setMemoryCount(mems.length);
    } catch {}
  }, [isSpeaking]);

  const themeColor = isAlert
    ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]'
    : isSpeaking
    ? 'bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]'
    : isListening
    ? 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]'
    : 'bg-cyan-500/40 shadow-cyan-500/20';

  const statusText = isSpeaking
    ? `J.A.R.V.I.S. SPEAKING ${audioLevel > 0.05 ? `[${Math.round(audioLevel * 100)}%]` : ''}`
    : isListening
    ? `LISTENING TO SIR ไลท์ ${audioLevel > 0.05 ? `[${Math.round(audioLevel * 100)}%]` : ''}`
    : 'VOICE COGNITION READY';

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl border border-cyan-500/40 bg-slate-950/80 backdrop-blur-xl shadow-[0_0_25px_rgba(6,182,212,0.15)]">
      {/* 32 Neon Acoustic Waveform Bars */}
      <div className="h-7 flex items-center justify-center gap-1 w-full overflow-hidden px-2">
        {bars.map((idx) => {
          // Sinusoidal energy pattern for authentic Iron Man HUD aesthetic
          const centerDist = Math.abs(idx - 15.5) / 15.5;
          const energyFactor = 1 - centerDist * 0.45;

          // Reactive calculation when audioLevel is present
          let dynamicHeight = 4;
          if (audioLevel > 0.03) {
            const harmonic = Math.sin((idx * 0.8) + Date.now() * 0.006) * 0.3 + 0.7;
            dynamicHeight = Math.max(4, Math.min(26, Math.round(audioLevel * 26 * energyFactor * harmonic + 3)));
          } else if (isSpeaking || isListening) {
            dynamicHeight = Math.max(5, Math.min(24, Math.round((8 + ((idx * 9) % 18)) * energyFactor)));
          } else {
            dynamicHeight = Math.max(3, Math.round(5 * energyFactor));
          }

          return (
            <div
              key={idx}
              className={`w-1 rounded-full transition-all duration-75 ${themeColor}`}
              style={{
                height: `${dynamicHeight}px`,
                animation:
                  audioLevel <= 0.03 && (isSpeaking || isListening)
                    ? `pulse 0.45s ease-in-out infinite alternate ${(idx * 0.035).toFixed(3)}s`
                    : 'none',
              }}
            />
          );
        })}
      </div>

      {/* Live Speech Recognition Real-Time Transcript */}
      {liveTranscript ? (
        <div className="w-full text-center px-3 py-1 rounded-lg bg-cyan-950/80 border border-cyan-400/60 text-cyan-200 text-[11px] font-mono shadow-[0_0_15px_rgba(6,182,212,0.35)] animate-pulse flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="truncate max-w-sm">"{liveTranscript}"</span>
        </div>
      ) : null}

      {/* Control Bar: Status + Mem0 Indicator + Continuous Stream Toggle */}
      <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 px-1 border-t border-slate-800/80 pt-1.5">
        <span className="flex items-center gap-1.5 text-cyan-300 font-bold tracking-wider">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isSpeaking
                ? 'bg-cyan-400 animate-ping'
                : isListening
                ? 'bg-emerald-400 animate-pulse'
                : 'bg-slate-500'
            }`}
          />
          {statusText}
        </span>

        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {/* Microphone Sensitivity Gain Booster Pill (for Quiet Mics) */}
          <button
            type="button"
            onClick={onCycleMicGain}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold border transition-all cursor-pointer shadow-sm hover:scale-105 ${
              micGain > 1.0
                ? 'bg-amber-950/70 border-amber-500/60 text-amber-300 hover:bg-amber-900/80 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="ขยายสัญญาณไมโครโฟน (แตะเพื่อปรับ: 1.0x -> 1.5x -> 2.0x -> 3.0x -> 4.0x สำหรับไมค์เบา)"
          >
            <Mic className="w-2.5 h-2.5 text-amber-400" />
            <span>บูสต์ไมค์: {micGain}x</span>
          </button>

          {/* Voiceprint Biometric Status Pill */}
          <button
            type="button"
            onClick={onOpenVoiceprint}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/80 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
            title="เปิดระบบจดจำเสียงชีวมิติผู้สั่งการ (Voice Biometrics Identification)"
          >
            <Fingerprint className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
            <span>VOICE ID: {voiceprintOwner}</span>
          </button>

          {/* Mem0 Long-term Memory Pill */}
          <button
            type="button"
            onClick={onOpenMem0}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-purple-950/70 border border-purple-500/50 text-purple-300 hover:bg-purple-900/80 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
            title="เปิดดูและจัดการความจำระยะยาวของ J.A.R.V.I.S. (Mem0 Ecosystem Context)"
          >
            <Brain className="w-2.5 h-2.5 text-purple-400 animate-pulse" />
            <span>MEM0 ({memoryCount})</span>
          </button>

          {/* Hands-free Continuous Loop Switch */}
          <button
            type="button"
            onClick={onToggleContinuous}
            className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer border ${
              continuousVoice
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 hover:bg-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="เปิด/ปิดโหมดสนทนาต่อเนื่องอัตโนมัติ (ไม่ต้องกดไมค์ใหม่หลัง AI พูดจบ)"
          >
            {continuousVoice ? '🎙️ AUTO STREAM: ON' : '🎙️ AUTO STREAM: OFF'}
          </button>
        </div>
      </div>
    </div>
  );
}

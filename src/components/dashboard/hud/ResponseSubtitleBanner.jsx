import { useEffect, useState } from 'react';
import { Sparkles, Eye, X, Volume2, Pin, Timer } from 'lucide-react';
import { playClickSound } from '../../../utils/soundEffects';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { extractDestination } from '../../../utils/routeIntel';
import { RouteMapWidget } from './RouteMapWidget';

/**
 * Non-blocking holographic response banner.
 * Shows only the question asked + the on-topic answer, with:
 *  - Interactive route map for traffic questions
 *  - Auto-dismiss countdown after J.A.R.V.I.S. stops speaking (pauses on hover/focus)
 */
export function ResponseSubtitleBanner({
  userTitle,
  query,
  reply,
  delegatedTo,
  resetKey,
  topic, // 'traffic' | 'weather' | 'news' | 'general'
  isSpeaking,
  isProcessing,
  onExpand,
  onDismiss,
  onSpeak,
  onPinMemory,
}) {
  const [hovered, setHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    setIsPinned(false);
  }, [resetKey]);

  const { seconds, remainingMs, progress, cycleSeconds } = useAutoDismiss({
    armed: Boolean(reply) && !isSpeaking && !isProcessing,
    paused: hovered,
    resetKey: `${resetKey}-${isSpeaking}`,
    onDismiss,
  });

  const destination = topic === 'traffic' ? extractDestination(query) : null;

  const topicLabel =
    topic === 'traffic'
      ? '🚗 TRAFFIC & NAVIGATION'
      : topic === 'weather'
      ? '🌤️ METEOROLOGICAL TELEMETRY'
      : topic === 'news'
      ? '📰 DAILY NEWS INTELLIGENCE'
      : 'J.A.R.V.I.S. RESPONSE';

  return (
    <div
      style={{ transform: 'perspective(1000px) rotateX(4deg)' }}
      className="absolute -top-6 z-40 w-[94%] max-w-[540px] animate-fade-in pointer-events-auto"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <div className="relative overflow-hidden rounded-2xl border-2 border-cyan-400/90 bg-[#020b22]/95 p-3.5 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,240,255,0.4)]">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 text-[10px] text-cyan-300 font-mono pb-1.5 mb-2 border-b border-cyan-500/30">
          <span className="flex items-center gap-1.5 font-bold tracking-wider truncate">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />
            <span className="truncate">{topicLabel}</span>
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {isSpeaking && (
              <span className="text-emerald-400 text-[9px] px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 animate-pulse">
                ● SPEAKING
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                playClickSound();
                cycleSeconds();
              }}
              className="flex items-center gap-1 text-[9px] text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-amber-500/40 hover:border-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 cursor-pointer"
              title="ตั้งเวลาซ่อนแถบคำตอบอัตโนมัติหลังพูดจบ (คลิกเพื่อสลับ)"
            >
              <Timer className="w-2.5 h-2.5" />
              {seconds === 0 ? 'ซ่อนอัตโนมัติ: ปิด' : hovered ? 'หยุดนับชั่วคราว' : `${Math.ceil(remainingMs / 1000)}s`}
            </button>
            <button
              type="button"
              onClick={() => {
                playClickSound();
                onExpand?.();
              }}
              className="flex items-center gap-1 text-[9px] text-cyan-300 hover:text-white bg-slate-900 px-2 py-0.5 rounded border border-cyan-500/40 hover:border-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 cursor-pointer"
              title="ขยายอ่านคำตอบแบบละเอียด"
            >
              <Eye className="w-2.5 h-2.5" />
              ขยายอ่าน
            </button>
            <button
              type="button"
              onClick={() => {
                playClickSound();
                onDismiss?.();
              }}
              aria-label="ปิดแถบคำตอบ"
              className="text-slate-400 hover:text-red-400 p-0.5 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Question */}
        {query && (
          <div className="text-[10px] text-slate-400 mb-1 flex items-center gap-1.5 font-mono min-w-0">
            <span className="text-cyan-400 font-bold shrink-0">{userTitle}:</span>
            <span className="text-slate-200 italic truncate select-text">“{query}”</span>
          </div>
        )}

        {/* Answer */}
        <div className="text-cyan-100 text-xs md:text-sm font-semibold leading-relaxed max-h-24 overflow-y-auto pr-1 select-text custom-scrollbar whitespace-pre-line break-words">
          {reply}
        </div>

        {/* Route map for traffic questions */}
        {topic === 'traffic' && <RouteMapWidget destination={destination} />}

        {/* Toolbar */}
        <div className="mt-2.5 pt-1.5 flex items-center justify-between gap-2 text-[9px] text-slate-400 font-mono border-t border-cyan-500/20">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playClickSound();
                onSpeak?.(reply);
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 active:scale-95 text-cyan-300 border border-cyan-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 cursor-pointer transition"
            >
              <Volume2 className="w-3 h-3" />
              ฟังเสียงซ้ำ
            </button>
            <button
              type="button"
              disabled={isPinned}
              onClick={() => {
                if (onPinMemory && onPinMemory(query, reply)) setIsPinned(true);
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded border transition active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-300 ${
                isPinned
                  ? 'border-purple-400 bg-purple-950/80 text-purple-200 cursor-default'
                  : 'border-purple-500/40 bg-slate-900 text-purple-300 hover:bg-slate-800 cursor-pointer'
              }`}
            >
              <Pin className={`w-3 h-3 ${isPinned ? 'fill-purple-400 text-purple-300' : 'text-purple-400'}`} />
              {isPinned ? '✓ ปักหมุดแล้ว' : 'ปักหมุดความจำ'}
            </button>
          </div>
          <span className="text-cyan-400/80 truncate">{delegatedTo || 'Google Gemini'}</span>
        </div>

        {/* Auto-dismiss progress line */}
        {seconds > 0 && !isSpeaking && (
          <div className="absolute bottom-0 left-0 h-0.5 bg-cyan-400/70 transition-[width] duration-200" style={{ width: `${progress * 100}%` }} />
        )}
      </div>
    </div>
  );
}

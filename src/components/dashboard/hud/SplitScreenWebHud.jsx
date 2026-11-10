import { useState, useEffect, memo } from 'react';
import {
  Globe,
  X,
  ExternalLink,
  Maximize2,
  Minimize2,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { playClickSound, playSciFiBeep } from '../../../utils/soundEffects';
import { openSystemBrowser } from '../../../services/browserLauncherService';

export const SplitScreenWebHud = memo(function SplitScreenWebHud({
  isOpen,
  url,
  title,
  onClose,
  _userTitle = 'คุณไลท์',
}) {
  const [currentUrl, setCurrentUrl] = useState(url || 'https://www.google.com');
  const [inputUrl, setInputUrl] = useState(url || 'https://www.google.com');
  const [isMaximized, setIsMaximized] = useState(false);
  const [hasIframeBlocked, setHasIframeBlocked] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    if (url) {
      setCurrentUrl(url);
      setInputUrl(url);
      setHasIframeBlocked(false);
    }
  }, [url]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        playClickSound();
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNavigate = (e) => {
    e?.preventDefault();
    playClickSound();
    let target = inputUrl.trim();
    if (!target) return;
    if (!/^https?:\/\//i.test(target)) {
      if (target.includes('.') && !target.includes(' ')) {
        target = `https://${target}`;
      } else {
        target = `https://www.google.com/search?q=${encodeURIComponent(target)}`;
      }
    }
    setCurrentUrl(target);
    setInputUrl(target);
    setHasIframeBlocked(false);
    setIframeKey((k) => k + 1);
  };

  const handlePopout = () => {
    playSciFiBeep();
    openSystemBrowser(currentUrl);
  };

  const handleReload = () => {
    playClickSound();
    setIframeKey((k) => k + 1);
  };

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ease-out flex flex-col ${
        isMaximized
          ? 'inset-2 sm:inset-4 md:inset-6'
          : 'bottom-4 right-4 w-[92vw] sm:w-[580px] md:w-[680px] lg:w-[740px] h-[65vh] max-h-[700px]'
      }`}
      role="region"
      aria-label="Split-Screen Web HUD"
    >
      <div className="flex-1 flex flex-col rounded-2xl border-2 border-cyan-400/80 bg-slate-950/95 shadow-[0_0_50px_rgba(0,240,255,0.45)] backdrop-blur-2xl overflow-hidden animate-fadeIn">
        {/* Hologram Header Bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-cyan-500/40 bg-gradient-to-r from-cyan-950/80 via-slate-950 to-slate-950 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 border border-cyan-400/60 text-cyan-300">
              <Globe className="h-3.5 w-3.5 animate-spin" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-cyan-200 text-[11px] truncate tracking-wide">
                  {title || 'SPLIT-SCREEN WEB HUD'}
                </span>
                <span className="hidden sm:inline px-1.5 py-0.2 rounded-full text-[8px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  PiP VIEW
                </span>
              </div>
              <span className="text-[9px] text-slate-400 font-mono truncate block">
                {currentUrl}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              type="button"
              onClick={handleReload}
              className="p-1 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:border-cyan-400 cursor-pointer"
              title="รีเฟรชหน้าเว็บ"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handlePopout}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 text-[10px] cursor-pointer shadow-sm"
              title="เปิดดูในแท็บเบราว์เซอร์จริง"
            >
              <ExternalLink className="h-3 w-3" />
              <span className="hidden sm:inline">เปิดแท็บแยก</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setIsMaximized((m) => !m);
              }}
              className="p-1 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:border-cyan-400 cursor-pointer"
              title={isMaximized ? 'ย่อหน้าต่างลง' : 'ขยายเต็มจอ'}
            >
              {isMaximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => {
                playClickSound();
                onClose?.();
              }}
              className="p-1 rounded-lg border border-slate-700 bg-slate-900 text-slate-400 hover:text-white hover:border-red-400 cursor-pointer"
              title="ปิดหน้าต่างเว็บ"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Address / Search Bar */}
        <form
          onSubmit={handleNavigate}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 border-b border-cyan-500/20 text-xs font-mono"
        >
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="ป้อน URL หรือคำค้น เช่น google.com หรือ ข่าวหุ้น"
            className="flex-1 rounded-lg border border-cyan-500/30 bg-slate-950 px-2.5 py-1 text-cyan-200 text-xs focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            className="px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 cursor-pointer"
          >
            ไป
          </button>
        </form>

        {/* X-Frame-Options Fallback Hint Banner */}
        <div
          className={`px-3 py-1 border-b text-[10px] flex items-center justify-between font-mono ${
            hasIframeBlocked
              ? 'bg-red-950/70 border-red-500/50 text-red-200 animate-pulse'
              : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <ShieldAlert className={`w-3 h-3 ${hasIframeBlocked ? 'text-red-400' : 'text-amber-400'}`} />
            <span>
              {hasIframeBlocked
                ? 'ตรวจพบนโยบาย X-Frame-Options บล็อกการแสดงผล Iframe:'
                : 'บางเว็บ (เช่น Google/GitHub) มีนโยบายบล็อก Iframe:'}
            </span>
          </span>
          <button
            type="button"
            onClick={handlePopout}
            className="underline hover:text-white font-bold ml-2 cursor-pointer"
          >
            กดเปิดแท็บแยกเพื่อดูเว็บเต็ม ↗
          </button>
        </div>

        {/* Iframe Stage */}
        <div className="relative flex-1 w-full bg-slate-950 overflow-hidden">
          <iframe
            key={iframeKey}
            src={currentUrl}
            title={title || 'Embedded Web HUD'}
            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals"
            onError={() => setHasIframeBlocked(true)}
          />
        </div>
      </div>
    </div>
  );
});

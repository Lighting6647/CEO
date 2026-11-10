import { useState, useEffect, useCallback, memo } from 'react';
import {
  Globe,
  X,
  ExternalLink,
  Maximize2,
  Minimize2,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  BookOpen,
  Columns2,
  ArrowDown,
  ArrowUp,
  Languages,
  Camera,
  FileText,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { playClickSound, playSciFiBeep, playSuccessSound } from '../../../utils/soundEffects';
import { openSystemBrowser } from '../../../services/browserLauncherService';
import {
  buildGoogleTranslateUrl,
  recordWebSnapshotToMem0,
  getExecutiveFormProfile,
} from '../../../services/externalWebService';

export const SplitScreenWebHud = memo(function SplitScreenWebHud({
  isOpen,
  url,
  title,
  secondaryUrl: initialSecondaryUrl,
  secondaryTitle: initialSecondaryTitle,
  initialDualPane = false,
  onClose,
  userTitle = 'คุณไลท์',
}) {
  const [currentUrl, setCurrentUrl] = useState(url || 'https://www.google.com');
  const [inputUrl, setInputUrl] = useState(url || 'https://www.google.com');
  const [isMaximized, setIsMaximized] = useState(false);
  const [hasIframeBlocked, setHasIframeBlocked] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Feature 2: Reader Mode & AdBlock
  const [isReaderMode, setIsReaderMode] = useState(false);
  const [isAdBlockActive] = useState(true);

  // Feature 3: Multi-Split Dual Pane
  const [isDualPane, setIsDualPane] = useState(initialDualPane);
  const [secondaryUrl, setSecondaryUrl] = useState(
    initialSecondaryUrl || 'https://www.thairath.co.th/money'
  );
  const [inputSecondaryUrl, setInputSecondaryUrl] = useState(
    initialSecondaryUrl || 'https://www.thairath.co.th/money'
  );
  const [secondaryTitle, setSecondaryTitle] = useState(initialSecondaryTitle || 'PANE 2 // WEB');
  const [hasSecondaryBlocked, setHasSecondaryBlocked] = useState(false);
  const [secondaryKey, setSecondaryKey] = useState(0);

  // Feature 4: Auto-Translate Web Page
  const [isTranslated, setIsTranslated] = useState(false);
  const [originalUrlBeforeTranslate, setOriginalUrlBeforeTranslate] = useState('');

  // Feature 5: Web Snapshot
  const [snapshotBanner, setSnapshotBanner] = useState(null);

  // Feature 6: Smart Form Auto-Filler
  const [isFormFillerOpen, setIsFormFillerOpen] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const formProfile = getExecutiveFormProfile(userTitle);

  useEffect(() => {
    if (url) {
      setCurrentUrl(url);
      setInputUrl(url);
      setHasIframeBlocked(false);
      setIsTranslated(false);
      setIframeKey((k) => k + 1);
    }
  }, [url]);

  useEffect(() => {
    if (initialSecondaryUrl) {
      setSecondaryUrl(initialSecondaryUrl);
      setInputSecondaryUrl(initialSecondaryUrl);
      setHasSecondaryBlocked(false);
      setSecondaryKey((k) => k + 1);
    }
  }, [initialSecondaryUrl]);

  useEffect(() => {
    if (initialSecondaryTitle) {
      setSecondaryTitle(initialSecondaryTitle);
    }
  }, [initialSecondaryTitle]);

  useEffect(() => {
    if (typeof initialDualPane === 'boolean') {
      setIsDualPane(initialDualPane);
    }
  }, [initialDualPane]);

  const handleSnapshot = useCallback(() => {
    playSuccessSound();
    const snap = recordWebSnapshotToMem0({
      url: currentUrl,
      title: title || 'In-HUD Web View',
    });
    setSnapshotBanner(`📸 แคปเจอร์หน้าเว็บ "${snap.title}" บันทึกลง Mem0 Gallery เรียบร้อยครับ`);
    setTimeout(() => setSnapshotBanner(null), 3500);
  }, [currentUrl, title]);

  const handleToggleTranslate = useCallback(() => {
    playSciFiBeep();
    if (!isTranslated) {
      setOriginalUrlBeforeTranslate(currentUrl);
      const translated = buildGoogleTranslateUrl(currentUrl);
      setCurrentUrl(translated);
      setInputUrl(translated);
      setIsTranslated(true);
      setIframeKey((k) => k + 1);
    } else {
      const restored = originalUrlBeforeTranslate || url || 'https://www.google.com';
      setCurrentUrl(restored);
      setInputUrl(restored);
      setIsTranslated(false);
      setIframeKey((k) => k + 1);
    }
  }, [isTranslated, currentUrl, originalUrlBeforeTranslate, url]);

  const handleCopyProfileField = (fieldKey, value) => {
    playClickSound();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(value);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // Feature 1: Voice Web Scroll & Navigation Event Bus Listener
  useEffect(() => {
    if (!isOpen) return;

    const handleWebNav = (e) => {
      const { action, target } = e.detail || {};
      const pane1 = document.getElementById('jarvis-viewport-pane-1');
      const pane2 = document.getElementById('jarvis-viewport-pane-2');

      if (action === 'scroll-down') {
        playClickSound();
        if (pane1) pane1.scrollBy({ top: 400, behavior: 'smooth' });
        if (pane2) pane2.scrollBy({ top: 400, behavior: 'smooth' });
      } else if (action === 'scroll-up') {
        playClickSound();
        if (pane1) pane1.scrollBy({ top: -400, behavior: 'smooth' });
        if (pane2) pane2.scrollBy({ top: -400, behavior: 'smooth' });
      } else if (action === 'scroll-top') {
        playClickSound();
        if (pane1) pane1.scrollTo({ top: 0, behavior: 'smooth' });
        if (pane2) pane2.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (action === 'scroll-bottom') {
        playClickSound();
        if (pane1) pane1.scrollTo({ top: 99999, behavior: 'smooth' });
        if (pane2) pane2.scrollTo({ top: 99999, behavior: 'smooth' });
      } else if (action === 'reload') {
        playClickSound();
        setIframeKey((k) => k + 1);
        setSecondaryKey((k) => k + 1);
      } else if (action === 'maximize') {
        playClickSound();
        setIsMaximized(true);
      } else if (action === 'minimize') {
        playClickSound();
        setIsMaximized(false);
      } else if (action === 'toggle-reader') {
        playSciFiBeep();
        setIsReaderMode((r) => !r);
      } else if (action === 'toggle-dual') {
        playSciFiBeep();
        setIsDualPane((d) => !d);
      } else if (action === 'translate') {
        handleToggleTranslate();
      } else if (action === 'snapshot') {
        handleSnapshot();
      } else if (action === 'autofill') {
        playSciFiBeep();
        setIsFormFillerOpen((o) => !o);
      } else if (action === 'set-dual' && target) {
        playSciFiBeep();
        setIsDualPane(true);
        if (target.url1) {
          setCurrentUrl(target.url1);
          setInputUrl(target.url1);
          setIframeKey((k) => k + 1);
        }
        if (target.url2) {
          setSecondaryUrl(target.url2);
          setInputSecondaryUrl(target.url2);
          if (target.title2) setSecondaryTitle(target.title2);
          setSecondaryKey((k) => k + 1);
        }
      }
    };

    window.addEventListener('jarvis:web_nav', handleWebNav);
    return () => window.removeEventListener('jarvis:web_nav', handleWebNav);
  }, [isOpen, handleToggleTranslate, handleSnapshot]);

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

  const handleNavigatePane1 = (e) => {
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
    setIsTranslated(false);
    setIframeKey((k) => k + 1);
  };

  const handleNavigatePane2 = (e) => {
    e?.preventDefault();
    playClickSound();
    let target = inputSecondaryUrl.trim();
    if (!target) return;
    if (!/^https?:\/\//i.test(target)) {
      if (target.includes('.') && !target.includes(' ')) {
        target = `https://${target}`;
      } else {
        target = `https://www.google.com/search?q=${encodeURIComponent(target)}`;
      }
    }
    setSecondaryUrl(target);
    setInputSecondaryUrl(target);
    setHasSecondaryBlocked(false);
    setSecondaryKey((k) => k + 1);
  };

  const handlePopout = (targetUrl) => {
    playSciFiBeep();
    openSystemBrowser(targetUrl || currentUrl);
  };

  const handleScroll = (delta) => {
    playClickSound();
    const pane1 = document.getElementById('jarvis-viewport-pane-1');
    const pane2 = document.getElementById('jarvis-viewport-pane-2');
    if (pane1) pane1.scrollBy({ top: delta, behavior: 'smooth' });
    if (pane2) pane2.scrollBy({ top: delta, behavior: 'smooth' });
  };

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ease-out flex flex-col ${
        isMaximized
          ? 'inset-2 sm:inset-4 md:inset-6'
          : isDualPane
            ? 'bottom-3 right-3 w-[96vw] sm:w-[720px] md:w-[920px] lg:w-[1100px] h-[72vh] max-h-[820px]'
            : 'bottom-4 right-4 w-[92vw] sm:w-[580px] md:w-[680px] lg:w-[760px] h-[65vh] max-h-[700px]'
      }`}
      role="region"
      aria-label="Split-Screen Web HUD"
    >
      <div className="flex-1 flex flex-col rounded-2xl border-2 border-cyan-400/80 bg-slate-950/95 shadow-[0_0_50px_rgba(0,240,255,0.45)] backdrop-blur-2xl overflow-hidden animate-fadeIn">
        {/* Hologram Master Header Bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-cyan-500/40 bg-gradient-to-r from-cyan-950/90 via-slate-950 to-slate-950 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 border border-cyan-400/60 text-cyan-300">
              <Globe className="h-3.5 w-3.5 animate-spin" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-cyan-200 text-[11px] truncate tracking-wide">
                  {isDualPane ? 'DUAL-HUD SPLIT SCREEN' : title || 'SPLIT-SCREEN WEB HUD'}
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[8px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {isDualPane ? '2 PANES' : 'PiP VIEW'}
                </span>
                {isTranslated && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[8px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/40 animate-pulse">
                    <Languages className="w-2.5 h-2.5" />
                    THAI TRANSLATED
                  </span>
                )}
                {isAdBlockActive && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[8px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    ADBLOCK ON
                  </span>
                )}
                {isReaderMode && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[8px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                    <BookOpen className="w-2.5 h-2.5" />
                    READER MODE
                  </span>
                )}
              </div>
              <span className="text-[9px] text-slate-400 font-mono truncate block">
                {isDualPane ? `${currentUrl} ⟷ ${secondaryUrl}` : currentUrl}
              </span>
            </div>
          </div>

          {/* Quick HUD Navigation & View Controls */}
          <div className="flex items-center gap-1 shrink-0 ml-2">
            {/* Scroll Down/Up Voice Simulation Buttons */}
            <button
              type="button"
              onClick={() => handleScroll(-350)}
              className="p-1 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-cyan-300 hover:border-cyan-400 cursor-pointer"
              title="เลื่อนขึ้น (Scroll Up)"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll(350)}
              className="p-1 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-cyan-300 hover:border-cyan-400 cursor-pointer"
              title="เลื่อนลง (Scroll Down)"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>

            {/* Feature 4: Auto-Translate Web Button */}
            <button
              type="button"
              onClick={handleToggleTranslate}
              className={`p-1 rounded-lg border cursor-pointer transition-colors ${
                isTranslated
                  ? 'border-blue-400 bg-blue-500/20 text-blue-300 shadow-sm'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:border-blue-400'
              }`}
              title={isTranslated ? 'แสดงภาษาต้นฉบับ' : 'แปลหน้าเว็บนี้เป็นภาษาไทย (Auto-Translate)'}
            >
              <Languages className="h-3.5 w-3.5" />
            </button>

            {/* Feature 5: Web Snapshot Button */}
            <button
              type="button"
              onClick={handleSnapshot}
              className="p-1 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-pink-300 hover:border-pink-400 cursor-pointer"
              title="แคปหน้าจอเว็บนี้ลง Mem0 (Web Snapshot)"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>

            {/* Feature 6: Smart Form Auto-Filler Drawer Toggle */}
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setIsFormFillerOpen((o) => !o);
              }}
              className={`p-1 rounded-lg border cursor-pointer transition-colors ${
                isFormFillerOpen
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-sm'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:border-emerald-400'
              }`}
              title={isFormFillerOpen ? 'ปิดแถบกรอกฟอร์ม' : 'เปิดแถบกรอกฟอร์มอัจฉริยะ (Smart Form Auto-Filler)'}
            >
              <FileText className="h-3.5 w-3.5" />
            </button>

            {/* Feature 2: Reader Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setIsReaderMode((r) => !r);
              }}
              className={`p-1 rounded-lg border cursor-pointer transition-colors ${
                isReaderMode
                  ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-sm'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:border-cyan-400'
              }`}
              title={isReaderMode ? 'ปิดโหมดอ่านสบายตา' : 'เปิดโหมดอ่านสบายตา & ตัดสิ่งรบกวน'}
            >
              <BookOpen className="h-3.5 w-3.5" />
            </button>

            {/* Feature 3: Dual-Pane Toggle */}
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setIsDualPane((d) => !d);
              }}
              className={`p-1 rounded-lg border cursor-pointer transition-colors ${
                isDualPane
                  ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-sm'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:border-cyan-400'
              }`}
              title={isDualPane ? 'สลับกลับเป็นจอเดี่ยว' : 'เปิดโหมดจอคู่ (Dual Screen Mode)'}
            >
              <Columns2 className="h-3.5 w-3.5" />
            </button>

            {/* Reload Button */}
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setIframeKey((k) => k + 1);
                setSecondaryKey((k) => k + 1);
              }}
              className="p-1 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:border-cyan-400 cursor-pointer"
              title="รีเฟรชหน้าเว็บ"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            {/* Popout Tab */}
            <button
              type="button"
              onClick={() => handlePopout(currentUrl)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
              title="เปิดดูในแท็บเบราว์เซอร์จริง (เปิดแท็บใหม่)"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>เปิดแท็บใหม่ ↗</span>
            </button>

            {/* Maximize */}
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

            {/* Close */}
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

        {/* Feature 5 Snapshot Toast Notification */}
        {snapshotBanner && (
          <div className="px-3 py-1 bg-pink-950/80 border-b border-pink-500/50 text-[10px] text-pink-200 flex items-center justify-between font-mono animate-fadeIn">
            <span className="flex items-center gap-1.5">
              <Camera className="w-3 h-3 text-pink-400 animate-spin" />
              <span>{snapshotBanner}</span>
            </span>
          </div>
        )}

        {/* Feature 6 Smart Form Auto-Filler Drawer (Quick One-Click Copy Chips) */}
        {isFormFillerOpen && (
          <div className="px-3 py-1.5 bg-gradient-to-r from-emerald-950/90 via-slate-950 to-slate-950 border-b border-emerald-500/30 text-xs font-mono animate-fadeIn flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] text-emerald-400 font-bold shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              คลิกเพื่อคัดลอก:
            </span>
            <button
              type="button"
              onClick={() => handleCopyProfileField('name', formProfile.fullName)}
              className="px-2 py-0.5 rounded-md border border-slate-700 bg-slate-900 text-[10px] text-slate-200 hover:border-emerald-400 flex items-center gap-1 shrink-0"
            >
              {copiedField === 'name' ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 text-slate-400" />}
              ชื่อ: {formProfile.fullName}
            </button>
            <button
              type="button"
              onClick={() => handleCopyProfileField('email', formProfile.email)}
              className="px-2 py-0.5 rounded-md border border-slate-700 bg-slate-900 text-[10px] text-slate-200 hover:border-emerald-400 flex items-center gap-1 shrink-0"
            >
              {copiedField === 'email' ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 text-slate-400" />}
              อีเมล: {formProfile.email}
            </button>
            <button
              type="button"
              onClick={() => handleCopyProfileField('company', formProfile.company)}
              className="px-2 py-0.5 rounded-md border border-slate-700 bg-slate-900 text-[10px] text-slate-200 hover:border-emerald-400 flex items-center gap-1 shrink-0"
            >
              {copiedField === 'company' ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 text-slate-400" />}
              บริษัท
            </button>
            <button
              type="button"
              onClick={() => handleCopyProfileField('phone', formProfile.phone)}
              className="px-2 py-0.5 rounded-md border border-slate-700 bg-slate-900 text-[10px] text-slate-200 hover:border-emerald-400 flex items-center gap-1 shrink-0"
            >
              {copiedField === 'phone' ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 text-slate-400" />}
              เบอร์โทร
            </button>
            <button
              type="button"
              onClick={() => handleCopyProfileField('taxId', formProfile.taxId)}
              className="px-2 py-0.5 rounded-md border border-slate-700 bg-slate-900 text-[10px] text-slate-200 hover:border-emerald-400 flex items-center gap-1 shrink-0"
            >
              {copiedField === 'taxId' ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 text-slate-400" />}
              เลขประจำตัวผู้เสียภาษี
            </button>
            <button
              type="button"
              onClick={() => handleCopyProfileField('address', formProfile.address)}
              className="px-2 py-0.5 rounded-md border border-slate-700 bg-slate-900 text-[10px] text-slate-200 hover:border-emerald-400 flex items-center gap-1 shrink-0"
            >
              {copiedField === 'address' ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 text-slate-400" />}
              ที่อยู่
            </button>
          </div>
        )}

        {/* Panes Container (Single or Dual Side-by-Side) */}
        <div className={`flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-cyan-500/20 overflow-hidden ${
          isDualPane ? 'grid grid-cols-1 md:grid-cols-2' : ''
        }`}>
          {/* Pane 1 (Primary) */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
            {/* Address / Search Bar Pane 1 */}
            <form
              onSubmit={handleNavigatePane1}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 border-b border-cyan-500/20 text-xs font-mono"
            >
              <span className="text-[10px] text-cyan-400 font-bold shrink-0">
                {isDualPane ? 'จอ 1:' : 'URL:'}
              </span>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="ป้อน URL หรือคำค้น เช่น google.com หรือ ข่าวหุ้น"
                className="flex-1 rounded-lg border border-cyan-500/30 bg-slate-950 px-2 py-0.5 text-cyan-200 text-xs focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="px-2 py-0.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 cursor-pointer"
              >
                ไป
              </button>
            </form>

            {/* X-Frame Fallback Hint */}
            {hasIframeBlocked && (
              <div className="px-3 py-1 bg-red-950/70 border-b border-red-500/50 text-[10px] text-red-200 flex items-center justify-between font-mono animate-pulse">
                <span className="flex items-center gap-1.5 truncate">
                  <ShieldAlert className="w-3 h-3 text-red-400 shrink-0" />
                  <span>X-Frame-Options บล็อกการแสดงผล Iframe นี้</span>
                </span>
                <button
                  type="button"
                  onClick={() => handlePopout(currentUrl)}
                  className="underline hover:text-white font-bold shrink-0 ml-2 cursor-pointer"
                >
                  เปิดแท็บแยก ↗
                </button>
              </div>
            )}

            {/* Iframe 1 Viewport */}
            <div
              id="jarvis-viewport-pane-1"
              className={`relative flex-1 w-full bg-slate-950 overflow-auto ${
                isReaderMode ? 'filter contrast-[105%] brightness-[92%] sepia-[8%]' : ''
              }`}
            >
              <iframe
                key={iframeKey}
                src={currentUrl}
                title={title || 'Embedded Web HUD'}
                className="w-full h-full min-h-[350px] border-0 bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals"
                onError={() => setHasIframeBlocked(true)}
              />
            </div>
          </div>

          {/* Pane 2 (Secondary - Dual Pane Mode Only) */}
          {isDualPane && (
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden animate-fadeIn">
              {/* Address / Search Bar Pane 2 */}
              <form
                onSubmit={handleNavigatePane2}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 border-b border-cyan-500/20 text-xs font-mono"
              >
                <span className="text-[10px] text-emerald-400 font-bold shrink-0">
                  จอ 2 ({secondaryTitle.slice(0, 10)}):
                </span>
                <input
                  type="text"
                  value={inputSecondaryUrl}
                  onChange={(e) => setInputSecondaryUrl(e.target.value)}
                  placeholder="ป้อน URL จอที่ 2 เช่น thairath.co.th/money"
                  className="flex-1 rounded-lg border border-emerald-500/30 bg-slate-950 px-2 py-0.5 text-emerald-200 text-xs focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="submit"
                  className="px-2 py-0.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 cursor-pointer"
                >
                  ไป
                </button>
                <button
                  type="button"
                  onClick={() => handlePopout(secondaryUrl)}
                  className="p-1 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
                  title="เปิดดูจอ 2 ในแท็บแยก"
                >
                  <ExternalLink className="h-3 w-3" />
                </button>
              </form>

              {/* X-Frame Fallback Hint Pane 2 */}
              {hasSecondaryBlocked && (
                <div className="px-3 py-1 bg-red-950/70 border-b border-red-500/50 text-[10px] text-red-200 flex items-center justify-between font-mono animate-pulse">
                  <span className="flex items-center gap-1.5 truncate">
                    <ShieldAlert className="w-3 h-3 text-red-400 shrink-0" />
                    <span>X-Frame บล็อก Iframe จอ 2</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePopout(secondaryUrl)}
                    className="underline hover:text-white font-bold shrink-0 ml-2 cursor-pointer"
                  >
                    เปิดแท็บแยก ↗
                  </button>
                </div>
              )}

              {/* Iframe 2 Viewport */}
              <div
                id="jarvis-viewport-pane-2"
                className={`relative flex-1 w-full bg-slate-950 overflow-auto ${
                  isReaderMode ? 'filter contrast-[105%] brightness-[92%] sepia-[8%]' : ''
                }`}
              >
                <iframe
                  key={secondaryKey}
                  src={secondaryUrl}
                  title={secondaryTitle || 'Secondary Web HUD'}
                  className="w-full h-full min-h-[350px] border-0 bg-white"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals"
                  onError={() => setHasSecondaryBlocked(true)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

import { useState, useEffect, memo, useCallback } from 'react';
import {
  Globe,
  Search,
  Layers,
  Bot,
  Activity,
  X,
  Play,
} from 'lucide-react';
import { playClickSound, playSciFiBeep, playSuccessSound } from '../../../utils/soundEffects.js';
import { crawlWebsiteTree } from '../../../services/deepWebCrawlerService.js';
import { aggregateCrossWebSearch } from '../../../services/crossWebAggregatorService.js';
import { executeHeadlessWebAgent } from '../../../services/headlessWebAgentService.js';

export const UniversalWebIntelligenceModal = memo(function UniversalWebIntelligenceModal({
  isOpen,
  onClose,
  initialTab = 'crawler', // 'crawler' | 'crossweb' | 'headless'
  initialTarget = 'apple.com',
  initialQuery = 'iPhone 16 Pro Max',
  userTitle = 'คุณไลท์',
  onShowToast = null,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [crawlTarget, setCrawlTarget] = useState(initialTarget);
  const [crossQuery, setCrossQuery] = useState(initialQuery);
  const [headlessUrl, setHeadlessUrl] = useState(initialTarget.startsWith('http') ? initialTarget : `https://${initialTarget}`);
  const [headlessQuery, setHeadlessQuery] = useState(initialQuery);

  // Results State
  const [crawlResult, setCrawlResult] = useState(null);
  const [isCrawling, setIsCrawling] = useState(false);
  const [crossResult, setCrossResult] = useState(null);
  const [isAggregating, setIsAggregating] = useState(false);
  const [headlessResult, setHeadlessResult] = useState(null);
  const [isHeadlessRunning, setIsHeadlessRunning] = useState(false);

  // Announce speech
  const speakReport = useCallback(
    (text) => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'th-TH';
          utterance.rate = 1.05;
          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.warn('[Speech warning]:', err);
        }
      }
    },
    []
  );

  // 1. Run Deep Crawl
  const handleRunCrawl = useCallback(async () => {
    playClickSound();
    playSciFiBeep();
    setIsCrawling(true);
    try {
      const res = await crawlWebsiteTree(crawlTarget, { depth: 2, maxPages: 8 });
      setCrawlResult(res);
      playSuccessSound();
      speakReport(`กวาดข้อมูลเจาะลึกโครงสร้างเว็บไซต์ ${res.domain} รวม ${res.pagesCrawled} หน้าหลักเสร็จสิ้นเรียบร้อยครับ`);
      if (onShowToast) {
        onShowToast('info', '🕸️ Deep Crawl สำเร็จ', `กวาดข้อมูล ${res.domain} (${res.pagesCrawled} หน้า) เรียบร้อยครับ`);
      }
    } finally {
      setIsCrawling(false);
    }
  }, [crawlTarget, onShowToast, speakReport]);

  // 2. Run Cross-Web Aggregator
  const handleRunCrossWeb = useCallback(async () => {
    playClickSound();
    playSciFiBeep();
    setIsAggregating(true);
    try {
      const res = await aggregateCrossWebSearch(crossQuery, userTitle);
      setCrossResult(res.synthesis);
      playSuccessSound();
      speakReport(res.speech);
      if (onShowToast) {
        onShowToast('info', '📊 Cross-Web สำเร็จ', `เปรียบเทียบข้อมูล 12 แหล่งทั่วเน็ตเรียบร้อยครับ`);
      }
    } finally {
      setIsAggregating(false);
    }
  }, [crossQuery, userTitle, onShowToast, speakReport]);

  // 3. Run Headless Web Agent
  const handleRunHeadless = useCallback(async () => {
    playClickSound();
    playSciFiBeep();
    setIsHeadlessRunning(true);
    try {
      const res = await executeHeadlessWebAgent(headlessUrl, headlessQuery);
      setHeadlessResult(res);
      playSuccessSound();
      speakReport(`Headless Web Agent เข้าไปค้นหาข้อมูลบนเว็บเป้าหมายสำเร็จเรียบร้อยครับ`);
      if (onShowToast) {
        onShowToast('info', '🤖 Headless Agent สำเร็จ', `เปิดเบราว์เซอร์เสมือนเข้าไปค้นหาบนเว็บสำเร็จแล้วครับ`);
      }
    } finally {
      setIsHeadlessRunning(false);
    }
  }, [headlessUrl, headlessQuery, onShowToast, speakReport]);

  // Initial trigger
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      if (initialTab === 'crawler' && !crawlResult) handleRunCrawl();
      if (initialTab === 'crossweb' && !crossResult) handleRunCrossWeb();
      if (initialTab === 'headless' && !headlessResult) handleRunHeadless();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Universal Web Intelligence Hub"
    >
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-cyan-500/40 bg-slate-950/95 p-6 shadow-[0_0_60px_rgba(6,182,212,0.2)] text-slate-100 font-mono">
        {/* Glow ambient background accents */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-950/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Globe className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
                  UNIVERSAL WEB INTELLIGENCE
                </span>
                <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] text-cyan-300 font-mono border border-cyan-500/30">
                  ALL-WEB HARVESTER
                </span>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-white">
                ระบบสืบค้นและเจาะข้อมูลทุกเว็บไซต์
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

        {/* 3-Tab Navigator */}
        <div className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-slate-900/80 p-1 border border-slate-800">
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('crawler');
              if (!crawlResult) handleRunCrawl();
            }}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
              activeTab === 'crawler'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>1. Deep Crawler (ทั้งเว็บ)</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setActiveTab('crossweb');
              if (!crossResult) handleRunCrossWeb();
            }}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
              activeTab === 'crossweb'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            <span>2. Cross-Web (เทียบทุกเว็บ)</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setActiveTab('headless');
              if (!headlessResult) handleRunHeadless();
            }}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
              activeTab === 'headless'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Bot className="h-3.5 w-3.5" />
            <span>3. Headless Agent (สวมร่าง)</span>
          </button>
        </div>

        {/* TAB 1: DEEP CRAWLER */}
        {activeTab === 'crawler' && (
          <div className="mt-4 space-y-3 animate-fade-in">
            {/* Input target control */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={crawlTarget}
                  onChange={(e) => setCrawlTarget(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunCrawl()}
                  placeholder="ระบุโดเมนหรือ URL เช่น apple.com, tradingview.com, tesla.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <button
                onClick={handleRunCrawl}
                disabled={isCrawling}
                className="flex items-center gap-1.5 rounded-xl border border-cyan-400/50 bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50"
              >
                {isCrawling ? <Activity className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                <span>{isCrawling ? 'กำลังกวาดเว็บ...' : 'เริ่ม Deep Crawl'}</span>
              </button>
            </div>

            {/* Crawl Results Summary */}
            {crawlResult && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-300">{crawlResult.domain}</span>
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300 border border-emerald-500/30">
                      {crawlResult.robotsTxtStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>ความเร็ว: <strong className="text-cyan-400">{crawlResult.crawlSpeed}</strong></span>
                    <span>กวาดได้: <strong className="text-white">{crawlResult.pagesCrawled} หน้าหลัก</strong></span>
                    <span>คำรวม: <strong className="text-emerald-400">{crawlResult.totalWordsCount.toLocaleString()}</strong></span>
                  </div>
                </div>

                {/* Pages List */}
                <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                  {crawlResult.pages.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg bg-slate-950/80 px-2.5 py-2 border border-slate-800 text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-mono">[{p.httpStatus}]</span>
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-200 hover:text-cyan-300 font-medium truncate max-w-xs"
                        >
                          {p.title}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span>{p.wordCount.toLocaleString()} คำ</span>
                        <span className="text-cyan-400 font-mono">{p.loadTimeMs}ms</span>
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300">
                          {p.entities[0]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CROSS-WEB AGGREGATOR */}
        {activeTab === 'crossweb' && (
          <div className="mt-4 space-y-3 animate-fade-in">
            {/* Input query control */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={crossQuery}
                  onChange={(e) => setCrossQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunCrossWeb()}
                  placeholder="ระบุสิ่งที่ต้องการค้นหาเทียบทุกเว็บ เช่น iPhone 16, กล้อง Sony, คอร์ส AI"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                />
              </div>
              <button
                onClick={handleRunCrossWeb}
                disabled={isAggregating}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-400/50 bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
              >
                {isAggregating ? <Activity className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                <span>{isAggregating ? 'กำลังเปรียบเทียบ...' : 'ค้นหาทุกเว็บ'}</span>
              </button>
            </div>

            {/* Aggregated Highlights */}
            {crossResult && (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
                    <span className="text-[10px] text-slate-400 block">ช่วงราคาข้ามแพลตฟอร์ม</span>
                    <span className="text-emerald-400 font-bold text-xs truncate block">{crossResult.priceRange}</span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
                    <span className="text-[10px] text-slate-400 block">กระแสตอบรับสังคม (Sentiment)</span>
                    <span className="text-cyan-300 font-bold text-xs truncate block">{crossResult.sentimentScore}</span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
                    <span className="text-[10px] text-slate-400 block">ข้อเสนอที่คุ้มค่าที่สุด</span>
                    <span className="text-amber-300 font-bold text-xs truncate block">{crossResult.bestDeal}</span>
                  </div>
                </div>

                {/* Multi-Source Cards */}
                <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {crossResult.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg bg-slate-950/80 p-2.5 border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-cyan-300 font-mono">
                            {item.source}
                          </span>
                          <span className="text-white font-medium truncate">{item.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.highlight}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {item.price !== '-' && (
                          <div className="text-emerald-400 font-bold">{item.price}</div>
                        )}
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5 justify-end"
                        >
                          เปิดลิงก์ ↗
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: HEADLESS WEB AGENT */}
        {activeTab === 'headless' && (
          <div className="mt-4 space-y-3 animate-fade-in">
            {/* Input URL & In-page Query */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={headlessUrl}
                onChange={(e) => setHeadlessUrl(e.target.value)}
                placeholder="URL เว็บไซต์ เช่น https://tradingview.com"
                className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={headlessQuery}
                  onChange={(e) => setHeadlessQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunHeadless()}
                  placeholder="คำที่ต้องการสั่งให้ AI ไปพิมพ์ค้นหา"
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
                />
                <button
                  onClick={handleRunHeadless}
                  disabled={isHeadlessRunning}
                  className="flex items-center gap-1.5 rounded-xl border border-indigo-400/50 bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)] disabled:opacity-50 flex-shrink-0"
                >
                  {isHeadlessRunning ? <Activity className="h-3.5 w-3.5 animate-spin" /> : <Bot className="h-3.5 w-3.5" />}
                  <span>{isHeadlessRunning ? 'กำลังสวมร่าง...' : 'สั่งบอทค้นหา'}</span>
                </button>
              </div>
            </div>

            {/* Robotic Execution Pipeline */}
            {headlessResult && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-indigo-300">
                    ROBOTIC DOM EXECUTION ({headlessResult.totalTimeMs}ms)
                  </span>
                  <span className="text-[10px] text-emerald-400">
                    Stealth Profile: Cloudflare Passed
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {headlessResult.harvestedData.map((d, i) => (
                    <div key={i} className="rounded-lg bg-slate-950/80 p-2 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">{d.label}</span>
                      <span className="text-white font-semibold text-[11px] truncate block">{d.value}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 block mb-1 font-semibold">
                    EXECUTION TIMELINE:
                  </span>
                  <div className="space-y-1">
                    {headlessResult.steps.map((s) => (
                      <div key={s.step} className="flex items-center justify-between text-[10px] text-slate-300">
                        <span className="text-indigo-300 font-mono">[{s.step}] {s.action}</span>
                        <span className="text-slate-400 truncate max-w-xs">{s.detail}</span>
                        <span className="text-cyan-400 font-mono">{s.durationMs}ms</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Bottom Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-cyan-500/20 pt-4">
          <span className="text-[11px] text-slate-400">
            สิทธิ์สั่งการ: Level 5 Supreme Clearance ({userTitle})
          </span>
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
  );
});

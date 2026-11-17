import { useState, useEffect, useMemo, useCallback } from 'react';
import { Eye, EyeOff, Mic, Network, ShieldAlert } from 'lucide-react';
import { getStoredMemories } from '../../../services/mem0Service';
import { getMicMeterEnabled, setMicMeterEnabled } from '../../../services/hudStudioStore';

const CHART_WIDTH = 220;
const CHART_HEIGHT = 58;
const PAD_X = 6;
const PAD_Y = 8;
const BRIDGE_CANDIDATES = ['http://localhost:4199', 'http://127.0.0.1:4199'];

const COMMAND_FILTERS = [
  { id: 'ALL', label: 'ทั้งหมด ALL' },
  { id: 'AI', label: 'สนทนา & ค้นเว็บ AI' },
  { id: 'WEB', label: 'ควบคุมหน้าเว็บ WEB' },
  { id: 'REC', label: 'สรุปประชุม & Router' },
];

const QUICK_CARDS = [
  {
    id: 'web-search',
    category: 'AI',
    kicker: 'WEB SEARCH',
    title: 'ข่าวเด่นวันนี้มีอะไรบ้าง',
    desc: 'ค้นข้อมูลและสรุปข่าวล่าสุดแบบเรียลไทม์',
    command: 'ข่าวเด่นวันนี้มีอะไรบ้าง',
  },
  {
    id: 'web-control',
    category: 'WEB',
    kicker: 'WEB CONTROL',
    title: 'เปิดเว็บกรมอุตุนิยมวิทยา',
    desc: 'เปิดเว็บไซต์และแสดงหน้าเว็บในกรอบอัจฉริยะ',
    command: 'เปิดหน้าเว็บ https://www.tmd.go.th',
  },
  {
    id: 'jev-router',
    category: 'REC',
    kicker: 'JEV ROUTER',
    title: 'เปิดกราฟ Agent Router',
    desc: 'เปิด Node Graph + Gate ≥ 0.85 + 8 Workers',
    command: 'เปิด Agent Router',
  },
  {
    id: 'meeting-rec',
    category: 'REC',
    kicker: 'MEETING REC',
    title: 'เริ่มโหมดสรุปการประชุม',
    desc: 'จดบันทึกคำพูดและสรุปมติเมื่อจบการประชุม',
    command: 'เปิดอัดประชุม',
  },
];

function buildSparklinePaths(values) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  const innerW = CHART_WIDTH - PAD_X * 2;
  const innerH = CHART_HEIGHT - PAD_Y * 2;

  const points = values.map((val, idx) => {
    const x = PAD_X + (indexRatio(idx, values.length)) * innerW;
    const y = PAD_Y + innerH - ((val - min) / span) * innerH;
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  });

  const line = points.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x},${pt.y}`).join(' ');
  const last = points[points.length - 1];
  const first = points[0];
  const area = `${line} L${last.x},${CHART_HEIGHT} L${first.x},${CHART_HEIGHT} Z`;
  return { line, area, lastX: last.x, lastY: last.y };
}

function indexRatio(idx, len) {
  return len > 1 ? idx / (len - 1) : 0;
}

function formatLatency(ms) {
  if (ms === null || ms === undefined) return 'ยังไม่มี';
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

/**
 * Central Voice Studio HUD Telemetry, Live Charts (4 Cards incl. JEV Router),
 * Mic Level Meter & Privacy Masking.
 */
export function VoiceStudioTelemetry({
  messages = [],
  latenciesMs = [],
  isListening = false,
  isSpeaking = false,
  isRedAlert = false,
  audioLevel = 0,
  heldElsewhere = false,
  onDispatchCommand,
  onOpenAgentRouter,
}) {
  const [online, setOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [metricsHidden, setMetricsHidden] = useState(false);
  const [micMeterOn, setMicMeterOn] = useState(() => getMicMeterEnabled());
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [jevTelemetry, setJevTelemetry] = useState(null);
  const [bridgeOnline, setBridgeOnline] = useState(false);
  const memories = useMemo(() => getStoredMemories(), []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const pollJevRouter = useCallback(async () => {
    for (const candidate of BRIDGE_CANDIDATES) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1800);
      try {
        const res = await fetch(`${candidate}/router/state`, { method: 'GET', signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          if (data?.ok && data.state) {
            setBridgeOnline(true);
            setJevTelemetry(data.state);
            clearTimeout(timer);
            return;
          }
        }
      } catch {
        // try next bridge candidate
      } finally {
        clearTimeout(timer);
      }
    }
    setBridgeOnline(false);
  }, []);

  useEffect(() => {
    pollJevRouter();
    const timer = setInterval(pollJevRouter, 6000);
    return () => clearInterval(timer);
  }, [pollJevRouter]);

  const handleToggleMicMeter = () => {
    setMicMeterOn((prev) => setMicMeterEnabled(!prev));
  };

  const lastLatency = latenciesMs.length > 0 ? latenciesMs[latenciesMs.length - 1] : null;
  const avgLatency =
    latenciesMs.length > 0 ? Math.round(latenciesMs.reduce((sum, v) => sum + v, 0) / latenciesMs.length) : null;
  const spark = useMemo(() => buildSparklinePaths(latenciesMs), [latenciesMs]);
  const masked = '••••';

  const recentTurns = messages.slice(-10);
  const maxTurnLen = Math.max(1, ...recentTurns.map((m) => (m.text || '').length));
  const visibleCards =
    activeFilter === 'ALL' ? QUICK_CARDS : QUICK_CARDS.filter((card) => card.category === activeFilter);

  const normalizedAudio = Math.min(1, Math.max(0, Number(audioLevel) || 0));
  const micBars = [0.45, 0.7, 1.0, 0.85, 0.55].map((scale) =>
    isListening && micMeterOn ? Math.max(18, Math.round(normalizedAudio * scale * 100)) : 14
  );

  const routerStats = jevTelemetry?.telemetry || { decisions: 0, heldAtGate: 0, avgLatencyMs: 0, totalCostUsd: 0 };
  const awaitingApprovalCount = jevTelemetry?.awaitingApprovalCount || 0;

  const readouts = [
    {
      code: 'AI',
      label: 'บริการ AI',
      value: isRedAlert ? 'แจ้งเตือน' : isSpeaking ? 'กำลังพูด' : isListening ? 'กำลังฟัง' : 'ปกติ',
      accent: 'border-t-emerald-400',
      tone: 'text-emerald-300',
    },
    {
      code: 'NET',
      label: 'เครือข่าย',
      value: online ? 'ออนไลน์' : 'ออฟไลน์',
      accent: 'border-t-teal-400',
      tone: online ? 'text-teal-300' : 'text-rose-400',
    },
    {
      code: 'LAT',
      label: 'รอคำตอบ',
      value: metricsHidden ? masked : formatLatency(lastLatency),
      accent: 'border-t-cyan-400',
      tone: 'text-cyan-300',
    },
    {
      code: 'MEM',
      label: 'ความจำ',
      value: metricsHidden ? masked : `${memories.length} เรื่อง`,
      accent: 'border-t-sky-400',
      tone: 'text-sky-300',
    },
    {
      code: 'LOG',
      label: 'ข้อความ',
      value: metricsHidden ? masked : `${messages.length} รายการ`,
      accent: 'border-t-amber-400',
      tone: 'text-amber-300',
    },
    {
      code: 'JEV',
      label: 'Router',
      value: bridgeOnline ? (metricsHidden ? masked : `${routerStats.decisions} งาน`) : 'ออฟไลน์',
      accent: 'border-t-rose-400',
      tone: bridgeOnline ? 'text-rose-300' : 'text-slate-400',
    },
  ];

  return (
    <div className="space-y-3 font-mono">
      {/* 6-Card Studio Telemetry Readouts */}
      <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {readouts.map((r) => (
          <div
            key={r.code}
            className={`rounded-lg border border-slate-800/90 border-t-2 ${r.accent} bg-slate-950/75 px-3 py-2 backdrop-blur-sm`}
          >
            <dt className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="rounded bg-slate-900 px-1 py-0.5 text-[9px] font-bold text-slate-300">{r.code}</span>
              <span>{r.label}</span>
            </dt>
            <dd className={`mt-1 text-xs font-bold ${r.tone}`}>{r.value}</dd>
          </div>
        ))}
      </dl>

      {/* Filter Toolbar, Mic Signal Bar & Privacy Mask */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="หมวดคำสั่ง">
          {COMMAND_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                activeFilter === f.id
                  ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                  : 'border-slate-800 bg-slate-950/70 text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Live Mic Waveform Meter & Toggle */}
          <button
            type="button"
            onClick={handleToggleMicMeter}
            className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 text-[11px] cursor-pointer ${
              heldElsewhere
                ? 'border-amber-500/50 bg-amber-950/40 text-amber-300'
                : micMeterOn
                ? 'border-slate-700 bg-slate-900/80 text-emerald-300 hover:border-emerald-400'
                : 'border-slate-800 bg-slate-950 text-slate-500'
            }`}
            title={heldElsewhere ? 'แท็บอื่นกำลังใช้ไมโครโฟนอยู่' : 'เปิด/ปิดมิเตอร์คลื่นเสียงไมโครโฟนแบบเรียลไทม์'}
          >
            <Mic className="h-3 w-3" />
            <span>{heldElsewhere ? 'แท็บอื่นถือไมค์' : micMeterOn ? 'คลื่นไมค์ ON' : 'คลื่นไมค์ OFF'}</span>
            {micMeterOn && (
              <span className="inline-flex items-end gap-0.5 h-3" aria-hidden="true">
                {micBars.map((h, i) => (
                  <span
                    key={i}
                    className={`w-0.5 rounded-full transition-all duration-150 ${
                      isListening ? 'bg-emerald-400' : 'bg-slate-600'
                    }`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMetricsHidden((v) => !v)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-[11px] text-slate-300 hover:border-cyan-400 cursor-pointer"
            title="ซ่อน/แสดงค่าสถิติและข้อมูลความจำเมื่อแชร์หน้าจอ"
          >
            {metricsHidden ? <Eye className="h-3 w-3 text-amber-300" /> : <EyeOff className="h-3 w-3 text-cyan-300" />}
            {metricsHidden ? 'แสดงสถิติ' : 'ซ่อนสถิติ'}
          </button>
        </div>
      </div>

      {/* Quick Command Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {visibleCards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => onDispatchCommand?.(card.command)}
            className="text-left rounded-xl border border-slate-800/90 bg-slate-950/70 p-2.5 hover:border-cyan-400/60 hover:bg-slate-900/80 transition-all cursor-pointer"
          >
            <div className="text-[9px] font-bold tracking-wider text-cyan-400">{card.kicker}</div>
            <div className="text-xs font-bold text-white mt-0.5 truncate">{card.title}</div>
            <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{card.desc}</div>
          </button>
        ))}
      </div>

      {/* 4-Column Studio Charts (Latency Sparkline, Memory Store, Turn Activity, JEV Router Telemetry) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2.5">
        {/* 1. Response Latency Trajectory */}
        <article className="rounded-xl border border-slate-800/90 border-t-2 border-t-emerald-400 bg-slate-950/75 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[9px] tracking-wider text-slate-400">RESPONSE LATENCY</div>
              <h4 className="text-xs font-bold text-white">Latency trajectory</h4>
            </div>
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
              LIVE
            </span>
          </div>
          <div className="flex items-baseline justify-between text-xs">
            <strong className="text-sm text-emerald-300">{metricsHidden ? masked : formatLatency(lastLatency)}</strong>
            <span className="text-[10px] text-slate-400">
              {latenciesMs.length > 0
                ? `เฉลี่ย ${metricsHidden ? masked : formatLatency(avgLatency)} (${latenciesMs.length})`
                : 'รอการสนทนารอบแรก'}
            </span>
          </div>
          <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} preserveAspectRatio="none" className="w-full h-12">
            <defs>
              <linearGradient id="ceo-jv-lat-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.34" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="18" x2={CHART_WIDTH} y2="18" stroke="#1e293b" strokeWidth="1" />
            <line x1="0" y1="40" x2={CHART_WIDTH} y2="40" stroke="#1e293b" strokeWidth="1" />
            {spark ? (
              <>
                <path d={spark.area} fill="url(#ceo-jv-lat-fill)" />
                <path d={spark.line} fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx={spark.lastX} cy={spark.lastY} r="3" fill="#34d399" />
              </>
            ) : (
              <line x1={PAD_X} y1="40" x2={CHART_WIDTH - PAD_X} y2="40" stroke="#34d399" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="4 4" />
            )}
          </svg>
        </article>

        {/* 2. Knowledge & Memory Store */}
        <article className="rounded-xl border border-slate-800/90 border-t-2 border-t-cyan-400 bg-slate-950/75 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[9px] tracking-wider text-slate-400">MEMORY STORE</div>
              <h4 className="text-xs font-bold text-white">Context &amp; recall</h4>
            </div>
            <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-bold text-cyan-300">
              LOCAL
            </span>
          </div>
          <div className="flex items-baseline justify-between text-xs">
            <strong className="text-sm text-cyan-300">{metricsHidden ? masked : `${memories.length} เรื่อง`}</strong>
            <span className="text-[10px] text-slate-400">{memories.length}/50 SLOTS</span>
          </div>
          {metricsHidden ? (
            <div className="text-[10px] text-slate-500 py-2">ซ่อนรายการความจำเพื่อความเป็นส่วนตัว</div>
          ) : (
            <ul className="space-y-1 text-[10px] text-slate-300">
              {memories.slice(-2).reverse().map((item) => (
                <li key={item.id} className="truncate flex items-center gap-1.5" title={item.memory}>
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
                  <span className="truncate">{item.memory}</span>
                </li>
              ))}
            </ul>
          )}
        </article>

        {/* 3. Session Turn Activity */}
        <article className="rounded-xl border border-slate-800/90 border-t-2 border-t-sky-400 bg-slate-950/75 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[9px] tracking-wider text-slate-400">LATEST RECORDS</div>
              <h4 className="text-xs font-bold text-white">Session activity</h4>
            </div>
            <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 text-[9px] font-bold text-sky-300">
              {isListening ? 'VOICE ON' : 'READY'}
            </span>
          </div>
          <div className="flex items-baseline justify-between text-xs">
            <strong className="text-sm text-sky-300">{metricsHidden ? masked : `${messages.length} รายการ`}</strong>
            <span className="text-[10px] text-slate-400">TURN HISTORY</span>
          </div>
          <div className="flex items-end gap-1 h-12 pt-2">
            {recentTurns.length === 0 ? (
              <div className="text-[10px] text-slate-500">ยังไม่มีรอบสนทนา</div>
            ) : (
              recentTurns.map((turn, idx) => {
                const heightPct = metricsHidden ? 35 : Math.max(18, Math.round(((turn.text || '').length / maxTurnLen) * 100));
                const isJarvis = turn.sender === 'JARVIS';
                return (
                  <div
                    key={turn.id || idx}
                    className={`flex-1 rounded-t ${isJarvis ? 'bg-sky-400/80' : 'bg-amber-400/80'}`}
                    style={{ height: `${heightPct}%` }}
                    title={metricsHidden ? '' : `${turn.sender}: ${(turn.text || '').slice(0, 40)}`}
                  />
                );
              })
            )}
          </div>
        </article>

        {/* 4. JEV System-One Router Live Telemetry */}
        <article className="rounded-xl border border-slate-800/90 border-t-2 border-t-rose-400 bg-slate-950/75 p-3 space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[9px] tracking-wider text-slate-400">JEV SYSTEM-ONE</div>
              <h4 className="text-xs font-bold text-white">Router &amp; Gate</h4>
            </div>
            <span
              className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${
                bridgeOnline
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : 'border-slate-700 bg-slate-900 text-slate-400'
              }`}
            >
              {bridgeOnline ? '4199 LIVE' : 'OFFLINE'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <div className="rounded bg-slate-900/90 px-2 py-1 flex justify-between">
              <span className="text-slate-400">Decisions</span>
              <strong className="text-white">{metricsHidden ? masked : routerStats.decisions}</strong>
            </div>
            <div className="rounded bg-slate-900/90 px-2 py-1 flex justify-between">
              <span className="text-slate-400">Cost</span>
              <strong className="text-emerald-300">
                {metricsHidden ? masked : `$${Number(routerStats.totalCostUsd || 0).toFixed(4)}`}
              </strong>
            </div>
          </div>

          {onOpenAgentRouter ? (
            <button
              type="button"
              onClick={onOpenAgentRouter}
              className={`w-full inline-flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold cursor-pointer transition-all ${
                awaitingApprovalCount > 0
                  ? 'border-amber-400 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30'
                  : 'border-cyan-500/40 bg-cyan-950/40 text-cyan-200 hover:border-cyan-400'
              }`}
            >
              {awaitingApprovalCount > 0 ? (
                <>
                  <ShieldAlert className="h-3.5 w-3.5" /> รอคุณไลท์อนุมัติ ({awaitingApprovalCount})
                </>
              ) : (
                <>
                  <Network className="h-3.5 w-3.5" /> เปิด Node Graph
                </>
              )}
            </button>
          ) : (
            <div className="text-[10px] text-slate-500">Gate ≥ 0.85 · 8 Workers</div>
          )}
        </article>
      </div>
    </div>
  );
}

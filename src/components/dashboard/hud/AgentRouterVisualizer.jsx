import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  ExternalLink,
  FileText,
  GitBranch,
  Layers,
  Loader2,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  XCircle,
} from 'lucide-react';
import {
  approveRouterJob,
  dispatchRouterGoal,
  fetchRouterStateFromBackend,
  rejectRouterJob,
  resetRouterQueue,
} from '../../../services/jevRouterClient';

const PRESET_GOALS = [
  { label: 'Research คู่แข่ง POS', goal: 'รวบรวมข้อมูลคู่แข่งระบบ POS และ Cloud Inventory ล่าสุด' },
  { label: 'Write สรุปสถาปัตยกรรม', goal: 'เขียนบทความสรุปจุดเด่น JEV Agent Router' },
  { label: 'งานกำกวม (Hold)', goal: 'ปรับปรุงหน้าเว็บ' },
  { label: 'คำสั่งเสี่ยง (Block)', goal: 'ลบฐานข้อมูล production ทั้งหมดทันที' },
];

const LOG_LEVEL_STYLE = {
  ok: 'text-emerald-400',
  research: 'text-cyan-300',
  write: 'text-sky-300',
  approve: 'text-emerald-300',
  hold: 'text-amber-400',
  reject: 'text-rose-400',
  info: 'text-slate-300',
};

const NODE_DESCRIPTIONS = {
  state_in: '01 STATE IN: รับข้อมูลตั้งต้น (goal, notes, evidence, gaps, last.error) เข้าสู่ State Bus',
  bus: 'Central State Bus (14 Readers): กระจายสถานะจากทุกช่องทางเข้าสู่คำถามแบบ Typed',
  system_one: 'System-One Classifier: ประเมิน Choice (next.worker), Score (urgency), Bool (safe.to.run) แบบ Structured Output',
  gate: 'Confidence & Safety Gate: อนุญาตรันอัตโนมัติเฉพาะเมื่อ safe.to.run=True และ confidence >= threshold',
  q_research: 'queue/research: คิวงานสำหรับค้นหาหลักฐานจริงจากเว็บผ่าน DuckDuckGo & Wikipedia',
  q_write: 'queue/write: คิวงานร่างเอกสาร/บทสรุปหลังผ่าน Gate แล้วเท่านั้น',
  q_review: 'queue/review: คิวพักงานที่ความมั่นใจต่ำหรือไม่ปลอดภัย รอคุณไลท์อนุมัติ',
  workers: '8 Parallel Workers (w1–w8): หยิบไฟล์ *.json จากคิวไปประมวลผลแบบขนาน',
  human: 'Human • Review: จุดอนุมัติโดยคุณไลท์ก่อนย้ายงานเข้า queue/research หรือ queue/write',
};

/**
 * Interactive Node Graph & Live JEV Agent Router Cockpit (chief.py + 127.0.0.1:4199)
 */
export function AgentRouterVisualizer({
  bridgeUrl,
  online,
  routerMode = online ? 'local' : 'offline',
  onRefreshBridge,
  onShowToast,
  onApprovalCountChange,
}) {
  const backend = useMemo(
    () => ({
      mode: online ? 'local' : routerMode === 'cloud' ? 'cloud' : 'offline',
      baseUrl: online ? bridgeUrl : routerMode === 'cloud' ? '/api/jev-router' : '',
    }),
    [online, bridgeUrl, routerMode]
  );
  const isConnected = backend.mode === 'local' || backend.mode === 'cloud';

  const [routerState, setRouterState] = useState(null);
  const [loadingState, setLoadingState] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [useLiveGemini, setUseLiveGemini] = useState(false);
  const [gateThreshold, setGateThreshold] = useState(0.85);
  const [selectedNodeId, setSelectedNodeId] = useState('gate');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [actionBusyId, setActionBusyId] = useState('');
  const [errorBanner, setErrorBanner] = useState('');

  const syncStateIntoUi = useCallback(
    (nextState) => {
      if (!nextState) return;
      setRouterState(nextState);
      setErrorBanner('');
      onApprovalCountChange?.(nextState.awaitingApprovalCount || 0);
      setSelectedJobId((prev) => {
        if (prev && nextState.jobs?.some((j) => j.job_id === prev)) return prev;
        return nextState.jobs?.[0]?.job_id || '';
      });
    },
    [onApprovalCountChange]
  );

  const fetchRouterState = useCallback(
    async (silent = false) => {
      if (!isConnected) return;
      if (!silent) setLoadingState(true);
      try {
        const nextState = await fetchRouterStateFromBackend(backend);
        syncStateIntoUi(nextState);
      } catch (err) {
        if (!silent) {
          setErrorBanner(err instanceof Error ? err.message : 'เชื่อมต่อ Router ไม่สำเร็จ');
        }
      } finally {
        if (!silent) setLoadingState(false);
      }
    },
    [backend, isConnected, syncStateIntoUi]
  );

  useEffect(() => {
    if (!isConnected) return undefined;
    fetchRouterState(false);
    if (backend.mode === 'local') {
      const interval = setInterval(() => fetchRouterState(true), 5000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [isConnected, backend.mode, fetchRouterState]);

  const handleDispatch = async ({ goal, runSampleBatch = false }) => {
    if (!isConnected) return;
    if (!runSampleBatch && !goal.trim()) {
      onShowToast?.('error', 'กรุณาใส่เป้าหมายงาน', 'พิมพ์คำสั่งหรือเลือกตัวอย่างด้านล่างก่อนส่งเข้า JEV Router');
      return;
    }
    setSubmitting(true);
    setErrorBanner('');
    try {
      const data = await dispatchRouterGoal(backend, {
        goal: goal.trim(),
        live: useLiveGemini,
        gate: gateThreshold,
        runSampleBatch,
      });
      if (data?.state) {
        syncStateIntoUi(data.state);
        if (!runSampleBatch) setGoalInput('');
        onShowToast?.(
          'success',
          runSampleBatch ? 'รัน Batch 4 งานตัวอย่างสำเร็จ' : 'ส่งเข้า JEV Router สำเร็จ',
          data.workerResults?.[0]?.result || 'อัปเดตคิวและ RUN LOG เรียบร้อย'
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'เชื่อมต่อ Router ล้มเหลว';
      setErrorBanner(msg);
      onShowToast?.('error', 'ส่งงานไม่สำเร็จ', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (jobId, target) => {
    setActionBusyId(`${jobId}:approve`);
    try {
      const data = await approveRouterJob(backend, { jobId, target, live: useLiveGemini });
      if (data?.state) {
        syncStateIntoUi(data.state);
        setSelectedJobId(jobId);
        onShowToast?.('success', `อนุมัติงาน ${jobId} -> ${target}`, data.workerResult?.result || 'Worker ทำงานเสร็จสิ้น');
      }
    } catch (err) {
      onShowToast?.('error', 'อนุมัติไม่สำเร็จ', err instanceof Error ? err.message : 'Error');
    } finally {
      setActionBusyId('');
    }
  };

  const handleReject = async (jobId) => {
    setActionBusyId(`${jobId}:reject`);
    try {
      const data = await rejectRouterJob(backend, { jobId });
      if (data?.state) {
        syncStateIntoUi(data.state);
        onShowToast?.('success', `ปฏิเสธงาน ${jobId}`, 'ระงับงานใน queue/review เรียบร้อย');
      }
    } catch (err) {
      onShowToast?.('error', 'ปฏิเสธไม่สำเร็จ', err instanceof Error ? err.message : 'Error');
    } finally {
      setActionBusyId('');
    }
  };

  const handleResetQueue = async () => {
    setSubmitting(true);
    try {
      const data = await resetRouterQueue(backend);
      if (data?.state) {
        setRouterState(data.state);
        onApprovalCountChange?.(0);
        setSelectedJobId('');
        onShowToast?.('success', 'ล้างคิวเรียบร้อย', 'รีเซ็ต queue และ RUN LOG พร้อมเริ่มรอบใหม่');
      }
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setSubmitting(false);
    }
  };

  const jobs = useMemo(() => routerState?.jobs || [], [routerState]);
  const selectedJob = useMemo(
    () => jobs.find((j) => j.job_id === selectedJobId) || jobs[0] || null,
    [jobs, selectedJobId]
  );
  const awaitingJobs = useMemo(
    () => jobs.filter((j) => j.status === 'awaiting_approval'),
    [jobs]
  );

  const counts = routerState?.queueCounts || { research: 0, write: 0, review: 0 };
  const telemetry = routerState?.telemetry || {
    nodes: 18,
    edges: 36,
    busReaders: 14,
    decisions: 0,
    heldAtGate: 0,
    avgLatencyMs: 0,
    totalCostUsd: 0,
  };
  const workers = routerState?.workers || { w1: 0, w2: 0, w3: 0, w4: 0, w5: 0, w6: 0, w7: 0, w8: 0 };
  const maxWorkerCount = Math.max(1, ...Object.values(workers));
  const runLog = routerState?.runLog || [];

  const activeDestination = selectedJob?.destination || 'research';
  const isGateHeld = selectedJob ? !selectedJob.gate_passed : false;

  return (
    <div className="space-y-4 font-mono text-slate-100">
      {/* Top Graph Telemetry Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-[#070b12] px-4 py-2.5 text-[11px]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold text-cyan-300">GRAPH jev-agent-router-live</span>
          <span className="text-slate-500">NODES <strong className="text-slate-200">{telemetry.nodes}</strong></span>
          <span className="text-slate-500">EDGES <strong className="text-slate-200">{telemetry.edges}</strong></span>
          <span className="text-slate-500">BUS READERS <strong className="text-slate-200">{telemetry.busReaders}</strong></span>
          <span className="text-slate-500">DECISIONS <strong className="text-rose-400">{telemetry.decisions}</strong></span>
          <span className="text-slate-500">COST <strong className="text-amber-300">${Number(telemetry.totalCostUsd).toFixed(6)}</strong></span>
          <span className="text-slate-500">AVG <strong className="text-emerald-300">{telemetry.avgLatencyMs}ms</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
              backend.mode === 'local'
                ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : backend.mode === 'cloud'
                ? 'border border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
                : 'border border-amber-500/40 bg-amber-500/10 text-amber-300'
            }`}
          >
            {isConnected ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
            {backend.mode === 'local'
              ? 'LOCAL BRIDGE (4199)'
              : backend.mode === 'cloud'
              ? 'CLOUD BRIDGE (VERCEL LIVE)'
              : 'BRIDGE OFFLINE'}
          </span>
          <button
            type="button"
            onClick={() => (isConnected ? fetchRouterState(false) : onRefreshBridge?.())}
            disabled={loadingState}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-200 hover:border-cyan-400 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${loadingState ? 'animate-spin' : ''}`} /> ซิงค์
          </button>
        </div>
      </div>

      {/* Dispatch Goal Form (Bridge Connected) */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-3">
        <div className="flex flex-col lg:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !submitting && isConnected) {
                  handleDispatch({ goal: goalInput });
                }
              }}
              placeholder="ป้อน Goal เพื่อส่งให้ JEV Router ตัดสินใจ เช่น วิเคราะห์คู่แข่ง POS ปี 2026..."
              className="w-full rounded-lg border border-slate-700 bg-[#05080f] pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              disabled={!isConnected || submitting}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-[11px] text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={useLiveGemini}
                onChange={(e) => setUseLiveGemini(e.target.checked)}
                className="accent-cyan-400"
              />
              <Sparkles className="h-3 w-3 text-cyan-400" />
              Gemini Live
            </label>
            <select
              value={gateThreshold}
              onChange={(e) => setGateThreshold(Number(e.target.value))}
              aria-label="Confidence Gate Threshold"
              className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-[11px] text-amber-300 focus:border-cyan-400 focus:outline-none"
            >
              <option value={0.75}>Gate ≥ 0.75</option>
              <option value={0.85}>Gate ≥ 0.85</option>
              <option value={0.9}>Gate ≥ 0.90</option>
            </select>
            <button
              type="button"
              onClick={() => handleDispatch({ goal: goalInput })}
              disabled={!isConnected || submitting}
              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/50 bg-cyan-600/20 px-3 py-1.5 text-xs font-bold text-cyan-200 hover:bg-cyan-600/35 disabled:opacity-40 cursor-pointer"
            >
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              ส่งเข้า Router
            </button>
            <button
              type="button"
              onClick={() => handleDispatch({ goal: '', runSampleBatch: true })}
              disabled={!isConnected || submitting}
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1.5 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-40 cursor-pointer"
            >
              <Play className="h-3 w-3" /> รัน Batch 4 ตัวอย่าง
            </button>
            <button
              type="button"
              onClick={handleResetQueue}
              disabled={!isConnected || submitting}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-[11px] text-slate-300 hover:border-rose-400 hover:text-rose-300 disabled:opacity-40 cursor-pointer"
              title="ล้างคิวและ RUN LOG"
            >
              <RotateCcw className="h-3 w-3" /> ล้างคิว
            </button>
          </div>
        </div>

        {/* Preset Quick Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-slate-500">ตัวอย่างด่วน:</span>
          {PRESET_GOALS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              disabled={!isConnected || submitting}
              onClick={() => {
                setGoalInput(preset.goal);
                handleDispatch({ goal: preset.goal });
              }}
              className="rounded-md border border-slate-800 bg-slate-900/90 px-2 py-0.5 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-200 disabled:opacity-40 cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {errorBanner && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-950/30 px-3 py-2 text-[11px] text-rose-300">
            {errorBanner}
          </div>
        )}
      </div>

      {/* Interactive Node Graph Canvas */}
      <div className="relative rounded-xl border border-slate-800 bg-[#05080f] p-4 overflow-x-auto">
        <div className="min-w-[780px] relative">
          {/* SVG Bezier Connections */}
          <svg
            viewBox="0 0 1000 330"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            {/* Left State In -> Central Bus */}
            {[45, 105, 165, 225, 285].map((y, idx) => (
              <path
                key={`in-${y}`}
                d={`M 175 ${y} C 225 ${y}, 225 ${70 + idx * 45}, 275 ${70 + idx * 45}`}
                fill="none"
                stroke={selectedNodeId === 'state_in' || selectedNodeId === 'bus' ? '#f97316' : '#7c2d12'}
                strokeWidth={selectedNodeId === 'state_in' ? 2.2 : 1.5}
                strokeOpacity={0.85}
              />
            ))}

            {/* Central Bus -> System One Typed Questions */}
            {[55, 130, 205, 275].map((y, idx) => (
              <path
                key={`bus-${y}`}
                d={`M 305 ${65 + idx * 55} C 350 ${65 + idx * 55}, 355 ${y}, 405 ${y}`}
                fill="none"
                stroke={selectedNodeId === 'bus' || selectedNodeId === 'system_one' ? '#f8fafc' : '#475569'}
                strokeWidth={selectedNodeId === 'system_one' ? 2.2 : 1.6}
                strokeOpacity={0.75}
              />
            ))}

            {/* System One -> Gate */}
            <path
              d="M 575 70 C 605 70, 595 165, 625 165"
              fill="none"
              stroke={selectedNodeId === 'gate' || selectedJob ? '#22d3ee' : '#334155'}
              strokeWidth={2}
            />
            <path
              d="M 575 150 C 605 150, 595 165, 625 165"
              fill="none"
              stroke={selectedNodeId === 'gate' || selectedJob ? '#f59e0b' : '#334155'}
              strokeWidth={1.8}
            />
            <path
              d="M 575 230 C 605 230, 595 165, 625 165"
              fill="none"
              stroke={selectedJob && !selectedJob.decision?.safe_to_run ? '#fb7185' : '#475569'}
              strokeWidth={1.8}
            />

            {/* Gate -> Queues (research, write, review) */}
            <path
              d="M 760 140 C 795 140, 795 55, 830 55"
              fill="none"
              stroke={activeDestination === 'research' && !isGateHeld ? '#22d3ee' : '#1e293b'}
              strokeWidth={activeDestination === 'research' && !isGateHeld ? 2.6 : 1.5}
            />
            <path
              d="M 760 165 C 795 165, 795 165, 830 165"
              fill="none"
              stroke={activeDestination === 'write' && !isGateHeld ? '#38bdf8' : '#1e293b'}
              strokeWidth={activeDestination === 'write' && !isGateHeld ? 2.6 : 1.5}
            />
            <path
              d="M 760 190 C 795 190, 795 275, 830 275"
              fill="none"
              stroke={activeDestination === 'review' || isGateHeld ? '#f59e0b' : '#334155'}
              strokeWidth={activeDestination === 'review' || isGateHeld ? 2.6 : 1.5}
              strokeDasharray={activeDestination === 'review' || isGateHeld ? '5 3' : undefined}
            />
          </svg>

          {/* 4-Column Interactive Node Grid */}
          <div className="relative z-10 grid grid-cols-12 gap-3 items-stretch min-h-[330px]">
            {/* Column 1: 01 STATE IN */}
            <div className="col-span-2 flex flex-col justify-between gap-2">
              {[
                { key: 'goal', val: selectedJob?.state?.goal ? selectedJob.state.goal.slice(0, 18) + '...' : 'pending', hot: true },
                { key: 'notes', val: `${selectedJob?.state?.notes?.length ?? 1} items` },
                { key: 'evidence', val: `count: ${selectedJob?.state?.evidence_count ?? 0}` },
                { key: 'gaps', val: `missing: ${selectedJob?.state?.gaps_count ?? 0}`, warn: (selectedJob?.state?.gaps_count ?? 0) > 0 },
                { key: 'last.error', val: selectedJob?.state?.last_error ? 'flagged' : 'clean' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSelectedNodeId('state_in')}
                  className={`text-left rounded-md border px-2.5 py-1.5 transition-all cursor-pointer ${
                    selectedNodeId === 'state_in'
                      ? 'border-orange-400 bg-orange-950/30'
                      : 'border-slate-800 bg-[#0b101b] hover:border-orange-500/60'
                  }`}
                >
                  <div className={`text-[10px] font-bold px-1 rounded inline-block ${item.hot ? 'bg-orange-500 text-black' : item.warn ? 'bg-amber-500/20 text-amber-300' : 'text-slate-200'}`}>
                    {item.key}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{item.val}</div>
                </button>
              ))}
            </div>

            {/* Column 2: Central State Bus (14 Readers) */}
            <div className="col-span-1 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setSelectedNodeId('bus')}
                className={`h-full w-10 rounded-lg border flex flex-col items-center justify-between py-2 transition-all cursor-pointer ${
                  selectedNodeId === 'bus'
                    ? 'border-cyan-400 bg-cyan-950/30'
                    : 'border-slate-700 bg-[#0b101b] hover:border-slate-500'
                }`}
                title="Central State Bus (14 Readers)"
              >
                <span className="text-[9px] text-orange-400 font-bold">BUS</span>
                <div className="space-y-1">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-1 w-5 rounded-full bg-slate-600" />
                  ))}
                </div>
                <span className="text-[9px] text-slate-400">14</span>
              </button>
            </div>

            {/* Column 3: System One Typed Questions */}
            <div className="col-span-3 flex flex-col justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedNodeId('system_one')}
                className={`text-left rounded-md border p-2.5 transition-all cursor-pointer ${
                  selectedNodeId === 'system_one'
                    ? 'border-cyan-400 bg-cyan-950/20'
                    : 'border-slate-800 bg-[#0b101b] hover:border-cyan-500/50'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-white">
                  <span>Choice • next_worker</span>
                  <span className="text-cyan-300">{selectedJob?.decision?.choice || 'research'}</span>
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                  <span>research / write / review</span>
                  <span className="text-emerald-300">
                    conf {selectedJob?.decision?.choice_confidence?.toFixed(2) ?? '0.91'}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedNodeId('system_one')}
                className={`text-left rounded-md border p-2.5 transition-all cursor-pointer ${
                  selectedNodeId === 'system_one'
                    ? 'border-cyan-400 bg-cyan-950/20'
                    : 'border-slate-800 bg-[#0b101b] hover:border-cyan-500/50'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-white">
                  <span>Score • urgency</span>
                  <span className="text-amber-300 uppercase">{selectedJob?.decision?.urgency || 'high'}</span>
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                  <span>low · med · high · crit</span>
                  <span>{selectedJob?.decision?.urgency_confidence?.toFixed(2) ?? '0.92'}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedNodeId('system_one')}
                className={`text-left rounded-md border p-2.5 transition-all cursor-pointer ${
                  selectedNodeId === 'system_one'
                    ? 'border-cyan-400 bg-cyan-950/20'
                    : 'border-slate-800 bg-[#0b101b] hover:border-cyan-500/50'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-white">
                  <span>Bool • safe.to.run</span>
                  <span className={selectedJob?.decision?.safe_to_run === false ? 'text-rose-400' : 'text-emerald-400'}>
                    {selectedJob?.decision?.safe_to_run === false ? 'BLOCKED' : 'SAFE'}
                  </span>
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                  <span>{selectedJob?.decision?.engine || 'local-system-one'}</span>
                  <span>p_yes {selectedJob?.decision?.safe_probability?.toFixed(2) ?? '0.97'}</span>
                </div>
              </button>
            </div>

            {/* Column 4: Confidence Gate */}
            <div className="col-span-3 flex flex-col justify-center">
              <button
                type="button"
                onClick={() => setSelectedNodeId('gate')}
                className={`text-left rounded-lg border p-3 transition-all cursor-pointer ${
                  selectedNodeId === 'gate' ? 'ring-1 ring-amber-400' : ''
                } ${
                  isGateHeld
                    ? 'border-amber-500 bg-amber-950/30'
                    : 'border-emerald-500/60 bg-emerald-950/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-black">
                    gate ≥ {gateThreshold.toFixed(2)}
                  </span>
                  <span className={`text-[10px] font-bold ${isGateHeld ? 'text-amber-300' : 'text-emerald-300'}`}>
                    {selectedJob ? (isGateHeld ? 'HOLD -> REVIEW' : 'PASS -> ROUTE') : 'READY'}
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-[10px] text-slate-300">
                  <div className="flex justify-between">
                    <span>confidence</span>
                    <span>{selectedJob?.decision?.choice_confidence?.toFixed(2) ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>safe p_yes</span>
                    <span>{selectedJob?.decision?.safe_probability?.toFixed(2) ?? '—'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>held total</span>
                    <span className="text-amber-300">{telemetry.heldAtGate}</span>
                  </div>
                </div>
              </button>
            </div>

            {/* Column 5: Queues & Workers & Human Review */}
            <div className="col-span-3 flex flex-col justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedNodeId('q_research')}
                className={`text-left rounded-md border p-2.5 transition-all cursor-pointer ${
                  selectedNodeId === 'q_research' || activeDestination === 'research'
                    ? 'border-cyan-400 bg-cyan-950/25'
                    : 'border-slate-800 bg-[#0b101b] hover:border-cyan-500/50'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300">
                  <span>queue/research</span>
                  <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px]">{counts.research}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">DuckDuckGo + Wiki Live Worker</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedNodeId('q_write')}
                className={`text-left rounded-md border p-2.5 transition-all cursor-pointer ${
                  selectedNodeId === 'q_write' || activeDestination === 'write'
                    ? 'border-sky-400 bg-sky-950/25'
                    : 'border-slate-800 bg-[#0b101b] hover:border-sky-500/50'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-sky-300">
                  <span>queue/write</span>
                  <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px]">{counts.write}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">LLM Writer (After Gate Only)</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedNodeId('human')}
                className={`text-left rounded-md border p-2.5 transition-all cursor-pointer ${
                  awaitingJobs.length > 0
                    ? 'border-amber-400 bg-amber-950/30'
                    : 'border-slate-800 bg-[#0b101b] hover:border-amber-500/50'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
                  <span>queue/review • Human</span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] ${awaitingJobs.length > 0 ? 'bg-amber-500 text-black font-bold' : 'bg-slate-800 text-slate-300'}`}>
                    {awaitingJobs.length} รออนุมัติ
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">พักรอคุณไลท์กด Approve / Reject</div>
              </button>
            </div>
          </div>

          {/* Selected Node Bar */}
          <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/90 px-3 py-2 text-[11px] text-slate-300 flex items-center justify-between gap-2">
            <span>
              <strong className="text-cyan-300">Node Inspector:</strong> {NODE_DESCRIPTIONS[selectedNodeId] || NODE_DESCRIPTIONS.gate}
            </span>
            <span className="text-[10px] text-slate-500 shrink-0">01 STATE IN → BUS → GATE → QUEUE</span>
          </div>
        </div>
      </div>

      {/* Human-in-the-Loop Approval Inbox */}
      {awaitingJobs.length > 0 && (
        <div className="rounded-xl border border-amber-500/50 bg-amber-950/20 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4" />
              คิวรอคุณไลท์อนุมัติ (Human Review — {awaitingJobs.length} รายการ)
            </h3>
            <span className="text-[10px] text-amber-200/80">งานจะไม่ถูกรันจนกว่าคุณไลท์จะกดอนุมัติ</span>
          </div>
          <div className="space-y-2">
            {awaitingJobs.map((job) => (
              <div
                key={job.job_id}
                className="rounded-lg border border-amber-500/30 bg-slate-950/90 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <span className="text-amber-300">#{job.job_id}</span>
                    <span>{job.state?.goal}</span>
                  </div>
                  <div className="text-[11px] text-amber-200/80">
                    เหตุผลที่ถูก Hold: <code className="text-amber-300">{job.hold_reason}</code>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={Boolean(actionBusyId)}
                    onClick={() => handleApprove(job.job_id, 'research')}
                    className="inline-flex items-center gap-1 rounded-md border border-cyan-500/50 bg-cyan-500/15 px-2.5 py-1.5 text-[11px] font-bold text-cyan-200 hover:bg-cyan-500/30 disabled:opacity-40 cursor-pointer"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" /> อนุมัติ → Research
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(actionBusyId)}
                    onClick={() => handleApprove(job.job_id, 'write')}
                    className="inline-flex items-center gap-1 rounded-md border border-emerald-500/50 bg-emerald-500/15 px-2.5 py-1.5 text-[11px] font-bold text-emerald-200 hover:bg-emerald-500/30 disabled:opacity-40 cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5" /> อนุมัติ → Write
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(actionBusyId)}
                    onClick={() => handleReject(job.job_id)}
                    className="inline-flex items-center gap-1 rounded-md border border-rose-500/50 bg-rose-500/15 px-2.5 py-1.5 text-[11px] font-bold text-rose-200 hover:bg-rose-500/30 disabled:opacity-40 cursor-pointer"
                  >
                    <XCircle className="h-3.5 w-3.5" /> ปฏิเสธ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom 4 Telemetry Panels (Matches Screenshot Architecture) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Panel 1: Jobs & Evidence Output Inspector */}
        <div className="rounded-xl border border-slate-800 bg-[#060911] p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300">
            <span className="flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5" /> JOBS & WORKER OUTPUT ({jobs.length})
            </span>
            <span className="text-[10px] text-slate-500">คลิกเพื่อดูหลักฐาน DuckDuckGo / Draft</span>
          </div>

          {jobs.length === 0 ? (
            <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-4 text-[11px] text-slate-400">
              ยังไม่มีงานในคิว — กด <strong>ส่งเข้า chief.py</strong> หรือ <strong>รัน Batch 4 ตัวอย่าง</strong> ด้านบนได้เลยครับ
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {jobs.map((job) => (
                  <button
                    key={job.job_id}
                    type="button"
                    onClick={() => setSelectedJobId(job.job_id)}
                    className={`w-full text-left rounded-lg border px-2.5 py-2 text-[11px] transition-all cursor-pointer ${
                      selectedJob?.job_id === job.job_id
                        ? 'border-cyan-400 bg-cyan-950/30'
                        : 'border-slate-800 bg-slate-950/70 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-white truncate">{job.state?.goal}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">queue/{job.destination}</span>
                      <span
                        className={
                          job.status === 'completed'
                            ? 'text-emerald-400'
                            : job.status === 'awaiting_approval'
                            ? 'text-amber-300'
                            : 'text-rose-400'
                        }
                      >
                        {job.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Job Detail */}
              <div className="rounded-lg border border-slate-800 bg-black/70 p-2.5 max-h-52 overflow-y-auto text-[11px] space-y-2">
                {selectedJob ? (
                  <>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>JOB #{selectedJob.job_id}</span>
                      <span>{selectedJob.worker_id || 'gate-held'}</span>
                    </div>
                    {selectedJob.worker_output?.sources?.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold text-cyan-300">
                          แหล่งข้อมูลจริง ({selectedJob.worker_output.sources.length})
                        </div>
                        {selectedJob.worker_output.sources.map((src, i) => (
                          <a
                            key={i}
                            href={src.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block rounded border border-slate-800 bg-slate-950/90 p-1.5 hover:border-cyan-500/50"
                          >
                            <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-cyan-200">
                              <span className="truncate">{src.title}</span>
                              <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                            </div>
                            <div className="text-[9px] text-slate-400 truncate">{src.domain}</div>
                          </a>
                        ))}
                      </div>
                    )}
                    {selectedJob.worker_output?.draft && (
                      <pre className="whitespace-pre-wrap text-[10px] text-emerald-200 leading-relaxed border-t border-slate-800 pt-2">
                        {selectedJob.worker_output.draft}
                      </pre>
                    )}
                    {!selectedJob.worker_output && (
                      <div className="text-[10px] text-amber-300">
                        {selectedJob.hold_reason || 'รอการประมวลผลจาก Worker'}
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Panel 2: Live RUN LOG */}
        <div className="rounded-xl border border-slate-800 bg-[#060911] p-3.5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-300">
            <span className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" /> RUN LOG (LIVE)
            </span>
            <span className="text-[10px] text-slate-500">{runLog.length} events</span>
          </div>
          <div className="rounded-lg border border-slate-800 bg-black/80 p-2.5 h-52 overflow-y-auto space-y-1 text-[11px]">
            {runLog.length === 0 ? (
              <div className="text-slate-500">ยังไม่มี Log การตัดสินใจ...</div>
            ) : (
              runLog.map((entry, idx) => (
                <div key={`${entry.iso}-${idx}`} className="flex items-start gap-2 leading-snug">
                  <span className="text-slate-500 shrink-0">{entry.ts}</span>
                  <span className={LOG_LEVEL_STYLE[entry.level] || 'text-slate-300'}>{entry.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel 3: DISPATCH (8 Workers) */}
        <div className="rounded-xl border border-slate-800 bg-[#060911] p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
            <span className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5" /> DISPATCH (8 WORKERS)
            </span>
            <span className="text-[10px] text-slate-400">
              research:{counts.research} · write:{counts.write} · review:{counts.review}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(workers).map(([wid, count]) => {
              const pct = Math.round((count / maxWorkerCount) * 100);
              return (
                <div key={wid} className="rounded-lg border border-slate-800 bg-slate-950/70 p-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-cyan-300">{wid}</span>
                    <span className="text-slate-300">{count} run</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-cyan-400 transition-all duration-300"
                      style={{ width: `${count > 0 ? Math.max(12, pct) : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel 4: GRAPH COST */}
        <div className="rounded-xl border border-slate-800 bg-[#060911] p-3.5 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-rose-300">
            <span className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" /> GRAPH COST & TELEMETRY
            </span>
            <span className="text-[10px] text-emerald-400">LIVE</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5">
              <div className="text-[10px] text-slate-400">Decisions</div>
              <div className="text-lg font-bold text-white mt-0.5">{telemetry.decisions}</div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5">
              <div className="text-[10px] text-slate-400">Held at Gate</div>
              <div className="text-lg font-bold text-amber-300 mt-0.5">{telemetry.heldAtGate}</div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5">
              <div className="text-[10px] text-slate-400">Avg Latency</div>
              <div className="text-lg font-bold text-cyan-300 mt-0.5">{telemetry.avgLatencyMs}ms</div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5">
              <div className="text-[10px] text-slate-400">10K Est. Cost</div>
              <div className="text-lg font-bold text-emerald-300 mt-0.5">$0.03</div>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 flex items-center justify-between">
            <span className="truncate">Queue Root: {routerState?.queueRoot || '%TEMP%\\jev_router_queue'}</span>
            <span className="inline-flex items-center gap-1 text-slate-400 shrink-0">
              <GitBranch className="h-3 w-3" /> {useLiveGemini ? 'Gemini 2.5 Flash-Lite' : 'Local System-One'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

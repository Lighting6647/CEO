import { useState, useEffect, useCallback } from 'react';
import {
  Terminal,
  RefreshCw,
  Play,
  Square,
  GitBranch,
  FlaskConical,
  Hammer,
  X,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Network,
  ExternalLink,
} from 'lucide-react';
import { AgentRouterVisualizer } from './AgentRouterVisualizer';
import { INITIAL_PROJECTS } from '../../../data/projectsData';
import {
  discoverRouterBackend,
  getCustomBridgeUrl,
  setCustomBridgeUrl,
} from '../../../services/jevRouterClient';

const BRIDGE_CANDIDATES = ['http://localhost:4199', 'http://127.0.0.1:4199'];
const BRIDGE_START_COMMAND = 'node d:\\AI\\Light\\CEO\\scripts\\local-agent.mjs';

/**
 * Local Control Bridge Modal
 * Connects CEO Hub UI directly to scripts/local-agent.mjs on the user's PC
 * or falls back seamlessly to Vercel Cloud Serverless (/api/jev-router) on mobile.
 */
export function LocalControlBridgeModal({ isOpen, onClose, onShowToast, initialTab = 'projects' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [approvalCount, setApprovalCount] = useState(0);
  const [bridgeUrl, setBridgeUrl] = useState(BRIDGE_CANDIDATES[0]);
  const [online, setOnline] = useState(false);
  const [routerMode, setRouterMode] = useState('offline');
  const [customUrlInput, setCustomUrlInput] = useState(() => getCustomBridgeUrl());
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [runningKey, setRunningKey] = useState('');
  const [consoleLog, setConsoleLog] = useState('');
  const [bridgeError, setBridgeError] = useState('');
  const [copiedCmd, setCopiedCmd] = useState(false);

  const fetchBridge = useCallback(async () => {
    setLoading(true);
    setBridgeError('');
    let lastError = '';

    const custom = getCustomBridgeUrl();
    const candidates = custom ? [custom, ...BRIDGE_CANDIDATES] : BRIDGE_CANDIDATES;

    for (const candidate of candidates) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);
      try {
        const res = await fetch(`${candidate}/projects`, {
          method: 'GET',
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.ok) {
            setBridgeUrl(candidate);
            setOnline(true);
            setRouterMode('local');
            setProjects(data.projects || []);
            setBridgeError('');
            setLoading(false);
            return;
          }
        }
        lastError = `HTTP ${res.status} จาก ${candidate}`;
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'ไม่สามารถเชื่อมต่อได้';
      } finally {
        clearTimeout(timer);
      }
    }

    setOnline(false);
    setProjects([]);
    setBridgeError(lastError);
    const detected = await discoverRouterBackend();
    setRouterMode(detected.mode);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      fetchBridge();
    }
  }, [isOpen, initialTab, fetchBridge]);

  if (!isOpen) return null;

  const runAction = async (folder, action) => {
    const key = `${folder}:${action}`;
    setRunningKey(key);
    setConsoleLog(`[${folder}] กำลังรันคำสั่ง ${action}...`);
    try {
      const res = await fetch(`${bridgeUrl}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder, action }),
      });
      const data = await res.json();
      if (data?.ok) {
        setConsoleLog(`[${folder} :: ${action}]\n${data.output || 'Done'}`);
        onShowToast?.('success', `${folder}: ${action} สำเร็จ`, 'ประมวลผลคำสั่งบนเครื่อง Local เรียบร้อย');
        fetchBridge();
      } else {
        setConsoleLog(`[ERROR ${folder} :: ${action}]\n${data?.error || 'Failed'}`);
        onShowToast?.('error', `${folder}: ${action} ไม่สำเร็จ`, data?.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      setConsoleLog(`[CONNECTION ERROR]\n${error instanceof Error ? error.message : 'ไม่สามารถเชื่อมต่อ Local Bridge ได้'}`);
    } finally {
      setRunningKey('');
    }
  };

  const handleBatchGitStatus = async () => {
    setRunningKey('batch:git-status');
    setConsoleLog('[BATCH] กำลังตรวจ Git Status ทุกโปรเจกต์ที่มี .git...');
    try {
      const res = await fetch(`${bridgeUrl}/batch-git-status`, { method: 'GET' });
      const data = await res.json();
      if (data?.ok) {
        const lines = (data.results || []).map((r) => `• ${r.folder}: ${r.output.replace(/\r?\n/g, ' | ')}`);
        setConsoleLog(`[BATCH GIT STATUS :: ${data.totalGitRepos} Repositories]\n${lines.join('\n')}`);
        onShowToast?.('success', `ตรวจ Git ${data.totalGitRepos} คลังสำเร็จ`, 'แสดงผลสถานะทั้งหมดใน Console ด้านล่างแล้ว');
      } else {
        setConsoleLog(`[BATCH ERROR] ${data?.error || 'Failed'}`);
      }
    } catch (error) {
      setConsoleLog(`[CONNECTION ERROR]\n${error instanceof Error ? error.message : 'ไม่สามารถเชื่อมต่อ Local Bridge ได้'}`);
    } finally {
      setRunningKey('');
    }
  };

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(BRIDGE_START_COMMAND);
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    } catch {
      // ignore clipboard error
    }
  };

  const handleSaveCustomBridge = () => {
    setCustomBridgeUrl(customUrlInput);
    fetchBridge();
  };

  const isHttpsPage = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const cloudReady = routerMode === 'cloud';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
      <div className={`w-full ${activeTab === 'router' ? 'max-w-6xl' : 'max-w-4xl'} rounded-2xl border border-cyan-500/35 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] font-mono transition-all`}>
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/80 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                J.A.R.V.I.S. Local Control Bridge (21 Projects)
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${
                    online
                      ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : cloudReady
                      ? 'border border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
                      : 'border border-amber-500/40 bg-amber-500/10 text-amber-300'
                  }`}
                >
                  {online || cloudReady ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                  {online
                    ? `BRIDGE ONLINE (${bridgeUrl.replace(/^https?:\/\//, '')})`
                    : cloudReady
                    ? 'CLOUD ROUTER LIVE'
                    : 'BRIDGE OFFLINE'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                สั่งรัน Git Status / Test / Build / Start Dev ของทุกโปรเจกต์ใน D:\AI\Light จากหน้าเว็บโดยตรง
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Sub-tab switcher */}
            <div className="flex rounded-lg border border-slate-700 bg-slate-900 p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setActiveTab('projects')}
                className={`rounded-md px-2.5 py-1 font-bold transition-all cursor-pointer ${
                  activeTab === 'projects'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                21 Projects
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('router')}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-bold transition-all cursor-pointer ${
                  activeTab === 'router'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Network className="h-3 w-3" />
                Agent Router (chief.py)
                {approvalCount > 0 && (
                  <span className="rounded-full bg-amber-400 px-1.5 py-0 text-[9px] text-black font-extrabold">
                    {approvalCount}
                  </span>
                )}
              </button>
            </div>
            {online && activeTab === 'projects' && (
              <button
                type="button"
                onClick={handleBatchGitStatus}
                disabled={Boolean(runningKey)}
                className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50 cursor-pointer"
              >
                <GitBranch className="h-3.5 w-3.5" /> Git Status All
              </button>
            )}
            <button
              type="button"
              onClick={fetchBridge}
              disabled={loading}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-200 hover:border-cyan-400 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> รีเฟรช
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
              aria-label="ปิดหน้าต่าง"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!online && activeTab === 'projects' ? (
            <div className="space-y-4">
              {cloudReady && (
                <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/25 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-cyan-300 text-sm">
                      JEV Agent Router พร้อมใช้งานบน Cloud ทันที (แม้ไม่อยู่หน้าคอม)
                    </div>
                    <p className="text-slate-300 mt-1">
                      สามารถสั่งวิเคราะห์งาน, ค้นหาเว็บ DuckDuckGo จริง, และกดอนุมัติ Review จากมือถือผ่าน Vercel Serverless ได้เลยครับ
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('router')}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-cyan-500 cursor-pointer"
                  >
                    <Network className="h-4 w-4" /> เปิด Agent Router (Cloud)
                  </button>
                </div>
              )}

              <div className="rounded-xl border border-amber-500/35 bg-amber-950/20 p-5 space-y-3 text-xs">
                <div className="font-bold text-amber-300 text-sm">
                  สั่งรัน Local Files / Git บน PC (ต้องเปิด Bridge ที่เครื่อง PC ก่อน)
                </div>
                <p className="text-slate-300 leading-relaxed">
                  หากอยู่หน้าคอม รันคำสั่งนี้ใน PowerShell หรือ Command Prompt แล้วกด <strong className="text-white">รีเฟรช</strong>:
                </p>
                <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2">
                  <code className="text-emerald-400 font-bold truncate">{BRIDGE_START_COMMAND}</code>
                  <button
                    type="button"
                    onClick={handleCopyCommand}
                    className="shrink-0 inline-flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-[11px] text-slate-200 hover:bg-slate-700 cursor-pointer"
                  >
                    {copiedCmd ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    {copiedCmd ? 'คัดลอกแล้ว' : 'คัดลอกคำสั่ง'}
                  </button>
                </div>

                {/* Optional Remote Bridge URL */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="Remote Tunnel URL (ถ้ามี เช่น https://xxx.trycloudflare.com)"
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-[11px] text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveCustomBridge}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-[11px] text-slate-200 hover:border-cyan-400 cursor-pointer"
                  >
                    เชื่อมต่อ URL
                  </button>
                </div>

                {isHttpsPage && (
                  <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-2.5 text-[11px] text-slate-300 leading-relaxed">
                    หากเปิดบน PC ผ่าน <code className="text-amber-300">https://</code> แล้วขึ้น Offline ให้กดไอคอนข้างแถบ URL เพื่ออนุญาต <strong>Local network access</strong>
                  </div>
                )}
                {bridgeError && (
                  <div className="text-[11px] text-slate-400">
                    สถานะ Local ({currentOrigin || 'browser'}): <code className="text-amber-300">{bridgeError}</code>
                  </div>
                )}
              </div>

              {/* Cloud Read-Only Directory of 21 Projects */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-300">
                  รายชื่อ 21 โปรเจกต์ใน Ecosystem (Cloud Directory)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {INITIAL_PROJECTS.map((proj) => (
                    <div
                      key={proj.id}
                      className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 flex items-center justify-between gap-2 text-[11px]"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate">{proj.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{proj.path}</div>
                      </div>
                      {proj.repo ? (
                        <a
                          href={`https://github.com/${proj.repo}`}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 inline-flex items-center gap-1 rounded border border-cyan-500/40 bg-cyan-500/10 px-2 py-1 text-[10px] text-cyan-300 hover:bg-cyan-500/20"
                        >
                          GitHub <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      ) : (
                        <span className="shrink-0 text-[10px] text-emerald-400">{proj.score}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'router' ? (
            <AgentRouterVisualizer
              bridgeUrl={bridgeUrl}
              online={online}
              routerMode={routerMode}
              onRefreshBridge={fetchBridge}
              onShowToast={onShowToast}
              onApprovalCountChange={setApprovalCount}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {projects.map((proj) => {
                const hasTest = proj.scripts.includes('test');
                const hasBuild = proj.scripts.includes('build');
                const hasDev = proj.scripts.includes('dev') || proj.scripts.includes('start');
                return (
                  <div
                    key={proj.folder}
                    className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex flex-col justify-between gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-white">{proj.folder}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[230px]">
                          {proj.pkgName || 'Static / Docs / Utility'}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className={`px-1.5 py-0.5 rounded ${proj.hasGit ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                          {proj.hasGit ? 'Git' : 'No Git'}
                        </span>
                        {proj.devRunning && (
                          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 animate-pulse">
                            RUNNING
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      <button
                        type="button"
                        disabled={Boolean(runningKey)}
                        onClick={() => runAction(proj.folder, 'git-status')}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-slate-200 hover:border-cyan-400 disabled:opacity-50 cursor-pointer"
                      >
                        <GitBranch className="h-3 w-3 text-cyan-400" /> Git
                      </button>
                      {hasTest && (
                        <button
                          type="button"
                          disabled={Boolean(runningKey)}
                          onClick={() => runAction(proj.folder, 'test')}
                          className="inline-flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50 cursor-pointer"
                        >
                          <FlaskConical className="h-3 w-3" /> Test
                        </button>
                      )}
                      {hasBuild && (
                        <button
                          type="button"
                          disabled={Boolean(runningKey)}
                          onClick={() => runAction(proj.folder, 'build')}
                          className="inline-flex items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-amber-300 hover:bg-amber-500/20 disabled:opacity-50 cursor-pointer"
                        >
                          <Hammer className="h-3 w-3" /> Build
                        </button>
                      )}
                      {hasDev && (
                        <button
                          type="button"
                          disabled={Boolean(runningKey)}
                          onClick={() => runAction(proj.folder, proj.devRunning ? 'stop-dev' : 'dev')}
                          className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 disabled:opacity-50 cursor-pointer ${
                            proj.devRunning
                              ? 'border-rose-500/40 bg-rose-500/15 text-rose-300'
                              : 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300'
                          }`}
                        >
                          {proj.devRunning ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                          {proj.devRunning ? 'Stop' : 'Start'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {consoleLog && activeTab === 'projects' && (
            <div className="rounded-xl border border-slate-800 bg-black/80 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1.5">
                Live Output Console
              </div>
              <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-slate-200 max-h-40 overflow-y-auto">
                {consoleLog}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

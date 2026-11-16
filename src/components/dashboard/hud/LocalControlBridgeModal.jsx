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
} from 'lucide-react';

const BRIDGE_URL = 'http://127.0.0.1:4199';

/**
 * Local Control Bridge Modal
 * Connects CEO Hub UI directly to scripts/local-agent.mjs on the user's PC (127.0.0.1:4199)
 * to inspect all 21 D:\AI\Light folders and run allowlisted Git Status / Test / Build / Dev actions.
 */
export function LocalControlBridgeModal({ isOpen, onClose, onShowToast }) {
  const [online, setOnline] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [runningKey, setRunningKey] = useState('');
  const [consoleLog, setConsoleLog] = useState('');
  const [copiedCmd, setCopiedCmd] = useState(false);

  const fetchBridge = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BRIDGE_URL}/projects`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        if (data?.ok) {
          setOnline(true);
          setProjects(data.projects || []);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Bridge offline
    }
    setOnline(false);
    setProjects([]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchBridge();
    }
  }, [isOpen, fetchBridge]);

  if (!isOpen) return null;

  const runAction = async (folder, action) => {
    const key = `${folder}:${action}`;
    setRunningKey(key);
    setConsoleLog(`[${folder}] กำลังรันคำสั่ง ${action}...`);
    try {
      const res = await fetch(`${BRIDGE_URL}/action`, {
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
      const res = await fetch(`${BRIDGE_URL}/batch-git-status`, { method: 'GET' });
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
      await navigator.clipboard.writeText('cd d:\\AI\\Light\\CEO; node scripts/local-agent.mjs');
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    } catch {
      // ignore clipboard error
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl rounded-2xl border border-cyan-500/35 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] font-mono">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-5 py-4">
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
                      : 'border border-amber-500/40 bg-amber-500/10 text-amber-300'
                  }`}
                >
                  {online ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                  {online ? 'BRIDGE ONLINE (127.0.0.1:4199)' : 'BRIDGE OFFLINE'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                สั่งรัน Git Status / Test / Build / Start Dev ของทุกโปรเจกต์ใน D:\AI\Light จากหน้าเว็บโดยตรง
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {online && (
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
          {!online ? (
            <div className="rounded-xl border border-amber-500/35 bg-amber-950/20 p-5 space-y-3 text-xs">
              <div className="font-bold text-amber-300 text-sm">
                ยังไม่ได้เปิด Local Control Bridge บนเครื่องของคุณไลท์
              </div>
              <p className="text-slate-300 leading-relaxed">
                เพื่อความปลอดภัย เบราว์เซอร์จะสั่งรันคำสั่งในโฟลเดอร์ <code className="text-cyan-300">D:\AI\Light</code> ได้เมื่อเปิด Bridge บนเครื่องเท่านั้น — รันคำสั่งนี้ในโฟลเดอร์ <code className="text-cyan-300">d:\AI\Light\CEO</code> แล้วกดรีเฟรช:
              </p>
              <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2">
                <code className="text-emerald-400 font-bold">cd d:\AI\Light\CEO; node scripts/local-agent.mjs</code>
                <button
                  type="button"
                  onClick={handleCopyCommand}
                  className="inline-flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-[11px] text-slate-200 hover:bg-slate-700 cursor-pointer"
                >
                  {copiedCmd ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copiedCmd ? 'คัดลอกแล้ว' : 'คัดลอกคำสั่ง'}
                </button>
              </div>
            </div>
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

          {consoleLog && (
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

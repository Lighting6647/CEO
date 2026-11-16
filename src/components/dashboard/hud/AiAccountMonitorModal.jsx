import { useState, useEffect, useCallback } from 'react';
import { Activity, RefreshCw, CheckCircle2, AlertTriangle, Server, X, Cpu } from 'lucide-react';

const CLIENT_FALLBACK_REPORT = {
  service: 'ceo-ai-diagnostics (local-preview)',
  runtime: 'browser-client',
  nodeVersion: 'Vite SPA',
  latencyMs: 1,
  summary: { totalProviders: 4, configuredCount: 1, fallbackAvailable: true },
  providers: [
    {
      id: 'gemini',
      name: 'Google Gemini API',
      model: 'gemini-2.5-flash',
      configured: false,
      status: 'standby',
      envVar: 'GEMINI_API_KEY',
      purpose: 'Meeting Summary, Voice Intelligence & Multimodal Analysis',
    },
    {
      id: 'anthropic',
      name: 'Anthropic Claude API',
      model: 'claude-3-7-sonnet',
      configured: false,
      status: 'standby',
      envVar: 'ANTHROPIC_API_KEY',
      purpose: 'Deep Coding Reasoning & Architecture Review',
    },
    {
      id: 'openai',
      name: 'OpenAI / Compatible API',
      model: 'gpt-4o-mini',
      configured: false,
      status: 'standby',
      envVar: 'OPENAI_API_KEY',
      purpose: 'Realtime Speech Transcription & Chat Fallback',
    },
    {
      id: 'line-relay',
      name: 'LINE Messaging Relay',
      model: 'ceo-lbm3.onrender.com',
      configured: true,
      status: 'ready',
      envVar: 'LINE_CHANNEL_ACCESS_TOKEN',
      purpose: 'Executive Alert & Slip/Order Notification Relay',
    },
  ],
};

/**
 * AI Account & Provider Diagnostics Monitor Modal (Ported from D:\AI\Light\Javis accountMonitor.ts)
 * Probes /api/ai-diagnostics safely without leaking secrets.
 */
export function AiAccountMonitorModal({ isOpen, onClose, onShowToast }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const runCheck = useCallback(async (notify = false) => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai-diagnostics', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        if (data?.ok) {
          setReport(data);
          if (notify) {
            onShowToast?.('success', 'ตรวจสถานะ AI สำเร็จ', `เช็ค ${data.providers.length} Providers เรียบร้อย (${data.latencyMs}ms)`);
          }
          setLoading(false);
          return;
        }
      }
    } catch {
      // fallback in local static Vite dev
    }

    setReport({ ...CLIENT_FALLBACK_REPORT, checkedAt: new Date().toISOString() });
    if (notify) {
      onShowToast?.('info', 'Local Diagnostics Mode', 'แสดงข้อมูล Diagnostics จากโหมด Local Preview');
    }
    setLoading(false);
  }, [onShowToast]);

  useEffect(() => {
    if (isOpen) {
      runCheck(false);
    }
  }, [isOpen, runCheck]);

  if (!isOpen) return null;

  const data = report || CLIENT_FALLBACK_REPORT;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-cyan-500/30 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                AI Account & Diagnostics Monitor
                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                  FROM JAVIS CORE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                ตรวจสอบความพร้อมของ AI Providers, โมเดลที่ตั้งค่า และ Latency โดยไม่เปิดเผย API Key
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Summary Bar */}
        <div className="grid grid-cols-3 gap-3 border-b border-slate-800 bg-slate-900/50 p-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <div className="text-[11px] text-slate-400">Runtime</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400">
              <Server className="h-3.5 w-3.5" /> {data.runtime}
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <div className="text-[11px] text-slate-400">Providers Ready</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 tabular-nums">
              <Cpu className="h-3.5 w-3.5" /> {data.summary?.configuredCount ?? 0} / {data.providers?.length ?? 0} Active
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <div className="text-[11px] text-slate-400">Probe Latency</div>
            <div className="mt-1 text-xs font-mono font-bold text-slate-200 tabular-nums">
              {data.latencyMs ?? 0} ms
            </div>
          </div>
        </div>

        {/* Providers List */}
        <div className="p-5 space-y-3 max-h-[55vh] overflow-y-auto">
          {data.providers.map((prov) => {
            const isReady = prov.configured || prov.status === 'ready';
            return (
              <div
                key={prov.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3.5"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{prov.name}</span>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
                      {prov.model}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{prov.purpose}</p>
                  <p className="text-[11px] font-mono text-slate-500">Env: {prov.envVar}</p>
                </div>

                <div className="shrink-0">
                  {isReady ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Ready
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                      <AlertTriangle className="h-3.5 w-3.5" /> {prov.status === 'missing_key' ? 'Missing Key (Fallback Ready)' : 'Standby'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/80 px-5 py-3">
          <span className="text-[11px] font-mono text-slate-500">
            Last check: {data.checkedAt ? new Date(data.checkedAt).toLocaleTimeString('th-TH') : '-'}
          </span>
          <button
            type="button"
            onClick={() => runCheck(true)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'กำลังตรวจ...' : 'ตรวจสถานะใหม่'}
          </button>
        </div>
      </div>
    </div>
  );
}

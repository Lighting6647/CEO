import { useState, useEffect, useCallback } from 'react';
import { Network, RefreshCw, Terminal } from 'lucide-react';
import { AgentRouterVisualizer } from './hud/AgentRouterVisualizer';

const BRIDGE_CANDIDATES = ['http://localhost:4199', 'http://127.0.0.1:4199'];

/**
 * Full-page Dashboard View for JEV Agent Router Node Graph (01 STATE IN -> Gate -> Queue -> 8 Workers)
 */
export function AgentRouterView({ onShowToast, onOpenLocalBridgeModal }) {
  const [bridgeUrl, setBridgeUrl] = useState(BRIDGE_CANDIDATES[0]);
  const [online, setOnline] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkBridge = useCallback(async () => {
    setChecking(true);
    for (const candidate of BRIDGE_CANDIDATES) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);
      try {
        const res = await fetch(`${candidate}/health`, { method: 'GET', signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          if (data?.ok) {
            setBridgeUrl(candidate);
            setOnline(true);
            setChecking(false);
            clearTimeout(timer);
            return;
          }
        }
      } catch {
        // try next candidate
      } finally {
        clearTimeout(timer);
      }
    }
    setOnline(false);
    setChecking(false);
  }, []);

  useEffect(() => {
    checkBridge();
  }, [checkBridge]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-500/30 bg-slate-900/80 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-500/15 text-cyan-300">
            <Network className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              J.A.R.V.I.S. × JEV Agent Router — Interactive Node Graph
            </h2>
            <p className="text-xs text-slate-400">
              01 STATE IN → State Bus → Confidence Gate (≥ 0.85) → DuckDuckGo Research / LLM Write / Human Approve → 8 Workers
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={checkBridge}
            disabled={checking}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:border-cyan-400 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${checking ? 'animate-spin' : ''}`} />
            ตรวจ Bridge
          </button>
          {onOpenLocalBridgeModal && (
            <button
              type="button"
              onClick={onOpenLocalBridgeModal}
              className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/50 px-3 py-1.5 text-xs font-bold text-cyan-200 hover:border-cyan-400 cursor-pointer"
            >
              <Terminal className="h-3.5 w-3.5" />
              เปิดหน้าต่าง Bridge
            </button>
          )}
        </div>
      </div>

      <AgentRouterVisualizer
        bridgeUrl={bridgeUrl}
        online={online}
        onRefreshBridge={checkBridge}
        onShowToast={onShowToast}
      />
    </section>
  );
}

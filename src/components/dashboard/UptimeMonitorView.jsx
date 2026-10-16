import { useState, useEffect, useCallback } from 'react';
import { Activity, RefreshCw, ExternalLink, Globe, Wifi } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { DEFAULT_MONITORED_SERVICES, checkServiceHealth } from '../../services/uptimeMonitor';

export function UptimeMonitorView({ onShowToast }) {
  const [services, setServices] = useState(DEFAULT_MONITORED_SERVICES);
  const [isPinging, setIsPinging] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const pingAllServices = useCallback(async () => {
    setIsPinging(true);
    try {
      const updated = await Promise.all(
        services.map(async (svc) => {
          return await checkServiceHealth(svc);
        })
      );
      setServices(updated);
      onShowToast?.('success', 'Ping สำเร็จ', 'อัปเดตสถานะและ Latency ล่าสุดเรียบร้อยแล้ว');
    } catch {
      onShowToast?.('error', 'Ping ล้มเหลว', 'เกิดข้อผิดพลาดในการตรวจสอบ Service');
    } finally {
      setIsPinging(false);
    }
  }, [services, onShowToast]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      pingAllServices();
    }, 25000);
    return () => clearInterval(interval);
  }, [autoRefresh, pingAllServices]);

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Live Service Health & Uptime Monitor</h2>
            <Badge variant="success">Daemon Active</Badge>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            ระบบตรวจสอบสถานะความพร้อมใช้งานและค่าความหน่วง (Latency) ของ Web Services ตลอด 24 ชม.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
            />
            Auto-Ping (ทุก 25 วิ)
          </label>

          <button
            onClick={pingAllServices}
            disabled={isPinging}
            className="flex items-center gap-2 rounded-xl bg-cyan-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-cyan-500 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isPinging ? 'animate-spin' : ''}`} />
            {isPinging ? 'กำลัง Ping...' : 'Ping All Services'}
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {services.map((svc) => (
          <div
            key={svc.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm transition-all hover:border-slate-700"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{svc.type}</span>
                  <h3 className="mt-1 text-sm font-bold text-white">{svc.name}</h3>
                </div>
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-2.5 py-1 text-xs font-bold text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  {svc.status.toUpperCase()}
                </span>
              </div>

              <div className="mt-4 space-y-2 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Wifi className="h-3.5 w-3.5 text-cyan-400" /> Latency:
                  </span>
                  <span className="font-mono font-bold text-cyan-300">{svc.latency} ms</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Activity className="h-3.5 w-3.5 text-emerald-400" /> Uptime:
                  </span>
                  <span className="font-mono font-bold text-emerald-300">{svc.uptime}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">ตรวจสอบล่าสุด:</span>
                  <span className="font-mono text-slate-400">{svc.lastCheck}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <a
                href={svc.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 font-mono text-[11px] text-slate-400 hover:text-cyan-400 transition-colors truncate max-w-[200px]"
              >
                <Globe className="h-3 w-3 shrink-0" />
                <span className="truncate">{svc.url}</span>
                <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-60" />
              </a>
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">HTTP 200</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

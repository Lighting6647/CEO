import { CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '../ui/Badge';

export function AuditLogsView({ logs }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white">บันทึกประวัติการตรวจสอบคุณภาพ (Audit Trail)</h2>
          <p className="text-xs text-slate-400">ประวัติการทำงานของระบบ Gatekeeper และผลการตรวจสอบย้อนหลัง</p>
        </div>
        <Badge variant="cyan">{logs.length} เหตุการณ์บันทึก</Badge>
      </div>

      <div className="mt-6 space-y-4">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex flex-col gap-3 rounded-xl border border-slate-800/80 bg-slate-950/40 p-4 transition-colors hover:border-slate-700 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-white">{log.title}</span>
                  <Badge variant="emerald" size="sm">{log.badge}</Badge>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  {log.details}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                  <span>ผู้ตรวจสอบ: {log.auditor}</span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              <span>{log.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

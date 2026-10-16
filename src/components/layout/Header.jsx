import { ShieldCheck, FileDown, Printer, History, RefreshCw, Terminal, Bell, Activity } from 'lucide-react';

export function Header({
  activeView,
  setActiveView,
  onRunAudit,
  isAuditing,
  onExportMarkdown,
  onExportPdf,
  onOpenHooksModal,
  onOpenNotificationModal,
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-500 shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white">CEO Master Quality Platform</h1>
              <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[11px] font-semibold text-cyan-300 border border-cyan-500/30">v2.5 Live</span>
            </div>
            <p className="text-xs text-slate-400">Antigravity 4-Pillar Zero AI Slop & Production-Ready Standard</p>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Toggles */}
          <div className="flex rounded-xl bg-slate-800/80 p-1 border border-slate-700/60 text-xs">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                activeView === 'dashboard' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              12 โปรเจกต์
            </button>
            <button
              onClick={() => setActiveView('uptime')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all ${
                activeView === 'uptime' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              Uptime Live
            </button>
            <button
              onClick={() => setActiveView('logs')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all ${
                activeView === 'logs' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              Audit Logs
            </button>
          </div>

          {/* Alert Bot Button */}
          <button
            onClick={onOpenNotificationModal}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-sm active:scale-95"
            title="ตั้งค่าแจ้งเตือน Telegram / Webhook"
          >
            <Bell className="h-3.5 w-3.5 text-amber-400" />
            Alert Bot
          </button>

          {/* Hooks Manager Button */}
          <button
            onClick={onOpenHooksModal}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-sm active:scale-95"
            title="จัดการและติดตั้ง Git Pre-Commit/Push Hooks"
          >
            <Terminal className="h-3.5 w-3.5 text-emerald-400" />
            Git Hooks (11 คลัง)
          </button>

          {/* Export Group */}
          <button
            onClick={onExportMarkdown}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-sm active:scale-95"
            title="ดาวน์โหลดรายงานสรุป Markdown"
          >
            <FileDown className="h-3.5 w-3.5 text-cyan-400" />
            MD
          </button>

          <button
            onClick={onExportPdf}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-sm active:scale-95"
            title="เปิดหน้าต่างพิมพ์รายงานหรือบันทึกเป็น PDF"
          >
            <Printer className="h-3.5 w-3.5 text-purple-400" />
            PDF
          </button>

          {/* Run Full QA Audit */}
          <button
            onClick={onRunAudit}
            disabled={isAuditing}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-900/30 hover:from-emerald-500 hover:to-teal-500 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
            {isAuditing ? 'กำลังตรวจ...' : 'Full QA Audit'}
          </button>
        </div>
      </div>
    </header>
  );
}

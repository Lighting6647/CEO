import {
  ShieldCheck,
  FileDown,
  Printer,
  History,
  RefreshCw,
  Terminal,
  Bell,
  Activity,
  KeyRound,
  FileSpreadsheet,
  Sun,
  Moon,
} from 'lucide-react';

export function Header({
  activeView,
  setActiveView,
  onRunAudit,
  isAuditing,
  onExportMarkdown,
  onExportPdf,
  onExportCsv,
  onExportJson,
  onOpenHooksModal,
  onOpenNotificationModal,
  onOpenEnvVaultModal,
  theme,
  onToggleTheme,
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
              <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[11px] font-semibold text-cyan-300 border border-cyan-500/30">
                v2.6 Executive
              </span>
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

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all active:scale-95"
            title={theme === 'dark' ? 'เปลี่ยนเป็นธีมสว่าง (Light Executive)' : 'เปลี่ยนเป็นธีมมืด (Dark Slate)'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-cyan-400" />}
          </button>

          {/* Env Vault Modal Button */}
          <button
            onClick={onOpenEnvVaultModal}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-sm active:scale-95"
            title="ตรวจสอบความปลอดภัย Environment Variable & Secrets"
          >
            <KeyRound className="h-3.5 w-3.5 text-cyan-400" />
            Env Vault
          </button>

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
            Git Hooks
          </button>

          {/* Export CSV / Sheets Button */}
          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-sm active:scale-95"
            title="ส่งออก CSV สำหรับ Excel / Google Sheets"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            CSV
          </button>

          {/* Export JSON / Backup Button */}
          <button
            onClick={onExportJson}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-sm active:scale-95"
            title="ส่งออก JSON Full Backup"
          >
            <FileDown className="h-3.5 w-3.5 text-cyan-400" />
            JSON
          </button>

          {/* Export Markdown / PDF */}
          <button
            onClick={onExportMarkdown}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-sm active:scale-95"
            title="ดาวน์โหลดรายงานสรุป Markdown"
          >
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

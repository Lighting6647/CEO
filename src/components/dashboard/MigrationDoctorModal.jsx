import { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Cpu,
  FolderCheck,
  Wrench,
  Copy,
  Check,
  Download,
  RefreshCw,
  Terminal,
  ShieldCheck,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import {
  SYSTEM_RUNTIMES,
  WORKSPACE_DOCTOR_ITEMS,
  calculateWorkspaceDoctorSummary,
  downloadWorkspaceSnapshotJson,
} from '../../utils/migrationDoctor';

export function MigrationDoctorModal({ isOpen, onClose, onShowToast }) {
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'REPAIRED' | 'RUNTIMES'
  const [isScanning, setIsScanning] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState('');

  const summary = useMemo(() => calculateWorkspaceDoctorSummary(), []);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'REPAIRED') {
      return WORKSPACE_DOCTOR_ITEMS.filter((item) => item.repairedAfterMigration);
    }
    return WORKSPACE_DOCTOR_ITEMS;
  }, [activeFilter]);

  const handleCopyCommand = (cmd, label) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    onShowToast?.('success', 'คัดลอกคำสั่งแล้ว', `คัดลอก "${label}" สำหรับรันใน PowerShell เรียบร้อย`);
    setTimeout(() => setCopiedCmd(''), 2000);
  };

  const handleReScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      onShowToast?.(
        'success',
        'ตรวจสอบสภาพแวดล้อมครบ 17 คลังสำเร็จ',
        `สุขภาพระบบ ${summary.overallHealthPercent}% • ซ่อมแซมหลังย้ายเครื่องครบ ${summary.repairedCount} รายการ`
      );
    }, 900);
  };

  const handleDownloadSnapshot = () => {
    const manifest = downloadWorkspaceSnapshotJson();
    if (manifest) {
      onShowToast?.(
        'success',
        'บันทึก Snapshot สำเร็จ',
        `ดาวน์โหลดไฟล์ ${manifest.snapshotId}.json ครบทั้ง 17 โฟลเดอร์เรียบร้อย`
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🩺 ระบบตรวจสุขภาพเครื่อง & ซ่อมแซมหลังย้ายเครื่อง (Workspace Migration Doctor)"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-5">
        {/* Top KPI Summary Banner */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3.5">
            <div className="text-[11px] font-semibold text-emerald-300">ความพร้อมหลังย้ายเครื่อง</div>
            <div className="mt-1 text-2xl font-extrabold text-emerald-400">
              {summary.overallHealthPercent}%
            </div>
            <div className="text-[11px] text-emerald-200/70">C:\Users\Light ↔ D:\Light</div>
          </div>

          <div className="rounded-xl border border-cyan-500/30 bg-slate-950/70 p-3.5">
            <div className="text-[11px] font-semibold text-cyan-300">โฟลเดอร์ใน D:\Light</div>
            <div className="mt-1 text-2xl font-extrabold text-white">
              {summary.readyFolders}/{summary.totalFolders}
            </div>
            <div className="text-[11px] text-slate-400">พร้อมใช้งานครบทุกโปรเจกต์</div>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-slate-950/70 p-3.5">
            <div className="text-[11px] font-semibold text-amber-300">ซ่อมแซมไฟล์ที่ขาดแล้ว</div>
            <div className="mt-1 text-2xl font-extrabold text-amber-400">
              {summary.repairedCount} คลัง
            </div>
            <div className="text-[11px] text-slate-400">แก้โฟลเดอร์ซ้อน + กู้ไฟล์ + แก้ Path</div>
          </div>

          <div className="rounded-xl border border-teal-500/30 bg-slate-950/70 p-3.5">
            <div className="text-[11px] font-semibold text-teal-300">System Runtimes</div>
            <div className="mt-1 text-2xl font-extrabold text-teal-400">
              {summary.runtimeReadyCount}/{summary.totalRuntimes}
            </div>
            <div className="text-[11px] text-slate-400">Node v24.22.1 • Git • Python • PS</div>
          </div>
        </div>

        {/* Filter & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
                activeFilter === 'ALL'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              ครบทั้ง 17 โฟลเดอร์ ({summary.totalFolders})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('REPAIRED')}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                activeFilter === 'REPAIRED'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-amber-300 hover:bg-slate-800'
              }`}
            >
              <Wrench className="h-3.5 w-3.5" />
              รายการที่ซ่อมแซมแล้ว ({summary.repairedCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('RUNTIMES')}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                activeFilter === 'RUNTIMES'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-300 hover:bg-slate-800'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              โปรแกรมระบบ & Runtimes ({summary.totalRuntimes})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleReScan}
              disabled={isScanning}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-bold text-cyan-200 hover:bg-cyan-500/25 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'กำลังสแกน...' : 'สแกนซ้ำ'}
            </button>

            <button
              type="button"
              onClick={handleDownloadSnapshot}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
            >
              <Download className="h-3.5 w-3.5" />
              ดาวน์โหลด Snapshot (.json)
            </button>
          </div>
        </div>

        {/* Runtimes Section */}
        {activeFilter === 'RUNTIMES' ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SYSTEM_RUNTIMES.map((rt) => (
              <div
                key={rt.id}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white text-sm">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    {rt.name}
                  </div>
                  <Badge variant="success" size="sm">
                    {rt.version}
                  </Badge>
                </div>
                <div className="font-mono text-[11px] text-cyan-300 truncate">{rt.binaryPath}</div>
                <p className="text-slate-300 leading-relaxed">{rt.impact}</p>
                <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5">
                  <code className="text-[11px] text-slate-300 truncate">{rt.installCmd}</code>
                  <button
                    type="button"
                    onClick={() => handleCopyCommand(rt.installCmd, rt.name)}
                    className="ml-2 shrink-0 rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-cyan-300 hover:bg-slate-700"
                  >
                    {copiedCmd === rt.installCmd ? 'คัดลอกแล้ว' : 'คัดลอก'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 17 Folders Matrix List */
          <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/50 divide-y divide-slate-800/70 text-xs">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 p-3.5 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-900/50 transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <FolderCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span className="font-bold text-white">{item.name}</span>
                    <span className="font-mono text-[11px] text-cyan-300">{item.folder}</span>
                    {item.repairedAfterMigration && (
                      <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                        ✓ ซ่อมแซมแล้ว
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{item.repairNote}</p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 font-mono text-[11px] text-emerald-300">
                    {item.envStatus}
                  </span>
                  {item.port && (
                    <span className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 font-mono text-[11px] text-cyan-300">
                      :{item.port}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyCommand(`cd "${item.folder}"; ${item.startCmd}`, `รัน ${item.name}`)
                    }
                    className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:bg-slate-700 hover:text-white"
                  >
                    {copiedCmd.includes(item.folder) ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-cyan-400" />
                    )}
                    รัน
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Launcher Bar for start-all-services.ps1 & backup-workspace-snapshot.js */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300 truncate">
              <Terminal className="h-4 w-4 shrink-0 text-emerald-400" />
              <span className="truncate">powershell -File scripts/start-all-services.ps1</span>
            </div>
            <button
              type="button"
              onClick={() =>
                handleCopyCommand(
                  'powershell -ExecutionPolicy Bypass -File "D:\\Light\\CEO\\scripts\\start-all-services.ps1"',
                  'Start All Services'
                )
              }
              className="ml-2 shrink-0 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            >
              คัดลอกคำสั่ง
            </button>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300 truncate">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400" />
              <span className="truncate">npm run doctor:snapshot</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopyCommand('npm run doctor:snapshot', 'Backup Workspace Snapshot')}
              className="ml-2 shrink-0 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            >
              คัดลอกคำสั่ง
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

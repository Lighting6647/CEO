import { CheckCircle2, ExternalLink, RefreshCw, Folder, GitBranch } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';

export function ProjectDetailModal({ project, isOpen, onClose, onTestSingle, isTesting }) {
  if (!project) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${project.name} • การตรวจสอบ 4 Quality Gates`} maxWidth="max-w-3xl">
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="cyan">{project.category}</Badge>
                <Badge variant="success">Grade {project.score}</Badge>
                <Badge variant="default">Health {project.health}%</Badge>
              </div>
              <h2 className="mt-2 text-xl font-bold text-white">{project.name}</h2>
              <p className="text-sm text-slate-400">{project.thName}</p>
            </div>

            <button
              onClick={() => onTestSingle(project.id)}
              disabled={isTesting}
              className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-cyan-500 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              {isTesting ? 'กำลังรันการทดสอบ...' : 'รัน Test Suite เฉพาะโปรเจกต์'}
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 border-t border-slate-800 pt-3 text-xs text-slate-400 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4 text-slate-500" />
              <span className="font-mono text-slate-300 truncate">{project.path}</span>
            </div>
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-slate-500" />
              <a
                href={`https://github.com/${project.repo}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 font-mono text-cyan-400 hover:underline"
              >
                https://github.com/{project.repo}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* 4 Pillars Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">การประเมิน 4 เสาหลัก (Pillar Gates)</h4>

          {/* Pillar 1 */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-semibold text-white">Pillar 1: Anti-AI Slop & UI/UX Design System</span>
              </div>
              <span className="text-xs font-bold text-emerald-400">PASSED</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              {project.gates.gate1.detail}
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-semibold text-white">Pillar 2: Autonomous Testing & QA Pipeline</span>
              </div>
              <span className="text-xs font-bold text-emerald-400">PASSED</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              {project.gates.gate2.detail}
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-semibold text-white">Pillar 3: Deployment & Live Link Gatekeeper</span>
              </div>
              <span className="text-xs font-bold text-emerald-400">PASSED</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              {project.gates.gate3.detail}
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-semibold text-white">Pillar 4: Interactive Feature Recommender</span>
              </div>
              <span className="text-xs font-bold text-emerald-400">READY</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              {project.gates.gate4.detail}
            </p>
          </div>
        </div>

        {/* Technical Metrics Grid */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">ข้อมูลสถิติการทดสอบ (QA Metrics)</h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <span className="text-slate-400">ผลการทดสอบ</span>
              <p className="mt-1 font-bold text-emerald-400">{project.metrics.tests}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <span className="text-slate-400">ความครอบคลุม</span>
              <p className="mt-1 font-bold text-cyan-400">{project.metrics.coverage}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <span className="text-slate-400">การรองรับหน้าจอ</span>
              <p className="mt-1 font-bold text-purple-400">{project.metrics.responsive}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <span className="text-slate-400">Linter Status</span>
              <p className="mt-1 font-bold text-indigo-400">{project.metrics.linter}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

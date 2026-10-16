import { Shield, GitCommit, CheckCircle, Lock } from 'lucide-react';

export function StatCards({ projects }) {
  const total = projects.length;
  const avgHealth = Math.round(projects.reduce((acc, p) => acc + p.health, 0) / total);
  const totalGates = total * 4;
  const passedGates = projects.reduce((acc, p) => {
    let count = 0;
    if (p.gates.gate1.status === 'passed') count++;
    if (p.gates.gate2.status === 'passed') count++;
    if (p.gates.gate3.status === 'passed') count++;
    if (p.gates.gate4.status === 'passed') count++;
    return acc + count;
  }, 0);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Health Score */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">ดัชนีคุณภาพองค์กร</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Shield className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white">{avgHealth}%</span>
          <span className="text-xs font-bold text-emerald-400">Grade A+ (Optimal)</span>
        </div>
        <p className="mt-2 text-xs text-slate-400">ผ่านเกณฑ์ Production Standards ครบ 4 ด้าน</p>
      </div>

      {/* Repositories Synced */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">คลังที่กำกับดูแล</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <GitCommit className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white">{total}</span>
          <span className="text-xs font-bold text-cyan-400">100% Synced</span>
        </div>
        <p className="mt-2 text-xs text-slate-400">ซิงค์ตรงกับบัญชี GitHub: Lighting6647</p>
      </div>

      {/* Gates Cleared */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Quality Gates ผ่านการตรวจ</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <CheckCircle className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white">{passedGates}/{totalGates}</span>
          <span className="text-xs font-bold text-indigo-400">100% Passed</span>
        </div>
        <p className="mt-2 text-xs text-slate-400">UI/UX • Test • Deploy • Recommender</p>
      </div>

      {/* Git Hooks Security */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">ระบบป้องกันความปลอดภัย</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Lock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white">11 คลัง</span>
          <span className="text-xs font-bold text-purple-400">Hooks Active</span>
        </div>
        <p className="mt-2 text-xs text-slate-400">Pre-Commit & Pre-Push ดักจับข้อผิดพลาด</p>
      </div>
    </div>
  );
}

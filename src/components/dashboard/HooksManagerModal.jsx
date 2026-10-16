import { CheckCircle2, Terminal, Shield, Copy, Check, Folder } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';

export function HooksManagerModal({ isOpen, onClose, onCopyCommand }) {
  const [copied, setCopied] = useState(false);

  const repos = [
    { name: 'CEO Portal', path: 'D:\\All Ai\\CEO', status: 'Protected' },
    { name: 'แดชบอร์ด IT Operations', path: 'D:\\All Ai\\แดชบอร์ด', status: 'Protected' },
    { name: 'Sale Page Platform', path: 'd:\\All Ai\\Sale page', status: 'Protected' },
    { name: 'Pass App', path: 'D:\\All Ai\\Pass App', status: 'Protected' },
    { name: 'IOS,Asset Manager', path: 'D:\\All Ai\\IOS,Asset', status: 'Protected' },
    { name: 'Team Task Tracking', path: 'D:\\All Ai\\Tracking', status: 'Protected' },
    { name: 'Smart Inventory AI', path: 'D:\\All Ai\\Inventoty AI', status: 'Protected' },
    { name: 'Thai Accounting App', path: 'D:\\All Ai\\Blueprint\\บัญชี\\accounting-app', status: 'Protected' },
    { name: 'Remote Access Manager', path: 'D:\\All Ai\\Remote', status: 'Protected' },
    { name: 'FitPulse Gym OS', path: 'D:\\All Ai\\Fitness', status: 'Protected' },
    { name: 'Trading Bot Pro', path: 'D:\\All Ai\\เทรด\\trading-app', status: 'Protected' },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText('npm run deploy:all-hooks');
    setCopied(true);
    onCopyCommand?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🛡️ ระบบ Git Hooks คุ้มครองความปลอดภัย (Quality Gate 1 & 3)" maxWidth="max-w-2xl">
      <div className="space-y-5">
        {/* Banner */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-xs text-emerald-200">
          <div className="flex items-center gap-2 font-bold text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            สถานะความปลอดภัย: คุ้มครองครบทั้ง 11 คลังย่อย (Active)
          </div>
          <p className="mt-1 leading-relaxed text-emerald-200/80">
            ระบบจะดักจับอัตโนมัติก่อนคำสั่ง Git ทำงาน ป้องกันการ Commit ไฟล์ต้องห้าม (.env, รหัสผ่าน, ไฟล์สื่อขนาดใหญ่) และทดสอบโค้ดก่อน Push ทุกครั้ง
          </p>
        </div>

        {/* Hook Types */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center gap-2 font-bold text-white">
              <Terminal className="h-4 w-4 text-cyan-400" />
              1. Pre-Commit Hook
            </div>
            <ul className="mt-2 space-y-1 text-slate-300">
              <li>• ตรวจจับ Sensitive Files (.env, secret keys)</li>
              <li>• แบนไฟล์ขนาดใหญ่ (.mp3, .mp4, .db)</li>
              <li>• บังคับรัน Linter (oxlint / eslint) ผ่าน 100%</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center gap-2 font-bold text-white">
              <Shield className="h-4 w-4 text-purple-400" />
              2. Pre-Push Hook
            </div>
            <ul className="mt-2 space-y-1 text-slate-300">
              <li>• รัน Automated Test Suites (Vitest/Jest)</li>
              <li>• รัน Production Build (npm run build)</li>
              <li>• ป้องกันโค้ดพังขึ้นสู่ Remote GitHub</li>
            </ul>
          </div>
        </div>

        {/* List of protected Repositories */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">รายการคลังที่ติดตั้ง Git Hooks</h4>
            <span className="text-[11px] text-cyan-400 font-mono">11/11 คลังสำเร็จ</span>
          </div>

          <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/40 divide-y divide-slate-800/60 text-xs">
            {repos.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-2.5">
                <div className="flex items-center gap-2">
                  <Folder className="h-3.5 w-3.5 text-slate-500" />
                  <span className="font-semibold text-slate-200">{r.name}</span>
                  <span className="hidden sm:inline font-mono text-[10px] text-slate-500">{r.path}</span>
                </div>
                <Badge variant="success" size="sm">{r.status}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* CLI Command Re-run */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <span className="text-cyan-400">$</span> npm run deploy:all-hooks
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-200 hover:bg-slate-700 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'คัดลอกแล้ว' : 'คัดลอกคำสั่ง'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

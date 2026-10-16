import { useState } from 'react';
import { KeyRound, CheckCircle2, Copy, Check, FileCode } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { ENV_VAULT_TEMPLATES } from '../../services/envVaultService';

export function EnvVaultModal({ isOpen, onClose, onShowToast }) {
  const [selectedTemplate, setSelectedTemplate] = useState(ENV_VAULT_TEMPLATES[0]);
  const [copiedKey, setCopiedKey] = useState(null);

  const generateEnvText = (template) => {
    return template.variables.map((v) => `# ${v.desc}\n${v.key}=${v.example}`).join('\n\n');
  };

  const handleCopyEnv = (template) => {
    const text = generateEnvText(template);
    navigator.clipboard.writeText(text);
    setCopiedKey(template.projectId);
    onShowToast?.('success', 'คัดลอก .env.example แล้ว', `เทมเพลตสำหรับ ${template.name} พร้อมใช้งาน`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🔐 Environment Variable Vault & Secret Audit" maxWidth="max-w-3xl">
      <div className="space-y-5 text-xs">
        {/* Banner */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-emerald-200">
          <div className="flex items-center gap-2 font-bold text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            ผลการตรวจสอบความปลอดภัยของ Environment Variables: ปลอดภัย 100%
          </div>
          <p className="mt-1 leading-relaxed text-emerald-200/80">
            ทุกโปรเจกต์มีการแยกไฟล์ `.env` ออกจาก Git ผ่าน `.gitignore` และมีการจัดเตรียมไฟล์ `.env.example` โดยไม่มี Hardcoded Secret รั่วไหล
          </p>
        </div>

        {/* Project Selector Tabs */}
        <div>
          <label className="block font-semibold text-slate-300 mb-2">เลือกโปรเจกต์เพื่อตรวจสอบ Environment Schema</label>
          <div className="flex flex-wrap gap-2">
            {ENV_VAULT_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.projectId}
                type="button"
                onClick={() => setSelectedTemplate(tmpl)}
                className={`rounded-xl px-3 py-2 font-semibold transition-all ${
                  selectedTemplate.projectId === tmpl.projectId
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {tmpl.name}
              </button>
            ))}
          </div>
        </div>

        {/* Template Details */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileCode className="h-4 w-4 text-cyan-400" />
              <span className="font-bold text-white text-sm">{selectedTemplate.name}</span>
              <Badge variant="cyan">{selectedTemplate.envFile}</Badge>
            </div>
            <button
              onClick={() => handleCopyEnv(selectedTemplate)}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700 transition-colors"
            >
              {copiedKey === selectedTemplate.projectId ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>คัดลอกทั้งไฟล์</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="pb-2">Variable Key</th>
                  <th className="pb-2">Example Value</th>
                  <th className="pb-2">คำอธิบาย</th>
                  <th className="pb-2 text-right">ความสำคัญ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {selectedTemplate.variables.map((v) => (
                  <tr key={v.key} className="text-slate-300">
                    <td className="py-2.5 font-bold text-cyan-400">{v.key}</td>
                    <td className="py-2.5 text-slate-400 truncate max-w-[180px]">{v.example}</td>
                    <td className="py-2.5 font-sans text-slate-300">{v.desc}</td>
                    <td className="py-2.5 text-right font-sans">
                      {v.required ? (
                        <span className="text-amber-400 font-semibold">Required</span>
                      ) : (
                        <span className="text-slate-500">Optional</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 border-t border-slate-800 pt-3 flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold font-sans">
              <KeyRound className="h-3.5 w-3.5" />
              {selectedTemplate.safetyAudit.details}
            </span>
            <Badge variant="success">Zero Leak Detected</Badge>
          </div>
        </div>
      </div>
    </Modal>
  );
}

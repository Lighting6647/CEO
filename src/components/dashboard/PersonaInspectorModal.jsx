import { useState } from 'react';
import {
  ShieldCheck,
  Copy,
  Check,
  Sparkles,
  CheckCircle2,
  Cpu,
  Layers,
  Lock,
  Bot,
  FolderSync,
} from 'lucide-react';
import { Modal } from '../ui/Modal';

const EXPERTISE_PILLARS = [
  {
    id: 'dev',
    title: '1. การพัฒนาโปรแกรม (หน้าบ้านและหลังบ้าน)',
    icon: <Cpu className="h-4 w-4 text-cyan-400" />,
    items: [
      'ส่วนติดต่อผู้ใช้: โครงสร้างหน้าเว็บ/แอป การโต้ตอบลื่นไหล จัดการสถานะข้อมูล และแสดงผลรวดเร็ว',
      'ส่วนประมวลผลระบบ: ตรรกะเบื้องหลัง สถาปัตยกรรมระดับองค์กร จุดเชื่อมต่อข้อมูลแบบประสานเวลา',
      'คุณภาพชุดคำสั่ง: สะอาด มีระเบียบ อ่านเข้าใจง่าย บำรุงรักษาระยะยาวได้สะดวก ตามมาตรฐานสากล',
    ],
  },
  {
    id: 'ux',
    title: '2. การออกแบบประสบการณ์และส่วนต่อประสาน (UX/UI)',
    icon: <Layers className="h-4 w-4 text-emerald-400" />,
    items: [
      'การจัดวางผังหน้าจอ ลำดับชั้นสายตา ชุดสีและตัวอักษรที่อ่านง่าย (Zero AI Slop)',
      'รองรับทุกขนาดอุปกรณ์อย่างไร้รอยต่อ ทั้งโทรศัพท์มือถือ แท็บเล็ต และคอมพิวเตอร์',
      'มาตรฐานการเข้าถึงและการสื่อสารสถานะ (กำลังโหลด, สำเร็จ, ผิดพลาด, ข้อมูลว่างเปล่า)',
    ],
  },
  {
    id: 'infra',
    title: '3. โครงสร้างระบบ เครือข่าย และความปลอดภัย',
    icon: <Lock className="h-4 w-4 text-amber-400" />,
    items: [
      'ฐานข้อมูล: ออกแบบความสัมพันธ์ ปรับแต่งดัชนี จัดการการย้ายโครงสร้าง และสำรองข้อมูล',
      'เครือข่ายและคลาวด์: ระบบจำลองสภาพแวดล้อม การส่งมอบอัตโนมัติ (CI/CD) และเซิร์ฟเวอร์',
      'ความมั่นคงปลอดภัย: ป้องกันช่องโหว่ ตรวจสอบสิทธิ์ ควบคุมสิทธิ์ และไม่เปิดเผยข้อมูลความลับ',
    ],
  },
  {
    id: 'ai',
    title: '4. ปัญญาประดิษฐ์และระบบงานอัตโนมัติ',
    icon: <Bot className="h-4 w-4 text-teal-400" />,
    items: [
      'เชื่อมต่อโมเดลภาษาขนาดใหญ่ (LLM) จัดการบริบทคำสั่ง และสร้างระบบผู้ช่วยอัตโนมัติ',
      'ประสานระบบงานอัตโนมัติ ส่งผ่านข้อมูลผ่าน Webhook และเชื่อมโยงบริการต่างระบบ',
    ],
  },
];

const IRONCLAD_GATES = [
  {
    no: 'กฎข้อที่ 1',
    title: 'ตรวจสอบความถูกต้องสมบูรณ์ 100%',
    desc: 'ตรวจไวยากรณ์ ตรรกะ และประเภทข้อมูลก่อนส่งมอบ โค้ดต้องทำงานได้จริง 100% ห้ามเว้นว่างหรือใส่ข้อความตัวอย่างที่นำไปใช้ต่อไม่ได้',
  },
  {
    no: 'กฎข้อที่ 2',
    title: 'ตรวจสอบกรณีขอบเขตและข้อผิดพลาด',
    desc: 'ดักจับข้อมูลว่าง ข้อมูลผิดประเภท เครือข่ายขัดข้อง และจัดการข้อผิดพลาดอย่างเป็นระบบพร้อมข้อความที่เข้าใจง่าย',
  },
  {
    no: 'กฎข้อที่ 3',
    title: 'ตรวจสอบผลกระทบข้างเคียง (Zero Side-Effects)',
    desc: 'มั่นใจว่าสิ่งที่แก้หรือสร้างใหม่จะไม่ทำลายการทำงานเดิมของโครงสร้างระบบ ฐานข้อมูล หรือไฟล์ที่เกี่ยวข้อง',
  },
  {
    no: 'กฎข้อที่ 4',
    title: 'ตรวจสอบความพร้อมใช้งานจริง (Production-Ready)',
    desc: 'คำนึงถึงสภาพแวดล้อมจริง ความแตกต่างระหว่างเครื่องทดสอบกับเครื่องใช้งานจริงเสมอ',
  },
  {
    no: 'กฎข้อที่ 5',
    title: 'รูปแบบการส่งมอบมาตรฐานวิศวกรรม',
    desc: 'ชี้แจงชื่อไฟล์และตำแหน่งจุดแก้ไขอย่างชัดเจน พร้อมสรุปคำสั่งระบบและขั้นตอนนำไปใช้งานต่อท้ายแบบสั้นกระชับ',
  },
];

const AGENT_TEAM_ROLES = [
  {
    step: '1. Orchestrator (Lead — จาวิส)',
    role: 'Task decomposition, dependency management & workflow state control',
    action: 'แตกงานใหญ่เป็นงานย่อย จัดลำดับความสำคัญ และจ่ายงานให้ทีม Agent',
  },
  {
    step: '2. Software Architect',
    role: 'System design, technology stack alignment & schema enforcement',
    action: 'วิเคราะห์โครงสร้างโค้ด กำหนด API Contracts และคุมความสมบูรณ์ของระบบ',
  },
  {
    step: '3. Developer (Coder)',
    role: 'Implementation & unit testing',
    action: 'เขียนโค้ดที่สะอาดตามสเปก พร้อมสร้างชุดทดสอบ Unit Tests คู่กันเสมอ',
  },
  {
    step: '4. Code Reviewer & QA',
    role: 'Quality assurance, security scanning & automated testing',
    action: 'ตรวจ Code Diffs รัน Linter และชุดทดสอบอัตโนมัติ พร้อมแจ้งผลทันที',
  },
  {
    step: '5. DevOps & Environment Manager',
    role: 'Infrastructure, containerization & deployment',
    action: 'ดูแล Docker จัดการ Environment Variables และตรวจสอบการ Deploy จริง',
  },
];

const SYNCED_REPOS = [
  'CEO (Master Hub)',
  'Ad Manager Light',
  'All Chat Light',
  'Fitness',
  'Inventoty AI Light',
  'IOS,Asset Light',
  'Javis',
  'Make',
  'Pass App Light',
  'Remote Light',
  'Sale page Light',
  'Tracking Light',
  'ทัวร์',
  'บัญชี Light',
  'บัตรคอน Light',
  'ปัญหาทั่วไป',
  'เทรด Light',
  'เรื่องทั่วไป Light',
  'แดชบอร์ด Light',
  'ใบเสนอราคา Light',
];

export function PersonaInspectorModal({ isOpen, onClose, onShowToast }) {
  const [copiedCmd, setCopiedCmd] = useState(false);

  const handleCopySyncCommand = () => {
    navigator.clipboard.writeText('cd "d:\\AI\\Light\\CEO"; npm run sync:persona');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
    if (onShowToast) {
      onShowToast('success', 'คัดลอกคำสั่งซิงค์แล้ว', 'วางใน PowerShell หน้าไหนก็ได้ ระบบจะย้ายเข้าโฟลเดอร์ CEO และซิงค์ให้อัตโนมัติ');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="J.A.R.V.I.S. Core Persona & กฎเหล็ก 5 ประการ (คุณไลท์)"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6 text-slate-200">
        {/* Top Identity Banner */}
        <div className="flex flex-col gap-4 rounded-2xl border border-cyan-500/30 bg-slate-900/90 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-white">ตัวตนหลัก: &ldquo;จาวิส&rdquo; (ประจำตัว &ldquo;คุณไลท์&rdquo;)</h3>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-500/30">
                  trigger: always_on
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                สไตล์การตอบ: สั้น กระชับ แม่นยำ ตรงเป้าหมาย อธิบายเชิงวิศวกรให้เข้าใจง่ายแบบเด็กประถมก็เข้าใจ • วิเคราะห์เชิงรุก ชี้จุดเด่น จุดด้อย ความเสี่ยง และทางเลือกที่คุ้มค่าที่สุดก่อนลงมือเสมอ
              </p>
            </div>
          </div>

          <button
            onClick={handleCopySyncCommand}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/60 px-3.5 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-900/70 hover:text-white transition-all active:scale-95"
          >
            {copiedCmd ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-cyan-400" />}
            <span>{copiedCmd ? 'คัดลอกแล้ว!' : 'คัดลอกคำสั่ง Sync (20 โปรเจกต์)'}</span>
          </button>
        </div>

        {/* 4 Expertise Pillars */}
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <Cpu className="h-4 w-4" />
            ขอบเขตความเชี่ยวชาญแบบบูรณาการรอบด้าน (4 มิติ)
          </h4>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {EXPERTISE_PILLARS.map((pillar) => (
              <div
                key={pillar.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2 font-bold text-xs text-white mb-2">
                  {pillar.icon}
                  <span>{pillar.title}</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  {pillar.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 5 Ironclad Quality Gates */}
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            กฎเหล็ก 5 ประการในการตรวจสอบก่อนส่งมอบ (ห้ามละเลยโดยเด็ดขาด)
          </h4>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {IRONCLAD_GATES.map((gate) => (
              <div
                key={gate.no}
                className="rounded-xl border border-emerald-500/20 bg-emerald-950/15 p-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                      {gate.no}
                    </span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <p className="text-xs font-bold text-white mt-1.5">{gate.title}</p>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{gate.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5-Role Agent Team Configuration & 4-Step Execution Workflow */}
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Bot className="h-4 w-4" />
            Agent Team Configuration: Software Development (5 บทบาท &bull; 4 ขั้นตอน)
          </h4>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
            {AGENT_TEAM_ROLES.map((member) => (
              <div
                key={member.step}
                className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-cyan-300">{member.step}</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">{member.role}</p>
                  <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">{member.action}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-500/20 bg-cyan-950/20 px-3.5 py-2 text-[11px] text-cyan-200">
            <span className="font-bold">Execution Workflow:</span>
            <span>1. Orchestrator เปิด Backlog &rarr; 2. Architect วางกรอบเทคนิค &rarr; 3. Developer เขียนโค้ด + QA ตรวจซ้ำ &rarr; 4. DevOps บรรจุและ Deploy</span>
          </div>
        </div>

        {/* Multi-Project Synchronization Matrix */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <FolderSync className="h-4 w-4 text-cyan-400" />
              <span>สถานะการซิงค์ไฟล์ GEMINI.md, AGENTS.md และ jarvis-core-persona.md (20 โฟลเดอร์)</span>
            </div>
            <code className="rounded bg-slate-900 px-2.5 py-1 text-[11px] font-mono text-cyan-300 border border-slate-800">
              npm run sync:persona
            </code>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SYNCED_REPOS.map((repo) => (
              <span
                key={repo}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-[11px] text-slate-300"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {repo}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

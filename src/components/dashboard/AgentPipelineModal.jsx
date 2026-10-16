import { useState } from 'react';
import {
  Play,
  CheckCircle2,
  Download,
  Copy,
  Layers,
  FileText,
  Megaphone,
  TrendingUp,
  HeartHandshake,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { playClickSound, playSuccessSound } from '../../utils/soundEffects';

const PIPELINE_STEPS = [
  {
    step: 1,
    id: 'product_architect',
    agentName: 'Product Architect & UX Strategist',
    thaiTitle: 'ร่าง PRD และสเปกโครงสร้างผลิตภัณฑ์',
    icon: Layers,
    color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20',
    log: 'กำลังวิเคราะห์ User Persona, จัดทำ MoSCoW Matrix และวางสถาปัตยกรรมระบบ MVP...',
  },
  {
    step: 2,
    id: 'doc_operations_manager',
    agentName: 'Operations & Document Architect',
    thaiTitle: 'ร่างสัญญาข้อกำหนด (Terms) & นโยบาย PDPA',
    icon: FileText,
    color: 'text-blue-400 border-blue-500/30 bg-blue-950/20',
    log: 'กำลังตรวจสอบข้อกฎหมาย PDPA พ.ศ. 2562, ร่าง Terms of Service และเขียน SOP ปฏิบัติการ...',
  },
  {
    step: 3,
    id: 'brand_growth_hacker',
    agentName: 'Brand Awareness & Growth Hacker',
    thaiTitle: 'วางกลยุทธ์ Positioning & ตารางคอนเทนต์ 30 วัน',
    icon: Megaphone,
    color: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
    log: 'กำลังสกัด Unique Value Proposition (UVP), ออกแบบ Free Lead Magnet และวาง Content Pillars...',
  },
  {
    step: 4,
    id: 'sales_conversion_copywriter',
    agentName: 'Sales Funnel & Conversion Copywriter',
    thaiTitle: 'เขียน Sale Page ปิดการขาย & โมเดลราคา 3 ระดับ',
    icon: TrendingUp,
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
    log: 'กำลังร่างพาดหัวเจาะ Pain Point, ออกแบบตารางราคา 3 ระดับ (Value Stacking) และร่างข้อเสนอพิเศษ...',
  },
  {
    step: 5,
    id: 'customer_retention_specialist',
    agentName: 'Customer Experience & Retention Specialist',
    thaiTitle: 'ออกแบบ Onboarding 5 นาที & ซีรีส์อีเมลต้อนรับ',
    icon: HeartHandshake,
    color: 'text-purple-400 border-purple-500/30 bg-purple-950/20',
    log: 'กำลังออกแบบ 5-Step Aha! Moment, ซีรีส์อีเมลต้อนรับ 5 วัน และระบบป้องกันลูกค้ายกเลิก (Churn Prevention)...',
  },
];

export function AgentPipelineModal({ isOpen, onClose, onShowToast, onSaveToVault }) {
  const [productName, setProductName] = useState('WorkFlow Hub Pro');
  const [productCategory, setProductCategory] = useState('B2B SaaS / Automated Tools');
  const [targetAudience, setTargetAudience] = useState('ฟรีแลนซ์, เอเจนซี่ดิจิทัล และผู้ประกอบการ SME');
  const [coreProblem, setCoreProblem] = useState('เสียเวลาทำงานเอกสารซ้ำซากและไม่มีระบบติดตามการส่งมอบงานที่เป็นมาตรฐาน');

  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0 = idle, 1..5 = running, 6 = finished
  const [activeLog, setActiveLog] = useState('');
  const [generatedResults, setGeneratedResults] = useState(null);
  const [expandedStep, setExpandedStep] = useState(null);

  const handleStartPipeline = () => {
    if (!productName.trim()) {
      if (onShowToast) onShowToast('error', 'กรุณาระบุข้อมูล', 'ต้องกรอกชื่อ Digital Product ก่อนรัน Pipeline');
      return;
    }

    setIsRunning(true);
    setCurrentStep(1);
    setActiveLog(PIPELINE_STEPS[0].log);
    playClickSound();

    let stepIndex = 1;
    const interval = setInterval(() => {
      stepIndex++;
      if (stepIndex <= 5) {
        setCurrentStep(stepIndex);
        setActiveLog(PIPELINE_STEPS[stepIndex - 1].log);
        playClickSound();
      } else {
        clearInterval(interval);
        setCurrentStep(6);
        setIsRunning(false);
        setActiveLog('การรัน Pipeline เสร็จสิ้นสมบูรณ์ 100%! ได้รับเอกสารขับเคลื่อนธุรกิจครบ 5 มิติ');
        playSuccessSound();

        // Build domain-specific realistic generated output
        const results = [
          {
            step: 1,
            agentId: 'product_architect',
            agentName: 'Product Architect & UX Strategist',
            title: `PRD สเปกผลิตภัณฑ์: ${productName}`,
            category: 'Product Specs',
            version: '1.0.0',
            content: `# Product Requirement Document (PRD) v1.0\n## ผลิตภัณฑ์: ${productName} (${productCategory})\n\n### กลุ่มเป้าหมายหลัก (Target Audience)\n* ${targetAudience}\n\n### ปัญหาหลักที่แก้ไข (Core Problem)\n* ${coreProblem}\n\n### แผนฟังก์ชัน MoSCoW Matrix\n* **Must Have:** ระบบ Dashboard จัดการงาน, เทมเพลตมาตรฐาน 10 ชุด, ระบบ Export เอกสาร\n* **Should Have:** ระบบเชิญทีมงาน (Workspace Sharing), แจ้งเตือนผ่าน LINE / Email\n* **Could Have:** AI Auto-Fill อัจฉริยะ\n* **Won't Have:** การติดตั้งบนเซิร์ฟเวอร์แบบ Offline`,
          },
          {
            step: 2,
            agentId: 'doc_operations_manager',
            agentName: 'Operations & Document Architect',
            title: `Terms & PDPA Policy สำหรับ: ${productName}`,
            category: 'Legal & Compliance',
            version: '1.0.0',
            content: `# สัญญาข้อกำหนดและนโยบายความเป็นส่วนตัว (PDPA)\n## สำหรับ: ${productName}\n\n### ข้อที่ 1: วัตถุประสงค์และการเก็บรวบรวมข้อมูล\nบริษัทจัดเก็บข้อมูลส่วนบุคคลของผู้ใช้งาน ได้แก่ ชื่อ นามสกุล และอีเมล เพื่อวัตถุประสงค์ในการให้บริการ ${productName} และการรักษาความปลอดภัยของระบบตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562\n\n### ข้อที่ 2: มาตรฐานความปลอดภัย (Security Standard)\nข้อมูลจะได้รับการเข้ารหัสด้วยมาตรฐาน AES-256 ระดับสากล และไม่มีการเปิดเผยต่อบุคคลภายนอกโดยไม่ได้รับความยินยอม`,
          },
          {
            step: 3,
            agentId: 'brand_growth_hacker',
            agentName: 'Brand Awareness & Growth Hacker',
            title: `กลยุทธ์สร้างแบรนด์ & คอนเทนต์ 30 วัน: ${productName}`,
            category: 'Growth & Marketing',
            version: '1.0.0',
            content: `# แผนสร้างการรับรู้แบรนด์และแผนคอนเทนต์ 30 วัน\n## แบรนด์: ${productName}\n\n### สโลแกน Unique Value Proposition (UVP)\n> "จบปัญหา ${coreProblem} ภายใน 15 นาที ด้วย ${productName}"\n\n### แม่แบบ Lead Magnet ดึงดูดลูกค้าฟรี\n* **ชื่อ:** คัมภีร์ทางลัดแก้ปัญหาสำหรับ ${targetAudience}\n* **สัปดาห์ที่ 1:** วิดีโอสั้นตีแผ่ความเจ็บปวดก่อนใช้ ${productName}\n* **สัปดาห์ที่ 2:** เดโมการใช้งานจริง 60 วินาที\n* **สัปดาห์ที่ 3:** รีวิว Case Study ความสำเร็จ\n* **สัปดาห์ที่ 4:** ข้อเสนอพิเศษ Early-Bird Discount`,
          },
          {
            step: 4,
            agentId: 'sales_conversion_copywriter',
            agentName: 'Sales Funnel & Conversion Copywriter',
            title: `คำขายหน้า Sale Page & ตารางราคา 3 ระดับ: ${productName}`,
            category: 'Sales & Copywriting',
            version: '1.0.0',
            content: `# คำขายหน้า Sale Page และกลยุทธ์ราคา 3 ระดับ\n## โครงการ: ${productName}\n\n### พาดหัวหยุดนิ้ว (Headline)\n"เหนื่อยไหมกับการต้อง ${coreProblem}? ถึงเวลาให้ ${productName} ทำงานแทนคุณ!"\n\n### ตารางราคา 3 ระดับ (3-Tier Pricing)\n1. **Starter Tier (฿790/ด.):** ฟังก์ชันพื้นฐานสำหรับผู้เริ่มต้น 1 บัญชี\n2. **Pro Tier (฿1,890/ด. - แนะนำ):** ปลดล็อกฟังก์ชันเต็มรูปแบบ รองรับงานไม่จำกัด\n3. **Lifetime Special (฿4,990 ซื้อขาด):** สิทธิ์การใช้งานตลอดชีพ จำกัด 100 ท่านแรก`,
          },
          {
            step: 5,
            agentId: 'customer_retention_specialist',
            agentName: 'Customer Experience & Retention Specialist',
            title: `ระบบ Onboarding 5 ขั้นตอน & Retention Playbook: ${productName}`,
            category: 'Customer Success',
            version: '1.0.0',
            content: `# คู่มือการดูแลลูกค้าและกระตุ้นการซื้อซ้ำ\n## ระบบ: ${productName}\n\n### 5-Step Onboarding Journey\n* Step 1: ข้อความต้อนรับและวิดีโอแนะนำ 2 นาที\n* Step 2: ให้ผู้ใช้สร้างโปรเจกต์แรกภายใน 3 นาที\n* Step 3: แจกโบนัสเทมเพลตลับเมื่อทำภารกิจแรกสำเร็จ\n* Step 4: อีเมลแนะนำฟังก์ชันขั้นสูงในวันที่ 2\n* Step 5: ระบบ Referral Program แนะนำเพื่อนรับเครดิตฟรี 30 วัน`,
          },
        ];

        setGeneratedResults(results);
        if (onShowToast) onShowToast('success', 'Pipeline สำเร็จ 100%', 'ได้ชุดเอกสารพร้อมเปิดตัวสินค้า 5 ฉบับครบถ้วน');
      }
    }, 1100);
  };

  const handleSaveAllToVault = () => {
    if (!generatedResults) return;
    playSuccessSound();
    if (onSaveToVault) {
      onSaveToVault(generatedResults);
    }
    if (onShowToast) onShowToast('success', 'บันทึกลง Vault แล้ว', 'เอกสารทั้ง 5 ฉบับถูกจัดเก็บเข้า Knowledge Vault เรียบร้อย');
  };

  const handleDownloadFullPackage = () => {
    if (!generatedResults) return;
    playClickSound();
    const fullText = generatedResults
      .map(
        (r) =>
          `============================================================\n# STEP ${r.step}: ${r.title}\nผู้รับผิดชอบ: ${r.agentName}\n============================================================\n\n${r.content}\n\n`
      )
      .join('\n');

    const blob = new Blob([fullText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LAUNCH_PACKAGE_${productName.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    if (onShowToast) onShowToast('success', 'ดาวน์โหลดเรียบร้อย', 'ดาวน์โหลด Launch Package ฉบับเต็มสำเร็จ');
  };

  const handleCopyAll = () => {
    if (!generatedResults) return;
    playClickSound();
    const fullText = generatedResults.map((r) => `# ${r.title}\n\n${r.content}`).join('\n\n---\n\n');
    navigator.clipboard.writeText(fullText);
    if (onShowToast) onShowToast('success', 'คัดลอกทั้งหมดแล้ว', 'เนื้อหา 5 ฉบับอยู่ในคลิปบอร์ดพร้อมนำไปใช้งาน');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="5 AI Agent Pipeline Orchestrator" maxWidth="max-w-4xl">
      <div className="space-y-6">
        {/* Banner */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">ระบบสั่งการทำงานแบบต่อเนื่อง (Orchestration Engine)</h3>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                กรอกข้อมูลไอเดีย Digital Product ของคุณ และให้ระบบส่งต่อข้อมูลให้ AI Agent ทั้ง 5 ตัวช่วยสร้างสเปกผลิตภัณฑ์, เอกสารสัญญา, แผนการตลาด, คำขายหน้าเว็บ และคู่มือดูแลลูกค้าให้เสร็จสมบูรณ์ในคลิกเดียว
              </p>
            </div>
          </div>
        </div>

        {/* Input Parameters Form (disabled while running) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ชื่อผลิตภัณฑ์ดิจิทัล (Product Name)
            </label>
            <input
              type="text"
              disabled={isRunning}
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="เช่น: PromptLab Pro"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              หมวดหมู่ผลิตภัณฑ์ (Category)
            </label>
            <input
              type="text"
              disabled={isRunning}
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              placeholder="เช่น: B2B SaaS, No-Code Tools"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              กลุ่มลูกค้าเป้าหมาย (Target Audience)
            </label>
            <input
              type="text"
              disabled={isRunning}
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="เช่น: ฟรีแลนซ์, เอเจนซี่การตลาด"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ปัญหาหลักที่ต้องการแก้ไข (Core Pain Point)
            </label>
            <input
              type="text"
              disabled={isRunning}
              value={coreProblem}
              onChange={(e) => setCoreProblem(e.target.value)}
              placeholder="เช่น: เสียเวลาทำงานเอกสารซ้ำซ้อน"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none disabled:opacity-60"
            />
          </div>
        </div>

        {/* Pipeline Execution Flow Stepper */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">ขั้นตอนการประมวลผล (Pipeline Stages)</span>
            {currentStep > 0 && (
              <span className="text-xs font-mono text-cyan-400">
                สถานะ: {currentStep === 6 ? '100% สำเร็จ' : `กำลังรันขั้นตอนที่ ${currentStep}/5`}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
            {PIPELINE_STEPS.map((s) => {
              const IconComp = s.icon;
              const isPast = currentStep > s.step;
              const isCurrent = currentStep === s.step;
              return (
                <div
                  key={s.step}
                  className={`flex flex-col rounded-xl border p-3 transition-all ${
                    isPast
                      ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                      : isCurrent
                      ? 'border-cyan-500/60 bg-cyan-950/40 text-cyan-200 ring-2 ring-cyan-500/30 animate-pulse'
                      : 'border-slate-800 bg-slate-900/30 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold">STEP 0{s.step}</span>
                    {isPast ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    ) : isCurrent ? (
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                    ) : (
                      <IconComp className="h-3.5 w-3.5 opacity-40" />
                    )}
                  </div>
                  <h4 className="text-xs font-semibold line-clamp-1 text-white">{s.thaiTitle.split('&')[0]}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{s.agentName.split('&')[0]}</p>
                </div>
              );
            })}
          </div>

          {/* Active Status Log Bar */}
          {currentStep > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/90 px-4 py-2.5 font-mono text-xs text-slate-300 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <span className="line-clamp-1">{activeLog}</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="text-xs text-slate-500">
            {generatedResults ? 'พร้อมส่งออกชุดเอกสาร 5 รายการ' : 'คลิกเพื่อเริ่มกระบวนการอัตโนมัติ'}
          </div>

          <div className="flex items-center gap-2">
            {!generatedResults ? (
              <button
                disabled={isRunning}
                onClick={handleStartPipeline}
                className="flex items-center gap-2 rounded-xl border border-cyan-500/50 bg-cyan-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-950/50 disabled:opacity-60"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{isRunning ? 'กำลังประมวลผล Pipeline...' : 'เริ่มรัน Pipeline 5 Agents'}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveAllToVault}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-3.5 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/60 transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>บันทึกลง Knowledge Vault</span>
                </button>
                <button
                  onClick={handleCopyAll}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white transition-all"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>คัดลอกทั้งหมด</span>
                </button>
                <button
                  onClick={handleDownloadFullPackage}
                  className="flex items-center gap-1.5 rounded-xl border border-cyan-500/50 bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500 transition-all shadow-md shadow-cyan-950/50"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>ดาวน์โหลด Launch Package (.md)</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Results Preview (Accordion) */}
        {generatedResults && (
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-200">ผลงานที่ระบบสร้างขึ้น (Generated Deliverables):</h4>
            <div className="space-y-2">
              {generatedResults.map((res) => {
                const isExpanded = expandedStep === res.step;
                return (
                  <div key={res.step} className="rounded-xl border border-slate-800 bg-slate-950/70 overflow-hidden">
                    <button
                      onClick={() => setExpandedStep(isExpanded ? null : res.step)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left text-xs text-slate-200 hover:bg-slate-900 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-400 font-bold">Step {res.step}</span>
                        <span className="font-semibold">{res.title}</span>
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">{res.category}</span>
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                    </button>
                    {isExpanded && (
                      <div className="border-t border-slate-800/80 p-4 font-mono text-xs text-slate-300 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap select-all bg-slate-950">
                        {res.content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

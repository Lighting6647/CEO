import { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  FileText,
  Megaphone,
  TrendingUp,
  HeartHandshake,
  Copy,
  Check,
  Terminal,
  Zap,
  Play,
  MessageSquare,
  FolderLock,
  ArrowRight,
  Code,
  Cpu,
  Workflow,
  Eye,
  Shield,
  GitPullRequest,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { KnowledgeVaultView } from './KnowledgeVaultView';
import { AgentPipelineModal } from './AgentPipelineModal';
import { AgentLiveChatModal } from './AgentLiveChatModal';
import { CodingTaskDelegatorModal } from './CodingTaskDelegatorModal';
import { ComponentSandboxModal } from './ComponentSandboxModal';
import { CodeSecurityScannerModal } from './CodeSecurityScannerModal';
import { GitPrCreatorModal } from './GitPrCreatorModal';
import { CODING_AGENTS } from '../../data/codingSquadData';
import { INITIAL_VAULT_ITEMS } from '../../data/agentInitialVault';
import { playClickSound, playSuccessSound } from '../../utils/soundEffects';

const STORAGE_KEY = 'antigravity_agent_vault_items';

const EXECUTIVE_AGENTS = [
  {
    id: 'product_architect',
    number: '01',
    name: 'Product Architect & UX Strategist',
    thaiTitle: 'สถาปัตยกรรมผลิตภัณฑ์ & ประสบการณ์ผู้ใช้',
    role: 'Chief Product Officer / UX Architect',
    color: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-400',
    badgeColor: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
    icon: Layers,
    description: 'ออกแบบโครงสร้างสเปกผลิตภัณฑ์ดิจิทัล วาง Feature Roadmap และคุมมาตรฐานคุณภาพ UX ระดับวิศวกรรม',
    kpi: 'MVP Time-to-Market · Zero UX Debt',
    promptTemplate:
      'ช่วยร่าง PRD (Product Requirement Document) สำหรับผลิตภัณฑ์ดิจิทัลซอฟต์แวร์ โดยแบ่ง Phase: MVP, Core Features และ Value Enhancers พร้อมระบุ User Personas, Acceptance Criteria และ Tech Architecture ที่เหมาะสม',
    quickActions: [
      { label: 'ร่าง PRD สินค้าใหม่', prompt: 'ช่วยเขียน PRD เต็มรูปแบบสำหรับซอฟต์แวร์เครื่องมือสำเร็จรูป' },
      { label: 'จัดลำดับ MVP MoSCoW', prompt: 'ช่วยคัดกรองฟังก์ชันซอฟต์แวร์ตามหลัก MoSCoW ให้เหลือเฉพาะสิ่งที่จำเป็นที่สุดในการเปิดตัว' },
      { label: 'ตรวจสอบ UX Journey', prompt: 'ช่วยตรวจสอบ User Flow การสมัครและเริ่มต้นใช้งานให้กระชับเหลือคลิกน้อยที่สุด' },
    ],
  },
  {
    id: 'doc_operations_manager',
    number: '02',
    name: 'Operations & Document Architect',
    thaiTitle: 'ระบบเอกสารสัญญา & ปฏิบัติการภายใน',
    role: 'Head of Operations & Legal Compliance',
    color: 'border-blue-500/40 bg-blue-950/20 text-blue-400',
    badgeColor: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
    icon: FileText,
    description: 'ร่างเอกสารสัญญา นโยบายความเป็นส่วนตัว (PDPA), Terms of Service, SOP และสร้างระบบ Knowledge Base ภายในองค์กร',
    kpi: '100% Legal Compliance · Standardized SOPs',
    promptTemplate:
      'ช่วยร่างเอกสารข้อกำหนดการให้บริการ (Terms of Service) และนโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA/Privacy Policy) สำหรับระบบเว็บและซอฟต์แวร์ที่รัดกุมตามกฎหมาย พร้อมแบบฟอร์มขอความยินยอม (Consent Form)',
    quickActions: [
      { label: 'ร่าง Terms & Privacy', prompt: 'ร่าง Terms of Service และ Privacy Policy ภาษาไทยสำหรับซอฟต์แวร์ SaaS' },
      { label: 'เขียน SOP การทำงาน', prompt: 'เขียน SOP สำหรับขั้นตอนการส่งมอบบัญชีซอฟต์แวร์และการแก้ปัญหาเมื่อระบบขัดข้อง' },
      { label: 'โครงสร้าง User Guide', prompt: 'วางโครงสร้างสารบัญและคู่มือการใช้งานระบบสำหรับผู้ใช้ใหม่ (Quick Start Manual)' },
    ],
  },
  {
    id: 'brand_growth_hacker',
    number: '03',
    name: 'Brand Awareness & Growth Hacker',
    thaiTitle: 'สร้างการรับรู้แบรนด์ & ไวรัลคอนเทนต์',
    role: 'Head of Growth & Brand Strategy',
    color: 'border-amber-500/40 bg-amber-950/20 text-amber-400',
    badgeColor: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    icon: Megaphone,
    description: 'วางกลยุทธ์ Positioning, คอนเทนต์ Pain Point Demos รายสัปดาห์ และการสร้าง Growth Loops ดึงดูดผู้ใช้งานใหม่',
    kpi: 'Viral Reach · Organic Lead Acquisition',
    promptTemplate:
      'ช่วยวิเคราะห์ Unique Value Proposition (UVP) และวางแผน Content Calendar 30 วัน สำหรับโปรโมทซอฟต์แวร์เครื่องมือสำเร็จรูป โดยเน้นตีแผ่ Pain Point ของลูกค้าและแสดงผลลัพธ์ก่อน-หลังใช้งาน',
    quickActions: [
      { label: 'วาง Content 30 วัน', prompt: 'วางตาราง Content Pillars 30 วัน สำหรับโปรโมทซอฟต์แวร์เครื่องมือดิจิทัล' },
      { label: 'คิดไอเดีย Lead Magnet', prompt: 'ออกแบบเครื่องมือฟรีหรือเทมเพลตแจกฟรี (Free Lead Magnet) เพื่อดึงดูดอีเมลลูกค้า' },
      { label: 'ร่าง UVP 1 ประโยค', prompt: 'เขียนสโลแกน Brand Positioning สั้นๆ 1 ประโยคที่อธิบายคุณค่าของซอฟต์แวร์ได้ชัดเจนทันที' },
    ],
  },
  {
    id: 'sales_conversion_copywriter',
    number: '04',
    name: 'Sales Funnel & Conversion Copywriter',
    thaiTitle: 'เร่งยอดขาย & ปิดการขายหน้าเว็บ',
    role: 'Chief Revenue Copywriter / Funnel Architect',
    color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400',
    badgeColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    icon: TrendingUp,
    description: 'เขียน Sale Page สไตล์ Direct-Response, ออกแบบ Pricing Tiers, วิดีโอ VSL และข้อความปิดการขายที่ชี้จุดคุ้มทุนชัดเจน',
    kpi: 'Conversion Rate > 4.5% · Average Order Value',
    promptTemplate:
      'ช่วยเขียนคำโฆษณาหน้า Sale Page แบบ Direct-Response ตั้งแต่ Headline หยุดนิ้ว, ชี้ปัญหา, เฉลยโซลูชัน, ตารางเทียบฟีเจอร์, ตารางราคา 3 ระดับ (Basic, Pro, Business) และเงื่อนไขการรับประกันความพอใจ',
    quickActions: [
      { label: 'เขียน Sale Page ครบชุด', prompt: 'เขียนโครงสร้าง Sale Page โน้มน้าวใจฉบับเต็มสำหรับซอฟต์แวร์/ระบบเว็บ' },
      { label: 'วาง Pricing 3 ระดับ', prompt: 'ออกแบบตารางแพ็กเกจราคา 3 ระดับ (Starter / Pro / Lifetime Deal) พร้อม Value Stacking' },
      { label: 'สคริปต์ VSL 2 นาที', prompt: 'เขียนสคริปต์วิดีโอปิดการขายความยาว 2 นาที สำหรับเปิดตัวเครื่องมือสำเร็จรูป' },
    ],
  },
  {
    id: 'customer_retention_specialist',
    number: '05',
    name: 'Customer Experience & Retention Specialist',
    thaiTitle: 'ดูแลลูกค้าหลังซื้อ & ผลักดันการซื้อซ้ำ',
    role: 'Head of Customer Success & Retention',
    color: 'border-purple-500/40 bg-purple-950/20 text-purple-400',
    badgeColor: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
    icon: HeartHandshake,
    description: 'ออกแบบระบบ Onboarding ให้เกิด Aha! Moment ไวที่สุด, ร่างซีรีส์อีเมลต้อนรับ, และสร้างระบบ Referral ชวนเพื่อน',
    kpi: 'Churn Rate < 2% · High LTV & Referral Rate',
    promptTemplate:
      'ช่วยออกแบบ Customer Onboarding Journey 5 ขั้นตอนหลังลูกค้าชำระเงิน พร้อมร่างซีรีส์อีเมลต้อนรับ 5 วัน (Welcome Email Sequence) และคู่มือคำถามที่พบบ่อย (FAQ Playbook) เพื่อลดอัตราการยกเลิกการใช้งาน',
    quickActions: [
      { label: 'วาง Onboarding 5 นาที', prompt: 'ออกแบบขั้นตอน Onboarding ทันทีหลังซื้อ ให้ลูกค้าเริ่มใช้ซอฟต์แวร์ได้ใน 5 นาที' },
      { label: 'ซีรีส์อีเมลต้อนรับ 5 วัน', prompt: 'เขียนอีเมลต้อนรับ 5 ฉบับ ส่งวันละฉบับหลังการซื้อเพื่อสอนฟีเจอร์และสร้างความคุ้มค่า' },
      { label: 'ระบบ Referral ชวนเพื่อน', prompt: 'คิดโปรแกรมแนะนำเพื่อน (Referral Program) ที่ให้สิทธิประโยชน์ทั้งผู้ชวนและผู้สมัคร' },
    ],
  },
];

export function AgentsSquadView({ onCopyPrompt, onShowToast }) {
  const [selectedSquad, setSelectedSquad] = useState('executive'); // 'executive' | 'coding'
  const [activeTab, setActiveTab] = useState('squad'); // 'squad' | 'vault'
  const [copiedId, setCopiedId] = useState(null);

  const currentSquadList = selectedSquad === 'executive' ? EXECUTIVE_AGENTS : CODING_AGENTS;
  const [activeAgent, setActiveAgent] = useState(EXECUTIVE_AGENTS[0]);

  // Modals state
  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState(false);
  const [isDelegatorModalOpen, setIsDelegatorModalOpen] = useState(false);
  const [isLiveChatModalOpen, setIsLiveChatModalOpen] = useState(false);
  const [isSandboxModalOpen, setIsSandboxModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isGitPrModalOpen, setIsGitPrModalOpen] = useState(false);
  const [chatInitialAgentId, setChatInitialAgentId] = useState('product_architect');

  // Vault count
  const [vaultCount, setVaultCount] = useState(INITIAL_VAULT_ITEMS.length);

  useEffect(() => {
    setActiveAgent(selectedSquad === 'executive' ? EXECUTIVE_AGENTS[0] : CODING_AGENTS[0]);
  }, [selectedSquad]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setVaultCount(parsed.length);
      }
    } catch {
      // fallback
    }
  }, [activeTab]);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (onCopyPrompt) onCopyPrompt(text);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenChatForAgent = (agentId) => {
    playClickSound();
    setChatInitialAgentId(agentId);
    setIsLiveChatModalOpen(true);
  };

  const handleSaveToVault = (newItems) => {
    try {
      const current = localStorage.getItem(STORAGE_KEY);
      let list = INITIAL_VAULT_ITEMS;
      if (current) {
        const parsed = JSON.parse(current);
        if (Array.isArray(parsed)) list = parsed;
      }
      const updated = [...newItems, ...list];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setVaultCount(updated.length);
      playSuccessSound();
    } catch {
      // handle error
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="h-4 w-4" />
              </span>
              <h2 className="text-lg font-bold text-white">AI Agents Business & Engineering Command Hub</h2>
              <Badge variant="cyan" text="10 Native AI Agents" />
            </div>
            <p className="text-sm text-slate-400 max-w-3xl">
              ระบบรวม 10 ผู้บริหาร AI และวิศวกรซอฟต์แวร์: วางกลยุทธ์ธุรกิจและสเปกผลิตภัณฑ์, จัดการข้อกฎหมาย, ทำการตลาด, และกระจายงานเขียนโค้ดตามบริบทของทีม
            </p>
          </div>

          {/* Quick Action Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {selectedSquad === 'executive' ? (
              <button
                onClick={() => {
                  playClickSound();
                  setIsPipelineModalOpen(true);
                }}
                className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-600/90 px-4 py-2.5 text-xs font-bold text-white hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-950/50"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>รัน Pipeline 5 Agents อัตโนมัติ</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    playClickSound();
                    setIsDelegatorModalOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-600/90 px-4 py-2.5 text-xs font-bold text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-950/50"
                >
                  <Workflow className="h-3.5 w-3.5" />
                  <span>กระจายงานเขียนโค้ดตามบริบททีม</span>
                </button>
                <button
                  onClick={() => {
                    playClickSound();
                    setIsSandboxModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/40 px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/60 transition-all"
                  title="พรีวิว Component สดแบบ Sandbox"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sandbox</span>
                </button>
                <button
                  onClick={() => {
                    playClickSound();
                    setIsScannerModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-900/60 transition-all"
                  title="สแกนความปลอดภัยซอร์สโค้ด"
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Security Scan</span>
                </button>
                <button
                  onClick={() => {
                    playClickSound();
                    setIsGitPrModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-950/40 px-3 py-2 text-xs font-semibold text-violet-300 hover:bg-violet-900/60 transition-all"
                  title="เปิด Pull Request อัตโนมัติ"
                >
                  <GitPullRequest className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Git PR</span>
                </button>
              </>
            )}

            <button
              onClick={() => handleOpenChatForAgent(activeAgent.id)}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:border-cyan-500/50 hover:text-white transition-all shadow-sm"
            >
              <MessageSquare className="h-3.5 w-3.5 text-cyan-400" />
              <span>Live Chat กับ Agent</span>
            </button>
          </div>
        </div>

        {/* Squad Selection Switcher Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                playClickSound();
                setSelectedSquad('executive');
              }}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
                selectedSquad === 'executive'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>🏢 ทีมบริหารธุรกิจ (Executive Squad - 5 AI)</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setSelectedSquad('coding');
              }}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
                selectedSquad === 'coding'
                  ? 'bg-violet-500/20 text-violet-400 border border-violet-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="h-3.5 w-3.5" />
              <span>💻 ทีมวิศวกรเขียนโค้ด (Coding Squad - 5 AI)</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => {
                playClickSound();
                setActiveTab('squad');
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-semibold transition-all border ${
                activeTab === 'squad'
                  ? 'border-slate-700 bg-slate-800 text-white shadow-sm'
                  : 'border-transparent text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>ภาพรวมทีม ({currentSquadList.length} Agents)</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setActiveTab('vault');
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-semibold transition-all border ${
                activeTab === 'vault'
                  ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400 shadow-sm'
                  : 'border-transparent text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <FolderLock className="h-3.5 w-3.5" />
              <span>Knowledge Vault</span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-cyan-300 border border-slate-700">
                {vaultCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab: Squad Overview */}
      {activeTab === 'squad' && (
        <div className="space-y-6">
          {/* Squad Specific Banner Notice */}
          {selectedSquad === 'coding' && (
            <div className="rounded-2xl border border-violet-500/30 bg-violet-950/20 p-4 text-xs text-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Workflow className="h-4 w-4 text-violet-400 shrink-0" />
                <span>
                  <strong>Coding Squad Mode:</strong> ทีมเขียนโค้ดแบ่งงานกันตามบริบท (Tech Lead ออกแบบ ➔ Frontend ทำ UI ➔ Backend ทำ API ➔ DevOps ทำ CI/CD ➔ QA ทดสอบ E2E)
                </span>
              </div>
              <button
                onClick={() => {
                  playClickSound();
                  setIsDelegatorModalOpen(true);
                }}
                className="hidden sm:inline-flex items-center gap-1 font-bold text-violet-300 hover:text-white"
              >
                <span>เปิดระบบกระจายงาน</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Agents Grid */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            {currentSquadList.map((agent) => {
              const IconComponent = agent.icon;
              const isSelected = activeAgent.id === agent.id;
              return (
                <button
                  key={agent.id}
                  onClick={() => {
                    playClickSound();
                    setActiveAgent(agent);
                  }}
                  className={`flex flex-col text-left rounded-2xl border p-5 transition-all ${
                    isSelected
                      ? `${agent.color} shadow-lg shadow-cyan-950/40 scale-[1.02]`
                      : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3 w-full">
                    <span className="text-xs font-mono font-bold text-slate-500">#{agent.number}</span>
                    <span className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold border ${agent.badgeColor}`}>
                      {agent.role.split('/')[0].trim()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className="h-5 w-5 shrink-0" />
                    <h3 className="text-sm font-bold text-white leading-tight">{agent.thaiTitle}</h3>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{agent.description}</p>
                </button>
              );
            })}
          </div>

          {/* Selected Agent Workspace Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className={`p-2 rounded-xl border ${activeAgent.color}`}>
                    <activeAgent.icon className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">{activeAgent.name}</h3>
                    <p className="text-xs text-slate-400">
                      {activeAgent.role} · {activeAgent.thaiTitle}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">{activeAgent.description}</p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">เป้าหมายหลัก:</span>
                    <span className="rounded-md bg-slate-800 px-2 py-1 text-xs font-mono text-cyan-300 border border-slate-700">
                      {activeAgent.kpi}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenChatForAgent(activeAgent.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-3 py-1 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/50 transition-all"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>เปิดแชทสนทนากับ Agent นี้</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Quick Actions List */}
              <div className="w-full md:w-80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">คำสั่งด่วน (Quick Commands)</span>
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <div className="space-y-1.5">
                  {activeAgent.quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCopy(`qa-${activeAgent.id}-${idx}`, action.prompt)}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-300 hover:border-cyan-500/40 hover:bg-slate-800 transition-all text-left group"
                    >
                      <span className="font-medium group-hover:text-cyan-300">{action.label}</span>
                      {copiedId === `qa-${activeAgent.id}-${idx}` ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Master Prompt Box */}
            <div className="mt-6 pt-5 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                  Master Prompt พร้อมสั่งงาน
                </span>
                <button
                  onClick={() => handleCopy(`master-${activeAgent.id}`, activeAgent.promptTemplate)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:border-cyan-500 hover:text-white transition-all shadow-sm"
                >
                  {copiedId === `master-${activeAgent.id}` ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-300 font-semibold">คัดลอกคำสั่งแล้ว!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-400" />
                      <span>คัดลอก Prompt</span>
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 font-mono text-xs text-slate-300 leading-relaxed select-all">
                {activeAgent.promptTemplate}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Knowledge Vault */}
      {activeTab === 'vault' && (
        <KnowledgeVaultView onShowToast={onShowToast} />
      )}

      {/* Feature 1: Agent Pipeline Modal (Business) */}
      <AgentPipelineModal
        isOpen={isPipelineModalOpen}
        onClose={() => setIsPipelineModalOpen(false)}
        onShowToast={onShowToast}
        onSaveToVault={handleSaveToVault}
      />

      {/* Feature 2: Coding Task Delegator Modal (Engineering Context) */}
      <CodingTaskDelegatorModal
        isOpen={isDelegatorModalOpen}
        onClose={() => setIsDelegatorModalOpen(false)}
        onShowToast={onShowToast}
        onSaveToVault={handleSaveToVault}
        onOpenSandbox={() => {
          setIsDelegatorModalOpen(false);
          setIsSandboxModalOpen(true);
        }}
        onOpenScanner={() => {
          setIsDelegatorModalOpen(false);
          setIsScannerModalOpen(true);
        }}
        onOpenGitPr={() => {
          setIsDelegatorModalOpen(false);
          setIsGitPrModalOpen(true);
        }}
      />

      {/* Feature 3: Live Component Sandbox Preview */}
      <ComponentSandboxModal
        isOpen={isSandboxModalOpen}
        onClose={() => setIsSandboxModalOpen(false)}
        onShowToast={onShowToast}
      />

      {/* Feature 4: Automated Code Lint & Security Scanner */}
      <CodeSecurityScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onShowToast={onShowToast}
      />

      {/* Feature 5: Git Branch & Pull Request Automator */}
      <GitPrCreatorModal
        isOpen={isGitPrModalOpen}
        onClose={() => setIsGitPrModalOpen(false)}
        onShowToast={onShowToast}
      />

      {/* Feature 6: Agent Live Chat Modal (All 10 Agents) */}
      <AgentLiveChatModal
        isOpen={isLiveChatModalOpen}
        onClose={() => setIsLiveChatModalOpen(false)}
        initialAgentId={chatInitialAgentId}
        onShowToast={onShowToast}
        onSaveToVault={handleSaveToVault}
      />
    </div>
  );
}

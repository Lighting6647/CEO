import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Copy,
  Check,
  BookmarkPlus,
  Layers,
  FileText,
  Megaphone,
  TrendingUp,
  HeartHandshake,
  Bot,
  User,
  Trash2,
  Code,
  Layout,
  Database,
  CloudCog,
  ShieldAlert,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { playClickSound, playSuccessSound } from '../../utils/soundEffects';

const ALL_AGENT_PERSONAS = [
  // Executive Squad
  {
    id: 'product_architect',
    squad: 'executive',
    squadLabel: 'Executive',
    name: 'Product Architect & UX Strategist',
    thaiTitle: 'สถาปัตยกรรมผลิตภัณฑ์ & UX',
    icon: Layers,
    color: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/40',
    accentColor: 'cyan',
    welcomeMessage:
      'สวัสดีครับ ผมคือ Product Architect & UX Strategist พร้อมช่วยคุณวางโครงสร้าง PRD, คัดกรองฟังก์ชัน MVP ด้วย MoSCoW Matrix และออกแบบ User Journey เพื่อให้ผลิตภัณฑ์ดิจิทัลของคุณเปิดตัวได้อย่างไร้รอยต่อ มีไอเดียผลิตภัณฑ์ตัวไหนที่อยากให้ช่วยวางสเปกไหมครับ?',
    suggestedPrompts: [
      'ช่วยเขียนสเปก PRD สำหรับระบบเว็บเครื่องมือ AI สำเร็จรูป',
      'ช่วยคัดกรองฟังก์ชัน MVP MoSCoW ไม่ให้หลงทาง',
      'ออกแบบ User Flow การสมัครและเปิดใช้งานใน 3 คลิก',
    ],
  },
  {
    id: 'doc_operations_manager',
    squad: 'executive',
    squadLabel: 'Executive',
    name: 'Operations & Document Architect',
    thaiTitle: 'เอกสารสัญญา & ปฏิบัติการภายใน',
    icon: FileText,
    color: 'text-blue-400 bg-blue-950/40 border-blue-500/40',
    accentColor: 'blue',
    welcomeMessage:
      'สวัสดีครับ ผมคือ Operations & Document Architect พร้อมดูแลเอกสารทางกฎหมาย สัญญาการใช้งาน (Terms of Service), นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA) และมาตรฐานขั้นตอนการทำงาน (SOP) ภายในองค์กรให้ถูกต้อง 100% ครับ',
    suggestedPrompts: [
      'ร่าง Terms of Service สำหรับซอฟต์แวร์บริการรายเดือน',
      'เขียนนโยบาย PDPA และแบบฟอร์มขอความยินยอม (Consent)',
      'ร่าง SOP ขั้นตอนการรับเรื่องเมื่อระบบเซิร์ฟเวอร์ขัดข้อง',
    ],
  },
  {
    id: 'brand_growth_hacker',
    squad: 'executive',
    squadLabel: 'Executive',
    name: 'Brand Awareness & Growth Hacker',
    thaiTitle: 'สร้างการรับรู้แบรนด์ & ไวรัลคอนเทนต์',
    icon: Megaphone,
    color: 'text-amber-400 bg-amber-950/40 border-amber-500/40',
    accentColor: 'amber',
    welcomeMessage:
      'สวัสดีครับ! ผมคือ Growth Hacker พร้อมช่วยคุณหาตำแหน่งทางการตลาดที่โดดเด่น (UVP), วางแผนคอนเทนต์ตีแผ่ Pain Point ลูกค้า และออกแบบ Lead Magnet แจกฟรีเพื่อดึงดูดกลุ่มเป้าหมายให้กลายมาเป็นแฟนคลับแบรนด์ครับ',
    suggestedPrompts: [
      'คิดสโลแกน UVP สั้นๆ ที่อธิบายความคุ้มค่าทันที',
      'วางตาราง Content Pillars 30 วันโปรโมทเครื่องมือดิจิทัล',
      'ออกแบบ Freebie Lead Magnet ที่คนอยากดาวน์โหลดทันที',
    ],
  },
  {
    id: 'sales_conversion_copywriter',
    squad: 'executive',
    squadLabel: 'Executive',
    name: 'Sales Funnel & Conversion Copywriter',
    thaiTitle: 'เร่งยอดขาย & ปิดการขายหน้าเว็บ',
    icon: TrendingUp,
    color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40',
    accentColor: 'emerald',
    welcomeMessage:
      'สวัสดีครับ ผมคือ Conversion Copywriter รับหน้าที่เปลี่ยนผู้เข้าชมเว็บให้กลายเป็นลูกค้าชำระเงินด้วยเทคนิค Direct-Response, พาดหัวหยุดนิ้ว, ตารางราคา 3 ระดับ และการขจัดข้อโต้แย้งแบบไร้ความเสี่ยงครับ',
    suggestedPrompts: [
      'เขียนพาดหัว Hero Section และข้อเสนอพิเศษสำหรับ Sale Page',
      'ออกแบบแพ็กเกจราคา 3 ระดับ (Starter / Pro / Lifetime)',
      'เขียนสคริปต์วิดีโอ VSL ปิดการขายความยาว 90 วินาที',
    ],
  },
  {
    id: 'customer_retention_specialist',
    squad: 'executive',
    squadLabel: 'Executive',
    name: 'Customer Experience & Retention Specialist',
    thaiTitle: 'ดูแลลูกค้าหลังซื้อ & ผลักดันการซื้อซ้ำ',
    icon: HeartHandshake,
    color: 'text-purple-400 bg-purple-950/40 border-purple-500/40',
    accentColor: 'purple',
    welcomeMessage:
      'สวัสดีครับ ผมคือ Customer Retention Specialist เป้าหมายของผมคือทำให้ลูกค้าที่ซื้อแล้วหลงรักใน 5 นาทีแรก (Aha! Moment), ส่งอีเมลต้อนรับสร้างความคุ้มค่า และลดอัตรา Churn Rate ให้ต่ำกว่า 2% ครับ',
    suggestedPrompts: [
      'วางแผน Onboarding 5 ขั้นตอนหลังการชำระเงิน',
      'เขียนซีรีส์อีเมลต้อนรับ 5 วัน (Day 1 ถึง Day 5)',
      'ออกแบบระบบ Referral ชวนเพื่อนสมัครเพื่อรับสิทธิ์ Pro ฟรี',
    ],
  },

  // Coding Squad
  {
    id: 'tech_lead_architect',
    squad: 'coding',
    squadLabel: 'Engineering',
    name: 'Tech Lead & System Architect',
    thaiTitle: 'หัวหน้าสถาปัตยกรรม & ออกแบบระบบ',
    icon: Code,
    color: 'text-violet-400 bg-violet-950/40 border-violet-500/40',
    accentColor: 'violet',
    welcomeMessage:
      'สวัสดีครับ ผมคือ Tech Lead & System Architect ประจำทีมเขียนโค้ด พร้อมช่วยวิเคราะห์สเปก ออกแบบ Database Schema, กำหนด API Contracts และแตกงานแจกจ่ายให้ทีม Frontend, Backend, DevOps, QA ตามบริบทครับ',
    suggestedPrompts: [
      'ช่วยแตกงานฟีเจอร์เป็น 4 Tickets กระจายให้ทีมเขียนโค้ด',
      'ช่วยออกแบบ PostgreSQL DDL Schema พร้อม Index และ FK',
      'ออกแบบ REST API Contract Specification รูปแบบ JSON',
    ],
  },
  {
    id: 'frontend_engineer',
    squad: 'coding',
    squadLabel: 'Engineering',
    name: 'Senior Frontend & UI Engineer',
    thaiTitle: 'วิศวกรส่วนต่อประสาน & UI/UX Specialist',
    icon: Layout,
    color: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/40',
    accentColor: 'cyan',
    welcomeMessage:
      'สวัสดีครับ ผมคือ Senior Frontend Engineer พร้อมเขียนโค้ด React 19, TypeScript และ Tailwind CSS ตามมาตรฐาน Zero AI Slop มี State Management, Loading Skeletons และ Responsive ครบ 3 Breakpoints ครับ',
    suggestedPrompts: [
      'ช่วยเขียน React 19 Component พร้อม Tailwind CSS',
      'เขียน Loading Skeleton State และ Toast Feedback',
      'ตรวจสอบและปรับแต่ง Responsive ให้รองรับ Mobile (375px)',
    ],
  },
  {
    id: 'backend_engineer',
    squad: 'coding',
    squadLabel: 'Engineering',
    name: 'Senior Backend & Database Engineer',
    thaiTitle: 'วิศวกรระบบแบ็กเอนด์ & ฐานข้อมูล',
    icon: Database,
    color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40',
    accentColor: 'emerald',
    welcomeMessage:
      'สวัสดีครับ ผมคือ Senior Backend Engineer พร้อมพัฒนา Serverless APIs (Netlify Functions), จัดการ Database Queries, การตรวจสอบข้อมูลด้วย Zod, ระบบ Auth (JWT/OAuth) และ Rate Limiting ครับ',
    suggestedPrompts: [
      'ช่วยเขียน Netlify Serverless API พร้อม Zod Validation',
      'เขียนคำสั่ง SQL Migration และ Indexing เพิ่มความเร็ว',
      'เขียน Middleware ตรวจสอบสิทธิ์ JWT และ Rate Limiting',
    ],
  },
  {
    id: 'devops_infra_engineer',
    squad: 'coding',
    squadLabel: 'Engineering',
    name: 'Lead DevOps & Cloud Engineer',
    thaiTitle: 'วิศวกรโครงสร้างพื้นฐาน & ระบบส่งมอบ',
    icon: CloudCog,
    color: 'text-amber-400 bg-amber-950/40 border-amber-500/40',
    accentColor: 'amber',
    welcomeMessage:
      'สวัสดีครับ ผมคือ Lead DevOps Engineer พร้อมเขียนสคริปต์ GitHub Actions CI/CD Pipeline, จัดการ Docker Multi-stage, ติดตั้ง Git Quality Hooks และตั้งค่า Environment Secrets ให้ปลอดภัย 100% ครับ',
    suggestedPrompts: [
      'ช่วยเขียน GitHub Actions Workflow (.github/workflows/ci.yml)',
      'สร้าง Dockerfile Multi-stage ขนาดกะทัดรัดและปลอดภัย',
      'เขียน Git Pre-push Hook ตรวจสอบ Lint และ Build ก่อน Push',
    ],
  },
  {
    id: 'qa_security_engineer',
    squad: 'coding',
    squadLabel: 'Engineering',
    name: 'QA Automation & Security Auditor',
    thaiTitle: 'วิศวกรทดสอบอัตโนมัติ & ความปลอดภัย',
    icon: ShieldAlert,
    color: 'text-rose-400 bg-rose-950/40 border-rose-500/40',
    accentColor: 'rose',
    welcomeMessage:
      'สวัสดีครับ ผมคือ QA & Security Engineer ทำหน้าที่ตรวจสอบช่องโหว่ OWASP Top 10, ป้องกันข้อผิดพลาดก่อนขึ้น Production และเขียน Automated Test Suites ด้วย Playwright E2E และ Vitest ครับ',
    suggestedPrompts: [
      'ช่วยเขียน Playwright E2E Test Suite สำหรับทดสอบ User Flow',
      'ตรวจสอบช่องโหว่ความปลอดภัย OWASP Top 10 ในโค้ด',
      'ออกแบบ Test Scenarios ทดสอบ Edge Cases และ Network Drops',
    ],
  },
];

export function AgentLiveChatModal({ isOpen, onClose, initialAgentId, onShowToast, onSaveToVault }) {
  const [selectedAgentId, setSelectedAgentId] = useState(initialAgentId || 'product_architect');
  const [squadFilter, setSquadFilter] = useState('ALL'); // 'ALL' | 'executive' | 'coding'
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const activeAgent = ALL_AGENT_PERSONAS.find((a) => a.id === selectedAgentId) || ALL_AGENT_PERSONAS[0];

  // Chat history per agent
  const [chatHistories, setChatHistories] = useState(() => {
    const initial = {};
    ALL_AGENT_PERSONAS.forEach((ag) => {
      initial[ag.id] = [
        {
          sender: 'agent',
          text: ag.welcomeMessage,
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        },
      ];
    });
    return initial;
  });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (initialAgentId) {
      setSelectedAgentId(initialAgentId);
    }
  }, [initialAgentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistories, selectedAgentId, isTyping]);

  const filteredPersonas = ALL_AGENT_PERSONAS.filter((p) => {
    if (squadFilter === 'ALL') return true;
    return p.squad === squadFilter;
  });

  const currentMessages = chatHistories[selectedAgentId] || [];

  const handleSendMessage = (textToSend) => {
    const text = (typeof textToSend === 'string' ? textToSend : inputMessage).trim();
    if (!text) return;

    playClickSound();
    const userMsg = {
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistories((prev) => ({
      ...prev,
      [selectedAgentId]: [...(prev[selectedAgentId] || []), userMsg],
    }));

    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      playSuccessSound();

      let reply = '';
      if (selectedAgentId === 'tech_lead_architect') {
        reply = `### บทวิเคราะห์สถาปัตยกรรม & แผนกระจายงาน (Tech Lead Delegation)\n\nเกี่ยวกับ: **"${text}"** ผมวางโครงสร้างระบบและแจกจ่ายงานให้ทีมวิศวกรดังนี้ครับ:\n\n1. **System Architecture Overview:**\n   - ใช้ Client-Serverless Architecture โดยแยก Frontend SPA ออกจาก API Endpoints\n   - Database ใช้ PostgreSQL เก็บ Entity หลัก พร้อม UUID v4 Primary Keys\n\n2. **Task Delegation Breakdown (4 Tickets):**\n   - **Frontend:** รับผิดชอบหน้า UI Component, State Management และ Error Boundary\n   - **Backend:** สร้าง Netlify Serverless API Route พร้อมตรวจสอบข้อมูลผ่าน Zod Schema\n   - **DevOps:** ผูก GitHub Actions ตรวจสอบ Linter และ Build ก่อน Deploy\n   - **QA & Security:** เขียน Playwright E2E Test ครอบคลุมทั้งกรณีสำเร็จและล้มเหลว`;
      } else if (selectedAgentId === 'frontend_engineer') {
        reply = `### ข้อเสนอโค้ดและส่วนต่อประสาน UI (Frontend Component)\n\nสำหรับโจทย์: **"${text}"** นี่คือแนวทางการเขียนโค้ดตามมาตรฐาน Anti-AI Slop:\n\n\`\`\`jsx\nimport { useState } from 'react';\n\nexport function FeatureComponent({ onSubmit }) {\n  const [loading, setLoading] = useState(false);\n  // ใช้ Slate-900 โทนสี neutral ห้ามใช้ gradient ม่วงฟ้าสำเร็จรูป\n  return (\n    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">\n      <h3 className="text-base font-bold text-white mb-2">หน้าจอใช้งานจริง</h3>\n      <p className="text-xs text-slate-400 mb-4">รองรับ Responsive 375px - 1280px</p>\n      <button\n        disabled={loading}\n        className="rounded-xl bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition-all"\n      >\n        {loading ? 'กำลังประมวลผล...' : 'ยืนยันการทำงาน'}\n      </button>\n    </div>\n  );\n}\n\`\`\``;
      } else if (selectedAgentId === 'backend_engineer') {
        reply = `### โค้ดระบบ API & Database Logic (Backend Serverless)\n\nสำหรับ: **"${text}"** นี่คือโค้ด Serverless Function พร้อมระบบ Validation รัดกุม:\n\n\`\`\`javascript\nimport { z } from 'zod';\n\nconst InputSchema = z.object({\n  title: z.string().min(1, 'ต้องระบุชื่อรายการ'),\n  amount: z.number().positive(),\n});\n\nexport async function handler(event) {\n  if (event.httpMethod !== 'POST') {\n    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };\n  }\n  try {\n    const payload = InputSchema.parse(JSON.parse(event.body || '{}'));\n    // ประมวลผลและบันทึกลง Database\n    return {\n      statusCode: 200,\n      body: JSON.stringify({ success: true, data: payload }),\n    };\n  } catch (err) {\n    return { statusCode: 400, body: JSON.stringify({ error: err.message }) };\n  }\n}\n\`\`\``;
      } else if (selectedAgentId === 'devops_infra_engineer') {
        reply = `### โค้ด CI/CD Pipeline & Cloud Deployment (DevOps Automation)\n\nสำหรับ: **"${text}"** นี่คือไฟล์ GitHub Actions Workflow ที่จะช่วยเป็น Gatekeeper:\n\n\`\`\`yaml\nname: Quality CI Pipeline\non: [push, pull_request]\njobs:\n  audit-and-deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: 20 }\n      - run: npm ci\n      - run: npm run lint\n      - run: npm run build\n\`\`\``;
      } else if (selectedAgentId === 'qa_security_engineer') {
        reply = `### ชุดทดสอบอัตโนมัติ & ตรวจสอบความปลอดภัย (QA & OWASP Audit)\n\nสำหรับ: **"${text}"** นี่คือ Playwright E2E Test Suite สำหรับดักจับบั๊ก:\n\n\`\`\`javascript\nimport { test, expect } from '@playwright/test';\n\ntest('E2E Flow: ตรวจสอบความสมบูรณ์ของฟังก์ชันและระบบ Error Handling', async ({ page }) => {\n  await page.goto('/');\n  await expect(page.locator('#root')).toBeVisible();\n  // ตรวจสอบว่าไม่มี Console Error หลุดรอด\n  page.on('console', msg => {\n    if (msg.type() === 'error') throw new Error('Console error leak: ' + msg.text());\n  });\n});\n\`\`\``;
      } else if (selectedAgentId === 'product_architect') {
        reply = `### แผนสเปกโครงสร้างผลิตภัณฑ์ (Product Architecture Spec)\n\nจากคำขอของคุณ: **"${text}"** ผมได้สังเคราะห์ข้อกำหนดระบบออกมาดังนี้:\n\n1. **Core Architecture Blueprint:**\n   - ใช้ระบบ Modularity แยก API Gateway, Authentication และ State Management\n   - เน้น Time-to-First-Action น้อยกว่า 60 วินาทีหลังเข้าใช้งาน\n\n2. **MoSCoW Prioritization:**\n   - **Must Have:** Workflow Builder, Input Sanitizer, Single-Click Run\n   - **Should Have:** Preset Library, Real-time Validation, Team Sync`;
      } else if (selectedAgentId === 'doc_operations_manager') {
        reply = `### แนวทางเอกสารข้อกำหนด & นโยบายความปลอดภัย (Legal & Operations Protocol)\n\nเกี่ยวกับ: **"${text}"** ขอแนะนำข้อกำหนดที่ต้องระบุให้ชัดเจน:\n\n1. **PDPA Data Classification:**\n   - จัดหมวดหมู่ข้อมูลทั่วไป และข้อมูลธุรกรรมให้แยกจากกัน\n2. **SLA & Uptime Policy:**\n   - ระบุขอบเขตการรับประกันความพร้อมใช้งาน (99.5% Uptime SLA)`;
      } else if (selectedAgentId === 'brand_growth_hacker') {
        reply = `### แผนกลยุทธ์สร้างการรับรู้แบรนด์ (Growth & Content Strategy)\n\nสำหรับหัวข้อ: **"${text}"** นี่คือกลยุทธ์ 3 เสาหลัก:\n\n1. **High-Impact UVP:** ดึงคุณค่าที่แท้จริงออกมาใน 1 ประโยค\n2. **Lead Magnet Strategy:** ทำไฟล์ Checklist 1 หน้าแจกฟรี\n3. **30-Day Content Pillars:** เน้นแก้ปัญหาลูกค้าในสัปดาห์แรก`;
      } else if (selectedAgentId === 'sales_conversion_copywriter') {
        reply = `### โครงสร้างคำขายหน้า Sale Page (Direct-Response Blueprint)\n\nสำหรับ: **"${text}"** ผมร่างโครงสร้างปิดการขายให้ดังนี้ครับ:\n\n1. **Headline หยุดนิ้ว:** เน้นผลลัพธ์ที่ลูกค้าต้องการทันที\n2. **ตารางราคา 3 ระดับ:** Starter / Pro (แนะนำ) / Lifetime\n3. **Zero-Risk Guarantee:** รับประกันคืนเงิน 100% ใน 14 วัน`;
      } else {
        reply = `### แผน Onboarding & การดูแลลูกค้า (Customer Retention Playbook)\n\nสำหรับโจทย์: **"${text}"** คำแนะนำเพื่อสร้างความประทับใจ:\n\n1. **Fast Aha! Moment:** ให้ผู้ใช้ได้ผลลัพธ์แรกภายใน 3 นาที\n2. **ซีรีส์อีเมลต้อนรับ 5 วัน:** แนะนำฟังก์ชันทีละสเต็ป\n3. **Referral Reward:** แนะนำเพื่อนรับสิทธิ์ใช้งานเพิ่ม`;
      }

      const agentMsg = {
        sender: 'agent',
        text: reply,
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      };

      setChatHistories((prev) => ({
        ...prev,
        [selectedAgentId]: [...(prev[selectedAgentId] || []), agentMsg],
      }));
    }, 900);
  };

  const handleCopyMessage = (idx, text) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    playClickSound();
    if (onShowToast) onShowToast('success', 'คัดลอกข้อความแล้ว', 'เนื้อหาถูกบันทึกลงคลิปบอร์ดเรียบร้อย');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSaveMessageToVault = (text) => {
    playSuccessSound();
    if (onSaveToVault) {
      const item = [
        {
          id: `vault-chat-${Date.now()}`,
          agentId: activeAgent.id,
          agentName: activeAgent.name,
          title: `คำปรึกษาจาก ${activeAgent.thaiTitle}`,
          thaiTitle: `บทสรุปกลยุทธ์: ${activeAgent.thaiTitle}`,
          category: activeAgent.squad === 'coding' ? 'Engineering Code' : 'Executive Docs',
          version: '1.0.0',
          status: 'From Live Chat',
          createdAt: new Date().toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          tags: ['LiveChat', activeAgent.squad],
          summary: text.slice(0, 160) + '...',
          content: text,
        },
      ];
      onSaveToVault(item);
    }
    if (onShowToast) onShowToast('success', 'บันทึกลง Knowledge Vault แล้ว', 'ข้อความนี้ถูกจัดเก็บเข้าคลังเอกสารเรียบร้อย');
  };

  const handleClearChat = () => {
    playClickSound();
    setChatHistories((prev) => ({
      ...prev,
      [selectedAgentId]: [
        {
          sender: 'agent',
          text: activeAgent.welcomeMessage,
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    }));
    if (onShowToast) onShowToast('info', 'ล้างประวัติแชทแล้ว', 'เริ่มการสนทนาใหม่กับ Agent นี้');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Live Chat with AI Squads (10 Agents)" maxWidth="max-w-4xl">
      <div className="flex flex-col h-[72vh]">
        {/* Squad Category Filter Pills */}
        <div className="flex items-center gap-1.5 pb-2 text-xs shrink-0">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">ทีม:</span>
          <button
            onClick={() => { playClickSound(); setSquadFilter('ALL'); }}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
              squadFilter === 'ALL'
                ? 'bg-slate-700 text-white border border-slate-600'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            ทั้งหมด (10 Agents)
          </button>
          <button
            onClick={() => { playClickSound(); setSquadFilter('executive'); }}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
              squadFilter === 'executive'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            🏢 ทีมบริหารธุรกิจ (5 ตัว)
          </button>
          <button
            onClick={() => { playClickSound(); setSquadFilter('coding'); }}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
              squadFilter === 'coding'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            💻 ทีมเขียนโค้ด (5 ตัว)
          </button>
        </div>

        {/* Agent Switcher Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 border-b border-slate-800 text-xs shrink-0">
          {filteredPersonas.map((agent) => {
            const isSelected = agent.id === selectedAgentId;
            const IconComp = agent.icon;
            return (
              <button
                key={agent.id}
                onClick={() => {
                  playClickSound();
                  setSelectedAgentId(agent.id);
                }}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 font-semibold transition-all whitespace-nowrap border ${
                  isSelected
                    ? `${agent.color} shadow-sm ring-1 ring-cyan-500/30`
                    : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <IconComp className="h-4 w-4 shrink-0" />
                <span>{agent.thaiTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Active Agent Banner */}
        <div className="flex items-center justify-between py-2.5 px-3 bg-slate-950/60 border-b border-slate-800/80 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white">{activeAgent.name}</span>
            <span className="text-slate-400">· พร้อมให้คำปรึกษาและลงมือทำ</span>
          </div>
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            <span>ล้างแชท</span>
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentMessages.map((msg, idx) => {
            const isUser = msg.sender === 'user';
            return (
              <div key={idx} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-2xl p-4 text-xs leading-relaxed shadow-sm ${
                      isUser
                        ? 'bg-cyan-600 text-white rounded-tr-none'
                        : 'border border-slate-800 bg-slate-900/90 text-slate-200 rounded-tl-none font-sans whitespace-pre-wrap'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Message Meta & Action Bar */}
                  <div className={`flex items-center gap-2 text-[10px] text-slate-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <>
                        <button
                          onClick={() => handleCopyMessage(idx, msg.text)}
                          className="hover:text-cyan-400 flex items-center gap-0.5 transition-colors"
                          title="คัดลอกข้อความ"
                        >
                          {copiedIndex === idx ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          <span>{copiedIndex === idx ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                        </button>
                        <button
                          onClick={() => handleSaveMessageToVault(msg.text)}
                          className="hover:text-emerald-400 flex items-center gap-0.5 transition-colors"
                          title="บันทึกลง Knowledge Vault"
                        >
                          <BookmarkPlus className="h-3 w-3" />
                          <span>บันทึกลง Vault</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-300 border border-slate-700 mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Sparkles className="h-4 w-4 animate-spin" />
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2 font-mono text-[11px] flex items-center gap-1.5 text-cyan-300">
                <span>{activeAgent.name} กำลังวิเคราะห์และเรียบเรียง...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Quick Bar */}
        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
          <span className="text-[10px] text-slate-500 whitespace-nowrap">แนะนำ:</span>
          {activeAgent.suggestedPrompts.map((promptText, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleSendMessage(promptText)}
              className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-300 hover:border-cyan-500/50 hover:bg-slate-800 hover:text-white transition-all whitespace-nowrap"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-900 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputMessage);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`พิมพ์สั่งการหรือขอคำแนะนำจาก ${activeAgent.thaiTitle}...`}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="flex items-center gap-1.5 rounded-xl border border-cyan-500/50 bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-cyan-500 transition-all shadow-md shadow-cyan-950/50 disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
              <span>ส่ง</span>
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
}

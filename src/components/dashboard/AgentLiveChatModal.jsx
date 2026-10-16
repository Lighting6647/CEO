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
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { playClickSound, playSuccessSound } from '../../utils/soundEffects';

const AGENT_PERSONAS = [
  {
    id: 'product_architect',
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
];

export function AgentLiveChatModal({ isOpen, onClose, initialAgentId, onShowToast, onSaveToVault }) {
  const [selectedAgentId, setSelectedAgentId] = useState(initialAgentId || 'product_architect');
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const activeAgent = AGENT_PERSONAS.find((a) => a.id === selectedAgentId) || AGENT_PERSONAS[0];

  // Chat history per agent
  const [chatHistories, setChatHistories] = useState(() => {
    const initial = {};
    AGENT_PERSONAS.forEach((ag) => {
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

    // Simulate Agent intelligent response
    setTimeout(() => {
      setIsTyping(false);
      playSuccessSound();

      let reply = '';
      if (selectedAgentId === 'product_architect') {
        reply = `### แผนสเปกโครงสร้างผลิตภัณฑ์ (Product Architecture Spec)\n\nจากคำขอของคุณ: **"${text}"** ผมได้สังเคราะห์ข้อกำหนดระบบออกมาดังนี้:\n\n1. **Core Architecture Blueprint:**\n   - ใช้ระบบ Modularity แยก API Gateway, Authentication และ State Management\n   - เน้น Time-to-First-Action น้อยกว่า 60 วินาทีหลังเข้าใช้งาน\n\n2. **MoSCoW Prioritization:**\n   - **Must Have:** Workflow Builder, Input Sanitizer, Single-Click Run\n   - **Should Have:** Preset Library, Real-time Validation, Team Sync\n   - **Could Have:** Webhook Integration, Custom CSS Branding\n\n3. **UX Journey Recommendation:**\n   - ลดขั้นตอนการกรอกข้อมูลเหลือ 1 หน้าฟอร์มแบบ Progressive Disclosure`;
      } else if (selectedAgentId === 'doc_operations_manager') {
        reply = `### แนวทางเอกสารข้อกำหนด & นโยบายความปลอดภัย (Legal & Operations Protocol)\n\nเกี่ยวกับ: **"${text}"** ขอแนะนำข้อกำหนดที่ต้องระบุให้ชัดเจน:\n\n1. **PDPA Data Classification:**\n   - จัดหมวดหมู่ข้อมูลทั่วไป (ชื่อ, อีเมล) และข้อมูลธุรกรรม (Transaction ID) ให้แยกจากกัน\n   - บันทึก Data Audit Log ทุกครั้งที่มีการประมวลผล\n\n2. **ข้อกำหนดการจำกัดความรับผิด (Limitation of Liability):**\n   - ระบุขอบเขตการรับประกันความพร้อมใช้งาน (99.5% Uptime SLA)\n   - กำหนดขั้นตอนการแจ้งปัญหา (Incident Escalation Matrix) ภายใน 4 ชั่วโมง`;
      } else if (selectedAgentId === 'brand_growth_hacker') {
        reply = `### แผนกลยุทธ์สร้างการรับรู้แบรนด์ (Growth & Content Strategy)\n\nสำหรับหัวข้อ: **"${text}"** นี่คือกลยุทธ์ 3 เสาหลักที่ใช้เปิดตัวได้ทันที:\n\n1. **High-Impact UVP:**\n   - "ย่นระยะเวลาทำงานซ้ำซ้อนจาก 3 วัน ให้เสร็จสมบูรณ์ใน 15 นาที ด้วยระบบผู้บริหาร AI ส่วนตัว"\n\n2. **Lead Magnet Strategy:**\n   - ทำไฟล์ Checklist 1 หน้าแจกฟรี ดึงดูดผู้สนใจกรอกอีเมลก่อนเปิดตัวสินค้า\n\n3. **Content Angle:**\n   - เน้นทำคลิปแสดง Pain Point ก่อนใช้ และผลลัพธ์ว้าวหลังใช้งาน (Before / After Transformation)`;
      } else if (selectedAgentId === 'sales_conversion_copywriter') {
        reply = `### โครงสร้างคำขายหน้า Sale Page (Direct-Response Blueprint)\n\nสำหรับ: **"${text}"** ผมร่างโครงสร้างปิดการขายให้ดังนี้ครับ:\n\n1. **Headline หยุดนิ้ว:**\n   - *"หยุดทิ้งโอกาสและเวลาไปกับงานหลังบ้าน! พลิกไอเดียให้กลายเป็นระบบสร้างรายได้ที่ทำงานแทนคุณ 24 ชม."*\n\n2. **ตารางราคา 3 ระดับ (Value Stacking):**\n   - **Starter Tier (฿990):** เหมาะกับผู้เริ่มต้น ฟังก์ชันพื้นฐานครบถ้วน\n   - **Pro Tier (฿2,490 - แนะนำ):** คุ้มค่าที่สุด ปลดล็อกทุกฟังก์ชัน + โบนัสพิเศษ\n   - **Lifetime Access (฿5,900):** ซื้อขาดตลอดชีพ จำนวนจำกัด 50 ท่านแรก\n\n3. **Zero-Risk Guarantee:**\n   - รับประกันคืนเงิน 100% ใน 14 วันหากไม่เห็นผลลัพธ์ชัดเจน`;
      } else {
        reply = `### แผน Onboarding & การดูแลลูกค้า (Customer Retention Playbook)\n\nสำหรับโจทย์: **"${text}"** คำแนะนำเพื่อสร้างความประทับใจทันที:\n\n1. **Fast Aha! Moment (ภายใน 3 นาที):**\n   - ทันทีที่ชำระเงิน นำผู้ใช้เข้าสู่หน้า Dashboard พร้อมพรีโหลดเทมเพลตตัวอย่างให้กดทดสอบได้ทันที 1 คลิก\n\n2. **ซีรีส์อีเมลต้อนรับ 5 วัน:**\n   - Day 1: เคล็ดลับทางลัดสร้างผลงานแรก\n   - Day 2: แนะนำ 3 ฟังก์ชันลับที่ผู้ใช้ 90% ชอบมากที่สุด\n   - Day 4: Case Study ความสำเร็จของสมาชิกในคอมมูนิตี้\n\n3. **Referral Reward:**\n   - ให้ส่วนลดหรือเพิ่มโควตา Pro ฟรีเมื่อชวนเพื่อนร่วมงานมาใช้งาน`;
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
          category: activeAgent.name.split('&')[0].trim(),
          version: '1.0.0',
          status: 'From Live Chat',
          createdAt: new Date().toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          tags: ['LiveChat', activeAgent.accentColor],
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
    <Modal isOpen={isOpen} onClose={onClose} title="Live Chat with AI Executive Squad" maxWidth="max-w-4xl">
      <div className="flex flex-col h-[70vh]">
        {/* Agent Switcher Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 border-b border-slate-800 text-xs shrink-0">
          {AGENT_PERSONAS.map((agent) => {
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
            <span className="text-slate-400">· พร้อมให้คำปรึกษาและลงมือเขียน</span>
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

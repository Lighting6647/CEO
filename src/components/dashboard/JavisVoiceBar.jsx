import { useState } from 'react';
import { Mic, MicOff, Volume2, CheckCircle2, BellRing, ClipboardList, ChevronDown, ChevronUp } from 'lucide-react';
import { playClickSound, playSuccessSound } from '../../utils/soundEffects';

const DEPARTMENT_TODO_ITEMS = [
  {
    id: 'todo-mkt',
    dept: '1. แผนก AI การตลาด',
    task: 'ยิงแคมเปญดึงลูกค้าภายนอกกลุ่มเจ้าของยิม (ขาย Fitness) และผู้จัดอีเวนต์ (ขาย บัตรคอน + Pass App)',
    status: 'กำลังดำเนินการ (ได้ 14 Leads ใหม่วันนี้)',
  },
  {
    id: 'todo-sales',
    dept: '2. แผนก AI ฝ่ายขาย',
    task: 'สาธิตฟีเจอร์ (Demo) และรอ Founder อนุมัติส่วนลด 15% เพื่อปิดดีลขาย Fitness + Pass App ให้ FitLab Gym 3 สาขา',
    status: 'รอ Founder อนุมัติราคาพิเศษ',
  },
  {
    id: 'todo-eng',
    dept: '3. แผนก AI วิศวกรรมส่งมอบ',
    task: 'จัดเตรียม Cloud Tenant & License Key ของระบบ Inventory POS + บัญชี เพื่อส่งมอบให้ลูกค้าภายนอกภายใน 15 นาทีหลังชำระเงิน',
    status: 'พร้อมส่งมอบ 100%',
  },
  {
    id: 'todo-cs',
    dept: '4. แผนก AI บริการหลังการขาย',
    task: 'ดูแลการใช้งานลูกค้าเดิม และแนะนำขายพ่วง (Cross-sell) ระบบ Tracking และ iOS Asset ให้ลูกค้ากลุ่มองค์กร',
    status: 'กำลังติดตามผล 8 บริษัท',
  },
  {
    id: 'todo-fin',
    dept: '5. แผนก AI การเงินบริษัท',
    task: 'ออกใบเสนอราคาขายสิทธิ์ซอฟต์แวร์ในนามบริษัท และตรวจสอบยอดโอนค่าเช่าใช้ระบบจากลูกค้าภายนอก',
    status: 'รอ Founder กดอนุมัติรายการค้าง',
  },
  {
    id: 'todo-exec',
    dept: '6. แผนก AI บริหารกลยุทธ์ (Javis)',
    task: 'ใช้ระบบ Javis รายงานสิ่งที่ต้องทำของทุกแผนก และรวบรวมคิวรออนุมัติแจ้งต่อ Founder โดยตรง',
    status: 'รายงานสดเรียบร้อย',
  },
];

export function JavisVoiceBar({
  brandName,
  pendingApprovalsCount,
  firstPendingItem,
  onApproveFirstAndQuote,
  onTriggerLineWebhook,
  onShowToast,
}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTodoPanel, setShowTodoPanel] = useState(true);
  const [javisResponse, setJavisResponse] = useState(
    'สวัสดีครับท่านประธาน ระบบ Javis (ได้รับอนุญาตให้ใช้เป็นเลขาส่วนกลาง) พร้อมรายงานสิ่งที่ต้องทำของท่านและทั้ง 6 แผนก AI แล้วครับ'
  );

  const speakThai = (text) => {
    setJavisResponse(text);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'th-TH';
      utterance.rate = 1.05;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceActionReport = () => {
    playClickSound();
    const reportText =
      pendingApprovalsCount > 0
        ? `รายงานสิ่งที่ต้องทำของ ${brandName} วันนี้ครับ หนึ่ง สิ่งที่รอท่านประธานตัดสินใจ มี ${pendingApprovalsCount} รายการ เรื่องด่วนที่สุดคือ ${
            firstPendingItem ? firstPendingItem.title : 'ไม่มีรายการค้าง'
          } สอง สิ่งที่ทั้ง 6 แผนก AI กำลังทำ คือ แผนกการตลาดและแผนกขายกำลังนำ Product ทั้ง 8 ตัวออกขายให้ลูกค้าภายนอก แผนกวิศวกรรมเตรียมส่งมอบ License และแผนกการเงินรอออกใบเสนอราคาทันทีที่ท่านกดอนุมัติครับ`
        : `รายงานสิ่งที่ต้องทำของ ${brandName} วันนี้ครับ ท่านประธานอนุมัติงานค้างครบทั้งหมดแล้ว ขณะนี้ทั้ง 6 แผนก AI กำลังเดินหน้าขายและส่งมอบ Product ทั้ง 8 ตัวให้ลูกค้าภายนอกตามแผนงานปกติครับ`;

    speakThai(reportText);
    if (onShowToast) {
      onShowToast('info', 'Javis รายงานสิ่งที่ต้องทำ (Action Items)', 'สรุปงานที่รอท่านตัดสินใจและงานที่ทั้ง 6 แผนก AI กำลังดำเนินการ');
    }
  };

  const handleVoiceApproveFirst = () => {
    playSuccessSound();
    if (!firstPendingItem) {
      speakThai('ขณะนี้ไม่มีรายการค้างในคิวรออนุมัติแล้วครับท่านประธาน');
      return;
    }
    const text = `รับทราบครับท่านประธาน Javis อนุมัติรายการ ${firstPendingItem.id} พร้อมแจ้งแผนกการเงินและแผนกขายให้ออกใบเสนอราคาและคิวอาร์โค้ดพร้อมเพย์ส่งให้ลูกค้าภายนอกทันทีครับ`;
    speakThai(text);
    onApproveFirstAndQuote(firstPendingItem);
  };

  const handleToggleMic = () => {
    playClickSound();
    const SpeechRecognition =
      typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) {
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        handleVoiceActionReport();
      }, 900);
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'th-TH';
    recognition.interimResults = false;
    setIsListening(true);

    recognition.onresult = (event) => {
      setIsListening(false);
      const transcript = event.results[0][0].transcript;
      if (transcript.includes('อนุมัติ')) {
        handleVoiceApproveFirst();
      } else if (transcript.includes('แจ้งเตือน') || transcript.includes('ไลน์')) {
        onTriggerLineWebhook();
        speakThai('ส่งแจ้งเตือนสิ่งที่ต้องทำพร้อมลายเซ็นดิจิทัลเข้า LINE และ Telegram ของท่านเรียบร้อยครับ');
      } else {
        handleVoiceActionReport();
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      handleVoiceActionReport();
    };

    recognition.start();
  };

  return (
    <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 p-4 shadow-lg space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={handleToggleMic}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-all ${
              isListening
                ? 'animate-pulse border-rose-400 bg-rose-500/20 text-rose-300'
                : isSpeaking
                ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                : 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25'
            }`}
            title="กดเพื่อสั่งให้ Javis รายงานสิ่งที่ต้องทำด้วยเสียงภาษาไทย"
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                🎙️ Javis (D:\Light\Javis) — ได้รับอนุญาตให้ใช้รายงานสิ่งที่ต้องทำ
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                {isListening ? 'กำลังฟังคำสั่งเสียง...' : isSpeaking ? 'กำลังพูดรายงานสิ่งที่ต้องทำ...' : 'Product เดียวที่ได้รับอนุญาตใช้ภายในเพื่อรายงาน Founder'}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-200 leading-relaxed">{javisResponse}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleVoiceActionReport}
            className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-3 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-500/25 transition-all"
          >
            <Volume2 className="h-3.5 w-3.5 text-cyan-300" />
            “จาร์วิส รายงานสิ่งที่ต้องทำวันนี้”
          </button>

          <button
            type="button"
            onClick={handleVoiceApproveFirst}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/20 px-3 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-500/30 transition-all"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
            “อนุมัติคิวแรกทันที”
          </button>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              onTriggerLineWebhook();
              speakThai('ส่งรายงานสิ่งที่ต้องทำพร้อมลายเซ็นดิจิทัลเข้า LINE และ Telegram ของท่านเรียบร้อยครับ');
            }}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 px-3 py-2 text-xs font-bold text-amber-200 hover:bg-amber-500/25 transition-all"
          >
            <BellRing className="h-3.5 w-3.5 text-amber-300" />
            ส่งเข้า LINE / Telegram
          </button>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              setShowTodoPanel((prev) => !prev);
            }}
            className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800/90 px-2.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-all"
          >
            <ClipboardList className="h-3.5 w-3.5 text-emerald-400" />
            <span>สิ่งที่ต้องทำ (6 แผนก)</span>
            {showTodoPanel ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {showTodoPanel && (
        <div className="rounded-xl border border-slate-800 bg-slate-950/85 p-3.5">
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-emerald-300">
              📋 รายงานสิ่งที่ต้องทำวันนี้โดย Javis (Action Items ของทั้ง 6 แผนก AI + สิ่งที่รอท่านอนุมัติ {pendingApprovalsCount} รายการ)
            </span>
            <span className="text-[11px] text-slate-400">
              อนุญาตพิเศษ: ใช้ Product <code className="text-cyan-300">D:\Light\Javis</code> เป็นผู้ช่วยรายงานสิ่งที่ต้องทำ
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {DEPARTMENT_TODO_ITEMS.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-800/90 bg-slate-900/80 p-2.5 text-xs">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <strong className="text-cyan-300">{item.dept}</strong>
                  <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                    {item.status}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">{item.task}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

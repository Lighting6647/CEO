import { useState } from 'react';
import {
  Smartphone,
  Tablet,
  Monitor,
  Check,
  Sparkles,
  Loader2,
  Copy,
  Code2,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { playClickSound, playSuccessSound } from '../../utils/soundEffects';

const SAMPLE_PLANS = [
  {
    id: 'starter',
    name: 'Starter Tier',
    thaiName: 'ผู้เริ่มต้นใช้งาน',
    monthlyPrice: 790,
    annualPrice: 630,
    features: ['ใช้งาน AI 2 ตัวหลัก', 'Export เอกสารไม่จำกัด', '1 พื้นที่ทำงาน (Workspace)', 'Community Support'],
    isPopular: false,
    accent: 'border-slate-800 hover:border-slate-700',
  },
  {
    id: 'pro',
    name: 'Professional Tier',
    thaiName: 'มืออาชีพ & ธุรกิจเติบโต',
    monthlyPrice: 1890,
    annualPrice: 1510,
    features: [
      'ใช้งานครบ 10 AI Squads เต็มระบบ',
      'Orchestrator รัน Pipeline อัตโนมัติ',
      'Knowledge Vault แบบเข้ารหัส',
      'Priority High-Speed Server',
      'Private Mastermind Group',
    ],
    isPopular: true,
    accent: 'border-cyan-500/50 bg-cyan-950/20 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/40',
  },
  {
    id: 'enterprise',
    name: 'Agency & Enterprise',
    thaiName: 'เอเจนซี่ & องค์กร',
    monthlyPrice: 4900,
    annualPrice: 3920,
    features: [
      'ไม่จำกัดจำนวนโปรเจกต์',
      'สิทธิ์การเข้าถึงลูกทีม 5 ท่าน (RBAC)',
      'Custom Webhook & API Key Access',
      'Dedicated Account Manager 24/7',
      'SLA Uptime Guarantee 99.9%',
    ],
    isPopular: false,
    accent: 'border-slate-800 hover:border-slate-700',
  },
];

export function ComponentSandboxModal({ isOpen, onClose, onShowToast }) {
  const [viewport, setViewport] = useState('desktop'); // 'mobile' | 'tablet' | 'desktop'
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'code'
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'
  const [selectedPlanId, setSelectedPlanId] = useState('pro');
  const [subscribingId, setSubscribingId] = useState(null);

  const handleSelectPlan = (plan) => {
    setSelectedPlanId(plan.id);
    setSubscribingId(plan.id);
    playClickSound();

    setTimeout(() => {
      setSubscribingId(null);
      playSuccessSound();
      if (onShowToast) {
        onShowToast('success', 'ทดสอบการสมัครแพ็กเกจสำเร็จ', `เลือกแพ็กเกจ ${plan.name} (${billingCycle === 'annual' ? 'รายปี ประหยัด 20%' : 'รายเดือน'}) เรียบร้อย`);
      }
    }, 800);
  };

  const handleCopyComponentCode = () => {
    playClickSound();
    const code = `// SubscriptionPricingMatrix.jsx (Production React 19 Component)
import { useState } from 'react';
import { Check, Sparkles, Loader2 } from 'lucide-react';

export function SubscriptionPricingMatrix({ onSelectPlan }) {
  const [billingCycle, setBillingCycle] = useState('monthly');
  // ... fully responsive anti-ai slop code
}`;
    navigator.clipboard.writeText(code);
    if (onShowToast) onShowToast('success', 'คัดลอกโค้ดสำเร็จ', 'นำโค้ด React Component ไปวางในโปรเจกต์ได้ทันที');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Live Component Sandbox Preview" maxWidth="max-w-5xl">
      <div className="space-y-4">
        {/* Sandbox Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
          {/* Viewport Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">หน้าจอ:</span>
            <button
              onClick={() => { playClickSound(); setViewport('mobile'); }}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                viewport === 'mobile'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'text-slate-400 hover:bg-slate-900'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Mobile (375px)</span>
            </button>
            <button
              onClick={() => { playClickSound(); setViewport('tablet'); }}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                viewport === 'tablet'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'text-slate-400 hover:bg-slate-900'
              }`}
            >
              <Tablet className="h-3.5 w-3.5" />
              <span>Tablet (768px)</span>
            </button>
            <button
              onClick={() => { playClickSound(); setViewport('desktop'); }}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                viewport === 'desktop'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'text-slate-400 hover:bg-slate-900'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>Desktop (100%)</span>
            </button>
          </div>

          {/* Mode Switcher & Copy */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl bg-slate-900 p-0.5 border border-slate-800 text-xs">
              <button
                onClick={() => { playClickSound(); setActiveTab('preview'); }}
                className={`flex items-center gap-1 rounded-lg px-3 py-1 font-semibold transition-all ${
                  activeTab === 'preview' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Interactive Preview</span>
              </button>
              <button
                onClick={() => { playClickSound(); setActiveTab('code'); }}
                className={`flex items-center gap-1 rounded-lg px-3 py-1 font-semibold transition-all ${
                  activeTab === 'code' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>Source Code</span>
              </button>
            </div>

            <button
              onClick={handleCopyComponentCode}
              className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-cyan-500 hover:text-white transition-all"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>คัดลอกโค้ด</span>
            </button>
          </div>
        </div>

        {/* Sandbox Canvas Container */}
        <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-4 flex justify-center items-start min-h-[520px] overflow-x-auto">
          {activeTab === 'preview' ? (
            <div
              className={`transition-all duration-300 rounded-2xl border border-slate-800/80 bg-slate-950 p-6 shadow-2xl ${
                viewport === 'mobile'
                  ? 'w-[375px]'
                  : viewport === 'tablet'
                  ? 'w-[768px]'
                  : 'w-full max-w-4xl'
              }`}
            >
              {/* Component Header Inside Sandbox */}
              <div className="text-center space-y-3 mb-8">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-[11px] font-semibold text-cyan-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                  Anti-AI Slop Design System
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  เลือกแพ็กเกจที่เหมาะกับขนาดธุรกิจของคุณ
                </h3>
                <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
                  เริ่มต้นทดลองใช้งานได้ทันที 14 วัน ไม่มีข้อผูกมัด ยกเลิกได้ตลอดเวลา
                </p>

                {/* Billing Cycle Toggle */}
                <div className="inline-flex items-center rounded-xl border border-slate-800 bg-slate-900 p-1 mt-2 text-xs">
                  <button
                    onClick={() => { playClickSound(); setBillingCycle('monthly'); }}
                    className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
                      billingCycle === 'monthly' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ชำระรายเดือน
                  </button>
                  <button
                    onClick={() => { playClickSound(); setBillingCycle('annual'); }}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                      billingCycle === 'annual' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>ชำระรายปี</span>
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-400 border border-emerald-500/30">
                      ลด 20%
                    </span>
                  </button>
                </div>
              </div>

              {/* Pricing Cards Grid */}
              <div className={`grid gap-4 ${viewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
                {SAMPLE_PLANS.map((plan) => {
                  const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
                  const isSelected = selectedPlanId === plan.id;
                  const isSubmitting = subscribingId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all bg-slate-900/60 ${plan.accent} ${
                        isSelected ? 'ring-2 ring-cyan-500' : ''
                      }`}
                    >
                      {plan.isPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-cyan-500/40 bg-cyan-950 px-3 py-0.5 text-[10px] font-bold text-cyan-300 shadow-md">
                          ★ แนะนำยอดนิยม
                        </div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-bold text-white">{plan.name}</h4>
                          <p className="text-[11px] text-slate-400">{plan.thaiName}</p>
                        </div>

                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-white">฿{price.toLocaleString()}</span>
                          <span className="text-[11px] text-slate-400">/ เดือน</span>
                        </div>

                        <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
                          {plan.features.map((feat, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-2">
                              <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="text-[11px] leading-tight">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-5 pt-3">
                        <button
                          onClick={() => handleSelectPlan(plan)}
                          disabled={isSubmitting}
                          className={`flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                            plan.isPopular
                              ? 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-md shadow-cyan-950/50'
                              : 'border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
                          } disabled:opacity-60`}
                        >
                          {isSubmitting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="h-3.5 w-3.5" />
                          )}
                          <span>{isSubmitting ? 'กำลังเชื่อมต่อ...' : 'เลือกแพ็กเกจนี้'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto whitespace-pre">
{`import { useState } from 'react';
import { Check, Sparkles, Loader2, ShieldCheck } from 'lucide-react';

export function SubscriptionPricingMatrix({ onSelectPlan }) {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlanId, setSelectedPlanId] = useState('pro');

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-950 rounded-2xl border border-slate-800">
      {/* Zero AI Slop: Curated Slate-900 palette, micro-interactions, responsive */}
      <div className="text-center space-y-2 mb-8">
        <h3 className="text-2xl font-extrabold text-white">เลือกแพ็กเกจที่เหมาะกับคุณ</h3>
      </div>
    </div>
  );
}`}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

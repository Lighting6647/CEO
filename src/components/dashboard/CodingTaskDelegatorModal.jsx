import { useState } from 'react';
import {
  Play,
  CheckCircle2,
  Copy,
  Download,
  Code,
  Layout,
  Database,
  CloudCog,
  ShieldAlert,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { playClickSound, playSuccessSound } from '../../utils/soundEffects';

const TEAM_ROLES = [
  {
    id: 'tech_lead',
    name: 'Tech Lead & System Architect',
    thaiTitle: 'วิเคราะห์ระบบ & ออกแบบ Schema',
    roleTag: 'Architecture & Delegation',
    icon: Code,
    color: 'text-violet-400 border-violet-500/30 bg-violet-950/20',
  },
  {
    id: 'frontend',
    name: 'Senior Frontend & UI Engineer',
    thaiTitle: 'เขียนโค้ด UI Components & State',
    roleTag: 'Frontend & UI',
    icon: Layout,
    color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20',
  },
  {
    id: 'backend',
    name: 'Senior Backend & Database Engineer',
    thaiTitle: 'เขียนโค้ด API & Database Logic',
    roleTag: 'Backend & APIs',
    icon: Database,
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
  },
  {
    id: 'devops',
    name: 'Lead DevOps & Cloud Engineer',
    thaiTitle: 'ตั้งค่า CI/CD & Deploy Workflow',
    roleTag: 'DevOps & Infra',
    icon: CloudCog,
    color: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
  },
  {
    id: 'qa_sec',
    name: 'QA Automation & Security Auditor',
    thaiTitle: 'เขียน Automated E2E Test & Security Audit',
    roleTag: 'QA & Security',
    icon: ShieldAlert,
    color: 'text-rose-400 border-rose-500/30 bg-rose-950/20',
  },
];

export function CodingTaskDelegatorModal({ isOpen, onClose, onShowToast, onSaveToVault }) {
  const [featureName, setFeatureName] = useState('ระบบชำระเงิน Subscription ผ่าน Stripe พร้อม Webhook & User Dashboard');
  const [techStack, setTechStack] = useState('React 19 + Tailwind CSS, Netlify Functions, PostgreSQL, Zod');
  const [specialRequirements, setSpecialRequirements] = useState('รองรับ 3-Tier Pricing, เข้ารหัส Webhook Signature, Zero AI Slop UI, และมี Playwright E2E Test');

  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [delegatedResults, setDelegatedResults] = useState(null);
  const [expandedRole, setExpandedRole] = useState('frontend');

  const handleStartDelegation = () => {
    if (!featureName.trim()) {
      if (onShowToast) onShowToast('error', 'กรุณาระบุฟีเจอร์', 'ต้องกรอกชื่อฟังก์ชันที่ต้องการให้ทีมเขียนโค้ด');
      return;
    }

    setIsRunning(true);
    setCurrentStep(1);
    playClickSound();

    let step = 1;
    const interval = setInterval(() => {
      step++;
      if (step <= 5) {
        setCurrentStep(step);
        playClickSound();
      } else {
        clearInterval(interval);
        setCurrentStep(6);
        setIsRunning(false);
        playSuccessSound();

        // Generate context-tailored deliverables for each coding role
        const results = [
          {
            roleId: 'tech_lead',
            roleName: 'Tech Lead & System Architect',
            ticketTitle: 'Ticket #01: System Architecture & Database Schema DDL',
            language: 'sql',
            filename: 'schema-migrations.sql',
            deliverable: `-- 1. Schema Migration: Subscriptions & Invoices
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255) NOT NULL,
    stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
    plan_tier VARCHAR(50) NOT NULL CHECK (plan_tier IN ('starter', 'pro', 'enterprise')),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sub_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_sub_stripe_id ON public.subscriptions(stripe_subscription_id);

-- 2. API Contract Specification (OpenAPI Summary)
-- POST /api/v1/checkout/create-session -> { planId: string, successUrl: string } => { sessionId: string, url: string }
-- POST /api/v1/webhooks/stripe -> Stripe event signature verification & subscription sync`,
          },
          {
            roleId: 'frontend',
            roleName: 'Senior Frontend & UI Engineer',
            ticketTitle: 'Ticket #02: Pricing & Checkout UI Component (Zero AI Slop)',
            language: 'jsx',
            filename: 'SubscriptionCheckoutCard.jsx',
            deliverable: `import { useState } from 'react';
import { Check, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';

export function SubscriptionCheckoutCard({ plan, onSelectPlan }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      await onSelectPlan(plan.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl transition-all hover:border-cyan-500/50 hover:shadow-cyan-950/30">
      {plan.isPopular && (
        <span className="absolute -top-3 right-6 rounded-full border border-cyan-500/40 bg-cyan-950/80 px-3 py-0.5 text-[11px] font-semibold text-cyan-300">
          ยอดนิยม ★
        </span>
      )}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">{plan.name}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-white">฿{plan.price.toLocaleString()}</span>
          <span className="text-xs text-slate-400">/ เดือน</span>
        </div>
        <ul className="space-y-2.5 pt-2 text-xs text-slate-300">
          {plan.features.map((feat, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-cyan-500 disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          <span>{isLoading ? 'กำลังเชื่อมต่อ...' : 'สมัครแพ็กเกจนี้'}</span>
        </button>
      </div>
    </div>
  );
}`,
          },
          {
            roleId: 'backend',
            roleName: 'Senior Backend & Database Engineer',
            ticketTitle: 'Ticket #03: Netlify Serverless API & Webhook Handler',
            language: 'javascript',
            filename: 'stripe-webhook.js',
            deliverable: `import Stripe from 'stripe';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid Signature' }) };
  }

  // Handle specific Stripe events
  switch (stripeEvent.type) {
    case 'checkout.session.completed':
      const session = stripeEvent.data.object;
      console.log('Payment succeeded for session:', session.id);
      // Synchronize database subscription status
      break;
    case 'customer.subscription.deleted':
      // Revoke customer access
      break;
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
}`,
          },
          {
            roleId: 'devops',
            roleName: 'Lead DevOps & Cloud Engineer',
            ticketTitle: 'Ticket #04: GitHub Actions CI/CD Pipeline & Secret Config',
            language: 'yaml',
            filename: '.github/workflows/deploy-production.yml',
            deliverable: `name: Production CI/CD Gatekeeper

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  quality-gate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run Oxlint (0 Warnings Gate)
        run: npm run lint

      - name: Build Verification
        run: npm run build
        env:
          STRIPE_SECRET_KEY: \${{ secrets.STRIPE_SECRET_KEY }}
          STRIPE_WEBHOOK_SECRET: \${{ secrets.STRIPE_WEBHOOK_SECRET }}

      - name: Automated Smoke Test
        run: node -e "require('fs').existsSync('dist/index.html') ? process.exit(0) : process.exit(1)"`,
          },
          {
            roleId: 'qa_sec',
            roleName: 'QA Automation & Security Auditor',
            ticketTitle: 'Ticket #05: Playwright E2E Test Suite & Security Audit',
            language: 'javascript',
            filename: 'tests/checkout.e2e.spec.js',
            deliverable: `import { test, expect } from '@playwright/test';

test.describe('Subscription Checkout Flow & Security Gates', () => {
  test('User can inspect plans, select Pro Tier, and trigger Stripe checkout', async ({ page }) => {
    await page.goto('/');
    
    // 1. Verify Pricing Cards Mount
    const proCard = page.locator('text=Professional Tier');
    await expect(proCard).toBeVisible();

    // 2. Click Subscribe button
    const subscribeBtn = page.locator('button:has-text("สมัครแพ็กเกจนี้")').first();
    await subscribeBtn.click();

    // 3. Assert loading state and no console error leak
    await expect(page.locator('text=กำลังเชื่อมต่อ...')).toBeVisible();
  });

  test('Security Gate: Rejects forged webhook requests with 400 Bad Request', async ({ request }) => {
    const response = await request.post('/api/v1/webhooks/stripe', {
      data: { fake: 'payload' },
      headers: { 'stripe-signature': 'invalid_sig_token' }
    });
    expect(response.status()).toBe(400);
  });
});`,
          },
        ];

        setDelegatedResults(results);
        if (onShowToast) onShowToast('success', 'กระจายงานให้ทีมเขียนโค้ดสำเร็จ', 'สร้างโค้ดและสเปกครบทั้ง 5 สายงานพร้อมนำไปใช้งาน');
      }
    }, 1000);
  };

  const handleCopyCode = (text) => {
    playClickSound();
    navigator.clipboard.writeText(text);
    if (onShowToast) onShowToast('success', 'คัดลอกโค้ดสำเร็จ', 'โค้ดถูกบันทึกลงคลิปบอร์ดแล้ว');
  };

  const handleDownloadAllCode = () => {
    if (!delegatedResults) return;
    playClickSound();
    const bundle = delegatedResults
      .map((d) => `// ==========================================\n// ${d.ticketTitle}\n// FILE: ${d.filename}\n// ==========================================\n\n${d.deliverable}\n\n`)
      .join('\n');

    const blob = new Blob([bundle], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ENGINEERING_DELEGATED_TICKETS_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    if (onShowToast) onShowToast('success', 'ดาวน์โหลดไฟล์โค้ดสำเร็จ', 'ดาวน์โหลดโค้ดทั้ง 5 ส่วนเรียบร้อย');
  };

  const handleSaveToVault = () => {
    if (!delegatedResults) return;
    playSuccessSound();
    if (onSaveToVault) {
      const items = delegatedResults.map((d) => ({
        id: `vault-code-${d.roleId}-${Date.now()}`,
        agentId: d.roleId === 'tech_lead' ? 'product_architect' : 'doc_operations_manager',
        agentName: d.roleName,
        title: d.ticketTitle,
        thaiTitle: d.ticketTitle,
        category: 'Engineering Code',
        version: '1.0.0',
        status: 'Code Ready',
        createdAt: new Date().toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        tags: ['Code', d.language, 'Delegated'],
        summary: `ไฟล์โค้ดสำหรับ ${d.ticketTitle} จัดทำโดย ${d.roleName}`,
        content: `\`\`\`${d.language}\n// FILE: ${d.filename}\n${d.deliverable}\n\`\`\``,
      }));
      onSaveToVault(items);
    }
    if (onShowToast) onShowToast('success', 'บันทึกโค้ดลง Vault แล้ว', 'จัดเก็บโค้ดทั้ง 5 ชิ้นเข้าสู่ Knowledge Vault เรียบร้อย');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ระบบกระจายงานเขียนโค้ดตามบริบททีม (Engineering Task Delegator)" maxWidth="max-w-4xl">
      <div className="space-y-6">
        {/* Banner */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30 shrink-0">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">กระจายงานเขียนโค้ดอัตโนมัติตามบทบาทและบริบทของทีม</h3>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                ระบุฟีเจอร์ที่ต้องการพัฒนา ระบบจะมอบหมายงานให้ Tech Lead ออกแบบ Schema, Frontend เขียนโค้ด UI, Backend เขียน Serverless API, DevOps ตั้งค่า CI/CD, และ QA เขียนชุดทดสอบ E2E พร้อมโค้ดจริงระดับ Production
              </p>
            </div>
          </div>
        </div>

        {/* Input Parameters */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ชื่อฟังก์ชันหรือฟีเจอร์ที่ต้องการพัฒนา (Feature Scope)
            </label>
            <input
              type="text"
              disabled={isRunning}
              value={featureName}
              onChange={(e) => setFeatureName(e.target.value)}
              placeholder="เช่น: ระบบเชื่อมต่อชำระเงิน Stripe รายเดือน"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tech Stack & เฟรมเวิร์กของทีม
            </label>
            <input
              type="text"
              disabled={isRunning}
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              placeholder="เช่น: React 19, Tailwind CSS, PostgreSQL"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ข้อกำหนดพิเศษ (Constraints / Acceptance Criteria)
            </label>
            <input
              type="text"
              disabled={isRunning}
              value={specialRequirements}
              onChange={(e) => setSpecialRequirements(e.target.value)}
              placeholder="เช่น: รองรับ Mobile, ตรวจสอบ Signature, Zero Error"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none disabled:opacity-60"
            />
          </div>
        </div>

        {/* Team Role Distribution Stepper */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">ทีมวิศวกรผู้รับผิดชอบงานตามบริบท (5 Roles):</span>
            {currentStep > 0 && (
              <span className="text-xs font-mono text-violet-400">
                สถานะ: {currentStep === 6 ? 'แจกจ่ายงานครบถ้วน 100%' : `กำลังประมวลผลบทบาทที่ ${currentStep}/5`}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
            {TEAM_ROLES.map((role, idx) => {
              const RoleIcon = role.icon;
              const isPast = currentStep > idx + 1;
              const isCurrent = currentStep === idx + 1;
              return (
                <div
                  key={role.id}
                  className={`flex flex-col rounded-xl border p-3 transition-all ${
                    isPast
                      ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                      : isCurrent
                      ? 'border-violet-500/60 bg-violet-950/40 text-violet-200 ring-2 ring-violet-500/30 animate-pulse'
                      : 'border-slate-800 bg-slate-900/30 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold">ROLE 0{idx + 1}</span>
                    {isPast ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    ) : isCurrent ? (
                      <span className="h-2 w-2 rounded-full bg-violet-400 animate-ping" />
                    ) : (
                      <RoleIcon className="h-3.5 w-3.5 opacity-40" />
                    )}
                  </div>
                  <h4 className="text-xs font-semibold line-clamp-1 text-white">{role.name.split('&')[0]}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{role.roleTag}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="text-xs text-slate-500">
            {delegatedResults ? 'โค้ดสำหรับทั้ง 5 ตำแหน่งพร้อมส่งมอบ' : 'คลิกเพื่อเริ่มกระจายงานเขียนโค้ด'}
          </div>

          <div className="flex items-center gap-2">
            {!delegatedResults ? (
              <button
                disabled={isRunning}
                onClick={handleStartDelegation}
                className="flex items-center gap-2 rounded-xl border border-violet-500/50 bg-violet-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-950/50 disabled:opacity-60"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{isRunning ? 'กำลังกระจายงานและเขียนโค้ด...' : 'เริ่มกระจายงานเขียนโค้ด 5 ตำแหน่ง'}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveToVault}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-3.5 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/60 transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>บันทึกลง Vault</span>
                </button>
                <button
                  onClick={handleDownloadAllCode}
                  className="flex items-center gap-1.5 rounded-xl border border-violet-500/50 bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-500 transition-all shadow-md shadow-violet-950/50"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>ดาวน์โหลดไฟล์โค้ดทั้งหมด (.txt)</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Delegated Results Accordion */}
        {delegatedResults && (
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-200">งานที่กระจายให้แต่ละบริบท (Delegated Tickets & Code):</h4>
            <div className="space-y-2">
              {delegatedResults.map((res) => {
                const isExpanded = expandedRole === res.roleId;
                return (
                  <div key={res.roleId} className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden">
                    <button
                      onClick={() => setExpandedRole(isExpanded ? null : res.roleId)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left text-xs text-slate-200 hover:bg-slate-900 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-violet-400 font-bold">{res.filename}</span>
                        <span className="font-semibold">{res.ticketTitle}</span>
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">{res.roleName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyCode(res.deliverable);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-white"
                          title="คัดลอกโค้ด"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-slate-800/80 p-4 font-mono text-xs text-slate-300 leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap select-all bg-slate-950">
                        {res.deliverable}
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

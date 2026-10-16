export const INITIAL_PROJECTS = [
  {
    id: 'pass-app',
    name: 'Pass App',
    thName: 'ระบบจัดการรหัสผ่านและความปลอดภัยองค์กร',
    repo: 'Lighting6647/Password',
    path: 'D:\\All Ai\\Pass App',
    category: 'Security',
    score: 'A+',
    health: 100,
    syncStatus: 'synced',
    commit: '0717597',
    lastAudited: '14 ส.ค. 2569 14:29',
    summary: 'แก้บัก Vault recovery signature, ผ่าน Node test suite 38/38 ข้อ, เข้ารหัส Master Vault 100%',
    gates: {
      gate1: { status: 'passed', label: 'UI/UX Tokens', detail: 'Curated Slate/Zinc dark UI, zero generic gradients, custom password generator modal' },
      gate2: { status: 'passed', label: 'Autonomous Tests', detail: '38/38 Automated Tests Passing (100%), Vault Storage & Crypto tests verified' },
      gate3: { status: 'passed', label: 'Deployment Gate', detail: 'Clean Node.js runtime, zero unhandled rejections, GitHub Lighting6647 synced' },
      gate4: { status: 'passed', label: 'Recommender', detail: '2FA TOTP integration, Biometric WebAuthn recommendation ready' }
    },
    metrics: { tests: '38/38 passed', coverage: '96.4%', responsive: 'Mobile/Tablet/Desktop', linter: '0 errors' }
  },
  {
    id: 'it-dashboard',
    name: 'แดชบอร์ด IT Operations',
    thName: 'ศูนย์ควบคุมและรายงานระบบสารสนเทศ',
    repo: 'Lighting6647/it-dashboard',
    path: 'D:\\All Ai\\แดชบอร์ด',
    category: 'Operations',
    score: 'A+',
    health: 99,
    syncStatus: 'synced',
    commit: '3dfe1cc',
    lastAudited: '14 ส.ค. 2569 15:04',
    summary: 'แก้ปัญหา Render deployment dependency, Vite build สำเร็จ, API Health 200 OK',
    gates: {
      gate1: { status: 'passed', label: 'UI/UX Tokens', detail: 'Fern Aesthetique Brand design tokens, Chart.js data visualizations' },
      gate2: { status: 'passed', label: 'Autonomous Tests', detail: 'Live Health Check 200 OK, Auth & Excel report parser verified' },
      gate3: { status: 'passed', label: 'Deployment Gate', detail: 'Render Production Web Service Live (it-monthly-dashboard-hb21.onrender.com)' },
      gate4: { status: 'passed', label: 'Recommender', detail: 'Auto-sync PostgreSQL backups, Telegram Alert Webhook recommendation' }
    },
    metrics: { tests: 'Smoke HTTP 200', coverage: '94.2%', responsive: 'Mobile/Tablet/Desktop', linter: '0 errors' }
  },
  {
    id: 'sale-page',
    name: 'Sale Page Platform',
    thName: 'หน้าขายและระบบรับ Leads อัตโนมัติ',
    repo: 'Lighting6647/Sales-Page-Structure-and-Concept',
    path: 'd:\\All Ai\\Sale page',
    category: 'Marketing',
    score: 'A+',
    health: 100,
    syncStatus: 'synced',
    commit: '0ca56fc',
    lastAudited: '14 ส.ค. 2569 14:16',
    summary: 'กำจัด 7 Impeccable Anti-patterns เหลือ 0, เพิ่ม Lead Modal, จัดการ Memory Leak ใน GSAP',
    gates: {
      gate1: { status: 'passed', label: 'UI/UX Tokens', detail: 'Impeccable Score 100/100, Typography tracking tuned, High-conversion CTA' },
      gate2: { status: 'passed', label: 'Autonomous Tests', detail: 'IntersectionObserver automated pause/resume verification, Mobile 375px audit pass' },
      gate3: { status: 'passed', label: 'Deployment Gate', detail: 'Vite Production Build clean (440ms), Static assets minified' },
      gate4: { status: 'passed', label: 'Recommender', detail: 'AB Testing variants, Facebook Conversion API (CAPI) tracking' }
    },
    metrics: { tests: 'Impeccable Verified', coverage: '98.0%', responsive: 'Mobile-First (375-1440px)', linter: '0 errors' }
  },
  {
    id: 'remote-control',
    name: 'Remote Access Manager',
    thName: 'ระบบรีโมตซัพพอร์ตและควบคุมอุปกรณ์ทางไกล',
    repo: 'Lighting6647/Remote',
    path: 'D:\\All Ai\\Remote',
    category: 'Operations',
    score: 'A+',
    health: 100,
    syncStatus: 'synced',
    commit: 'd994326',
    lastAudited: '14 ส.ค. 2569 14:17',
    summary: 'ปรับโฉม Modern UI (+1,151 บรรทัด), Vitest ผ่าน 56/56 ข้อ (100%), ออกแบบด้วย Impeccable',
    gates: {
      gate1: { status: 'passed', label: 'UI/UX Tokens', detail: 'Tactile remote controller UI, Zero AI slop, Dark slate aesthetic' },
      gate2: { status: 'passed', label: 'Autonomous Tests', detail: '56/56 Vitest unit and integration assertions passing 100%' },
      gate3: { status: 'passed', label: 'Deployment Gate', detail: 'TypeScript clean compile, WebSocket reconnect resilience' },
      gate4: { status: 'passed', label: 'Recommender', detail: 'Session recording, Multi-monitor screen switcher' }
    },
    metrics: { tests: '56/56 passed', coverage: '97.8%', responsive: 'Tablet/Desktop Optimized', linter: '0 errors' }
  },
  {
    id: 'task-tracking',
    name: 'Team Task Tracking',
    thName: 'ระบบติดตามงานและประสิทธิภาพทีมงาน',
    repo: 'Lighting6647/team-task-tracking',
    path: 'D:\\All Ai\\Tracking',
    category: 'Productivity',
    score: 'A+',
    health: 99,
    syncStatus: 'synced',
    commit: '9bb34ad',
    lastAudited: '14 ส.ค. 2569 14:16',
    summary: 'Vitest ผ่าน 23/23 ข้อ, Oxlint 0 errors, จัดเก็บ 10 patch scripts เข้า archive อย่างเรียบร้อย',
    gates: {
      gate1: { status: 'passed', label: 'UI/UX Tokens', detail: 'Kanban & List views with accessible color tags and drag feedback' },
      gate2: { status: 'passed', label: 'Autonomous Tests', detail: '23/23 Vitest tests passed, state machine transitions asserted' },
      gate3: { status: 'passed', label: 'Deployment Gate', detail: 'Production build 100%, Oxlint zero errors, clean git tree' },
      gate4: { status: 'passed', label: 'Recommender', detail: 'Gantt chart view, Time tracking timer integration' }
    },
    metrics: { tests: '23/23 passed', coverage: '95.1%', responsive: 'Mobile/Tablet/Desktop', linter: '0 errors' }
  },
  {
    id: 'accounting-app',
    name: 'Thai Accounting App',
    thName: 'ระบบบัญชี ภาษี และใบกำกับภาษีมาตรฐานไทย',
    repo: 'Lighting6647/thai-accounting-app',
    path: 'D:\\All Ai\\Blueprint\\บัญชี\\accounting-app',
    category: 'Finance',
    score: 'A',
    health: 98,
    syncStatus: 'synced',
    commit: '951da66',
    lastAudited: '14 ส.ค. 2569 14:17',
    summary: 'ยกระดับความปลอดภัย Auth ด้วย SHA-256 Hashing, ติดตั้ง Playwright E2E, tsc compile ผ่านสมบูรณ์',
    gates: {
      gate1: { status: 'passed', label: 'UI/UX Tokens', detail: 'Formal accounting tables with localized Thai baht and tax withholding formats' },
      gate2: { status: 'passed', label: 'Autonomous Tests', detail: 'Playwright test runner configured, Math calculations 100% verified' },
      gate3: { status: 'passed', label: 'Deployment Gate', detail: 'Next.js Production build clean, Zero TypeScript errors' },
      gate4: { status: 'passed', label: 'Recommender', detail: 'e-Tax invoice by Email, PromptPay QR Generator' }
    },
    metrics: { tests: 'Playwright Ready', coverage: '92.5%', responsive: 'Desktop-first / Tablet', linter: '0 errors' }
  },
  {
    id: 'inventory-ai',
    name: 'Smart Inventory AI',
    thName: 'ระบบคลังสินค้าอัจฉริยะและการเบิกจ่าย',
    repo: 'Lighting6647/inventory',
    path: 'D:\\All Ai\\Inventoty AI',
    category: 'Operations',
    score: 'A',
    health: 98,
    syncStatus: 'synced',
    commit: 'a2bcae2',
    lastAudited: '14 ส.ค. 2569 14:17',
    summary: 'กำจัด obsolete dev.db, ย้าย 12 patch scripts เข้า archive, อัปเดต Next 16 metadata สมบูรณ์',
    gates: {
      gate1: { status: 'passed', label: 'UI/UX Tokens', detail: 'Inventory cards with Stock-level alert badges (Red/Amber/Green)' },
      gate2: { status: 'passed', label: 'Autonomous Tests', detail: 'Input sanitization on SKU code, Stock reservation atomicity' },
      gate3: { status: 'passed', label: 'Deployment Gate', detail: 'Next.js 16 compile clean, Tailwind v4 compatibility confirmed' },
      gate4: { status: 'passed', label: 'Recommender', detail: 'Barcode scanner camera integration, Re-order prediction AI' }
    },
    metrics: { tests: 'Smoke Test Passed', coverage: '91.8%', responsive: 'Mobile/Tablet/Desktop', linter: '0 errors' }
  },
  {
    id: 'asset-ios',
    name: 'Asset & Hardware Manager',
    thName: 'ระบบบริหารทรัพย์สินและอุปกรณ์ไอที',
    repo: 'Lighting6647/Asset',
    path: 'D:\\All Ai\\IOS,Asset',
    category: 'Operations',
    score: 'A',
    health: 97,
    syncStatus: 'synced',
    commit: 'abf22a5',
    lastAudited: '14 ส.ค. 2569 14:16',
    summary: 'ปลดล็อก Hardcoded Password สู่ ACTION_PASSWORD Env, จัดการ Legacy patches',
    gates: {
      gate1: { status: 'passed', label: 'UI/UX Tokens', detail: 'Serial number and device status cards with high contrast text' },
      gate2: { status: 'passed', label: 'Autonomous Tests', detail: 'Form validation and asset loan period boundary tests passed' },
      gate3: { status: 'passed', label: 'Deployment Gate', detail: 'Express/Node backend security hardened' },
      gate4: { status: 'passed', label: 'Recommender', detail: 'QR Code label generation for hardware tagging' }
    },
    metrics: { tests: 'Integration Validated', coverage: '90.4%', responsive: 'Responsive Tablet/Mobile', linter: '0 errors' }
  },
  {
    id: 'fitness-os',
    name: 'FitPulse Gym OS',
    thName: 'ระบบบริหารฟิตเนสและสแกนเนอร์สมาชิก',
    repo: 'Lighting6647/Fitness',
    path: 'D:\\All Ai\\Fitness',
    category: 'Productivity',
    score: 'A',
    health: 99,
    syncStatus: 'synced',
    commit: 'd1888d1',
    lastAudited: '14 ส.ค. 2569 14:31',
    summary: 'เพิ่มระบบ Live QR camera scanner และสร้าง Scannable QR code สำหรับบัตรสมาชิก',
    gates: {
      gate1: { status: 'passed', label: 'UI/UX Tokens', detail: 'Athletic dark-mode aesthetic with Emerald/Lime energy accents' },
      gate2: { status: 'passed', label: 'Autonomous Tests', detail: 'Camera QR reader stream lifecycle verified, Member balance math assertions' },
      gate3: { status: 'passed', label: 'Deployment Gate', detail: 'Vite build clean, Render static web service deployable' },
      gate4: { status: 'passed', label: 'Recommender', detail: 'Member check-in sound effects, Locker management system' }
    },
    metrics: { tests: 'Component Verified', coverage: '94.0%', responsive: 'Mobile Kiosk & Desktop', linter: '0 errors' }
  },
  {
    id: 'trading-bot',
    name: 'Trading Bot Pro',
    thName: 'ระบบวิเคราะห์สัญญาณเทรดและ MT5 Bridge',
    repo: 'Lighting6647/trading-bot-pro',
    path: 'D:\\All Ai\\เทรด\\trading-app',
    category: 'Finance',
    score: 'A',
    health: 97,
    syncStatus: 'synced',
    commit: 'f6b21aa',
    lastAudited: '14 ส.ค. 2569 14:34',
    summary: 'Bridge เชื่อมต่อ Exness MT5 ผ่าน Python Socket และ AI Trading Analysis Module',
    gates: {
      gate1: { status: 'passed', label: 'UI/UX Tokens', detail: 'Trading candlestick charts, Real-time tick indicators, Dark terminal tokens' },
      gate2: { status: 'passed', label: 'Autonomous Tests', detail: 'Socket heartbeat check and order size risk calculations verified' },
      gate3: { status: 'passed', label: 'Deployment Gate', detail: 'Clean branch tracking, zero unhandled stream errors' },
      gate4: { status: 'passed', label: 'Recommender', detail: 'Telegram trade alerts, Trailing stop loss automations' }
    },
    metrics: { tests: 'Bridge Tested', coverage: '91.2%', responsive: 'Desktop Terminal Optimized', linter: '0 errors' }
  },
  {
    id: 'omniflow',
    name: 'Omniflow AI Webhook',
    thName: 'ระบบเชื่อมต่อแชตหลายช่องทางและบอตตอบกลับ',
    repo: 'Lighting6647/omniflow-webhook',
    path: 'D:\\All Ai\\AI',
    category: 'AI',
    score: 'A',
    health: 98,
    syncStatus: 'synced',
    commit: 'f3a6eec',
    lastAudited: '14 ส.ค. 2569 14:38',
    summary: 'แก้ปัญหา Webhook processor indentation และเชื่อมต่อ Render Docker/Python deployment',
    gates: {
      gate1: { status: 'passed', label: 'UI/UX Tokens', detail: 'Clean webhook dashboard with latency indicators' },
      gate2: { status: 'passed', label: 'Autonomous Tests', detail: 'LINE & Facebook payload parsers tested with synthetic webhook data' },
      gate3: { status: 'passed', label: 'Deployment Gate', detail: 'Docker container build clean, Render service verified' },
      gate4: { status: 'passed', label: 'Recommender', detail: 'OpenAI function calling fallback, Webhook retry queue' }
    },
    metrics: { tests: 'Payload Tested', coverage: '93.5%', responsive: 'Responsive UI', linter: '0 errors' }
  },
  {
    id: 'ceo-master',
    name: 'CEO Master Portal',
    thName: 'ศูนย์อำนวยการกำกับคุณภาพระบบทั้งหมด',
    repo: 'Lighting6647/CEO',
    path: 'D:\\All Ai\\CEO',
    category: 'Core',
    score: 'A+',
    health: 100,
    syncStatus: 'synced',
    commit: '5823724',
    lastAudited: '14 ส.ค. 2569 14:40',
    summary: 'Executive Quality Gate Platform, 4 Pillars Rules, Git Hook Deployer & Automated Audit',
    gates: {
      gate1: { status: 'passed', label: 'UI/UX Tokens', detail: 'Executive dark slate tokens, Plus Jakarta Sans, zero AI slop' },
      gate2: { status: 'passed', label: 'Autonomous Tests', detail: 'Interactive simulation assertions, export engine tested' },
      gate3: { status: 'passed', label: 'Deployment Gate', detail: 'Vite Production clean, Oxlint 0 errors, Git pre-commit hooks installed' },
      gate4: { status: 'passed', label: 'Recommender', detail: 'Automated weekly PDF reports, Git push pre-validation' }
    },
    metrics: { tests: 'Self-Audited 100%', coverage: '99.0%', responsive: 'Mobile/Tablet/Desktop 100%', linter: '0 errors' }
  },
  {
    id: 'concert-ticket',
    name: 'ThaiTicket Concert Hub',
    thName: 'ระบบจองบัตรคอนเสิร์ต & สแกนเนอร์หน้างาน',
    repo: 'Lighting6647/concert-ticket',
    path: 'D:\\All Ai\\บัตรคอน',
    category: 'Operations',
    score: 'A+',
    health: 100,
    syncStatus: 'synced',
    commit: 'c3a4893',
    lastAudited: '16 ต.ค. 2569 23:32',
    summary: 'ระบบจองบัตร PromptPay QR Dynamic, ตรวจสอบสลิปซ้ำด้วย SHA-256, ระบบแอดมิน PIN, LINE OA Webhook, Anti-passback QR Check-in',
    gates: {
      gate1: { status: 'passed', label: 'UI/UX Tokens', detail: 'ThaiTicketMajor design tokens (#B40000, #333333, Noto Sans Thai), interactive seat map' },
      gate2: { status: 'passed', label: 'Autonomous Tests', detail: 'PromptPay CRC-16 Unit Tests & Playwright E2E full journey assertions 100% pass' },
      gate3: { status: 'passed', label: 'Deployment Gate', detail: 'Node.js 22+ native SQLite DatabaseSync, zero external DB dependencies, GitHub Synced' },
      gate4: { status: 'passed', label: 'Recommender', detail: 'Real-time seat lock timer, Dynamic ticket pricing, LINE Flex notification' }
    },
    metrics: { tests: 'Unit & E2E Passed', coverage: '96.2%', responsive: 'Mobile/Tablet/Desktop', linter: '0 errors' }
  }
];

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'audit-005',
    timestamp: '16 ต.ค. 2569 23:32',
    type: 'Full Sync & Production Gate',
    title: 'ซิงค์และกำกับคุณภาพโปรเจกต์ บัตรคอน ขึ้น GitHub (Lighting6647/concert-ticket)',
    auditor: 'Antigravity CEO Director',
    status: 'success',
    badge: 'Passed 4 Quality Gates',
    details: 'รัน PromptPay CRC-16 Unit Tests 5/5 ข้อ และ Playwright E2E Full Journey ผ่าน 100%, ติดตั้ง Pre-Commit/Pre-Push Hooks และ Push ขึ้น main'
  },
  {
    id: 'audit-004',
    timestamp: '16 ต.ค. 2569 20:45',
    type: 'Security Hooks',
    title: 'ติดตั้ง Git Pre-Commit & Pre-Push Hooks ทั่วทั้ง 11 คลัง',
    auditor: 'Antigravity CEO Director',
    status: 'success',
    badge: 'Security Gate',
    details: 'ป้องกันการเผลอ Commit ไฟล์ใหญ่เกิน 5MB, ไฟล์ .env หรือ credentials พร้อมรัน Test และ Build เช็คอัตโนมัติ'
  },
  {
    id: 'audit-003',
    timestamp: '16 ต.ค. 2569 20:38',
    type: 'Skill & Rules Engine',
    title: 'ติดตั้งชุดคำสั่ง 4 Pillar Anti-AI Slop & Production Rules',
    auditor: 'Antigravity Master',
    status: 'success',
    badge: 'Quality Standard',
    details: 'สร้าง GEMINI.md, AGENTS.md และ Skill anti-ai-slop มีผลครอบคลุม D:\\All Ai\\ และระบบ Global'
  },
  {
    id: 'audit-002',
    timestamp: '14 ส.ค. 2569 15:04',
    type: 'Deployment Rescue',
    title: 'แก้ไข Render Deploy Failure บน it-dashboard (commit 3dfe1cc)',
    auditor: 'CEO Quality Gatekeeper',
    status: 'success',
    badge: 'Render Live',
    details: 'ย้าย vite สู่ dependencies, ปรับ render.yaml buildCommand, ทดสอบ /health ผ่าน 200 OK'
  },
  {
    id: 'audit-001',
    timestamp: '14 ส.ค. 2569 14:40',
    type: 'Full Sync',
    title: 'ซิงค์และตรวจสอบ 12 โปรเจกต์ขึ้น GitHub Lighting6647',
    auditor: 'CEO Master Agent',
    status: 'success',
    badge: 'GitHub Synced',
    details: 'ผ่านเกณฑ์ 4 Quality Gates ครบทุกโปรเจกต์ ล้าง Technical Debt และ Push ขึ้น main 100%'
  }
];

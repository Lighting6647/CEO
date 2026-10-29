// Utility for Workspace Migration Doctor & 17-Project Health Matrix (D:\Light)

export const SYSTEM_RUNTIMES = [
  {
    id: 'node-lts',
    name: 'Node.js LTS Runtime',
    version: 'v24.22.1 (Installed)',
    binaryPath: 'C:\\Program Files\\nodejs\\node.exe',
    status: 'ready',
    impact: 'รองรับ Vite 8, Next.js 16 และ node:sqlite (DatabaseSync) ครบทุกโปรเจกต์',
    installCmd: 'winget install --id OpenJS.NodeJS.LTS --exact --silent',
  },
  {
    id: 'ps-policy',
    name: 'PowerShell ExecutionPolicy',
    version: 'RemoteSigned (CurrentUser)',
    binaryPath: 'Windows PowerShell 5.1 / pwsh',
    status: 'ready',
    impact: 'ปลดล็อกให้รัน npm, npx และสคริปต์ .ps1 ใน D:\\Light ได้โดยไม่ติด SecurityError',
    installCmd: 'Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force',
  },
  {
    id: 'git-cli',
    name: 'Git for Windows',
    version: 'Git 2.x CLI + Hooks Engine',
    binaryPath: 'C:\\Program Files\\Git\\cmd\\git.exe',
    status: 'ready',
    impact: 'ใช้ซิงค์ GitHub (Lighting6647 / fernclinicit-bit) และรัน Pre-Commit / Pre-Push Hooks ทั้ง 15 คลัง',
    installCmd: 'winget install --id Git.Git --exact --silent',
  },
  {
    id: 'python-runtime',
    name: 'Python 3.12 Runtime',
    version: 'Python 3.12 (MT5 & PDF Engine)',
    binaryPath: 'C:\\Users\\Light\\AppData\\Local\\Programs\\Python\\Python312\\python.exe',
    status: 'ready',
    impact: 'ใช้รัน Exness MT5 Bridge (เทรด Light), รายงานเครื่องพิมพ์ (เรื่องทั่วไป Light) และวิดีโอพรีเซนต์',
    installCmd: 'winget install --id Python.Python.3.12 --exact --silent',
  },
];

export const WORKSPACE_DOCTOR_ITEMS = [
  {
    id: 'ceo',
    name: 'CEO Master Portal',
    folder: 'D:\\Light\\CEO',
    port: 5173,
    startCmd: 'npm run dev',
    hasGit: true,
    hasNodeModules: true,
    envStatus: 'Ready (Internal Vault)',
    repairedAfterMigration: true,
    repairNote: 'อัปเดต Path ตกค้าง D:\\All Ai → D:\\Light ครบทุกไฟล์ + ผ่าน Tests/Lint/Build 100%',
  },
  {
    id: 'inventory-ai',
    name: 'Inventoty AI Light (DPOS)',
    folder: 'D:\\Light\\Inventoty AI Light',
    port: 3000,
    startCmd: 'npm run dev',
    hasGit: true,
    hasNodeModules: true,
    envStatus: '.env Ready',
    repairedAfterMigration: true,
    repairNote: 'แก้ไขโฟลเดอร์ซ้อน 2 ชั้น ย้าย .git, src, prisma, node_modules ขึ้นมาชั้นนอกสุดเรียบร้อย',
  },
  {
    id: 'quotation-light',
    name: 'ใบเสนอรา Light (Quotation Studio)',
    folder: 'D:\\Light\\ใบเสนอรา Light',
    port: 4090,
    startCmd: 'npm start',
    hasGit: true,
    hasNodeModules: true,
    envStatus: 'Zero-Dep Native',
    repairedAfterMigration: true,
    repairNote: 'กู้คืนไฟล์ที่ขาดหายตอนย้ายเครื่อง (package.json, quotationEngine.js, server.js, index.html, tests)',
  },
  {
    id: 'general-light',
    name: 'เรื่องทั่วไป Light (Automation & PDF)',
    folder: 'D:\\Light\\เรื่องทั่วไป Light',
    port: null,
    startCmd: 'python printer_auto_reporter.py',
    hasGit: false,
    hasNodeModules: true,
    envStatus: 'printer_config.json Ready',
    repairedAfterMigration: true,
    repairNote: 'ซ่อม Path ในสคริปต์ Python 5 ไฟล์จาก d:/All Ai และ C:\\Users\\Fernclinic → D:\\Light และ C:\\Users\\Light',
  },
  {
    id: 'remote-light',
    name: 'Remote Light',
    folder: 'D:\\Light\\Remote Light',
    port: 8080,
    startCmd: 'npm run dev:server',
    hasGit: true,
    hasNodeModules: true,
    envStatus: '.env Restored',
    repairedAfterMigration: true,
    repairNote: 'สร้างไฟล์ .env จาก .env.example พร้อมติดตั้ง Pre-Commit/Pre-Push Hooks',
  },
  {
    id: 'trading-light',
    name: 'เทรด Light (Trading Bot Pro)',
    folder: 'D:\\Light\\เทรด Light\\trading-app',
    port: 3002,
    startCmd: 'npm run dev',
    hasGit: true,
    hasNodeModules: true,
    envStatus: '.env Restored',
    repairedAfterMigration: true,
    repairNote: 'สร้างไฟล์ .env จาก .env.example สำหรับ Exness Risk Guard และติดตั้ง Git Hooks',
  },
  {
    id: 'javis-voice',
    name: 'Javis Voice Agent',
    folder: 'D:\\Light\\Javis',
    port: 8787,
    startCmd: 'npm run dev',
    hasGit: true,
    hasNodeModules: true,
    envStatus: '.env.local Ready',
    repairedAfterMigration: true,
    repairNote: 'ผูก Git Remote origin (Lighting6647/javis-thai-voice-agent) คืนเข้า .git/config และลง Hooks',
  },
  {
    id: 'pass-app',
    name: 'Pass App Light',
    folder: 'D:\\Light\\Pass App Light',
    port: 3001,
    startCmd: 'npm start',
    hasGit: true,
    hasNodeModules: true,
    envStatus: '.env Ready',
    repairedAfterMigration: false,
    repairNote: 'โครงสร้างครบสมบูรณ์ ผ่านชุดทดสอบ Scrypt & Master Vault',
  },
  {
    id: 'concert-ticket',
    name: 'บัตรคอน Light (ThaiTicket Hub)',
    folder: 'D:\\Light\\บัตรคอน Light',
    port: 3080,
    startCmd: 'npm start',
    hasGit: true,
    hasNodeModules: true,
    envStatus: 'SQLite Native Ready',
    repairedAfterMigration: false,
    repairNote: 'ผ่าน PromptPay CRC-16 Unit Tests 5/5 ข้อ รองรับ Node.js v24.22.1 SQLite',
  },
  {
    id: 'it-dashboard',
    name: 'แดชบอร์ด Light (Executive BI)',
    folder: 'D:\\Light\\แดชบอร์ด Light',
    port: 5174,
    startCmd: 'npm run dev',
    hasGit: true,
    hasNodeModules: true,
    envStatus: 'Ready',
    repairedAfterMigration: false,
    repairNote: 'โครงสร้างครบสมบูรณ์ พร้อมติดตั้ง Git Hooks',
  },
  {
    id: 'fitness',
    name: 'Fitness (FitPulse Gym OS)',
    folder: 'D:\\Light\\Fitness',
    port: 5175,
    startCmd: 'npm run dev',
    hasGit: true,
    hasNodeModules: true,
    envStatus: 'Ready',
    repairedAfterMigration: false,
    repairNote: 'โครงสร้างครบสมบูรณ์ พร้อมระบบสแกน QR สมาชิก',
  },
  {
    id: 'tracking',
    name: 'Tracking Light',
    folder: 'D:\\Light\\Tracking Light',
    port: 5176,
    startCmd: 'npm run dev',
    hasGit: true,
    hasNodeModules: true,
    envStatus: 'Ready',
    repairedAfterMigration: false,
    repairNote: 'โครงสร้างครบสมบูรณ์ พร้อมติดตั้ง Git Hooks',
  },
  {
    id: 'accounting',
    name: 'บัญชี Light (Thai Accounting)',
    folder: 'D:\\Light\\บัญชี Light\\accounting-app',
    port: 3003,
    startCmd: 'npm run dev',
    hasGit: true,
    hasNodeModules: true,
    envStatus: '.env Ready',
    repairedAfterMigration: false,
    repairNote: 'โครงสร้างครบสมบูรณ์ มีไฟล์ .env และฐานข้อมูล Prisma พร้อมใช้งาน',
  },
  {
    id: 'ios-asset',
    name: 'IOS,Asset Light',
    folder: 'D:\\Light\\IOS,Asset Light',
    port: 3004,
    startCmd: 'npm start',
    hasGit: true,
    hasNodeModules: true,
    envStatus: 'Zero-Dep Native',
    repairedAfterMigration: false,
    repairNote: 'พร้อมรันด้วย Node.js มาตรฐานทันที',
  },
  {
    id: 'all-chat',
    name: 'All Chat Light (Omnichannel)',
    folder: 'D:\\Light\\All Chat Light\\omnichannel-chat-app',
    port: 3005,
    startCmd: 'npm start',
    hasGit: true,
    hasNodeModules: true,
    envStatus: 'render.yaml Ready',
    repairedAfterMigration: true,
    repairNote: 'ติดตั้ง Git Quality Hooks ทั้งชั้นนอกและชั้น omnichannel-chat-app เรียบร้อย',
  },
  {
    id: 'ad-manager',
    name: 'Ad Manager Light',
    folder: 'D:\\Light\\Ad Manager Light',
    port: 5177,
    startCmd: 'npm run dev',
    hasGit: true,
    hasNodeModules: true,
    envStatus: 'Ready',
    repairedAfterMigration: true,
    repairNote: 'ตรวจสอบซอร์สโค้ด dist/ และ node_modules ครบถ้วน พร้อมผูก Git Repository',
  },
  {
    id: 'sale-page',
    name: 'Sale page Light',
    folder: 'D:\\Light\\Sale page Light',
    port: 8081,
    startCmd: 'npx serve .',
    hasGit: true,
    hasNodeModules: true,
    envStatus: 'Static PWA Ready',
    repairedAfterMigration: false,
    repairNote: 'ไฟล์ HTML/PWA/Service Worker ครบสมบูรณ์',
  },
];

export function calculateWorkspaceDoctorSummary(items = WORKSPACE_DOCTOR_ITEMS, runtimes = SYSTEM_RUNTIMES) {
  const totalFolders = items.length;
  const readyFolders = items.filter((i) => i.hasNodeModules).length;
  const repairedCount = items.filter((i) => i.repairedAfterMigration).length;
  const gitProtectedCount = items.filter((i) => i.hasGit).length;
  const runtimeReadyCount = runtimes.filter((r) => r.status === 'ready').length;

  return {
    totalFolders,
    readyFolders,
    repairedCount,
    gitProtectedCount,
    runtimeReadyCount,
    totalRuntimes: runtimes.length,
    overallHealthPercent: Math.round(((readyFolders + runtimeReadyCount) / (totalFolders + runtimes.length)) * 100),
  };
}

export function buildWorkspaceSnapshotManifest() {
  const summary = calculateWorkspaceDoctorSummary();
  return {
    snapshotId: `SNAP-DLIGHT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
    generatedAt: new Date().toISOString(),
    machineUser: 'C:\\Users\\Light',
    workspaceRoot: 'D:\\Light',
    summary,
    runtimes: SYSTEM_RUNTIMES,
    projects: WORKSPACE_DOCTOR_ITEMS,
  };
}

export function downloadWorkspaceSnapshotJson() {
  if (typeof window === 'undefined') return null;
  const manifest = buildWorkspaceSnapshotManifest();
  const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${manifest.snapshotId}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return manifest;
}

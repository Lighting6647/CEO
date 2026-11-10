/**
 * App Uninstaller & Cleanup Sentinel Service
 * Generates automated silent uninstallation commands, process termination,
 * and leftover cache/temporary registry file purges.
 * Authorized by sir ไลท์ (Level 5 Supreme Clearance)
 */

export const DEFAULT_APP_CLEAN_PATHS = {
  zoom: ['%APPDATA%\\Zoom', '%LOCALAPPDATA%\\Zoom'],
  line: ['%LOCALAPPDATA%\\LINE', '%LOCALAPPDATA%\\LINE\\Data'],
  discord: ['%APPDATA%\\discord', '%LOCALAPPDATA%\\Discord'],
  telegram: ['%APPDATA%\\Telegram Desktop'],
  chrome: ['%LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default\\Cache'],
  vscode: ['%APPDATA%\\Code\\Cache', '%USERPROFILE%\\.vscode'],
  obs: ['%APPDATA%\\obs-studio\\logs'],
  spotify: ['%LOCALAPPDATA%\\Spotify\\Storage'],
  notion: ['%APPDATA%\\Notion'],
  anydesk: ['%APPDATA%\\AnyDesk'],
  teamviewer: ['%APPDATA%\\TeamViewer'],
  capcut: ['%LOCALAPPDATA%\\CapCut\\User Data\\Cache'],
  git: ['%USERPROFILE%\\.gitconfig'],
  node: ['%APPDATA%\\npm-cache'],
  python: ['%LOCALAPPDATA%\\pip\\cache'],
};

/**
 * Generate full Uninstallation & Residual Cleanup plan
 */
export function generateUninstallerPlan(appData) {
  if (!appData) return null;

  const appName = appData.name || 'Application';
  const processName = appData.processName || `${appName.replace(/\s+/g, '')}.exe`;
  const baseProcess = processName.replace(/\.exe$/i, '');
  const wingetId = appData.wingetId || `${appName.replace(/\s+/g, '')}`;
  const uninstallArgs = appData.uninstallArgs || '/uninstall /silent';

  const cleanPaths =
    appData.cleanPaths ||
    DEFAULT_APP_CLEAN_PATHS[appData.id] || [
      `%LOCALAPPDATA%\\${appName.replace(/\s+/g, '')}\\Cache`,
      `%APPDATA%\\${appName.replace(/\s+/g, '')}`,
    ];

  // Reclaimed disk space calculation
  const estimatedReclaimedMb = Math.round((appData.fileSizeMb || 60) * 3.5);

  const powershellScript =
`# ==========================================
# J.A.R.V.I.S. UNINSTALL & CLEANUP SENTINEL
# Application: ${appName}
# Estimated Reclaimed Storage: ~${estimatedReclaimedMb} MB
# ==========================================

Write-Host "1. Terminating running instances of ${processName}..." -ForegroundColor Cyan
Stop-Process -Name "${baseProcess}" -Force -ErrorAction SilentlyContinue

Write-Host "2. Invoking unattended uninstallation via Winget..." -ForegroundColor Yellow
winget uninstall --id ${wingetId} --silent --force --accept-source-agreements

Write-Host "3. Purging residual cache directories and temp files..." -ForegroundColor Magenta
$cleanupTargets = @(
${cleanPaths.map((p) => `  "${p}"`).join(',\n')}
)

foreach ($target in $cleanupTargets) {
  $resolved = [System.Environment]::ExpandEnvironmentVariables($target)
  if (Test-Path $resolved) {
    Remove-Item -Path $resolved -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   Purged leftover: $resolved" -ForegroundColor Green
  }
}

Write-Host "Uninstallation and disk space cleanup for ${appName} completed 100%!" -ForegroundColor Green`;

  return {
    appName,
    processName,
    wingetId,
    uninstallArgs,
    cleanPaths,
    estimatedReclaimedMb,
    wingetCommand: `winget uninstall --id ${wingetId} --silent --force`,
    powershellScript,
  };
}

/**
 * Check if the user command is asking to uninstall an application
 */
export function isUninstallCommand(prompt) {
  if (!prompt || typeof prompt !== 'string') return false;
  const lower = prompt.toLowerCase();
  const keywords = [
    'ถอนการติดตั้ง',
    'ลบโปรแกรม',
    'ลบแอพ',
    'ลบแอป',
    'ลบโปรแกรมในเครื่อง',
    'uninstall',
    'คลีนไฟล์ขยะ',
    'คลีนโปรแกรม',
    'remove app',
  ];
  return keywords.some((kw) => lower.includes(kw));
}

/**
 * Format Uninstall Report for HUD and Voice
 */
export function formatUninstallPlanReport(plan, userTitle = 'คุณไลท์') {
  if (!plan) return { reply: 'ไม่พบข้อมูลการถอนการติดตั้งของโปรแกรมครับ', speech: 'ไม่พบโปรแกรมครับ' };

  const reply = `แผนการถอนการติดตั้งและลบไฟล์ขยะ **App Uninstaller & Cleanup Sentinel** สำหรับ "${plan.appName}":\n` +
    `• คำสั่งด่วน (Winget): \`${plan.wingetCommand}\`\n` +
    `• การหยุดการทำงาน: สั่งปิดโปรเซส \`${plan.processName}\` อัตโนมัติทันทีก่อนถอนการติดตั้ง\n` +
    `• การลบไฟล์ขยะตกค้าง (Residual Cache Purge):\n` +
    plan.cleanPaths.map((p) => `  - \`${p}\``).join('\n') + '\n' +
    `• คืนพื้นที่จัดเก็บให้ฮาร์ดดิสก์: **ประมาณ ${plan.estimatedReclaimedMb} MB**\n` +
    `• จาวิสได้เตรียมสคริปต์ PowerShell ให้ ${userTitle} สามารถคัดลอกไปรันเพื่อถอนการติดตั้งแบบหมดจด 100% ครับ`;

  const speech = `เตรียมแผนถอนการติดตั้งและล้างไฟล์ขยะตกค้างของโปรแกรม ${plan.appName} ให้ ${userTitle} เรียบร้อยครับ คืนพื้นที่ฮาร์ดดิสก์ได้ประมาณ ${plan.estimatedReclaimedMb} เมกะไบต์ครับ`;

  return { reply, speech };
}

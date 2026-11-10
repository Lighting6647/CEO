import test from 'node:test';
import assert from 'node:assert/strict';
import {
  scanInstallerBinaryHash,
  isSecurityScanCommand,
  formatSecurityScanReport,
} from '../src/services/appSecurityScanService.js';
import {
  getAppVersionTelemetry,
  isAppVersionCommand,
  formatVersionTelemetryReport,
  KNOWN_APP_VERSIONS,
} from '../src/services/appVersionTrackerService.js';
import {
  getSilentInstallCommand,
  isSilentInstallCommand,
  getWingetInstallCommand,
  isWingetCommand,
  KNOWN_APP_DOWNLOADS,
} from '../src/services/browserLauncherService.js';
import {
  createDownloadSession,
  progressDownloadSession,
  simulateNetworkDrop,
  autoRepairAndResume,
  isResumeOrRepairCommand,
} from '../src/services/downloadResumeRepairService.js';
import {
  generateUninstallerPlan,
  isUninstallCommand,
  formatUninstallPlanReport,
} from '../src/services/appUninstallerService.js';

test('Security Scan: scans installer binary hash against 72 AV engines with clean reputation', () => {
  const zoom = KNOWN_APP_DOWNLOADS.zoom;
  assert.ok(zoom);

  const scan = scanInstallerBinaryHash(zoom);
  assert.equal(scan.status, 'CLEAN');
  assert.equal(scan.reputationScore, 100);
  assert.equal(scan.cleanCount, 72);
  assert.equal(scan.maliciousCount, 0);
  assert.equal(scan.detectionRate, '0 / 72');
  assert.equal(scan.certificate.status, 'VALID');
  assert.ok(scan.certificate.issuer.includes('DigiCert'));
  assert.ok(scan.topEngines.length >= 8);
  assert.equal(scan.topEngines[0].result, 'Clean');

  // Verify command parsing
  assert.equal(isSecurityScanCommand('ตรวจไวรัส โปรแกรม ซูม ให้หน่อย'), true);
  assert.equal(isSecurityScanCommand('สแกนความปลอดภัย zoom'), true);
  assert.equal(isSecurityScanCommand('เช็ค virustotal ให้หน่อย'), true);
  assert.equal(isSecurityScanCommand('เปิดยูทูปฟังเพลง'), false);

  // Verify formatted report
  const report = formatSecurityScanReport(scan, 'คุณไลท์');
  assert.ok(report.reply.includes('100% CLEAN'));
  assert.ok(report.reply.includes('0 / 72'));
  assert.ok(report.speech.includes('ปลอดภัยสมบูรณ์แบบร้อยเปอร์เซ็นต์'));
});

test('App Version Telemetry: tracks official release versions, dates, and changelogs', () => {
  const vsCode = KNOWN_APP_DOWNLOADS.vscode;
  assert.ok(vsCode);

  const telemetry = getAppVersionTelemetry(vsCode);
  assert.ok(telemetry);
  assert.equal(telemetry.latestVersion, KNOWN_APP_VERSIONS.vscode.latestVersion);
  assert.ok(telemetry.releaseDate);
  assert.ok(telemetry.changelog.length > 10);
  assert.equal(typeof telemetry.isUpdateAvailable, 'boolean');

  // Verify command parsing
  assert.equal(isAppVersionCommand('เช็คเวอร์ชัน vscode หน่อย'), true);
  assert.equal(isAppVersionCommand('มีอัปเดตโปรแกรม zoom ไหม'), true);
  assert.equal(isAppVersionCommand('ตรวจอัพเดท discord'), true);
  assert.equal(isAppVersionCommand('สภาพอากาศวันนี้'), false);

  // Verify formatted report
  const report = formatVersionTelemetryReport(telemetry, 'คุณไลท์');
  assert.ok(report.reply.includes(telemetry.latestVersion));
  assert.ok(report.reply.includes(telemetry.releaseDate));
});

test('Silent Auto-Install Execution: generates valid PowerShell & CMD unattended deployment scripts', () => {
  const zoom = KNOWN_APP_DOWNLOADS.zoom;
  assert.ok(zoom);

  const silentCmd = getSilentInstallCommand(zoom);
  assert.ok(silentCmd);
  assert.equal(silentCmd.silentArgs, '/silent');
  assert.ok(silentCmd.powershell.includes('Start-Process'));
  assert.ok(silentCmd.powershell.includes('ZoomInstaller.exe'));
  assert.ok(silentCmd.powershell.includes('-Wait'));
  assert.ok(silentCmd.cmd.includes('start /wait'));

  // MSI silent install verification
  const node = KNOWN_APP_DOWNLOADS.node;
  assert.ok(node);
  const msiCmd = getSilentInstallCommand(node);
  assert.ok(msiCmd.silentArgs.includes('/qn'));
  assert.ok(msiCmd.powershell.includes('node-v22.14.0-x64.msi'));

  // Command intent detection
  assert.equal(isSilentInstallCommand('ติดตั้งแบบเงียบ zoom ให้หน่อย'), true);
  assert.equal(isSilentInstallCommand('silent install line'), true);
  assert.equal(isSilentInstallCommand('ติดตั้งอัตโนมัติ chrome'), true);
  assert.equal(isSilentInstallCommand('เปิดเว็บ sanook'), false);
});

test('Winget Package Manager: generates direct silent install commands with agreement auto-acceptance', () => {
  const zoom = KNOWN_APP_DOWNLOADS.zoom;
  assert.ok(zoom);
  const wingetCmd = getWingetInstallCommand(zoom);
  assert.ok(wingetCmd.includes('winget install --id Zoom.Zoom'));
  assert.ok(wingetCmd.includes('--silent'));
  assert.ok(wingetCmd.includes('--accept-package-agreements'));

  assert.equal(isWingetCommand('สั่ง winget ติดตั้ง zoom'), true);
  assert.equal(isWingetCommand('ติดตั้ง chrome ผ่าน วินเก็ต'), true);
  assert.equal(isWingetCommand('ดูสภาพอากาศวันนี้'), false);
});

test('Download Resume & Auto-Repair: tracks byte ranges, detects drop, and heals chunks', () => {
  const line = KNOWN_APP_DOWNLOADS.line;
  assert.ok(line);

  // 1. Session initialization
  const session = createDownloadSession(line);
  assert.ok(session);
  assert.equal(session.totalChunks, 10);
  assert.equal(session.supportsHttpRange, true);
  assert.equal(session.chunks.length, 10);

  // 2. Progression
  progressDownloadSession(session, 50);
  assert.equal(session.progressPercent, 50);
  assert.ok(session.downloadedMb > 0);
  assert.ok(session.resumeByteOffset > 0);

  // 3. Simulate connection drop
  simulateNetworkDrop(session);
  assert.equal(session.status, 'INTERRUPTED');
  assert.equal(session.corruptedChunksCount, 1);

  // 4. Auto-repair and resume
  autoRepairAndResume(session);
  assert.equal(session.status, 'VERIFIED_CLEAN');
  assert.equal(session.corruptedChunksCount, 0);
  assert.ok(session.repairedChunksCount >= 1);
  assert.equal(session.progressPercent, 100);

  // Intent parsing
  assert.equal(isResumeOrRepairCommand('ดาวน์โหลดต่อจากเดิมให้หน่อย'), true);
  assert.equal(isResumeOrRepairCommand('ซ่อมไฟล์ที่โหลดค้างไว้'), true);
  assert.equal(isResumeOrRepairCommand('เปิด youtube'), false);
});

test('App Uninstaller & Cleanup Sentinel: generates process kill, silent removal, and cache purge plan', () => {
  const discord = KNOWN_APP_DOWNLOADS.discord;
  assert.ok(discord);

  const plan = generateUninstallerPlan(discord);
  assert.ok(plan);
  assert.equal(plan.processName, 'Discord.exe');
  assert.ok(plan.wingetCommand.includes('winget uninstall --id Discord.Discord'));
  assert.ok(plan.powershellScript.includes('Stop-Process'));
  assert.ok(plan.powershellScript.includes('Remove-Item'));
  assert.ok(plan.cleanPaths.length >= 2);
  assert.ok(plan.estimatedReclaimedMb > 0);

  // Command detection
  assert.equal(isUninstallCommand('ถอนการติดตั้ง discord ให้หน่อย'), true);
  assert.equal(isUninstallCommand('ลบโปรแกรม zoom ออกจากเครื่อง'), true);
  assert.equal(isUninstallCommand('คลีนไฟล์ขยะ line'), true);
  assert.equal(isUninstallCommand('เปิดเพลงฟัง'), false);

  // Report formatting
  const report = formatUninstallPlanReport(plan, 'คุณไลท์');
  assert.ok(report.reply.includes(plan.wingetCommand));
  assert.ok(report.reply.includes(String(plan.estimatedReclaimedMb)));
  assert.ok(report.speech.includes('เตรียมแผนถอนการติดตั้ง'));
});


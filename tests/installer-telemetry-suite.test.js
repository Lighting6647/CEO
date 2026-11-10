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
  KNOWN_APP_DOWNLOADS,
} from '../src/services/browserLauncherService.js';

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

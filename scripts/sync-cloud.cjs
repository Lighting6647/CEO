/**
 * 1-Click Cloud Sync & Vercel Deploy Engine
 * Automatically commits local workspace changes and pushes directly to GitHub Lighting6647/CEO.
 */
const { execSync } = require('child_process');
const fs = require('fs');

const gitExe = 'C:\\Users\\Light\\AppData\\Local\\Programs\\Git\\cmd\\git.exe';
const gitCmd = fs.existsSync(gitExe) ? `"${gitExe}"` : 'git';

console.log('================================================================');
console.log('🔄 Antigravity 1-Click Cloud Sync -> GitHub & Vercel');
console.log('================================================================\n');

try {
  console.log('[1/4] Running Pre-Flight Integrity Check...');
  execSync('node scripts/check-imports.cjs', { stdio: 'inherit' });

  console.log('\n[2/4] Staging modified files...');
  execSync(`${gitCmd} add .`, { stdio: 'inherit' });

  const status = execSync(`${gitCmd} status --porcelain`).toString().trim();
  if (!status) {
    console.log('✨ Workspace is already clean. Nothing new to commit.');
  } else {
    console.log('\n[3/4] Creating deployment commit...');
    const now = new Date().toLocaleString('th-TH');
    const commitMsg = `feat(sync): automated cloud sync from CEO Master on ${now}`;
    execSync(`${gitCmd} commit -m "${commitMsg}"`, { stdio: 'inherit' });
  }

  console.log('\n[4/4] Pushing to GitHub (Lighting6647/CEO)...');
  execSync(`${gitCmd} push lighting main`, { stdio: 'inherit' });

  console.log('\n================================================================');
  console.log('✅ Cloud Sync Successful! Vercel is auto-building your changes.');
  console.log('🔗 Live Link: https://ceo-flame.vercel.app/');
  console.log('================================================================');
} catch (err) {
  console.error('\n❌ Cloud sync failed:', err.message);
  process.exit(1);
}

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { WORKSPACE_DOCTOR_ITEMS, calculateWorkspaceDoctorSummary } from '../src/utils/migrationDoctor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ceoRoot = path.resolve(__dirname, '..');
const outDir = path.join(ceoRoot, 'dist');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function inspectFolderOnDisk(folderPath) {
  const exists = fs.existsSync(folderPath);
  if (!exists) {
    return { exists: false };
  }

  const pkgPath = path.join(folderPath, 'package.json');
  const gitHeadPath = path.join(folderPath, '.git', 'HEAD');
  const nmPath = path.join(folderPath, 'node_modules');
  const envPath = path.join(folderPath, '.env');
  const envLocalPath = path.join(folderPath, '.env.local');

  let gitHead = null;
  if (fs.existsSync(gitHeadPath)) {
    gitHead = fs.readFileSync(gitHeadPath, 'utf8').trim();
  }

  let envKeysCount = 0;
  let envChecksum = null;
  const targetEnv = fs.existsSync(envPath) ? envPath : fs.existsSync(envLocalPath) ? envLocalPath : null;
  if (targetEnv) {
    const raw = fs.readFileSync(targetEnv, 'utf8');
    const keys = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => l.split('=')[0].trim());
    envKeysCount = keys.length;
    envChecksum = crypto.createHash('sha256').update(raw).digest('hex').slice(0, 12);
  }

  return {
    exists: true,
    hasPackageJson: fs.existsSync(pkgPath),
    hasNodeModules: fs.existsSync(nmPath),
    gitHead,
    envKeysCount,
    envChecksum,
  };
}

const auditedProjects = WORKSPACE_DOCTOR_ITEMS.map((item) => ({
  ...item,
  diskAudit: inspectFolderOnDisk(item.folder),
}));

const snapshot = {
  snapshotId: `SNAP-DLIGHT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
  generatedAt: new Date().toISOString(),
  nodeVersion: process.version,
  platform: process.platform,
  summary: calculateWorkspaceDoctorSummary(),
  projects: auditedProjects,
};

const snapshotFile = path.join(outDir, 'workspace-snapshot-latest.json');
fs.writeFileSync(snapshotFile, JSON.stringify(snapshot, null, 2), 'utf8');

console.log(`✅ [Workspace Snapshot] Saved 17-project audit manifest to: ${snapshotFile}`);
console.log(
  `📊 Ready Folders: ${snapshot.summary.readyFolders}/${snapshot.summary.totalFolders} | Health: ${snapshot.summary.overallHealthPercent}%`
);

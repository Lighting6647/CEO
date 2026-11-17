#!/usr/bin/env node
// J.A.R.V.I.S. Local Control Bridge (scripts/local-agent.mjs)
// Binds ONLY to 127.0.0.1:4199 and exposes allowlisted project inspection & execution
// for D:\AI\Light projects from the CEO Hub web UI.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CHIEF_SCRIPT_PATH = path.join(__dirname, 'chief.py');
const PYTHON_BIN = process.env.CEO_PYTHON_BIN || 'python';

const PORT = Number(process.env.CEO_LOCAL_AGENT_PORT || 4199);
const HOST = '127.0.0.1';
const WORKSPACE_ROOT = path.resolve(process.env.CEO_WORKSPACE_ROOT || 'D:\\AI\\Light');

const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'https://ceo-lilac-nine.vercel.app',
  'https://ceo-flame.vercel.app',
]);

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(origin)) return true;
  if (/^https:\/\/ceo[a-z0-9-]*\.vercel\.app$/i.test(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+-lighting6647s-projects\.vercel\.app$/i.test(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.netlify\.app$/i.test(origin)) return true;
  return false;
}

const SUBAPP_HINTS = new Map([
  ['บัญชี Light', 'accounting-app'],
  ['เทรด Light', 'trading-app'],
  ['All Chat Light', 'omnichannel-chat-app'],
]);

const runningDevProcesses = new Map();

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  res.setHeader('Vary', 'Origin');
  if (isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
}

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

function resolveProjectDir(folderName) {
  if (!folderName || typeof folderName !== 'string') return null;
  const cleanName = folderName.trim();
  if (!cleanName || cleanName.includes('..') || cleanName.includes('/') || cleanName.includes('\\')) {
    return null;
  }
  const baseDir = path.resolve(WORKSPACE_ROOT, cleanName);
  if (!baseDir.startsWith(WORKSPACE_ROOT + path.sep) || !fs.existsSync(baseDir)) {
    return null;
  }

  const subHint = SUBAPP_HINTS.get(cleanName);
  if (subHint) {
    const subDir = path.join(baseDir, subHint);
    if (fs.existsSync(subDir)) return subDir;
  }
  return baseDir;
}

function readPackageScripts(projectDir) {
  const pkgPath = path.join(projectDir, 'package.json');
  if (!fs.existsSync(pkgPath)) return { name: null, scripts: {} };
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return { name: pkg.name || null, scripts: pkg.scripts || {} };
  } catch {
    return { name: null, scripts: {} };
  }
}

function scanWorkspaceProjects() {
  if (!fs.existsSync(WORKSPACE_ROOT)) return [];
  const entries = fs.readdirSync(WORKSPACE_ROOT, { withFileTypes: true }).filter((e) => e.isDirectory());

  return entries
    .map((entry) => {
      const targetDir = resolveProjectDir(entry.name) || path.join(WORKSPACE_ROOT, entry.name);
      const { name: pkgName, scripts } = readPackageScripts(targetDir);
      const hasGit = fs.existsSync(path.join(targetDir, '.git')) || fs.existsSync(path.join(WORKSPACE_ROOT, entry.name, '.git'));
      const hasNodeModules = fs.existsSync(path.join(targetDir, 'node_modules'));

      return {
        folder: entry.name,
        targetDir,
        pkgName,
        hasGit,
        hasNodeModules,
        scripts: Object.keys(scripts),
        devRunning: runningDevProcesses.has(entry.name),
      };
    })
    .sort((a, b) => a.folder.localeCompare(b.folder));
}

async function runAllowlistedAction(folderName, action) {
  const targetDir = resolveProjectDir(folderName);
  if (!targetDir) {
    return { status: 404, body: { ok: false, error: `ไม่พบโฟลเดอร์โปรเจกต์ "${folderName}" ใน ${WORKSPACE_ROOT}` } };
  }

  const { scripts } = readPackageScripts(targetDir);
  const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm';

  if (action === 'git-status') {
    const gitRoot = fs.existsSync(path.join(targetDir, '.git'))
      ? targetDir
      : path.join(WORKSPACE_ROOT, folderName);
    if (!fs.existsSync(path.join(gitRoot, '.git'))) {
      return { status: 200, body: { ok: true, action, folder: folderName, output: 'ยังไม่ได้เชื่อมต่อ Git Repository (.git)' } };
    }
    const { stdout, stderr } = await execFileAsync('git', ['status', '--short', '-b'], {
      cwd: gitRoot,
      timeout: 15_000,
    });
    return { status: 200, body: { ok: true, action, folder: folderName, output: (stdout || stderr || 'Clean working tree').trim() } };
  }

  if (action === 'test' || action === 'build') {
    if (!scripts[action]) {
      return { status: 400, body: { ok: false, error: `โปรเจกต์ "${folderName}" ไม่มี script "${action}" ใน package.json` } };
    }
    const { stdout, stderr } = await execFileAsync(npmBin, ['run', action], {
      cwd: targetDir,
      timeout: 90_000,
      shell: process.platform === 'win32',
    });
    return { status: 200, body: { ok: true, action, folder: folderName, output: (stdout + '\n' + stderr).trim() } };
  }

  if (action === 'dev') {
    const devScript = scripts.dev ? 'dev' : scripts.start ? 'start' : null;
    if (!devScript) {
      return { status: 400, body: { ok: false, error: `โปรเจกต์ "${folderName}" ไม่มี script dev หรือ start` } };
    }
    if (runningDevProcesses.has(folderName)) {
      const existing = runningDevProcesses.get(folderName);
      return { status: 200, body: { ok: true, action, folder: folderName, pid: existing.pid, output: `กำลังรันอยู่แล้ว (PID ${existing.pid})` } };
    }

    const child = spawn(npmBin, ['run', devScript], {
      cwd: targetDir,
      shell: process.platform === 'win32',
      stdio: 'ignore',
      detached: false,
    });
    runningDevProcesses.set(folderName, child);
    child.on('exit', () => runningDevProcesses.delete(folderName));

    return {
      status: 200,
      body: {
        ok: true,
        action,
        folder: folderName,
        pid: child.pid,
        output: `เริ่มรัน "npm run ${devScript}" ใน ${targetDir} เรียบร้อย (PID ${child.pid})`,
      },
    };
  }

  if (action === 'stop-dev') {
    const child = runningDevProcesses.get(folderName);
    if (!child) {
      return { status: 200, body: { ok: true, action, folder: folderName, output: 'ไม่มีโปรเซส dev ที่เปิดจาก Bridge อยู่' } };
    }
    child.kill();
    runningDevProcesses.delete(folderName);
    return { status: 200, body: { ok: true, action, folder: folderName, output: `หยุดโปรเซสของ "${folderName}" เรียบร้อย` } };
  }

  return { status: 400, body: { ok: false, error: `ไม่อนุญาตคำสั่ง "${action}"` } };
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 64_000) reject(new Error('Payload too large'));
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

async function runChiefPy(args = []) {
  if (!fs.existsSync(CHIEF_SCRIPT_PATH)) {
    throw new Error(`ไม่พบไฟล์ ${CHIEF_SCRIPT_PATH}`);
  }
  const { stdout } = await execFileAsync(PYTHON_BIN, [CHIEF_SCRIPT_PATH, ...args, '--json'], {
    cwd: path.dirname(CHIEF_SCRIPT_PATH),
    timeout: 45_000,
    maxBuffer: 4 * 1024 * 1024,
    env: {
      ...process.env,
      PYTHONIOENCODING: 'utf-8',
      PYTHONUTF8: '1',
    },
  });
  return JSON.parse((stdout || '{}').trim());
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const reqUrl = new URL(req.url || '/', `http://${HOST}:${PORT}`);

  if (req.method === 'GET' && reqUrl.pathname === '/health') {
    const projects = scanWorkspaceProjects();
    return sendJson(res, 200, {
      ok: true,
      service: 'jarvis-local-control-bridge',
      workspaceRoot: WORKSPACE_ROOT,
      projectCount: projects.length,
      runningDevCount: runningDevProcesses.size,
    });
  }

  if (req.method === 'GET' && reqUrl.pathname === '/projects') {
    return sendJson(res, 200, {
      ok: true,
      workspaceRoot: WORKSPACE_ROOT,
      projects: scanWorkspaceProjects(),
    });
  }

  if (req.method === 'GET' && reqUrl.pathname === '/batch-git-status') {
    const gitProjects = scanWorkspaceProjects().filter((p) => p.hasGit);
    const results = await Promise.all(
      gitProjects.map(async (p) => {
        try {
          const r = await runAllowlistedAction(p.folder, 'git-status');
          return { folder: p.folder, ok: true, output: r.body?.output || '' };
        } catch (err) {
          return { folder: p.folder, ok: false, output: err instanceof Error ? err.message : 'Failed' };
        }
      })
    );
    return sendJson(res, 200, {
      ok: true,
      totalGitRepos: gitProjects.length,
      results,
    });
  }

  if (req.method === 'POST' && reqUrl.pathname === '/action') {
    try {
      const { folder, action } = await readJsonBody(req);
      const result = await runAllowlistedAction(folder, action);
      return sendJson(res, result.status, result.body);
    } catch (error) {
      return sendJson(res, 500, {
        ok: false,
        error: error instanceof Error ? error.message : 'Execution failed',
      });
    }
  }

  // J.A.R.V.I.S. x JEV Agent Router Endpoints (chief.py)
  if (req.method === 'GET' && reqUrl.pathname === '/router/state') {
    try {
      const data = await runChiefPy(['--status']);
      return sendJson(res, 200, data);
    } catch (error) {
      return sendJson(res, 500, {
        ok: false,
        error: error instanceof Error ? error.message : 'ไม่สามารถอ่านสถานะ Router ได้',
      });
    }
  }

  if (req.method === 'POST' && reqUrl.pathname === '/router/dispatch') {
    try {
      const { goal, live, gate, runSampleBatch } = await readJsonBody(req);
      const args = [];
      if (!runSampleBatch) {
        if (!goal || typeof goal !== 'string' || !goal.trim()) {
          return sendJson(res, 400, { ok: false, error: 'กรุณาระบุเป้าหมาย (goal) ก่อนสั่งรัน Router' });
        }
        args.push('--goal', goal.trim());
      }
      if (live) args.push('--live');
      const gateNum = Number(gate);
      if (Number.isFinite(gateNum) && gateNum >= 0.5 && gateNum <= 0.99) {
        args.push('--gate', String(gateNum));
      }
      const data = await runChiefPy(args);
      return sendJson(res, 200, data);
    } catch (error) {
      return sendJson(res, 500, {
        ok: false,
        error: error instanceof Error ? error.message : 'Dispatch failed',
      });
    }
  }

  if (req.method === 'POST' && reqUrl.pathname === '/router/approve') {
    try {
      const { jobId, target, live } = await readJsonBody(req);
      if (!jobId || !/^[a-f0-9]+$/i.test(String(jobId))) {
        return sendJson(res, 400, { ok: false, error: 'รหัส jobId ไม่ถูกต้อง' });
      }
      const safeTarget = target === 'write' ? 'write' : 'research';
      const args = ['--approve', String(jobId), '--target', safeTarget];
      if (live) args.push('--live');
      const data = await runChiefPy(args);
      return sendJson(res, 200, data);
    } catch (error) {
      return sendJson(res, 500, {
        ok: false,
        error: error instanceof Error ? error.message : 'Approval failed',
      });
    }
  }

  if (req.method === 'POST' && reqUrl.pathname === '/router/reject') {
    try {
      const { jobId } = await readJsonBody(req);
      if (!jobId || !/^[a-f0-9]+$/i.test(String(jobId))) {
        return sendJson(res, 400, { ok: false, error: 'รหัส jobId ไม่ถูกต้อง' });
      }
      const data = await runChiefPy(['--reject', String(jobId)]);
      return sendJson(res, 200, data);
    } catch (error) {
      return sendJson(res, 500, {
        ok: false,
        error: error instanceof Error ? error.message : 'Reject failed',
      });
    }
  }

  if (req.method === 'POST' && reqUrl.pathname === '/router/reset') {
    try {
      const data = await runChiefPy(['--clear-queue']);
      return sendJson(res, 200, data);
    } catch (error) {
      return sendJson(res, 500, {
        ok: false,
        error: error instanceof Error ? error.message : 'Reset failed',
      });
    }
  }

  return sendJson(res, 404, { ok: false, error: 'Not Found' });
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.log(`[J.A.R.V.I.S. Local Control Bridge] พอร์ต ${PORT} กำลังทำงานอยู่แล้วครับ (http://${HOST}:${PORT}) พร้อมใช้งานบนหน้าเว็บทันที`);
    process.exit(0);
  }
  console.error('[Local Bridge Error]', err);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`[J.A.R.V.I.S. Local Control Bridge] Listening on http://localhost:${PORT} (and http://127.0.0.1:${PORT})`);
  console.log(`[Workspace] Monitoring ${WORKSPACE_ROOT}`);
});

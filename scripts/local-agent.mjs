#!/usr/bin/env node
// J.A.R.V.I.S. Local Control Bridge (scripts/local-agent.mjs)
// Binds ONLY to 127.0.0.1:4199 and exposes allowlisted project inspection & execution
// for D:\AI\Light projects from the CEO Hub web UI.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

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

const SUBAPP_HINTS = new Map([
  ['บัญชี Light', 'accounting-app'],
  ['เทรด Light', 'trading-app'],
  ['All Chat Light', 'omnichannel-chat-app'],
]);

const runningDevProcesses = new Map();

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (origin && (ALLOWED_ORIGINS.has(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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

/**
 * Unified JEV Agent Router Client
 * Automatically routes between:
 *   1) Local Control Bridge (http://localhost:4199 or custom tunnel URL)
 *   2) Vercel Cloud Serverless (/api/jev-router) when away from PC / on mobile
 */

const BRIDGE_CANDIDATES = ['http://localhost:4199', 'http://127.0.0.1:4199'];
const CLOUD_STATE_KEY = 'ceo.jev.cloudState.v1';
const CUSTOM_BRIDGE_KEY = 'ceo.jev.customBridgeUrl';

export function getCustomBridgeUrl() {
  if (typeof window === 'undefined') return '';
  try {
    return (localStorage.getItem(CUSTOM_BRIDGE_KEY) || '').trim().replace(/\/+$/, '');
  } catch {
    return '';
  }
}

export function setCustomBridgeUrl(url) {
  if (typeof window === 'undefined') return '';
  const clean = String(url || '').trim().replace(/\/+$/, '');
  try {
    if (clean) localStorage.setItem(CUSTOM_BRIDGE_KEY, clean);
    else localStorage.removeItem(CUSTOM_BRIDGE_KEY);
  } catch {
    // ignore storage errors
  }
  return clean;
}

export function createEmptyRouterState(gateThreshold = 0.85) {
  return {
    queueRoot: 'vercel-cloud://jev_router_queue',
    gateThreshold,
    queueCounts: { research: 0, write: 0, review: 0 },
    awaitingApprovalCount: 0,
    jobs: [],
    runLog: [],
    workers: { w1: 0, w2: 0, w3: 0, w4: 0, w5: 0, w6: 0, w7: 0, w8: 0 },
    telemetry: {
      nodes: 18,
      edges: 36,
      busReaders: 14,
      decisions: 0,
      heldAtGate: 0,
      avgLatencyMs: 0,
      totalCostUsd: 0,
    },
  };
}

export function loadCloudRouterState() {
  if (typeof window === 'undefined') return createEmptyRouterState();
  try {
    const raw = localStorage.getItem(CLOUD_STATE_KEY);
    if (!raw) return createEmptyRouterState();
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.jobs)) {
      return parsed;
    }
    return createEmptyRouterState();
  } catch {
    return createEmptyRouterState();
  }
}

export function saveCloudRouterState(state) {
  if (typeof window === 'undefined' || !state) return;
  try {
    localStorage.setItem(CLOUD_STATE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

export async function discoverRouterBackend() {
  const custom = getCustomBridgeUrl();
  const candidates = custom ? [custom, ...BRIDGE_CANDIDATES] : BRIDGE_CANDIDATES;

  for (const candidate of candidates) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1600);
    try {
      const res = await fetch(`${candidate}/health`, { method: 'GET', signal: controller.signal });
      if (res.ok) {
        const data = await res.json();
        if (data?.ok) {
          clearTimeout(timer);
          return { mode: 'local', baseUrl: candidate, custom: candidate === custom };
        }
      }
    } catch {
      // try next
    } finally {
      clearTimeout(timer);
    }
  }

  // Fallback to Vercel Serverless Cloud Router (/api/jev-router)
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    const res = await fetch('/api/jev-router', { method: 'GET', signal: controller.signal });
    const ct = res.headers.get('content-type') || '';
    if (res.ok && ct.includes('application/json')) {
      const data = await res.json();
      if (data?.ok) {
        clearTimeout(timer);
        return { mode: 'cloud', baseUrl: '/api/jev-router', custom: false };
      }
    }
  } catch {
    // offline
  } finally {
    clearTimeout(timer);
  }

  return { mode: 'offline', baseUrl: '', custom: false };
}

export async function fetchRouterStateFromBackend(backend) {
  if (backend.mode === 'local') {
    const res = await fetch(`${backend.baseUrl}/router/state`, { method: 'GET' });
    const data = await res.json();
    if (!data?.ok) throw new Error(data?.error || 'ไม่สามารถอ่านสถานะ Local Router ได้');
    return data.state;
  }
  if (backend.mode === 'cloud') {
    return loadCloudRouterState();
  }
  throw new Error('Router offline');
}

async function postCloudRouter(body) {
  const currentState = loadCloudRouterState();
  const res = await fetch('/api/jev-router', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, currentState }),
  });
  const data = await res.json();
  if (!data?.ok) throw new Error(data?.error || 'Cloud Router request failed');
  if (data.state) saveCloudRouterState(data.state);
  return data;
}

export async function dispatchRouterGoal(backend, payload) {
  if (backend.mode === 'local') {
    const res = await fetch(`${backend.baseUrl}/router/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data?.ok) throw new Error(data?.error || 'Local dispatch failed');
    return data;
  }
  if (backend.mode === 'cloud') {
    return postCloudRouter({ action: 'dispatch', ...payload });
  }
  throw new Error('Router offline');
}

export async function approveRouterJob(backend, payload) {
  if (backend.mode === 'local') {
    const res = await fetch(`${backend.baseUrl}/router/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data?.ok) throw new Error(data?.error || 'Local approve failed');
    return data;
  }
  if (backend.mode === 'cloud') {
    return postCloudRouter({ action: 'approve', ...payload });
  }
  throw new Error('Router offline');
}

export async function rejectRouterJob(backend, payload) {
  if (backend.mode === 'local') {
    const res = await fetch(`${backend.baseUrl}/router/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data?.ok) throw new Error(data?.error || 'Local reject failed');
    return data;
  }
  if (backend.mode === 'cloud') {
    return postCloudRouter({ action: 'reject', ...payload });
  }
  throw new Error('Router offline');
}

export async function resetRouterQueue(backend) {
  if (backend.mode === 'local') {
    const res = await fetch(`${backend.baseUrl}/router/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    const data = await res.json();
    if (!data?.ok) throw new Error(data?.error || 'Local reset failed');
    return data;
  }
  if (backend.mode === 'cloud') {
    const cleared = createEmptyRouterState();
    saveCloudRouterState(cleared);
    return { ok: true, state: cleared };
  }
  throw new Error('Router offline');
}

// Vercel Serverless Function: J.A.R.V.I.S. x JEV Agent Router (Cloud Mode)
// Enables full JEV System-One Routing (Choice / Score / Noul), Gate >= 0.85,
// Live DuckDuckGo + Wikipedia Research Worker, LLM/Synthesized Writer, and Human Approval
// directly from https://ceo-lilac-nine.vercel.app/ (even from mobile away from PC).

const QUEUES = ['research', 'write', 'review'];
const WORKER_COUNT = 8;

const SAMPLE_TASKS = [
  {
    goal: 'รวบรวมข้อมูลคู่แข่งระบบ POS และ Cloud Inventory ล่าสุด',
    notes: ['ยังไม่มีตารางเปรียบเทียบราคา'],
    evidence_count: 0,
    gaps_count: 3,
    last_error: '',
  },
  {
    goal: 'เขียนบทความสรุปจุดเด่น JEV Agent Router จากหลักฐานที่เก็บครบแล้ว',
    notes: ['มีผลการทดสอบความเร็วและต้นทุนครบถ้วน'],
    evidence_count: 6,
    gaps_count: 0,
    last_error: '',
  },
  {
    goal: 'ปรับปรุงหน้าเว็บ',
    notes: ['ยังไม่ระบุหน้าและเกณฑ์วัดผลชัดเจน'],
    evidence_count: 1,
    gaps_count: 1,
    last_error: '',
  },
  {
    goal: 'ลบฐานข้อมูล production ทั้งหมดแล้วรันสคริปต์ใหม่ทันที',
    notes: ['คำสั่งมีความเสี่ยงสูงต่อข้อมูลจริง'],
    evidence_count: 0,
    gaps_count: 1,
    last_error: 'PermissionGuard: destructive intent',
  },
];

function nowTime() {
  return new Date().toLocaleTimeString('en-GB', { hour12: false, timeZone: 'Asia/Bangkok' });
}

function nowIso() {
  return new Date().toISOString().slice(0, 19);
}

function makeJobId() {
  return Math.random().toString(16).slice(2, 12).padEnd(10, '0');
}

function emptyState(gateThreshold = 0.85) {
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

function recomputeState(state, gateThreshold = 0.85) {
  const jobs = Array.isArray(state?.jobs) ? state.jobs.slice(0, 40) : [];
  const queueCounts = { research: 0, write: 0, review: 0 };
  let awaitingApprovalCount = 0;
  let heldAtGate = 0;
  let totalCostUsd = 0;
  let latencySum = 0;
  let latencyCount = 0;

  for (const job of jobs) {
    if (job.status !== 'rejected' && QUEUES.includes(job.destination)) {
      queueCounts[job.destination] += 1;
    }
    if (job.status === 'awaiting_approval') awaitingApprovalCount += 1;
    if (!job.gate_passed) heldAtGate += 1;
    if (job.decision) {
      totalCostUsd += Number(job.decision.cost_usd || 0);
      latencySum += Number(job.decision.latency_ms || 0);
      latencyCount += 1;
    }
  }

  return {
    queueRoot: 'vercel-cloud://jev_router_queue',
    gateThreshold,
    queueCounts,
    awaitingApprovalCount,
    jobs,
    runLog: Array.isArray(state?.runLog) ? state.runLog.slice(0, 60) : [],
    workers: state?.workers || { w1: 0, w2: 0, w3: 0, w4: 0, w5: 0, w6: 0, w7: 0, w8: 0 },
    telemetry: {
      nodes: 18,
      edges: 36,
      busReaders: 14,
      decisions: jobs.length,
      heldAtGate,
      avgLatencyMs: latencyCount ? Number((latencySum / latencyCount).toFixed(2)) : 0,
      totalCostUsd: Number(totalCostUsd.toFixed(6)),
    },
  };
}

function pushLog(state, level, message, meta = {}) {
  state.runLog = [
    { ts: nowTime(), iso: nowIso(), level, message, meta },
    ...(state.runLog || []),
  ].slice(0, 60);
}

function computeModelTier(choice, urgency, safeToRun) {
  if (!safeToRun || choice === 'stop') return 'halt';
  if (urgency === 'high' || urgency === 'critical' || choice === 'write') return 'pro-tier';
  return 'fast-tier';
}

function decideLocalSystemOne(stateIn) {
  const t0 = performance.now();
  const text = `${stateIn.goal} ${(stateIn.notes || []).join(' ')} ${stateIn.last_error || ''}`.toLowerCase();
  const dangerous = /(?:ลบฐานข้อมูล|drop\s+table|rm\s+-rf|format|destructive|password|secret|ลบข้อมูลทั้งหมด)/i.test(text);
  const safeToRun = !dangerous;
  const safeProbability = safeToRun ? 0.97 : 0.12;

  let urgency = 'low';
  let urgencyConfidence = 0.88;
  if (/(?:ด่วน|critical|production|พัง|crash)/i.test(text)) {
    urgency = 'critical';
    urgencyConfidence = 0.96;
  } else if ((stateIn.gaps_count || 0) >= 2 || /(?:คู่แข่ง|research|ค้นหา|วิจัย|วิเคราะห์|ข่าว|ราคา)/i.test(text)) {
    urgency = 'high';
    urgencyConfidence = 0.92;
  } else if ((stateIn.evidence_count || 0) >= 4 || /(?:เขียน|บทความ|สรุป|draft|write)/i.test(text)) {
    urgency = 'medium';
    urgencyConfidence = 0.9;
  }

  const writeHints = /(?:เขียน|บทความ|สรุป|ร่าง|draft|write|report|proposal)/i;
  const researchHints = /(?:ค้นหา|วิจัย|วิเคราะห์|คู่แข่ง|ราคา|ข่าว|ข้อมูล|search|research|market|trend)/i;

  let choice = 'write';
  let choiceConfidence = 0.71;
  if (!safeToRun) {
    choice = 'review';
    choiceConfidence = 0.95;
  } else if ((stateIn.evidence_count || 0) >= 4 && (stateIn.gaps_count || 0) === 0) {
    choice = 'write';
    choiceConfidence = 0.94;
  } else if (writeHints.test(text) && !researchHints.test(text)) {
    choice = 'write';
    choiceConfidence = 0.9;
  } else if (researchHints.test(text) || (((stateIn.evidence_count || 0) === 0 || (stateIn.gaps_count || 0) >= 2) && stateIn.goal.trim().length > 20)) {
    choice = 'research';
    choiceConfidence = 0.91;
  }

  return {
    choice,
    choice_confidence: choiceConfidence,
    urgency,
    urgency_confidence: urgencyConfidence,
    safe_to_run: safeToRun,
    safe_probability: safeProbability,
    latency_ms: Number(Math.max(1.0, performance.now() - t0 + 2.4).toFixed(2)),
    cost_usd: 0.000003,
    engine: 'cloud-system-one',
    model_tier: computeModelTier(choice, urgency, safeToRun),
  };
}

async function decideSystemOne(stateIn, useLive) {
  const openRouterKey = (process.env.OPENROUTER_API_KEY || '').trim();
  const geminiKey = (process.env.GEMINI_API_KEY || '').trim();

  if (useLive && openRouterKey) {
    const t0 = performance.now();
    try {
      const resp = await fetch('https://openrouter.ai/api/v1/systemone', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(6000),
        body: JSON.stringify({
          model: process.env.JEV_MODEL || '~typesafe/jev-latest',
          state: stateIn,
          questions: {
            next_worker: {
              type: 'choice',
              instructions: 'Choose the next step.',
              criteria: {
                research: 'Collect evidence.',
                write: 'Draft from evidence.',
                review: 'Unless is done.',
                stop: 'Halt when finished or unsafe.',
              },
            },
            urgency: {
              type: 'score',
              instructions: 'Evaluate urgency.',
              criteria: ['low', 'medium', 'high', 'critical'],
            },
            safe_to_run: {
              type: 'noul',
              instructions: 'Verify task is safe to execute automatically.',
              criteria: {
                false: 'Destructive, unsafe, or leaks secrets.',
                true: 'Safe read, research, or drafting task.',
              },
            },
          },
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        const cw = data.choices?.next_worker || {};
        const sc = data.scores?.urgency || {};
        const nl = data.nouls?.safe_to_run || {};
        const choice = QUEUES.includes(cw.choice) || cw.choice === 'stop' ? cw.choice : 'review';
        const urgency = ['low', 'medium', 'high', 'critical'].includes(sc.score) ? sc.score : 'medium';
        const pYes = Number(nl.noul ?? 0.9);
        const safe = pYes >= 0.5;
        return {
          choice,
          choice_confidence: Number(Number(cw.confidence ?? 0.85).toFixed(2)),
          urgency,
          urgency_confidence: Number(Number(sc.confidence ?? 0.85).toFixed(2)),
          safe_to_run: safe,
          safe_probability: Number(pYes.toFixed(2)),
          latency_ms: Number((performance.now() - t0).toFixed(2)),
          cost_usd: 0.000003,
          engine: 'openrouter-jev-systemone',
          model_tier: computeModelTier(choice, urgency, safe),
        };
      }
    } catch {
      // fall through
    }
  }

  if (useLive && geminiKey) {
    const t0 = performance.now();
    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${encodeURIComponent(geminiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(8000),
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text:
                      'Classify this state strictly into JSON: {"choice":"research|write|review","choice_confidence":0.0-1.0,"urgency":"low|medium|high|critical","urgency_confidence":0.0-1.0,"safe_to_run":true|false,"safe_probability":0.0-1.0}.\nState: ' +
                      JSON.stringify(stateIn),
                  },
                ],
              },
            ],
            generationConfig: { responseMimeType: 'application/json', temperature: 0 },
          }),
        }
      );
      if (resp.ok) {
        const data = await resp.json();
        const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const parsed = JSON.parse(raw);
        const choice = QUEUES.includes(parsed.choice) ? parsed.choice : 'review';
        const urgency = ['low', 'medium', 'high', 'critical'].includes(parsed.urgency) ? parsed.urgency : 'medium';
        const safe = Boolean(parsed.safe_to_run ?? true);
        return {
          choice,
          choice_confidence: Number(Number(parsed.choice_confidence ?? 0.85).toFixed(2)),
          urgency,
          urgency_confidence: Number(Number(parsed.urgency_confidence ?? 0.85).toFixed(2)),
          safe_to_run: safe,
          safe_probability: Number(Number(parsed.safe_probability ?? 0.95).toFixed(2)),
          latency_ms: Number((performance.now() - t0).toFixed(2)),
          cost_usd: 0.000015,
          engine: 'gemini-2.5-flash-lite',
          model_tier: computeModelTier(choice, urgency, safe),
        };
      }
    } catch {
      // fall through
    }
  }

  return decideLocalSystemOne(stateIn);
}

async function searchDuckDuckGoAndWiki(query, limit = 5) {
  const cleanQ = String(query || '').trim();
  const sources = [];
  const errors = [];

  try {
    const ddgRes = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(cleanQ)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept-Language': 'th,en;q=0.9',
      },
      signal: AbortSignal.timeout(7000),
    });
    if (ddgRes.ok) {
      const html = await ddgRes.text();
      const regex = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?(?:<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>)?/gi;
      let match;
      while ((match = regex.exec(html)) !== null && sources.length < limit) {
        let href = match[1].replace(/&amp;/g, '&');
        if (href.includes('uddg=')) {
          const m = href.match(/uddg=([^&]+)/);
          if (m) href = decodeURIComponent(m[1]);
        }
        if (!href.startsWith('http')) continue;
        const title = match[2].replace(/<[^>]+>/g, '').trim();
        const snippet = (match[3] || '').replace(/<[^>]+>/g, '').trim();
        let domain = '';
        try {
          domain = new URL(href).hostname;
        } catch {
          domain = '';
        }
        if (title) {
          sources.push({
            provider: 'duckduckgo',
            title,
            url: href,
            domain,
            snippet: snippet || `Result from ${domain}`,
          });
        }
      }
    }
  } catch (err) {
    errors.push(`DuckDuckGo: ${err instanceof Error ? err.message : 'failed'}`);
  }

  const topic = cleanQ.replace(/^(รวบรวมข้อมูล|ค้นหา|หาข้อมูล|วิเคราะห์|สรุป|คืออะไร|เกี่ยวกับ)\s*/i, '').trim() || cleanQ;
  for (const lang of ['th', 'en']) {
    if (sources.length >= limit) break;
    try {
      const wRes = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`, {
        headers: { 'User-Agent': 'JarvisAgentRouter/1.0' },
        signal: AbortSignal.timeout(5000),
      });
      if (wRes.ok) {
        const wdata = await wRes.json();
        const pageUrl = wdata?.content_urls?.desktop?.page || '';
        const extract = (wdata?.extract || '').trim();
        if (extract && wdata?.type !== 'disambiguation' && pageUrl && !sources.some((s) => s.url === pageUrl)) {
          sources.push({
            provider: `wikipedia-${lang}`,
            title: wdata.title || topic,
            url: pageUrl,
            domain: `${lang}.wikipedia.org`,
            snippet: extract.length > 260 ? `${extract.slice(0, 260)}...` : extract,
          });
          break;
        }
      }
    } catch {
      // ignore wiki fallback miss
    }
  }

  return { query: cleanQ, sources: sources.slice(0, limit), errors };
}

async function synthesizeDraft(goal, notes, sources, useLive) {
  const geminiKey = useLive ? (process.env.GEMINI_API_KEY || '').trim() : '';
  if (geminiKey) {
    try {
      const evidenceLines = sources.slice(0, 5).map((s) => `- ${s.title} (${s.domain}): ${s.snippet}`).join('\n');
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${encodeURIComponent(geminiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(9000),
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `เขียนบทสรุปผู้บริหารสั้น กระชับ เป็นภาษาไทย:\nเป้าหมาย: ${goal}\nบันทึก: ${(notes || []).join(', ')}\nหลักฐาน:\n${evidenceLines}`,
                  },
                ],
              },
            ],
          }),
        }
      );
      if (resp.ok) {
        const data = await resp.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) return { draft: text, engine: 'gemini-2.5-flash-lite' };
      }
    } catch {
      // fall back
    }
  }

  const lines = [`### สรุปร่างเอกสาร: ${goal}`];
  if (notes?.length) lines.push(`- บริบทตั้งต้น: ${notes.join('; ')}`);
  if (sources?.length) {
    lines.push(`- อ้างอิงหลักฐานจริง (${sources.length} แหล่ง):`);
    for (const s of sources.slice(0, 4)) {
      lines.push(`  • [${s.title}](${s.url}) — ${s.snippet.slice(0, 140)}`);
    }
  } else {
    lines.push('- สถานะ: ร่างจากคลังข้อมูลภายใน (พร้อมให้ผู้ตรวจทานอนุมัติหรือสั่ง Research เพิ่ม)');
  }
  return { draft: lines.join('\n'), engine: 'cloud-draft-synthesizer' };
}

async function executeJob(job, state, workerId, useLive) {
  if (job.destination === 'review' && job.status !== 'approved_for_execution') {
    return {
      worker: workerId,
      job_id: job.job_id,
      destination: 'review',
      status: job.status,
      goal: job.state.goal,
      result: `Held at Human Review (${job.hold_reason || 'awaiting approval'})`,
    };
  }

  state.workers[workerId] = (state.workers[workerId] || 0) + 1;
  job.worker_id = workerId;
  job.updated_at = nowIso();

  if (job.destination === 'research') {
    const res = await searchDuckDuckGoAndWiki(job.state.goal, 5);
    job.state.evidence_count = res.sources.length;
    if (res.sources.length > 0) job.state.gaps_count = 0;
    job.status = 'completed';
    job.worker_output = {
      type: 'research',
      provider: 'DuckDuckGo + Wikipedia (Cloud)',
      source_count: res.sources.length,
      sources: res.sources,
      errors: res.errors,
      summary: res.sources.length
        ? `เก็บหลักฐานจริง ${res.sources.length} แหล่งจากเว็บสำเร็จ`
        : `ไม่พบผลลัพธ์จากเว็บ (${res.errors.join('; ') || 'empty'})`,
    };
    pushLog(state, 'research', `[${workerId}] research web-search -> ${res.sources.length} sources (${job.job_id})`, {
      job_id: job.job_id,
      worker: workerId,
    });
    return {
      worker: workerId,
      job_id: job.job_id,
      destination: 'research',
      status: 'completed',
      goal: job.state.goal,
      result: job.worker_output.summary,
    };
  }

  if (job.destination === 'write') {
    let sources = job.worker_output?.sources || [];
    if (!sources.length && (job.state.evidence_count || 0) === 0) {
      const res = await searchDuckDuckGoAndWiki(job.state.goal, 3);
      sources = res.sources;
      job.state.evidence_count = sources.length;
    }
    const { draft, engine } = await synthesizeDraft(job.state.goal, job.state.notes, sources, useLive);
    job.status = 'completed';
    job.worker_output = {
      type: 'write',
      engine,
      sources,
      draft,
      summary: `ร่างเนื้อหาสำเร็จด้วย ${engine} (${draft.length} chars)`,
    };
    pushLog(state, 'write', `[${workerId}] llm draft after gate (${engine}) -> ${job.job_id}`, {
      job_id: job.job_id,
      worker: workerId,
    });
    return {
      worker: workerId,
      job_id: job.job_id,
      destination: 'write',
      status: 'completed',
      goal: job.state.goal,
      result: job.worker_output.summary,
    };
  }

  return { worker: workerId, job_id: job.job_id, destination: job.destination, status: job.status, goal: job.state.goal, result: 'No-op' };
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      mode: 'vercel-cloud',
      service: 'jarvis-jev-cloud-router',
      runtime: process.env.VERCEL ? 'vercel-serverless' : 'local-node',
      capabilities: ['system-one-router', 'duckduckgo-research', 'human-approval', 'write-synthesizer'],
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const action = body.action || 'dispatch';
    const gateThreshold = Number.isFinite(Number(body.gate)) ? Math.min(0.99, Math.max(0.5, Number(body.gate))) : 0.85;
    const useLive = Boolean(body.live);
    const state = recomputeState(body.currentState || emptyState(gateThreshold), gateThreshold);

    if (action === 'reset') {
      return res.status(200).json({ ok: true, mode: 'vercel-cloud', state: emptyState(gateThreshold) });
    }

    if (action === 'approve') {
      const job = state.jobs.find((j) => j.job_id === body.jobId);
      if (!job) return res.status(404).json({ ok: false, error: `ไม่พบงาน ${body.jobId}` });
      const target = body.target === 'write' ? 'write' : 'research';
      job.destination = target;
      job.status = 'approved_for_execution';
      job.approved_by = 'คุณไลท์';
      job.approved_at = nowIso();
      pushLog(state, 'approve', `human approve (คุณไลท์) -> promoted ${job.job_id} to queue/${target}`);
      const totalRuns = Object.values(state.workers).reduce((a, b) => a + b, 0);
      const wid = `w${(totalRuns % WORKER_COUNT) + 1}`;
      const workerResult = await executeJob(job, state, wid, useLive);
      return res.status(200).json({ ok: true, mode: 'vercel-cloud', workerResult, state: recomputeState(state, gateThreshold) });
    }

    if (action === 'reject') {
      const job = state.jobs.find((j) => j.job_id === body.jobId);
      if (!job) return res.status(404).json({ ok: false, error: `ไม่พบงาน ${body.jobId}` });
      job.status = 'rejected';
      job.rejected_by = 'คุณไลท์';
      job.rejected_at = nowIso();
      job.updated_at = nowIso();
      pushLog(state, 'reject', `human reject (คุณไลท์) -> halted ${job.job_id} in queue/review`);
      return res.status(200).json({ ok: true, mode: 'vercel-cloud', rejected: job, state: recomputeState(state, gateThreshold) });
    }

    // Dispatch (single goal or 4-sample batch)
    const tasks = body.runSampleBatch
      ? SAMPLE_TASKS
      : [
          {
            goal: String(body.goal || '').trim(),
            notes: ['ส่งคำสั่งจาก CEO Hub Mobile/Web'],
            evidence_count: 0,
            gaps_count: 2,
            last_error: '',
          },
        ];

    if (!body.runSampleBatch && !tasks[0].goal) {
      return res.status(400).json({ ok: false, error: 'กรุณาระบุเป้าหมาย (goal) ก่อนส่งเข้า Router' });
    }

    const baseOffset = Object.values(state.workers).reduce((a, b) => a + b, 0);
    const createdJobs = [];

    for (const task of tasks) {
      const decision = await decideSystemOne(task, useLive);
      const gatePassed =
        decision.safe_to_run &&
        decision.safe_probability >= gateThreshold &&
        decision.choice_confidence >= gateThreshold &&
        (decision.choice === 'research' || decision.choice === 'write');
      const destination = gatePassed ? decision.choice : 'review';

      let holdReason = '';
      if (!decision.safe_to_run || decision.safe_probability < gateThreshold) {
        holdReason = `Safety gate blocked (safe=${decision.safe_to_run}, p_yes=${decision.safe_probability.toFixed(2)})`;
      } else if (decision.choice_confidence < gateThreshold) {
        holdReason = `Low confidence (${decision.choice_confidence.toFixed(2)} < ${gateThreshold.toFixed(2)})`;
      } else if (destination === 'review') {
        holdReason = 'Routed directly to review queue';
      }

      const job = {
        job_id: makeJobId(),
        destination,
        status: gatePassed ? 'queued' : 'awaiting_approval',
        gate_passed: gatePassed,
        gate_threshold: gateThreshold,
        hold_reason: holdReason,
        state: task,
        decision,
        worker_output: null,
        created_at: nowIso(),
        updated_at: nowIso(),
      };

      state.jobs.unshift(job);
      createdJobs.push(job);
      pushLog(
        state,
        'info',
        `ask Choice next.worker -> ${decision.choice} (${decision.choice_confidence.toFixed(2)}, ${decision.latency_ms}ms)`
      );
      if (gatePassed) {
        pushLog(state, 'ok', `gate ok -> queue/${destination} | saved ${job.job_id}.json`);
      } else {
        pushLog(state, 'hold', `gate hold -> queue/review (${holdReason}) | awaiting คุณไลท์ approve`);
      }
    }

    const workerResults = await Promise.all(
      createdJobs.map((job, idx) => {
        const wid = `w${((baseOffset + idx) % WORKER_COUNT) + 1}`;
        return executeJob(job, state, wid, useLive);
      })
    );

    return res.status(200).json({
      ok: true,
      mode: 'vercel-cloud',
      workerResults,
      state: recomputeState(state, gateThreshold),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Cloud router execution failed',
    });
  }
}

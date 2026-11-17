#!/usr/bin/env python3
"""
J.A.R.V.I.S. x JEV Agent Router (chief.py)
Real runnable System-One Router + File Queue + Real DuckDuckGo/Wiki Research Worker
+ Human-in-the-Loop Approval Gate + 8-Worker Parallel Dispatcher.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import html
import json
import os
import re
import sys
import tempfile
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any
from uuid import uuid4

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

QUEUES = ("research", "write", "review")
WORKER_COUNT = 8


@dataclass(frozen=True)
class Choice:
    """Typed choice primitive matching JEV's Choice(instructions, criteria)."""

    instructions: str
    criteria: dict[str, str]


@dataclass(frozen=True)
class Score:
    """Typed ordinal score primitive matching JEV's Score(levels)."""

    levels: list[str]


@dataclass(frozen=True)
class Noul:
    """Typed boolean safety gate primitive matching TypeSafe JEV's Noul()."""

    instructions: str = "Verify task is safe to execute automatically."


# Backwards-compatible alias
Bool = Noul


@dataclass
class DecisionResult:
    """Structured output returned by the System-One decision layer."""

    choice: str
    choice_confidence: float
    urgency: str
    urgency_confidence: float
    safe_to_run: bool
    safe_probability: float
    latency_ms: float
    cost_usd: float
    engine: str
    model_tier: str = "fast-tier"


@dataclass
class StateIn:
    """01 STATE IN payload fed into the State Bus."""

    goal: str
    notes: list[str] = field(default_factory=list)
    plan: list[str] = field(default_factory=list)
    evidence_count: int = 0
    gaps_count: int = 0
    last_error: str = ""


DEFAULT_QUESTIONS = {
    "next.worker": Choice(
        instructions="Choose the next step.",
        criteria={
            "research": "Collect evidence.",
            "write": "Draft from evidence.",
            "review": "Unless is done.",
            "stop": "Halt when finished or unsafe.",
        },
    ),
    "urgency": Score(["low", "medium", "high", "critical"]),
    "safe.to.run": Noul("Block destructive commands, secrets exposure, or unverified actions."),
}

SAMPLE_TASKS = [
    StateIn(
        goal="รวบรวมข้อมูลคู่แข่งระบบ POS และ Cloud Inventory ล่าสุด",
        notes=["ยังไม่มีตารางเปรียบเทียบราคา"],
        evidence_count=0,
        gaps_count=3,
    ),
    StateIn(
        goal="เขียนบทความสรุปจุดเด่น JEV Agent Router จากหลักฐานที่เก็บครบแล้ว",
        notes=["มีผลการทดสอบความเร็วและต้นทุนครบถ้วน"],
        evidence_count=6,
        gaps_count=0,
    ),
    StateIn(
        goal="ปรับปรุงหน้าเว็บ",
        notes=["ยังไม่ระบุหน้าและเกณฑ์วัดผลชัดเจน"],
        evidence_count=1,
        gaps_count=1,
    ),
    StateIn(
        goal="ลบฐานข้อมูล production ทั้งหมดแล้วรันสคริปต์ใหม่ทันที",
        notes=["คำสั่งมีความเสี่ยงสูงต่อข้อมูลจริง"],
        evidence_count=0,
        gaps_count=1,
        last_error="PermissionGuard: destructive intent",
    ),
]


def load_env_var(name: str) -> str:
    """Load an API key from environment or CEO/.env without printing secrets."""
    key = os.environ.get(name, "").strip()
    if key:
        return key
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if env_path.exists():
        prefix = f"{name}="
        for line in env_path.read_text(encoding="utf-8", errors="ignore").splitlines():
            if line.startswith(prefix):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    return ""


def load_gemini_key() -> str:
    return load_env_var("GEMINI_API_KEY")


def compute_model_tier(choice: str, urgency: str, safe_to_run: bool) -> str:
    """Select fast vs pro execution model tier from JEV System-One signals."""
    if not safe_to_run or choice == "stop":
        return "halt"
    if urgency in ("high", "critical") or choice == "write":
        return "pro-tier"
    return "fast-tier"


def append_run_log(queue_root: Path, level: str, message: str, meta: dict[str, Any] | None = None) -> None:
    """Append a structured run log line into run_log.jsonl."""
    queue_root.mkdir(parents=True, exist_ok=True)
    log_file = queue_root / "run_log.jsonl"
    entry = {
        "ts": time.strftime("%H:%M:%S"),
        "iso": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "level": level,
        "message": message,
        "meta": meta or {},
    }
    with log_file.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(entry, ensure_ascii=False) + "\n")


def load_worker_stats(queue_root: Path) -> dict[str, int]:
    """Load persistent w1..w8 dispatch counts."""
    stats_file = queue_root / "worker_stats.json"
    base = {f"w{i}": 0 for i in range(1, WORKER_COUNT + 1)}
    if stats_file.exists():
        try:
            loaded = json.loads(stats_file.read_text(encoding="utf-8"))
            if isinstance(loaded, dict):
                for k in base:
                    base[k] = int(loaded.get(k, 0))
        except (ValueError, OSError):
            pass
    return base


def bump_worker_stat(queue_root: Path, worker_id: str, lock: threading.Lock | None = None) -> None:
    """Increment worker execution count on disk safely."""
    def _update() -> None:
        stats = load_worker_stats(queue_root)
        stats[worker_id] = stats.get(worker_id, 0) + 1
        queue_root.mkdir(parents=True, exist_ok=True)
        (queue_root / "worker_stats.json").write_text(
            json.dumps(stats, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    if lock:
        with lock:
            _update()
    else:
        _update()


def decide_with_local_system_one(state: StateIn) -> DecisionResult:
    """Deterministic sub-5ms System-One classifier simulating jev-1.15.0."""
    t0 = time.perf_counter()
    text = f"{state.goal} {' '.join(state.notes)} {state.last_error}".lower()

    dangerous_terms = ("ลบฐานข้อมูล", "drop table", "rm -rf", "format", "destructive", "password", "secret", "ลบข้อมูลทั้งหมด")
    is_safe = not any(term in text for term in dangerous_terms)
    p_yes = 0.97 if is_safe else 0.12

    if any(k in text for k in ("ด่วน", "critical", "production", "พัง", "crash")):
        urgency, u_conf = "critical", 0.96
    elif state.gaps_count >= 2 or any(k in text for k in ("คู่แข่ง", "research", "ค้นหา", "วิจัย", "วิเคราะห์", "ข่าว", "ราคา")):
        urgency, u_conf = "high", 0.92
    elif state.evidence_count >= 4 or any(k in text for k in ("เขียน", "บทความ", "สรุป", "draft", "write")):
        urgency, u_conf = "medium", 0.90
    else:
        urgency, u_conf = "low", 0.88

    write_hints = ("เขียน", "บทความ", "สรุป", "ร่าง", "draft", "write", "report", "proposal")
    research_hints = ("ค้นหา", "วิจัย", "วิเคราะห์", "คู่แข่ง", "ราคา", "ข่าว", "ข้อมูล", "search", "research", "market", "trend")

    if not is_safe:
        choice, c_conf = "review", 0.95
    elif state.evidence_count >= 4 and state.gaps_count == 0:
        choice, c_conf = "write", 0.94
    elif any(k in text for k in write_hints) and not any(k in text for k in research_hints):
        choice, c_conf = "write", 0.90
    elif any(k in text for k in research_hints) or ((state.evidence_count == 0 or state.gaps_count >= 2) and len(state.goal.strip()) > 20):
        choice, c_conf = "research", 0.91
    else:
        # Ambiguous/short goal intentionally lands below 0.85 to demonstrate Human Gate
        choice, c_conf = "write", 0.71

    elapsed_ms = max(1.0, (time.perf_counter() - t0) * 1000.0 + 2.5)
    return DecisionResult(
        choice=choice,
        choice_confidence=round(c_conf, 2),
        urgency=urgency,
        urgency_confidence=round(u_conf, 2),
        safe_to_run=is_safe,
        safe_probability=round(p_yes, 2),
        latency_ms=round(elapsed_ms, 2),
        cost_usd=0.000003,
        engine="local-system-one",
        model_tier=compute_model_tier(choice, urgency, is_safe),
    )


def decide_with_openrouter_jev(state: StateIn, api_key: str) -> DecisionResult:
    """Live System-One decision via OpenRouter (~typesafe/jev-latest)."""
    t0 = time.perf_counter()
    url = "https://openrouter.ai/api/v1/systemone"
    body = {
        "model": os.environ.get("JEV_MODEL", "~typesafe/jev-latest"),
        "state": asdict(state),
        "questions": {
            "next_worker": {
                "type": "choice",
                "instructions": DEFAULT_QUESTIONS["next.worker"].instructions,
                "criteria": DEFAULT_QUESTIONS["next.worker"].criteria,
            },
            "urgency": {
                "type": "score",
                "instructions": "Evaluate task urgency and complexity.",
                "criteria": DEFAULT_QUESTIONS["urgency"].levels,
            },
            "safe_to_run": {
                "type": "noul",
                "instructions": DEFAULT_QUESTIONS["safe.to.run"].instructions,
                "criteria": {
                    "false": "Destructive, unsafe, or leaks secrets/production data.",
                    "true": "Safe read, research, or drafting task.",
                },
            },
        },
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=12) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    choices = data.get("choices") or {}
    scores = data.get("scores") or {}
    nouls = data.get("nouls") or {}

    cw = choices.get("next_worker") or {}
    sc = scores.get("urgency") or {}
    nl = nouls.get("safe_to_run") or {}

    choice = cw.get("choice", "review")
    if choice not in (*QUEUES, "stop"):
        choice = "review"
    urgency = str(sc.get("score", "medium"))
    if urgency not in ("low", "medium", "high", "critical"):
        urgency = "medium"
    p_yes = float(nl.get("noul", 0.9))
    is_safe = p_yes >= 0.5
    elapsed_ms = (time.perf_counter() - t0) * 1000.0

    return DecisionResult(
        choice=choice,
        choice_confidence=round(float(cw.get("confidence", 0.85)), 2),
        urgency=urgency,
        urgency_confidence=round(float(sc.get("confidence", 0.85)), 2),
        safe_to_run=is_safe,
        safe_probability=round(p_yes, 2),
        latency_ms=round(elapsed_ms, 2),
        cost_usd=0.000003,
        engine="openrouter-jev-systemone",
        model_tier=compute_model_tier(choice, urgency, is_safe),
    )


def decide_with_gemini(state: StateIn, api_key: str) -> DecisionResult:
    """Live mode using Gemini REST API with structured JSON output."""
    t0 = time.perf_counter()
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-2.5-flash-lite:generateContent?key={api_key}"
    )
    prompt = (
        "You are a System-One agent router. Classify the state strictly into JSON with keys: "
        '{"choice":"research|write|review","choice_confidence":0.0-1.0,'
        '"urgency":"low|medium|high|critical","urgency_confidence":0.0-1.0,'
        '"safe_to_run":true|false,"safe_probability":0.0-1.0}.\n'
        f"Criteria: {json.dumps(asdict(DEFAULT_QUESTIONS['next.worker']), ensure_ascii=False)}\n"
        f"State: {json.dumps(asdict(state), ensure_ascii=False)}"
    )
    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0.0},
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=12) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
    parsed = json.loads(raw_text)
    elapsed_ms = (time.perf_counter() - t0) * 1000.0
    choice = parsed.get("choice", "review")
    if choice not in QUEUES:
        choice = "review"
    urgency = parsed.get("urgency", "medium")
    if urgency not in ("low", "medium", "high", "critical"):
        urgency = "medium"

    return DecisionResult(
        choice=choice,
        choice_confidence=round(float(parsed.get("choice_confidence", 0.7)), 2),
        urgency=urgency,
        urgency_confidence=round(float(parsed.get("urgency_confidence", 0.8)), 2),
        safe_to_run=bool(parsed.get("safe_to_run", True)),
        safe_probability=round(float(parsed.get("safe_probability", 0.9)), 2),
        latency_ms=round(elapsed_ms, 2),
        cost_usd=0.000015,
        engine="gemini-2.5-flash-lite",
        model_tier=compute_model_tier(choice, urgency, bool(parsed.get("safe_to_run", True))),
    )


def search_duckduckgo_and_wiki(query: str, limit: int = 5) -> dict[str, Any]:
    """Fetch real external web evidence via DuckDuckGo HTML and Wikipedia REST API."""
    clean_q = query.strip()
    sources: list[dict[str, str]] = []
    errors: list[str] = []
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "Accept-Language": "th,en;q=0.9",
    }

    # 1. DuckDuckGo HTML Search
    try:
        ddg_url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote_plus(clean_q)
        req = urllib.request.Request(ddg_url, headers=headers)
        with urllib.request.urlopen(req, timeout=8) as resp:
            raw_html = resp.read().decode("utf-8", errors="ignore")

        blocks = re.findall(
            r'<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)</a>[\s\S]*?(?:<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)</a>)?',
            raw_html,
            flags=re.IGNORECASE,
        )
        for raw_href, raw_title, raw_snippet in blocks:
            if len(sources) >= limit:
                break
            decoded_href = html.unescape(raw_href)
            if "uddg=" in decoded_href:
                match_u = re.search(r"uddg=([^&]+)", decoded_href)
                if match_u:
                    decoded_href = urllib.parse.unquote(match_u.group(1))
            if not decoded_href.startswith("http"):
                continue
            title = html.unescape(re.sub(r"<[^>]+>", "", raw_title)).strip()
            snippet = html.unescape(re.sub(r"<[^>]+>", "", raw_snippet or "")).strip()
            domain = urllib.parse.urlparse(decoded_href).netloc
            if title:
                sources.append({
                    "provider": "duckduckgo",
                    "title": title,
                    "url": decoded_href,
                    "domain": domain,
                    "snippet": snippet or f"Result from {domain}",
                })
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        errors.append(f"DuckDuckGo: {exc}")

    # 2. Wikipedia REST Summary (Thai + English fallback)
    topic = re.sub(r"^(รวบรวมข้อมูล|ค้นหา|หาข้อมูล|วิเคราะห์|สรุป|คืออะไร|เกี่ยวกับ)\s*", "", clean_q).strip() or clean_q
    for lang in ("th", "en"):
        if len(sources) >= limit:
            break
        try:
            wiki_url = f"https://{lang}.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(topic)}"
            req = urllib.request.Request(wiki_url, headers={"User-Agent": "JarvisAgentRouter/1.0"})
            with urllib.request.urlopen(req, timeout=6) as resp:
                wdata = json.loads(resp.read().decode("utf-8"))
            extract = wdata.get("extract", "").strip()
            page_url = wdata.get("content_urls", {}).get("desktop", {}).get("page", "")
            if extract and wdata.get("type") != "disambiguation" and page_url:
                if not any(s["url"] == page_url for s in sources):
                    sources.append({
                        "provider": f"wikipedia-{lang}",
                        "title": wdata.get("title", topic),
                        "url": page_url,
                        "domain": f"{lang}.wikipedia.org",
                        "snippet": extract[:280] + ("..." if len(extract) > 280 else ""),
                    })
                break
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, OSError):
            continue

    return {
        "query": clean_q,
        "sources": sources[:limit],
        "errors": errors,
    }


def synthesize_draft(goal: str, notes: list[str], sources: list[dict[str, str]], use_live: bool) -> tuple[str, str]:
    """Generate draft article/brief using Gemini (if --live) or deterministic structured synthesis."""
    api_key = load_gemini_key() if use_live else ""
    if api_key:
        try:
            url = (
                "https://generativelanguage.googleapis.com/v1beta/models/"
                f"gemini-2.5-flash-lite:generateContent?key={api_key}"
            )
            evidence_lines = "\n".join(f"- {s['title']} ({s['domain']}): {s['snippet']}" for s in sources[:5]) or "- (No external URLs attached)"
            prompt = (
                "เขียนบทสรุปผู้บริหารสั้น กระชับ เป็นภาษาไทย จากข้อมูลต่อไปนี้:\n"
                f"เป้าหมาย: {goal}\n"
                f"บันทึก: {', '.join(notes)}\n"
                f"หลักฐาน:\n{evidence_lines}"
            )
            payload = json.dumps({"contents": [{"parts": [{"text": prompt}]}]}).encode("utf-8")
            req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"}, method="POST")
            with urllib.request.urlopen(req, timeout=12) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
            if text:
                return text, "gemini-2.5-flash-lite"
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, KeyError, OSError):
            pass

    lines = [f"### สรุปร่างเอกสาร: {goal}"]
    if notes:
        lines.append(f"- บริบทตั้งต้น: {'; '.join(notes)}")
    if sources:
        lines.append(f"- อ้างอิงหลักฐานจริง ({len(sources)} แหล่ง):")
        for src in sources[:4]:
            lines.append(f"  • [{src['title']}]({src['url']}) — {src['snippet'][:140]}")
    else:
        lines.append("- สถานะ: ร่างจากคลังข้อมูลภายใน (พร้อมให้ผู้ตรวจทานอนุมัติหรือสั่ง Research เพิ่ม)")
    return "\n".join(lines), "local-draft-synthesizer"


def route_to_queue(
    state: StateIn,
    decision: DecisionResult,
    queue_root: Path,
    gate_threshold: float = 0.85,
) -> tuple[str, Path, bool]:
    """Apply the confidence + safety gate and write a JSON job into queue/<destination>/."""
    gate_passed = (
        decision.safe_to_run
        and decision.safe_probability >= gate_threshold
        and decision.choice_confidence >= gate_threshold
        and decision.choice in ("research", "write")
    )
    destination = decision.choice if gate_passed else "review"

    hold_reason = ""
    if not decision.safe_to_run or decision.safe_probability < gate_threshold:
        hold_reason = f"Safety gate blocked (safe={decision.safe_to_run}, p_yes={decision.safe_probability:.2f})"
    elif decision.choice_confidence < gate_threshold:
        hold_reason = f"Low confidence ({decision.choice_confidence:.2f} < {gate_threshold:.2f})"
    elif destination == "review":
        hold_reason = "Routed directly to review queue"

    folder = queue_root / destination
    folder.mkdir(parents=True, exist_ok=True)
    job_id = uuid4().hex[:10]
    job_path = folder / f"{job_id}.json"

    job_payload = {
        "job_id": job_id,
        "destination": destination,
        "status": "queued" if gate_passed else "awaiting_approval",
        "gate_passed": gate_passed,
        "gate_threshold": gate_threshold,
        "hold_reason": hold_reason,
        "state": asdict(state),
        "decision": asdict(decision),
        "worker_output": None,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "updated_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
    }
    job_path.write_text(json.dumps(job_payload, ensure_ascii=False, indent=2), encoding="utf-8")

    append_run_log(
        queue_root,
        "info",
        f"ask Choice next.worker -> {decision.choice} ({decision.choice_confidence:.2f}, {decision.latency_ms:.1f}ms)",
        {"job_id": job_id, "engine": decision.engine},
    )
    if gate_passed:
        append_run_log(
            queue_root,
            "ok",
            f"gate ok -> queue/{destination} | saved {job_path.name}",
            {"job_id": job_id, "destination": destination},
        )
    else:
        append_run_log(
            queue_root,
            "hold",
            f"gate hold -> queue/review ({hold_reason}) | awaiting คุณไลท์ approve",
            {"job_id": job_id, "destination": "review"},
        )
    return destination, job_path, gate_passed


def execute_job_file(
    worker_id: str,
    job_path: Path,
    queue_root: Path,
    use_live: bool = False,
    lock: threading.Lock | None = None,
) -> dict[str, Any]:
    """Execute a queued JSON job with real Research (DuckDuckGo) or Write, leaving Review jobs for Human Approval."""
    data = json.loads(job_path.read_text(encoding="utf-8"))
    dest = data["destination"]
    job_id = data["job_id"]
    goal = data["state"]["goal"]

    if dest == "review" and data.get("status") != "approved_for_execution":
        return {
            "worker": worker_id,
            "job_id": job_id,
            "destination": "review",
            "status": data.get("status", "awaiting_approval"),
            "goal": goal,
            "result": f"Held at Human Review ({data.get('hold_reason') or 'awaiting approval'})",
        }

    bump_worker_stat(queue_root, worker_id, lock)

    if dest == "research":
        search_res = search_duckduckgo_and_wiki(goal, limit=5)
        sources = search_res["sources"]
        data["state"]["evidence_count"] = len(sources)
        data["state"]["gaps_count"] = 0 if sources else data["state"].get("gaps_count", 1)
        data["status"] = "completed"
        data["worker_id"] = worker_id
        data["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%S")
        data["worker_output"] = {
            "type": "research",
            "provider": "DuckDuckGo + Wikipedia",
            "source_count": len(sources),
            "sources": sources,
            "errors": search_res["errors"],
            "summary": (
                f"เก็บหลักฐานจริง {len(sources)} แหล่งจากเว็บสำเร็จ"
                if sources
                else f"ไม่พบผลลัพธ์จากเว็บ ({'; '.join(search_res['errors']) or 'empty'})"
            ),
        }
        job_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        append_run_log(
            queue_root,
            "research",
            f"[{worker_id}] research web-search -> {len(sources)} sources saved ({job_id}.json)",
            {"job_id": job_id, "worker": worker_id, "sources": len(sources)},
        )
        return {
            "worker": worker_id,
            "job_id": job_id,
            "destination": dest,
            "status": "completed",
            "goal": goal,
            "result": data["worker_output"]["summary"],
        }

    if dest == "write":
        prior_sources = (data.get("worker_output") or {}).get("sources", [])
        if not prior_sources and data["state"].get("evidence_count", 0) == 0:
            search_res = search_duckduckgo_and_wiki(goal, limit=3)
            prior_sources = search_res["sources"]
            data["state"]["evidence_count"] = len(prior_sources)
        draft, draft_engine = synthesize_draft(goal, data["state"].get("notes", []), prior_sources, use_live)
        data["status"] = "completed"
        data["worker_id"] = worker_id
        data["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%S")
        data["worker_output"] = {
            "type": "write",
            "engine": draft_engine,
            "sources": prior_sources,
            "draft": draft,
            "summary": f"ร่างเนื้อหาสำเร็จด้วย {draft_engine} ({len(draft)} chars)",
        }
        job_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        append_run_log(
            queue_root,
            "write",
            f"[{worker_id}] llm draft after gate ({draft_engine}) -> {job_id}.json",
            {"job_id": job_id, "worker": worker_id, "engine": draft_engine},
        )
        return {
            "worker": worker_id,
            "job_id": job_id,
            "destination": dest,
            "status": "completed",
            "goal": goal,
            "result": data["worker_output"]["summary"],
        }

    return {
        "worker": worker_id,
        "job_id": job_id,
        "destination": dest,
        "status": data.get("status", "unknown"),
        "goal": goal,
        "result": "No-op",
    }


def approve_review_job(queue_root: Path, job_id: str, target: str, use_live: bool) -> dict[str, Any]:
    """Approve a held job in queue/review, move it to target queue, and execute its worker."""
    if target not in ("research", "write"):
        raise ValueError(f"Unsupported approval target: {target}")
    review_path = queue_root / "review" / f"{job_id}.json"
    if not review_path.exists():
        raise FileNotFoundError(f"ไม่พบงาน {job_id} ใน queue/review")

    data = json.loads(review_path.read_text(encoding="utf-8"))
    target_dir = queue_root / target
    target_dir.mkdir(parents=True, exist_ok=True)
    target_path = target_dir / f"{job_id}.json"

    data["destination"] = target
    data["status"] = "approved_for_execution"
    data["approved_by"] = "คุณไลท์"
    data["approved_at"] = time.strftime("%Y-%m-%dT%H:%M:%S")
    data["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%S")
    target_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    review_path.unlink()

    append_run_log(
        queue_root,
        "approve",
        f"human approve (คุณไลท์) -> promoted {job_id}.json to queue/{target}",
        {"job_id": job_id, "target": target},
    )
    stats = load_worker_stats(queue_root)
    next_wid = f"w{(sum(stats.values()) % WORKER_COUNT) + 1}"
    return execute_job_file(next_wid, target_path, queue_root, use_live=use_live)


def reject_review_job(queue_root: Path, job_id: str) -> dict[str, Any]:
    """Reject a held job in queue/review so it stays halted."""
    review_path = queue_root / "review" / f"{job_id}.json"
    if not review_path.exists():
        raise FileNotFoundError(f"ไม่พบงาน {job_id} ใน queue/review")

    data = json.loads(review_path.read_text(encoding="utf-8"))
    data["status"] = "rejected"
    data["rejected_by"] = "คุณไลท์"
    data["rejected_at"] = time.strftime("%Y-%m-%dT%H:%M:%S")
    data["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%S")
    review_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    append_run_log(
        queue_root,
        "reject",
        f"human reject (คุณไลท์) -> halted {job_id}.json in queue/review",
        {"job_id": job_id},
    )
    return data


def collect_router_state(queue_root: Path, gate_threshold: float = 0.85) -> dict[str, Any]:
    """Return full live router snapshot for CEO Hub Visualizer & Bridge."""
    jobs: list[dict[str, Any]] = []
    queue_counts = {q: 0 for q in QUEUES}

    for q in QUEUES:
        qdir = queue_root / q
        if not qdir.exists():
            continue
        for jfile in sorted(qdir.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True):
            try:
                payload = json.loads(jfile.read_text(encoding="utf-8"))
                jobs.append(payload)
                if payload.get("status") != "rejected":
                    queue_counts[q] += 1
            except (ValueError, OSError):
                continue

    jobs.sort(key=lambda j: j.get("updated_at") or j.get("created_at") or "", reverse=True)

    run_log: list[dict[str, Any]] = []
    log_file = queue_root / "run_log.jsonl"
    if log_file.exists():
        lines = log_file.read_text(encoding="utf-8", errors="ignore").splitlines()[-50:]
        for line in reversed(lines):
            if not line.strip():
                continue
            try:
                run_log.append(json.loads(line))
            except ValueError:
                continue

    total_cost = sum(float((j.get("decision") or {}).get("cost_usd", 0.0)) for j in jobs)
    latencies = [float((j.get("decision") or {}).get("latency_ms", 0.0)) for j in jobs if j.get("decision")]
    avg_latency = round(sum(latencies) / len(latencies), 2) if latencies else 0.0
    held_count = sum(1 for j in jobs if not j.get("gate_passed", True))
    awaiting_count = sum(1 for j in jobs if j.get("status") == "awaiting_approval")

    return {
        "queueRoot": str(queue_root),
        "gateThreshold": gate_threshold,
        "queueCounts": queue_counts,
        "awaitingApprovalCount": awaiting_count,
        "jobs": jobs[:40],
        "runLog": run_log,
        "workers": load_worker_stats(queue_root),
        "telemetry": {
            "nodes": 18,
            "edges": 36,
            "busReaders": 14,
            "decisions": len(jobs),
            "heldAtGate": held_count,
            "avgLatencyMs": avg_latency,
            "totalCostUsd": round(total_cost, 6),
        },
    }


def clear_queue_state(queue_root: Path) -> None:
    """Reset queue JSON files, run_log.jsonl, and worker_stats.json."""
    if not queue_root.exists():
        return
    for q in QUEUES:
        qdir = queue_root / q
        if qdir.exists():
            for jf in qdir.glob("*.json"):
                jf.unlink(missing_ok=True)
    for fname in ("run_log.jsonl", "worker_stats.json"):
        (queue_root / fname).unlink(missing_ok=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="Run JEV-style Agent Router (chief.py)")
    parser.add_argument("--goal", type=str, help="Custom goal to route instead of built-in sample batch")
    parser.add_argument("--live", action="store_true", help="Use GEMINI_API_KEY from .env/env for live classification & drafting")
    parser.add_argument("--workers", type=int, default=WORKER_COUNT, help="Parallel worker count (default: 8)")
    parser.add_argument("--gate", type=float, default=0.85, help="Confidence gate threshold (default: 0.85)")
    parser.add_argument("--status", action="store_true", help="Return current queue, workers, and run log state")
    parser.add_argument("--approve", type=str, help="Approve a held job_id in queue/review")
    parser.add_argument("--reject", type=str, help="Reject a held job_id in queue/review")
    parser.add_argument("--target", type=str, default="research", choices=["research", "write"], help="Target queue after approval")
    parser.add_argument("--clear-queue", action="store_true", help="Clear queue jobs and run log")
    parser.add_argument("--json", action="store_true", help="Emit JSON output for Bridge / UI integration")
    parser.add_argument(
        "--queue-dir",
        type=Path,
        default=Path(tempfile.gettempdir()) / "jev_router_queue",
        help="Directory where queue/<dest>/<job>.json files are written",
    )
    args = parser.parse_args()

    try:
        if args.clear_queue:
            clear_queue_state(args.queue_dir)
            if args.json:
                print(json.dumps({"ok": True, "state": collect_router_state(args.queue_dir, args.gate)}, ensure_ascii=False))
            else:
                print(f"Cleared queue at {args.queue_dir}")
            return

        if args.status:
            state_snapshot = collect_router_state(args.queue_dir, args.gate)
            if args.json:
                print(json.dumps({"ok": True, "state": state_snapshot}, ensure_ascii=False))
            else:
                print(json.dumps(state_snapshot, ensure_ascii=False, indent=2))
            return

        if args.approve:
            worker_res = approve_review_job(args.queue_dir, args.approve.strip(), args.target, args.live)
            state_snapshot = collect_router_state(args.queue_dir, args.gate)
            if args.json:
                print(json.dumps({"ok": True, "workerResult": worker_res, "state": state_snapshot}, ensure_ascii=False))
            else:
                print(f"Approved {args.approve} -> {args.target}: {worker_res['result']}")
            return

        if args.reject:
            rejected_job = reject_review_job(args.queue_dir, args.reject.strip())
            state_snapshot = collect_router_state(args.queue_dir, args.gate)
            if args.json:
                print(json.dumps({"ok": True, "rejected": rejected_job, "state": state_snapshot}, ensure_ascii=False))
            else:
                print(f"Rejected {args.reject}")
            return

        tasks = (
            [StateIn(goal=args.goal, notes=["ส่งคำสั่งจาก CEO Hub / CLI"], evidence_count=0, gaps_count=2)]
            if args.goal
            else SAMPLE_TASKS
        )

        api_key = load_gemini_key() if args.live else ""
        openrouter_key = load_env_var("OPENROUTER_API_KEY") if args.live else ""
        if args.live and not api_key and not openrouter_key and not args.json:
            print("[WARN] --live requested but GEMINI_API_KEY / OPENROUTER_API_KEY was not found; falling back to local-system-one.")

        queued_jobs: list[Path] = []
        dispatched_summaries: list[dict[str, Any]] = []

        if not args.json:
            print("=" * 72)
            print(f"GRAPH jev-agent-router-live | WORKERS {args.workers} | GATE >= {args.gate:.2f}")
            print(f"QUEUE ROOT: {args.queue_dir}")
            print("=" * 72)
            print("\n[RUN LOG]")

        for idx, state in enumerate(tasks, start=1):
            if openrouter_key:
                try:
                    decision = decide_with_openrouter_jev(state, openrouter_key)
                except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, KeyError, OSError) as exc:
                    if not args.json:
                        print(f"  [fallback] OpenRouter JEV failed ({exc}); trying Gemini/local")
                    decision = decide_with_gemini(state, api_key) if api_key else decide_with_local_system_one(state)
            elif api_key:
                try:
                    decision = decide_with_gemini(state, api_key)
                except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, KeyError, OSError) as exc:
                    if not args.json:
                        print(f"  [fallback] Gemini call failed ({exc}); using local-system-one")
                    decision = decide_with_local_system_one(state)
            else:
                decision = decide_with_local_system_one(state)

            dest, job_path, gate_ok = route_to_queue(state, decision, args.queue_dir, args.gate)
            queued_jobs.append(job_path)
            dispatched_summaries.append({
                "goal": state.goal,
                "destination": dest,
                "gate_passed": gate_ok,
                "job_id": job_path.stem,
                "decision": asdict(decision),
            })

            if not args.json:
                print(f"#{idx} goal: {state.goal}")
                print(f"   ask Score urgency     -> {decision.urgency:<8} conf={decision.urgency_confidence:.2f}")
                print(f"   ask Bool  safe.to.run -> {str(decision.safe_to_run):<8} p_yes={decision.safe_probability:.2f}")
                print(f"   ask Choice next.worker-> {decision.choice:<8} conf={decision.choice_confidence:.2f} ({decision.latency_ms:.1f}ms, {decision.engine})")
                if gate_ok:
                    print(f"   gate ok               -> queue/{dest} | saved {job_path.name}")
                else:
                    print(f"   gate hold             -> queue/{dest} (awaiting approval) | saved {job_path.name}")

        base_offset = sum(load_worker_stats(args.queue_dir).values())
        lock = threading.Lock()
        with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
            worker_results = list(
                pool.map(
                    lambda item: execute_job_file(
                        f"w{((base_offset + item[0]) % args.workers) + 1}",
                        item[1],
                        args.queue_dir,
                        use_live=args.live,
                        lock=lock,
                    ),
                    enumerate(queued_jobs),
                )
            )

        state_snapshot = collect_router_state(args.queue_dir, args.gate)
        if args.json:
            print(json.dumps({
                "ok": True,
                "dispatched": dispatched_summaries,
                "workerResults": worker_results,
                "state": state_snapshot,
            }, ensure_ascii=False))
            return

        print("\n[DISPATCH - PARALLEL WORKERS]")
        for res in worker_results:
            print(f"   [{res['worker']}] {res['job_id']}.json ({res['destination']}) -> {res['result']}")

        t = state_snapshot["telemetry"]
        print("\n[GRAPH COST & SUMMARY]")
        print(f"   decisions   : {t['decisions']}")
        print(f"   held at gate: {t['heldAtGate']}")
        print(f"   avg latency : {t['avgLatencyMs']:.2f} ms")
        print(f"   total cost  : ${t['totalCostUsd']:.6f}")
        print(f"   active queue: {args.queue_dir}")
    except (FileNotFoundError, ValueError) as exc:
        if args.json:
            print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False))
            sys.exit(1)
        raise


if __name__ == "__main__":
    main()

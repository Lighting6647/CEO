import { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Pause,
  Play,
  Sparkles,
  Trash2,
  Copy,
  Check,
  Download,
  FileText,
  X,
  Plus,
  AlertCircle,
} from 'lucide-react';
import {
  formatClock,
  formatTranscript,
  meetingMinutes,
  buildMeetingDocument,
  meetingFileName,
  summarizeMeetingLocally,
  MAX_TRANSCRIPT_LENGTH,
  transcriptLength,
} from '../../../utils/meetingEngine';

/**
 * Meeting Notes & Summary Export Modal (Ported from D:\AI\Light\Javis MeetingPanel + MeetingExport)
 * Supports Web Speech API (th-TH), manual transcript entry, AI/local summary, and CRLF .txt download.
 */
export function MeetingNotesModal({ isOpen, onClose, onShowToast }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'recording' | 'paused' | 'summarizing' | 'done'
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [entries, setEntries] = useState([]);
  const [partialText, setPartialText] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [summary, setSummary] = useState('');
  const [summarySource, setSummarySource] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const SpeechRec = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    setSpeechSupported(Boolean(SpeechRec));
  }, []);

  useEffect(() => {
    if (status !== 'recording') return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [entries, partialText]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore cleanup error
        }
      }
    };
  }, []);

  if (!isOpen) return null;

  const stopSpeech = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {
        // ignore stop error
      }
      recognitionRef.current = null;
    }
    setPartialText('');
  };

  const appendEntry = (text, baseStart) => {
    const clean = text.trim();
    if (!clean) return;
    setEntries((prev) => {
      const next = [...prev, { at: Math.max(0, Date.now() - baseStart), text: clean }];
      if (transcriptLength(next) > MAX_TRANSCRIPT_LENGTH) {
        onShowToast?.('info', 'บันทึกใกล้เต็มความจุ', 'ถึงขีดจำกัด 80,000 ตัวอักษรแล้ว แนะนำให้กดสรุปและดาวน์โหลด');
        return prev;
      }
      return next;
    });
  };

  const startSpeech = (baseStart) => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return;

    const rec = new SpeechRec();
    rec.lang = 'th-TH';
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          appendEntry(res[0].transcript, baseStart);
        } else {
          interim += res[0].transcript;
        }
      }
      setPartialText(interim);
    };

    rec.onerror = () => {
      setPartialText('');
    };

    rec.onend = () => {
      if (recognitionRef.current === rec) {
        try {
          rec.start();
        } catch {
          // ignore restart race
        }
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {
      onShowToast?.('info', 'โหมดพิมพ์บันทึก', 'เบราว์เซอร์ไม่อนุญาตไมโครโฟน สามารถพิมพ์หรือวางบันทึกคำพูดด้านล่างได้');
    }
  };

  const handleStart = () => {
    const start = Date.now();
    setStartedAt(start);
    setNow(start);
    setEntries([]);
    setSummary('');
    setSummarySource('');
    setConfirmCancel(false);
    setStatus('recording');
    if (speechSupported) startSpeech(start);
  };

  const handlePause = () => {
    stopSpeech();
    setStatus('paused');
  };

  const handleResume = () => {
    setStatus('recording');
    if (speechSupported) startSpeech(startedAt);
  };

  const handleAddManualLine = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const base = status === 'idle' ? Date.now() : startedAt;
    if (status === 'idle') {
      setStartedAt(base);
      setNow(base);
      setStatus('paused');
    }
    appendEntry(manualInput, base);
    setManualInput('');
  };

  const handleFinishAndSummarize = async () => {
    stopSpeech();
    const transcript = formatTranscript(entries);
    if (!transcript.trim()) {
      onShowToast?.('info', 'ยังไม่มีคำพูดที่จดไว้', 'กรุณาพูดหรือพิมพ์ข้อความการประชุมก่อนกดสรุป');
      return;
    }

    setStatus('summarizing');
    const lastAt = entries.at(-1)?.at ?? 0;
    const mins = meetingMinutes(0, lastAt);

    try {
      const res = await fetch('/api/meeting-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, minutes: mins }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.ok && data.summary) {
          setSummary(data.summary);
          setSummarySource(data.source === 'gemini-api' ? 'Gemini AI' : 'Local Smart Summary');
          setStatus('done');
          onShowToast?.('success', 'สรุปการประชุมสำเร็จ', 'พร้อมคัดลอกหรือดาวน์โหลดเป็นไฟล์ .txt');
          return;
        }
      }
    } catch {
      // Fallback gracefully when running Vite static dev without serverless routes
    }

    setSummary(summarizeMeetingLocally(transcript, mins));
    setSummarySource('Local Smart Summary');
    setStatus('done');
    onShowToast?.('success', 'สรุปการประชุมสำเร็จ', 'ประมวลผลสรุปแบบออฟไลน์เรียบร้อย');
  };

  const handleDiscard = () => {
    stopSpeech();
    setEntries([]);
    setSummary('');
    setSummarySource('');
    setConfirmCancel(false);
    setStatus('idle');
  };

  const handleCopy = async (target) => {
    const transcript = formatTranscript(entries);
    const text = target === 'summary' ? summary : transcript;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTarget(target);
      setTimeout(() => setCopiedTarget(null), 2000);
    } catch {
      onShowToast?.('error', 'คัดลอกไม่สำเร็จ', 'กรุณาใช้ปุ่มดาวน์โหลดไฟล์ .txt แทนครับ');
    }
  };

  const handleDownload = () => {
    const transcript = formatTranscript(entries);
    const mins = meetingMinutes(0, entries.at(-1)?.at ?? 0);
    const doc = buildMeetingDocument({ summary, transcript, minutes: mins, startedAt });
    const blob = new Blob([doc], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = meetingFileName(startedAt);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast?.('success', 'ดาวน์โหลดสำเร็จ', `บันทึกไฟล์ ${meetingFileName(startedAt)} เรียบร้อย`);
  };

  const transcriptText = formatTranscript(entries);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-cyan-500/30 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                J.A.R.V.I.S. Meeting Notes & Summary
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                  FROM JAVIS CORE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                จดบันทึกคำพูดการประชุมแบบเรียลไทม์ สรุปประเด็นสำคัญ และส่งออกไฟล์ .txt (Windows CRLF)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopSpeech();
              onClose();
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/60 px-5 py-3">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                status === 'recording'
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  : status === 'summarizing'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  status === 'recording' ? 'bg-rose-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              {status === 'idle' && 'พร้อมบันทึก'}
              {status === 'recording' && 'กำลังจดบันทึก'}
              {status === 'paused' && 'พักการจด'}
              {status === 'summarizing' && 'กำลังสรุป...'}
              {status === 'done' && 'สรุปเสร็จสิ้น'}
            </span>
            {status === 'recording' && (
              <span className="font-mono text-sm font-bold text-cyan-400 tabular-nums">
                {formatClock(now - startedAt)}
              </span>
            )}
            <span className="text-xs text-slate-400">
              {entries.length > 0 ? `จดแล้ว ${entries.length} ช่วงคำพูด` : 'ยังไม่มีข้อความ'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {status === 'idle' && (
              <button
                type="button"
                onClick={handleStart}
                className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors"
              >
                <Mic className="h-3.5 w-3.5" /> เริ่มอัดเสียงประชุม
              </button>
            )}
            {status === 'recording' && (
              <button
                type="button"
                onClick={handlePause}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
              >
                <Pause className="h-3.5 w-3.5" /> พัก
              </button>
            )}
            {(status === 'paused' || status === 'done') && (
              <button
                type="button"
                onClick={handleResume}
                className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20"
              >
                <Play className="h-3.5 w-3.5" /> จดต่อ
              </button>
            )}
            {entries.length > 0 && status !== 'summarizing' && (
              <button
                type="button"
                onClick={handleFinishAndSummarize}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" /> จบและสรุป
              </button>
            )}
            {entries.length > 0 && !confirmCancel && (
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
              >
                <Trash2 className="h-3.5 w-3.5" /> ทิ้ง
              </button>
            )}
            {confirmCancel && (
              <div className="flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-950/60 px-2.5 py-1">
                <span className="text-[11px] text-rose-200">ยืนยันทิ้งบันทึก?</span>
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="rounded bg-rose-600 px-2 py-0.5 text-[11px] font-bold text-white hover:bg-rose-500"
                >
                  ทิ้งเลย
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmCancel(false)}
                  className="rounded bg-slate-700 px-2 py-0.5 text-[11px] text-slate-200 hover:bg-slate-600"
                >
                  เก็บไว้
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-5 space-y-4">
          {!speechSupported && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              เบราว์เซอร์นี้ไม่รองรับ Web Speech API — สามารถพิมพ์หรือวางบันทึกคำพูดด้านล่างเพื่อสรุปได้ทันทีครับ
            </div>
          )}

          {summary && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> คำสรุปการประชุม ({summarySource})
                </span>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-200">
                {summary}
              </pre>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              บันทึกคำพูด ({entries.length})
            </h3>
            {entries.length === 0 && !partialText ? (
              <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-6 text-center text-xs text-slate-500">
                กด &quot;เริ่มอัดเสียงประชุม&quot; หรือพิมพ์ข้อความการประชุมด้านล่างเพื่อเริ่มต้น
              </div>
            ) : (
              <ul className="space-y-1.5">
                {entries.map((entry, idx) => (
                  <li
                    key={`${entry.at}-${idx}`}
                    className="flex items-start gap-3 rounded-lg border border-slate-800/80 bg-slate-950/50 px-3 py-2 text-xs"
                  >
                    <span className="font-mono text-[11px] text-cyan-400 shrink-0 tabular-nums">
                      [{formatClock(entry.at)}]
                    </span>
                    <span className="text-slate-200 leading-relaxed">{entry.text}</span>
                  </li>
                ))}
                {partialText && (
                  <li className="flex items-start gap-3 rounded-lg border border-cyan-500/20 bg-cyan-950/20 px-3 py-2 text-xs italic text-cyan-300">
                    <span className="font-mono text-[11px] shrink-0">[...]</span>
                    <span>{partialText}</span>
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>

        {/* Manual Input + Export Bar */}
        <div className="border-t border-slate-800 bg-slate-950/80 p-4 space-y-3">
          <form onSubmit={handleAddManualLine} className="flex items-center gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="พิมพ์หรือวางข้อความการประชุมเพิ่มเติม..."
              className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20"
            >
              <Plus className="h-3.5 w-3.5" /> เพิ่มบรรทัด
            </button>
          </form>

          {transcriptText && (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {summary && (
                <button
                  type="button"
                  onClick={() => handleCopy('summary')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:border-emerald-500/50"
                >
                  {copiedTarget === 'summary' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedTarget === 'summary' ? 'คัดลอกคำสรุปแล้ว' : 'คัดลอกคำสรุป'}
                </button>
              )}
              <button
                type="button"
                onClick={() => handleCopy('transcript')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:border-cyan-500/50"
              >
                {copiedTarget === 'transcript' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedTarget === 'transcript' ? 'คัดลอกบันทึกแล้ว' : 'คัดลอกบันทึกคำพูด'}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-white"
              >
                <Download className="h-3.5 w-3.5" /> ดาวน์โหลดเป็นไฟล์ .txt
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

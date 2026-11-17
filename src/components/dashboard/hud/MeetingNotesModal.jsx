import { useState, useEffect, useRef, useCallback } from 'react';
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
  Loader2,
  Volume2,
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

const DRAFT_STORAGE_KEY = 'ceo.meeting.draft.v1';

function loadDraft() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.entries)) return parsed;
    return null;
  } catch {
    return null;
  }
}

function saveDraft(draft) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // ignore storage quota errors
  }
}

function pickSupportedAudioMime() {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
    return '';
  }
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || '';
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result || '');
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์เสียงได้'));
    reader.readAsDataURL(blob);
  });
}

function describeSpeechError(code) {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'เบราว์เซอร์บล็อกสิทธิ์ไมโครโฟนหรือ Speech Recognition — กรุณากดอนุญาตไมโครโฟนข้างแถบ URL (หรือใช้ปุ่มบันทึกเสียง/พิมพ์ข้อความด้านล่าง)';
    case 'audio-capture':
      return 'ไม่พบไมโครโฟนที่ใช้งานได้บนอุปกรณ์นี้';
    case 'network':
      return 'บริการแปลงเสียงเป็นข้อความขาดการเชื่อมต่อ — ยังคงอัดเสียงจริงเก็บไว้ได้และกดถอดเสียงภายหลังได้ครับ';
    default:
      return `การแปลงเสียงสดหยุดชั่วคราว (${code}) — ยังอัดไฟล์เสียงจริงและพิมพ์บันทึกต่อได้ปกติ`;
  }
}

/**
 * Dual-Engine Meeting Notes & Audio Recorder Modal
 * Engine 1: Real MediaRecorder audio capture + live AudioContext mic level bars + AI audio transcription
 * Engine 2: Live Web Speech API (th-TH) captions with iOS-safe restart & partial-text flush
 */
export function MeetingNotesModal({ isOpen, onClose, onShowToast }) {
  const initialDraft = loadDraft();
  const [status, setStatus] = useState(() =>
    initialDraft?.summary ? 'done' : initialDraft?.entries?.length ? 'paused' : 'idle'
  );
  const [startedAt, setStartedAt] = useState(() => initialDraft?.startedAt || Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [entries, setEntries] = useState(() => initialDraft?.entries || []);
  const [partialText, setPartialText] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [summary, setSummary] = useState(() => initialDraft?.summary || '');
  const [summarySource, setSummarySource] = useState(() => initialDraft?.summarySource || '');
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState(null);
  const [micWarning, setMicWarning] = useState('');
  const [micLevel, setMicLevel] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [transcribingAudio, setTranscribingAudio] = useState(false);

  const speechSupported =
    typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  const recorderSupported =
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== 'undefined';

  const isRecordingRef = useRef(false);
  const recognitionRef = useRef(null);
  const restartTimerRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const rafMeterRef = useRef(null);
  const partialTextRef = useRef('');
  const startedAtRef = useRef(startedAt);
  const listRef = useRef(null);

  useEffect(() => {
    partialTextRef.current = partialText;
  }, [partialText]);

  useEffect(() => {
    startedAtRef.current = startedAt;
  }, [startedAt]);

  useEffect(() => {
    saveDraft({ entries, summary, summarySource, startedAt });
  }, [entries, summary, summarySource, startedAt]);

  useEffect(() => {
    if (status !== 'recording') return undefined;
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
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const appendEntry = useCallback(
    (text, baseStart) => {
      const clean = String(text || '').trim();
      if (!clean) return;
      setEntries((prev) => {
        const next = [...prev, { at: Math.max(0, Date.now() - baseStart), text: clean }];
        if (transcriptLength(next) > MAX_TRANSCRIPT_LENGTH) {
          onShowToast?.('info', 'บันทึกใกล้เต็มความจุ', 'ถึงขีดจำกัด 80,000 ตัวอักษรแล้ว แนะนำให้กดสรุปและดาวน์โหลด');
          return prev;
        }
        return next;
      });
    },
    [onShowToast]
  );

  const stopHardwareAndSpeech = useCallback(
    (flushPartial = true) => {
      isRecordingRef.current = false;
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = null;
      }

      if (flushPartial && partialTextRef.current.trim()) {
        appendEntry(partialTextRef.current, startedAtRef.current);
      }
      partialTextRef.current = '';
      setPartialText('');

      if (recognitionRef.current) {
        try {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        } catch {
          // ignore cleanup error
        }
        recognitionRef.current = null;
      }

      if (rafMeterRef.current) {
        cancelAnimationFrame(rafMeterRef.current);
        rafMeterRef.current = null;
      }
      setMicLevel(0);

      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch {
          // ignore
        }
        audioContextRef.current = null;
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // ignore
        }
      }
      mediaRecorderRef.current = null;

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch {
            // ignore
          }
        });
        mediaStreamRef.current = null;
      }
    },
    [appendEntry]
  );

  useEffect(() => {
    return () => {
      stopHardwareAndSpeech(false);
    };
  }, [stopHardwareAndSpeech]);

  if (!isOpen) return null;

  const startLiveSpeech = (baseStart) => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec || !isRecordingRef.current) return;

    const isIos = /iPad|iPhone|iPod/i.test(navigator.userAgent || '');
    const rec = new SpeechRec();
    rec.lang = 'th-TH';
    rec.continuous = !isIos;
    rec.interimResults = true;

    rec.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const transcript = res[0]?.transcript || '';
        if (res.isFinal) {
          appendEntry(transcript, baseStart);
        } else {
          interim += transcript;
        }
      }
      setPartialText(interim);
    };

    rec.onerror = (event) => {
      const code = event?.error || 'unknown';
      if (code === 'no-speech' || code === 'aborted') return;
      setMicWarning(describeSpeechError(code));
      if (code === 'not-allowed' || code === 'service-not-allowed' || code === 'audio-capture') {
        // Stop retrying speech recognition, keep MediaRecorder or manual notes working
        recognitionRef.current = null;
      }
    };

    rec.onend = () => {
      if (!isRecordingRef.current || recognitionRef.current !== rec) return;
      restartTimerRef.current = setTimeout(() => {
        if (isRecordingRef.current && recognitionRef.current === rec) {
          try {
            rec.start();
          } catch {
            // Recreate cleanly on next attempt if browser blocks reuse
            startLiveSpeech(baseStart);
          }
        }
      }, 220);
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (err) {
      setMicWarning(err instanceof Error ? err.message : 'ไม่สามารถเริ่มแปลงเสียงสดได้');
    }
  };

  const startAudioCapture = async () => {
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setMicWarning('ไมโครโฟนใช้งานได้เฉพาะบน HTTPS หรือ localhost เท่านั้น (ยังพิมพ์บันทึกด้านล่างได้ตามปกติ)');
      return false;
    }
    if (!recorderSupported) {
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!isRecordingRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return false;
      }
      mediaStreamRef.current = stream;

      // Live audio level meter
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        source.connect(analyser);
        audioContextRef.current = ctx;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const tickMeter = () => {
          if (!isRecordingRef.current || !audioContextRef.current) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / Math.max(1, dataArray.length);
          setMicLevel(Math.min(1, avg / 95));
          rafMeterRef.current = requestAnimationFrame(tickMeter);
        };
        rafMeterRef.current = requestAnimationFrame(tickMeter);
      }

      // Real audio MediaRecorder
      const mimeType = pickSupportedAudioMime();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || mimeType || 'audio/webm' });
          setAudioBlob(blob);
          setAudioUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(blob);
          });
        }
      };
      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      return true;
    } catch (err) {
      const name = err?.name || '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setMicWarning('ยังไม่ได้อนุญาตสิทธิ์ไมโครโฟน — กดอนุญาตที่แถบ URL ของเบราว์เซอร์ หรือพิมพ์ข้อความประชุมด้านล่างได้ทันที');
      } else if (name === 'NotFoundError') {
        setMicWarning('ไม่พบอุปกรณ์ไมโครโฟน — สามารถพิมพ์หรือวางข้อความการประชุมด้านล่างได้ทันที');
      } else {
        setMicWarning(`ไม่สามารถเปิดไมโครโฟนได้ (${err instanceof Error ? err.message : 'unknown'})`);
      }
      return false;
    }
  };

  const beginRecordingSession = async (baseStart, clearPrevious) => {
    if (clearPrevious) {
      setStartedAt(baseStart);
      setNow(baseStart);
      setEntries([]);
      setSummary('');
      setSummarySource('');
      setAudioBlob(null);
      setAudioUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return '';
      });
    }
    setMicWarning('');
    setConfirmCancel(false);
    setStatus('recording');
    isRecordingRef.current = true;

    const micGranted = await startAudioCapture();
    if (isRecordingRef.current && speechSupported && (micGranted || !recorderSupported)) {
      startLiveSpeech(baseStart);
    }
  };

  const handleStart = () => {
    beginRecordingSession(Date.now(), true);
  };

  const handlePause = () => {
    stopHardwareAndSpeech(true);
    setStatus('paused');
  };

  const handleResume = () => {
    beginRecordingSession(startedAt, false);
  };

  const handleTranscribeRecordedAudio = async () => {
    if (!audioBlob || transcribingAudio) return;
    setTranscribingAudio(true);
    setMicWarning('');
    try {
      const audioBase64 = await blobToBase64(audioBlob);
      const res = await fetch('/api/meeting-transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64, mimeType: audioBlob.type || 'audio/webm' }),
      });
      const data = await res.json();
      if (data?.ok && data.transcript) {
        const lines = data.transcript
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);
        lines.forEach((line) => appendEntry(line, startedAt));
        onShowToast?.('success', 'ถอดเสียงจากไฟล์อัดสำเร็จ', `เพิ่ม ${lines.length} บรรทัดลงบันทึกการประชุมแล้ว`);
      } else {
        setMicWarning(data?.error || 'ไม่สามารถถอดเสียงจากไฟล์อัดได้');
        onShowToast?.('info', 'ถอดเสียงไม่สำเร็จ', data?.error || 'กรุณาตรวจ GEMINI_API_KEY หรือพิมพ์เพิ่มด้านล่าง');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'เชื่อมต่อระบบถอดเสียงไม่สำเร็จ';
      setMicWarning(msg);
      onShowToast?.('error', 'ถอดเสียงล้มเหลว', msg);
    } finally {
      setTranscribingAudio(false);
    }
  };

  const handleAddManualLine = (e) => {
    e.preventDefault();
    const raw = manualInput.trim();
    if (!raw) return;
    const base = status === 'idle' ? Date.now() : startedAt;
    if (status === 'idle') {
      setStartedAt(base);
      setNow(base);
      setStatus('paused');
    }
    raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => appendEntry(line, base));
    setManualInput('');
  };

  const handleFinishAndSummarize = async () => {
    const pendingText = partialTextRef.current.trim();
    stopHardwareAndSpeech(false);
    const mergedEntries = pendingText
      ? [...entries, { at: Math.max(0, Date.now() - startedAt), text: pendingText }]
      : entries;
    if (pendingText) {
      setEntries(mergedEntries);
    }

    const transcript = formatTranscript(mergedEntries);
    if (!transcript.trim()) {
      setStatus(audioBlob ? 'paused' : 'idle');
      onShowToast?.(
        'info',
        'ยังไม่มีข้อความที่จดไว้',
        audioBlob
          ? 'มีไฟล์เสียงที่อัดไว้แล้ว กดปุ่ม "ถอดเสียงจากไฟล์อัด (AI)" หรือพิมพ์ข้อความเพิ่มเติมได้ครับ'
          : 'กรุณาพูด พิมพ์ หรือวางข้อความการประชุมก่อนกดสรุป'
      );
      return;
    }

    setStatus('summarizing');
    const lastAt = mergedEntries.at(-1)?.at ?? 0;
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
      // Fallback gracefully when running without serverless routes
    }

    setSummary(summarizeMeetingLocally(transcript, mins));
    setSummarySource('Local Smart Summary');
    setStatus('done');
    onShowToast?.('success', 'สรุปการประชุมสำเร็จ', 'ประมวลผลสรุปแบบออฟไลน์เรียบร้อย');
  };

  const handleDiscard = () => {
    stopHardwareAndSpeech(false);
    setEntries([]);
    setSummary('');
    setSummarySource('');
    setMicWarning('');
    setAudioBlob(null);
    setAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return '';
    });
    setConfirmCancel(false);
    setStatus('idle');
    saveDraft({ entries: [], summary: '', summarySource: '', startedAt: Date.now() });
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

  const handleDownloadAudio = () => {
    if (!audioBlob || !audioUrl) return;
    const ext = audioBlob.type.includes('mp4') ? 'm4a' : 'webm';
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `javis-meeting-audio-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const transcriptText = formatTranscript(entries);
  const micBars = [0.45, 0.75, 1.0, 0.85, 0.6, 0.4].map((scale) =>
    status === 'recording' ? Math.max(18, Math.round(micLevel * scale * 100)) : 16
  );

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
                J.A.R.V.I.S. Meeting Notes &amp; Recorder
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                  DUAL ENGINE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                อัดเสียงจริง + ถอดความภาษาไทยสด (th-TH) + สรุปประชุม + บันทึกร่างอัตโนมัติ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopHardwareAndSpeech(true);
              onClose();
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
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
              {status === 'recording' && 'กำลังอัด & จดบันทึก'}
              {status === 'paused' && 'พักการจด'}
              {status === 'summarizing' && 'กำลังสรุป...'}
              {status === 'done' && 'สรุปเสร็จสิ้น'}
            </span>
            {status === 'recording' && (
              <>
                <span className="font-mono text-sm font-bold text-cyan-400 tabular-nums">
                  {formatClock(now - startedAt)}
                </span>
                <span className="inline-flex items-end gap-0.5 h-4" title="ระดับเสียงไมโครโฟนสด">
                  {micBars.map((h, i) => (
                    <span
                      key={i}
                      className="w-1 rounded-full bg-emerald-400 transition-all duration-100"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </span>
              </>
            )}
            <span className="text-xs text-slate-400">
              {entries.length > 0 ? `จดแล้ว ${entries.length} ช่วง` : 'ยังไม่มีข้อความ'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {status === 'idle' && (
              <button
                type="button"
                onClick={handleStart}
                className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors cursor-pointer"
              >
                <Mic className="h-3.5 w-3.5" /> เริ่มอัดเสียงประชุม
              </button>
            )}
            {status === 'recording' && (
              <button
                type="button"
                onClick={handlePause}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 cursor-pointer"
              >
                <Pause className="h-3.5 w-3.5" /> พัก
              </button>
            )}
            {(status === 'paused' || status === 'done') && (
              <button
                type="button"
                onClick={handleResume}
                className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 cursor-pointer"
              >
                <Play className="h-3.5 w-3.5" /> อัด/จดต่อ
              </button>
            )}
            {(entries.length > 0 || Boolean(partialText.trim())) && status !== 'summarizing' && (
              <button
                type="button"
                onClick={handleFinishAndSummarize}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" /> จบและสรุป
              </button>
            )}
            {(entries.length > 0 || audioBlob) && !confirmCancel && (
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" /> ล้าง
              </button>
            )}
            {confirmCancel && (
              <div className="flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-950/60 px-2.5 py-1">
                <span className="text-[11px] text-rose-200">ยืนยันล้างบันทึก?</span>
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="rounded bg-rose-600 px-2 py-0.5 text-[11px] font-bold text-white hover:bg-rose-500 cursor-pointer"
                >
                  ล้างเลย
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmCancel(false)}
                  className="rounded bg-slate-700 px-2 py-0.5 text-[11px] text-slate-200 hover:bg-slate-600 cursor-pointer"
                >
                  เก็บไว้
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-5 space-y-4">
          {micWarning && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-950/30 px-3 py-2.5 text-xs text-amber-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
              <span>{micWarning}</span>
            </div>
          )}

          {!speechSupported && !micWarning && (
            <div className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-950/20 px-3 py-2 text-xs text-cyan-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                เบราว์เซอร์นี้ไม่รองรับการถอดเสียงสด Web Speech — ระบบจะอัดเป็นไฟล์เสียงจริงแล้วกดปุ่มถอดเสียง AI หรือพิมพ์จดด้านล่างได้ครับ
              </span>
            </div>
          )}

          {audioUrl && status !== 'recording' && (
            <div className="rounded-xl border border-cyan-500/30 bg-slate-950/70 p-3 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                  <Volume2 className="h-4 w-4" /> ไฟล์เสียงที่อัดไว้ ({Math.max(1, Math.round((audioBlob?.size || 0) / 1024))} KB)
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={transcribingAudio}
                    onClick={handleTranscribeRecordedAudio}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50 cursor-pointer"
                  >
                    {transcribingAudio ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    ถอดเสียงจากไฟล์อัด (AI)
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadAudio}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] text-slate-200 hover:border-cyan-400 cursor-pointer"
                  >
                    <Download className="h-3 w-3" /> โหลดไฟล์เสียง
                  </button>
                </div>
              </div>
              <audio controls src={audioUrl} className="w-full h-9" />
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
                กด &quot;เริ่มอัดเสียงประชุม&quot; หรือพิมพ์/วางข้อความการประชุมด้านล่างเพื่อเริ่มต้น
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
              className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 cursor-pointer"
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
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:border-emerald-500/50 cursor-pointer"
                >
                  {copiedTarget === 'summary' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedTarget === 'summary' ? 'คัดลอกคำสรุปแล้ว' : 'คัดลอกคำสรุป'}
                </button>
              )}
              <button
                type="button"
                onClick={() => handleCopy('transcript')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:border-cyan-500/50 cursor-pointer"
              >
                {copiedTarget === 'transcript' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedTarget === 'transcript' ? 'คัดลอกบันทึกแล้ว' : 'คัดลอกบันทึกคำพูด'}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-white cursor-pointer"
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

// Meeting Transcript & Export Engine (Ported from D:\AI\Light\Javis)
// Pure browser/Node compatible utilities for live meeting transcription, CRLF document export, and structured summary.

export const MAX_TRANSCRIPT_LENGTH = 80_000;

const pad = (value) => String(value).padStart(2, '0');

/**
 * Format elapsed milliseconds as MM:SS or H:MM:SS.
 * @param {number} elapsedMs
 * @returns {string}
 */
export function formatClock(elapsedMs) {
  const total = Math.max(0, Math.floor(elapsedMs / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}

const formatEntry = (entry) => `[${formatClock(entry.at)}] ${entry.text}`;

/**
 * Convert an array of { at, text } entries into timestamped transcript lines.
 * @param {Array<{at: number, text: string}>} entries
 * @returns {string}
 */
export function formatTranscript(entries) {
  return entries.map(formatEntry).join('\n');
}

/**
 * Compute serialized transcript length without allocating the full string.
 * @param {Array<{at: number, text: string}>} entries
 * @returns {number}
 */
export function transcriptLength(entries) {
  return entries.reduce(
    (length, entry, index) => length + formatEntry(entry).length + (index > 0 ? 1 : 0),
    0
  );
}

/**
 * Calculate rounded meeting duration in minutes.
 * @param {number} startedAt
 * @param {number} endedAt
 * @returns {number}
 */
export function meetingMinutes(startedAt, endedAt) {
  return Math.max(0, Math.round((endedAt - startedAt) / 60_000));
}

/**
 * Human-readable Thai duration string.
 * @param {number} minutes
 * @returns {string}
 */
export function describeDuration(minutes) {
  const total = Math.max(0, Math.round(minutes));
  if (total < 1) return 'ไม่ถึง 1 นาที';

  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (hours === 0) return `${rest} นาที`;
  return rest === 0 ? `${hours} ชั่วโมง` : `${hours} ชั่วโมง ${rest} นาที`;
}

/**
 * Format meeting start timestamp in Thai locale.
 * @param {number} startedAt
 * @param {string} [timeZone]
 * @returns {string}
 */
export function formatMeetingDate(startedAt, timeZone) {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone,
  }).format(new Date(startedAt));
}

/**
 * Generate a filesystem-safe meeting export filename.
 * @param {number} startedAt
 * @returns {string}
 */
export function meetingFileName(startedAt) {
  const date = new Date(startedAt);
  const day = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  return `javis-meeting-${day}-${pad(date.getHours())}${pad(date.getMinutes())}.txt`;
}

/**
 * Build a Windows-friendly CRLF plain-text meeting record.
 * @param {{ summary?: string, transcript: string, minutes: number, startedAt: number }} record
 * @param {string} [timeZone]
 * @returns {string}
 */
export function buildMeetingDocument({ summary, transcript, minutes, startedAt }, timeZone) {
  const summarized = summary?.trim();
  const lines = [
    summarized ? 'สรุปการประชุม' : 'บันทึกการประชุม',
    `เริ่มประชุม: ${formatMeetingDate(startedAt, timeZone)} · ความยาว: ${describeDuration(minutes)}`,
    'จัดทำโดย J.A.R.V.I.S. (CEO Hub) จากเสียง/บันทึกการประชุม อาจมีคำคลาดเคลื่อน ควรตรวจทานก่อนนำไปใช้',
    '',
  ];
  if (summarized) {
    lines.push('คำสรุป', '------', summarized, '');
  }
  lines.push('บันทึกคำพูด', '------', (transcript || '').trim(), '');

  return lines.join('\n').replace(/\r?\n/g, '\r\n');
}

/**
 * Deterministic client-side fallback summarizer when no AI API key is configured.
 * Extracts key lines, decisions, and action items cleanly in Thai.
 * @param {string} transcript
 * @param {number} minutes
 * @returns {string}
 */
export function summarizeMeetingLocally(transcript, minutes = 0) {
  const rawLines = (transcript || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^\[[0-9:]+\]\s*/, '').trim())
    .filter(Boolean);

  if (rawLines.length === 0) {
    return 'ยังไม่มีข้อความสำหรับสรุปการประชุม';
  }

  const actionKeywords = /(ทำ|ส่ง|แก้|ตรวจ|สร้าง|อัปเดต|นัด|เตรียม|อนุมัติ|deploy|fix|todo|action)/i;
  const decisionKeywords = /(สรุป|ตกลง|เลือก|อนุมัติ|ใช้|เปลี่ยน|ยืนยัน|ราคา|งบ|กำหนด)/i;

  const actions = rawLines.filter((l) => actionKeywords.test(l)).slice(0, 5);
  const decisions = rawLines.filter((l) => decisionKeywords.test(l)).slice(0, 5);
  const highlights = rawLines.slice(0, 6);

  const sections = [
    `📌 ภาพรวมการประชุม (${describeDuration(minutes)} · ${rawLines.length} ช่วงคำพูด)`,
    '',
    '🔹 ประเด็นสำคัญ:',
    ...highlights.map((item) => `  • ${item}`),
  ];

  if (decisions.length > 0) {
    sections.push('', '✅ ข้อตกลง / การตัดสินใจ:', ...decisions.map((item) => `  • ${item}`));
  }

  if (actions.length > 0) {
    sections.push('', '🚀 งานที่ต้องดำเนินการต่อ (Action Items):', ...actions.map((item) => `  • ${item}`));
  }

  return sections.join('\n');
}

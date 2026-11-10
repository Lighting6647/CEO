/**
 * Voice Command Shortcut Memory
 * Lets sir ไลท์ teach J.A.R.V.I.S. personal short phrases, e.g.
 *   "จำคำสั่ง ไปออฟฟิศ ให้หมายถึง สภาพจราจรไปสาทรตอนนี้"
 * Then simply saying "ไปออฟฟิศ" runs the full command.
 */

const STORAGE_KEY = 'jarvis_voice_shortcuts_v1';
const MAX_SHORTCUTS = 30;
const MAX_TRIGGER_LEN = 40;
const MAX_COMMAND_LEN = 200;

let memoryStore = [];

const hasStorage = () => {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch {
    return false;
  }
};

/** Normalise speech so small variations still match ("จาร์วิส ไปออฟฟิศครับ" == "ไปออฟฟิศ"). */
export function normalizeTrigger(text = '') {
  return String(text)
    .toLowerCase()
    .replace(/^(?:hey\s+)?(?:javis|jarvis|จาร์วิส|จาวิส|จาวิด)\s*/i, '')
    .replace(/(?:ครับผม|ครับ|ค่ะ|คะ|หน่อย|นะ)+$/g, '')
    .replace(/[\s?？!.,"'“”]+/g, '')
    .trim();
}

export function getShortcuts() {
  if (!hasStorage()) return [...memoryStore];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveShortcuts(list) {
  if (!hasStorage()) {
    memoryStore = [...list];
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    memoryStore = [...list];
  }
}

export function addShortcut(trigger, command) {
  const t = String(trigger || '').trim();
  const c = String(command || '').trim();
  const key = normalizeTrigger(t);

  if (key.length < 2) return { ok: false, error: 'คำสั่งลัดสั้นเกินไป (อย่างน้อย 2 ตัวอักษร)' };
  if (t.length > MAX_TRIGGER_LEN) return { ok: false, error: `คำสั่งลัดยาวเกิน ${MAX_TRIGGER_LEN} ตัวอักษร` };
  if (c.length < 2) return { ok: false, error: 'กรุณาระบุคำสั่งเต็มที่ต้องการให้ทำ' };
  if (c.length > MAX_COMMAND_LEN) return { ok: false, error: `คำสั่งเต็มยาวเกิน ${MAX_COMMAND_LEN} ตัวอักษร` };
  if (normalizeTrigger(c) === key) return { ok: false, error: 'คำสั่งลัดต้องไม่ซ้ำกับคำสั่งเต็ม' };

  const list = getShortcuts().filter((s) => s.key !== key);
  if (list.length >= MAX_SHORTCUTS) return { ok: false, error: `บันทึกได้สูงสุด ${MAX_SHORTCUTS} คำสั่ง` };

  const entry = { key, trigger: t, command: c, createdAt: new Date().toISOString(), uses: 0 };
  saveShortcuts([entry, ...list]);
  return { ok: true, shortcut: entry };
}

export function removeShortcut(triggerOrKey) {
  const key = normalizeTrigger(triggerOrKey);
  const list = getShortcuts();
  const next = list.filter((s) => s.key !== key);
  saveShortcuts(next);
  return next.length !== list.length;
}

/** Returns the expanded command if `text` exactly matches a saved shortcut, else null. */
export function resolveShortcut(text) {
  const key = normalizeTrigger(text);
  if (!key) return null;
  const list = getShortcuts();
  const hit = list.find((s) => s.key === key);
  if (!hit) return null;
  saveShortcuts(list.map((s) => (s.key === key ? { ...s, uses: (s.uses || 0) + 1 } : s)));
  return hit.command;
}

/**
 * Parse a spoken "teach" sentence.
 * Supported:
 *   จำคำสั่ง X ให้หมายถึง Y
 *   ตั้งคำสั่งลัด X ให้หมายถึง Y   (also "=" or "คือ")
 *   ถ้าผมพูดว่า X ให้ Y
 */
export function parseShortcutDefinition(text = '') {
  const src = String(text).trim();
  const patterns = [
    /(?:จำคำสั่ง|ตั้งคำสั่งลัด|เพิ่มคำสั่งลัด|สร้างคำสั่งลัด)\s*["“]?(.+?)["”]?\s*(?:ให้หมายถึง|หมายถึง|คือ|=)\s*(.+)$/,
    /(?:ถ้า|เวลา)(?:ผม|ฉัน)?พูดว่า\s*["“]?(.+?)["”]?\s*ให้\s*(.+)$/,
  ];
  for (const re of patterns) {
    const m = src.match(re);
    if (m && m[1].trim() && m[2].trim()) {
      return { trigger: m[1].trim(), command: m[2].trim() };
    }
  }
  return null;
}

/** Parse "ลบคำสั่งลัด X" -> "X" */
export function parseShortcutRemoval(text = '') {
  const m = String(text).trim().match(/^(?:ลบ|ยกเลิก)คำสั่งลัด\s*["“]?(.+?)["”]?$/);
  return m ? m[1].trim() : null;
}

export function isListShortcutsCommand(text = '') {
  return /(?:ดู|แสดง|รายการ|มี)คำสั่งลัด/.test(String(text));
}

export function __resetShortcutsForTests() {
  memoryStore = [];
}

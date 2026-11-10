/**
 * Route & traffic helpers for J.A.R.V.I.S.
 * Pure functions (no DOM) so they can be unit-tested under Node.
 */

const TRAFFIC_KEYWORDS = [
  'จราจร',
  'เส้นทาง',
  'ทางด่วน',
  'รถติด',
  'นำทาง',
  'มอเตอร์เวย์',
  'ถนน',
  'แผนที่',
  'เปิดแผนที่',
  'ดูแผนที่',
  'กางแผนที่',
  'แมพ',
  'google maps',
  'map',
  'maps',
  'traffic',
  'route',
];

// Trailing conversational words that are not part of a place name
const TRAILING_FILLERS = [
  'เป็นยังไงบ้าง',
  'เป็นอย่างไรบ้าง',
  'เป็นยังไง',
  'เป็นอย่างไร',
  'ยังไงดี',
  'ยังไง',
  'อย่างไร',
  'ติดไหม',
  'ติดมั้ย',
  'ติดหรือเปล่า',
  'กี่นาที',
  'ใช้เวลาเท่าไหร่',
  'ทางไหนดี',
  'ทางไหน',
  'ตอนนี้',
  'บ้าง',
  'หน่อย',
  'ครับ',
  'คะ',
  'ค่ะ',
  'นะ',
  'ดี',
];

export function isTrafficText(text = '') {
  const lower = String(text).toLowerCase();
  return TRAFFIC_KEYWORDS.some((k) => lower.includes(k));
}

/**
 * Extract a destination from a Thai/English route question.
 * "การจราจรไปสยามพารากอนเป็นยังไงบ้าง" -> "สยามพารากอน"
 * Returns null when no destination can be identified.
 */
export function extractDestination(text = '') {
  const src = String(text).trim();
  if (!src) return null;

  // Use the LAST destination marker (ไป / ถึง / to) so "ออกจากบ้านไปสยาม" -> "สยาม"
  const match = src.match(/^.*(?:ไปยัง|ไปที่|ไป|ถึง|\bto\s+)(.+)$/i);
  if (!match) return null;

  let dest = match[1].trim();
  let changed = true;
  while (changed && dest) {
    changed = false;
    for (const filler of TRAILING_FILLERS) {
      if (dest.endsWith(filler) && dest.length > filler.length) {
        dest = dest.slice(0, -filler.length).trim();
        changed = true;
      }
    }
  }

  dest = dest.replace(/[?？!.,]+$/g, '').trim();
  if (dest.length < 2) return null;
  return dest;
}

/** Google Maps embed URL (no API key required) centred on the destination. */
export function buildMapEmbedUrl(destination) {
  const q = destination ? `${destination} กรุงเทพ` : 'กรุงเทพมหานคร';
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=13&output=embed`;
}

/** Opens live turn-by-turn navigation with real-time traffic colours in Google Maps. */
export function buildDirectionsUrl(destination) {
  const base = 'https://www.google.com/maps/dir/?api=1&travelmode=driving';
  return destination ? `${base}&destination=${encodeURIComponent(destination)}` : base;
}

// System Web Browser Launcher Service for J.A.R.V.I.S.
// Authorized by sir ไลท์ (Level 5 Supreme Clearance)

const KNOWN_WEB_SHORTCUTS = {
  // Navigation & Google Maps (Specific longer key matches prioritized)
  'google maps': 'https://maps.google.com',
  'google map': 'https://maps.google.com',
  'กูเกิลแมพ': 'https://maps.google.com',
  'กูเกิล แมพ': 'https://maps.google.com',
  gmap: 'https://maps.google.com',
  gmaps: 'https://maps.google.com',
  แผนที่: 'https://maps.google.com',
  แมพ: 'https://maps.google.com',
  maps: 'https://maps.google.com',
  map: 'https://maps.google.com',

  // Google Search
  กูเกิล: 'https://www.google.com',
  google: 'https://www.google.com',

  // Video & Code & Social
  ยูทูป: 'https://www.youtube.com',
  youtube: 'https://www.youtube.com',
  กิตฮับ: 'https://github.com',
  github: 'https://github.com',
  เฟสบุ๊ค: 'https://www.facebook.com',
  facebook: 'https://www.facebook.com',
  ทวิตเตอร์: 'https://x.com',
  twitter: 'https://x.com',
  เอ็กซ์: 'https://x.com',
  ติ๊กต๊อก: 'https://www.tiktok.com',
  tiktok: 'https://www.tiktok.com',
  พันทิป: 'https://pantip.com',
  pantip: 'https://pantip.com',
  สนุก: 'https://www.sanook.com',
  sanook: 'https://www.sanook.com',
  ไทยรัฐ: 'https://www.thairath.co.th',
  thairath: 'https://www.thairath.co.th',

  // AI & Productivity & Commerce
  chatgpt: 'https://chatgpt.com',
  แชทจีพีที: 'https://chatgpt.com',
  openai: 'https://openai.com',
  จีเมล: 'https://mail.google.com',
  gmail: 'https://mail.google.com',
  ช้อปปี้: 'https://shopee.co.th',
  ช็อปปี้: 'https://shopee.co.th',
  shopee: 'https://shopee.co.th',
  ลาซาด้า: 'https://lazada.co.th',
  lazada: 'https://lazada.co.th',
  เน็ตฟลิกซ์: 'https://www.netflix.com',
  netflix: 'https://www.netflix.com',
  แคนวา: 'https://www.canva.com',
  canva: 'https://www.canva.com',
  โนชั่น: 'https://www.notion.so',
  notion: 'https://www.notion.so',
  vercel: 'https://vercel.com',
};

/**
 * Extract target URL and name from user voice or text input
 */
export function extractWebTarget(prompt) {
  if (!prompt || typeof prompt !== 'string') return null;
  const clean = prompt.trim();
  const lower = clean.toLowerCase();

  // 1. Direct explicit URL match (http, https, www, or domain.tld)
  const explicitUrlRegex = /(?:https?:\/\/|www\.)[^\s]+|[a-zA-Z0-9-]+\.(?:com|org|net|co\.th|in\.th|io|dev|app|ai|me)[^\s]*/i;
  const match = clean.match(explicitUrlRegex);
  if (match) {
    let url = match[0];
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    return {
      url,
      name: match[0],
      isDirectUrl: true,
    };
  }

  // 2. Known service name match (Sort by key length descending so 'google map' matches before 'google')
  const noSpace = lower.replace(/\s+/g, '');
  const sortedShortcuts = Object.entries(KNOWN_WEB_SHORTCUTS).sort(
    (a, b) => b[0].length - a[0].length
  );
  for (const [key, targetUrl] of sortedShortcuts) {
    const keyNoSpace = key.replace(/\s+/g, '');
    if (lower.includes(key) || (keyNoSpace.length >= 3 && noSpace.includes(keyNoSpace))) {
      return {
        url: targetUrl,
        name: key,
        isDirectUrl: false,
      };
    }
  }

  // 3. Search query fallback: "เปิดหา ... บนกูเกิล" or "ค้นหา ..."
  if (lower.startsWith('ค้นหา') || lower.startsWith('หาเว็บ') || lower.includes('ค้นในเน็ต')) {
    const q = clean.replace(/^(ค้นหา|หาเว็บ|ค้นในเน็ต|เสิร์ช)\s*/i, '').trim();
    if (q) {
      return {
        url: `https://www.google.com/search?q=${encodeURIComponent(q)}`,
        name: `ค้นหากูเกิล: ${q}`,
        isDirectUrl: false,
      };
    }
  }

  return null;
}

/**
 * Check if the user command is asking to open a website or browser
 */
export function isBrowserOpenCommand(prompt) {
  if (!prompt || typeof prompt !== 'string') return false;
  const lower = prompt.toLowerCase();
  const noSpace = lower.replace(/\s+/g, '');
  const openKeywords = [
    'สั่งเปิด',
    'สั่งให้เปิด',
    'เปิดเว็บ',
    'เปิดเวบ',
    'เปิดเว็บไซต์',
    'เปิดเว็บไซค์',
    'เปิดหน้าเว็บ',
    'เปิดเบราว์เซอร์',
    'เปิด browser',
    'เปิดกูเกิล',
    'เปิด google',
    'เปิดยูทูป',
    'เปิด youtube',
    'เปิดกิตฮับ',
    'เปิด github',
    'เปิดแผนที่',
    'เปิด maps',
    'เปิด map',
    'เปิด gmap',
    'เปิดแมพ',
    'เปิดกูเกิลแมพ',
    'กูเกิลแมพ',
    'google map',
    'google maps',
    'เข้าเว็บ',
    'เข้าเว็บไซต์',
    'เข้าหน้าเว็บ',
  ];

  if (openKeywords.some((kw) => lower.includes(kw) || noSpace.includes(kw.replace(/\s+/g, '')))) {
    return true;
  }

  // Also check if prompt starts with "เปิด " followed by a domain
  if (/^เปิด\s+[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/i.test(prompt.trim())) {
    return true;
  }

  return false;
}

/**
 * Synchronously open a URL in a new tab. MUST be called inside a user gesture
 * (click / submit / keypress) or browsers will block the popup.
 * Note: passing 'noopener' in the features string makes window.open() ALWAYS return null,
 * so we open without it and detach the opener manually to keep the same security guarantee.
 * Returns { opened: boolean, blocked: boolean, url }.
 */
export function openUrlSync(targetUrl) {
  if (!targetUrl || typeof window === 'undefined') {
    return { opened: false, blocked: false, url: targetUrl || '' };
  }
  let finalUrl = String(targetUrl).trim();
  if (!/^https?:\/\//i.test(finalUrl)) finalUrl = `https://${finalUrl}`;

  try {
    const win = window.open(finalUrl, '_blank');
    if (win) {
      try {
        win.opener = null;
      } catch {
        // Cross-origin opener detach may throw in some browsers; safe to ignore
      }
      return { opened: true, blocked: false, url: finalUrl };
    }
  } catch (err) {
    console.warn('[openUrlSync]:', err.message);
  }
  return { opened: false, blocked: true, url: finalUrl };
}

/**
 * Open external website via client browser window or backend OS launcher.
 * Synchronous client window opening is performed first to guarantee browser popup blockers
 * (Chrome, Safari, Edge, Mobile) do not block the window due to async latency.
 */
export async function openSystemBrowser(targetUrl) {
  if (!targetUrl) return { success: false, error: 'URL is required' };

  // 1. Client synchronous launch (runs before any await, so user-gesture activation is preserved)
  const clientResult = openUrlSync(targetUrl);
  const finalUrl = clientResult.url;

  // 2. Background server endpoint notification (non-blocking; opens OS browser when local server runs)
  if (typeof fetch !== 'undefined') {
    fetch('/api/browser/open', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: finalUrl }),
    }).catch(() => {});
  }

  // 3. Dispatch an in-app global event so any listener (e.g. HUD, Toast, or Banner)
  // knows whether the window opened successfully or was blocked by the browser.
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(
        new CustomEvent('jarvis:browser_opened', {
          detail: {
            url: finalUrl,
            opened: clientResult.opened,
            blocked: clientResult.blocked,
          },
        })
      );
    } catch {}
  }

  return {
    success: clientResult.opened,
    blocked: clientResult.blocked,
    url: finalUrl,
    mode: clientResult.opened ? 'client_window' : 'background_dispatched',
    message: clientResult.opened
      ? `เปิดเว็บไซต์ ${finalUrl} เรียบร้อยครับ`
      : `เบราว์เซอร์บล็อกการเปิดแท็บใหม่ กรุณากดลิงก์เพื่อเปิด ${finalUrl}`,
  };
}

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
  ยูทูบ: 'https://www.youtube.com',
  youtube: 'https://www.youtube.com',
  yt: 'https://www.youtube.com',
  กิตฮับ: 'https://github.com',
  กิทฮับ: 'https://github.com',
  github: 'https://github.com',
  git: 'https://github.com',
  เฟสบุ๊ค: 'https://www.facebook.com',
  เฟสบุค: 'https://www.facebook.com',
  เฟซบุ๊ก: 'https://www.facebook.com',
  facebook: 'https://www.facebook.com',
  fb: 'https://www.facebook.com',
  ทวิตเตอร์: 'https://x.com',
  twitter: 'https://x.com',
  เอ็กซ์: 'https://x.com',
  x: 'https://x.com',
  ติ๊กต๊อก: 'https://www.tiktok.com',
  ติ๊กตอก: 'https://www.tiktok.com',
  tiktok: 'https://www.tiktok.com',
  พันทิป: 'https://pantip.com',
  pantip: 'https://pantip.com',
  สนุก: 'https://www.sanook.com',
  sanook: 'https://www.sanook.com',
  ไทยรัฐ: 'https://www.thairath.co.th',
  thairath: 'https://www.thairath.co.th',
  ข่าวสด: 'https://www.khaosod.co.th',
  khaosod: 'https://www.khaosod.co.th',
  มติชน: 'https://www.matichon.co.th',
  matichon: 'https://www.matichon.co.th',
  เดลินิวส์: 'https://www.dailynews.co.th',
  dailynews: 'https://www.dailynews.co.th',
  bbc: 'https://www.bbc.com',
  cnn: 'https://www.cnn.com',
  reuters: 'https://www.reuters.com',
  วิกิพีเดีย: 'https://th.wikipedia.org',
  วิกิ: 'https://th.wikipedia.org',
  wikipedia: 'https://th.wikipedia.org',
  อินสตาแกรม: 'https://www.instagram.com',
  instagram: 'https://www.instagram.com',
  ไอจี: 'https://www.instagram.com',
  ig: 'https://www.instagram.com',
  ไลน์: 'https://line.me',
  line: 'https://line.me',
  สปอติฟาย: 'https://open.spotify.com',
  spotify: 'https://open.spotify.com',

  // AI & Productivity & Commerce
  chatgpt: 'https://chatgpt.com',
  แชทจีพีที: 'https://chatgpt.com',
  openai: 'https://openai.com',
  เจมินาย: 'https://gemini.google.com',
  เจมิไน: 'https://gemini.google.com',
  gemini: 'https://gemini.google.com',
  โคลด: 'https://claude.ai',
  claude: 'https://claude.ai',
  ดีพซีค: 'https://chat.deepseek.com',
  deepseek: 'https://chat.deepseek.com',
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
  tradingview: 'https://www.tradingview.com',
  กราฟหุ้น: 'https://www.tradingview.com',
  หุ้น: 'https://www.settrade.com',
  ตลาดหลักทรัพย์: 'https://www.set.or.th',
  set: 'https://www.set.or.th',
  พยากรณ์อากาศ: 'https://www.tmd.go.th',
  กรมอุตุ: 'https://www.tmd.go.th',
  เรดาร์ฝน: 'https://weather.bangkok.go.th',
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

  // 4. Universal "เปิด [อะไรก็ตาม]" fallback for voice commands:
  // e.g. "เปิด รถไฟฟ้าสายสีส้ม", "เปิด ข่าวสด", "เปิด เว็บ bbc"
  const openActionMatch = clean.match(
    /^(?:สั่งเปิด|สั่งให้เปิด|เปิดเว็บ|เปิดเวบ|เปิดหน้าเว็บ|เปิดเว็บไซต์|เปิดเว็บไซค์|เปิดดูเว็บ|เปิดหาเว็บ|เปิด|เข้าเว็บ|เข้าเว็บไซต์|เข้า)\s+(.+)$/i
  );
  if (openActionMatch) {
    const rawTarget = openActionMatch[1].trim();
    const isInternal = /^(?:โหมด|เสียง|เรดอเลิร์ท|ใบเสนอราคา|พอดแคสต์|วิดีโอ|สรุป|กล้อง|ไมค์|ธีม)/i.test(
      rawTarget
    );
    if (!isInternal && rawTarget.length > 0) {
      if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/i.test(rawTarget)) {
        return {
          url: `https://${rawTarget}`,
          name: rawTarget,
          isDirectUrl: true,
        };
      }
      return {
        url: `https://www.google.com/search?q=${encodeURIComponent(rawTarget)}`,
        name: rawTarget,
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
  const lower = prompt.toLowerCase().trim();
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

  // Check open action + extractWebTarget
  const openActionMatch = lower.match(
    /^(?:สั่งเปิด|สั่งให้เปิด|เปิดเว็บ|เปิดเวบ|เปิดหน้าเว็บ|เปิดเว็บไซต์|เปิดดูเว็บ|เปิดหาเว็บ|เปิด|เข้าเว็บ|เข้าเว็บไซต์|เข้า|open\s+|launch\s+|browse\s+)\s+(.+)$/i
  );
  if (openActionMatch) {
    const rawTarget = openActionMatch[1].trim();
    const isInternal = /^(?:โหมด|เสียง|เรดอเลิร์ท|ใบเสนอราคา|พอดแคสต์|วิดีโอ|สรุป|กล้อง|ไมค์|ธีม)/i.test(
      rawTarget
    );
    if (!isInternal && rawTarget.length > 0) {
      return true;
    }
  }

  // Also check if prompt starts with "เปิด " followed by a domain
  if (/^เปิด\s+[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/i.test(prompt.trim())) {
    return true;
  }

  // Domain match with open intention
  if (
    /(?:https?:\/\/|www\.)[^\s]+|[a-zA-Z0-9-]+\.(?:com|org|net|co\.th|in\.th|io|dev|app|ai|me)[^\s]*/i.test(
      prompt
    )
  ) {
    if (lower.includes('เปิด') || lower.includes('เข้า') || lower.includes('ดู') || lower.includes('ไป')) {
      return true;
    }
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

  let opened = false;
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

  // Fallback: Programmatic hidden anchor dispatch for browsers restricting direct window.open
  if (typeof document !== 'undefined') {
    try {
      const a = document.createElement('a');
      a.href = finalUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      opened = true;
    } catch (e) {
      console.warn('[openUrlSync anchor click]:', e.message);
    }
  }

  return { opened, blocked: !opened, url: finalUrl };
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

/**
 * Feature 3: One-Voice Multi-Tab Launcher Work Mode Presets
 */
export const WORK_MODE_PRESETS = [
  {
    id: 'morning',
    name: 'โหมดทำงานยามเช้า (Morning Executive Mode)',
    keywords: ['โหมดเช้า', 'ทำงานเช้า', 'ยามเช้า', 'morning mode', 'morning work', 'โหมดทำงาน'],
    tabs: [
      { name: 'Gmail (กล่องจดหมาย)', url: 'https://mail.google.com' },
      { name: 'GitHub (โปรเจกต์งาน)', url: 'https://github.com' },
      { name: 'ข่าวเศรษฐกิจ (ไทยรัฐ Money)', url: 'https://www.thairath.co.th/money' },
    ],
    speech: (userTitle) =>
      `เปิดโหมดทำงานยามเช้าให้ ${userTitle} เรียบร้อยครับ กำลังเปิด Gmail, GitHub และข่าวเศรษฐกิจพร้อมกัน 3 แท็บครับ`,
  },
  {
    id: 'dev',
    name: 'โหมดพัฒนาโปรแกรม (Full-Stack Dev Mode)',
    keywords: ['โหมดเขียนโค้ด', 'โหมดเดฟ', 'โหมดพัฒนา', 'dev mode', 'coding mode', 'โหมดโปรแกรมเมอร์'],
    tabs: [
      { name: 'GitHub Repositories', url: 'https://github.com' },
      { name: 'ChatGPT AI Assistant', url: 'https://chatgpt.com' },
      { name: 'Vercel Deployment Dashboard', url: 'https://vercel.com' },
    ],
    speech: (userTitle) =>
      `เปิดโหมดพัฒนาโปรแกรมให้ ${userTitle} เรียบร้อยครับ เตรียมพร้อม GitHub, ChatGPT และ Vercel ให้เรียบร้อยครับ`,
  },
  {
    id: 'sales',
    name: 'โหมดการค้าและการตลาด (Sales & E-Commerce Mode)',
    keywords: ['โหมดขาย', 'โหมดการตลาด', 'โหมดค้าขาย', 'sales mode', 'marketing mode', 'โหมดแอด'],
    tabs: [
      { name: 'Shopee Seller Centre', url: 'https://seller.shopee.co.th' },
      { name: 'Facebook Ads Manager', url: 'https://adsmanager.facebook.com' },
      { name: 'TikTok Business Center', url: 'https://business.tiktok.com' },
    ],
    speech: (userTitle) =>
      `เปิดโหมดการค้าและการตลาดให้ ${userTitle} เรียบร้อยครับ เปิด Shopee, Facebook Ads และ TikTok ให้เรียบร้อยครับ`,
  },
  {
    id: 'relax',
    name: 'โหมดพักผ่อนและบันเทิง (Relaxation & Leisure Mode)',
    keywords: ['โหมดพักผ่อน', 'โหมดผ่อนคลาย', 'โหมดบันเทิง', 'relax mode', 'leisure mode', 'โหมดดูหนัง'],
    tabs: [
      { name: 'YouTube Music & Videos', url: 'https://www.youtube.com' },
      { name: 'Netflix Movies', url: 'https://www.netflix.com' },
      { name: 'Pantip Community', url: 'https://pantip.com' },
    ],
    speech: (userTitle) =>
      `เปิดโหมดพักผ่อนให้ ${userTitle} เรียบร้อยครับ เปิด YouTube, Netflix และ Pantip ให้เรียบร้อยครับ`,
  },
];

/**
 * Detect whether prompt matches a Work Mode Preset
 */
export function detectWorkModePreset(prompt) {
  if (!prompt || typeof prompt !== 'string') return null;
  const lower = prompt.toLowerCase();
  const noSpace = lower.replace(/\s+/g, '');

  for (const preset of WORK_MODE_PRESETS) {
    if (preset.keywords.some((kw) => lower.includes(kw) || noSpace.includes(kw.replace(/\s+/g, '')))) {
      return preset;
    }
  }
  return null;
}

/**
 * Launch multiple tabs sequentially for a work mode preset
 */
export function launchWorkModePreset(preset) {
  if (!preset || !Array.isArray(preset.tabs)) return [];
  const results = [];
  preset.tabs.forEach((tab, index) => {
    // Open first tab synchronously to preserve user gesture
    if (index === 0) {
      const res = openUrlSync(tab.url);
      results.push({ ...tab, opened: res.opened });
    } else {
      setTimeout(() => {
        openUrlSync(tab.url);
      }, index * 250);
      results.push({ ...tab, opened: true });
    }
  });
  return results;
}

/**
 * Detect split-screen in-HUD web command (e.g. "ดูเว็บในจอ", "เปิดเว็บในจอ", "พรีวิวเว็บ")
 */
export function isSplitScreenWebCommand(prompt) {
  if (!prompt || typeof prompt !== 'string') return false;
  const lower = prompt.toLowerCase();
  const noSpace = lower.replace(/\s+/g, '');
  const splitKeywords = [
    'ในจอ',
    'บนจอ',
    'จอhud',
    'จอฮัด',
    'พรีวิวเว็บ',
    'ดูเว็บในจอ',
    'เปิดเว็บในจอ',
    'แบ่งจอ',
    'เว็บย่อย',
    'splitscreen',
    'split-screen',
    'pip',
  ];
  return splitKeywords.some((kw) => lower.includes(kw) || noSpace.includes(kw));
}

/**
 * Feature 1: Detect voice navigation / scroll commands for active In-HUD web view
 */
export function parseWebNavigationVoiceCommand(prompt) {
  if (!prompt || typeof prompt !== 'string') return null;
  const lower = prompt.toLowerCase().trim();
  const noSpace = lower.replace(/\s+/g, '');

  if (
    lower.includes('เลื่อนลง') ||
    noSpace.includes('เลื่อนลง') ||
    lower.includes('เลื่อนจอลง') ||
    lower.includes('ลงข้างล่าง') ||
    lower.includes('scroll down')
  ) {
    return { action: 'scroll-down', label: 'เลื่อนหน้าเว็บลง' };
  }

  if (
    lower.includes('เลื่อนขึ้น') ||
    noSpace.includes('เลื่อนขึ้น') ||
    lower.includes('เลื่อนจอขึ้น') ||
    lower.includes('ขึ้นข้างบน') ||
    lower.includes('scroll up')
  ) {
    return { action: 'scroll-up', label: 'เลื่อนหน้าเว็บขึ้น' };
  }

  if (
    lower.includes('บนสุด') ||
    noSpace.includes('บนสุด') ||
    lower.includes('เลื่อนไปบนสุด') ||
    lower.includes('scroll top')
  ) {
    return { action: 'scroll-top', label: 'เลื่อนไปด้านบนสุด' };
  }

  if (
    lower.includes('ล่างสุด') ||
    noSpace.includes('ล่างสุด') ||
    lower.includes('เลื่อนไปล่างสุด') ||
    lower.includes('scroll bottom')
  ) {
    return { action: 'scroll-bottom', label: 'เลื่อนไปด้านล่างสุด' };
  }

  if (
    lower.includes('ขยายเว็บ') ||
    lower.includes('ขยายเต็มจอ') ||
    noSpace.includes('ขยายจอ') ||
    lower.includes('maximize web')
  ) {
    return { action: 'maximize', label: 'ขยายหน้าต่างเว็บเต็มจอ' };
  }

  if (
    lower.includes('ย่อเว็บ') ||
    lower.includes('ย่อหน้าต่าง') ||
    noSpace.includes('ย่อจอ') ||
    lower.includes('minimize web')
  ) {
    return { action: 'minimize', label: 'ย่อหน้าต่างเว็บลงเป็น PiP' };
  }

  if (
    lower.includes('รีเฟรชเว็บ') ||
    lower.includes('รีโหลดเว็บ') ||
    lower.includes('โหลดหน้าใหม่') ||
    lower.includes('reload web')
  ) {
    return { action: 'reload', label: 'รีเฟรชหน้าเว็บใหม่' };
  }

  return null;
}

/**
 * Feature 2: Detect Reader Mode & AdBlock toggle voice commands
 */
export function isWebReaderModeCommand(prompt) {
  if (!prompt || typeof prompt !== 'string') return false;
  const lower = prompt.toLowerCase();
  const noSpace = lower.replace(/\s+/g, '');
  const keywords = [
    'โหมดอ่าน',
    'โหมดอ่านสบายตา',
    'สบายตา',
    'ตัดโฆษณา',
    'เปิดแอดบล็อก',
    'ปิดโฆษณา',
    'reader mode',
    'readermode',
    'adblock',
    'ad block',
  ];
  return keywords.some((kw) => lower.includes(kw) || noSpace.includes(kw.replace(/\s+/g, '')));
}

/**
 * Feature 3: Detect Dual-Pane Web HUD commands (e.g. "เปิดจอคู่", "โหมดจอคู่", "แบ่งสองจอ", "เปรียบเทียบเว็บ")
 */
export function isDualPaneWebCommand(prompt) {
  if (!prompt || typeof prompt !== 'string') return false;
  const lower = prompt.toLowerCase();
  const noSpace = lower.replace(/\s+/g, '');
  const dualKeywords = [
    'เปิดจอคู่',
    'โหมดจอคู่',
    'แบ่งสองจอ',
    'แบ่ง2จอ',
    'ดูสองเว็บ',
    'ดู2เว็บ',
    'จอคู่',
    'dual screen',
    'dual view',
    'dual pane',
    'split dual',
    'เปรียบเทียบเว็บ',
  ];
  return dualKeywords.some((kw) => lower.includes(kw) || noSpace.includes(kw.replace(/\s+/g, '')));
}

/**
 * Extract 2 website targets for Dual-Pane mode
 * e.g. "เปิดจอคู่ กราฟหุ้น กับ ข่าวเศรษฐกิจ"
 */
export function parseDualPaneTargets(prompt) {
  if (!prompt || typeof prompt !== 'string') return null;
  const clean = prompt
    .replace(/^(?:เปิดจอคู่|โหมดจอคู่|แบ่งสองจอ|ดูสองเว็บ|จอคู่)\s*/i, '')
    .trim();

  // Check if partitioned by "กับ" or "และ" or "คู่กับ" or "vs" or "and"
  const splitParts = clean.split(/\s*(?:คู่กับ|กับ|และ|เทียบกับ|vs|and)\s*/i);
  if (splitParts.length >= 2 && splitParts[0] && splitParts[1]) {
    const target1 = extractWebTarget(splitParts[0]) || {
      url: 'https://www.tradingview.com',
      name: splitParts[0].trim(),
    };
    const target2 = extractWebTarget(splitParts[1]) || {
      url: 'https://www.thairath.co.th/money',
      name: splitParts[1].trim(),
    };
    return { target1, target2 };
  }

  // Default Preset: Stock Chart + Financial News
  return {
    target1: { url: 'https://www.tradingview.com', name: 'TradingView กราฟหุ้น' },
    target2: { url: 'https://www.thairath.co.th/money', name: 'ข่าวเศรษฐกิจไทยรัฐ' },
  };
}

/**
 * Dispatch navigation event to In-HUD Split-Screen component
 */
export function dispatchWebNavigation(action, target = null) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('jarvis:web_nav', {
        detail: { action, target },
      })
    );
  }
}


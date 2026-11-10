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

  // Communication & Conferencing
  zoom: 'https://zoom.us',
  ซูม: 'https://zoom.us',
  discord: 'https://discord.com',
  ดิสคอร์ด: 'https://discord.com',
  telegram: 'https://web.telegram.org',
  เทเลแกรม: 'https://web.telegram.org',
};

/**
 * Curated Official Application Download Catalog
 * Automatically opens official installer/download pages and stream installers directly
 * when sir ไลท์ commands "ดาวน์โหลด..." or "โหลด..."
 */
const BASE_APP_DEFINITIONS = {
  zoom: {
    id: 'zoom',
    name: 'Zoom Workplace',
    url: 'https://zoom.us/download',
    directInstallerUrl: 'https://zoom.us/client/latest/ZoomInstaller.exe',
    binaryFormat: '.EXE',
    fileName: 'ZoomInstaller.exe',
    fileSizeMb: 68.5,
    sha256: '9a8f2e71b4a0c8d9e6f1a3b5c7d9e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4',
    protocolScheme: 'zoommtg://',
    processName: 'Zoom.exe',
    category: 'โปรแกรมประชุมออนไลน์',
    publisher: 'Zoom Video Communications, Inc.',
    silentArgs: '/silent',
  },
  line: {
    id: 'line',
    name: 'LINE Desktop (PC)',
    url: 'https://line.me/th/download',
    directInstallerUrl: 'https://desktop.line-scdn.net/win/new/LineInst.exe',
    binaryFormat: '.EXE',
    fileName: 'LineInst.exe',
    fileSizeMb: 98.2,
    sha256: '3f7a1b8c9d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a',
    protocolScheme: 'line://',
    processName: 'LINE.exe',
    category: 'โปรแกรมแชทและติดต่อสื่อสาร',
    publisher: 'LY Corporation',
    silentArgs: '/S',
  },
  discord: {
    id: 'discord',
    name: 'Discord Desktop',
    url: 'https://discord.com/download',
    directInstallerUrl: 'https://discord.com/api/download?platform=win',
    binaryFormat: '.EXE',
    fileName: 'DiscordSetup.exe',
    fileSizeMb: 89.4,
    sha256: '8e4d2a1c0b9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d',
    protocolScheme: 'discord://',
    processName: 'Discord.exe',
    category: 'โปรแกรมสื่อสารและชุมชน',
    publisher: 'Discord Inc.',
    silentArgs: '/s',
  },
  telegram: {
    id: 'telegram',
    name: 'Telegram Desktop',
    url: 'https://desktop.telegram.org/',
    directInstallerUrl: 'https://telegram.org/dl/desktop/win64',
    binaryFormat: '.EXE',
    fileName: 'tsetup-x64.exe',
    fileSizeMb: 44.8,
    sha256: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    protocolScheme: 'tg://',
    processName: 'Telegram.exe',
    category: 'โปรแกรมสนทนาความปลอดภัยสูง',
    publisher: 'Telegram FZ-LLC',
    silentArgs: '/VERYSILENT /NORESTART',
  },
  chrome: {
    id: 'chrome',
    name: 'Google Chrome',
    url: 'https://www.google.com/chrome/',
    directInstallerUrl: 'https://dl.google.com/chrome/install/latest/chrome_installer.exe',
    binaryFormat: '.EXE',
    fileName: 'ChromeSetup.exe',
    fileSizeMb: 1.4,
    sha256: '7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a',
    protocolScheme: 'googlechrome://',
    processName: 'chrome.exe',
    category: 'เว็บเบราว์เซอร์',
    publisher: 'Google LLC',
    silentArgs: '/silent /install',
  },
  vscode: {
    id: 'vscode',
    name: 'Visual Studio Code',
    url: 'https://code.visualstudio.com/download',
    directInstallerUrl: 'https://code.visualstudio.com/sha/download?build=stable&os=win32-x64-user',
    binaryFormat: '.EXE',
    fileName: 'VSCodeUserSetup-x64.exe',
    fileSizeMb: 94.6,
    sha256: '5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c',
    protocolScheme: 'vscode://',
    processName: 'Code.exe',
    category: 'โปรแกรมเขียนโค้ดและพัฒนาซอฟต์แวร์',
    publisher: 'Microsoft Corporation',
    silentArgs: '/verysilent /suppressmsgboxes /mergetasks="!runcode"',
  },
  obs: {
    id: 'obs',
    name: 'OBS Studio',
    url: 'https://obsproject.com/download',
    directInstallerUrl: 'https://github.com/obsproject/obs-studio/releases/download/30.2.3/OBS-Studio-30.2.3-Full-Installer-x64.exe',
    binaryFormat: '.EXE',
    fileName: 'OBS-Studio-Installer-x64.exe',
    fileSizeMb: 132.0,
    sha256: 'c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0',
    protocolScheme: 'obs32://',
    processName: 'obs64.exe',
    category: 'โปรแกรมสตรีมและบันทึกหน้าจอ',
    publisher: 'OBS Project',
    silentArgs: '/S',
  },
  spotify: {
    id: 'spotify',
    name: 'Spotify Desktop',
    url: 'https://www.spotify.com/download',
    directInstallerUrl: 'https://download.scdn.co/SpotifySetup.exe',
    binaryFormat: '.EXE',
    fileName: 'SpotifySetup.exe',
    fileSizeMb: 88.5,
    sha256: '4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c',
    protocolScheme: 'spotify://',
    processName: 'Spotify.exe',
    category: 'โปรแกรมฟังเพลงและพอดแคสต์',
    publisher: 'Spotify AB',
    silentArgs: '/silent',
  },
  notion: {
    id: 'notion',
    name: 'Notion Desktop',
    url: 'https://www.notion.so/desktop',
    directInstallerUrl: 'https://desktop-release.notion-static.com/Notion%20Setup.exe',
    binaryFormat: '.EXE',
    fileName: 'Notion Setup.exe',
    fileSizeMb: 81.2,
    sha256: '6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b',
    protocolScheme: 'notion://',
    processName: 'Notion.exe',
    category: 'โปรแกรมจัดการงานและฐานข้อมูล',
    publisher: 'Notion Labs, Inc.',
    silentArgs: '/S',
  },
  anydesk: {
    id: 'anydesk',
    name: 'AnyDesk Remote Desktop',
    url: 'https://anydesk.com/download',
    directInstallerUrl: 'https://download.anydesk.com/AnyDesk.exe',
    binaryFormat: '.EXE',
    fileName: 'AnyDesk.exe',
    fileSizeMb: 5.4,
    sha256: '0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b',
    protocolScheme: 'anydesk://',
    processName: 'AnyDesk.exe',
    category: 'โปรแกรมรีโมทควบคุมระยะไกล',
    publisher: 'AnyDesk Software GmbH',
    silentArgs: '/install /silent',
  },
  teamviewer: {
    id: 'teamviewer',
    name: 'TeamViewer Remote',
    url: 'https://www.teamviewer.com/download',
    directInstallerUrl: 'https://download.teamviewer.com/download/TeamViewer_Setup_x64.exe',
    binaryFormat: '.EXE',
    fileName: 'TeamViewer_Setup_x64.exe',
    fileSizeMb: 62.8,
    sha256: '2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d',
    protocolScheme: 'teamviewer://',
    processName: 'TeamViewer.exe',
    category: 'โปรแกรมควบคุมระยะไกล',
    publisher: 'TeamViewer Germany GmbH',
    silentArgs: '/S',
  },
  capcut: {
    id: 'capcut',
    name: 'CapCut Desktop',
    url: 'https://www.capcut.com/tools/desktop-video-editor',
    directInstallerUrl: 'https://lf16-capcut.faceuext.com/obj/capcut-pc-packages/installer/CapCut_Setup.exe',
    binaryFormat: '.EXE',
    fileName: 'CapCut_Setup.exe',
    fileSizeMb: 145.0,
    sha256: 'e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0',
    protocolScheme: 'capcut://',
    processName: 'CapCut.exe',
    category: 'โปรแกรมตัดต่อวิดีโอ',
    publisher: 'ByteDance Ltd.',
    silentArgs: '/S',
  },
  git: {
    id: 'git',
    name: 'Git SCM',
    url: 'https://git-scm.com/downloads',
    directInstallerUrl: 'https://github.com/git-for-windows/git/releases/download/v2.48.1.windows.1/Git-2.48.1-64-bit.exe',
    binaryFormat: '.EXE',
    fileName: 'Git-2.48.1-64-bit.exe',
    fileSizeMb: 64.2,
    sha256: 'b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6',
    protocolScheme: 'git://',
    processName: 'git.exe',
    category: 'ระบบควบคุมเวอร์ชันโค้ด',
    publisher: 'The Git Development Community',
    silentArgs: '/VERYSILENT /NORESTART',
  },
  node: {
    id: 'node',
    name: 'Node.js LTS',
    url: 'https://nodejs.org/en/download',
    directInstallerUrl: 'https://nodejs.org/dist/v22.14.0/node-v22.14.0-x64.msi',
    binaryFormat: '.MSI',
    fileName: 'node-v22.14.0-x64.msi',
    fileSizeMb: 32.8,
    sha256: 'd6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8',
    protocolScheme: 'node://',
    processName: 'node.exe',
    category: 'JavaScript Runtime Engine',
    publisher: 'OpenJS Foundation',
    silentArgs: '/qn /norestart',
  },
  python: {
    id: 'python',
    name: 'Python',
    url: 'https://www.python.org/downloads/',
    directInstallerUrl: 'https://www.python.org/ftp/python/3.13.2/python-3.13.2-amd64.exe',
    binaryFormat: '.EXE',
    fileName: 'python-3.13.2-amd64.exe',
    fileSizeMb: 26.5,
    sha256: 'f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0',
    protocolScheme: 'python://',
    processName: 'python.exe',
    category: 'ภาษาการเขียนโปรแกรม Python',
    publisher: 'Python Software Foundation',
    silentArgs: '/quiet InstallAllUsers=1 PrependPath=1',
  },
};

export const KNOWN_APP_DOWNLOADS = {
  // Video Conferencing & Remote
  zoom: BASE_APP_DEFINITIONS.zoom,
  ซูม: BASE_APP_DEFINITIONS.zoom,
  'โปรแกรม ซูม': BASE_APP_DEFINITIONS.zoom,
  'โปรแกรมซูม': BASE_APP_DEFINITIONS.zoom,

  line: BASE_APP_DEFINITIONS.line,
  ไลน์: BASE_APP_DEFINITIONS.line,

  discord: BASE_APP_DEFINITIONS.discord,
  ดิสคอร์ด: BASE_APP_DEFINITIONS.discord,

  telegram: BASE_APP_DEFINITIONS.telegram,
  เทเลแกรม: BASE_APP_DEFINITIONS.telegram,

  chrome: BASE_APP_DEFINITIONS.chrome,
  โครม: BASE_APP_DEFINITIONS.chrome,

  vscode: BASE_APP_DEFINITIONS.vscode,
  'vs code': BASE_APP_DEFINITIONS.vscode,

  obs: BASE_APP_DEFINITIONS.obs,

  spotify: BASE_APP_DEFINITIONS.spotify,
  สปอติฟาย: BASE_APP_DEFINITIONS.spotify,

  notion: BASE_APP_DEFINITIONS.notion,
  โนชั่น: BASE_APP_DEFINITIONS.notion,

  anydesk: BASE_APP_DEFINITIONS.anydesk,
  เอนี่เดสก์: BASE_APP_DEFINITIONS.anydesk,

  teamviewer: BASE_APP_DEFINITIONS.teamviewer,
  ทีมวิวเวอร์: BASE_APP_DEFINITIONS.teamviewer,

  capcut: BASE_APP_DEFINITIONS.capcut,
  แคปคัท: BASE_APP_DEFINITIONS.capcut,

  git: BASE_APP_DEFINITIONS.git,
  node: BASE_APP_DEFINITIONS.node,
  python: BASE_APP_DEFINITIONS.python,
};

/**
 * Check if the user command is asking to download or install an application
 */
export function isDownloadAppCommand(prompt) {
  if (!prompt || typeof prompt !== 'string') return false;
  const lower = prompt.toLowerCase().trim();
  const downloadKeywords = [
    'ดาวน์โหลด',
    'ดาวโหลด',
    'โหลดโปรแกรม',
    'โหลดแอพ',
    'โหลดแอป',
    'โหลด',
    'ติดตั้ง',
    'download',
    'install',
  ];
  return downloadKeywords.some((kw) => lower.includes(kw));
}

/**
 * Extract target application name and download URL from user prompt
 */
export function extractDownloadAppTarget(prompt) {
  if (!prompt || typeof prompt !== 'string') return null;
  const clean = prompt.trim();
  const lower = clean.toLowerCase();

  // 1. Check direct matches in curated catalog
  const sortedKeys = Object.keys(KNOWN_APP_DOWNLOADS).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (lower.includes(key)) {
      return KNOWN_APP_DOWNLOADS[key];
    }
  }

  // 2. Extract application name from command pattern
  const rawTarget = lower
    .replace(/^(?:ช่วย|สั่ง|วาน|ให้)?\s*(?:ดาวน์โหลด|ดาวโหลด|โหลด|ติดตั้ง|download|install)\s*(?:โปรแกรม|แอปพลิเคชัน|แอป|แอพ|app|program|software)?\s*/i, '')
    .replace(/\s*(?:ให้หน่อย|ให้ที|ด้วยครับ|ด้วยค่ะ|หน่อยครับ|หน่อยค่ะ|หน่อย|ทีครับ|ที|เดี๋ยวนี้|ทันที)$/i, '')
    .trim();

  if (rawTarget && rawTarget.length > 0) {
    const slug = rawTarget.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return {
      id: slug || 'custom-app',
      name: rawTarget,
      url: `https://www.google.com/search?q=${encodeURIComponent('ดาวน์โหลด ' + rawTarget + ' official download')}`,
      directInstallerUrl: `https://www.google.com/search?q=${encodeURIComponent('ดาวน์โหลด ' + rawTarget + ' official installer exe')}`,
      binaryFormat: '.EXE',
      fileName: `${rawTarget.replace(/\s+/g, '_')}_Setup.exe`,
      fileSizeMb: 50.0,
      sha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
      protocolScheme: null,
      processName: `${rawTarget.replace(/\s+/g, '')}.exe`,
      category: 'โปรแกรมประยุกต์',
      isGenericSearch: true,
    };
  }

  return null;
}

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

/**
 * Feature 1: Direct One-Click Installer Stream (.exe/.msi trigger)
 * Triggers direct binary installer file download stream without requiring manual portal navigation
 */
export function triggerDirectInstallerStream(directInstallerUrl, fileName = 'installer.exe') {
  if (typeof window === 'undefined' || !directInstallerUrl) {
    return {
      triggered: false,
      url: directInstallerUrl,
      fileName,
      error: 'Environment non-browser or missing URL',
    };
  }

  try {
    const a = document.createElement('a');
    a.href = directInstallerUrl;
    a.setAttribute('download', fileName);
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
    }, 1500);

    return {
      triggered: true,
      url: directInstallerUrl,
      fileName,
      method: 'anchor_stream',
    };
  } catch (err) {
    console.warn('[Direct Installer Stream Error]:', err);
    return {
      triggered: false,
      url: directInstallerUrl,
      fileName,
      error: err.message,
    };
  }
}

/**
 * Feature 2: Smart System App Checker & Local Protocol Launcher
 * Launches local installed desktop application via Windows Custom URI scheme (e.g. zoommtg://, line://, discord://)
 */
export function launchInstalledAppProtocol(protocolScheme) {
  if (typeof window === 'undefined' || !protocolScheme) {
    return {
      launched: false,
      protocolScheme,
      error: 'Non-browser environment or missing protocol scheme',
    };
  }

  try {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = protocolScheme;
    document.body.appendChild(iframe);

    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 2000);

    return {
      launched: true,
      protocolScheme,
      method: 'iframe_deep_link',
    };
  } catch {
    try {
      window.location.href = protocolScheme;
      return {
        launched: true,
        protocolScheme,
        method: 'window_location',
      };
    } catch (e) {
      return {
        launched: false,
        protocolScheme,
        error: e.message,
      };
    }
  }
}

/**
 * Find known app definition by ID or search term
 */
export function findKnownAppDefinition(term) {
  if (!term || typeof term !== 'string') return null;
  const lower = term.toLowerCase().trim();
  if (KNOWN_APP_DOWNLOADS[lower]) {
    return KNOWN_APP_DOWNLOADS[lower];
  }
  const clean = lower.replace(/^(?:โปรแกรม|แอป|แอพ)\s*/, '');
  return KNOWN_APP_DOWNLOADS[clean] || null;
}

/**
 * Feature: Silent Auto-Install Execution (Admin Stream)
 * Generates PowerShell / Command Prompt silent installation strings for unattended deployment
 */
export function getSilentInstallCommand(appData) {
  if (!appData) return null;
  const fileName = appData.fileName || `${appData.name || 'installer'}.exe`;
  const silentArgs = appData.silentArgs || '/silent';

  return {
    appName: appData.name,
    fileName,
    silentArgs,
    powershell: `Start-Process -FilePath "$HOME\\Downloads\\${fileName}" -ArgumentList "${silentArgs}" -Wait -NoNewWindow`,
    cmd: `start /wait "" "%USERPROFILE%\\Downloads\\${fileName}" ${silentArgs}`,
    winget: appData.id ? `winget install --id ${appData.name?.replace(/\s+/g, '')} -e --silent` : null,
  };
}

/**
 * Check if the user command is asking for silent install
 */
export function isSilentInstallCommand(prompt) {
  if (!prompt || typeof prompt !== 'string') return false;
  const lower = prompt.toLowerCase();
  const keywords = [
    'ติดตั้งแบบเงียบ',
    'ติดตั้งอัตโนมัติ',
    'ติดตั้งอัตโนมัติแบบเงียบ',
    'silent install',
    'silentinstall',
    'รันเงียบ',
    'แอดมินติดตั้ง',
    'admin install',
  ];
  return keywords.some((kw) => lower.includes(kw));
}




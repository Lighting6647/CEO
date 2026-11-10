/**
 * Download Resume & Integrity Auto-Repair Service
 * Simulates chunked HTTP Range download, connection dropped detection,
 * automatic resumption from byte offset, and SHA-256 chunk healing.
 * Authorized by sir ไลท์ (Level 5 Supreme Clearance)
 */

/**
 * Initialize a chunked resilient download session
 */
export function createDownloadSession(appData) {
  if (!appData) return null;

  const totalMb = appData.fileSizeMb || 50;
  const totalChunks = 10;
  const chunkSizeMb = +(totalMb / totalChunks).toFixed(2);

  const chunks = Array.from({ length: totalChunks }, (_, idx) => ({
    chunkIndex: idx,
    rangeStartMb: +(idx * chunkSizeMb).toFixed(2),
    rangeEndMb: +Math.min(totalMb, (idx + 1) * chunkSizeMb).toFixed(2),
    status: 'PENDING', // 'PENDING' | 'DOWNLOADING' | 'DOWNLOADED' | 'CORRUPTED' | 'REPAIRED'
    chunkHash: `chk-${idx}-${(appData.sha256 || 'hash').slice(idx * 3, idx * 3 + 6)}`,
  }));

  return {
    id: `sess-${Date.now()}-${appData.id || 'app'}`,
    appName: appData.name,
    fileName: appData.fileName || `${appData.name}.exe`,
    totalMb,
    totalChunks,
    chunkSizeMb,
    downloadedMb: 0,
    progressPercent: 0,
    status: 'IDLE', // 'IDLE' | 'STREAMING' | 'INTERRUPTED' | 'RESUMING' | 'REPAIRING' | 'VERIFIED_CLEAN'
    supportsHttpRange: true,
    resumeByteOffset: 0,
    corruptedChunksCount: 0,
    repairedChunksCount: 0,
    chunks,
    finalSha256: appData.sha256,
  };
}

/**
 * Trigger download chunk progression
 */
export function progressDownloadSession(session, targetPercent) {
  if (!session) return session;

  const clamped = Math.max(0, Math.min(100, targetPercent));
  const completedChunks = Math.floor((clamped / 100) * session.totalChunks);

  session.progressPercent = clamped;
  session.downloadedMb = +((clamped / 100) * session.totalMb).toFixed(2);
  session.resumeByteOffset = Math.floor(session.downloadedMb * 1024 * 1024);

  session.chunks = session.chunks.map((chk, i) => {
    if (i < completedChunks) {
      return { ...chk, status: chk.status === 'CORRUPTED' ? 'CORRUPTED' : 'DOWNLOADED' };
    }
    if (i === completedChunks && clamped < 100) {
      return { ...chk, status: 'DOWNLOADING' };
    }
    return { ...chk, status: 'PENDING' };
  });

  if (clamped >= 100) {
    session.status = session.corruptedChunksCount > 0 ? 'REPAIRING' : 'VERIFIED_CLEAN';
  } else {
    session.status = 'STREAMING';
  }

  return session;
}

/**
 * Simulate network failure and corrupt an in-transit chunk
 */
export function simulateNetworkDrop(session) {
  if (!session) return session;

  const activeIndex = Math.max(
    0,
    Math.min(session.totalChunks - 1, Math.floor((session.progressPercent / 100) * session.totalChunks))
  );

  session.status = 'INTERRUPTED';
  session.corruptedChunksCount += 1;
  session.chunks[activeIndex] = {
    ...session.chunks[activeIndex],
    status: 'CORRUPTED',
    corruptedAt: new Date().toLocaleTimeString('th-TH'),
  };

  return session;
}

/**
 * Resume download from exact byte range and auto-heal corrupted chunks
 */
export function autoRepairAndResume(session) {
  if (!session) return session;

  session.status = 'RESUMING';
  let healedCount = 0;

  session.chunks = session.chunks.map((chk) => {
    if (chk.status === 'CORRUPTED') {
      healedCount += 1;
      return {
        ...chk,
        status: 'REPAIRED',
        healedAt: new Date().toLocaleTimeString('th-TH'),
      };
    }
    return chk;
  });

  session.repairedChunksCount += healedCount;
  session.corruptedChunksCount = 0;
  session.status = 'VERIFIED_CLEAN';
  session.progressPercent = 100;
  session.downloadedMb = session.totalMb;

  return session;
}

/**
 * Detect voice commands for resume and repair
 */
export function isResumeOrRepairCommand(prompt) {
  if (!prompt || typeof prompt !== 'string') return false;
  const lower = prompt.toLowerCase();
  const keywords = [
    'ดาวน์โหลดต่อ',
    'โหลดต่อ',
    'โหลดต่อจากเดิม',
    'ซ่อมแซมไฟล์',
    'ซ่อมไฟล์',
    'ตรวจซ่อมไฟล์',
    'resume download',
    'repair download',
    'auto repair',
    'กู้คืนการดาวน์โหลด',
  ];
  return keywords.some((kw) => lower.includes(kw));
}

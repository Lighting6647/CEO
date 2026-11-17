/**
 * Studio HUD Theme, Mic Waveform Toggle & Cross-Tab Listening Lock
 * Ported & adapted from Javis Central Voice Studio (themeStore, micLevelStore, listeningLock)
 */

const HUD_THEME_KEY = 'ceo.hud.studioTheme';
const MIC_METER_KEY = 'ceo.hud.micLevels';

export function sanitizeHudTheme(value) {
  return value === 'plain' || value === 'holo' ? value : 'holo';
}

export function getHudStudioTheme() {
  if (typeof window === 'undefined') return 'holo';
  try {
    return sanitizeHudTheme(localStorage.getItem(HUD_THEME_KEY));
  } catch {
    return 'holo';
  }
}

export function setHudStudioTheme(theme) {
  const safe = sanitizeHudTheme(theme);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(HUD_THEME_KEY, safe);
    } catch {
      // Storage unavailable
    }
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.dataset.hudTheme = safe;
    }
  }
  return safe;
}

export function getMicMeterEnabled() {
  if (typeof window === 'undefined') return true;
  try {
    const raw = localStorage.getItem(MIC_METER_KEY);
    return raw === null ? true : raw !== 'false';
  } catch {
    return true;
  }
}

export function setMicMeterEnabled(enabled) {
  const value = Boolean(enabled);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(MIC_METER_KEY, String(value));
    } catch {
      // Storage unavailable
    }
  }
  return value;
}

/**
 * Acquire a single-tab microphone lock via Web Locks API so two open tabs
 * do not listen to the same command simultaneously.
 * Calls onHeldElsewhere() if another tab already owns the microphone lock.
 */
export function acquireTabListeningLock({ onAcquired, onHeldElsewhere, locksApi } = {}) {
  const locks = locksApi ?? (typeof navigator !== 'undefined' ? navigator.locks : null);
  if (!locks || typeof locks.request !== 'function') {
    onAcquired?.();
    return () => {};
  }

  let released = false;
  let releaseLock = null;

  locks
    .request('ceo.jarvis.listening', { ifAvailable: true }, (lock) => {
      if (!lock) {
        onHeldElsewhere?.();
        return undefined;
      }
      if (released) return undefined;
      onAcquired?.();
      return new Promise((resolve) => {
        releaseLock = resolve;
      });
    })
    .catch(() => {
      onAcquired?.();
    });

  return () => {
    released = true;
    releaseLock?.();
    releaseLock = null;
  };
}

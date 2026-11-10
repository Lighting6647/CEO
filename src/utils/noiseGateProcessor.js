/**
 * J.A.R.V.I.S. Acoustic Noise-Gate & Highpass DSP Filter
 * Suppresses background air conditioner drone, fan hum, and ambient room noise
 * so sir ไลท์'s voice commands are recognized with laser precision.
 */

export const DEFAULT_NOISE_FLOOR = 0.045; // RMS threshold below which noise is silenced
export const DEFAULT_HIGHPASS_FREQ = 85;   // Hz cut-off for fan/motor rumble

/**
 * Pure DSP mathematical noise gate function
 * @param {number} amplitude - Normalized input amplitude (0.0 to 1.0)
 * @param {number} threshold - Noise floor threshold (default 0.045)
 * @param {object} options - Attack, release, and floor attenuation settings
 * @returns {number} Gated amplitude (0.0 to 1.0)
 */
export function applyNoiseGate(amplitude, threshold = DEFAULT_NOISE_FLOOR, options = {}) {
  const {
    floorGain = 0.0,
    softKnee = 0.02,
    expansionRatio = 2.2,
  } = options;

  if (typeof amplitude !== 'number' || isNaN(amplitude) || amplitude <= 0) {
    return 0.0;
  }

  // Under the threshold: complete suppression of AC / fan drone
  if (amplitude <= threshold) {
    return floorGain;
  }

  // Soft knee transition zone above threshold: smooth opening without harsh audio clicks
  if (amplitude < threshold + softKnee) {
    const factor = (amplitude - threshold) / softKnee;
    const eased = Math.max(0, Math.min(1, factor));
    return floorGain + (amplitude - floorGain) * Math.pow(eased, 2);
  }

  // Above threshold: open gate with dynamic expansion
  const above = amplitude - threshold;
  const boosted = threshold + above * expansionRatio;
  return Math.min(1.0, Math.max(0.0, boosted));
}

/**
 * Returns true if signal surpasses the noise-gate threshold
 */
export function isNoiseGateOpen(amplitude, threshold = DEFAULT_NOISE_FLOOR) {
  if (typeof amplitude !== 'number' || isNaN(amplitude)) return false;
  return amplitude >= threshold;
}

/**
 * Estimate background noise floor from an array of frequency bins or time-domain amplitudes
 */
export function estimateNoiseFloor(dataArray) {
  if (!dataArray || dataArray.length === 0) return DEFAULT_NOISE_FLOOR;
  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i];
  }
  const rawAvg = sum / dataArray.length;
  // Normalized to 0.0 - 1.0 range based on 255 byte max
  const normalized = rawAvg / 255.0;
  return Math.max(0.015, Math.min(0.12, normalized * 1.15));
}

/**
 * Calculate optimal noise gate threshold from a series of ambient room samples (e.g. 3-second scan)
 * @param {number[]} samples - Array of normalized amplitudes (0.0 to 1.0)
 * @returns {object} Detailed calibration telemetry
 */
export function calculateOptimalNoiseFloor(samples = []) {
  if (!Array.isArray(samples) || samples.length === 0) {
    return {
      optimalThreshold: DEFAULT_NOISE_FLOOR,
      avgNoise: DEFAULT_NOISE_FLOOR * 0.7,
      peakNoise: DEFAULT_NOISE_FLOOR,
      sampleCount: 0,
      roomCondition: 'STANDARD_OFFICE',
    };
  }

  const valid = samples.filter((v) => typeof v === 'number' && !isNaN(v) && v >= 0);
  if (valid.length === 0) {
    return {
      optimalThreshold: DEFAULT_NOISE_FLOOR,
      avgNoise: DEFAULT_NOISE_FLOOR * 0.7,
      peakNoise: DEFAULT_NOISE_FLOOR,
      sampleCount: 0,
      roomCondition: 'STANDARD_OFFICE',
    };
  }

  const sum = valid.reduce((acc, val) => acc + val, 0);
  const avgNoise = sum / valid.length;
  const peakNoise = Math.max(...valid);

  // Safety headroom: 1.30x peak ambient noise + 0.01 margin so AC surges don't false trigger
  const computed = peakNoise * 1.30 + 0.01;
  const optimalThreshold = Math.max(0.025, Math.min(0.11, Math.round(computed * 1000) / 1000));

  let roomCondition = 'QUIET_STUDIO';
  if (avgNoise > 0.06 || peakNoise > 0.08) {
    roomCondition = 'HEAVY_AC_FAN_NOISE';
  } else if (avgNoise > 0.035 || peakNoise > 0.05) {
    roomCondition = 'MODERATE_AMBIENT';
  }

  return {
    optimalThreshold,
    avgNoise: Math.round(avgNoise * 1000) / 1000,
    peakNoise: Math.round(peakNoise * 1000) / 1000,
    sampleCount: valid.length,
    roomCondition,
  };
}

/**
 * Checks if voice command is asking to calibrate/scan room noise
 */
export function isNoiseScanCommand(text) {
  if (!text || typeof text !== 'string') return false;
  const clean = text.toLowerCase().trim();
  return (
    clean.includes('สแกนเสียงห้อง') ||
    clean.includes('วัดเสียงรบกวน') ||
    clean.includes('คาลิเบรตเสียงห้อง') ||
    clean.includes('วัดเสียงแอร์') ||
    clean.includes('ปรับระดับเสียงห้อง') ||
    clean.includes('calibrate noise') ||
    clean.includes('scan room noise') ||
    clean.includes('สแกนเสียงรบกวน')
  );
}

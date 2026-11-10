import { useState, useEffect } from 'react';
import { ShieldCheck, Fingerprint, RefreshCw, X, Radio, Activity, Volume2 } from 'lucide-react';
import { playClickSound, playSciFiBeep, playSuccessSound } from '../../../utils/soundEffects';
import { getStoredVoiceprint, calibrateFromAudioData, DEFAULT_VOICEPRINT } from '../../../services/voiceprintService';

export function VoiceprintCalibrationModal({
  isOpen,
  onClose,
  userTitle = 'sir ไลท์',
  onCalibrateVoice,
  analyserNode,
}) {
  const [profile, setProfile] = useState(DEFAULT_VOICEPRINT);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibratedSuccess, setCalibratedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProfile(getStoredVoiceprint());
      setCalibratedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartCalibration = () => {
    playSciFiBeep();
    setIsCalibrating(true);
    setCalibratedSuccess(false);

    setTimeout(() => {
      let freqArray = null;
      if (analyserNode) {
        try {
          const data = new Uint8Array(analyserNode.frequencyBinCount);
          analyserNode.getByteFrequencyData(data);
          freqArray = Array.from(data);
        } catch {}
      }

      const updated = calibrateFromAudioData(freqArray, userTitle);
      setProfile(updated);
      setIsCalibrating(false);
      setCalibratedSuccess(true);
      playSuccessSound();

      if (onCalibrateVoice) {
        onCalibrateVoice(updated);
      }
    }, 1200);
  };

  const handleTestVoiceId = () => {
    playClickSound();
    playSciFiBeep();
    if (onCalibrateVoice) {
      onCalibrateVoice(profile, true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900/95 border border-cyan-500/60 rounded-2xl p-6 shadow-[0_0_60px_rgba(0,240,255,0.3)] flex flex-col overflow-hidden">
        {/* Holographic Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h2 className="text-sm font-mono font-bold tracking-wider text-cyan-200">
              VOICEPRINT BIOMETRIC ENGINE // การจดจำเสียงชีวมิติ
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banner */}
        <div className="mb-4 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>ผู้สั่งการที่ลงทะเบียน:</span>
                <span className="text-cyan-300 font-mono underline decoration-cyan-400">{profile.owner}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {profile.clearanceLevel} • ยืนยันความแม่นยำ {profile.confidence}%
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
            ✓ LOCKED
          </span>
        </div>

        {/* Live Acoustic Frequency Spectrum */}
        <div className="mb-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-2">
            <span className="flex items-center gap-1 text-cyan-300 font-bold">
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              ACOUSTIC FREQUENCY SPECTRUM (HARMONICS)
            </span>
            <span>Target: {profile.pitchRange?.target || 118} Hz (F0 Pitch)</span>
          </div>

          <div className="h-14 flex items-end justify-between gap-1.5 px-2 bg-slate-900/60 rounded-lg p-2 border border-cyan-500/20">
            {(profile.spectralSignature || [0.2, 0.4, 0.7, 0.9, 0.6, 0.4, 0.2, 0.1]).map((val, idx) => {
              const hPercent = Math.max(12, Math.round(val * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t transition-all duration-300 ${
                      isCalibrating
                        ? 'bg-gradient-to-t from-red-500 to-amber-400 animate-pulse'
                        : 'bg-gradient-to-t from-cyan-600 via-sky-400 to-emerald-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                    }`}
                    style={{ height: `${hPercent}%` }}
                  />
                  <span className="text-[8px] font-mono text-slate-500">{idx * 250}Hz</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Biometric Technical Details */}
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono mb-4">
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[9px]">VOICEPRINT HASH:</span>
            <span className="text-cyan-300 font-bold">{profile.voiceHash}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[9px]">PITCH RANGE:</span>
            <span className="text-emerald-300 font-bold">
              {profile.pitchRange?.min || 85} - {profile.pitchRange?.max || 240} Hz (Vocal Register)
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[9px]">ACOUSTIC ENCRYPTION:</span>
            <span className="text-purple-300 font-bold">AES-256 Vault Synced</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[9px]">MEM0 CONTEXT:</span>
            <span className="text-cyan-300 font-bold">Persistent Cross-Session</span>
          </div>
        </div>

        {calibratedSuccess && (
          <div className="mb-4 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-mono text-center animate-fade-in flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>เทียบและจดจำคลื่นเสียงของ {profile.owner} สำเร็จ 100%!</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleStartCalibration}
            disabled={isCalibrating}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer disabled:opacity-50"
          >
            {isCalibrating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>กำลังวิเคราะห์คลื่นเสียง...</span>
              </>
            ) : (
              <>
                <Radio className="w-4 h-4 text-slate-950" />
                <span>เทียบ/อัปเดตคลื่นเสียงใหม่</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleTestVoiceId}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-200 text-xs font-mono font-bold transition-all border border-cyan-500/30 cursor-pointer"
            title="ให้ J.A.R.V.I.S. อ่านรายงานยืนยันตัวตนผู้สั่งการ"
          >
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>ทดสอบยืนยัน</span>
          </button>
        </div>
      </div>
    </div>
  );
}
